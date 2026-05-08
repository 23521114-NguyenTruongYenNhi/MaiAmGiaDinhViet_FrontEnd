from datetime import datetime, timezone
from typing import Optional
from uuid import UUID, uuid4

from sqlmodel import Field, SQLModel


class Case(SQLModel, table=True):
    __tablename__ = "cases"

    id: UUID = Field(default_factory=uuid4, primary_key=True)
    episode_id: UUID = Field(
        foreign_key="episodes.id",
        index=True,
        nullable=False
    )

    title: str
    short_description: Optional[str] = None
    story: Optional[str] = None
    location_text: Optional[str] = None
    status: str = Field(default="ACTIVE", nullable=False)  # ACTIVE | ARCHIVED
    thumbnail_url: Optional[str] = None
    priority_level: Optional[str] = None
    support_category: Optional[str] = None
    support_focus: Optional[str] = None
    children_count: Optional[int] = None
    estimated_monthly_need: Optional[str] = None
    verification_status: str = Field(default="VERIFIED", nullable=False)
    verified_at: Optional[datetime] = None

    created_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        nullable=False
    )
    # Remember to update manually
    updated_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        nullable=False
    )
