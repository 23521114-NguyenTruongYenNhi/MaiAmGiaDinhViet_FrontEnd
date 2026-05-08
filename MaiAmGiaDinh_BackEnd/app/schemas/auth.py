from sqlmodel import SQLModel


class Token(SQLModel):
    access_token: str
    token_type: str = "bearer"


class GoogleLogin(SQLModel):
    id_token: str
