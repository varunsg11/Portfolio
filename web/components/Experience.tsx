import { experience } from "@/lib/content";
import { Fragment } from "react";

/**
 * Wraps metrics (30%, 600+, 6 GB → 2 GB, etc.) in <span class="num"> so they
 * render in the accent color — replaces the hand-placed spans from the old HTML.
 */
function highlightMetrics(text: string) {
  // Matches: percentages, "600+", "6 GB → 2 GB" ranges, standalone numbers with units.
  const pattern = /(\d[\d,.]*\s*(?:GB|MB|KB)?\s*(?:→|->)\s*\d[\d,.]*\s*(?:GB|MB|KB)?|\d[\d,.]*\s*%|\d[\d,.]*\+|\d[\d,.]*\s*(?:GB|MB|KB))/g;
  // split() with a capture group places the matched metrics at odd indices.
  const parts = text.split(pattern);
  return parts.map((part, i) =>
    i % 2 === 1 ? (
      <span className="num" key={i}>
        {part}
      </span>
    ) : (
      <Fragment key={i}>{part}</Fragment>
    )
  );
}

export default function ExperienceSection() {
  return (
    <section id="experience" className="section section-alt">
      <div className="container">
        <p className="section-label fade-up">Career</p>
        <h2 className="section-title fade-up">Work Experience</h2>
        <div className="timeline">
          {experience.map((job) => (
            <div className="tl-item fade-up" key={job.title + job.date}>
              <div className="tl-left">
                <span className="tl-date">{job.date}</span>
                <span className="tl-dot"></span>
              </div>
              <div className="tl-card">
                <div className="tl-header">
                  <div>
                    <h3>{job.title}</h3>
                    <p className="tl-company">{job.company}</p>
                  </div>
                </div>
                <ul>
                  {job.bullets.map((bullet, i) => (
                    <li key={i}>{highlightMetrics(bullet)}</li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
