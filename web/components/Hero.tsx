"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { motion, useReducedMotion } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { profile } from "@/lib/content";
import Typewriter from "./Typewriter";
import HeroAgent from "./HeroAgent";

// three.js is heavy; load the scene after the page is interactive.
const EmberHorizon = dynamic(() => import("./ui/ember-horizon"), { ssr: false });

const ease = [0.16, 1, 0.3, 1] as const;

/** The boot preloader covers the page for ~3s; the entrance starts as it lifts. */
export const INTRO = 3;

/** How long the hero stays pinned for the camera flight, in viewport heights. */
const FLIGHT = 0.8;

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.55, ease, delay: INTRO + delay },
});

/** Splits text into letters that rise out of a mask, one word per unbreakable box. */
function RisingText({ text, start }: { text: string; start: number }) {
  const reduce = useReducedMotion();
  let n = start;
  return (
    <>
      {text.split(" ").map((word, w) => (
        <span key={w}>
          {w > 0 && " "}
          <span className="rise-word">
            {[...word].map((ch, c) => (
              <motion.span
                key={c}
                className="rise-char"
                initial={{ y: reduce ? 0 : "108%", opacity: reduce ? 0 : 1 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.9, ease, delay: INTRO + 0.05 + n++ * 0.035 }}
              >
                {ch}
              </motion.span>
            ))}
          </span>
        </span>
      ))}
    </>
  );
}

export default function Hero() {
  const [sceneReady, setSceneReady] = useState(false);

  // The copy sinks and fades while the camera takes off, clearing the sky
  // before About rises over the last frame.
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    gsap.registerPlugin(ScrollTrigger);
    const ctx = gsap.context(() => {
      gsap.to([".hero-topbar", ".hero-body", ".hero-scroll"], {
        y: 140,
        opacity: 0,
        ease: "none",
        scrollTrigger: { trigger: "#home", start: "top top", end: `+=${FLIGHT * 80}%`, scrub: true },
      });
    });
    return () => ctx.revert();
  }, []);

  return (
    <section id="home" className={`hero${sceneReady ? " has-scene" : ""}`}>
      <div className="hero-bg">
        <div className="hero-horizon"></div>
      </div>
      <EmberHorizon trigger="#home" flight={FLIGHT} className="hero-scene" onReady={() => setSceneReady(true)} />

      {/* top bar: status + socials */}
      <div className="hero-topbar">
        <motion.div className="hero-status" {...fadeUp(0.1)}>
          <span className="status-dot" aria-hidden="true"></span>
          {profile.status}
        </motion.div>
        <motion.div className="hero-socials" {...fadeUp(0.15)}>
          <a href={profile.linkedin} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
            <i className="fab fa-linkedin-in"></i>
          </a>
          <a href={profile.github} target="_blank" rel="noopener noreferrer" aria-label="GitHub">
            <i className="fab fa-github"></i>
          </a>
          <a href={`mailto:${profile.email}`} aria-label="Email">
            <i className="fas fa-envelope"></i>
          </a>
        </motion.div>
      </div>

      {/* main content */}
      <div className="hero-body">
        <div className="container">
          <div className="hero-inner">
            {/* left column */}
            <div className="hero-left">
              <h1 aria-label={`${profile.firstName} ${profile.lastName}`}>
                <span aria-hidden="true">
                  <RisingText text={profile.firstName} start={0} />
                  <br />
                  <span className="hero-name-accent">
                    <RisingText text={profile.lastName} start={profile.firstName.length} />
                  </span>
                </span>
              </h1>

              <motion.p className="hero-tagline" {...fadeUp(0.3)}>
                <Typewriter roles={profile.roles} />
              </motion.p>

              <motion.p className="hero-desc" {...fadeUp(0.35)}>
                {profile.tagline}
              </motion.p>

              <motion.div className="hero-actions" {...fadeUp(0.4)}>
                <a href="#contact" className="btn btn-primary">
                  Get in touch
                </a>
                <a href={profile.resumeUrl} className="btn btn-ghost" target="_blank" rel="noopener noreferrer">
                  <i className="fas fa-download"></i> Resume
                </a>
              </motion.div>
            </div>

            {/* right column: the assistant, in person */}
            <motion.div className="hero-right" {...fadeUp(0.45)}>
              <HeroAgent />
            </motion.div>
          </div>
        </div>
      </div>

      {/* bottom bar: scroll cue on the ember horizon */}
      <motion.div
        className="hero-footer"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.7 }}
      >
        <a href="#bio" className="hero-scroll">
          <span className="hero-scroll-line"></span>
          Scroll
        </a>
      </motion.div>
    </section>
  );
}
