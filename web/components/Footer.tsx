import { profile } from "@/lib/content";

export default function Footer() {
  return (
    <footer>
      <div className="container footer-inner">
        <a href="#home" className="logo">
          {profile.logo}
        </a>
        <p>&copy; 2025 {profile.name}</p>
        <div className="footer-socials">
          <a href={profile.linkedin} target="_blank" rel="noopener noreferrer">
            <i className="fab fa-linkedin-in"></i>
          </a>
          <a href={profile.github} target="_blank" rel="noopener noreferrer">
            <i className="fab fa-github"></i>
          </a>
        </div>
      </div>
    </footer>
  );
}
