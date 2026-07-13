/**
 * Single source of truth for all portfolio content.
 *
 * Both the UI (section components) and the RAG chatbot's knowledge base are
 * built from this file. Keep everything typed so a change here surfaces
 * everywhere it's used.
 */

export const profile = {
  name: "Varun Sadashive Gowda",
  firstName: "Varun",
  lastName: "Sadashive Gowda",
  logo: "vsg.",
  status:
    "Incoming MCS Student · Texas A&M University · Seeking Summer 2027 Internships",
  tagline:
    "AI Developer with 3+ years building agentic AI systems and enterprise automation. Previously at SAP Labs, now bringing that experience to grad school and industry opportunities.",
  roles: [
    "Agentic AI Developer",
    "Multi-Agent Systems Engineer",
    "LLM Infrastructure Builder",
    "Full Stack Developer",
    "Claude Max Plan Enjoyer 🤌",
  ],
  email: "varunsg118@gmail.com",
  eduEmail: "varunsg11@tamu.edu",
  phone: "+91 84312 62742",
  linkedin: "https://www.linkedin.com/in/varuns11/",
  github: "https://github.com/varunsg11",
  resumeUrl: "https://portfolio-9s06.onrender.com/resume",
  metaDescription:
    "Varun Sadashive Gowda — Incoming MCS student at Texas A&M, Agentic AI Developer with 3+ years building multi-agent systems and enterprise AI. Seeking Summer 2027 internships.",
} as const;

export const navLinks = [
  { href: "#about", label: "About" },
  { href: "#experience", label: "Experience" },
  { href: "#research", label: "Research" },
  { href: "#projects", label: "Projects" },
  { href: "#contact", label: "Contact" },
] as const;

export const bio = {
  paragraphs: [
    "Driven AI engineer who transforms complex enterprise problems into scalable intelligent systems. I combine architectural thinking with hands-on development to deliver agentic AI solutions that improve operational efficiency.",
    "Known for rapid learning, clear technical communication, and collaborating across teams to build reliable, production-ready AI systems.",
  ],
  interests: ["LLM infrastructure", "multi-agent orchestration", "applied ML systems"],
} as const;

export type Skill = {
  name: string;
  icon: string; // Font Awesome class
  percent: number;
  blurb: string;
};

export const skills: Skill[] = [
  { name: "Python", icon: "fab fa-python", percent: 90, blurb: "ML pipelines, automation, AI development" },
  { name: "ABAP", icon: "fas fa-database", percent: 90, blurb: "SAP development & integrations" },
  { name: "Java", icon: "fab fa-java", percent: 70, blurb: "OOP & backend development" },
  { name: "C / C++", icon: "fas fa-code", percent: 78, blurb: "Systems & algorithmic foundations" },
  { name: "SQL", icon: "fas fa-database", percent: 75, blurb: "Database design & semantic search" },
  { name: "JavaScript", icon: "fab fa-js", percent: 85, blurb: "Frontend interactions & scripting" },
];

export const techPills = {
  alsoWorkWith: [
    "PyTorch", "LangChain", "Docker", "Go", "YAML", "Kubernetes", "GitHub Actions",
    "Databricks", "SAP HANA DB", "MLflow", "Hugging Face", "vLLM", "OpenAI API",
  ],
  aiml: [
    "Multi-Agent Orchestration", "LLM Integration & Tooling", "Prompt Engineering",
    "RAG Pipelines", "Vector Databases & Semantic Search", "NLP",
    "CrewAI & LangGraph", "MCP Server", "Transformer Fine-tuning (PEFT/LoRA)",
    "MLOps", "Statistical Modeling",
  ],
} as const;

export type Experience = {
  title: string;
  company: string;
  date: string;
  bullets: string[];
};

