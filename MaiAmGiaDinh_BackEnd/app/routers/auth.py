from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from google.auth.transport import requests as google_requests
from google.oauth2 import id_token as google_id_token
from sqlmodel import Session, select

from app.core.config import GOOGLE_ANDROID_CLIENT_ID, GOOGLE_CLIENT_ID, GOOGLE_IOS_CLIENT_ID
from app.core.security import create_access_token, hash_password, verify_password
from app.db.session import get_session
from app.models.user import User
from app.schemas.auth import GoogleLogin, Token
from app.schemas.user import UserCreate, UserRead

router = APIRouter(prefix="/auth", tags=["Auth"])


def get_google_client_ids():
    return [
        client_id
        for client_id in [GOOGLE_CLIENT_ID, GOOGLE_IOS_CLIENT_ID, GOOGLE_ANDROID_CLIENT_ID]
        if client_id
    ]


@router.post("/register", response_model=UserRead, status_code=status.HTTP_201_CREATED)
def register(payload: UserCreate, session: Session = Depends(get_session)):
    existing_user = session.exec(
        select(User).where(User.email == payload.email)
    ).first()

    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered",
        )

    user = User(
        full_name=payload.full_name,
        email=payload.email,
        password_hash=hash_password(payload.password),
        phone_number=payload.phone_number,
    )

    session.add(user)
    session.commit()
    session.refresh(user)
    return user


@router.post("/login", response_model=Token)
def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    session: Session = Depends(get_session),
):
    user = session.exec(
        select(User).where(User.email == form_data.username)
    ).first()

    if not user or not verify_password(form_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    token = create_access_token(subject=str(user.id))
    return Token(access_token=token)


@router.post("/google", response_model=Token)
def google_login(
    payload: GoogleLogin,
    session: Session = Depends(get_session),
):
    google_client_ids = get_google_client_ids()

    if not google_client_ids:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Google client IDs are not configured",
        )

    claims = None
    verify_errors = []

    for client_id in google_client_ids:
        try:
            claims = google_id_token.verify_oauth2_token(
                payload.id_token,
                google_requests.Request(),
                client_id,
            )
            break
        except ValueError as error:
            verify_errors.append(str(error))

    if not claims:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid Google token: {' | '.join(verify_errors) or 'No accepted client ID matched'}",
        )

    email = claims.get("email")
    email_verified = claims.get("email_verified")
    full_name = claims.get("name") or email

    if not email or not email_verified:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Google account email is not verified",
        )

    user = session.exec(
        select(User).where(User.email == email)
    ).first()

    if not user:
        user = User(
            full_name=full_name,
            email=email,
            password_hash=hash_password("google-oauth-user"),
        )
        session.add(user)
        session.commit()
        session.refresh(user)

    token = create_access_token(subject=str(user.id))
    return Token(access_token=token)
