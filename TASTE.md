# Taste — "Ember at night"

Distilled from the six references in `Inspiration/` (four links in
`links.txt`, two screenshots in `SS/`). It sets the direction for the next
design passes on `web/`. PRODUCT.md still owns product truth. Once these
passes land, run `/impeccable document` to record the built result as
DESIGN.md.

## The taste in one line

A graphite night lit by a single ember source, where code is treated as
physical material, people bring the warmth, and the visitor's scroll drives
the motion.

## What the six references share

| Thread | Seen in |
|---|---|
| Near-black or graphite background, never flat pure black | RedSun, Adrian Valera, Thanh Long, Dala, CODING, EOSAI |
| One warm light source (ember or orange) that everything is lit by | RedSun, Thanh Long, CODING, EOSAI ("reality.") |
| Code as matter: streams, records, and glyphs you can see and read | CODING, Thanh Long (JSON card, `<Python>` marquee) |
| Motion tied to scroll position rather than timed fades | RedSun (words light up), Adrian Valera (3D logo), Thanh Long (quote fill, timeline line) |
| Big contrast in scale: one huge word against small, exact body text | CODING, EOSAI, Dala, Adrian Valera |
| A figure made of many small parts | Dala (particle brain), CODING (glyphs into a singularity) |

## Principles

1. **Night, not black.** Background `#0a0a0a`, with raised graphite
   surfaces at `#141414` and `#1b1b1b`. Every glow comes from somewhere: a
   horizon, an accretion disk, a rim. Never use scattered decorative halos.
2. **One light: ember.** `#f97316` for light, `#ffd9b0` for its hottest
   core, bone `#ece6dc` for anything lit by it. No second accent colour.
3. **Code is material, not costume.** Monospace appears only where the text
   *is* code or data: the RAG pipeline, a JSON record, a tech tag. Never as
   "techy" decoration.
4. **The visitor drives the motion.** Prefer motion scrubbed to scroll
   position over timed entrances. Allow at most one authored moment per
   section. Lenis and GSAP ScrollTrigger are already wired site-wide.
5. **Scale contrast.** One huge word per scene ("V_Clanker") against quiet,
   exact body text.
6. **Human warmth against the machine.** Keep the playful voice and the
   joke roles (and a chatbot called V_Clanker). The machine parts stay
   serious; the people parts stay fun. Keep the page still where it's
   meant to be read: no ambient motion loops behind text.
7. **Prove, don't claim.** Every visual must show the real system (the
   pipeline, the record, the assistant). Invent nothing.
8. **A calm path.** Under `prefers-reduced-motion`, every scene still reads
   as a composed still image. Nothing is lost except the movement.

## Already built on `feature/scroll-animation`

- **Ember horizon hero:** the matrix rain is replaced by a still ember glow
  on the horizon at the foot of the hero, which leads straight into the
  black hole below. (A walking crowd was tried here and removed: the hero
  stays still.)
- **"V_Clanker" parallax bridge:** Osmo's layered parallax
  (`web/components/ui/parallax-scrolling.tsx`), with layers I drew from the
  CODING poster: a star field, an event horizon with an ember disk, the
  title "V_Clanker / Tells you about Varun" introducing the chatbot, and
  this site's real RAG pipeline streaming into the horizon. It ends in an
  "Ask V_Clanker" button that opens the chat.
- **Lenis smooth scroll site-wide** (`web/components/SmoothScroll.tsx`). It
  handles in-page anchor links (including focus), respects the mobile-menu
  scroll lock, and turns off under reduced motion.

---

## Ready-to-run prompts, one per inspiration

Paste each one as-is. Every prompt carries the shared constraint line, so
the six ideas stay in one world instead of turning into six costumes.

> **Shared constraints (already inside each prompt):** Follow TASTE.md
> ("Ember at night"). Single ember light, bone on graphite. Motion scrubbed
> to scroll using the existing GSAP ScrollTrigger and Lenis. Composed
> stills under reduced motion. No new claims: every fact comes from
> web/lib/content.ts.

### 1. RedSun: words that light up as you read
*Source: https://ovo-redsun.webflow.io/ (headings that light word by word, ember rim-lit cards)*

```
/impeccable animate web/components (section titles + Experience/Project cards)
Taking from RedSun: make every .section-title light up word by word, scrubbed
to scroll: words start at #3a3a3a and reach bone #ece6dc as they cross the
reading line, and the last word catches ember #f97316. Give Experience and
Project cards a lit rim: a 1px ember-to-transparent gradient on the top edge
that brightens on hover, like light catching an edge, never an outer halo.
Remove the small uppercase kicker labels above the headings; let the heading
carry the section. Follow TASTE.md ("Ember at night"). Single ember light,
bone on graphite. Scroll-scrubbed via the existing GSAP ScrollTrigger + Lenis.
Composed stills under reduced motion. No new claims; every fact comes from
web/lib/content.ts.
```

### 2. Dala (Pinterest pin): a mind made of particles
*Source: https://pin.it/5G2QRAGhK (a brain built from thousands of triangle particles)*

