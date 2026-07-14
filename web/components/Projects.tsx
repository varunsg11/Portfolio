"use client";

import { motion } from "framer-motion";
import { projects } from "@/lib/content";

const ease = [0.16, 1, 0.3, 1] as const;

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease } },
};

export default function Projects() {
  return (
    <section id="projects" className="section">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.5, ease }}
        >
          <p className="section-label">Work</p>
          <h2 className="section-title">Projects</h2>
        </motion.div>

        <motion.div
          className="projects-row"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
        >
          {projects.map((project, i) => (
            <motion.div
              key={project.title}
              className={`card project-card${project.featured ? " project-card-featured" : ""}`}
              variants={cardVariants}
              whileHover={{ y: -4 }}
            >
              <div className="card-top">
                <i className={project.icon}></i>
                <span className="card-index">[{String(i + 1).padStart(2, "0")}]</span>
              </div>
              <h3>{project.title}</h3>
              <p>{project.summary}</p>
              <div className="card-bottom">
                <div className="card-tags">
                  {project.tags.map((tag) => (
                    <span key={tag}>{tag}</span>
                  ))}
                </div>
                {project.url && (
                  <a
                    href={project.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="card-link"
                    aria-label="View on GitHub"
                  >
                    <i className="fab fa-github"></i> GitHub
                    <i className="fas fa-arrow-right"></i>
                  </a>
                )}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
