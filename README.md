# Smart Resume Builder (CSE - AIML Mini Project)
**Affiliation:** Hindustan College of Science & Technology, Farah, Mathura  
**University:** Dr. A. P. J. Abdul Kalam Technical University, Lucknow (AKTU)  
**Department:** Computer Science & Engineering (CSE - AIML)  
**Project Guide:** Mr. Neeraj Kushwah, Asst. Professor, CSE - AIML  
**Team Members:** Aditya Patel, Aditya Saxena, Anuj Sharma, Himanshu Sen  
**Date:** August 2026

---

## 🚀 Overview

The **Smart Resume Builder** is an intelligent, responsive web application designed to guide students and early-career job seekers from structured resume data entry to professional vector-grade PDF export. It incorporates Google Gemini Generative AI alongside client-side rule-based NLP to provide actionable suggestions, Google XYZ action bullets, and live ATS keyword scoring.

---

## 🌟 Core System Features

1. **AI Content Suggestions & Human-in-the-Loop Review:**
   - AI-generated executive summaries and bullet points.
   - **Review / Edit / Accept / Reject Modal:** Users retain full control to edit suggestions before applying them or reject them entirely.
   - Connects directly to Google Gemini API (`gemini-2.0-flash` / `gemini-1.5-flash`) with a built-in offline smart NLP fallback.

2. **Real-Time Live Preview & 4 Professional Templates:**
   - **Modern Tech Standard:** Single-column layout with technical skill badges.
   - **Executive Two-Column:** Two-column architecture featuring a dedicated credentials sidebar.
   - **Minimalist ATS Classic:** 100% parser-safe, high-contrast linear format.
   - **Creative Indigo Banner:** Modern top gradient header with compact layout.

3. **Real-Time ATS Keyword Scorer & Gap Analysis:**
   - Real-time comparison between candidate resume text and target Job Description.
   - Shows matching keywords (green) and missing keywords (yellow chips).
   - 1-Click addition of missing keywords directly into the candidate's skills stack.

4. **Multi-Resume Storage & User Sessions:**
   - Create, switch, duplicate, and delete multiple resumes per user account.
   - Auto-saves all state into browser local storage in real-time.
   - JSON export and import for portable offline backups.

5. **Print-Ready Vector PDF Export:**
   - Uses `html2pdf.js` with exact A4 dimensions (`210mm x 297mm`) and high-resolution canvas scaling.
   - Native `@media print` fallback for direct browser printing.

---

## 🛠️ Technology Stack

| Layer | Technology | Role |
|---|---|---|
| **Frontend** | HTML5, CSS3, JavaScript (ES6+) | User interface, forms, live reactive preview |
| **Styling** | Modern Dark SaaS Design & A4 Print CSS | Responsive cards, glassmorphism, typography |
| **AI / NLP** | Google Gemini API + Local Rule Engine | Generative summaries, XYZ bullet enhancement |
| **Backend** | Python + Flask (optional for server setup) | REST API endpoints, session handling |
| **Database** | SQLite / Browser LocalStorage | User and resume persistent storage |
| **Document** | html2pdf.js / Native Print Engine | Vector-grade A4 printable PDF |

---

## 💻 How to Run the Project

### Option A: Standalone Browser Mode (Zero Installation Required)
Simply double-click or open any of the HTML files in Chrome, Edge, Firefox, or Brave:
- Open `index.html` to view the landing page and live AI simulator.
- Open `builder.html` to launch the AI Resume Studio directly.
- Open `templates.html` to explore the 4 templates.
- Open `login.html` to sign in as any team member or continue as guest.

### Option B: Python Flask + SQLite Backend Server (With Groq AI Support)
If your college lab or presentation system has Python installed:

1. **Install Dependencies:**
   ```bash
   cd backend
   pip install -r requirements.txt
   ```

