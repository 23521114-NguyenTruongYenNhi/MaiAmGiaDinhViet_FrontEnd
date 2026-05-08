from datetime import datetime, timezone
from typing import Optional
from uuid import UUID, uuid4

from sqlmodel import Field, SQLModel


class Family(SQLModel, table=True):
    __tablename__ = "families"

    id: UUID = Field(default_factory=uuid4, primary_key=True)
    case_id: UUID = Field(
        foreign_key="cases.id",
        unique=True,
        index=True,
        nullable=False
    )

    family_name: str
    summary: Optional[str] = None
    display_name: Optional[str] = None
    contact_note: Optional[str] = None

    bank_name: Optional[str] = None
    account_number: Optional[str] = None
    account_name: Optional[str] = None
    bank_verified: bool = Field(default=False, nullable=False)

    created_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        nullable=False
    )
    updated_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        nullable=False
    )
