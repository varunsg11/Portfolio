"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { bio, profile } from "@/lib/content";

const ease = [0.16, 1, 0.3, 1] as const;

export default function Bio() {
  const [glitching, setGlitching] = useState(false);
  const [secretVisible, setSecretVisible] = useState(false);
  const terminalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function trigger() {
      // scroll Bio into view
      document.getElementById("bio")?.scrollIntoView({ behavior: "smooth" });

      // short delay then glitch
      setTimeout(() => {
        setGlitching(true);
        setTimeout(() => {
          setGlitching(false);
          setSecretVisible(true);
        }, 800);
      }, 600);
    }

    window.addEventListener("vsg-easter-egg", trigger);
    return () => window.removeEventListener("vsg-easter-egg", trigger);
  }, []);

  return (
    <section id="bio" className="section section-alt">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.5, ease }}
        >
          <p className="section-label">Who I am</p>
          <h2 className="section-title">About Me</h2>
        </motion.div>

        <div className="bio-layout">
          {/* terminal card */}
          <motion.div
            className={`terminal-card${glitching ? " terminal-glitch" : ""}`}
            ref={terminalRef}
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.55, ease, delay: 0.05 }}
          >
            <div className="terminal-bar">
              <span className="terminal-dot t-red"></span>
              <span className="terminal-dot t-yellow"></span>
              <span className="terminal-dot t-green"></span>
              <span className="terminal-title">varun.sh</span>
            </div>
            <div className="terminal-body">
              <p><span className="t-prompt">~</span> <span className="t-cmd">whoami</span></p>
              <p className="t-out">{profile.firstName} Sadashive Gowda</p>

              <p className="t-mt"><span className="t-prompt">~</span> <span className="t-cmd">cat stack.txt</span></p>
              <p className="t-out">Python · FastAPI · Next.js</p>
              <p className="t-out">LangGraph · CrewAI · OpenAI</p>

              <p className="t-mt"><span className="t-prompt">~</span> <span className="t-cmd">cat status.txt</span></p>
              <p className="t-out t-green-text">● Open to Summer 2027 Internships</p>

              <p className="t-mt"><span className="t-prompt">~</span> <span className="t-cmd">ls interests/</span></p>
              {bio.interests.map((item) => (
                <p key={item} className="t-out">
                  <span className="t-accent">→</span> {item}
                </p>
              ))}

              {/* easter egg secret row */}
              {secretVisible && (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, ease }}
                >
                  <p className="t-mt"><span className="t-prompt">~</span> <span className="t-cmd">cat secret.txt</span></p>
                  <p className="t-out" style={{ color: "var(--accent)", fontWeight: 700 }}>WOW YOU FOUND ME 👀</p>
                  <p className="t-out">when you treating me the Chicken biryani? 🍛</p>
                </motion.div>
              )}

              <p className="t-mt"><span className="t-prompt">~</span> <span className="t-cursor">█</span></p>
            </div>
          </motion.div>

          {/* prose */}
          <motion.div
            className="bio-body"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.55, ease, delay: 0.12 }}
          >
            {bio.paragraphs.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
            <p className="bio-interests">
              Interested in{" "}
              {bio.interests.map((interest, i) => (
                <span key={i}>
                  {interest}
                  {i < bio.interests.length - 1 ? ", " : ""}
                </span>
              ))}
              .
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
