import { research } from "@/lib/content";

export default function Research() {
  return (
    <section id="research" className="section section-alt">
      <div className="container">
        <p className="section-label fade-up">Publications</p>
        <h2 className="section-title fade-up">Research Papers</h2>
        <div className="cards-grid fade-up">
          {research.map((paper) => (
            <a
              key={paper.title}
              href={paper.url}
              target="_blank"
              rel="noopener noreferrer"
              className="card"
            >
              <div className="card-top">
                <i className={paper.icon}></i>
                <span className="card-tag">{paper.tag}</span>
              </div>
              <h3>{paper.title}</h3>
              <p>{paper.summary}</p>
              <span className="card-link">
                Read paper <i className="fas fa-arrow-right"></i>
              </span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
