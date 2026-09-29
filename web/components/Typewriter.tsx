"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Cycles through role titles with a typing/deleting animation — the React
 * port of the recursive setTimeout loop from the original script.js.
 */
export default function Typewriter({ roles }: { roles: readonly string[] }) {
  const [text, setText] = useState("");
  const state = useRef({ roleIndex: 0, charIndex: 0, isDeleting: false });

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;

    function loop() {
      const s = state.current;
      const current = roles[s.roleIndex];

      if (s.isDeleting) {
        s.charIndex -= 1;
      } else {
        s.charIndex += 1;
      }
      setText(current.slice(0, s.charIndex));

      let delay = s.isDeleting ? 40 : 70;
      if (!s.isDeleting && s.charIndex === current.length) {
        delay = 1800;
        s.isDeleting = true;
      } else if (s.isDeleting && s.charIndex === 0) {
        s.isDeleting = false;
        s.roleIndex = (s.roleIndex + 1) % roles.length;
        delay = 350;
      }
      timer = setTimeout(loop, delay);
    }

    // Start once the preloader has lifted and the hero has faded in.
    timer = setTimeout(loop, 3800);
    return () => clearTimeout(timer);
  }, [roles]);

  return (
    <>
      <span>{text}</span>
      <span className="typewriter-cursor">|</span>
    </>
  );
}
