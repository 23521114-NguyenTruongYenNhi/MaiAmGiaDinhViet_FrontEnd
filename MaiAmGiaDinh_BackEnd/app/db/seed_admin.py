from datetime import datetime, timezone

from sqlmodel import Session, select

from app.core.config import ADMIN_EMAIL, ADMIN_FULL_NAME, ADMIN_PASSWORD, ADMIN_PHONE_NUMBER
from app.core.security import hash_password
from app.db.session import engine
from app.models.user import User


def ensure_admin_user():
    if not ADMIN_EMAIL or not ADMIN_PASSWORD:
        return

    normalized_email = ADMIN_EMAIL.strip().lower()

    with Session(engine) as session:
        user = session.exec(select(User).where(User.email == normalized_email)).first()

        if user:
            user.full_name = ADMIN_FULL_NAME or user.full_name
            user.password_hash = hash_password(ADMIN_PASSWORD)
            user.phone_number = ADMIN_PHONE_NUMBER
            user.role = "ADMIN"
            user.updated_at = datetime.now(timezone.utc)
        else:
            user = User(
                full_name=ADMIN_FULL_NAME or "Mai Am Admin",
                email=normalized_email,
                password_hash=hash_password(ADMIN_PASSWORD),
                phone_number=ADMIN_PHONE_NUMBER,
                role="ADMIN",
            )
            session.add(user)

        session.commit()
