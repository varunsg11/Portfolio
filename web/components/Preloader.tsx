"use client";

import { useEffect, useState } from "react";
import { profile } from "@/lib/content";

/** Full-screen branded intro that fades out 1.5s after the page loads. */
export default function Preloader() {
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setHidden(true), 1500);
    return () => clearTimeout(t);
  }, []);

  return (
    <div id="preloader" className={hidden ? "hidden" : ""}>
      <div className="preloader-inner">
        <span className="preloader-logo">
          {profile.logo.slice(0, -1)}
          <span>.</span>
        </span>
        <div className="preloader-bar">
          <div className="preloader-fill"></div>
        </div>
      </div>
    </div>
  );
}
