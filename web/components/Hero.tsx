import { profile } from "@/lib/content";
import Typewriter from "./Typewriter";

export default function Hero() {
  return (
    <section id="home" className="hero">
      <div className="hero-bg">
        <div className="hero-blob blob-1"></div>
        <div className="hero-blob blob-2"></div>
        <div className="hero-blob blob-3"></div>
        <div className="hero-grid"></div>
      </div>
      <div className="container">
        <div className="hero-inner">
          <div className="hero-text">
            <div className="hero-status fade-up">
              <span className="status-dot"></span>
              {profile.status}
            </div>
            <h1 className="fade-up">
              {profile.firstName}
              <br />
              <span>{profile.lastName}</span>
            </h1>
            <p className="hero-tagline fade-up">
              <Typewriter roles={profile.roles} />
            </p>
            <p className="hero-desc fade-up">{profile.tagline}</p>
            <div className="hero-actions fade-up">
              <a href="#contact" className="btn btn-primary">
                Get in touch
              </a>
              <a href={profile.resumeUrl} className="btn btn-ghost">
                <i className="fas fa-download"></i> Resume
              </a>
            </div>
            <div className="hero-socials fade-up">
              <a href={profile.linkedin} target="_blank" rel="noopener noreferrer">
                <i className="fab fa-linkedin-in"></i>
              </a>
              <a href={profile.github} target="_blank" rel="noopener noreferrer">
                <i className="fab fa-github"></i>
              </a>
              <a href={`mailto:${profile.email}`}>
                <i className="fas fa-envelope"></i>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
