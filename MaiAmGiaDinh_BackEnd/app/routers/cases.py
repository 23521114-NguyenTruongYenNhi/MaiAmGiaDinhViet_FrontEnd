from datetime import datetime, timezone
from typing import Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlmodel import Session, select

from app.db.session import get_session
from app.dependencies.auth import require_admin
from app.models.case import Case
from app.models.family import Family
from app.models.user import User
from app.schemas.case import CaseCreate, CaseRead, CaseUpdate, CaseDetail

router = APIRouter(prefix="/cases", tags=["Cases"])


@router.post("/", response_model=CaseRead, status_code=status.HTTP_201_CREATED)
def create_case(
    payload: CaseCreate,
    session: Session = Depends(get_session),
    admin: User = Depends(require_admin),
):
    case = Case(**payload.model_dump())
    session.add(case)
    session.commit()
    session.refresh(case)
    return case


@router.get("/", response_model=list[CaseRead])
def get_cases(
    episode_id: Optional[UUID] = Query(default=None),
    q: Optional[str] = Query(default=None),
    limit: int = Query(default=10, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    session: Session = Depends(get_session),
):
    statement = select(Case)

    if episode_id:
        statement = statement.where(Case.episode_id == episode_id)

    if q:
        search = f"%{q}%"
        statement = statement.where(
            (Case.title.ilike(search)) |
            (Case.location_text.ilike(search))
        )

    statement = (
        statement
        .order_by(Case.created_at.desc())
        .offset(offset)
        .limit(limit)
    )

    return session.exec(statement).all()


@router.get("/{case_id}", response_model=CaseDetail)
def get_case_detail(
    case_id: UUID,
    session: Session = Depends(get_session),
):
    case = session.get(Case, case_id)

    if not case:
        raise HTTPException(status_code=404, detail="Case not found")

    family = session.exec(
        select(Family).where(Family.case_id == case.id)
    ).first()

    return CaseDetail(
        **case.model_dump(),
        family=family,
    )


@router.patch("/{case_id}", response_model=CaseRead)
def update_case(
    case_id: UUID,
    payload: CaseUpdate,
    session: Session = Depends(get_session),
    admin: User = Depends(require_admin),
):
    case = session.get(Case, case_id)

    if not case:
        raise HTTPException(status_code=404, detail="Case not found")

    update_data = payload.model_dump(exclude_unset=True)

    for key, value in update_data.items():
        setattr(case, key, value)

    case.updated_at = datetime.now(timezone.utc)

    session.add(case)
    session.commit()
    session.refresh(case)

    return case


@router.delete("/{case_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_case(
    case_id: UUID,
    session: Session = Depends(get_session),
    admin: User = Depends(require_admin),
):
    case = session.get(Case, case_id)

    if not case:
        raise HTTPException(status_code=404, detail="Case not found")

    session.delete(case)
    session.commit()

    return None
