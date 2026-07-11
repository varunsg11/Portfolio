"""Pydantic request/response schemas (the API contract)."""

from pydantic import BaseModel, EmailStr, Field


class ContactForm(BaseModel):
    name: str = Field(min_length=1, max_length=255)
    email: EmailStr
    subject: str = Field(min_length=1, max_length=500)
    message: str = Field(min_length=1, max_length=5000)


class ChatRequest(BaseModel):
    question: str = Field(min_length=1, max_length=1000)


class AnalyticsSummary(BaseModel):
    contact_submissions: int
    chat_turns: int
    page_views: int
    chat_opens: int
    recent_questions: list[str]
