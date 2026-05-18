import json
import os
import re
import time
import unicodedata
from typing import List, Optional, Sequence

import psycopg
from fastapi import APIRouter, File, Form, HTTPException, UploadFile
from google import genai
from google.genai import types

from app.core.config import DATABASE_URL
from app.schemas.chat import ChatRequest, ChatResponse

router = APIRouter(prefix="/chatbot", tags=["Chatbot"])

client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

EMBEDDING_MODEL = "gemini-embedding-001"
CHAT_MODEL = "models/gemini-flash-lite-latest"
TRANSCRIPTION_MODEL = os.getenv("GEMINI_TRANSCRIPTION_MODEL", CHAT_MODEL)
EMBEDDING_DIMENSION = 768
CHAT_MATCH_COUNT = 6
KEYWORD_MATCH_COUNT = 3
DIRECT_CONTEXT_COUNT = 3
MAX_CONTEXT_CHARS_PER_DOC = 1300
MAX_DIRECT_CONTEXT_CHARS_PER_DOC = 4200
MAX_HISTORY_MESSAGES = 6
MAX_HISTORY_CHARS = 1800
MAX_OUTPUT_TOKENS = 550
MAX_AUDIO_BYTES = 8 * 1024 * 1024


def normalize_db_url(url: str) -> str:
    if url.startswith("postgresql+psycopg://"):
        return url.replace("postgresql+psycopg://", "postgresql://", 1)
    return url


def vector_to_pgvector(embedding: List[float]) -> str:
    return "[" + ",".join(str(x) for x in embedding) + "]"


def normalize_text_for_match(text: str) -> str:
    normalized = unicodedata.normalize("NFD", text or "")
    without_marks = "".join(char for char in normalized if unicodedata.category(char) != "Mn")
    return without_marks.replace("đ", "d").replace("Đ", "D").lower()


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
        for word in re.findall(r"\w+", query.lower(), flags=re.UNICODE)
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


def extract_episode_numbers(query: str) -> List[int]:
    normalized = normalize_text_for_match(query)
    numbers = re.findall(r"(?:episode|ep|tap)\s*#?\s*(\d{1,4})", normalized)
    return [int(value) for value in numbers]


def asks_for_latest_episode(query: str) -> bool:
    lowered = normalize_text_for_match(query)
    return bool(
        re.search(r"\b(latest|newest|most recent|recent episode)\b.*\b(episode|ep|tap|broadcast)\b", lowered)
        or re.search(r"\b(episode|ep|tap|broadcast)\b.*\b(latest|newest|most recent|moi nhat|gan nhat)\b", lowered)
        or re.search(r"\b(tap|episode)\s+(moi nhat|gan nhat)\b", lowered)
        or re.search(r"\b(moi nhat|gan nhat)\b.*\b(tap|episode)\b", lowered)
    )


def asks_for_latest_family(query: str) -> bool:
    lowered = normalize_text_for_match(query)
    family_terms = r"(family|families|household|households|profile|gia dinh|ho gia dinh|ho dan|hoan canh|nhan vat)"
    latest_terms = r"(latest|newest|most recent|moi nhat|gan nhat)"
    return bool(
        re.search(rf"\b{latest_terms}\b.*\b{family_terms}\b", lowered)
        or re.search(rf"\b{family_terms}\b.*\b{latest_terms}\b", lowered)
    )


def asks_for_household_group(query: str) -> bool:
    lowered = normalize_text_for_match(query)
    group_terms = r"(3|ba|three)\s+(ho|ho gia dinh|gia dinh|hoan canh|households?|families|cases)"
    broad_terms = r"(cac|tat ca|all|list|liet ke|ke ten|nhung|which|what)"
    family_terms = r"(ho|ho gia dinh|gia dinh|hoan canh|households?|families|cases)"
    return bool(
        re.search(rf"\b{group_terms}\b", lowered)
        or re.search(rf"\b{broad_terms}\b.*\b{family_terms}\b", lowered)
    )


def asks_for_news(query: str) -> bool:
    lowered = normalize_text_for_match(query)
    return bool(
        re.search(r"\b(news|new|update|updates|article|tin|tin tuc|tin moi|bai viet)\b", lowered)
        or re.search(r"\b(latest|newest|most recent|moi nhat|gan nhat)\b.*\b(news|new|update|updates|tin|bai viet|article)\b", lowered)
    )


