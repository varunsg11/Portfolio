"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

/**
 * Site-wide smooth scrolling. Lenis runs on GSAP's ticker so ScrollTrigger
 * scrubs stay in step with it. Off entirely under reduced motion, where the
 * page keeps plain native scrolling.
 */
export default function SmoothScroll() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    gsap.registerPlugin(ScrollTrigger);

    const lenis = new Lenis();
    lenis.on("scroll", ScrollTrigger.update);
    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    // Same-page anchors glide instead of jumping, then do what the browser
    // would have: update the hash and move focus to the target.
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const link = (e.target as Element).closest?.("a[href^='#']");
      const hash = link?.getAttribute("href");
      const target = hash && hash.length > 1 ? document.getElementById(hash.slice(1)) : null;
      if (!target) return;
      e.preventDefault();
      lenis.scrollTo(target, {
        // A mobile-menu link fires while the menu still holds the scroll lock.
        force: true,
        onComplete: () => {
          history.pushState(null, "", hash);
          if (!target.hasAttribute("tabindex")) {
            target.setAttribute("tabindex", "-1");
            target.addEventListener("blur", () => target.removeAttribute("tabindex"), { once: true });
          }
          target.focus({ preventScroll: true });
        },
      });
    };
    document.addEventListener("click", onClick);

    // The mobile menu locks page scroll with body.nav-open; Lenis must respect it.
    const lock = new MutationObserver(() => {
      if (document.body.classList.contains("nav-open")) lenis.stop();
      else lenis.start();
    });
    lock.observe(document.body, { attributes: true, attributeFilter: ["class"] });

    return () => {
      document.removeEventListener("click", onClick);
      lock.disconnect();
      gsap.ticker.remove(tick);
      gsap.ticker.lagSmoothing(500, 33);
      lenis.destroy();
    };
  }, []);

  return null;
}
