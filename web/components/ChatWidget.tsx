"use client";

import { useEffect, useRef, useState } from "react";
import { API_BASE } from "@/lib/config";

type Message = { role: "user" | "assistant"; content: string };

const STARTERS = [
  "What did Varun build at SAP?",
  "Available for Summer 2027?",
  "Tell me about his RAG experience",
  "What are his strongest skills?",
];

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const bodyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bodyRef.current?.scrollTo({ top: bodyRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, open]);

  useEffect(() => {
    if (!open) return;
    fetch(`${API_BASE}/api/event?event_type=chat_open`, { method: "POST" }).catch(() => {});
    fetch(`${API_BASE}/health`).catch(() => {});
  }, [open]);

  async function send(question: string) {
    const q = question.trim();
    if (!q || streaming) return;

    fetch(`${API_BASE}/api/event?event_type=question_asked&detail=${encodeURIComponent(q)}`, { method: "POST" }).catch(() => {});
    setInput("");
    setMessages((m) => [...m, { role: "user", content: q }, { role: "assistant", content: "" }]);
    setStreaming(true);

    const setAssistant = (content: string) =>
      setMessages((m) => {
        const copy = [...m];
        copy[copy.length - 1] = { role: "assistant", content };
        return copy;
      });
    const appendAssistant = (token: string) =>
      setMessages((m) => {
        const copy = [...m];
        copy[copy.length - 1] = { role: "assistant", content: copy[copy.length - 1].content + token };
        return copy;
      });

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
          const data = JSON.parse(line);
          if (data.token) {
            if (!got) setAssistant("");
            got = true;
            appendAssistant(data.token);
          } else if (data.error) {
            throw new Error(data.error);
          }
        }
      }
      return got;
    }

    try {
      await attempt();
    } catch {
      setAssistant("Waking up the server… one moment.");
      await new Promise((r) => setTimeout(r, 4000));
      try {
        const ok = await attempt();
        if (!ok) throw new Error("empty");
      } catch {
        setAssistant("Sorry — I couldn't answer that right now. Please email varunsg118@gmail.com.");
      }
    } finally {
      setStreaming(false);
    }
  }

  return (
    <>
      <button
        className={`chat-launcher${open ? " open" : ""}`}
        aria-label={open ? "Close chat" : "Ask about Varun"}
        onClick={() => setOpen((o) => !o)}
      >
        <i className={`fas ${open ? "fa-xmark" : "fa-comment-dots"}`}></i>
        {!open && <span className="chat-launcher-label">Ask about Varun</span>}
      </button>

      {open && (
        <div className="chat-panel">
          <div className="chat-header">
            <div className="chat-header-left">
              <div className="chat-avatar">
                <i className="fas fa-bolt"></i>
              </div>
              <div className="chat-header-text">
                <strong>Ask about Varun</strong>
                <span>Online · RAG-powered</span>
              </div>
            </div>
            <button aria-label="Close" onClick={() => setOpen(false)}>
              <i className="fas fa-xmark"></i>
            </button>
          </div>

          <div className="chat-body" ref={bodyRef}>
            {messages.length === 0 && (
              <div className="chat-intro">
                <div className="chat-intro-msg">
                  <div className="chat-intro-icon">
                    <i className="fas fa-bolt"></i>
                  </div>
                  <p>
                    Hi! I can answer questions about Varun&apos;s experience, skills, and background. Try one:
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
            {messages.map((m, i) => (
              <div key={i} className={`chat-msg chat-msg-${m.role}`}>
                {m.content || <span className="chat-typing">•••</span>}
              </div>
            ))}
          </div>

          <form
            className="chat-input"
            onSubmit={(e) => { e.preventDefault(); send(input); }}
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask anything about Varun…"
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
