"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { OutputPass } from "three/examples/jsm/postprocessing/OutputPass.js";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

/*
 * The hero's night scene: graphite ridges rim-lit in ember, a few stars, and
 * an ember sun sitting on the horizon. Scrolling out of the hero flies the
 * camera up over the ranges while the sun rises. Loosely after the
 * "Horizon" Three.js hero, reworked for this site's single ember light.
 *
 * Nothing moves on its own: a frame is drawn only when the scroll position
 * (or the viewport) changes, and the loop stops once the camera settles.
 */

// Deterministic so every visit sees the same mountains.
function rng(seed: number) {
  let s = seed;
  return () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const EMBER = new THREE.Color("#f97316");
const SEGMENTS = 180;
const RAD = Math.PI / 180;

// Camera path, eased by scroll progress. It starts tilted up so the horizon
// sits low and the sky holds the copy, then climbs over the ranges.
const FROM = { y: 14, z: 140, lookY: 124 };
const TO = { y: 64, z: -110, lookY: 48 };
const SUN = { z: -900, from: -26, to: 96 };

// Near → far. Each ridge is placed by the angle below the starting eye line
// its crest should sit at, and sized by how wide it looks from there, so the
// layers stack evenly. Far layers are lighter and warmer: haze lit by the sun.
const RIDGES = [
  { z: 60, angle: -14, swing: 3.2, color: "#0a0908", rim: 1.25 },
  { z: -40, angle: -8, swing: 3, color: "#0e0c0a", rim: 1.05 },
  { z: -160, angle: -4.6, swing: 2.8, color: "#14100c", rim: 0.85 },
  { z: -300, angle: -2.2, swing: 2.6, color: "#1c140f", rim: 0.65 },
  { z: -480, angle: -0.4, swing: 2.6, color: "#261a12", rim: 0.5 },
  // Hidden behind the nearer ranges at first; the climb reveals them.
  { z: -650, angle: -0.2, swing: 2.4, color: "#2c1d13", rim: 0.4 },
  { z: -820, angle: -0.1, swing: 2.4, color: "#322015", rim: 0.32 },
];

function ridgeProfile(rand: () => number, mean: number, amp: number) {
  const phase = [rand() * 10, rand() * 10, rand() * 10];
  const ys: number[] = [];
  for (let i = 0; i <= SEGMENTS; i++) {
    const u = i / SEGMENTS;
    const y =
      Math.sin(u * 6 + phase[0]) * 0.5 +
      Math.sin(u * 15 + phase[1]) * 0.28 +
      (0.5 - Math.abs(Math.sin(u * 31 + phase[2]))) * 0.24 +
      (rand() - 0.5) * 0.05;
    ys.push(mean + y * amp);
  }
  return ys;
}

function buildRidge(ys: number[], color: string, rim: number, dist: number, halfWidth: number) {
  const xs = ys.map((_, i) => (i / SEGMENTS - 0.5) * 2 * halfWidth);

  const pts = ys.map((y, i) => new THREE.Vector2(xs[i], y));
  pts.push(new THREE.Vector2(halfWidth, -600), new THREE.Vector2(-halfWidth, -600));
  const body = new THREE.Mesh(
    new THREE.ShapeGeometry(new THREE.Shape(pts)),
    new THREE.MeshBasicMaterial({ color }),
  );

  // A thin ribbon along the crest (about 2px on screen at the start), bright
  // enough (>1) for the bloom to catch.
  const thick = dist * 0.0022;
  const pos: number[] = [];
  const idx: number[] = [];
  ys.forEach((y, i) => {
    pos.push(xs[i], y + thick * 0.35, 0.01, xs[i], y - thick, 0.01);
    if (i > 0) {
      const a = (i - 1) * 2;
      idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2);
    }
  });
  const rimGeo = new THREE.BufferGeometry();
  rimGeo.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  rimGeo.setIndex(idx);
  const rimColor = EMBER.clone().multiplyScalar(rim);
  const crest = new THREE.Mesh(rimGeo, new THREE.MeshBasicMaterial({ color: rimColor, fog: false }));

  const group = new THREE.Group();
  group.add(body, crest);
  return group;
}

