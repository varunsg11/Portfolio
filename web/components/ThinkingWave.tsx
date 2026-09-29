"use client";

import { useReducedMotion } from "framer-motion";
import { SiriWave } from "@/components/ui/siri-wave";

/**
 * V_Clanker's "working on an answer" signal: the Siri wave shader, cropped
 * from its square canvas to a wide strip. The wave lives in the vertical
 * middle of the square, so cropping top and bottom keeps all of it. Under
 * reduced motion it becomes a still ember line.
 */
export default function ThinkingWave({ width, height }: { width: number; height: number }) {
  const reduce = useReducedMotion();
  return (
    <span className="thinking-wave" style={{ width, height }} aria-hidden="true">
      {reduce ? (
        <span className="thinking-wave-still" />
      ) : (
        <SiriWave
          variant="wave"
          size={width}
          renderScale={1}
          className="rounded-none"
          style={{ marginTop: (height - width) / 2 }}
        />
      )}
    </span>
  );
}
