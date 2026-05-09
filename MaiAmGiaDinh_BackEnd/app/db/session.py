from sqlalchemy import inspect, text
from sqlmodel import SQLModel, Session, create_engine

from app.core.config import DATABASE_URL

engine = create_engine(
    DATABASE_URL,
    echo=False,
    pool_pre_ping=True,
    pool_recycle=300,
    connect_args={
        "prepare_threshold": None,
    },
)


def create_db_and_tables():
    SQLModel.metadata.create_all(engine)
    ensure_frontend_columns()


def ensure_frontend_columns():
    case_columns = {
        "priority_level": "varchar",
        "support_category": "varchar",
        "support_focus": "varchar",
        "children_count": "integer",
        "estimated_monthly_need": "varchar",
        "verification_status": "varchar not null default 'VERIFIED'",
        "verified_at": "timestamp with time zone",
    }
    family_columns = {
        "display_name": "varchar",
        "contact_note": "varchar",
        "bank_verified": "boolean not null default false",
    }

    with engine.begin() as connection:
        inspector = inspect(connection)
        existing_case_columns = {column["name"] for column in inspector.get_columns("cases")}
        existing_family_columns = {column["name"] for column in inspector.get_columns("families")}

        for column_name, column_type in case_columns.items():
            if column_name not in existing_case_columns:
                connection.execute(text(f"alter table cases add column {column_name} {column_type}"))

        for column_name, column_type in family_columns.items():
            if column_name not in existing_family_columns:
                connection.execute(text(f"alter table families add column {column_name} {column_type}"))

        connection.execute(text("update cases set verification_status = 'VERIFIED' where verification_status is null"))
        connection.execute(text("update families set bank_verified = false where bank_verified is null"))


def get_session():
    with Session(engine) as session:
        yield session
