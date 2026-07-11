"""RAG chatbot endpoint — streams a grounded answer over Server-Sent Events."""

import json
import logging

from fastapi import APIRouter, HTTPException, Request
from fastapi.responses import StreamingResponse

from app.config import settings
from app.db import db_available, get_db
from app.limiter import limiter
from app.models import ChatLog
from app.schemas import ChatRequest
from app.services import rag, tools
from app.services.openai_client import is_flagged, stream_agent

log = logging.getLogger(__name__)
router = APIRouter()


def _sse(data: dict) -> str:
    return f"data: {json.dumps(data)}\n\n"


@router.post("/api/chat")
@limiter.limit("10/minute")
async def chat(request: Request, body: ChatRequest):
    if not db_available() or not settings.openai_api_key:
        raise HTTPException(status_code=503, detail="Chat is not configured")

    question = body.question.strip()[: settings.chat_max_input_chars]
    if is_flagged(question):
        raise HTTPException(status_code=400, detail="Question was flagged by moderation")

    # Retrieve context up front (outside the stream) so retrieval errors surface cleanly.
    db_gen = get_db()
    db = next(db_gen)
    try:
        chunks = rag.retrieve(db, question)
    except Exception as e:
        db.close()
        log.exception("Retrieval failed")
        raise HTTPException(status_code=500, detail="Retrieval failed") from e

    system_prompt = rag.build_system_prompt(chunks)
    sources = ",".join(dict.fromkeys(c.source for c in chunks))  # unique, ordered

    def event_stream():
        answer_parts: list[str] = []
        try:
            for token in stream_agent(
                system_prompt, question, tools.tool_schemas(), tools.dispatch
            ):
                answer_parts.append(token)
                yield _sse({"token": token})
            yield _sse({"done": True, "sources": sources})
        except Exception:
            log.exception("Chat streaming failed")
            yield _sse({"error": "Something went wrong generating the answer."})
        finally:
            # Log the turn, then close the session.
            try:
                db.add(
                    ChatLog(
                        question=question,
                        answer="".join(answer_parts),
                        sources=sources,
                    )
                )
                db.commit()
            except Exception:
                log.warning("Chat log persistence failed")
            db.close()

    return StreamingResponse(event_stream(), media_type="text/event-stream")
