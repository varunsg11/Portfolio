"use client";

import { useRef } from "react";
import { motion } from "framer-motion";
import { skills, techPills, type Skill } from "@/lib/content";

const ease = [0.16, 1, 0.3, 1] as const;

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease } },
};

function SkillCard({ skill }: { skill: Skill }) {
  const fillRef = useRef<HTMLDivElement>(null);
  const pctRef = useRef<HTMLSpanElement>(null);
  const animated = useRef(false);

  function animateBar() {
    if (animated.current) return;
    animated.current = true;
    const target = skill.percent;
    let current = 0;
    const steps = 80;
    const step = target / steps;
    const id = setInterval(() => {
      current = Math.min(current + step, target);
      const val = Math.round(current);
      if (fillRef.current) fillRef.current.style.width = `${current.toFixed(1)}%`;
      if (pctRef.current) pctRef.current.textContent = val + "%";
      if (current >= target) clearInterval(id);
    }, 16);
  }

  return (
    <motion.div
      className="skill-card"
      variants={cardVariants}
      onViewportEnter={animateBar}
      viewport={{ once: true, margin: "-60px" }}
    >
      <div className="skill-card-top">
        <i className={skill.icon}></i>
        <h4>{skill.name}</h4>
      </div>
      <p>{skill.blurb}</p>
      <div className="skill-bar-wrap">
        <div className="skill-bar-row">
          <span className="skill-pct" ref={pctRef}>0%</span>
        </div>
        <div className="skill-bar-track">
          <div className="skill-bar-fill" ref={fillRef}></div>
        </div>
      </div>
    </motion.div>
  );
}

export default function Skills() {
  return (
    <section id="about" className="section">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.5, ease }}
        >
          <p className="section-label">About</p>
          <h2 className="section-title">Skills &amp; Expertise</h2>
        </motion.div>

        <motion.div
          className="skills-grid"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
        >
          {skills.map((skill) => (
            <SkillCard key={skill.name} skill={skill} />
          ))}
        </motion.div>

        <motion.div
          className="skills-extra"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.5, ease, delay: 0.1 }}
        >
          <div className="skills-extra-col">
            <p className="skills-extra-label">Also work with</p>
            <div className="tech-pills">
              {techPills.alsoWorkWith.map((t) => (
                <span key={t}>{t}</span>
              ))}
            </div>
          </div>
          <div className="skills-extra-col">
            <p className="skills-extra-label">AI &amp; ML</p>
            <div className="tech-pills">
              {techPills.aiml.map((t) => (
                <span key={t}>{t}</span>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
