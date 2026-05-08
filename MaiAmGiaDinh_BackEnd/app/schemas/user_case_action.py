from datetime import datetime
from typing import Optional
from uuid import UUID

from sqlmodel import SQLModel


class UserCaseActionCreate(SQLModel):
    case_id: UUID
    action_type: str  # BOOKMARK | HELPED
    note: Optional[str] = None


class UserCaseActionUpdate(SQLModel):
    note: Optional[str] = None


class UserCaseActionRead(SQLModel):
    id: UUID
    user_id: UUID
    case_id: UUID
    action_type: str
    note: Optional[str] = None
    created_at: datetime