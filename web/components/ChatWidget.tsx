"use client";

import { useEffect, useRef, useState } from "react";
import { API_BASE } from "@/lib/config";
import { profile } from "@/lib/content";
import { PixelBotHead } from "./PixelBot";
import ThinkingWave from "./ThinkingWave";

/** `status` marks a placeholder line (e.g. the cold-start notice), not answer text. */
type Message = { role: "user" | "assistant"; content: string; error?: boolean; status?: boolean };
type Health = "checking" | "online" | "offline";

const STARTERS = [
  "What did Varun build at SAP?",
  "Available for Summer 2027?",
  "Tell me about his RAG experience",
  "What are his strongest skills?",
];

/**
 * Backoff between retries, in ms. The backend runs on a Render free instance
 * whose cold start routinely takes 30–60s, so the wait has to be able to outlast
 * that — a single fixed 4s retry gives up roughly 26 seconds too early.
 */
const RETRY_BACKOFF_MS = [3000, 6000, 10000, 15000, 20000];
/** Hard ceiling on the whole ask, retries included. */
const RETRY_BUDGET_MS = 60000;

type StreamHandlers = {
  /** Replaces the trailing assistant message wholesale. */
  setAssistant: (content: string, error?: boolean) => void;
  /** Shows a progress line in the trailing assistant message until tokens arrive. */
  setStatus: (content: string) => void;
  /** Appends a token to the trailing assistant message. */
  appendAssistant: (token: string) => void;
  setHealth: (health: Health) => void;
};

/**
 * Streams one answer into the trailing (placeholder) assistant message,
 * retrying with growing backoff while the backend cold-starts. The caller must
 * have already appended the user message and an empty assistant message.
 *
 * Lives outside the component so it never runs as render-phase code.
 */