def infer_location_from_text(text: str):
    if not text:
        return None

    patterns = [
        r"living in\s+([^.,]+(?:province|city|commune|ward|district)[^.,]*)",
        r"lives? in\s+([^.,]+(?:province|city|commune|ward|district)[^.,]*)",
        r"at\s+([^.,]+(?:province|city)[^.,]*)",
        r"\b(Khanh Hoa|Gia Lai|Dak Lak|Lam Dong|Phu Yen|Ho Chi Minh City)\b",
    ]

    for pattern in patterns:
        match = re.search(pattern, text, flags=re.IGNORECASE)
        if match:
            return match.group(1).strip()

    return None


def build_episode_context_doc(episode_row, family_rows, is_latest: bool = False):
    episode_id, episode_no, title, description, air_date, video_url = episode_row
    label = "INTERNAL_LATEST_EPISODE" if is_latest else "INTERNAL_EPISODE"
    lines = [
        f"{label}: Episode {episode_no}",
        f"Title: {title}",
        f"Air date: {air_date or 'unknown'}",
        f"Video URL: {video_url or 'not available'}",
    ]

    if description:
        lines.append(f"Description: {description}")

    if family_rows:
        lines.append(f"Families/cases in Episode {episode_no}: {len(family_rows)}")
        for index, row in enumerate(family_rows, start=1):
            (
                case_title,
                short_description,
                story,
                location_text,
                support_category,
                support_focus,
                children_count,
                estimated_monthly_need,
                verification_status,
                family_name,
                display_name,
                summary,
                bank_name,
                account_number,
                account_name,
                bank_verified,
            ) = row
            name = display_name or family_name or case_title
            known_location = location_text or infer_location_from_text(" ".join([short_description or "", story or "", summary or ""]))
            useful_summary = short_description or summary or trim_text(story, 260) or "not available"
            lines.extend([
                f"{index}. Family/profile: {name}",
                f"   Case title: {case_title}",
                f"   Location: {known_location or 'not specified'}",
                f"   Need/category: {support_category or support_focus or 'not specified'}",
                f"   Children count: {children_count if children_count is not None else 'not specified'}",
                f"   Estimated monthly need: {estimated_monthly_need or 'not specified'}",
                f"   Verification: {verification_status or 'unknown'}",
                f"   Summary: {useful_summary}",
            ])
            if story:
                lines.append(f"   Story: {trim_text(story, 220)}")
            if bank_name or account_number or account_name:
                lines.append(
                    "   Donation details: "
                    f"bank={bank_name or 'not available'}, "
                    f"account_name={account_name or family_name or 'not available'}, "
                    f"account_number={account_number or 'not available'}, "
                    f"bank_verified={bank_verified}"
                )
    else:
        lines.append(f"Families/cases in Episode {episode_no}: none found in database.")

    return {
        "id": f"direct-episode-{episode_id}",
        "content": "\n".join(lines),
        "metadata": {
            "source": "database_direct_episode_context",
            "episode_no": episode_no,
            "title": title,
            "latest": is_latest,
        },
        "similarity": 1.0,
    }


