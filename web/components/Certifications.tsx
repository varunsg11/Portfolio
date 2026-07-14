"use client";

import { motion } from "framer-motion";
import { certifications } from "@/lib/content";

const ease = [0.16, 1, 0.3, 1] as const;

export default function Certifications() {
  return (
    <section id="certifications" className="section">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.5, ease }}
        >
          <p className="section-label">Credentials</p>
          <h2 className="section-title">Certifications</h2>
        </motion.div>

        <div className="cert-list">
          {certifications.map((cert, i) => (
            <motion.a
              key={cert.title}
              href={cert.url}
              target="_blank"
              rel="noopener noreferrer"
              className="cert-row"
              initial={{ opacity: 0, x: -12 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.45, ease, delay: i * 0.07 }}
            >
              <div className="cert-icon">
                <i className={cert.icon}></i>
              </div>
              <div className="cert-body">
                <h4>{cert.title}</h4>
                <p>{cert.issuer}</p>
              </div>
              <i className="fas fa-arrow-up-right-from-square cert-arrow"></i>
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  );
}
