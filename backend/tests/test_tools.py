"""Tests for the agentic chatbot tools. Run without a database or OpenAI key."""

from app.services import tools


def test_registry_has_expected_tools():
    assert set(tools.TOOLS) == {
        "get_projects",
        "check_availability",
        "get_github_stats",
        "request_intro",
    }


def test_tool_schemas_are_wellformed():
    for schema in tools.tool_schemas():
        assert schema["type"] == "function"
        fn = schema["function"]
        assert "name" in fn and "description" in fn
        assert fn["parameters"]["type"] == "object"


def test_get_projects_returns_list():
    result = tools.get_projects()
    assert "projects" in result
    assert len(result["projects"]) >= 1
    assert "title" in result["projects"][0]


def test_check_availability_shape():
    result = tools.check_availability()
    assert result["start"] == "Summer 2027"
    assert "AI" in result["roles"]


def test_dispatch_unknown_tool():
    result = tools.dispatch("does_not_exist", {})
    assert "error" in result


def test_dispatch_runs_known_tool():
    result = tools.dispatch("get_projects", {})
    assert "projects" in result


def test_get_github_stats_handles_offline(monkeypatch):
    # Force the network call to fail; tool should return a structured error, not raise.
    import urllib.request

    def boom(*a, **k):
        raise OSError("no network")

    monkeypatch.setattr(urllib.request, "urlopen", boom)
    result = tools.get_github_stats()
    assert "error" in result


def test_request_intro_validates_email():
    result = tools.request_intro(name="A", email="not-an-email", message="hi")
    assert result["ok"] is False
    assert "error" in result