async function streamAnswer(q: string, h: StreamHandlers) {
  const startedAt = Date.now();
  // True once any token has landed on screen. Nothing after that point may
  // overwrite the partial answer with a status or error string.
  let streamed = false;

  async function attempt(): Promise<boolean> {
    const res = await fetch(`${API_BASE}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question: q }),
    });
    if (!res.ok || !res.body) throw new Error("bad response");

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    let got = false;

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const events = buffer.split("\n\n");
      buffer = events.pop() ?? "";
      for (const evt of events) {
        const line = evt.replace(/^data:\s*/, "").trim();
        if (!line) continue;
        let data: { token?: string; error?: string };
        try {
          data = JSON.parse(line);
        } catch {
          // A single malformed frame must not tear down the read loop and throw
          // away tokens that already arrived. Skip it and keep reading.
          continue;
        }
        if (data.token) {
          if (!got) h.setAssistant("");
          got = true;
          streamed = true;
          h.appendAssistant(data.token);
        } else if (data.error) {
          throw new Error(data.error);
        }
      }
    }
    return got;
  }

  /** Waits `ms`, keeping the elapsed-time counter in the wake message live. */
  function waitAndTick(ms: number) {
    return new Promise<void>((resolve) => {
      const tick = () => {
        const secs = Math.round((Date.now() - startedAt) / 1000);
        h.setStatus(
          `Waking up the server… ${secs}s elapsed. A free-tier cold start can take up to a minute.`
        );
      };
      tick();
      const ticker = setInterval(tick, 1000);
      setTimeout(() => {
        clearInterval(ticker);
        resolve();
      }, ms);
    });
  }

  for (let i = 0; ; i++) {
    try {
      const got = await attempt();
      // A completed stream that produced zero tokens is a failure, not a
      // success: without this the "•••" placeholder would stand forever.
      if (!got) throw new Error("empty");
      h.setHealth("online");
      return;
    } catch {
      // Something already reached the user — keep it rather than replacing a
      // real (if truncated) answer with a status message.
      if (streamed) return;
    }

    if (i >= RETRY_BACKOFF_MS.length) break;
    const delay = RETRY_BACKOFF_MS[i];
    if (Date.now() - startedAt + delay >= RETRY_BUDGET_MS) break;
    await waitAndTick(delay);
  }

  h.setHealth("offline");
  h.setAssistant("Sorry — I couldn't answer that right now.", true);
}

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [health, setHealth] = useState<Health>("checking");
  const bodyRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const launcherRef = useRef<HTMLButtonElement>(null);
  const openerRef = useRef<HTMLElement | null>(null);
  const lastQuestion = useRef("");
  const wasOpen = useRef(false);
  const [heroInView, setHeroInView] = useState(true);

  useEffect(() => {
    bodyRef.current?.scrollTo({ top: bodyRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, open]);

  // Probe the backend when the panel opens: warms the cold start *and* tells us
  // what to put in the header instead of an unconditional "Online".
  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    fetch(`${API_BASE}/api/event?event_type=chat_open`, { method: "POST" }).catch(() => {});
    fetch(`${API_BASE}/health`)
      .then((res) => { if (!cancelled) setHealth(res.ok ? "online" : "offline"); })
      .catch(() => { if (!cancelled) setHealth("offline"); });
    return () => { cancelled = true; };
  }, [open]);

  // Remember what opened the panel (the launcher or the hero's V_Clanker) so
  // focus can go back there on close. Must run before the input steals focus.
  useEffect(() => {
    if (!wasOpen.current && open) openerRef.current = document.activeElement as HTMLElement | null;
    if (wasOpen.current && !open) {
      const opener = openerRef.current;
      (opener?.isConnected && opener.offsetParent !== null ? opener : launcherRef.current)?.focus();
    }
    wasOpen.current = open;
  }, [open]);

  // Dialog behaviour: focus the input on open, Escape closes, focus returns to
  // the launcher on close.
  useEffect(() => {
    if (!open) return;
    inputRef.current?.focus();
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open]);

  // Other sections can open the assistant with `vsg-open-chat`.
  useEffect(() => {
    const openChat = () => setOpen(true);
    window.addEventListener("vsg-open-chat", openChat);
    return () => window.removeEventListener("vsg-open-chat", openChat);
  }, []);

  // The hero's V_Clanker mirrors what the assistant is doing.
  useEffect(() => {
    window.dispatchEvent(new CustomEvent("vsg-chat-state", { detail: { open, thinking: streaming } }));
  }, [open, streaming]);

  // While the hero is on screen, its V_Clanker is the way in; the floating
  // launcher only takes over once the visitor scrolls past it.
  useEffect(() => {
    const hero = document.getElementById("home");
    if (!hero) return;
    const io = new IntersectionObserver(([e]) => setHeroInView(e.isIntersecting), { threshold: 0.35 });
    io.observe(hero);
    return () => io.disconnect();
  }, []);

  const setAssistant = (content: string, error = false) =>
    setMessages((m) => {
      const copy = [...m];
      copy[copy.length - 1] = { role: "assistant", content, error };
      return copy;
    });
  const setStatus = (content: string) =>
    setMessages((m) => {
      const copy = [...m];
      copy[copy.length - 1] = { role: "assistant", content, status: true };
      return copy;
    });
  const appendAssistant = (token: string) =>
    setMessages((m) => {
      const copy = [...m];
      copy[copy.length - 1] = { role: "assistant", content: copy[copy.length - 1].content + token };
      return copy;
    });

  async function run(q: string) {
    setStreaming(true);
    try {
      await streamAnswer(q, { setAssistant, setStatus, appendAssistant, setHealth });
    } finally {
      setStreaming(false);
    }
  }

  function send(question: string) {
    const q = question.trim();
    if (!q || streaming) return;

    fetch(`${API_BASE}/api/event?event_type=question_asked&detail=${encodeURIComponent(q)}`, { method: "POST" }).catch(() => {});
    lastQuestion.current = q;
    setInput("");
    setMessages((m) => [...m, { role: "user", content: q }, { role: "assistant", content: "" }]);
    void run(q);
  }

  /** Re-asks the last question in place, reusing its existing bubbles. */
  function retry() {
    const q = lastQuestion.current;
    if (!q || streaming) return;
    setAssistant("");
    void run(q);
  }

  const healthLabel =
    health === "online"
      ? "Online · RAG-powered"
      : health === "offline"
        ? "Waking up · first reply may be slow"
        : "Connecting… · RAG-powered";

  return (
    <>
      <button
        ref={launcherRef}
        className={`chat-launcher${open ? " open" : ""}${heroInView && !open ? " is-hidden" : ""}`}
        aria-label={open ? "Close chat" : "Ask V_Clanker about Varun"}
        aria-expanded={open}
        aria-controls="chat-panel"
        onClick={() => setOpen((o) => !o)}
      >
        {open ? <i className="fas fa-xmark"></i> : <PixelBotHead size={24} />}
        {!open && <span className="chat-launcher-label">Ask V_Clanker</span>}
      </button>

      {open && (
        <div
          className="chat-panel"
          id="chat-panel"
          role="dialog"
          aria-modal="true"
          aria-labelledby="chat-panel-title"
        >
          <div className="chat-header">
            <div className="chat-header-left">
              <div className="chat-avatar">
                <PixelBotHead size={26} />
              </div>
              <div className="chat-header-text">
                <strong id="chat-panel-title">V_Clanker</strong>
                <span>
                  <span
                    className={`status-dot${health === "online" ? "" : health === "offline" ? " is-offline" : " is-checking"}`}
                    aria-hidden="true"
                  ></span>
                  {healthLabel}
                </span>
              </div>
            </div>
            <button aria-label="Close" onClick={() => setOpen(false)}>
              <i className="fas fa-xmark"></i>
            </button>
          </div>

          <div className="chat-body" ref={bodyRef} data-lenis-prevent role="log" aria-live="polite">
            {messages.length === 0 && (
              <div className="chat-intro">
                <div className="chat-intro-msg">
                  <div className="chat-intro-icon">
                    <PixelBotHead size={24} />
                  </div>
                  <p>
                    Hi, I&apos;m V_Clanker. I can answer questions about Varun&apos;s experience, skills, and background. Try one:
                  </p>
                </div>
                <div className="chat-starters">
                  {STARTERS.map((s) => (
                    <button key={s} onClick={() => send(s)}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {messages.map((m, i) => {
              const thinking = m.role === "assistant" && !m.error && (m.status || !m.content);
              return (
              <div key={i} className={`chat-msg chat-msg-${m.role}${thinking ? " is-thinking" : ""}`}>
                {thinking ? (
                  <>
                    <ThinkingWave width={96} height={30} />
                    {/* The cold-start notice is worth reading; the plain wait is not. */}
                    {m.status ? (
                      <span className="chat-thinking-status">{m.content}</span>
                    ) : (
                      <span className="sr-only">V_Clanker is thinking…</span>
                    )}
                  </>
                ) : (
                  m.content
                )}
                {m.error && (
                  <div className="chat-msg-actions">
                    <button type="button" onClick={retry} disabled={streaming}>
                      <i className="fas fa-rotate-right"></i> Retry
                    </button>
                    <a href={`mailto:${profile.email}`}>
                      <i className="fas fa-envelope"></i> {profile.email}
                    </a>
                  </div>
                )}
              </div>
              );
            })}
          </div>

          <form
            className="chat-input"
            onSubmit={(e) => { e.preventDefault(); send(input); }}
          >
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask anything about Varun…"
              aria-label="Ask anything about Varun"
              maxLength={1000}
              disabled={streaming}
            />
            <button type="submit" className="chat-send-btn" disabled={streaming || !input.trim()} aria-label="Send">
              <i className="fas fa-paper-plane"></i>
            </button>
          </form>
        </div>
      )}
    </>
  );
}
