"use client";

import { useEffect, useRef } from "react";
import { skills, techPills, type Skill } from "@/lib/content";

/** One skill card with an SVG proficiency ring that animates when scrolled into view. */
function SkillCard({ skill }: { skill: Skill }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<SVGPathElement>(null);
  const pctRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const target = skill.percent;
          let current = 0;
          const steps = 80;
          const step = target / steps;
          const id = setInterval(() => {
            current = Math.min(current + step, target);
            const val = Math.round(current);
            ringRef.current?.setAttribute(
              "stroke-dasharray",
              `${current.toFixed(1)},100`
            );
            if (pctRef.current) pctRef.current.textContent = val + "%";
            if (current >= target) clearInterval(id);
          }, 16);
          observer.unobserve(card);
        });
      },
      { threshold: 0.3 }
    );

    observer.observe(card);
    return () => observer.disconnect();
  }, [skill.percent]);

  return (
    <div className="skill-card" ref={cardRef}>
      <div className="skill-top">
        <i className={skill.icon}></i>
        <div className="skill-ring">
          <svg viewBox="0 0 36 36">
            <path
              className="ring-bg"
              pathLength={100}
              d="M18 2 a 16 16 0 0 1 0 32 a 16 16 0 0 1 0 -32"
            />
            <path
              ref={ringRef}
              className="ring-fill"
              pathLength={100}
              strokeDasharray="0,100"
              d="M18 2 a 16 16 0 0 1 0 32 a 16 16 0 0 1 0 -32"
            />
          </svg>
          <span className="ring-pct" ref={pctRef}>
            0%
          </span>
        </div>
      </div>
      <h4>{skill.name}</h4>
      <p>{skill.blurb}</p>
    </div>
  );
}

export default function Skills() {
  return (
    <section id="about" className="section">
      <div className="container">
        <p className="section-label fade-up">About</p>
        <h2 className="section-title fade-up">Skills &amp; Expertise</h2>

        <div className="skills-grid fade-up">
          {skills.map((skill) => (
            <SkillCard key={skill.name} skill={skill} />
          ))}
        </div>

        <div className="skills-extra fade-up">
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
        </div>
      </div>
    </section>
  );
}