function buildSky() {
  return new THREE.Mesh(
    new THREE.PlaneGeometry(9000, 3000),
    new THREE.ShaderMaterial({
      depthWrite: false,
      uniforms: { glow: { value: 0 } },
      vertexShader: `varying float vY; void main(){ vY = position.y; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
      fragmentShader: `
        uniform float glow; varying float vY;
        void main(){
          // Falls to black with zero slope, then dithered, so no band or seam.
          float h = clamp((vY + 80.0) / 1000.0, 0.0, 1.0);
          vec3 low = vec3(0.30, 0.075, 0.012) * (0.55 + glow * 0.6);
          vec3 col = low * pow(1.0 - h, 2.6);
          float n = fract(sin(dot(gl_FragCoord.xy, vec2(12.9898, 78.233))) * 43758.5453);
          gl_FragColor = vec4(col + (n - 0.5) / 255.0, 1.0);
        }`,
    }),
  );
}

function buildSun() {
  return new THREE.Mesh(
    new THREE.PlaneGeometry(1400, 1400),
    new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: { strength: { value: 1 } },
      vertexShader: `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
      fragmentShader: `
        uniform float strength; varying vec2 vUv;
        void main(){
          float d = length(vUv - 0.5) * 2.0;
          float core = smoothstep(0.08, 0.074, d);
          // Forced to exactly zero before the quad's edge, or its outline shows.
          float halo = (exp(-d * 5.0) * 0.9 + exp(-d * 14.0) * 0.8) * smoothstep(1.0, 0.55, d);
          vec3 ember = vec3(0.98, 0.28, 0.03);
          vec3 col = ember * halo * strength + vec3(1.3, 0.56, 0.17) * core * strength;
          gl_FragColor = vec4(col, 1.0);
        }`,
    }),
  );
}

function buildStars(rand: () => number) {
  const count = 1400;
  const pos = new Float32Array(count * 3);
  const col = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    // Upper hemisphere in front of the camera, above the ranges.
    const theta = (rand() - 0.5) * Math.PI * 1.2;
    const phi = 0.06 + rand() * 1.2;
    const r = 1600;
    pos[i * 3] = Math.sin(theta) * Math.cos(phi) * r;
    pos[i * 3 + 1] = Math.sin(phi) * r * 0.7 + 40;
    pos[i * 3 + 2] = -Math.cos(theta) * Math.cos(phi) * r;
    const b = 0.35 + rand() * 0.65;
    const warm = rand() < 0.2;
    col[i * 3] = b;
    col[i * 3 + 1] = b * (warm ? 0.8 : 0.95);
    col[i * 3 + 2] = b * (warm ? 0.6 : 0.9);
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  geo.setAttribute("color", new THREE.BufferAttribute(col, 3));
  return new THREE.Points(
    geo,
    new THREE.PointsMaterial({
      size: 1.6,
      sizeAttenuation: false,
      vertexColors: true,
      transparent: true,
      opacity: 0.9,
      depthWrite: false,
      fog: false,
    }),
  );
}

export interface EmberHorizonProps {
  /** The hero: pinned while the flight plays. */
  trigger: string;
  /** Length of the flight, in viewport heights of extra scroll. */
  flight: number;
  /** Called once the scene has drawn its first frame. */
  onReady?: () => void;
  className?: string;
}

