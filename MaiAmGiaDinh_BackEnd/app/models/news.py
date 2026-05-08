from datetime import datetime, timezone
from typing import Optional
from uuid import UUID, uuid4

from sqlmodel import Field, SQLModel


class News(SQLModel, table=True):
    __tablename__ = "news"

    id: UUID = Field(default_factory=uuid4, primary_key=True)
    title: str
    content: Optional[str] = None
    type: str = Field(nullable=False, index=True)  # NEWS | SUCCESS | EVENT
    image_url: Optional[str] = None
    published_at: Optional[datetime] = None

    created_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        nullable=False
    )