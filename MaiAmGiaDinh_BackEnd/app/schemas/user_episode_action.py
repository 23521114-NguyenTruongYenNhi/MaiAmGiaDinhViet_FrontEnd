from datetime import datetime
from typing import Optional
from uuid import UUID

from sqlmodel import SQLModel


class UserEpisodeActionCreate(SQLModel):
    episode_id: UUID
    action_type: str
    note: Optional[str] = None


class UserEpisodeActionUpdate(SQLModel):
    note: Optional[str] = None


class UserEpisodeActionRead(SQLModel):
    id: UUID
    user_id: UUID
    episode_id: UUID
    action_type: str
    note: Optional[str] = None
    created_at: datetime
