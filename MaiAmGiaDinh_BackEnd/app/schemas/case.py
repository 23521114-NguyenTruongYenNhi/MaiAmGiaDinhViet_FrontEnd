from datetime import datetime
from typing import Optional
from uuid import UUID

from sqlmodel import SQLModel

from app.schemas.family import FamilyRead


class CaseCreate(SQLModel):
    episode_id: UUID
    title: str
    short_description: Optional[str] = None
    story: Optional[str] = None
    location_text: Optional[str] = None
    status: str = "ACTIVE"
    thumbnail_url: Optional[str] = None
    priority_level: Optional[str] = None
    support_category: Optional[str] = None
    support_focus: Optional[str] = None
    children_count: Optional[int] = None
    estimated_monthly_need: Optional[str] = None
    verification_status: str = "VERIFIED"
    verified_at: Optional[datetime] = None


class CaseUpdate(SQLModel):
    episode_id: Optional[UUID] = None
    title: Optional[str] = None
    short_description: Optional[str] = None
    story: Optional[str] = None
    location_text: Optional[str] = None
    status: Optional[str] = None
    thumbnail_url: Optional[str] = None
    priority_level: Optional[str] = None
    support_category: Optional[str] = None
    support_focus: Optional[str] = None
    children_count: Optional[int] = None
    estimated_monthly_need: Optional[str] = None
    verification_status: Optional[str] = None
    verified_at: Optional[datetime] = None


class CaseRead(SQLModel):
    id: UUID
    episode_id: UUID
    title: str
    short_description: Optional[str] = None
    story: Optional[str] = None
    location_text: Optional[str] = None
    status: str
    thumbnail_url: Optional[str] = None
    priority_level: Optional[str] = None
    support_category: Optional[str] = None
    support_focus: Optional[str] = None
    children_count: Optional[int] = None
    estimated_monthly_need: Optional[str] = None
    verification_status: str
    verified_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime


class CaseSummary(SQLModel):
    id: UUID
    title: str
    short_description: Optional[str] = None
    location_text: Optional[str] = None
    thumbnail_url: Optional[str] = None

#CaseDetail has family for easy to create family story.
class CaseDetail(SQLModel):
    id: UUID
    episode_id: UUID
    title: str
    short_description: Optional[str] = None
    story: Optional[str] = None
    location_text: Optional[str] = None
    status: str
    thumbnail_url: Optional[str] = None
    priority_level: Optional[str] = None
    support_category: Optional[str] = None
    support_focus: Optional[str] = None
    children_count: Optional[int] = None
    estimated_monthly_need: Optional[str] = None
    verification_status: str
    verified_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime
    family: Optional[FamilyRead] = None
