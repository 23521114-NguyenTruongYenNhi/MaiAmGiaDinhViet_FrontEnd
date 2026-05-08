import csv
import json
import os
from pathlib import Path
import time

import psycopg
from dotenv import load_dotenv
from google import genai
from google.genai import types

from app.core.config import DATABASE_URL


load_dotenv()

client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

BASE_DIR = Path(__file__).resolve().parent
DATA_DIR = BASE_DIR / "data"

EMBEDDING_MODEL = "gemini-embedding-001"
EMBEDDING_DIMENSION = 768


def normalize_db_url(url: str) -> str:
    if url.startswith("postgresql+psycopg://"):
        return url.replace("postgresql+psycopg://", "postgresql://", 1)
    return url


def clean_text(value):
    if value is None:
        return ""

    text = str(value).strip()

    if text.lower() in ["nan", "none", "null", "n/a", "na"]:
        return ""

    return text


def chunk_text(text: str, chunk_size: int = 1200, overlap: int = 150):
    text = clean_text(text)

    if not text:
        return []

    chunks = []
    start = 0

    while start < len(text):
        end = start + chunk_size
        chunk = text[start:end].strip()

        if chunk:
            chunks.append(chunk)

        start += chunk_size - overlap

    return chunks


def embed_text(text: str, task_type: str = "RETRIEVAL_DOCUMENT"):
    response = client.models.embed_content(
        model=EMBEDDING_MODEL,
        contents=text,
        config=types.EmbedContentConfig(
            task_type=task_type,
            output_dimensionality=EMBEDDING_DIMENSION,
        ),
    )

    return response.embeddings[0].values


def vector_to_pgvector(embedding):
    return "[" + ",".join(str(x) for x in embedding) + "]"


def load_general_info():
    docs = []

    md_path = DATA_DIR / "general_info.md"

    if not md_path.exists():
        print("No general_info.md found, skipped.")
        return docs

    text = md_path.read_text(encoding="utf-8")

    for index, chunk in enumerate(chunk_text(text)):
        docs.append({
            "content": chunk,
            "metadata": {
                "source": "general_info",
                "file": "general_info.md",
                "chunk_index": index,
            }
        })

    print("Loaded general_info.md")
    return docs


def load_cases():
    docs = []

    csv_path = DATA_DIR / "all_cases.csv"

    if not csv_path.exists():
        print("No all_cases.csv found, skipped.")
        return docs

    with open(csv_path, newline="", encoding="utf-8-sig") as file:
        reader = csv.DictReader(file)

        for row in reader:
            title = clean_text(row.get("title") or row.get("Case Name"))
            story = clean_text(row.get("story") or row.get("Full Story"))
            short_description = clean_text(
                row.get("short_description") or row.get("Short Description")
            )
            location = clean_text(row.get("location_text") or row.get("Location"))
            episode_no = clean_text(row.get("episode_no") or row.get("Episode"))
            bank_name = clean_text(row.get("bank_name") or row.get("Bank Name"))
            account_name = clean_text(row.get("account_name") or row.get("Account Name"))
            account_number = clean_text(row.get("account_number") or row.get("Account Number"))
            thumbnail_url = clean_text(row.get("thumbnail_url") or row.get("Image URL"))
            support_category = clean_text(row.get("support_category") or row.get("Support Category"))
            support_focus = clean_text(row.get("support_focus") or row.get("Support Focus"))
            priority_level = clean_text(row.get("priority_level") or row.get("Priority Level"))
            estimated_monthly_need = clean_text(row.get("estimated_monthly_need") or row.get("Estimated Monthly Need"))
            verification_status = clean_text(row.get("verification_status") or row.get("Verification Status")) or "VERIFIED"

            content = f"""
Case title: {title}
Episode: {episode_no}
Location: {location}
Short description: {short_description}
Story: {story}
Priority: {priority_level}
Support category: {support_category}
Support focus: {support_focus}
Estimated monthly need: {estimated_monthly_need}
Verification status: {verification_status}
Donation bank: {bank_name}
Account name: {account_name}
Account number: {account_number}
Image URL: {thumbnail_url}
""".strip()

            for index, chunk in enumerate(chunk_text(content)):
                docs.append({
                    "content": chunk,
                    "metadata": {
                        "source": "case",
                        "title": title,
                        "episode_no": episode_no,
                        "location": location,
                        "chunk_index": index,
                    }
                })

    print(f"Loaded cases: {len(docs)} chunks")
    return docs


