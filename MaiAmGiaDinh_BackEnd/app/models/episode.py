from datetime import date, datetime, timezone
from typing import Optional
from uuid import UUID, uuid4

from sqlmodel import Field, SQLModel


class Episode(SQLModel, table=True):
    __tablename__ = "episodes"

    id: UUID = Field(default_factory=uuid4, primary_key=True)
    episode_no: int = Field(index=True, nullable=False)
    title: str
    description: Optional[str] = None
    air_date: Optional[date] = None
    video_url: Optional[str] = None
    is_featured: bool = Field(default=False, nullable=False)

    created_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        nullable=False
    )
    # Remember to update manually
    updated_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        nullable=False
    )