"""Agentic tools the chatbot can call.

Each tool is a plain Python function plus an OpenAI tool schema. The chat model
decides when to call them; `dispatch` runs the chosen one and returns a JSON-able
result that gets fed back to the model.

This mirrors Varun's day-job work (custom agent tools + MCP servers) and is the
same registry exposed over MCP in app/mcp_server.py.
"""

from __future__ import annotations

import json
import urllib.request

from app.config import settings

GITHUB_USER = "varunsg11"

# ── Static facts (kept in sync with the frontend lib/content.ts) ──
PROJECTS = [
    {
        "title": "Multi-Agent Support Workflows (SAP)",
        "summary": "CrewAI + LangGraph agents that cut support engineers' effort by 30%.",
        "tags": ["CrewAI", "LangGraph", "Python"],
    },
    {
        "title": "Databricks RAG Pipeline (SAP)",
        "summary": "Ingests enterprise docs, semantic chunking, embeddings indexed in SAP HANA DB.",
        "tags": ["RAG", "Databricks", "SAP HANA"],
    },
    {
        "title": "MCP Server (SAP)",
        "summary": "Model Context Protocol server integrating the CLOKS warehouse and AIM agents.",
        "tags": ["MCP", "Python"],
    },
    {
        "title": "Media Player Control by Hand Gestures",
        "summary": "Real-time gesture control (Play/Pause/Skip/Volume) with OpenCV + VLC.",
        "tags": ["Python", "OpenCV", "Computer Vision"],
    },
]

AVAILABILITY = {
    "status": "Seeking Summer 2027 internships",
    "roles": ["AI", "ML", "Software Engineering"],
    "start": "Summer 2027",
    "context": "Incoming MCS student at Texas A&M University (Fall 2026).",
    "contact": "varunsg118@gmail.com",
}


# ── Tool implementations ──
def get_projects() -> dict:
    """Return Varun's notable projects."""
    return {"projects": PROJECTS}


def check_availability() -> dict:
    """Return Varun's current availability for internships/roles."""
    return AVAILABILITY


def get_github_stats() -> dict:
    """Fetch live public GitHub stats for Varun's account."""
    try:
        req = urllib.request.Request(
            f"https://api.github.com/users/{GITHUB_USER}",
            headers={"User-Agent": "portfolio-bot", "Accept": "application/vnd.github+json"},
        )
        with urllib.request.urlopen(req, timeout=6) as resp:
            data = json.loads(resp.read())
        return {
            "username": data.get("login"),
            "public_repos": data.get("public_repos"),
            "followers": data.get("followers"),
            "profile": data.get("html_url"),
            "bio": data.get("bio"),
        }
    except Exception as e:
        return {"error": f"Could not fetch GitHub stats: {e}"}


def request_intro(name: str, email: str, message: str) -> dict:
    """Route an introduction request into the contact pipeline (email + DB)."""
    from app.schemas import ContactForm
    from app.services.email import send_contact_email

    try:
        form = ContactForm(
            name=name, email=email, subject="Intro via AI assistant", message=message
        )
    except Exception as e:
        return {"ok": False, "error": f"Invalid details: {e}"}

    sent = False
    try:
        send_contact_email(form)
        sent = True
    except Exception:
        pass

    # Best-effort persistence (same pattern as the contact router).
    from app.db import db_available

    if db_available():
        try:
            from app.db import get_db
            from app.models import ContactSubmission

            db = next(get_db())
            try:
                db.add(
                    ContactSubmission(
                        name=form.name, email=form.email, subject=form.subject,
                        message=form.message, email_sent=sent,
                    )
                )
                db.commit()
            finally:
                db.close()
        except Exception:
            pass

    return {"ok": sent or db_available(), "email_sent": sent}


# ── Registry: name -> (callable, OpenAI schema) ──
TOOLS = {
    "get_projects": {
        "fn": get_projects,
        "schema": {
            "type": "function",
            "function": {
                "name": "get_projects",
                "description": "Get a list of Varun's notable projects with summaries and tech tags.",
                "parameters": {"type": "object", "properties": {}, "required": []},
            },
        },
    },
    "check_availability": {
        "fn": check_availability,
        "schema": {
            "type": "function",
            "function": {
                "name": "check_availability",
                "description": "Get Varun's current availability for internships or roles (timing, focus areas).",
                "parameters": {"type": "object", "properties": {}, "required": []},
            },
        },
    },
    "get_github_stats": {
        "fn": get_github_stats,
        "schema": {
            "type": "function",
            "function": {
                "name": "get_github_stats",
                "description": "Fetch Varun's live public GitHub stats (repo count, followers, profile URL).",
                "parameters": {"type": "object", "properties": {}, "required": []},
            },
        },
    },
    "request_intro": {
        "fn": request_intro,
        "schema": {
            "type": "function",
            "function": {
                "name": "request_intro",
                "description": (
                    "Send Varun an introduction/message on the visitor's behalf. Use ONLY when "
                    "the visitor explicitly wants to reach out and has given their name, email, "
                    "and a message."
                ),
                "parameters": {
                    "type": "object",
                    "properties": {
                        "name": {"type": "string", "description": "Visitor's name"},
                        "email": {"type": "string", "description": "Visitor's email"},
                        "message": {"type": "string", "description": "The message to Varun"},
                    },
                    "required": ["name", "email", "message"],
                },
            },
        },
    },
}


def tool_schemas() -> list[dict]:
    return [t["schema"] for t in TOOLS.values()]


def dispatch(name: str, arguments: dict) -> dict:
    """Run a tool by name with parsed arguments. Returns a JSON-able dict."""
    tool = TOOLS.get(name)
    if not tool:
        return {"error": f"Unknown tool: {name}"}
    try:
        return tool["fn"](**(arguments or {}))
    except TypeError as e:
        return {"error": f"Bad arguments for {name}: {e}"}
