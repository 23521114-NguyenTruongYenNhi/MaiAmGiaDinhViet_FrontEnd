from typing import List, Literal, Optional
from sqlmodel import SQLModel


class ChatMessage(SQLModel):
    role: Literal["user", "assistant"]
    content: str


class ChatRequest(SQLModel):
    message: str
    history: Optional[List[ChatMessage]] = None


class ChatResponse(SQLModel):
    reply: str
    context_used: Optional[int] = 0
