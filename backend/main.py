from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from pydantic import BaseModel, EmailStr
from dotenv import load_dotenv
import resend
import os
from pathlib import Path

load_dotenv()

app = FastAPI()

# Allow requests from the frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
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
async def contact(form: ContactForm):
    api_key = os.getenv("RESEND_API_KEY")
    if not api_key:
        raise HTTPException(status_code=500, detail="Email service not configured")

    resend.api_key = api_key

    resend.Emails.send({
        "from": "onboarding@resend.dev",
        "to": "varunsg118@gmail.com",
        "subject": f"Portfolio Contact: {form.subject}",
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
