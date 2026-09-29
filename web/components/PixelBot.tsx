import type { ReactNode } from "react";

/*
 * V_Clanker, drawn as a 22×31 pixel sprite. One character per pixel:
 *   A light metal   B mid metal   C shadow metal   K visor
 *   E ember         G hot ember   S chest screen   . empty
 * The chest screen (cols 7–14, rows 18–22) idles on a heartbeat trace; while
 * the agent answers, a live wave is laid over it through `screen`.
 */
const SPRITE = [
  "..........EG..........",
  "..........EE..........",
  "..........BB..........",
  ".......BBBBBBBB.......",
  ".....BAAAAAAAAAAB.....",
  "....BAAAAAAAAAAAAB....",
  "....BAKKKKKKKKKKAB....",
  "...CBAKKKKKKKKKKABC...",
  "...CBAKEEKKKKEEKABC...",
  "...CBAKGEKKKKGEKABC...",
  "...CBAKKKKKKKKKKABC...",
  "....BAKKEKKKKEKKAB....",
  "....BAKKKEEEEKKKAB....",
  "....BBAAAAAAAAAABB....",
  ".....CBBBBBBBBBBC.....",
  "........CBBBBC........",
  "..BBBBBBBBBBBBBBBBBB..",
  "..BA.CAAAAAAAAAAC.AB..",
  "..BA.CASSSSSSSSAC.AB..",
  "..BA.CASSSESSSSAC.AB..",
  "..BA.CAEEESSEEEAC.AB..",
  "..BA.CASSSSESSSAC.AB..",
  "..BA.CASSSSSSSSAC.AB..",
  "..BA.CAAAAAAAAAAC.AB..",
  "..EE.CBBBBEEBBBBC.EE..",
  ".....CBBBBBBBBBBC.....",
  ".....CBBBC..CBBBC.....",
  ".....CBBBC..CBBBC.....",
  ".....CBBBC..CBBBC.....",
  "....CCBBBC..CBBBCC....",
  "....AAAAAC..CAAAAA....",
];

const COLS = 22;
const ROWS = SPRITE.length;
const HEAD_ROWS = 16;
const SCREEN = { x: 7, y: 18, w: 8, h: 5 };

const FILL: Record<string, string> = {
  A: "#5c5c5c",
  B: "#3d3d3d",
  C: "#262626",
  K: "#0d0d0d",
  E: "var(--accent)",
  G: "#fed7aa",
  S: "#050505",
};

// Merge horizontal runs of one colour into a single rect.
function runs(rows: string[]) {
  const out: { x: number; y: number; w: number; c: string }[] = [];
  rows.forEach((row, y) => {
    let x = 0;
    while (x < row.length) {
      const c = row[x];
      let w = 1;
      while (row[x + w] === c) w++;
      if (c !== ".") out.push({ x, y, w, c });
      x += w;
    }
  });
  return out;
}

const BODY = runs(SPRITE);
const HEAD = runs(SPRITE.slice(0, HEAD_ROWS));

/** The full bot at `scale` px per sprite pixel, with an optional chest overlay. */
export function PixelBot({ scale, screen }: { scale: number; screen?: ReactNode }) {
  return (
    <span className="pixel-bot" style={{ width: COLS * scale, height: ROWS * scale }}>
      <svg
        viewBox={`0 0 ${COLS} ${ROWS}`}
        width={COLS * scale}
        height={ROWS * scale}
        shapeRendering="crispEdges"
        aria-hidden="true"
      >
        {BODY.map((r) => (
          <rect key={`${r.x}-${r.y}`} x={r.x} y={r.y} width={r.w} height={1} fill={FILL[r.c]} className={`px-${r.c}`} />
        ))}
      </svg>
      {screen && (
        <span
          className="pixel-bot-screen"
          style={{ left: SCREEN.x * scale, top: SCREEN.y * scale, width: SCREEN.w * scale, height: SCREEN.h * scale }}
        >
          {screen}
        </span>
      )}
    </span>
  );
}

/** Chest-screen size in px at a given scale, for sizing the overlay's content. */
export function pixelBotScreen(scale: number) {
  return { width: SCREEN.w * scale, height: SCREEN.h * scale };
}

/** Just the head, cropped square, for avatars and the launcher. */
export function PixelBotHead({ size }: { size: number }) {
  return (
    <svg
      className="pixel-bot-head"
      viewBox={`3 0 16 ${HEAD_ROWS}`}
      width={size}
      height={size}
      shapeRendering="crispEdges"
      aria-hidden="true"
    >
      {HEAD.map((r) => (
        <rect key={`${r.x}-${r.y}`} x={r.x} y={r.y} width={r.w} height={1} fill={FILL[r.c]} className={`px-${r.c}`} />
      ))}
    </svg>
  );
}
