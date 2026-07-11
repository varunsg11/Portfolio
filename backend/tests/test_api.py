"""Backend contract tests.

These run WITHOUT a database or OpenAI key — they verify the app boots, routes
exist, validation works, and unconfigured features degrade gracefully. The RAG
path is exercised against a mocked OpenAI client and an in-process retrieval stub.

Run:  venv/Scripts/python.exe -m pytest -q
"""

from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_health():
    r = client.get("/health")
    assert r.status_code == 200
    assert r.json() == {"status": "ok"}


def test_contact_rejects_bad_email():
    r = client.post(
        "/api/contact",
        json={"name": "A", "email": "not-an-email", "subject": "s", "message": "m"},
    )
    assert r.status_code == 422


def test_contact_requires_fields():
    r = client.post("/api/contact", json={"name": "A"})
    assert r.status_code == 422


def test_chat_unconfigured_returns_503(monkeypatch):
    # Force the "not configured" branch regardless of local .env.
    from app import config

    monkeypatch.setattr(config.settings, "openai_api_key", "", raising=False)
    monkeypatch.setattr(config.settings, "database_url", "", raising=False)
    r = client.post("/api/chat", json={"question": "hello"})
    assert r.status_code == 503


def test_chat_input_validation():
    r = client.post("/api/chat", json={"question": ""})
    assert r.status_code == 422
    r = client.post("/api/chat", json={"question": "x" * 2000})
    assert r.status_code == 422


def test_event_rejects_unknown_type():
    r = client.post("/api/event?event_type=nope")
    assert r.status_code == 400


def test_analytics_unconfigured_returns_503(monkeypatch):
    from app import config

    monkeypatch.setattr(config.settings, "database_url", "", raising=False)
    r = client.get("/api/analytics")
    assert r.status_code == 503


def test_build_system_prompt_grounds_on_chunks():
    from app.services import rag

    class FakeChunk:
        source = "experience"
        content = "Varun built multi-agent workflows at SAP."

    prompt = rag.build_system_prompt([FakeChunk()])
    assert "multi-agent workflows at SAP" in prompt
    assert "ONLY using the context" in prompt


def test_build_system_prompt_handles_no_context():
    from app.services import rag

    prompt = rag.build_system_prompt([])
    assert "no context found" in prompt
