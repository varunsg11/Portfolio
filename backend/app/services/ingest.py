"""Knowledge-base ingestion pipeline.

Run as a script:  python -m app.services.ingest

Sources (single source of truth mirrors the frontend's lib/content.ts):
  1. Structured profile facts (experience, skills, projects, research, education)
  2. knowledge/faq.md  — curated talking points, split on `##` headings
  3. assets/Varun_SadashiveGowda_Resume.pdf — resume text (optional, via pypdf)

Pipeline: load sources -> chunk -> embed (batched) -> replace kb_chunks table.
Idempotent: wipes and rebuilds the table each run. Logs chunk counts (no silent
truncation).
"""

from __future__ import annotations

import re
from pathlib import Path

from sqlalchemy import delete

from app.db import get_engine, get_db, init_pgvector
from app.models import Base, KBChunk
from app.services.openai_client import embed_batch

BACKEND_DIR = Path(__file__).resolve().parent.parent.parent
KNOWLEDGE_DIR = BACKEND_DIR / "knowledge"
RESUME_PATH = BACKEND_DIR.parent / "assets" / "Varun_SadashiveGowda_Resume.pdf"


def _structured_chunks() -> list[tuple[str, str]]:
    """Hand-authored, high-signal facts. (source, content) pairs."""
    chunks: list[tuple[str, str]] = []

    chunks.append(
        (
            "profile",
            "Varun Sadashive Gowda is an Agentic AI Developer with 3+ years building "
            "multi-agent AI systems and enterprise automation at SAP Labs. He is an "
            "incoming Master of Computer Science student at Texas A&M University "
            "(Fall 2026), seeking Summer 2027 internships in AI, ML, and software "
            "engineering. Contact: varunsg118@gmail.com, linkedin.com/in/varuns11.",
        )
    )

    experience = [
        (
            "experience: SAP Labs — Agentic AI Developer (Sep 2025 – Aug 2026)",
            "As Agentic AI Developer at SAP Labs Bengaluru (GCID CSM Operations "
            "Center & AI CoE EMEA): designed and deployed multi-agent workflows for "
            "SAP GCID Support engineers, reducing work effort by 30% using CrewAI and "
            "LangGraph. Developed custom agent tools for data extraction, solution "
            "analysis, document parsing (PDF/CSV), automated reporting, and image "
            "extraction from PDFs (SAP BOCR). Built and maintained an MCP (Model "
            "Context Protocol) server integrating CLOKS data warehouse and the AIM AI "
            "agents repository. Built a RAG pipeline on Databricks that ingests "
            "enterprise documents, converts to Markdown, performs semantic chunking, "
            "and indexes embeddings in SAP HANA DB. Automated Databricks job execution "
            "via GitHub Actions. Led Docker containerization, cutting image size 67% "
            "(6 GB to 2 GB).",
        ),
        (
            "experience: SAP Labs — Associate Solution Support Engineer (Feb 2023 – Sep 2025)",
            "As Associate Solution Support Engineer at SAP Labs (TS PRC ERP Supply "
            "Chain APJ): resolved 600+ critical customer issues via incident "
            "management using ABAP and C++. Mentored junior engineers, improving team "
            "productivity 20% through code reviews and workshops on Transportation "
            "Management. Collaborated with EWM, MM, SD, and BN4L teams. Built a "
            "knowledge repository accessed by 300+ SAP customers.",
        ),
        (
            "experience: Sandlogic Technologies — AI Intern (Jul – Dec 2021)",
            "AI Intern in Deep Learning & Computer Vision at Sandlogic Technologies: "
            "implemented ResNet and YOLOv5 models for supply-chain computer vision, "
            "annotated datasets, delivered a client project end-to-end with YOLOv5, "
            "and optimized training pipelines via hyperparameter tuning.",
        ),
    ]
    chunks.extend(experience)

    chunks.append(
        (
            "skills",
            "Varun's core skills: Python (ML pipelines, automation), ABAP, Java, "
            "C/C++, SQL, JavaScript. AI/ML: multi-agent orchestration, LLM "
            "integration and tooling, prompt engineering, RAG pipelines, vector "
            "databases, NLP, CrewAI and LangGraph, MCP servers. Also: Kotlin, Go, "
            "Docker, Kubernetes, GitHub Actions, Databricks, SAP HANA DB, AI Core, BTP.",
        )
    )

    chunks.append(
        (
            "education",
            "Education: Master of Computer Science (MCS) at Texas A&M University, "
            "incoming Fall 2026. B.E. in Electronics and Communication Engineering "
            "from JSS Science and Technology University, India (2019–2023), CGPA "
            "8.94/10, coursework in Computer Networks, Operating Systems, and "
            "Cryptography & Network Security.",
        )
    )

    chunks.append(
        (
            "research",
            "Research: two IEEE papers. (1) Text-Independent Speaker Recognition and "
            "Classification using KNN — 96.97% accuracy via a double distance "
            "measurement method. (2) Real-Time Theft Detection using the YOLOv5 "
            "object detection model.",
        )
    )

    chunks.append(
        (
            "projects",
            "Academic projects: Media Player Control by Hand Gestures (real-time "
            "Play/Pause/Skip/Volume via OpenCV + VLC); Perovskite as a Triboelectric "
            "Nanogenerator (fabricated and characterized a thin-film nanogenerator).",
        )
    )

    chunks.append(
        (
            "certifications",
            "Certifications: SAP Generative AI Developer (SAP Certified); Agentic AI "
            "Fundamentals (LinkedIn Learning); Build AI Agents & Chatbots with "
            "LangGraph (LinkedIn Learning).",
        )
    )

    return chunks


