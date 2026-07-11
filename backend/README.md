# Portfolio Backend

FastAPI service powering `varunsg.dev`: the contact form, resume delivery,
analytics, and a retrieval-augmented chatbot backed by Postgres with pgvector.

## Structure

```
backend/
├── app/
│   ├── main.py            # app factory (uvicorn app.main:app)
│   ├── config.py          # settings from env (pydantic-settings)
│   ├── db.py              # SQLAlchemy engine/session, pgvector setup
│   ├── models.py          # ORM tables: kb_chunks, contact_submissions, chat_logs, page_events
│   ├── schemas.py         # Pydantic request/response models
│   ├── limiter.py         # shared slowapi rate limiter
│   ├── mcp_server.py      # standalone MCP server exposing the tools
│   ├── routers/           # contact, chat (agentic SSE), meta (resume/health), analytics
│   └── services/          # email, openai_client, rag, ingest, tools
├── knowledge/faq.md       # curated chatbot talking points
├── migrations/            # Alembic (0001_initial creates pgvector + tables)
├── tests/                 # pytest contract tests (run without DB/keys)
├── requirements.txt
└── .env                   # secrets (gitignored) — see .env.example
```

## Endpoints

| Method | Path             | Notes                                        |
|--------|------------------|----------------------------------------------|
| POST   | `/api/contact`   | Persist submission + send email. 3/min/IP.   |
| POST   | `/api/chat`      | Agentic RAG answer, streamed as SSE. 10/min/IP.  |
| POST   | `/api/event`     | Record an analytics event.                   |
| GET    | `/api/analytics` | Summary counts + recent questions.           |
| GET    | `/resume`        | Download the resume PDF.                      |
| GET    | `/health`        | Health check.                                |

Features degrade gracefully: with no `DATABASE_URL`/`OPENAI_API_KEY`, chat and
analytics return `503`; contact still emails.

## Local development

```bash
cd backend
python -m venv venv
venv/Scripts/activate            # Windows  (source venv/bin/activate on macOS/Linux)
pip install -r requirements.txt
cp .env.example .env             # fill in keys + DATABASE_URL

# Create the schema (once per database):
alembic upgrade head

# Build the knowledge base (embeds content + faq + resume into pgvector):
python -m app.services.ingest

# Run the API:
uvicorn app.main:app --reload    # http://localhost:8000  (docs at /docs)
```

## Tests

```bash
python -m pytest -q
```

Contract tests run without a database or OpenAI key.

## Agentic tools & MCP

The chatbot is an agent: `app/services/tools.py` defines tools the model can
call — `get_projects`, `check_availability`, `get_github_stats` (live GitHub
API), and `request_intro` (routes into the contact pipeline). `/api/chat` runs a
tool-calling loop (`stream_agent` in `openai_client.py`), then streams the
grounded answer.

The same tools are exposed over the Model Context Protocol, so any MCP client can
query the portfolio:

```bash
pip install -r requirements-mcp.txt
python -m app.mcp_server
```

## Deploy (Render)

- Build: `pip install -r requirements.txt`
- Start: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
- Env vars: `RESEND_API_KEY`, `DATABASE_URL`, `OPENAI_API_KEY`
- Run `alembic upgrade head` and `python -m app.services.ingest` once after the
  first deploy (Render Shell), and re-run ingest whenever content changes.