export const experience: Experience[] = [
  {
    title: "Agentic AI Developer",
    company: "SAP Labs · Bengaluru · GCID CSM Operations Center & AI CoE EMEA",
    date: "Sep 2025 – Aug 2026",
    bullets: [
      "Designed and deployed multi-agent workflows for SAP GCID Support engineers, reducing work effort by 30% using CrewAI & LangGraph.",
      "Developed custom agent tools for data extraction, solution analysis, document parsing (PDF/CSV), automated reporting, and image extraction from PDFs (SAP BOCR).",
      "Built and maintained an MCP (Model Context Protocol) server integrating CLOKS (data warehouse) and AIM (AI agents) repositories.",
      "Built a RAG pipeline on Databricks — ingests enterprise documents, converts to Markdown, performs semantic chunking, and indexes embeddings in SAP HANA DB.",
      "Automated Databricks job execution via GitHub Actions, enabling CI/CD-driven orchestration of data workflows.",
      "Led Docker containerization efforts, cutting image size by 67% (6 GB → 2 GB).",
    ],
  },
  {
    title: "Associate Solution Support Engineer",
    company: "SAP Labs · Bengaluru · TS PRC ERP Supply Chain APJ",
    date: "Feb 2023 – Sep 2025",
    bullets: [
      "Resolved 600+ critical issues for SAP customers through incident management. [ABAP, C++]",
      "Mentored junior engineers and external hires, enhancing team productivity by 20% through code reviews and technical workshops on Transportation Management.",
      "Collaborated with EWM, MM, SD, and BN4L cross-functional teams to create datasets for internal systems.",
      "Compiled a knowledge repository accessed by 300+ SAP customers.",
      "Assisted customers with greenfield/brownfield implementation design and clean core operations.",
    ],
  },
  {
    title: "AI Intern – Deep Learning & Computer Vision",
    company: "Sandlogic Technologies · Bengaluru",
    date: "Jul – Dec 2021",
    bullets: [
      "Implemented ResNet and YOLOv5 models for supply chain computer vision applications. [Python]",
      "Annotated datasets and developed a client project end-to-end using YOLOv5.",
      "Optimized training pipelines through hyperparameter tuning and data preprocessing.",
    ],
  },
];

export type Certification = {
  title: string;
  issuer: string;
  icon: string;
  url: string;
};

export const certifications: Certification[] = [
  {
    title: "SAP Generative AI Developer",
    issuer: "SAP Certified",
    icon: "fas fa-certificate",
    url: "https://www.credly.com/earner/earned/badge/f12bb36c-42b6-4c13-a94d-1b82bc5d9598",
  },
  {
    title: "Agentic AI Fundamentals",
    issuer: "LinkedIn Learning",
    icon: "fas fa-robot",
    url: "https://www.linkedin.com/learning/certificates/9017212c75b738549e205097aa60bc3ebda8a2cbee4f7659903eba719aca9b1f",
  },
  {
    title: "Build AI Agents & Chatbots with LangGraph",
    issuer: "LinkedIn Learning",
    icon: "fas fa-project-diagram",
    url: "https://www.linkedin.com/learning/certificates/9017212c75b738549e205097aa60bc3ebda8a2cbee4f7659903eba719aca9b1f",
  },
];

export type ResearchPaper = {
  title: string;
  summary: string;
  tag: string;
  icon: string;
  url: string;
};

export const research: ResearchPaper[] = [
  {
    title: "Text Independent Speaker Recognition and Classification using KNN Algorithm",
    summary:
      "Achieved 96.97% accuracy using a double distance measurement method, surpassing KNN's 84.85%. Investigated speaker idolization for improved transcription and secure smart environments.",
    tag: "IEEE",
    icon: "fas fa-microphone-alt",
    url: "https://ieeexplore.ieee.org/abstract/document/10072615",
  },
  {
    title: "Real Time Theft Detection Using YOLOv5 Object Detection Model",
    summary:
      "Automated theft detection using YOLOv5, enabling real-time identification of theft events with alerts to owners and authorities. Leveraged deep learning and object detection for real-world deployment.",
    tag: "IEEE",
    icon: "fas fa-shield-alt",
    url: "https://ieeexplore.ieee.org/document/10351223",
  },
];

export type Project = {
  title: string;
  summary: string;
  icon: string;
  tags: string[];
};

export const projects: Project[] = [
  {
    title: "Media Player Control by Hand Gestures",
    summary:
      "Real-time media player controlled via hand gestures (Play, Pause, Skip, Volume) using OpenCV integrated with VLC.",
    icon: "fas fa-hand-paper",
    tags: ["Python", "OpenCV", "Computer Vision"],
  },
  {
    title: "Perovskite as a Triboelectric Nanogenerator",
    summary:
      "Fabricated a 5×5×0.1cm thin film and characterized its triboelectric properties to investigate nanogenerator performance.",
    icon: "fas fa-bolt",
    tags: ["Materials Science", "Nanotechnology"],
  },
];

export type Education = {
  degree: string;
  school: string;
  meta: string;
  note?: string;
  courses?: string;
  icon: string;
  featured?: boolean;
  badge?: string;
};

export const education: Education[] = [
  {
    degree: "Master of Computer Science (MCS)",
    school: "Texas A&M University",
    meta: "Fall 2026",
    note: "Seeking Summer 2027 internships in AI / ML / Software Engineering",
    icon: "fas fa-graduation-cap",
    featured: true,
    badge: "Incoming",
  },
  {
    degree: "B.E. – Electronics and Communication Engineering",
    school: "JSS Science and Technology University, India",
    meta: "2019 – 2023 · CGPA: 8.94 / 10",
    courses: "Computer Networks · Operating Systems · Cryptography & Network Security",
    icon: "fas fa-university",
  },
];
