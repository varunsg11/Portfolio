"use client";

import { useEffect } from "react";
import { API_BASE } from "@/lib/config";
import Preloader from "@/components/Preloader";
import ScrollProgress from "@/components/ScrollProgress";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import SmoothScroll from "@/components/SmoothScroll";
import { ParallaxComponent } from "@/components/ui/parallax-scrolling";
import Marquee from "@/components/Marquee";
import Bio from "@/components/Bio";
import Skills from "@/components/Skills";
import Experience from "@/components/Experience";
import Certifications from "@/components/Certifications";
import Research from "@/components/Research";
import Projects from "@/components/Projects";
import Education from "@/components/Education";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
import ChatWidget from "@/components/ChatWidget";

export default function Home() {
  // Record a page view and wake the free-tier backend as early as possible, so a
  // cold start burns down while the visitor reads instead of while they wait.
  // Both are best-effort: failures are ignored. An anonymous random ID persisted
  // in localStorage lets the backend count unique visitors, not just page loads.
  useEffect(() => {
    let vid = "";
    try {
      vid = localStorage.getItem("vid") ?? "";
      if (!vid) {
        vid = crypto.randomUUID();
        localStorage.setItem("vid", vid);
      }
    } catch {
      // Storage blocked (private mode etc.) — still record the page view.
    }
    fetch(`${API_BASE}/api/event?event_type=page_view&detail=${encodeURIComponent(vid)}`, {
      method: "POST",
    }).catch(() => {});
    fetch(`${API_BASE}/health`).catch(() => {});
  }, []);

  return (
    <>
      <SmoothScroll />
      <Preloader />
      <ScrollProgress />
      <Header />
      <main id="main" tabIndex={-1}>
        <Hero />
        <ParallaxComponent />
        <Marquee />
        <Bio />
        <Skills />
        <Experience />
        <Education />
        <Certifications />
        <Research />
        <Projects />
        <Contact />
      </main>
      <Footer />
      <ChatWidget />
    </>
  );
}
