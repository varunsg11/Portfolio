"use client";

import { motion } from "framer-motion";
import { profile } from "@/lib/content";
import Typewriter from "./Typewriter";
import MatrixRain from "./MatrixRain";

const ease = [0.16, 1, 0.3, 1] as const;

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.55, ease, delay },
});

export default function Hero() {
  return (
    <section id="home" className="hero">
      <div className="hero-bg">
        <MatrixRain />
        <div className="hero-grid"></div>
        <div className="hero-glow"></div>
      </div>

      {/* top bar: socials */}
      <div className="hero-topbar">
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
              <motion.h1 {...fadeUp(0.2)}>
                {profile.firstName}
                <br />
                <span>{profile.lastName}</span>
              </motion.h1>

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
          </div>
        </div>
      </div>

      {/* bottom bar: scroll cue */}
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
