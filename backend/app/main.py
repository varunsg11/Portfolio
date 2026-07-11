"""FastAPI application factory.

Run locally:  uvicorn app.main:app --reload
Entry point on Render: app.main:app
"""

import logging

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded

from app.config import settings
from app.limiter import limiter
from app.routers import analytics, chat, contact, meta

load_dotenv()
logging.basicConfig(level=logging.INFO)


def create_app() -> FastAPI:
    app = FastAPI(title="Portfolio API", version="2.0.0")

    # Rate limiting (shared limiter; routers declare their own limits).
    app.state.limiter = limiter
    app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.allowed_origins,
        allow_origin_regex=settings.allowed_origin_regex,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    app.include_router(meta.router)
    app.include_router(contact.router)
    app.include_router(chat.router)
    app.include_router(analytics.router)
    return app


app = create_app()
