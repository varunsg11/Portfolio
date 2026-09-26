"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

/*
 * Layered parallax bridge, after Osmo's "Parallax Layers" resource
 * (https://www.osmo.supply/). The GSAP timeline is theirs; the layers are
 * drawn for this site: a star field, an event horizon with an ember disk,
 * the title, and streams of this site's own RAG pipeline falling in.
 * Smooth scrolling (Lenis) lives site-wide in components/SmoothScroll.tsx.
 */

// Deterministic star field so server and client render the same markup.
function stars(count: number, seed: number) {
  let s = seed;
  const rand = () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  return Array.from({ length: count }, () => ({
    x: +(rand() * 1600).toFixed(1),
    y: +(rand() * 1000).toFixed(1),
    r: +(0.4 + rand() * rand() * 1.8).toFixed(2),
    o: +(0.25 + rand() * 0.75).toFixed(2),
  }));
}
const STARS = stars(260, 11);

// What actually happens when someone asks the assistant a question.
const PIPELINE = [
  "chunks = split(content.ts, faq.md, resume.pdf)  vectors = embed(chunks)  pgvector.upsert(vectors)  ",
  "q = embed(question)  ctx = pgvector.nearest(q, k)  if not ctx: return decline()  ",
  "answer = llm(system=GROUNDED_ONLY, context=ctx, tools=[github_stats, route_intro])  ",
  "for token in answer: sse.send(token)  log_event('chat')  ",
];

// Streams sweep in from the lower right and spiral into the horizon at (800, 500).
const STREAMS = Array.from({ length: 9 }, (_, i) => ({
  d: `M ${1020 + i * 95} 1120 C ${1560 - i * 18} ${760 + i * 22}, ${1140 + i * 8} ${545 + i * 5}, ${820 + i * 3} ${505 + i * 2}`,
  size: 11 + i * 1.6,
  text: PIPELINE[i % PIPELINE.length].repeat(3),
  accent: i % 3 === 1,
}));

const LAYERS = [
  { layer: "1", yPercent: 25 },
  { layer: "2", yPercent: 18 },
  { layer: "3", yPercent: 12 },
  { layer: "4", yPercent: 4 },
];

