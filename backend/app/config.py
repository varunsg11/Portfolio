"""Application configuration, loaded from environment variables.

pydantic-settings reads from the environment (and a local .env file), validates
types, and gives us a single typed `settings` object to import everywhere.
"""

from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    # ── Email (Resend) ──
    resend_api_key: str = ""
    contact_to_email: str = "varunsg118@gmail.com"
    contact_from_email: str = "onboarding@resend.dev"

    # ── Database (Neon Postgres + pgvector) ──
    # e.g. postgresql+psycopg://user:pass@host/dbname?sslmode=require
    database_url: str = ""

    # ── OpenAI (RAG) ──
    openai_api_key: str = ""
    embedding_model: str = "text-embedding-3-small"  # 1536 dims
    chat_model: str = "gpt-4o-mini"

    # ── RAG tuning ──
    rag_top_k: int = 5
    chat_max_input_chars: int = 1000

    # ── CORS ──
    allowed_origins: list[str] = [
        "https://varunsg.dev",
        "https://www.varunsg.dev",
        "http://127.0.0.1:5500",
        "http://localhost:5500",
        "http://localhost:3000",  # Next.js dev
    ]
    # Regex matching Vercel deployments (production alias + per-commit previews).
    # e.g. https://portfoliomain-two-wine.vercel.app, https://portfolio-xyz.vercel.app
    allowed_origin_regex: str = r"https://.*\.vercel\.app"


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
