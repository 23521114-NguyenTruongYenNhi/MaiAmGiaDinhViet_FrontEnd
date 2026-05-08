from typing import Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlmodel import Session, select

from app.db.session import get_session
from app.dependencies.auth import require_admin
from app.models.news import News
from app.models.user import User
from app.schemas.news import NewsCreate, NewsRead, NewsUpdate

router = APIRouter(prefix="/news", tags=["News"])


@router.post("/", response_model=NewsRead, status_code=status.HTTP_201_CREATED)
def create_news(
    payload: NewsCreate,
    session: Session = Depends(get_session),
    admin: User = Depends(require_admin),
):
    news = News(**payload.model_dump())

    session.add(news)
    session.commit()
    session.refresh(news)

    return news


@router.get("/", response_model=list[NewsRead])
def get_news(
    news_type: Optional[str] = Query(default=None),
    limit: int = Query(default=10, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    session: Session = Depends(get_session),
):
    statement = select(News)

    if news_type:
        statement = statement.where(News.type == news_type)

    statement = (
        statement
        .order_by(News.created_at.desc())
        .offset(offset)
        .limit(limit)
    )

    return session.exec(statement).all()


@router.get("/{news_id}", response_model=NewsRead)
def get_news_detail(
    news_id: UUID,
    session: Session = Depends(get_session),
):
    news = session.get(News, news_id)

    if not news:
        raise HTTPException(status_code=404, detail="News not found")

    return news


@router.patch("/{news_id}", response_model=NewsRead)
def update_news(
    news_id: UUID,
    payload: NewsUpdate,
    session: Session = Depends(get_session),
    admin: User = Depends(require_admin),
):
    news = session.get(News, news_id)

    if not news:
        raise HTTPException(status_code=404, detail="News not found")

    update_data = payload.model_dump(exclude_unset=True)

    for key, value in update_data.items():
        setattr(news, key, value)

    session.add(news)
    session.commit()
    session.refresh(news)

    return news


@router.delete("/{news_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_news(
    news_id: UUID,
    session: Session = Depends(get_session),
    admin: User = Depends(require_admin),
):
    news = session.get(News, news_id)

    if not news:
        raise HTTPException(status_code=404, detail="News not found")

    session.delete(news)
    session.commit()

    return None