2. **Configure Groq AI Key (Server-Side):**
   - Copy `.env.example` to `.env` in the root or `backend/` folder:
     ```bash
     cp .env.example .env
     ```
   - Open `.env` and paste your Groq API key:
     ```env
     GROQ_API_KEY=gsk_your_actual_key_here
     ```
   - Get a free key anytime from [Groq Console](https://console.groq.com/keys).

3. **Start the Flask Backend Server:**
   ```bash
   python backend/app.py
   # Or using npm: npm start
   # Or from backend directory: cd backend && python app.py
   ```
   The server auto-detects `.env`, binds to `0.0.0.0:5000`, and is accessible at `http://localhost:5000` and `http://127.0.0.1:5000`.

4. **Verify Health Check & Authentication Service:**
   - In browser or terminal, verify `http://localhost:5000/api/health`.
   - Returns JSON status: `{ "status": "healthy", "backend": "running", "database": "connected", "ai": { "groq_configured": true/false }, "mail": { "smtp_configured": true/false } }`.

5. **Open in Browser:**
   - Open `http://localhost:5000/builder.html` or `http://localhost:5000/index.html`.
   - If running via VS Code Live Server (e.g. `http://127.0.0.1:5500`) or opening `index.html` as a `file://`, the UI automatically aligns API calls to `http://127.0.0.1:5000` or `http://localhost:5000` with automatic fallback.
   - The top navigation bar displays a live health indicator (`🟢 AI Ready`, `⚠️ Key Missing`, or `🔴 Backend Offline`). You can click the indicator to view health status or customize the backend URL.

---

## 🔒 Groq AI Architecture & Security Model

- **Server-Side Key Isolation:** The Groq API key is strictly maintained within the server environment (`GROQ_API_KEY` in `.env` or system environment). It is **never** embedded in frontend bundles, emitted in HTTP responses, or stored in browser `localStorage`.
- **Single Configurable Backend URL:** All frontend network requests use a central API URL resolver (`getApiBase()`), defaulting to `http://localhost:5000` (or relative `""` when served by Flask). It can be configured in the AI Settings Modal or via `localStorage.getItem('smart_resume_api_base')`.
- **Backend API Routes & Health Check:**
  - `GET /api/health`: Comprehensive health check verifying backend connectivity, SQLite database status, CORS preflight, Groq AI key status, and SMTP mail configuration.
  - `POST /api/auth/send-verification`: Dispatches secure 6-digit confirmation code via server-side SMTP. Differentiates backend server offline from SMTP unconfigured (HTTP 503 with actionable setup steps).
  - `POST /api/auth/verify-code`: Validates 6-digit verification code against PBKDF2 salted hash in memory and activates account in SQLite.
  - `POST /api/groq-chat`: General AI chat generation (summary, bullet points, tailoring, feedback) via Groq's high-speed LPU inference.
  - `POST /api/ai/cover-letter`: Generates tailored cover letters given job description and resume content.
  - `GET /api/ai/status`: Inspects whether `GROQ_API_KEY` is configured without revealing the secret key.
- **Graceful Error Handling:**
  - If the backend is not running, the UI displays clear, actionable setup steps: `"Could not connect to authentication server at http://localhost:5000. Please ensure the backend server is running ('python backend/app.py')"`
  - If SMTP mail credentials are not configured, the backend returns HTTP 503 explaining that SMTP_USER / SMTP_PASSWORD are required in `.env`, distinct from server connectivity.
  - If `GROQ_API_KEY` is missing on the server, the backend returns HTTP 503 with instructions: `"GROQ_API_KEY is not configured on the server. Please set GROQ_API_KEY in the server environment or .env file to enable Groq AI generation."`
  - If rate limits (429) or invalid credentials (401) occur, the backend relays descriptive status codes and messages instead of failing silently.
  - The UI displays informative toast and modal banners guiding the developer on exact next steps.

---

## 📧 Email Verification & SMTP Setup (Gmail SMTP)

The backend dispatches authoritative 6-digit email confirmation codes to activate user accounts upon registration.

### Required SMTP Environment Variables
Configure these variables in your server `.env` file:

```env
# Primary SMTP configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=your_16_char_app_password
SMTP_FROM=your_email@gmail.com
SMTP_USE_TLS=true
```

### Gmail SMTP Setup Instructions
When sending verification emails through Gmail:
1. **Server Host:** `smtp.gmail.com`
2. **Port & Encryption:** Port `587` with TLS enabled (`SMTP_USE_TLS=true`).
3. **Google Account Security Requirements:**
   - **2-Step Verification:** Must be enabled on your Google Account ([Google Account Security](https://myaccount.google.com/security)).
   - **Google App Password:** You MUST generate a 16-character Google App Password at [Google Account App Passwords](https://myaccount.google.com/apppasswords).
   - Enter `Smart Resume AI` as the application name, generate the password, and paste the 16 characters into `SMTP_PASSWORD`.
   - **Important:** Standard Google account passwords cannot be used over SMTP and will be rejected with `535 5.7.8 Username and Password not accepted`. Spaces in the 16-character App Password are automatically removed by the backend.
4. **Sender Address (`SMTP_FROM`):** Must match your authenticated Gmail address (`SMTP_USER`) or an authorized sending alias.

### Privacy & Security Guarantee
- **Credentials Never Committed:** `.env` and `backend/.env` are strictly excluded in `.gitignore`. Credentials are read server-side only and never sent to the browser or client bundles.
- **Secret Redaction in Logs:** Server-side SMTP diagnostics automatically mask email addresses (e.g. `jo***@gmail.com`) and redact all passwords and verification codes.
- **Strict Verification Enforcement:** Accounts remain inactive (`is_verified = 0`) until the user successfully enters the 6-digit confirmation code. If email delivery fails, the user receives a safe, actionable error message and no unverified account is activated.

---

## 📂 Project Directory Structure

```
smart-resume-ai/
├── index.html              # Landing page with interactive AI demo simulator
├── builder.html            # Core AI Studio Workspace with A4 live preview
├── templates.html          # Template gallery with filtering & direct studio launch
├── login.html              # Authentication & team demo login accounts
├── style.css               # Comprehensive dark theme & A4 print CSS
├── app.js                  # Reactive state engine, Gemini API, ATS analyzer & PDF export
├── README.md               # Project documentation & academic synopsis
└── backend/                # Python + Flask + SQLite backend architecture
    ├── app.py              # Flask REST API server
    ├── database.py         # SQLite schema & pre-seeded student accounts
    └── requirements.txt    # Python dependencies
```
