"""RAG core: retrieve relevant knowledge-base chunks and build a grounded prompt."""

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.config import settings
from app.models import KBChunk
from app.services.openai_client import embed

SYSTEM_PROMPT = """You are the AI assistant on Varun Sadashive Gowda's portfolio \
website. You answer questions from recruiters and visitors about Varun — his \
experience, skills, projects, research, and background.

Rules:
- Answer ONLY using the context provided below and the results of any tools you call. Do not invent facts.
- You have tools available: get_projects, check_availability, get_github_stats (live data), and request_intro. Use them when they help answer accurately — e.g. call get_github_stats for repo counts, check_availability for internship timing, or request_intro ONLY when the visitor explicitly wants to message Varun and has given their name, email, and message.
- If neither the context nor a tool has the answer, say you don't have that detail and suggest they use the contact form or email varunsg118@gmail.com.
- Politely decline questions unrelated to Varun or his professional background.
- Be concise, warm, and professional. Speak about Varun in the third person.
- When relevant, mention specifics (companies, metrics, technologies) from the context.

Context about Varun:
---
{context}
---"""


def retrieve(db: Session, question: str, k: int | None = None) -> list[KBChunk]:
    """Embed the question and return the top-k nearest chunks by cosine distance."""
    k = k or settings.rag_top_k
    query_vec = embed(question)
    # pgvector cosine distance operator via SQLAlchemy.
    stmt = (
        select(KBChunk)
        .order_by(KBChunk.embedding.cosine_distance(query_vec))
        .limit(k)
    )
    return list(db.scalars(stmt).all())


def build_system_prompt(chunks: list[KBChunk]) -> str:
    context = "\n\n".join(f"[{c.source}] {c.content}" for c in chunks)
    return SYSTEM_PROMPT.format(context=context or "(no context found)")
