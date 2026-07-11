"""Email delivery via Resend."""

import resend

from app.config import settings
from app.schemas import ContactForm


def send_contact_email(form: ContactForm) -> None:
    """Send the contact-form message to the site owner. Raises if not configured
    or if Resend rejects the send (caller decides how to handle)."""
    if not settings.resend_api_key:
        raise RuntimeError("Email service not configured (RESEND_API_KEY missing)")

    resend.api_key = settings.resend_api_key
    resend.Emails.send(
        {
            "from": settings.contact_from_email,
            "to": settings.contact_to_email,
            "subject": f"Portfolio Contact: {form.subject}",
            "reply_to": form.email,
            "html": f"""
                <h2>New message from {form.name}</h2>
                <p><strong>From:</strong> {form.email}</p>
                <p><strong>Subject:</strong> {form.subject}</p>
                <hr>
                <p>{form.message}</p>
            """,
        }
    )
