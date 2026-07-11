import { bio } from "@/lib/content";

export default function Bio() {
  return (
    <section id="bio" className="section section-alt">
      <div className="container">
        <p className="section-label fade-up">Who I am</p>
        <div className="bio-layout fade-up">
          <h2 className="bio-heading">About Me</h2>
          <div className="bio-body">
            {bio.paragraphs.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
            <p className="bio-interests">
              Interested in{" "}
              {bio.interests.map((interest, i) => (
                <span key={i}>
                  {interest}
                  {i < bio.interests.length - 1 ? ", " : ""}
                </span>
              ))}
              .
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
