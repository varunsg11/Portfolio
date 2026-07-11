# Portfolio Frontend — Next.js

The `varunsg.dev` portfolio, rebuilt from the original vanilla HTML/CSS/JS
(`../frontend/`) as a **Next.js 16 (App Router) + React + TypeScript** app.
Deploys to Vercel; talks to the FastAPI backend in `../backend/`.

## Structure

```
web/
├── app/
│   ├── layout.tsx        # Fonts (Inter), metadata/OG tags, Font Awesome
│   ├── page.tsx          # Assembles all sections; mounts fade-up observer
│   └── globals.css       # Design system (ported from ../frontend/style.css)
├── components/           # One component per section + Preloader/ScrollProgress/Typewriter
├── lib/
│   ├── content.ts        # Single source of truth for all content (also feeds the RAG chatbot)
│   ├── config.ts         # API_BASE (backend URL)
│   └── useFadeUp.ts      # Scroll-reveal hook (React port of the old IntersectionObserver)
└── .env.local.example    # Copy to .env.local for local dev
```

## Getting Started

```bash
npm install
cp .env.local.example .env.local   # point NEXT_PUBLIC_API_BASE at your backend
npm run dev                          # http://localhost:3000
```

To run against a local backend, set `NEXT_PUBLIC_API_BASE=http://localhost:8000`
in `.env.local` and start the FastAPI server (see `../backend`).

## Build

```bash
npm run build   # typecheck + lint + production build
```

## Editing content

All portfolio content (experience, skills, certs, projects, etc.) lives in
`lib/content.ts`. Edit there — the section components render from it, and the
RAG chatbot's knowledge base is built from the same data.

## Deploy

Vercel, root directory `web/`. Set `NEXT_PUBLIC_API_BASE` to the Render backend
URL in the Vercel project env vars.