def retrieve_episode_context(episode_no: int, is_latest: bool = False):
    db_url = normalize_db_url(DATABASE_URL)

    with psycopg.connect(db_url) as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                select id, episode_no, title, description, air_date, video_url
                from episodes
                where episode_no = %s
                limit 1
                """,
                (episode_no,),
            )
            episode_row = cur.fetchone()

            if not episode_row:
                return []

            cur.execute(
                """
                select
                    c.title,
                    c.short_description,
                    c.story,
                    c.location_text,
                    c.support_category,
                    c.support_focus,
                    c.children_count,
                    c.estimated_monthly_need,
                    c.verification_status,
                    f.family_name,
                    f.display_name,
                    f.summary,
                    f.bank_name,
                    f.account_number,
                    f.account_name,
                    f.bank_verified
                from cases c
                left join families f on f.case_id = c.id
                where c.episode_id = %s
                order by c.created_at asc
                """,
                (episode_row[0],),
            )
            family_rows = cur.fetchall()

    return [build_episode_context_doc(episode_row, family_rows, is_latest=is_latest)]


def build_news_context_doc(news_rows, is_latest: bool = False):
    label = "INTERNAL_LATEST_NEWS" if is_latest else "INTERNAL_NEWS"
    lines = [label]

    for index, row in enumerate(news_rows, start=1):
        news_id, title, content, news_type, published_at, created_at = row
        lines.extend([
            f"{index}. News/update: {title}",
            f"   Type: {news_type}",
            f"   Published at: {published_at or created_at or 'unknown'}",
        ])
        if content:
            lines.append(f"   Content: {trim_text(content, 600)}")

    return {
        "id": "direct-news-latest" if is_latest else "direct-news",
        "content": "\n".join(lines),
        "metadata": {
            "source": "database_direct_news_context",
            "title": "Latest news" if is_latest else "News",
            "latest": is_latest,
        },
        "similarity": 1.0,
    }


def retrieve_latest_news_context(match_count: int = 3):
    db_url = normalize_db_url(DATABASE_URL)

    with psycopg.connect(db_url) as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                select id, title, content, type, published_at, created_at
                from news
                order by coalesce(published_at, created_at) desc, created_at desc
                limit %s
                """,
                (match_count,),
            )
            rows = cur.fetchall()

    if not rows:
        return []

    return [build_news_context_doc(rows, is_latest=True)]


def retrieve_latest_episode_context():
    db_url = normalize_db_url(DATABASE_URL)

    with psycopg.connect(db_url) as conn:
        with conn.cursor() as cur:
            cur.execute("select max(episode_no) from episodes")
            row = cur.fetchone()

    latest_episode_no = row[0] if row else None
    if latest_episode_no is None:
        return []

    return retrieve_episode_context(latest_episode_no, is_latest=True)


def retrieve_direct_context_documents(query: str):
    documents = []

    is_news_query = asks_for_news(query)

    is_latest_family_query = asks_for_latest_family(query)
    is_household_group_query = asks_for_household_group(query)
    episode_numbers = extract_episode_numbers(query)

    if is_news_query:
        documents.extend(retrieve_latest_news_context())

    if not is_news_query and (
        asks_for_latest_episode(query)
        or is_latest_family_query
        or (is_household_group_query and not episode_numbers)
    ):
        documents.extend(retrieve_latest_episode_context())

    for episode_no in episode_numbers[:DIRECT_CONTEXT_COUNT]:
        if any(doc.get("metadata", {}).get("episode_no") == episode_no for doc in documents):
            continue
        documents.extend(retrieve_episode_context(episode_no))

    return documents


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
        metadata_value = doc.get("metadata")
        metadata_dict = metadata_value if isinstance(metadata_value, dict) else {}
        max_chars = (
            MAX_DIRECT_CONTEXT_CHARS_PER_DOC
            if metadata_dict.get("source") in {"database_direct_episode_context", "database_direct_news_context"}
            else MAX_CONTEXT_CHARS_PER_DOC
        )
        content = trim_text(doc["content"], max_chars)
        metadata = metadata_to_text(doc.get("metadata"))
        similarity = doc.get("similarity")
        source_line = f"Metadata: {metadata}" if metadata else "Metadata: unknown"
        score_line = f"Match score: {similarity}" if similarity is not None else ""
        context_blocks.append(
            f"[Document {index}]\n{source_line}\n{score_line}\nContent:\n{content}".strip()
        )

    return "\n\n---\n\n".join(context_blocks)