export function EmberHorizon({ trigger, flight, onReady, className }: EmberHorizonProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const readyRef = useRef(onReady);

  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    const triggerEl = document.querySelector(trigger);
    if (!wrap || !canvas || !triggerEl) return;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: "high-performance" });
    } catch {
      return; // No WebGL: the hero keeps its CSS horizon glow.
    }
    const dpr = Math.min(window.devicePixelRatio, 1.75);
    renderer.setPixelRatio(dpr);
    renderer.setClearColor("#0a0a0a");

    const scene = new THREE.Scene();
    // Warm haze: distance fades the ridges toward the sun-lit air, not to black.
    scene.fog = new THREE.FogExp2("#3a1d0c", 0.0009);

    const camera = new THREE.PerspectiveCamera(55, 1, 0.5, 4000);

    const rand = rng(20260929);
    const sky = buildSky();
    sky.position.set(0, 0, -1500);
    const sun = buildSun();
    sun.position.set(0, SUN.from, SUN.z);
    const stars = buildStars(rand);
    const ridges = RIDGES.map((r) => {
      const dist = FROM.z - r.z;
      const mean = FROM.y + dist * Math.tan(r.angle * RAD);
      const amp = dist * Math.tan(r.swing * RAD);
      const g = buildRidge(ridgeProfile(rand, mean, amp), r.color, r.rim, dist, 160 + dist * 1.5);
      g.position.z = r.z;
      return g;
    });
    scene.add(sky, stars, sun, ...ridges);

    const composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));
    const bloom = new UnrealBloomPass(new THREE.Vector2(1, 1), 0.85, 0.55, 0.62);
    composer.addPass(bloom);
    composer.addPass(new OutputPass());

    const sunMat = sun.material as THREE.ShaderMaterial;
    const skyMat = sky.material as THREE.ShaderMaterial;
    const starMat = stars.material as THREE.PointsMaterial;
    const look = new THREE.Vector3();
    const ease = (t: number) => t * t * (3 - 2 * t);

    function place(p: number) {
      const e = ease(p);
      camera.position.set(0, FROM.y + (TO.y - FROM.y) * e, FROM.z + (TO.z - FROM.z) * e);
      look.set(0, FROM.lookY + (TO.lookY - FROM.lookY) * e, -900);
      camera.lookAt(look);
      sun.position.y = SUN.from + (SUN.to - SUN.from) * e;
      sunMat.uniforms.strength.value = 0.85 + e * 0.35;
      skyMat.uniforms.glow.value = e;
      starMat.opacity = 0.9 * (1 - 0.75 * e);
    }

    function resize() {
      const w = window.innerWidth;
      const h = window.innerHeight;
      renderer.setSize(w, h, false);
      composer.setSize(w, h);
      bloom.resolution.set(w / 2, h / 2);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    }

    // Render on demand: ease toward the scroll target, stop when there.
    let current = 0;
    let target = 0;
    let raf = 0;
    const draw = () => {
      place(current);
      composer.render();
    };
    const tick = () => {
      const d = target - current;
      current = Math.abs(d) < 0.0008 ? target : current + d * 0.14;
      draw();
      raf = current === target ? 0 : requestAnimationFrame(tick);
    };
    const kick = () => {
      if (!raf) raf = requestAnimationFrame(tick);
    };

    resize();
    draw();
    readyRef.current?.();

    const onResize = () => {
      resize();
      draw();
    };
    window.addEventListener("resize", onResize);

    // Once the hero has scrolled away the fixed canvas would show through the
    // transparent sections below, so it is hidden there.
    const io = new IntersectionObserver(([e]) => {
      wrap.style.visibility = e.isIntersecting ? "visible" : "hidden";
    });
    io.observe(triggerEl);
    const cleanups: (() => void)[] = [() => io.disconnect()];

    // The hero holds still for the flight, then About slides up over the last
    // frame. Under reduced motion there is no pin and no flight.
    if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      gsap.registerPlugin(ScrollTrigger);
      const st = ScrollTrigger.create({
        trigger: triggerEl,
        start: "top top",
        end: `+=${flight * 100}%`,
        pin: true,
        onUpdate: (self) => {
          target = self.progress;
          kick();
        },
      });
      // The scene loads lazily, so the pin lands after other triggers were
      // measured; re-measure them with its spacing in place.
      ScrollTrigger.refresh();
      // A reload part-way down the page starts from where it landed.
      target = current = st.progress;
      draw();
      cleanups.push(() => st.kill());
    }

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      cleanups.forEach((fn) => fn());
      scene.traverse((o) => {
        const m = o as THREE.Mesh;
        m.geometry?.dispose();
        const mat = m.material as THREE.Material | undefined;
        mat?.dispose();
      });
      composer.dispose();
      renderer.dispose();
    };
  }, [trigger, flight]);

  return (
    <div ref={wrapRef} className={className} aria-hidden="true">
      <canvas ref={canvasRef} />
    </div>
  );
}

export default EmberHorizon;
