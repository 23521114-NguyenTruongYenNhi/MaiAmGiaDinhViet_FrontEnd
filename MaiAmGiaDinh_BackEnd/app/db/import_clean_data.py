import re
from datetime import datetime, timezone
from pathlib import Path
from typing import Optional

import pandas as pd
from sqlmodel import Session, select

from app.db.session import engine
from app.models.episode import Episode
from app.models.case import Case
from app.models.family import Family
from app.models.news import News


BASE_DIR = Path(__file__).resolve().parents[1]
DATA_DIR = BASE_DIR / "data"

EPISODES_CSV = DATA_DIR / "all_episodes.csv"
CASES_CSV = DATA_DIR / "all_cases.csv"
NEWS_CSV = DATA_DIR / "all_news.csv"


def clean_text(value):
    if pd.isna(value):
        return None

    text = str(value).strip()

    if text.lower() in ["", "nan", "none", "null", "n/a", "na"]:
        return None

    return text


def parse_date(value):
    value = clean_text(value)

    if not value:
        return None

    formats = ["%d-%m-%Y", "%Y-%m-%d", "%d/%m/%Y", "%m/%d/%Y"]

    for fmt in formats:
        try:
            return datetime.strptime(value, fmt).date()
        except ValueError:
            pass

    parsed = pd.to_datetime(value, errors="coerce", dayfirst=True)

    if pd.isna(parsed):
        return None

    return parsed.date()


def parse_datetime(value):
    parsed_date = parse_date(value)

    if not parsed_date:
        return None

    return datetime(
        parsed_date.year,
        parsed_date.month,
        parsed_date.day,
        tzinfo=timezone.utc,
    )


def extract_episode_no(value):
    value = clean_text(value)

    if not value:
        return None

    match = re.search(r"\d+", value)

    if not match:
        return None

    return int(match.group())


def infer_support_category(story: Optional[str]):
    story = (story or "").lower()

    if any(word in story for word in ["school", "student", "study", "university", "grade"]):
        return "Education"

    if any(word in story for word in ["hospital", "illness", "medicine", "health", "disease"]):
        return "Healthcare"

    if any(word in story for word in ["house", "home", "rent", "leak"]):
        return "Housing"

    return "Family support"


def infer_children_count(story: Optional[str]):
    story = story or ""
    matches = re.findall(r"(\d+)\s+(?:children|child|kids|sisters|brothers|siblings)", story, flags=re.IGNORECASE)

    if not matches:
        return None

    return max(int(match) for match in matches)


def get_value(row, *names):
    for name in names:
        if name in row.index:
            return row.get(name)
    return None


def import_episodes(session: Session):
    df = pd.read_csv(EPISODES_CSV, encoding="utf-8-sig")
    df.columns = df.columns.str.strip()

    print("EPISODE COLUMNS:", df.columns.tolist())

    episode_map = {}
    inserted_count = 0
    total_count = 0

    for _, row in df.iterrows():
        episode_name = get_value(row, "Episode Name", "Title", "episode_name", "title")
        episode_no = extract_episode_no(episode_name)

        if episode_no is None:
            episode_no = extract_episode_no(get_value(row, "Episode", "episode_no"))

        if episode_no is None:
            continue

        total_count += 1

        existing = session.exec(
            select(Episode).where(Episode.episode_no == episode_no)
        ).first()

        if existing:
            episode_map[episode_no] = existing.id
            continue

        episode = Episode(
            episode_no=episode_no,
            title=clean_text(episode_name) or f"Mai Am Gia Dinh Viet - Episode {episode_no}",
            description=clean_text(get_value(row, "Description", "description")),
            air_date=parse_date(get_value(row, "Date Posted", "Air Date", "air_date")),
            video_url=clean_text(get_value(row, "Video Link", "Video URL", "video_url")),
            is_featured=False,
            created_at=datetime.now(timezone.utc),
            updated_at=datetime.now(timezone.utc),
        )

        session.add(episode)
        session.commit()
        session.refresh(episode)

        episode_map[episode_no] = episode.id
        inserted_count += 1

    print(f"Episodes found in CSV: {total_count}")
    print(f"New episodes inserted: {inserted_count}")
    print(f"Episode map size: {len(episode_map)}")

    return episode_map


def get_or_create_episode_from_case(session: Session, episode_no: int, row):
    existing = session.exec(
        select(Episode).where(Episode.episode_no == episode_no)
    ).first()

    if existing:
        return existing.id

    episode = Episode(
        episode_no=episode_no,
        title=f"Mai Am Gia Dinh Viet - Episode {episode_no}",
        description=clean_text(get_value(row, "Episode Description", "description")),
        air_date=parse_date(get_value(row, "air_date", "Air Date", "Date Posted")),
        video_url=clean_text(get_value(row, "Video Link", "Video URL", "video_url")),
        is_featured=False,
        created_at=datetime.now(timezone.utc),
        updated_at=datetime.now(timezone.utc),
    )

    session.add(episode)
    session.commit()
    session.refresh(episode)

    return episode.id