def _faq_chunks() -> list[tuple[str, str]]:
    """Split knowledge/faq.md into one chunk per `##` section."""
    path = KNOWLEDGE_DIR / "faq.md"
    if not path.exists():
        return []
    text = path.read_text(encoding="utf-8")
    chunks: list[tuple[str, str]] = []
    # Split on level-2 headings, keep the heading as part of the chunk.
    sections = re.split(r"\n##\s+", text)
    for sec in sections:
        sec = sec.strip()
        if not sec or sec.startswith("#"):
            continue  # skip the title/preamble
        chunks.append(("faq", sec))
    return chunks


def _resume_chunks() -> list[tuple[str, str]]:
    """Extract resume PDF text and chunk it by paragraph. Optional."""
    if not RESUME_PATH.exists():
        print(f"  (resume not found at {RESUME_PATH}, skipping)")
        return []
    try:
        from pypdf import PdfReader
    except ImportError:
        print("  (pypdf not installed, skipping resume)")
        return []

    reader = PdfReader(str(RESUME_PATH))
    full = "\n".join((page.extract_text() or "") for page in reader.pages)
    # Paragraph-ish chunking with a soft size cap.
    paras = [p.strip() for p in re.split(r"\n\s*\n", full) if p.strip()]
    chunks: list[tuple[str, str]] = []
    buf = ""
    for para in paras:
        if len(buf) + len(para) > 900 and buf:
            chunks.append(("resume", buf.strip()))
            buf = ""
        buf += para + "\n"
    if buf.strip():
        chunks.append(("resume", buf.strip()))
    return chunks


def ingest() -> int:
    """Build the knowledge base. Returns the number of chunks indexed."""
    print("Collecting sources...")
    all_chunks = _structured_chunks() + _faq_chunks() + _resume_chunks()

    by_source: dict[str, int] = {}
    for src, _ in all_chunks:
        by_source[src] = by_source.get(src, 0) + 1
    print(f"  Collected {len(all_chunks)} chunks: {by_source}")

    if not all_chunks:
        print("Nothing to ingest.")
        return 0

    # Ensure schema + extension exist.
    init_pgvector()
    Base.metadata.create_all(get_engine())

    print("Embedding (batched)...")
    contents = [c for _, c in all_chunks]
    vectors = embed_batch(contents)
    assert len(vectors) == len(all_chunks), "embedding count mismatch"

    print("Writing to database (replacing existing chunks)...")
    db_gen = get_db()
    db = next(db_gen)
    try:
        db.execute(delete(KBChunk))
        db.add_all(
            KBChunk(source=src, content=content, embedding=vec)
            for (src, content), vec in zip(all_chunks, vectors)
        )
        db.commit()
    finally:
        db.close()

    print(f"Done. Indexed {len(all_chunks)} chunks.")
    return len(all_chunks)


if __name__ == "__main__":
    ingest()
