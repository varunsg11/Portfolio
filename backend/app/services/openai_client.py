"""OpenAI client wrapper: embeddings, chat streaming, and moderation.

Kept thin and in one place so provider details don't leak into routers.
"""

from collections.abc import Iterator

from openai import OpenAI

from app.config import settings

_client: OpenAI | None = None


def get_client() -> OpenAI:
    global _client
    if _client is None:
        if not settings.openai_api_key:
            raise RuntimeError("OPENAI_API_KEY is not configured")
        _client = OpenAI(api_key=settings.openai_api_key)
    return _client


def embed(text: str) -> list[float]:
    """Embed a single string into a 1536-dim vector."""
    resp = get_client().embeddings.create(
        model=settings.embedding_model,
        input=text,
    )
    return resp.data[0].embedding


def embed_batch(texts: list[str]) -> list[list[float]]:
    """Embed many strings in one API call (used by the ingestion pipeline)."""
    resp = get_client().embeddings.create(
        model=settings.embedding_model,
        input=texts,
    )
    # API preserves input order.
    return [d.embedding for d in resp.data]


def is_flagged(text: str) -> bool:
    """Return True if OpenAI moderation flags the input. Fails open (False) on error."""
    try:
        resp = get_client().moderations.create(
            model="omni-moderation-latest", input=text
        )
        return bool(resp.results[0].flagged)
    except Exception:
        return False


def stream_chat(system: str, user: str) -> Iterator[str]:
    """Yield answer tokens from the chat model as they arrive."""
    stream = get_client().chat.completions.create(
        model=settings.chat_model,
        messages=[
            {"role": "system", "content": system},
            {"role": "user", "content": user},
        ],
        stream=True,
        temperature=0.3,
    )
    for chunk in stream:
        delta = chunk.choices[0].delta.content
        if delta:
            yield delta


def stream_agent(system: str, user: str, tools: list[dict], dispatch) -> Iterator[str]:
    """Agentic loop: let the model call tools, then stream the final answer.

    `tools` are OpenAI tool schemas; `dispatch(name, args) -> dict` runs a tool.
    Runs a non-streaming pass first to resolve any tool calls (up to a few
    rounds), then streams the model's final grounded reply.
    """
    import json

    client = get_client()
    messages: list[dict] = [
        {"role": "system", "content": system},
        {"role": "user", "content": user},
    ]

    # Resolve tool calls (bounded to avoid loops).
    for _ in range(4):
        resp = client.chat.completions.create(
            model=settings.chat_model,
            messages=messages,
            tools=tools,
            tool_choice="auto",
            temperature=0.3,
        )
        msg = resp.choices[0].message
        if not msg.tool_calls:
            # No tools needed — if there's already text, emit and stop.
            if msg.content:
                yield msg.content
                return
            break

        # Record the assistant's tool-call turn, then each tool result.
        messages.append(
            {
                "role": "assistant",
                "content": msg.content or "",
                "tool_calls": [
                    {
                        "id": tc.id,
                        "type": "function",
                        "function": {"name": tc.function.name, "arguments": tc.function.arguments},
                    }
                    for tc in msg.tool_calls
                ],
            }
        )
        for tc in msg.tool_calls:
            try:
                args = json.loads(tc.function.arguments or "{}")
            except json.JSONDecodeError:
                args = {}
            result = dispatch(tc.function.name, args)
            messages.append(
                {"role": "tool", "tool_call_id": tc.id, "content": json.dumps(result)}
            )

    # Final streamed answer with all tool context in the message history.
    stream = client.chat.completions.create(
        model=settings.chat_model,
        messages=messages,
        stream=True,
        temperature=0.3,
    )
    for chunk in stream:
        delta = chunk.choices[0].delta.content
        if delta:
            yield delta
