from datetime import datetime, timezone
from typing import Optional
from uuid import UUID, uuid4

from sqlalchemy import UniqueConstraint
from sqlmodel import Field, SQLModel


class UserEpisodeAction(SQLModel, table=True):
    __tablename__ = "user_episode_actions"
    __table_args__ = (
        UniqueConstraint("user_id", "episode_id", "action_type"),
    )

    id: UUID = Field(default_factory=uuid4, primary_key=True)
    user_id: UUID = Field(foreign_key="users.id", index=True, nullable=False)
    episode_id: UUID = Field(foreign_key="episodes.id", index=True, nullable=False)
    action_type: str = Field(nullable=False, index=True)  # BOOKMARK
    note: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc), nullable=False)
