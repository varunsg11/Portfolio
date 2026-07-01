from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from pydantic import BaseModel, EmailStr
from dotenv import load_dotenv
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
import resend
import os
from pathlib import Path

load_dotenv()

limiter = Limiter(key_func=get_remote_address)
app = FastAPI()
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# Allow requests from the frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://varunsg.dev",
        "https://www.varunsg.dev",
        "http://127.0.0.1:5500",  # local dev
        "http://localhost:5500",
    ],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── MODELS ──
class ContactForm(BaseModel):
    name: str
    email: EmailStr
    subject: str
    message: str

# ── CONTACT ENDPOINT ──
@app.post("/api/contact")
@limiter.limit("3/minute")
async def contact(request: Request, form: ContactForm):
    api_key = os.getenv("RESEND_API_KEY")
    if not api_key:
        raise HTTPException(status_code=500, detail="Email service not configured")

    resend.api_key = api_key

    resend.Emails.send({
        "from": "onboarding@resend.dev",
        "to": "varunsg118@gmail.com",
        "subject": f"Portfolio Contact: {form.subject}",
        "reply_to": form.email,
        "html": f"""
            <h2>New message from {form.name}</h2>
            <p><strong>From:</strong> {form.email}</p>
            <p><strong>Subject:</strong> {form.subject}</p>
            <hr>
            <p>{form.message}</p>
        """
    })

    return {"message": "Sent"}

# ── RESUME ENDPOINT ──
@app.get("/resume")
async def download_resume():
    path = Path(__file__).parent.parent / "assets" / "Varun_237008771.pdf"
    if not path.exists():
        raise HTTPException(status_code=404, detail="Resume not found")
    return FileResponse(path, media_type="application/pdf", filename="Varun_Sadashive_Gowda_Resume.pdf")

# ── HEALTH CHECK ──
@app.get("/health")
async def health():
    return {"status": "ok"}
