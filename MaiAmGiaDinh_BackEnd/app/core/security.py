from datetime import datetime, timedelta, timezone
import hashlib
from typing import Optional

import bcrypt
from jose import jwt

from app.core.config import SECRET_KEY, ALGORITHM, ACCESS_TOKEN_EXPIRE_MINUTES


def password_digest(password: str) -> bytes:
    return hashlib.sha256(password.encode("utf-8")).hexdigest().encode("utf-8")


def hash_password(password: str) -> str:
    return bcrypt.hashpw(password_digest(password), bcrypt.gensalt()).decode("utf-8")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    hash_bytes = hashed_password.encode("utf-8")

    if bcrypt.checkpw(password_digest(plain_password), hash_bytes):
        return True

    # Backward compatibility for older users created with direct bcrypt.
    raw_password = plain_password.encode("utf-8")
    if len(raw_password) <= 72:
        return bcrypt.checkpw(raw_password, hash_bytes)

    return False


def create_access_token(subject: str, expires_delta: Optional[timedelta] = None) -> str:
    expire = datetime.now(timezone.utc) + (
        expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    )

    to_encode = {
        "sub": subject,
        "exp": expire,
    }

    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
