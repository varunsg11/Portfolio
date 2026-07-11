"use client";

import { useEffect } from "react";

/**
 * Adds the `visible` class to every `.fade-up` element as it scrolls into
 * view — the React equivalent of the original IntersectionObserver in
 * script.js. The CSS in globals.css handles the actual transition.
 *
 * Mount once near the root (in page.tsx). It scans the DOM on mount, so all
 * server-rendered sections are picked up.
 */
export function useFadeUp() {
  useEffect(() => {
    const els = document.querySelectorAll<HTMLElement>(".fade-up");

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );

    els.forEach((el) => observer.observe(el));

    // Hero elements are already in view on load — reveal them immediately.
    document.querySelectorAll<HTMLElement>(".hero .fade-up").forEach((el, i) => {
      setTimeout(() => el.classList.add("visible"), 100 + i * 120);
    });

    return () => observer.disconnect();
  }, []);
}
