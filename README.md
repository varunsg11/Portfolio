# 🌐 varunsg.dev — Personal Portfolio

> Personal portfolio website for **Varun Sadashive Gowda** — AI Engineer & incoming MCS student at Texas A&M University (Fall 2026).

[![Live Site](https://img.shields.io/badge/Live%20Site-varunsg.dev-blue?style=flat-square)](https://varunsg.dev)
[![Frontend](https://img.shields.io/badge/Frontend-Netlify-00C7B7?style=flat-square&logo=netlify)](https://netlify.com)
[![Backend](https://img.shields.io/badge/Backend-Render-46E3B7?style=flat-square&logo=render)](https://render.com)
[![Python](https://img.shields.io/badge/Python-3.14-3776AB?style=flat-square&logo=python)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=flat-square&logo=fastapi)](https://fastapi.tiangolo.com)

---

## ✨ Features

- **Animated hero section** with typewriter role cycling and blob backgrounds
- **Work experience timeline** with smooth scroll-driven animations
- **Skill proficiency rings** with SVG stroke animation
- **Research papers & certifications** showcase
- **Contact form** — async POST to backend, delivers email via Resend API
- **Resume download** — one-click PDF download served from the backend
- **Fully responsive** — mobile-first layout with hamburger nav
- **Dark theme** with glassmorphism cards and grain texture overlay

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|-----------|---------|
| HTML5, CSS3, Vanilla JS | No build step, no framework |
| CSS Custom Properties | Design system & dark theme |
| IntersectionObserver API | Scroll-driven fade-up animations |
| Font Awesome 6 + Google Fonts | Icons and typography (CDN) |

### Backend
| Technology | Purpose |
|-----------|---------|
| Python 3.14 + FastAPI | REST API server |
| Uvicorn | ASGI server |
| Pydantic (with email validation) | Request body validation |
| slowapi | Rate limiting (3 req/min per IP) |
| Resend | Transactional email delivery |
| python-dotenv | Secret management via `.env` |

### Infrastructure
| Service | Role |
|---------|------|
| Netlify | Frontend hosting — auto-deploys from `frontend/` on push to `main` |
| Render (free tier) | Backend hosting — auto-deploys from `backend/` on push to `main` |
| Resend | Email API (3,000 emails/month on free tier) |
| varunsg.dev | Custom domain |

---

## 📁 Project Structure

```
portfolio/
├── assets/
│   ├── me.jpg                      # Profile photo (hero section)
│   └── Varun_237008771.pdf         # Resume PDF served by /resume endpoint
│
├── frontend/                       # Static site → deployed to Netlify
│   ├── index.html                  # Single-page portfolio (all sections)
│   ├── style.css                   # All styles, animations, responsive layout
│   └── script.js                   # Scroll animations, nav, contact form, typewriter
│
├── backend/                        # Python API → deployed to Render
│   ├── main.py                     # FastAPI app — 3 endpoints
│   ├── requirements.txt            # Python dependencies
│   └── .env                        # gitignored — API keys (see below)
│
└── .gitignore
```

---

## ⚙️ Local Development

### Prerequisites
- Python 3.10+
- A [Resend](https://resend.com) account and API key

### Frontend

No build step required. Open `frontend/index.html` directly in a browser, or use a local server for accurate fetch behavior:

```bash
cd frontend
python -m http.server 8080
# → http://localhost:8080
```

### Backend

```bash
cd backend

# 1. Create and activate a virtual environment
python -m venv venv
source venv/bin/activate        # macOS/Linux
venv\Scripts\activate           # Windows

# 2. Install dependencies
pip install -r requirements.txt

# 3. Create the .env file
echo "RESEND_API_KEY=your_resend_api_key_here" > .env

# 4. Start the development server
uvicorn main:app --reload
# → http://localhost:8000
```

---

## 🔐 Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `RESEND_API_KEY` | Yes | API key from [resend.com](https://resend.com) — used to send contact form emails |


---

## 📡 API Reference

Base URL (production): `https://your-render-app.onrender.com`

### `POST /api/contact`
Sends a contact form email to the site owner. Rate-limited to **3 requests per minute per IP**.

**Request body:**
```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "subject": "Opportunity",
  "message": "Hi Varun, I'd love to connect."
}
```

**Response:**
```json
{ "message": "Sent" }
```

---

### `GET /resume`
Downloads the resume PDF.

**Response:** `application/pdf` file download — `Varun_Sadashive_Gowda_Resume.pdf`

---

### `GET /health`
Health check endpoint.

**Response:**
```json
{ "status": "ok" }
```

---

## 🚀 Deployment

Both services auto-deploy on every push to `main`. No manual steps needed after initial setup.

| Service | Deploy time | Notes |
|---------|------------|-------|
| Netlify (frontend) | ~30 seconds | Publish directory: `frontend/` |
| Render (backend) | ~2 minutes | Free tier cold-starts after 15 min of inactivity |

### CORS
The backend allows requests from:
- `https://varunsg.dev`
- `https://www.varunsg.dev`
- `http://localhost:5500` (local dev)
- `http://127.0.0.1:5500` (local dev)

If you fork this project, update the `allow_origins` list in `backend/main.py` to match your domain.

---

## 📄 License

This project is open source. Feel free to use it as inspiration for your own portfolio — just swap out the personal content.
