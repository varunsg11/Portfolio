"use client";

import { useEffect, useState } from "react";

export default function Preloader() {
  const [stage, setStage] = useState(0);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    const timers = [
      setTimeout(() => setStage(1), 400),
      setTimeout(() => setStage(2), 800),
      setTimeout(() => setStage(3), 1150),
      setTimeout(() => setStage(4), 1500),
      setTimeout(() => setStage(5), 2000),
      setTimeout(() => setHidden(true), 3000),
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <div id="preloader" className={hidden ? "hidden" : ""}>
      <div className="preloader-terminal">
        <div className="preloader-scanlines" />

        <div className="preloader-terminal-bar">
          <span className="terminal-dot t-red" />
          <span className="terminal-dot t-yellow" />
          <span className="terminal-dot t-green" />
          <span className="preloader-terminal-title">varun.sh — bash</span>
        </div>

        <div className="preloader-terminal-body">
          <p className="preloader-line">
            <span className="t-prompt">$</span>{" "}
            <span className="preloader-cmd preloader-type">./boot varun.sh</span>
          </p>

          {stage >= 1 && (
            <div className="preloader-module preloader-fadein">
              <span className="preloader-module-name">ai_modules</span>
              <span className="preloader-dots">········</span>
              <span className="preloader-ok">✓ LOADED</span>
            </div>
          )}
          {stage >= 2 && (
            <div className="preloader-module preloader-fadein">
              <span className="preloader-module-name">portfolio_data</span>
              <span className="preloader-dots">·····</span>
              <span className="preloader-ok">✓ LOADED</span>
            </div>
          )}
          {stage >= 3 && (
            <div className="preloader-module preloader-fadein">
              <span className="preloader-module-name">chat_engine</span>
              <span className="preloader-dots">······</span>
              <span className="preloader-ok">✓ LOADED</span>
            </div>
          )}

          {stage >= 4 && (
            <div className="preloader-progress-wrap preloader-fadein">
              <div className="preloader-progress-track">
                <div className="preloader-progress-fill" />
              </div>
              <span className="preloader-progress-label">initializing...</span>
            </div>
          )}

          {stage >= 5 && (
            <p className="preloader-ready preloader-fadein">
              <span className="preloader-ok">✓</span> all systems online
              <span className="t-cursor"> █</span>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
