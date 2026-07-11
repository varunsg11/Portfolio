import { projects } from "@/lib/content";

export default function Projects() {
  return (
    <section id="projects" className="section">
      <div className="container">
        <p className="section-label fade-up">Work</p>
        <h2 className="section-title fade-up">Academic Projects</h2>
        <div className="cards-grid fade-up">
          {projects.map((project) => (
            <div className="card" key={project.title}>
              <div className="card-top">
                <i className={project.icon}></i>
              </div>
              <h3>{project.title}</h3>
              <p>{project.summary}</p>
              <div className="card-tags">
                {project.tags.map((tag) => (
                  <span key={tag}>{tag}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
