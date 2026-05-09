from sqlmodel import Session

from app.db.import_clean_data import import_news
from app.db.session import create_db_and_tables, engine


def run():
    create_db_and_tables()

    with Session(engine) as session:
        import_news(session)

    print("DONE NEWS SYNC")


if __name__ == "__main__":
    run()
