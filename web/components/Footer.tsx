"use client";

import { motion } from "framer-motion";
import { profile } from "@/lib/content";

export default function Footer() {
  return (
    <motion.footer
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
    >
      <div className="container footer-inner">
        <a href="#home" className="logo">
          {profile.logo}
        </a>
        <p>&copy; 2026 {profile.name}</p>
        <div className="footer-socials">
          <a href={profile.linkedin} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
            <i className="fab fa-linkedin-in"></i>
          </a>
          <a href={profile.github} target="_blank" rel="noopener noreferrer" aria-label="GitHub">
            <i className="fab fa-github"></i>
          </a>
        </div>
      </div>
    </motion.footer>
  );
}
