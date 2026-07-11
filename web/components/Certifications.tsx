import { certifications } from "@/lib/content";

export default function Certifications() {
  return (
    <section id="certifications" className="section">
      <div className="container">
        <p className="section-label fade-up">Credentials</p>
        <h2 className="section-title fade-up">Certifications</h2>
        <div className="cert-list fade-up">
          {certifications.map((cert) => (
            <a
              key={cert.title}
              href={cert.url}
              target="_blank"
              rel="noopener noreferrer"
              className="cert-row"
            >
              <div className="cert-icon">
                <i className={cert.icon}></i>
              </div>
              <div className="cert-body">
                <h4>{cert.title}</h4>
                <p>{cert.issuer}</p>
              </div>
              <i className="fas fa-arrow-up-right-from-square cert-arrow"></i>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