```
/impeccable overdrive the "Ask V_Clanker" block (web/components/ui/parallax-scrolling.tsx .parallax__content)
Taking from the Dala particle brain: turn the assistant's knowledge base into
a visible particle field on canvas. One particle per chunk of the real
content (derive the counts from web/lib/content.ts sections: Experience,
Projects, Research, Education, Certifications, Skills), clustered by section,
drawn as small bone and ember triangles. When a visitor sends a chat message,
the cluster for the section the answer draws on brightens, making retrieval
visible. If the backend doesn't return sources, label the highlight
"illustrative". Pause the field when it's offscreen. Follow TASTE.md
("Ember at night"). Single ember light, bone on graphite. Scroll-scrubbed via
the existing GSAP ScrollTrigger + Lenis. Composed stills under reduced
motion. No new claims; every fact comes from web/lib/content.ts.
```

### 3. Adrian Valera: the monogram that assembles itself
*Source: https://www.adrianvalera.com/ (3D logo turned by scroll, title that sharpens from blur, live local clock)*

```
/impeccable animate the Header and the Bio intro (web/components/Header.tsx, web/components/Bio.tsx)
Taking from Adrian Valera: (a) add a live "College Station, TX 14:05:32"
clock beside the vsg. wordmark (America/Chicago, tabular numerals, updating
each second, hidden on phones). (b) Build the vsg. monogram as an extruded
3D object that turns and assembles as the visitor scrolls into Bio, scrubbed
not timed, lit by an ember rim light on graphite. Use CSS 3D or a small
three.js scene with a static SVG fallback. (c) The Bio heading starts at
blur(12px) and sharpens as it reaches the reading line. Follow TASTE.md
("Ember at night"). Single ember light, bone on graphite. Scroll-scrubbed via
the existing GSAP ScrollTrigger + Lenis. Composed stills under reduced
motion. No new claims; every fact comes from web/lib/content.ts.
```

### 4. Thanh Long Nguyen: the record as data
*Source: https://thanhlongnguyen.vercel.app/ (decoding JSON card, timeline line drawn by scroll, quote that fills with colour, bracketed mono marquee, pill nav)*

```
/impeccable animate Bio + Experience + Header (web/components/Bio.tsx, Experience.tsx, Header.tsx, Marquee.tsx)
Taking from Thanh Long Nguyen: (a) replace the varun.sh terminal card with an
`about_me` JSON record whose values decode (scramble, then resolve) when
scrolled into view, with every value read from web/lib/content.ts (name,
current role, location, seeking). (b) Draw the Experience timeline's
vertical line with scroll (scaleY scrubbed); each role's dot ignites ember
as the line reaches it. (c) Set bio.paragraphs[0] as one large statement
that fills from graphite to bone word by word as you scroll through it; the
words stay exactly as they are. (d) Render Marquee tags in their real code
form (<Python> <LangGraph> [RAG] [MCP]). (e) Past the hero, the header
collapses into a centred pill. Follow TASTE.md ("Ember at night"). Single
ember light, bone on graphite. Scroll-scrubbed via the existing GSAP
ScrollTrigger + Lenis. Composed stills under reduced motion. No new claims;
every fact comes from web/lib/content.ts.
```

### 5. EOSAI (screenshot): the closing scene
*Source: Inspiration/SS/image.png (surreal dusk: a monolith archway on still water, a lone figure, a planet with an orbit ring, thin headline with one warm word)*

```
/impeccable craft the Contact section as the page's closing scene (web/components/Contact.tsx)
Taking from the EOSAI frame: end the page at dusk. A tall monolith doorway
stands on still, reflective water, with one small, still bone silhouette
of a figure at the threshold and its reflection below (no walking
figures). The ember orbit ring from the V_Clanker black hole
returns here as a thin ring behind the doorway, so the page opens and closes
on the same light. The headline is set light, with one word in ember. The
form sits on the water like a plate, keeping every current field, the
validation and the Resend flow. Author the scene as layered SVG (or a
generated raster with provenance) and give the layers a gentle scroll
parallax. Follow TASTE.md ("Ember at night"). Single ember light, bone on
graphite. Scroll-scrubbed via the existing GSAP ScrollTrigger + Lenis.
Composed stills under reduced motion. No new claims; every fact comes from
web/lib/content.ts.
```

### 6. CODING poster: the type voice
*Source: Inspiration/SS/Screenshot 2026-09-26 141929.png (pixel display title, code streaming into a singularity; its scene is already the parallax bridge)*

```
/impeccable typeset web (layout.tsx fonts + globals.css display tokens)
Taking from the CODING poster: give the site a type voice of its own. The
current display face (Space Grotesk) and body face (Inter) are the
category's defaults. Choose a display grotesk with real character for
headings, and a pixel face used exactly once, for the giant parallax title
"V_Clanker", the way the poster uses it for "CODING". Self-host both through
next/font, keep body text highly readable, check every breakpoint for
overflow (the hero name is long), and keep all copy unchanged. Follow
TASTE.md ("Ember at night"). Single ember light, bone on graphite. No new
claims; every fact comes from web/lib/content.ts.
```

### Suggested order

6 (type) → 4 (record as data) → 1 (lit headings) → 3 (monogram) → 5
(closing scene) → 2 (particle mind). Then `/impeccable document` to write
DESIGN.md, and `/impeccable polish`.

## Credits

Parallax layers structure: [Osmo](https://www.osmo.supply/), credited in
the site footer.
