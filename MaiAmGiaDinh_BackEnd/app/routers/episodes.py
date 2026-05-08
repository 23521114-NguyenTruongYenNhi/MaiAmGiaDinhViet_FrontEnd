from datetime import datetime, timezone
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlmodel import Session, select

from app.db.session import get_session
from app.dependencies.auth import require_admin
from app.models.episode import Episode
from app.models.user import User
from app.schemas.episode import EpisodeCreate, EpisodeRead, EpisodeUpdate

router = APIRouter(prefix="/episodes", tags=["Episodes"])


@router.post("/", response_model=EpisodeRead, status_code=status.HTTP_201_CREATED)
def create_episode(
    payload: EpisodeCreate,
    session: Session = Depends(get_session),
    admin: User = Depends(require_admin),
):
    episode = Episode(**payload.model_dump())
    session.add(episode)
    session.commit()
    session.refresh(episode)
    return episode


@router.get("/", response_model=list[EpisodeRead])
def get_episodes(
    limit: int = Query(default=10, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    session: Session = Depends(get_session),
):
    statement = (
        select(Episode)
        .order_by(Episode.episode_no)
        .offset(offset)
        .limit(limit)
    )

    return session.exec(statement).all()


@router.get("/{episode_id}", response_model=EpisodeRead)
def get_episode(
    episode_id: UUID,
    session: Session = Depends(get_session),
):
    episode = session.get(Episode, episode_id)

    if not episode:
        raise HTTPException(status_code=404, detail="Episode not found")

    return episode


@router.patch("/{episode_id}", response_model=EpisodeRead)
def update_episode(
    episode_id: UUID,
    payload: EpisodeUpdate,
    session: Session = Depends(get_session),
    admin: User = Depends(require_admin),
):
    episode = session.get(Episode, episode_id)

    if not episode:
        raise HTTPException(status_code=404, detail="Episode not found")

    update_data = payload.model_dump(exclude_unset=True)

    for key, value in update_data.items():
        setattr(episode, key, value)

    episode.updated_at = datetime.now(timezone.utc)

    session.add(episode)
    session.commit()
    session.refresh(episode)

    return episode


@router.delete("/{episode_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_episode(
    episode_id: UUID,
    session: Session = Depends(get_session),
    admin: User = Depends(require_admin),
):
    episode = session.get(Episode, episode_id)

    if not episode:
        raise HTTPException(status_code=404, detail="Episode not found")

    session.delete(episode)
    session.commit()

    return None