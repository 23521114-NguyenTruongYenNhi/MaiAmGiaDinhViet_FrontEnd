from typing import Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlmodel import Session, select

from app.db.session import get_session
from app.dependencies.auth import get_current_user
from app.models.user import User
from app.models.user_case_action import UserCaseAction
from app.schemas.user_case_action import (
    UserCaseActionCreate,
    UserCaseActionRead,
    UserCaseActionUpdate,
)

router = APIRouter(prefix="/user-actions", tags=["User Case Actions"])


@router.post("/", response_model=UserCaseActionRead, status_code=status.HTTP_201_CREATED)
def create_user_action(
    payload: UserCaseActionCreate,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    if payload.action_type not in ["BOOKMARK", "HELPED"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="action_type must be BOOKMARK or HELPED",
        )

    existing_action = session.exec(
        select(UserCaseAction).where(
            UserCaseAction.user_id == current_user.id,
            UserCaseAction.case_id == payload.case_id,
            UserCaseAction.action_type == payload.action_type,
        )
    ).first()

    if existing_action:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This action already exists for this user and case",
        )

    action = UserCaseAction(
        user_id=current_user.id,
        case_id=payload.case_id,
        action_type=payload.action_type,
        note=payload.note,
    )

    session.add(action)
    session.commit()
    session.refresh(action)

    return action


@router.get("/me", response_model=list[UserCaseActionRead])
def get_my_actions(
    action_type: Optional[str] = Query(default=None),
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    statement = select(UserCaseAction).where(
        UserCaseAction.user_id == current_user.id
    )

    if action_type:
        statement = statement.where(UserCaseAction.action_type == action_type)

    return session.exec(statement).all()


@router.patch("/{action_id}", response_model=UserCaseActionRead)
def update_user_action(
    action_id: UUID,
    payload: UserCaseActionUpdate,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    action = session.get(UserCaseAction, action_id)

    if not action:
        raise HTTPException(status_code=404, detail="Action not found")

    if action.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not allowed")

    update_data = payload.model_dump(exclude_unset=True)

    for key, value in update_data.items():
        setattr(action, key, value)

    session.add(action)
    session.commit()
    session.refresh(action)

    return action


@router.delete("/{action_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_user_action(
    action_id: UUID,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    action = session.get(UserCaseAction, action_id)

    if not action:
        raise HTTPException(status_code=404, detail="Action not found")

    if action.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not allowed")

    session.delete(action)
    session.commit()

    return None
