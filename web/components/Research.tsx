"use client";

import { motion } from "framer-motion";
import { research } from "@/lib/content";

const ease = [0.16, 1, 0.3, 1] as const;

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease } },
};

export default function Research() {
  return (
    <section id="research" className="section section-alt">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.5, ease }}
        >
          <p className="section-label">Publications</p>
          <h2 className="section-title">Research Papers</h2>
        </motion.div>

        <motion.div
          className="cards-grid"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
        >
          {research.map((paper, i) => (
            <motion.a
              key={paper.title}
              href={paper.url}
              target="_blank"
              rel="noopener noreferrer"
              className="card"
              variants={cardVariants}
              whileHover={{ y: -4 }}
            >
              <div className="card-top">
                <i className={paper.icon}></i>
                <span className="card-index">[{String(i + 1).padStart(2, "0")}]</span>
              </div>
              <span className="card-tag">{paper.tag}</span>
              <h3>{paper.title}</h3>
              <p>{paper.summary}</p>
              <span className="card-link">
                Read paper <i className="fas fa-arrow-right"></i>
              </span>
            </motion.a>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
