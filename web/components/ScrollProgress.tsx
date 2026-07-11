"use client";

import { useEffect, useState } from "react";

/** Thin red bar at the top that fills as the page scrolls. */
export default function ScrollProgress() {
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const total =
        document.documentElement.scrollHeight - window.innerHeight;
      setWidth(total > 0 ? (window.scrollY / total) * 100 : 0);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return <div id="scrollProgress" style={{ width: `${width}%` }} />;
}
