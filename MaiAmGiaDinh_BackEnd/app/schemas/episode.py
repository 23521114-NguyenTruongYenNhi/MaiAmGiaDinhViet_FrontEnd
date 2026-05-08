from datetime import date, datetime
from typing import Optional
from uuid import UUID

from sqlmodel import SQLModel


class EpisodeCreate(SQLModel):
    episode_no: int
    title: str
    description: Optional[str] = None
    air_date: Optional[date] = None
    video_url: Optional[str] = None
    is_featured: bool = False


class EpisodeUpdate(SQLModel):
    episode_no: Optional[int] = None
    title: Optional[str] = None
    description: Optional[str] = None
    air_date: Optional[date] = None
    video_url: Optional[str] = None
    is_featured: Optional[bool] = None


class EpisodeRead(SQLModel):
    id: UUID
    episode_no: int
    title: str
    description: Optional[str] = None
    air_date: Optional[date] = None
    video_url: Optional[str] = None
    is_featured: bool
    created_at: datetime
    updated_at: datetime