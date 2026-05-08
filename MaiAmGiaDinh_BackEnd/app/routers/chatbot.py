import os
from typing import List

import psycopg
from fastapi import APIRouter, HTTPException
from google import genai
from google.genai import types

from app.core.config import DATABASE_URL
from app.schemas.chat import ChatRequest, ChatResponse

router = APIRouter(prefix="/chatbot", tags=["Chatbot"])

client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

EMBEDDING_MODEL = "gemini-embedding-001"
CHAT_MODEL = "models/gemini-flash-lite-latest"
EMBEDDING_DIMENSION = 768


def normalize_db_url(url: str) -> str:
    if url.startswith("postgresql+psycopg://"):
        return url.replace("postgresql+psycopg://", "postgresql://", 1)
    return url


def vector_to_pgvector(embedding: List[float]) -> str:
    return "[" + ",".join(str(x) for x in embedding) + "]"


def embed_query(text: str) -> List[float]:
    response = client.models.embed_content(
        model=EMBEDDING_MODEL,
        contents=text,
        config=types.EmbedContentConfig(
            task_type="RETRIEVAL_QUERY",
            output_dimensionality=EMBEDDING_DIMENSION,
        ),
    )

    return response.embeddings[0].values


def retrieve_documents(query_embedding: List[float], match_count: int = 5):
    db_url = normalize_db_url(DATABASE_URL)
    vector = vector_to_pgvector(query_embedding)

    with psycopg.connect(db_url) as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                select id, content, metadata, similarity
                from match_documents(%s::vector, %s)
                """,
                (vector, match_count),
            )

            rows = cur.fetchall()

    documents = []

    for row in rows:
        documents.append({
            "id": row[0],
            "content": row[1],
            "metadata": row[2],
            "similarity": row[3],
        })

    return documents


def generate_answer(user_question: str, context: str) -> str:
    sys_instruct = """You are a warm, empathetic virtual assistant for the charity program "Mai Am Gia Dinh Viet".

[CRITICAL RULE]
You MUST reply in the EXACT SAME LANGUAGE as the User's Question.
- If the User Question is in English -> You MUST translate the context and reply entirely in English.
- If the User Question is in Vietnamese -> You MUST reply entirely in Vietnamese.

[TONE & CONTENT RULES]
- Answer ONLY based on the provided context. Do not invent facts.
- Speak naturally like a caring human volunteer. Jump straight into the story.
- DO NOT use robotic greetings (e.g., avoid "Here is the information...").
- If asked about donations, provide the exact bank details from the context."""

    prompt = f"""[CONTEXT]
{context}

[USER QUESTION]
{user_question}"""

    response = client.models.generate_content(
        model=CHAT_MODEL,
        contents=prompt,
        config=types.GenerateContentConfig(
            system_instruction=sys_instruct,
            temperature=0.2,
        ),
    )

    return response.text


def is_temporary_model_error(error: Exception) -> bool:
    message = str(error).lower()
    return "503" in message or "unavailable" in message or "high demand" in message


@router.get("/")
def chatbot_health_check():
    return {
        "message": "Chatbot endpoint is running. Send POST JSON to this URL.",
        "example": {"message": "Cho toi biet ve gia dinh o Khanh Hoa"},
    }


@router.post("/", response_model=ChatResponse)
def chat_with_bot(payload: ChatRequest):
    try:
        user_question = payload.message.strip()

        if not user_question:
            raise HTTPException(status_code=400, detail="Message is required")

        query_embedding = embed_query(user_question)
        documents = retrieve_documents(query_embedding, match_count=5)

        if not documents:
            return ChatResponse(
                reply="I haven't found any related information in the current data",
                context_used=0,
            )

        context = "\n\n---\n\n".join(
            [doc["content"] for doc in documents]
        )

        try:
            answer = generate_answer(user_question, context)
        except Exception as e:
            if is_temporary_model_error(e):
                return ChatResponse(
                    reply=(
                        "Gemini dang bi qua tai tam thoi nen minh chua tao duoc cau tra loi moi. "
                        "Backend da tim thay du lieu lien quan, ban thu gui lai cau hoi sau vai giay nhe."
                    ),
                    context_used=len(documents),
                )

            raise

        return ChatResponse(
            reply=answer,
            context_used=len(documents),
        )

    except HTTPException:
        raise

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
