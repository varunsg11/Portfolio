"use client";

import { Fragment } from "react";
import { motion } from "framer-motion";
import { experience } from "@/lib/content";

const ease = [0.16, 1, 0.3, 1] as const;

function highlightMetrics(text: string) {
  const pattern = /(\d[\d,.]*\s*(?:GB|MB|KB)?\s*(?:→|->)\s*\d[\d,.]*\s*(?:GB|MB|KB)?|\d[\d,.]*\s*%|\d[\d,.]*\+|\d[\d,.]*\s*(?:GB|MB|KB))/g;
  const parts = text.split(pattern);
  return parts.map((part, i) =>
    i % 2 === 1 ? (
      <span className="num" key={i}>{part}</span>
    ) : (
      <Fragment key={i}>{part}</Fragment>
    )
  );
}

export default function ExperienceSection() {
  return (
    <section id="experience" className="section section-alt">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.5, ease }}
        >
          <p className="section-label">Career</p>
          <h2 className="section-title">Work Experience</h2>
        </motion.div>

        <div className="timeline">
          {experience.map((job, i) => (
            <motion.div
              className="tl-item"
              key={job.title + job.date}
              initial={{ opacity: 0, x: -16 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, ease, delay: i * 0.08 }}
            >
              <div className="tl-left">
                <span className="tl-date">{job.date}</span>
                <span className="tl-dot"></span>
              </div>
              <div className="tl-card" data-company={job.company.split("·")[0].trim()}>
                <div className="tl-header">
                  <div>
                    <h3>{job.title}</h3>
                    <p className="tl-company">{job.company}</p>
                  </div>
                </div>
                <ul>
                  {job.bullets.map((bullet, j) => (
                    <li key={j}>{highlightMetrics(bullet)}</li>
                  ))}
                </ul>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
