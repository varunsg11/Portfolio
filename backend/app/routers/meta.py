"""Resume download + health check."""

from pathlib import Path

from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse

router = APIRouter()

RESUME_PATH = Path(__file__).resolve().parent.parent.parent.parent / "assets" / "Varun_237008771.pdf"


@router.get("/resume")
async def download_resume():
    if not RESUME_PATH.exists():
        raise HTTPException(status_code=404, detail="Resume not found")
    return FileResponse(
        RESUME_PATH,
        media_type="application/pdf",
        filename="Varun_Sadashive_Gowda_Resume.pdf",
    )


@router.get("/health")
async def health():
    return {"status": "ok"}
