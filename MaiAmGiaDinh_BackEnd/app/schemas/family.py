from datetime import datetime
from typing import Optional
from uuid import UUID

from sqlmodel import SQLModel


class FamilyCreate(SQLModel):
    case_id: UUID
    family_name: str
    summary: Optional[str] = None
    display_name: Optional[str] = None
    contact_note: Optional[str] = None
    bank_name: Optional[str] = None
    account_number: Optional[str] = None
    account_name: Optional[str] = None
    bank_verified: bool = False


class FamilyUpdate(SQLModel):
    family_name: Optional[str] = None
    summary: Optional[str] = None
    display_name: Optional[str] = None
    contact_note: Optional[str] = None
    bank_name: Optional[str] = None
    account_number: Optional[str] = None
    account_name: Optional[str] = None
    bank_verified: Optional[bool] = None


class FamilyRead(SQLModel):
    id: UUID
    case_id: UUID
    family_name: str
    summary: Optional[str] = None
    display_name: Optional[str] = None
    contact_note: Optional[str] = None
    bank_name: Optional[str] = None
    account_number: Optional[str] = None
    account_name: Optional[str] = None
    bank_verified: bool
    created_at: datetime
    updated_at: datetime
