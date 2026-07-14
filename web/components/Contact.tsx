"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { profile } from "@/lib/content";
import { API_BASE } from "@/lib/config";

type Status = { type: "success" | "error" | null; message: string };

const ease = [0.16, 1, 0.3, 1] as const;

export default function Contact() {
  const [sending, setSending] = useState(false);
  const [status, setStatus] = useState<Status>({ type: null, message: "" });

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSending(true);
    setStatus({ type: null, message: "" });

    const form = e.currentTarget;
    const payload = {
      name: (form.elements.namedItem("name") as HTMLInputElement).value,
      email: (form.elements.namedItem("email") as HTMLInputElement).value,
      subject: (form.elements.namedItem("subject") as HTMLInputElement).value,
      message: (form.elements.namedItem("message") as HTMLTextAreaElement).value,
    };

    try {
      const res = await fetch(`${API_BASE}/api/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Server error");
      setStatus({ type: "success", message: "Message sent! I'll get back to you soon." });
      form.reset();
      fetch(`${API_BASE}/api/event?event_type=form_submit`, { method: "POST" }).catch(() => {});
    } catch {
      setStatus({
        type: "error",
        message: `Something went wrong. Please email me directly at ${profile.email}`,
      });
    } finally {
      setSending(false);
    }
  }

  return (
    <section id="contact" className="section">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.5, ease }}
        >
          <p className="section-label">Say hello</p>
          <h2 className="section-title">Get In Touch</h2>
        </motion.div>

        <div className="contact-grid">
          <motion.div
            className="contact-info"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.5, ease, delay: 0.05 }}
          >
            <p>
              Incoming TAMU MCS student open to Summer 2027 internships in AI,
              ML, and software engineering. Drop a message — I&apos;d love to connect.
            </p>
            <div className="contact-links">
              <a href={`mailto:${profile.email}`}>
                <i className="fas fa-envelope"></i> {profile.email}
              </a>
              <a href={`mailto:${profile.eduEmail}`}>
                <i className="fas fa-university"></i> {profile.eduEmail}
              </a>
              <a href={`tel:${profile.phone.replace(/\s/g, "")}`}>
                <i className="fas fa-phone"></i> {profile.phone}
              </a>
              <a href={profile.linkedin} target="_blank" rel="noopener noreferrer">
                <i className="fab fa-linkedin-in"></i> linkedin.com/in/varuns11
              </a>
            </div>
            <a href={profile.resumeUrl} className="btn btn-primary resume-btn" target="_blank" rel="noopener noreferrer">
              <i className="fas fa-download"></i> Download Resume
            </a>
          </motion.div>

          <motion.form
            className="contact-form"
            onSubmit={handleSubmit}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.5, ease, delay: 0.1 }}
          >
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="name">Name</label>
                <input type="text" id="name" name="name" placeholder="Your name" required />
              </div>
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input type="email" id="email" name="email" placeholder="your@email.com" required />
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="subject">Subject</label>
              <input type="text" id="subject" name="subject" placeholder="What's this about?" required />
            </div>
            <div className="form-group">
              <label htmlFor="message">Message</label>
              <textarea id="message" name="message" rows={5} placeholder="Your message..." required />
            </div>
            <button type="submit" className="btn btn-primary" disabled={sending}>
              <span>{sending ? "Sending..." : "Send Message"}</span>{" "}
              <i className="fas fa-paper-plane"></i>
            </button>
            {status.type && (
              <div className={`form-status ${status.type}`}>{status.message}</div>
            )}
          </motion.form>
        </div>
      </div>
    </section>
  );
}
