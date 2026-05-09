from datetime import datetime, timezone
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlmodel import Session, select

from app.db.session import get_session
from app.dependencies.auth import get_current_user, require_admin
from app.models.user import User
from app.schemas.user import UserRead, UserRoleUpdate, UserUpdate

router = APIRouter(prefix="/users", tags=["Users"])


@router.get("/me", response_model=UserRead)
def get_me(
    current_user: User = Depends(get_current_user),
):
    return current_user


@router.patch("/me", response_model=UserRead)
def update_me(
    payload: UserUpdate,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    update_data = payload.model_dump(exclude_unset=True)

    for key, value in update_data.items():
        setattr(current_user, key, value)

    current_user.updated_at = datetime.now(timezone.utc)

    session.add(current_user)
    session.commit()
    session.refresh(current_user)

    return current_user


@router.get("/", response_model=list[UserRead])
def list_users(
    limit: int = Query(default=100, ge=1, le=200),
    offset: int = Query(default=0, ge=0),
    admin: User = Depends(require_admin),
    session: Session = Depends(get_session),
):
    statement = (
        select(User)
        .order_by(User.created_at.desc())
        .offset(offset)
        .limit(limit)
    )

    return session.exec(statement).all()


@router.patch("/{user_id}/role", response_model=UserRead)
def update_user_role(
    user_id: UUID,
    payload: UserRoleUpdate,
    admin: User = Depends(require_admin),
    session: Session = Depends(get_session),
):
    role = payload.role.upper()

    if role not in ["USER", "ADMIN"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="role must be USER or ADMIN",
        )

    user = session.get(User, user_id)

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user.role = role
    user.updated_at = datetime.now(timezone.utc)
    session.add(user)
    session.commit()
    session.refresh(user)
    return user