def load_episodes():
    docs = []

    csv_path = DATA_DIR / "all_episodes.csv"

    if not csv_path.exists():
        print("No all_episodes.csv found, skipped.")
        return docs

    with open(csv_path, newline="", encoding="utf-8-sig") as file:
        reader = csv.DictReader(file)

        for row in reader:
            episode_name = clean_text(row.get("Episode Name") or row.get("title"))
            date_posted = clean_text(row.get("Date Posted") or row.get("air_date"))
            video_link = clean_text(row.get("Video Link") or row.get("video_url"))
            description = clean_text(row.get("Description") or row.get("description"))

            content = f"""
Episode: {episode_name}
Date posted: {date_posted}
Video link: {video_link}
Description: {description}
""".strip()

            for index, chunk in enumerate(chunk_text(content)):
                docs.append({
                    "content": chunk,
                    "metadata": {
                        "source": "episode",
                        "episode_name": episode_name,
                        "date_posted": date_posted,
                        "chunk_index": index,
                    }
                })

    print(f"Loaded episodes: {len(docs)} chunks")
    return docs


def load_news():
    docs = []

    csv_path = DATA_DIR / "all_news.csv"

    if not csv_path.exists():
        print("No all_news.csv found, skipped.")
        return docs

    with open(csv_path, newline="", encoding="utf-8-sig") as file:
        reader = csv.DictReader(file)

        for row in reader:
            category = clean_text(row.get("Category") or row.get("type"))
            title = clean_text(row.get("Title") or row.get("title"))
            date_posted = clean_text(row.get("Date Posted") or row.get("published_at"))
            content_text = clean_text(row.get("Content") or row.get("content"))
            image_url = clean_text(row.get("Image URL") or row.get("image_url"))

            content = f"""
News title: {title}
Category: {category}
Date posted: {date_posted}
Content: {content_text}
Image URL: {image_url}
""".strip()

            for index, chunk in enumerate(chunk_text(content)):
                docs.append({
                    "content": chunk,
                    "metadata": {
                        "source": "news",
                        "title": title,
                        "category": category,
                        "date_posted": date_posted,
                        "chunk_index": index,
                    }
                })

    print(f"Loaded news: {len(docs)} chunks")
    return docs


def load_all_documents():
    documents = []
    documents.extend(load_general_info())
    documents.extend(load_cases())
    documents.extend(load_episodes())
    documents.extend(load_news())
    return documents


def clear_old_documents(conn):
    with conn.cursor() as cur:
        cur.execute("delete from documents")
    conn.commit()
    print("Old documents cleared.")


def insert_document(conn, content, metadata, embedding):
    vector = vector_to_pgvector(embedding)

    with conn.cursor() as cur:
        cur.execute(
            """
            insert into documents (content, metadata, embedding)
            values (%s, %s::jsonb, %s::vector)
            """,
            (
                content,
                json.dumps(metadata, ensure_ascii=False),
                vector,
            ),
        )


def seed():
    print("--- Starting RAG seed with Gemini ---")

    documents = load_all_documents()
    print(f"Total chunks: {len(documents)}")

    if not documents:
        print("No documents found. Check app/data folder.")
        return

    db_url = normalize_db_url(DATABASE_URL)

    with psycopg.connect(db_url) as conn:
        clear_old_documents(conn)

        for index, doc in enumerate(documents, start=1):
            content = doc["content"]
            metadata = doc["metadata"]

            try:
                embedding = embed_text(content, task_type="RETRIEVAL_DOCUMENT")
            except Exception as e:
                print("Rate limit or embedding error. Waiting 65 seconds...")
                print(e)
                time.sleep(65)
                embedding = embed_text(content, task_type="RETRIEVAL_DOCUMENT")

            insert_document(conn, content, metadata, embedding)

            time.sleep(0.7)

            if index % 10 == 0:
                conn.commit()
                print(f"Inserted {index}/{len(documents)} chunks")

        conn.commit()

    print("--- RAG seed completed successfully ---")


if __name__ == "__main__":
    seed()
