"use client";

import { useEffect, useState } from "react";
import { PixelBot, pixelBotScreen } from "./PixelBot";
import ThinkingWave from "./ThinkingWave";

const SCALE = 11;

/**
 * V_Clanker standing beside the hero. It opens the chat and mirrors what the
 * assistant is doing (ChatWidget broadcasts `vsg-chat-state`): idle, listening
 * while the panel is open, and a live wave on its chest while it answers.
 */
export default function HeroAgent() {
  const [state, setState] = useState({ open: false, thinking: false });

  useEffect(() => {
    const onState = (e: Event) => setState((e as CustomEvent<{ open: boolean; thinking: boolean }>).detail);
    window.addEventListener("vsg-chat-state", onState);
    return () => window.removeEventListener("vsg-chat-state", onState);
  }, []);

  const line = state.thinking
    ? "Digging through Varun's notes…"
    : state.open
      ? "Go on, I'm listening."
      : "Ask me anything about Varun.";
  const screen = pixelBotScreen(SCALE);

  return (
    <button
      type="button"
      className={`hero-agent${state.thinking ? " is-thinking" : ""}`}
      onClick={() => window.dispatchEvent(new Event("vsg-open-chat"))}
      aria-label="Ask V_Clanker, the AI assistant, about Varun"
    >
      <span className="hero-agent-bubble">
        <strong>V_Clanker</strong>
        <span>{line}</span>
      </span>
      <PixelBot
        scale={SCALE}
        screen={state.thinking ? <ThinkingWave width={screen.width} height={screen.height} /> : undefined}
      />
      <span className="hero-agent-floor" aria-hidden="true" />
    </button>
  );
}
