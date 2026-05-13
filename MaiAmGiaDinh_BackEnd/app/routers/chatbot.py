import json
import os
import re
import time
from typing import List, Sequence

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
CHAT_MATCH_COUNT = 6
KEYWORD_MATCH_COUNT = 3
MAX_CONTEXT_CHARS_PER_DOC = 1300
MAX_HISTORY_MESSAGES = 6
MAX_HISTORY_CHARS = 1800
MAX_OUTPUT_TOKENS = 700


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


def keyword_search_documents(query: str, match_count: int = KEYWORD_MATCH_COUNT):
    words = [
        word
        for word in re.findall(r"[\wÀ-ỹ]+", query.lower())
        if len(word) >= 3
    ][:8]

    if not words:
        return []

    db_url = normalize_db_url(DATABASE_URL)
    clauses = " or ".join(["content ilike %s"] * len(words))
    params = [f"%{word}%" for word in words]

    with psycopg.connect(db_url) as conn:
        with conn.cursor() as cur:
            cur.execute(
                f"""
                select id, content, metadata, 0.0 as similarity
                from documents
                where {clauses}
                limit %s
                """,
                (*params, match_count),
            )
            rows = cur.fetchall()

    return [
        {
            "id": row[0],
            "content": row[1],
            "metadata": row[2],
            "similarity": row[3],
        }
        for row in rows
    ]


def merge_documents(primary, fallback):
    seen = set()
    merged = []

    for doc in [*primary, *fallback]:
        if doc["id"] in seen:
            continue
        seen.add(doc["id"])
        merged.append(doc)

    return merged


def trim_text(text: str, max_chars: int) -> str:
    text = " ".join((text or "").split())

    if len(text) <= max_chars:
        return text

    return f"{text[:max_chars].rstrip()}..."


def metadata_to_text(metadata) -> str:
    if not metadata:
        return ""

    if isinstance(metadata, str):
        try:
            metadata = json.loads(metadata)
        except json.JSONDecodeError:
            return metadata

    if not isinstance(metadata, dict):
        return str(metadata)

    useful_keys = [
        "source",
        "title",
        "episode_no",
        "episode_name",
        "location",
        "category",
        "date_posted",
    ]
    parts = [
        f"{key}: {metadata.get(key)}"
        for key in useful_keys
        if metadata.get(key)
    ]
    return "; ".join(parts)


def build_context(documents) -> str:
    context_blocks = []

    for index, doc in enumerate(documents, start=1):
        content = trim_text(doc["content"], MAX_CONTEXT_CHARS_PER_DOC)
        metadata = metadata_to_text(doc.get("metadata"))
        similarity = doc.get("similarity")
        source_line = f"Metadata: {metadata}" if metadata else "Metadata: unknown"
        score_line = f"Match score: {similarity}" if similarity is not None else ""
        context_blocks.append(
            f"[Document {index}]\n{source_line}\n{score_line}\nContent:\n{content}".strip()
        )

    return "\n\n---\n\n".join(context_blocks)


def detect_language(text: str) -> str:
    vietnamese_signals = set("ăâđêôơưáàảãạắằẳẵặấầẩẫậéèẻẽẹếềểễệíìỉĩịóòỏõọốồổỗộớờởỡợúùủũụứừửữựýỳỷỹỵ")
    lowered = text.lower()
    if any(char in vietnamese_signals for char in lowered):
        return "Vietnamese"
    if re.search(r"\b(cho|toi|tôi|ban|bạn|gia dinh|gia đình|quyen gop|quyên góp|tap|tập)\b", lowered):
        return "Vietnamese"
    return "English"


def build_history(history: Sequence) -> str:
    if not history:
        return ""

    lines = []
    total = 0

    for item in history[-MAX_HISTORY_MESSAGES:]:
        role = "User" if item.role == "user" else "Assistant"
        content = trim_text(item.content, 450)
        next_line = f"{role}: {content}"
        total += len(next_line)
        if total > MAX_HISTORY_CHARS:
            break
        lines.append(next_line)

    return "\n".join(lines)


def generate_answer(user_question: str, context: str, history: str = "") -> str:
    language = detect_language(user_question)
    sys_instruct = f"""You are a warm, precise virtual assistant for the charity program "Mai Am Gia Dinh Viet".

Reply language: {language}. Use this language for the entire answer.

[CRITICAL RULE]
- Answer only from the provided context and conversation history. Do not invent names, bank details, locations, episodes, dates, or donation information.
- If the context is not enough, say that clearly and suggest what the user can ask next.

[TONE & CONTENT RULES]
- Speak naturally like a caring human volunteer, but stay factual.
- Prefer short Markdown that is easy to read on mobile.
- Use bullets when listing families, donation details, or next steps.
- If the user asks about one family/profile, lead with the family/person name, location, episode, and core need if available.
- If asked about donations, include exact bank name, account name, and account number only when present in context.
- Keep the answer concise: usually 2-6 short sentences unless the user asks for details."""

    prompt = f"""[CONVERSATION HISTORY]
{history or "No previous messages."}

[CONTEXT]
{context}

[USER QUESTION]
{user_question}"""

    response = client.models.generate_content(
        model=CHAT_MODEL,
        contents=prompt,
        config=types.GenerateContentConfig(
            system_instruction=sys_instruct,
            temperature=0.2,
            max_output_tokens=MAX_OUTPUT_TOKENS,
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
        started_at = time.perf_counter()
        user_question = payload.message.strip()

        if not user_question:
            raise HTTPException(status_code=400, detail="Message is required")

        query_embedding = embed_query(user_question)
        embedded_at = time.perf_counter()
        documents = retrieve_documents(query_embedding, match_count=CHAT_MATCH_COUNT)
        keyword_documents = keyword_search_documents(user_question)
        documents = merge_documents(documents, keyword_documents)
        retrieved_at = time.perf_counter()

        if not documents:
            language = detect_language(user_question)
            reply = (
                "Mình chưa tìm thấy thông tin liên quan trong dữ liệu hiện tại. "
                "Bạn thử hỏi bằng tên gia đình, địa phương, số tập, hoặc nội dung cần quyên góp nhé."
                if language == "Vietnamese"
                else "I haven't found related information in the current data. Try asking with a family name, location, episode number, or donation need."
            )
            return ChatResponse(
                reply=reply,
                context_used=0,
            )

        context = build_context(documents)
        history = build_history(payload.history or [])

        try:
            answer = generate_answer(user_question, context, history)
            answered_at = time.perf_counter()
            print(
                "chatbot timing "
                f"embed={embedded_at - started_at:.2f}s "
                f"retrieve={retrieved_at - embedded_at:.2f}s "
                f"generate={answered_at - retrieved_at:.2f}s "
                f"total={answered_at - started_at:.2f}s "
                f"context_chars={len(context)}"
            )
        except Exception as e:
            if is_temporary_model_error(e):
                return ChatResponse(
                    reply=(
                        "Gemini đang bị quá tải tạm thời nên mình chưa tạo được câu trả lời mới. "
                        "Backend đã tìm thấy dữ liệu liên quan, bạn thử gửi lại câu hỏi sau vài giây nhé."
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
