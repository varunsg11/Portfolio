import { education } from "@/lib/content";

export default function Education() {
  return (
    <section id="education" className="section section-alt">
      <div className="container">
        <p className="section-label fade-up">Background</p>
        <h2 className="section-title fade-up">Education</h2>
        <div className="edu-stack fade-up">
          {education.map((edu) => (
            <div
              key={edu.degree}
              className={`edu-card${edu.featured ? " edu-card-featured" : ""}`}
            >
              <div className="edu-left">
                <i className={edu.icon}></i>
              </div>
              <div className="edu-right">
                <div className="edu-title-row">
                  <h3>{edu.degree}</h3>
                  {edu.badge && <span className="tl-badge">{edu.badge}</span>}
                </div>
                <p className="edu-school">{edu.school}</p>
                <p className="edu-meta">{edu.meta}</p>
                {edu.note && <p className="edu-note">{edu.note}</p>}
                {edu.courses && <p className="edu-courses">{edu.courses}</p>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
