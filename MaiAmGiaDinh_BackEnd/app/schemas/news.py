from datetime import datetime
from typing import Optional
from uuid import UUID

from sqlmodel import SQLModel


class NewsCreate(SQLModel):
    title: str
    content: Optional[str] = None
    type: str
    image_url: Optional[str] = None
    published_at: Optional[datetime] = None


class NewsUpdate(SQLModel):
    title: Optional[str] = None
    content: Optional[str] = None
    type: Optional[str] = None
    image_url: Optional[str] = None
    published_at: Optional[datetime] = None

#Use for detail page
class NewsRead(SQLModel):
    id: UUID
    title: str
    content: Optional[str] = None
    type: str
    image_url: Optional[str] = None
    published_at: Optional[datetime] = None
    created_at: datetime

#NewsSummary use for listing page
class NewsSummary(SQLModel):
    id: UUID
    title: str
    type: str
    image_url: Optional[str] = None
    published_at: Optional[datetime] = None