def detect_language(text: str) -> str:
    raw_text = text or ""
    lowered = raw_text.lower()
    normalized = normalize_text_for_match(lowered)
    decomposed = unicodedata.normalize("NFD", raw_text)

    if "đ" in lowered or "Đ" in raw_text or any(unicodedata.category(char) == "Mn" for char in decomposed):
        return "Vietnamese"

    vietnamese_phrases = [
        "gia dinh",
        "ho gia dinh",
        "hoan canh",
        "quyen gop",
        "tai khoan",
        "ngan hang",
        "moi nhat",
        "gan nhat",
        "tin tuc",
        "cho toi",
        "cho minh",
        "noi ve",
        "ke ve",
        "tap moi",
    ]
    vietnamese_words = {
        "toi", "minh", "ban", "cho", "biet", "ve", "la", "ai", "o", "dau",
        "nao", "nhung", "cac", "tat", "ca", "em", "anh", "chi", "co", "khong",
        "ho", "canh", "quyen", "gop", "tap", "tin", "tuc", "moi", "nhat",
        "gan", "hay", "noi", "ke", "giup", "can", "hoan",
    }
    english_words = {
        "what", "who", "where", "when", "which", "show", "tell", "about",
        "latest", "newest", "family", "families", "episode", "donation",
        "news", "update", "bank", "account", "help", "profile",
        "household", "households", "case", "cases", "three", "list",
    }

    if any(phrase in normalized for phrase in vietnamese_phrases) or re.search(r"\b(3|ba)\s+ho\b", normalized):
        return "Vietnamese"

    words = set(re.findall(r"\b[a-z]{2,}\b", normalized))
    vietnamese_score = len(words & vietnamese_words)
    english_score = len(words & english_words)

    if vietnamese_score > english_score:
        return "Vietnamese"
    if english_score > 0:
        return "English"

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


def normalize_requested_language(language: Optional[str]) -> Optional[str]:
    if language in {"Vietnamese", "English"}:
        return language
    if language == "vi-VN":
        return "Vietnamese"
    if language == "en-US":
        return "English"
    return None


def generate_answer(
    user_question: str,
    context: str,
    history: str = "",
    forced_language: Optional[str] = None,
) -> str:
    language = normalize_requested_language(forced_language) or detect_language(user_question)
    language_style_rules = (
        """
[VIETNAMESE ANSWER QUALITY]
- Write fluent, natural Vietnamese with full diacritics. Do not answer in romanized Vietnamese.
- If the source text is English, translate and localize it into natural Vietnamese instead of copying English phrases.
- Prefer warm, clear wording used by a Vietnamese program volunteer.
- Use Vietnamese labels such as: **Hoàn cảnh**, **Nhu cầu hỗ trợ**, **Thông tin quyên góp**, **Tập phát sóng** when relevant.
- Avoid awkward literal translations like "hồ sơ", "hộ gia đình" when "gia đình" or "hoàn cảnh" sounds more natural.
- Keep facts exact, but make the phrasing smooth and easy to read on a phone.
"""
        if language == "Vietnamese"
        else """
[ENGLISH ANSWER QUALITY]
- Write clear, natural English.
- If the source text is Vietnamese, translate and summarize it naturally in English.
- Keep Vietnamese names, places, bank names, and account details unchanged.
"""
    )
    sys_instruct = f"""You are a warm, precise virtual assistant for the charity program "Mai Am Gia Dinh Viet".

Reply language: {language}. Use this language for the entire answer. The latest user question always wins over conversation history: English question => English answer; Vietnamese question => Vietnamese answer.

{language_style_rules}

[CRITICAL RULE]
- The output language must be exactly {language}. If {language} is English, do not answer in Vietnamese except for proper names, places, bank names, and quoted account details. If {language} is Vietnamese, write natural Vietnamese with full diacritics.
- Answer only from the provided context and conversation history. Do not invent names, bank details, locations, episodes, dates, or donation information.
- Never mention the words "context", "database", "provided context", "metadata", or internal source labels in the user-facing answer.
- If the context contains "INTERNAL_LATEST_EPISODE", treat that episode as the newest episode. Do not choose an older episode as latest.
- If the context contains "INTERNAL_LATEST_NEWS", answer about news/updates, not episodes.
- If an episode context lists multiple families/cases, mention all listed families when the user asks about that episode or its households.
- If the user asks for "3 ho", "ba ho", "3 families", "three households", or all households in an episode, list exactly the families/cases shown in that episode context. Do not stop after only 1-2 families when 3 are present.
- Never collapse later families into vague phrases like "featured as one of the families" if their name or details are present in context.
- Do not say "location is not specified" when the family summary/story contains a province, commune, district, school, or living place. Use the available location detail.
- If the context is not enough, say that clearly and suggest what the user can ask next.

[TONE & CONTENT RULES]
- Speak naturally like a caring human volunteer, but stay factual.
- Always format for a mobile chat screen. Use Markdown with short sections and blank lines.
- Do not write one long paragraph. Keep each paragraph to 1-2 short sentences.
- Use this structure when possible: one direct opening sentence, a blank line, then bullets for families, donation details, or key facts.
- Use bullets when listing two or more families, donation details, facts, or next steps.
- Put each family/person on its own bullet. Never combine multiple families into one paragraph.
- Use bold for names or key labels, for example: **Name** - location - main need.
- If the user asks about one family/profile, lead with the family/person name, location, episode, and core need if available.
- If the user asks about an episode, start with one short sentence for episode number/date, then list every family/case in that episode.
- For each family/case bullet, use this compact pattern when data exists: Name — location — main need/summary. Keep each bullet to one short line.
- If some details are missing for a family, still name that family and say only what is known from context.
- If the user asks about specific families/households, answer only those specific families. Do not add other families from the same episode unless the user asks for all families in that episode.
- If the user asks about families/households generally, include all matching families in the provided context, not just the first one.
- If the user asks about news or updates, summarize the relevant update title, category/date if available, and the most important takeaway.
- If the user asks for "latest news" or a single latest update, answer only the newest update unless the user asks for a list.
- If asked about donations, include exact bank name, account name, and account number only when present in context.
- Keep the answer concise but complete: usually 1 intro sentence plus up to 3-5 short bullets. Do not write long paragraphs.
- Do not mention app navigation buttons; the mobile app will attach them separately."""

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


