"use client";

import { useEffect } from "react";
import { API_BASE } from "@/lib/config";
import Preloader from "@/components/Preloader";
import ScrollProgress from "@/components/ScrollProgress";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
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
  // Record a page view (best-effort; ignored if analytics isn't configured).
  useEffect(() => {
    fetch(`${API_BASE}/api/event?event_type=page_view`, { method: "POST" }).catch(() => {});
  }, []);

  return (
    <>
      <Preloader />
      <ScrollProgress />
      <Header />
      <main>
        <Hero />
        <Marquee />
        <Bio />
        <Skills />
        <Experience />
        <Certifications />
        <Research />
        <Projects />
        <Education />
        <Contact />
      </main>
      <Footer />
      <ChatWidget />
    </>
  );
}
