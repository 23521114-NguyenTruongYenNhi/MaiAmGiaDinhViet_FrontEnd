from typing import Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlmodel import Session, select

from app.db.session import get_session
from app.dependencies.auth import get_current_user
from app.models.episode import Episode
from app.models.user import User
from app.models.user_episode_action import UserEpisodeAction
from app.schemas.user_episode_action import (
    UserEpisodeActionCreate,
    UserEpisodeActionRead,
    UserEpisodeActionUpdate,
)

router = APIRouter(prefix="/episode-actions", tags=["User Episode Actions"])


@router.post("/", response_model=UserEpisodeActionRead, status_code=status.HTTP_201_CREATED)
def create_episode_action(
    payload: UserEpisodeActionCreate,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    if payload.action_type != "BOOKMARK":
        raise HTTPException(status_code=400, detail="action_type must be BOOKMARK")

    episode = session.get(Episode, payload.episode_id)
    if not episode:
        raise HTTPException(status_code=404, detail="Episode not found")

    existing_action = session.exec(
        select(UserEpisodeAction).where(
            UserEpisodeAction.user_id == current_user.id,
            UserEpisodeAction.episode_id == payload.episode_id,
            UserEpisodeAction.action_type == payload.action_type,
        )
    ).first()

    if existing_action:
        raise HTTPException(status_code=400, detail="This action already exists for this user and episode")

    action = UserEpisodeAction(
        user_id=current_user.id,
        episode_id=payload.episode_id,
        action_type=payload.action_type,
        note=payload.note,
    )

    session.add(action)
    session.commit()
    session.refresh(action)
    return action


@router.get("/me", response_model=list[UserEpisodeActionRead])
def get_my_episode_actions(
    action_type: Optional[str] = Query(default=None),
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    statement = select(UserEpisodeAction).where(UserEpisodeAction.user_id == current_user.id)

    if action_type:
        statement = statement.where(UserEpisodeAction.action_type == action_type)

    return session.exec(statement).all()


@router.patch("/{action_id}", response_model=UserEpisodeActionRead)
def update_episode_action(
    action_id: UUID,
    payload: UserEpisodeActionUpdate,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    action = session.get(UserEpisodeAction, action_id)

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
def delete_episode_action(
    action_id: UUID,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    action = session.get(UserEpisodeAction, action_id)

    if not action:
        raise HTTPException(status_code=404, detail="Action not found")

    if action.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not allowed")

    session.delete(action)
    session.commit()
    return None