def normalize_audio_mime_type(content_type: Optional[str]) -> str:
    if not content_type or content_type == "application/octet-stream":
        return "audio/mp4"
    return content_type


def audio_part_from_bytes(audio_bytes: bytes, mime_type: str):
    if hasattr(types.Part, "from_bytes"):
        return types.Part.from_bytes(data=audio_bytes, mime_type=mime_type)

    return types.Part(
        inline_data=types.Blob(
            data=audio_bytes,
            mime_type=mime_type,
        )
    )


def transcribe_audio_bytes(audio_bytes: bytes, content_type: Optional[str], language: str = "auto") -> str:
    if not audio_bytes:
        raise HTTPException(status_code=400, detail="Audio file is required")

    if len(audio_bytes) > MAX_AUDIO_BYTES:
        raise HTTPException(status_code=413, detail="Audio file is too large")

    mime_type = normalize_audio_mime_type(content_type)
    language_hint = {
        "vi-VN": "Vietnamese",
        "en-US": "English",
    }.get(language, "Vietnamese or English")

    prompt = (
        "Transcribe this voice question for a chatbot. "
        f"The speaker may use {language_hint}. "
        "Preserve the original spoken language. If the user speaks English, return English text. "
        "If the user speaks Vietnamese, return Vietnamese text with full diacritics. Do not translate. "
        "Return only the spoken text, without quotes, markdown, explanations, timestamps, or corrections. "
        "If the audio is silent or not understandable, return an empty string."
    )

    started_at = time.perf_counter()
    response = client.models.generate_content(
        model=TRANSCRIPTION_MODEL,
        contents=[
            prompt,
            audio_part_from_bytes(audio_bytes, mime_type),
        ],
            config=types.GenerateContentConfig(
                temperature=0,
                max_output_tokens=64,
            ),
    )
    finished_at = time.perf_counter()
    print(
        "voice transcription timing "
        f"total={finished_at - started_at:.2f}s "
        f"audio_bytes={len(audio_bytes)} "
        f"mime={mime_type}"
    )

    transcript = (response.text or "").strip().strip('"').strip()

    if not transcript:
        raise HTTPException(status_code=422, detail="No speech was recognized")

    return transcript


