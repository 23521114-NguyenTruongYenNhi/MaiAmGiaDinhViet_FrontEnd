from datetime import datetime, timezone
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlmodel import Session, select

from app.db.session import get_session
from app.dependencies.auth import require_admin
from app.models.family import Family
from app.models.user import User
from app.schemas.family import FamilyCreate, FamilyRead, FamilyUpdate

router = APIRouter(prefix="/families", tags=["Families"])


@router.post("/", response_model=FamilyRead, status_code=status.HTTP_201_CREATED)
def create_family(
    payload: FamilyCreate,
    session: Session = Depends(get_session),
    admin: User = Depends(require_admin),
):
    existing_family = session.exec(
        select(Family).where(Family.case_id == payload.case_id)
    ).first()

    if existing_family:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This case already has a family record",
        )

    family = Family(**payload.model_dump())

    session.add(family)
    session.commit()
    session.refresh(family)

    return family


@router.get("/", response_model=list[FamilyRead])
def get_families(
    limit: int = Query(default=10, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    session: Session = Depends(get_session),
):
    statement = select(Family).offset(offset).limit(limit)
    return session.exec(statement).all()


@router.get("/case/{case_id}", response_model=FamilyRead)
def get_family_by_case(
    case_id: UUID,
    session: Session = Depends(get_session),
):
    family = session.exec(
        select(Family).where(Family.case_id == case_id)
    ).first()

    if not family:
        raise HTTPException(status_code=404, detail="Family not found")

    return family


@router.get("/{family_id}", response_model=FamilyRead)
def get_family(
    family_id: UUID,
    session: Session = Depends(get_session),
):
    family = session.get(Family, family_id)

    if not family:
        raise HTTPException(status_code=404, detail="Family not found")

    return family


@router.patch("/{family_id}", response_model=FamilyRead)
def update_family(
    family_id: UUID,
    payload: FamilyUpdate,
    session: Session = Depends(get_session),
    admin: User = Depends(require_admin),
):
    family = session.get(Family, family_id)

    if not family:
        raise HTTPException(status_code=404, detail="Family not found")

    update_data = payload.model_dump(exclude_unset=True)

    for key, value in update_data.items():
        setattr(family, key, value)

    family.updated_at = datetime.now(timezone.utc)

    session.add(family)
    session.commit()
    session.refresh(family)

    return family


@router.delete("/{family_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_family(
    family_id: UUID,
    session: Session = Depends(get_session),
    admin: User = Depends(require_admin),
):
    family = session.get(Family, family_id)

    if not family:
        raise HTTPException(status_code=404, detail="Family not found")

    session.delete(family)
    session.commit()

    return None
