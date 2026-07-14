"use client";

import { motion } from "framer-motion";
import { education } from "@/lib/content";

const ease = [0.16, 1, 0.3, 1] as const;

export default function Education() {
  return (
    <section id="education" className="section section-alt">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.5, ease }}
        >
          <p className="section-label">Background</p>
          <h2 className="section-title">Education</h2>
        </motion.div>

        <div className="edu-stack">
          {education.map((edu, i) => (
            <motion.div
              key={edu.degree}
              className={`edu-card${edu.featured ? " edu-card-featured" : ""}`}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, ease, delay: i * 0.08 }}
            >
              <div className="edu-left">
                <i className={edu.icon}></i>
              </div>
              <div className="edu-right">
                <div className="edu-title-row">
                  <h3>{edu.degree}</h3>
                  {edu.badge && <span className="tl-badge">{edu.badge}</span>}
                </div>
                <p className="edu-school">{edu.school}</p>
                <p className="edu-meta">{edu.meta}</p>
                {edu.note && <p className="edu-note">{edu.note}</p>}
                {edu.courses && <p className="edu-courses">{edu.courses}</p>}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
