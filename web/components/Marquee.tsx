import "./marquee.css";

const ITEMS = [
  "Agentic AI",
  "Multi-Agent Systems",
  "LLM Infrastructure",
  "RAG Pipelines",
  "FastAPI",
  "Next.js",
  "pgvector",
  "LangGraph",
  "CrewAI",
  "MCP Server",
  "Docker",
  "Databricks",
  "Python",
  "SAP ABAP",
  "Prompt Engineering",
  "MLOps",
];

export default function Marquee() {
  return (
    <div className="marquee-wrapper" aria-hidden="true">
      <div className="marquee-track">
        {[...ITEMS, ...ITEMS].map((item, i) => (
          <span key={i} className="marquee-item">
            <span className="marquee-dot">✦</span>
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}
