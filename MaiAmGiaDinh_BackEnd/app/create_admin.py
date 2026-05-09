import argparse
from datetime import datetime, timezone
from typing import Optional

from sqlmodel import Session, select

from app.core.security import hash_password
from app.db.session import create_db_and_tables, engine
from app.models.user import User


def create_or_update_admin(email: str, password: str, full_name: str, phone_number: Optional[str]):
    normalized_email = email.strip().lower()

    create_db_and_tables()

    with Session(engine) as session:
        user = session.exec(select(User).where(User.email == normalized_email)).first()

        if user:
            user.full_name = full_name
            user.password_hash = hash_password(password)
            user.phone_number = phone_number
            user.role = "ADMIN"
            user.updated_at = datetime.now(timezone.utc)
            action = "updated"
        else:
            user = User(
                full_name=full_name,
                email=normalized_email,
                password_hash=hash_password(password),
                phone_number=phone_number,
                role="ADMIN",
            )
            session.add(user)
            action = "created"

        session.commit()
        session.refresh(user)

    return action, user.email


def main():
    parser = argparse.ArgumentParser(description="Create or update an admin user.")
    parser.add_argument("--email", default="admin@maiam.dev")
    parser.add_argument("--password", default="Admin123")
    parser.add_argument("--full-name", default="Mai Am Admin")
    parser.add_argument("--phone-number", default="0900000001")
    args = parser.parse_args()

    action, email = create_or_update_admin(
        email=args.email,
        password=args.password,
        full_name=args.full_name,
        phone_number=args.phone_number,
    )

    print(f"Admin user {action}: {email}")


if __name__ == "__main__":
    main()