export function ParallaxComponent() {
  const parallaxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = parallaxRef.current;
    if (!root) return;
    gsap.registerPlugin(ScrollTrigger);

    const mm = gsap.matchMedia();
    // Reduced motion keeps the composed still: every layer rests at 0.
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const trigger = root.querySelector("[data-parallax-layers]");
      if (!trigger) return;
      // The section sits mid-page, so scrub across its whole pass through the
      // viewport; layers reach their composed position (0) at the midpoint.
      const tl = gsap.timeline({
        scrollTrigger: { trigger, start: "top bottom", end: "bottom top", scrub: 0 },
      });
      LAYERS.forEach(({ layer, yPercent }, idx) => {
        tl.fromTo(
          trigger.querySelectorAll(`[data-parallax-layer="${layer}"]`),
          { yPercent: -yPercent },
          { yPercent, ease: "none" },
          idx === 0 ? undefined : "<",
        );
      });
    }, root);

    return () => mm.revert();
  }, []);

  return (
    <div className="parallax" ref={parallaxRef}>
      <section className="parallax__header" aria-labelledby="parallax-title">
        <div className="parallax__visuals">
          <div className="parallax__black-line-overflow"></div>
          <div data-parallax-layers className="parallax__layers">
            <svg data-parallax-layer="1" className="parallax__layer-img" viewBox="0 0 1600 1000" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
              <defs>
                <radialGradient id="px-haze" cx="50%" cy="50%" r="50%">
                  <stop offset="0" stopColor="#f97316" stopOpacity="0.16" />
                  <stop offset="1" stopColor="#f97316" stopOpacity="0" />
                </radialGradient>
              </defs>
              <ellipse cx="800" cy="500" rx="760" ry="420" fill="url(#px-haze)" />
              {STARS.map((s, i) => (
                <circle key={i} cx={s.x} cy={s.y} r={s.r} fill="#ece6dc" opacity={s.o} />
              ))}
            </svg>

            <svg data-parallax-layer="2" className="parallax__layer-img" viewBox="0 0 1600 1000" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
              <defs>
                <linearGradient id="px-disk" x1="0" x2="1" y1="0" y2="0">
                  <stop offset="0" stopColor="#f97316" stopOpacity="0" />
                  <stop offset="0.3" stopColor="#f97316" />
                  <stop offset="0.5" stopColor="#ffd9b0" />
                  <stop offset="0.7" stopColor="#f97316" />
                  <stop offset="1" stopColor="#f97316" stopOpacity="0" />
                </linearGradient>
                <radialGradient id="px-glow" cx="50%" cy="50%" r="50%">
                  <stop offset="0.3" stopColor="#f97316" stopOpacity="0.45" />
                  <stop offset="1" stopColor="#f97316" stopOpacity="0" />
                </radialGradient>
                <filter id="px-soft" x="-20%" y="-50%" width="140%" height="200%">
                  <feGaussianBlur stdDeviation="6" />
                </filter>
                <clipPath id="px-front">
                  <rect x="0" y="500" width="1600" height="500" />
                </clipPath>
              </defs>
              <circle cx="800" cy="500" r="330" fill="url(#px-glow)" />
              {/* far side of the disk, bent over the top of the horizon */}
              <circle cx="800" cy="500" r="176" fill="none" stroke="url(#px-disk)" strokeWidth="14" filter="url(#px-soft)" opacity="0.9" />
              <circle cx="800" cy="500" r="168" fill="none" stroke="#ffd9b0" strokeWidth="1.5" opacity="0.8" />
              <ellipse cx="800" cy="500" rx="560" ry="64" fill="none" stroke="url(#px-disk)" strokeWidth="22" filter="url(#px-soft)" opacity="0.7" />
              {/* the horizon */}
              <circle cx="800" cy="500" r="158" fill="#050505" />
              {/* near side of the disk passes in front */}
              <g clipPath="url(#px-front)">
                <ellipse cx="800" cy="500" rx="560" ry="64" fill="none" stroke="url(#px-disk)" strokeWidth="22" filter="url(#px-soft)" />
                <ellipse cx="800" cy="500" rx="540" ry="58" fill="none" stroke="#ffd9b0" strokeWidth="2" opacity="0.85" />
              </g>
            </svg>

            <div data-parallax-layer="3" className="parallax__layer-title">
              <h2 id="parallax-title" className="parallax__title">Grounded.</h2>
            </div>

            <svg data-parallax-layer="4" className="parallax__layer-img" viewBox="0 0 1600 1000" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
              <defs>
                <radialGradient id="px-fall" cx="800" cy="500" r="620" gradientUnits="userSpaceOnUse">
                  <stop offset="0.28" stopColor="#000" />
                  <stop offset="0.6" stopColor="#fff" stopOpacity="0.55" />
                  <stop offset="1" stopColor="#fff" />
                </radialGradient>
                <mask id="px-fall-mask">
                  <rect width="1600" height="1000" fill="url(#px-fall)" />
                </mask>
                {STREAMS.map((s, i) => (
                  <path key={i} id={`px-stream-${i}`} d={s.d} />
                ))}
              </defs>
              <g mask="url(#px-fall-mask)" className="parallax__code">
                {STREAMS.map((s, i) => (
                  <text key={i} fontSize={s.size} fill={s.accent ? "#f97316" : "#ece6dc"} opacity={0.35 + i * 0.06}>
                    <textPath href={`#px-stream-${i}`} startOffset="0">
                      {s.text}
                    </textPath>
                  </text>
                ))}
              </g>
            </svg>
          </div>
          <div className="parallax__fade"></div>
        </div>
      </section>

      <section className="parallax__content">
        <p className="parallax__pipeline" aria-label="The assistant's pipeline: content, embed, pgvector, retrieve, answer">
          content.ts <span aria-hidden="true">→</span> embed <span aria-hidden="true">→</span> pgvector{" "}
          <span aria-hidden="true">→</span> retrieve <span aria-hidden="true">→</span> answer
        </p>
        <p className="parallax__lede">
          Everything on this page is also the assistant&rsquo;s memory. It answers only from that record, and
          says so when the record doesn&rsquo;t cover a question.
        </p>
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => window.dispatchEvent(new CustomEvent("vsg-open-chat"))}
        >
          Ask the assistant
        </button>
      </section>
    </div>
  );
}

export default ParallaxComponent;
