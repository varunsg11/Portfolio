"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { profile, navLinks } from "@/lib/content";

export default function Header() {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<string>("");
  const clickCount = useRef(0);
  const clickTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const navIds = navLinks.map((l) => l.href.slice(1));

    const computeActive = () => {
      const sections = Array.from(
        document.querySelectorAll<HTMLElement>("section[id]")
      );
      if (sections.length === 0) return;

      // A horizontal line 30% down the viewport acts as the reading position.
      const line = window.innerHeight * 0.3;

      // Pick the last section whose top has scrolled above the line — i.e. the
      // one currently occupying the reading position. This is deterministic and
      // always follows scroll order.
      let currentIndex = -1;
      sections.forEach((s, i) => {
        if (s.getBoundingClientRect().top <= line) currentIndex = i;
      });

      // If we're at the very bottom, force the last section active (short final
      // sections may never reach the line otherwise).
      const atBottom =
        window.innerHeight + window.scrollY >=
        document.documentElement.scrollHeight - 2;
      if (atBottom) currentIndex = sections.length - 1;

      // Map the current section to the nearest nav item at or above it, so
      // sections that aren't nav targets (e.g. intro) fall under the right one.
      while (currentIndex >= 0 && !navIds.includes(sections[currentIndex].id)) {
        currentIndex -= 1;
      }

      setActive(currentIndex >= 0 ? "#" + sections[currentIndex].id : "");
    };

    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        computeActive();
        ticking = false;
      });
    };

    computeActive();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  // The mobile menu is a fullscreen overlay; stop the page behind it scrolling.
  useEffect(() => {
    document.body.classList.toggle("nav-open", open);
    return () => document.body.classList.remove("nav-open");
  }, [open]);

  function handleLogoClick(e: React.MouseEvent) {
    e.preventDefault();
    clickCount.current += 1;
    if (clickTimer.current) clearTimeout(clickTimer.current);
    clickTimer.current = setTimeout(() => { clickCount.current = 0; }, 1200);
    if (clickCount.current >= 5) {
      clickCount.current = 0;
      window.dispatchEvent(new CustomEvent("vsg-easter-egg"));
    } else {
      window.location.hash = "#home";
    }
  }

  return (
    <motion.header
      id="header"
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
    >
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      <nav className="navbar container">
        <a href="#home" className="logo" onClick={handleLogoClick}>
          {profile.logo}
        </a>
        <ul id="nav-links" className={`nav-links${open ? " open" : ""}`}>
          {navLinks.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                className={active === link.href ? "active" : ""}
                onClick={() => setOpen(false)}
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>
        <button
          className="hamburger"
          aria-label="Toggle menu"
          aria-expanded={open}
          aria-controls="nav-links"
          onClick={() => setOpen((o) => !o)}
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      </nav>
    </motion.header>
  );
}
