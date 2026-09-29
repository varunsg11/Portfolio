"use client";

import { useReducedMotion } from "framer-motion";
import { SiriWave } from "@/components/ui/siri-wave";

/**
 * V_Clanker's "working on an answer" signal: the Siri wave shader on a wide
 * canvas, so the wave runs the full strip and tapers off at both ends. Under
 * reduced motion it becomes a still ember line.
 */
export default function ThinkingWave({ width, height }: { width: number; height: number }) {
  const reduce = useReducedMotion();
  return (
    <span className="thinking-wave" style={{ width, height }} aria-hidden="true">
      {reduce ? (
        <span className="thinking-wave-still" />
      ) : (
        <SiriWave variant="wave" size={width} height={height} renderScale={2} className="rounded-none" />
      )}
    </span>
  );
}
