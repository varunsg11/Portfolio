"""Lightweight analytics: record events and summarize them."""

import logging

from fastapi import APIRouter, HTTPException
from sqlalchemy import func, select

from app.db import db_available, get_db
from app.models import ChatLog, ContactSubmission, PageEvent
from app.schemas import AnalyticsSummary

log = logging.getLogger(__name__)
router = APIRouter()

ALLOWED_EVENTS = {"page_view", "chat_open", "question_asked", "form_submit"}


@router.post("/api/event")
async def record_event(event_type: str, detail: str = ""):
    if event_type not in ALLOWED_EVENTS:
        raise HTTPException(status_code=400, detail="Unknown event type")
    if not db_available():
        return {"recorded": False}
    try:
        db_gen = get_db()
        db = next(db_gen)
        try:
            db.add(PageEvent(event_type=event_type, detail=detail[:500]))
            db.commit()
        finally:
            db.close()
    except Exception as e:
        log.warning("Event persistence failed: %s", e)
        return {"recorded": False}
    return {"recorded": True}


@router.get("/api/analytics", response_model=AnalyticsSummary)
async def analytics():
    if not db_available():
        raise HTTPException(status_code=503, detail="Analytics not configured")

    db_gen = get_db()
    db = next(db_gen)
    try:
        def count_events(evt: str) -> int:
            return db.scalar(
                select(func.count()).select_from(PageEvent).where(PageEvent.event_type == evt)
            ) or 0

        recent = list(
            db.scalars(select(ChatLog.question).order_by(ChatLog.id.desc()).limit(10)).all()
        )
        return AnalyticsSummary(
            contact_submissions=db.scalar(select(func.count()).select_from(ContactSubmission)) or 0,
            chat_turns=db.scalar(select(func.count()).select_from(ChatLog)) or 0,
            page_views=count_events("page_view"),
            chat_opens=count_events("chat_open"),
            recent_questions=recent,
        )
    finally:
        db.close()
