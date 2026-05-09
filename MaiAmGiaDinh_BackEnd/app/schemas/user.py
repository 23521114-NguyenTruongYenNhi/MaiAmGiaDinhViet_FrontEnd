from datetime import datetime
from typing import Optional
from uuid import UUID

from sqlmodel import SQLModel


class UserCreate(SQLModel):
    full_name: str
    email: str
    password: str
    phone_number: Optional[str] = None


class UserLogin(SQLModel):
    email: str
    password: str


class UserUpdate(SQLModel):
    full_name: Optional[str] = None
    phone_number: Optional[str] = None


class UserRoleUpdate(SQLModel):
    role: str


class UserRead(SQLModel):
    id: UUID
    full_name: str
    email: str
    phone_number: Optional[str] = None
    role: str
    created_at: datetime
    updated_at: datetime


class UserPublic(SQLModel):
    id: UUID
    full_name: str
    email: str
    role: str
