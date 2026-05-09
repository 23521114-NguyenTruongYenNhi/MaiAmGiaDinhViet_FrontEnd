from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.db.session import create_db_and_tables
from app.db.seed_admin import ensure_admin_user
from app.routers import (
    auth_router,
    users_router,
    episodes_router,
    cases_router,
    families_router,
    news_router,
    user_case_actions_router,
    user_episode_actions_router,
    chatbot_router,
)

app = FastAPI(title="MaiAm Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def on_startup():
    create_db_and_tables()
    ensure_admin_user()


app.include_router(auth_router)
app.include_router(users_router)
app.include_router(episodes_router)
app.include_router(cases_router)
app.include_router(families_router)
app.include_router(news_router)
app.include_router(user_case_actions_router)
app.include_router(user_episode_actions_router)
app.include_router(chatbot_router)


@app.get("/")
def root():
    return {"message": "MaiAm Backend is running"}