def build_chat_response(
    user_question: str,
    history_payload: Optional[Sequence] = None,
    forced_language: Optional[str] = None,
) -> ChatResponse:
    started_at = time.perf_counter()
    user_question = user_question.strip()

    if not user_question:
        raise HTTPException(status_code=400, detail="Message is required")

    direct_documents = retrieve_direct_context_documents(user_question)
    direct_at = time.perf_counter()

    if direct_documents:
        documents = merge_documents(direct_documents, keyword_search_documents(user_question))
        embedded_at = direct_at
        retrieved_at = time.perf_counter()
        retrieval_mode = "direct"
    else:
        query_embedding = embed_query(user_question)
        embedded_at = time.perf_counter()
        documents = retrieve_documents(query_embedding, match_count=CHAT_MATCH_COUNT)
        keyword_documents = keyword_search_documents(user_question)
        documents = merge_documents(documents, keyword_documents)
        retrieved_at = time.perf_counter()
        retrieval_mode = "vector"

    if not documents:
        language = normalize_requested_language(forced_language) or detect_language(user_question)
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
    history = build_history(history_payload or [])

    try:
        answer = generate_answer(user_question, context, history, forced_language)
        answered_at = time.perf_counter()
        print(
            "chatbot timing "
            f"mode={retrieval_mode} "
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


@router.get("/")
def chatbot_health_check():
    return {
        "message": "Chatbot endpoint is running. Send POST JSON to this URL.",
        "example": {"message": "Cho toi biet ve gia dinh o Khanh Hoa"},
    }


@router.post("/", response_model=ChatResponse)
def chat_with_bot(payload: ChatRequest):
    try:
        return build_chat_response(payload.message, payload.history or [], payload.language)

        started_at = time.perf_counter()
        user_question = payload.message.strip()

        if not user_question:
            raise HTTPException(status_code=400, detail="Message is required")

        query_embedding = embed_query(user_question)
        embedded_at = time.perf_counter()
        direct_documents = retrieve_direct_context_documents(user_question)
        documents = retrieve_documents(query_embedding, match_count=CHAT_MATCH_COUNT)
        keyword_documents = keyword_search_documents(user_question)
        documents = merge_documents(direct_documents, merge_documents(documents, keyword_documents))
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


@router.post("/voice")
async def chat_with_voice(
    audio: UploadFile = File(...),
    language: str = Form("auto"),
    history: str = Form("[]"),
):
    try:
        audio_bytes = await audio.read()
        transcript = transcribe_audio_bytes(audio_bytes, audio.content_type, language)

        try:
            parsed_history = json.loads(history) if history else []
            chat_history = ChatRequest(message=transcript, history=parsed_history).history or []
        except Exception:
            chat_history = []

        detected_language = normalize_requested_language(language) or detect_language(transcript)
        response = build_chat_response(transcript, chat_history, detected_language)

        return {
            "transcript": transcript,
            "language": detected_language,
            "reply": response.reply,
            "context_used": response.context_used,
        }

    except HTTPException:
        raise

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/transcribe")
async def transcribe_voice_question(
    audio: UploadFile = File(...),
    language: str = Form("auto"),
):
    try:
        audio_bytes = await audio.read()
        transcript = transcribe_audio_bytes(audio_bytes, audio.content_type, language)

        return {
            "transcript": transcript,
            "language": normalize_requested_language(language) or detect_language(transcript),
        }

        if not audio_bytes:
            raise HTTPException(status_code=400, detail="Audio file is required")

        if len(audio_bytes) > MAX_AUDIO_BYTES:
            raise HTTPException(status_code=413, detail="Audio file is too large")

        mime_type = normalize_audio_mime_type(audio.content_type)
        language_hint = {
            "vi-VN": "Vietnamese",
            "en-US": "English",
        }.get(language, "Vietnamese or English")

        prompt = (
            "Transcribe this voice question for a chatbot. "
            f"The speaker may use {language_hint}. "
            "Return only the spoken text, without quotes, markdown, explanations, timestamps, or corrections. "
            "If the audio is silent or not understandable, return an empty string."
        )

        response = client.models.generate_content(
            model=TRANSCRIPTION_MODEL,
            contents=[
                prompt,
                audio_part_from_bytes(audio_bytes, mime_type),
            ],
            config=types.GenerateContentConfig(
                temperature=0,
                max_output_tokens=160,
            ),
        )

        transcript = (response.text or "").strip().strip('"').strip()

        if not transcript:
            raise HTTPException(status_code=422, detail="No speech was recognized")

        return {
            "transcript": transcript,
            "language": language,
        }

    except HTTPException:
        raise

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
