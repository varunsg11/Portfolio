"use client";

import { useEffect, useRef } from "react";

const WORDS = [
  "LLM", "RAG", "AI", "MCP", "GPU", "API",
  "def", "async", "await", "import", "return",
  "agent", "model", "embed", "token", "vector",
  "01", "10", "11", "00", "if", "else", "true",
  "SAP", "vsg", "py", "ts", "fn", "=>", "[]",
  "{}","</>", "null", "void", "new", "class",
];

export default function MatrixRain() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;

    function resize() {
      if (!canvas) return;
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    }

    resize();
    window.addEventListener("resize", resize);

    const fontSize = 13;
    const cols = Math.floor(canvas.width / (fontSize * 2.2));

    type Drop = {
      x: number;
      y: number;
      speed: number;
      word: string;
      opacity: number;
      fadeDir: number;
    };

    const drops: Drop[] = Array.from({ length: cols }, (_, i) => ({
      x: i * (canvas.width / cols),
      y: Math.random() * -canvas.height,
      speed: 0.6 + Math.random() * 1.2,
      word: WORDS[Math.floor(Math.random() * WORDS.length)],
      opacity: 0.08 + Math.random() * 0.25,
      fadeDir: 1,
    }));

    function draw() {
      if (!canvas || !ctx) return;

      // semi-transparent clear for trail effect
      ctx.fillStyle = "rgba(10, 10, 10, 0.18)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.font = `600 ${fontSize}px "SF Mono", "Fira Code", monospace`;

      drops.forEach((drop) => {
        // glow for the leading character
        const alpha = Math.min(drop.opacity, 1);
        ctx.shadowBlur = 8;
        ctx.shadowColor = `rgba(249, 115, 22, ${alpha * 0.8})`;
        ctx.fillStyle = `rgba(249, 115, 22, ${alpha})`;
        ctx.fillText(drop.word, drop.x, drop.y);

        // dim trailing ghost
        ctx.shadowBlur = 0;
        ctx.fillStyle = `rgba(249, 115, 22, ${alpha * 0.3})`;
        ctx.fillText(drop.word, drop.x, drop.y - fontSize * 2);

        drop.y += drop.speed;

        // occasionally shimmer opacity
        drop.opacity += 0.008 * drop.fadeDir;
        if (drop.opacity > 0.35 || drop.opacity < 0.05) drop.fadeDir *= -1;

        // reset when off screen
        if (drop.y > canvas.height + 40) {
          drop.y = -40;
          drop.x = Math.random() * canvas.width;
          drop.speed = 0.6 + Math.random() * 1.2;
          drop.word = WORDS[Math.floor(Math.random() * WORDS.length)];
          drop.opacity = 0.08 + Math.random() * 0.2;
        }
      });

      animId = requestAnimationFrame(draw);
    }

    draw();

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animId);
    };
  }, []);

  return <canvas ref={canvasRef} className="matrix-canvas" aria-hidden="true" />;
}
