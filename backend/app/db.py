"""Database engine, session management, and pgvector setup.

Uses SQLAlchemy 2.x. The engine is created lazily so the app can boot even when
DATABASE_URL is not configured yet (contact email still works; DB-backed
features return a clear error instead of crashing at import time).
"""

from collections.abc import Generator

from sqlalchemy import create_engine, text
from sqlalchemy.orm import DeclarativeBase, Session, sessionmaker

from app.config import settings

_engine = None
_SessionLocal: sessionmaker[Session] | None = None


class Base(DeclarativeBase):
    pass


def _normalize_url(url: str) -> str:
    """Neon/Render often hand out `postgresql://`; SQLAlchemy + psycopg3 wants
    the `postgresql+psycopg://` driver prefix."""
    if url.startswith("postgresql://"):
        return url.replace("postgresql://", "postgresql+psycopg://", 1)
    return url


def get_engine():
    global _engine, _SessionLocal
    if _engine is None:
        if not settings.database_url:
            raise RuntimeError(
                "DATABASE_URL is not configured — database features are unavailable."
            )
        _engine = create_engine(
            _normalize_url(settings.database_url),
            pool_pre_ping=True,  # survive Neon's scale-to-zero idle disconnects
        )
        _SessionLocal = sessionmaker(bind=_engine, autoflush=False, expire_on_commit=False)
    return _engine


def db_available() -> bool:
    return bool(settings.database_url)


def get_db() -> Generator[Session, None, None]:
    """FastAPI dependency yielding a scoped session."""
    get_engine()
    assert _SessionLocal is not None
    db = _SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_pgvector() -> None:
    """Ensure the pgvector extension exists. Safe to call repeatedly."""
    engine = get_engine()
    with engine.begin() as conn:
        conn.execute(text("CREATE EXTENSION IF NOT EXISTS vector"))
