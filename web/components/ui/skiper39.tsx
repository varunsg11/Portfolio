"use client";

import { gsap } from "gsap";
import { useEffect, useRef } from "react";

interface CrowdCanvasProps {
  /** Sprite sheet of peeps laid out on a grid. */
  src: string;
  /** Peeps across the sheet (the original component calls this `rows`). */
  rows?: number;
  /** Peeps down the sheet. */
  cols?: number;
  /** Colour the sheet's white fills are mapped to. */
  fill?: string;
  /** Colour the sheet's black linework is mapped to — the page ground, so the
      strokes read as cuts through the figures rather than drawn lines. */
  ink?: string;
  className?: string;
}

type Peep = {
  sx: number;
  sy: number;
  sw: number;
  sh: number;
  width: number;
  height: number;
  x: number;
  y: number;
  anchorY: number;
  scaleX: number;
  depth: number;
  walk: gsap.core.Timeline | null;
};

const randomRange = (min: number, max: number) => min + Math.random() * (max - min);
const randomIndex = (array: unknown[]) => (randomRange(0, array.length) | 0);

function hexToRgb(hex: string): [number, number, number] {
  const n = parseInt(hex.replace("#", ""), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

/**
 * Recolours the sheet once, off-screen: each pixel's lightness picks a point
 * between `ink` (black line) and `fill` (white body), alpha untouched.
 */
function tintSheet(img: HTMLImageElement, fill: string, ink: string) {
  const sheet = document.createElement("canvas");
  sheet.width = img.naturalWidth;
  sheet.height = img.naturalHeight;
  const sctx = sheet.getContext("2d", { willReadFrequently: true });
  if (!sctx) return sheet;
  sctx.drawImage(img, 0, 0);
  const data = sctx.getImageData(0, 0, sheet.width, sheet.height);
  const px = data.data;
  const [fr, fg, fb] = hexToRgb(fill);
  const [ir, ig, ib] = hexToRgb(ink);
  for (let i = 0; i < px.length; i += 4) {
    if (px[i + 3] === 0) continue;
    const t = (px[i] + px[i + 1] + px[i + 2]) / 765;
    px[i] = ir + (fr - ir) * t;
    px[i + 1] = ig + (fg - ig) * t;
    px[i + 2] = ib + (fb - ib) * t;
  }
  sctx.putImageData(data, 0, 0);
  return sheet;
}

/**
 * A crowd of Open Peeps walking across a canvas, back to front. Adapted from
 * Skiper UI's Skiper39 for this site: night recolouring, depth dimming, size
 * that follows the canvas, a still frame under reduced motion, and no work
 * while offscreen.
 */
export function CrowdCanvas({
  src,
  rows = 15,
  cols = 7,
  fill = "#ffffff",
  ink = "#000000",
  className,
}: CrowdCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const stage = { width: 0, height: 0, scale: 1 };
    const allPeeps: Peep[] = [];
    const availablePeeps: Peep[] = [];
    const crowd: Peep[] = [];
    let sheet: HTMLCanvasElement | null = null;
    let running = false;
    let disposed = false;

    const resetPeep = (peep: Peep) => {
      const direction = Math.random() > 0.5 ? 1 : -1;
      // Range of vertical offsets; 0 = furthest back, 1 = nearest.
      const depth = gsap.parseEase("power2.in")(Math.random());
      const offsetY = (100 - 250 * depth) * stage.scale;
      peep.width = peep.sw * stage.scale;
      peep.height = peep.sh * stage.scale;
      peep.depth = 1 - depth;
      const startY = stage.height - peep.height + offsetY;
      let startX: number;
      let endX: number;
      if (direction === 1) {
        startX = -peep.width;
        endX = stage.width;
        peep.scaleX = 1;
      } else {
        startX = stage.width + peep.width;
        endX = 0;
        peep.scaleX = -1;
      }
      peep.x = startX;
      peep.y = startY;
      peep.anchorY = startY;
      return { startY, endX };
    };

    const walk = (peep: Peep, { startY, endX }: { startY: number; endX: number }) => {
      const xDuration = 10;
      const yDuration = 0.25;
      const tl = gsap.timeline({ paused: !running });
      tl.timeScale(randomRange(0.5, 1.5));
      tl.to(peep, { duration: xDuration, x: endX, ease: "none" }, 0);
      tl.to(
        peep,
        { duration: yDuration, repeat: xDuration / yDuration, yoyo: true, y: startY - 10 * stage.scale },
        0,
      );
      return tl;
    };

    const removePeepFromCrowd = (peep: Peep) => {
      crowd.splice(crowd.indexOf(peep), 1);
      availablePeeps.push(peep);
    };

    const addPeepToCrowd = (): Peep => {
      const peep = availablePeeps.splice(randomIndex(availablePeeps), 1)[0];
      peep.walk = walk(peep, resetPeep(peep)).eventCallback("onComplete", () => {
        removePeepFromCrowd(peep);
        addPeepToCrowd();
      });
      crowd.push(peep);
      crowd.sort((a, b) => a.anchorY - b.anchorY);
      return peep;
    };

    // Back rows sink into the night: each peep is shaded toward `ink` on a
    // scratch canvas first, so it stays opaque and hides the rows behind it.
    const scratch = document.createElement("canvas");
    const sctx = scratch.getContext("2d");

    const render = () => {
      if (!sheet || !sctx) return;
      const dpr = window.devicePixelRatio || 1;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (const peep of crowd) {
        const w = Math.ceil(peep.width * dpr);
        const h = Math.ceil(peep.height * dpr);
        sctx.globalCompositeOperation = "source-over";
        sctx.clearRect(0, 0, w, h);
        sctx.drawImage(sheet, peep.sx, peep.sy, peep.sw, peep.sh, 0, 0, w, h);
        const shade = 0.72 * (1 - peep.depth);
        if (shade > 0.02) {
          sctx.globalCompositeOperation = "source-atop";
          sctx.globalAlpha = shade;
          sctx.fillStyle = ink;
          sctx.fillRect(0, 0, w, h);
          sctx.globalAlpha = 1;
        }
        ctx.save();
        ctx.translate(peep.x * dpr, peep.y * dpr);
        ctx.scale(peep.scaleX, 1);
        ctx.drawImage(scratch, 0, 0, w, h, 0, 0, w, h);
        ctx.restore();
      }
    };

    const layout = () => {
      const dpr = window.devicePixelRatio || 1;
      stage.width = canvas.clientWidth;
      stage.height = canvas.clientHeight;
      // Peeps are 240×324 on the sheet: shrink them on short bands and narrow screens.
      stage.scale = Math.min(1, stage.height / 480, Math.max(0.5, stage.width / 1100));
      canvas.width = stage.width * dpr;
      canvas.height = stage.height * dpr;
      if (allPeeps[0]) {
        scratch.width = Math.ceil(allPeeps[0].sw * stage.scale * dpr);
        scratch.height = Math.ceil(allPeeps[0].sh * stage.scale * dpr);
      }

      crowd.forEach((peep) => peep.walk?.kill());
      crowd.length = 0;
      availablePeeps.length = 0;
      availablePeeps.push(...allPeeps);
      while (availablePeeps.length) addPeepToCrowd().walk?.progress(Math.random());
      render();
    };

    const setRunning = (next: boolean) => {
      if (reduceMotion || next === running) return;
      running = next;
      crowd.forEach((peep) => (next ? peep.walk?.resume() : peep.walk?.pause()));
      if (next) gsap.ticker.add(render);
      else gsap.ticker.remove(render);
    };

    // Only re-seed the crowd when the width changes: mobile URL-bar show/hide
    // changes the height on every scroll direction flip.
    let lastWidth = 0;
    const resizeObserver = new ResizeObserver(() => {
      if (!sheet || canvas.clientWidth === lastWidth) return;
      lastWidth = canvas.clientWidth;
      layout();
    });
    const visibility = new IntersectionObserver(([entry]) => setRunning(entry.isIntersecting));

    const img = new Image();
    img.decoding = "async";
    img.onload = () => {
      if (disposed) return;
      sheet = tintSheet(img, fill, ink);
      const sw = img.naturalWidth / rows;
      const sh = img.naturalHeight / cols;
      for (let i = 0; i < rows * cols; i++) {
        allPeeps.push({
          sx: (i % rows) * sw,
          sy: ((i / rows) | 0) * sh,
          sw,
          sh,
          width: sw,
          height: sh,
          x: 0,
          y: 0,
          anchorY: 0,
          scaleX: 1,
          depth: 1,
          walk: null,
        });
      }
      lastWidth = canvas.clientWidth;
      layout();
      resizeObserver.observe(canvas);
      visibility.observe(canvas);
    };
    img.src = src;

    return () => {
      disposed = true;
      resizeObserver.disconnect();
      visibility.disconnect();
      gsap.ticker.remove(render);
      crowd.forEach((peep) => peep.walk?.kill());
    };
  }, [src, rows, cols, fill, ink]);

  return <canvas ref={canvasRef} className={className} aria-hidden="true" />;
}

/** The original Skiper39 landing block, kept for reference and reuse. */
const Skiper39 = () => (
  <div className="relative h-full w-full bg-white">
    <CrowdCanvas src="/art/open-peeps.png" className="absolute bottom-0 h-[90vh] w-full" />
  </div>
);

export default Skiper39;

/**
 * Skiper 39 Canvas_Landing_004 — React + Canvas
 * Inspired by and adapted from https://codepen.io/zadvorsky/pen/xxwbBQV
 * illustration by https://www.openpeeps.com/
 *
 * License & Usage:
 * - Free to use and modify in both personal and commercial projects.
 * - Attribution to Skiper UI is required when using the free version
 *   (credited in the site footer).
 *
 * Author: @gurvinder-singh02 — https://gxuri.me
 */
