"""Contact form endpoint: persist the submission, then send the email."""

import logging

from fastapi import APIRouter, HTTPException, Request

from app.db import db_available, get_db
from app.limiter import limiter
from app.models import ContactSubmission
from app.schemas import ContactForm
from app.services.email import send_contact_email

log = logging.getLogger(__name__)
router = APIRouter()


@router.post("/api/contact")
@limiter.limit("3/minute")
async def contact(request: Request, form: ContactForm):
    email_sent = False
    try:
        send_contact_email(form)
        email_sent = True
    except Exception as e:  # don't lose the submission if email fails
        log.warning("Contact email failed: %s", e)

    # Persist regardless of email outcome (best-effort).
    if db_available():
        try:
            db_gen = get_db()
            db = next(db_gen)
            try:
                db.add(
                    ContactSubmission(
                        name=form.name,
                        email=form.email,
                        subject=form.subject,
                        message=form.message,
                        email_sent=email_sent,
                    )
                )
                db.commit()
            finally:
                db.close()
        except Exception as e:
            log.warning("Contact persistence failed: %s", e)

    if not email_sent and not db_available():
        # Nothing succeeded — surface an error so the user emails directly.
        raise HTTPException(status_code=500, detail="Message could not be delivered")

    return {"message": "Sent"}
