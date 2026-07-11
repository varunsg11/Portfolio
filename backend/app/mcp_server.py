"""MCP (Model Context Protocol) server exposing Varun's portfolio tools.

Runs as a standalone stdio MCP server so any MCP client (Claude Desktop, IDEs,
other agents) can query Varun's portfolio. Reuses the exact same tool registry
as the website chatbot (app/services/tools.py) — one source of truth.

Run:  python -m app.mcp_server
Register in an MCP client (e.g. Claude Desktop) by pointing it at that command.
"""

from __future__ import annotations

from mcp.server.fastmcp import FastMCP

from app.services import tools

mcp = FastMCP("varun-portfolio")


@mcp.tool()
def get_projects() -> dict:
    """List Varun Sadashive Gowda's notable projects with summaries and tech tags."""
    return tools.get_projects()


@mcp.tool()
def check_availability() -> dict:
    """Get Varun's current availability for internships/roles (timing, focus areas)."""
    return tools.check_availability()


@mcp.tool()
def get_github_stats() -> dict:
    """Fetch Varun's live public GitHub stats (repo count, followers, profile URL)."""
    return tools.get_github_stats()


@mcp.tool()
def request_intro(name: str, email: str, message: str) -> dict:
    """Send Varun an introduction on the visitor's behalf (name, email, message required)."""
    return tools.request_intro(name=name, email=email, message=message)


if __name__ == "__main__":
    mcp.run()
