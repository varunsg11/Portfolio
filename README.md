# varunsg.dev

Personal portfolio site for Varun Sadashive Gowda. Built as a full-stack
project: a Next.js frontend, a FastAPI backend, and a retrieval-augmented
chatbot that answers questions about my background from a vector-indexed
knowledge base.

Live at [varunsg.dev](https://varunsg.dev).

## Overview

The site is split into two independently deployed halves that communicate over
HTTP:

- **`web/`** — the frontend: a Next.js (App Router) application in React and
  TypeScript. Deployed to Vercel.
- **`backend/`** — the API: a FastAPI service handling the contact form, resume
  delivery, analytics, and the chatbot. Deployed to Render, backed by Postgres
  with the pgvector extension.

The chatbot is the centrepiece. It uses retrieval-augmented generation: my
experience, projects, and resume are chunked, embedded, and stored in pgvector;
a question is embedded, the nearest chunks are retrieved, and an OpenAI model
answers grounded only in that context. It can also call tools — for example,
fetching live GitHub stats or routing an introduction into the contact pipeline.

## Repository layout

```
web/        Next.js frontend (React, TypeScript)
backend/    FastAPI backend (RAG chatbot, contact, analytics)
frontend/   Original static site (superseded by web/, kept for reference)
assets/     Resume PDF and images
```

Each of `web/` and `backend/` has its own README with setup and development
instructions.

## Stack

| Layer     | Technologies                                                        |
|-----------|---------------------------------------------------------------------|
| Frontend  | Next.js, React, TypeScript, Tailwind CSS                            |
| Backend   | Python, FastAPI, SQLAlchemy, Alembic, Pydantic                      |
| Data / AI | Postgres + pgvector, OpenAI (embeddings + chat), Model Context Protocol |
| Email     | Resend                                                              |
| Hosting   | Vercel (frontend), Render (backend), Neon (database)               |

## Local development

Run the backend and frontend in separate terminals.

**Backend**

```bash
cd backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env            # add your keys
alembic upgrade head            # create tables
python -m app.services.ingest   # build the knowledge base
uvicorn app.main:app --reload   # http://localhost:8000
```

**Frontend**

```bash
cd web
npm install
cp .env.local.example .env.local   # point NEXT_PUBLIC_API_BASE at the backend
npm run dev                          # http://localhost:3000
```

See `backend/README.md` and `web/README.md` for details.

## Testing

```bash
cd backend && python -m pytest      # backend contract + tool tests
cd web && npm run build             # typecheck, lint, production build
```

Continuous integration runs both on every pull request.
