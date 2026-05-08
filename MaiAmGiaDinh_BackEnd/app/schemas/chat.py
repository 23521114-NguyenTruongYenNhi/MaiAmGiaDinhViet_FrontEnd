from typing import Optional
from sqlmodel import SQLModel


class ChatRequest(SQLModel):
    message: str


class ChatResponse(SQLModel):
    reply: str
    context_used: Optional[int] = 0