def import_cases(session: Session, episode_map):
    df = pd.read_csv(CASES_CSV, encoding="utf-8-sig")
    df.columns = df.columns.str.strip()

    print("CASE COLUMNS:", df.columns.tolist())
    print("CASE ROWS:", len(df))
    print("EPISODE MAP KEYS:", list(episode_map.keys())[:10])

    inserted_count = 0
    skipped_no_episode = 0
    skipped_duplicate = 0

    for _, row in df.iterrows():
        episode_no = extract_episode_no(
            get_value(row, "Episode", "episode_no", "Episode Name")
        )

        if episode_no is None:
            skipped_no_episode += 1
            continue

        episode_id = episode_map.get(episode_no)

        if not episode_id:
            episode_id = get_or_create_episode_from_case(session, episode_no, row)
            episode_map[episode_no] = episode_id

        title = clean_text(get_value(row, "Case Name", "title", "case_name"))

        if not title:
            continue

        existing_case = session.exec(
            select(Case).where(
                Case.title == title,
                Case.episode_id == episode_id,
            )
        ).first()

        if existing_case:
            skipped_duplicate += 1
            continue

        short_description = clean_text(get_value(row, "Short Description", "short_description"))
        story = clean_text(get_value(row, "Full Story", "story"))
        verified_at = parse_datetime(get_value(row, "air_date", "Air Date", "Date Posted"))

        new_case = Case(
            episode_id=episode_id,
            title=title,
            short_description=short_description,
            story=story,
            location_text=clean_text(get_value(row, "Location", "location_text")),
            status="ACTIVE",
            thumbnail_url=clean_text(get_value(row, "Image URL", "Thumbnail URL", "thumbnail_url")),
            priority_level=clean_text(get_value(row, "Priority Level", "priority_level")) or "HIGH",
            support_category=clean_text(get_value(row, "Support Category", "support_category")) or infer_support_category(story),
            support_focus=clean_text(get_value(row, "Support Focus", "support_focus")) or short_description,
            children_count=infer_children_count(story),
            estimated_monthly_need=clean_text(get_value(row, "Estimated Monthly Need", "estimated_monthly_need")),
            verification_status=clean_text(get_value(row, "Verification Status", "verification_status")) or "VERIFIED",
            verified_at=verified_at,
            created_at=datetime.now(timezone.utc),
            updated_at=datetime.now(timezone.utc),
        )

        session.add(new_case)
        session.commit()
        session.refresh(new_case)

        family = Family(
            case_id=new_case.id,
            family_name=title,
            summary=short_description,
            display_name=clean_text(get_value(row, "Display Name", "display_name")) or title,
            contact_note=clean_text(get_value(row, "Contact Note", "contact_note")),
            bank_name=clean_text(get_value(row, "Bank Name", "bank_name")),
            account_number=clean_text(get_value(row, "Account Number", "account_number")),
            account_name=clean_text(get_value(row, "Account Name", "account_name")),
            bank_verified=bool(
                clean_text(get_value(row, "Bank Name", "bank_name"))
                and clean_text(get_value(row, "Account Number", "account_number"))
                and clean_text(get_value(row, "Account Name", "account_name"))
            ),
            created_at=datetime.now(timezone.utc),
            updated_at=datetime.now(timezone.utc),
        )

        session.add(family)
        session.commit()

        inserted_count += 1

    print(f"New cases inserted: {inserted_count}")
    print(f"Skipped cases without matching episode: {skipped_no_episode}")
    print(f"Skipped duplicate cases: {skipped_duplicate}")


def map_news_type(category):
    category = clean_text(category)

    if not category:
        return "NEWS"

    return category


def import_news(session: Session):
    df = pd.read_csv(NEWS_CSV, encoding="utf-8-sig")
    df.columns = df.columns.str.strip()

    print("NEWS COLUMNS:", df.columns.tolist())

    inserted_count = 0
    skipped_duplicate = 0

    for _, row in df.iterrows():
        title = clean_text(get_value(row, "Title", "title"))

        if not title:
            continue

        existing_news = session.exec(
            select(News).where(News.title == title)
        ).first()

        if existing_news:
            skipped_duplicate += 1
            continue

        news = News(
            title=title,
            content=clean_text(get_value(row, "Content", "content")),
            type=map_news_type(get_value(row, "Category", "Type", "type")),
            image_url=clean_text(get_value(row, "Image URL", "image_url")),
            published_at=parse_datetime(get_value(row, "Date Posted", "published_at")),
            created_at=datetime.now(timezone.utc),
        )

        session.add(news)
        session.commit()

        inserted_count += 1

    print(f"New news inserted: {inserted_count}")
    print(f"Skipped duplicate news: {skipped_duplicate}")


def run():
    with Session(engine) as session:
        episode_map = import_episodes(session)
        import_cases(session, episode_map)
        import_news(session)

    print("DONE IMPORT")


if __name__ == "__main__":
    run()
