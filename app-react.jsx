const { useState, useEffect, useRef, useMemo, useCallback } = React;


// Distinctive Brand Logo Component
function BrandLogo({ size = 'md', className = '' }) {
  const isLg = size === 'lg';
  const width = isLg ? 250 : 205;
  const height = isLg ? 46 : 38;

  return (
    <div className={`brand-logo-container ${className}`} style={{ display: 'inline-flex', alignItems: 'center', userSelect: 'none' }}>
      <svg viewBox="0 0 240 44" fill="none" className="brand-logo-svg" style={{ width: `${width}px`, height: `${height}px`, display: 'block' }} role="img" aria-label="Smart Resume AI Builder">
        <g transform="translate(2, 4)">
          <path d="M4 2 C4 0.9 4.9 0 6 0 H22 L32 10 V34 C32 35.1 31.1 36 30 36 H6 C4.9 36 4 35.1 4 34 Z" fill="#111622" stroke="rgba(255, 255, 255, 0.18)" strokeWidth="1.2" strokeLinejoin="round" />
          <path d="M22 0 V8 C22 9.1 22.9 10 24 10 H32 Z" fill="#1c2333" stroke="rgba(255, 255, 255, 0.25)" strokeWidth="1" strokeLinejoin="round" />
          <rect x="9" y="14" width="18" height="2" rx="1" fill="#475569" opacity="0.6" />
          <rect x="9" y="19" width="14" height="2" rx="1" fill="#475569" opacity="0.45" />
          <rect x="9" y="24" width="16" height="2" rx="1" fill="#475569" opacity="0.45" />
          <rect x="9" y="29" width="11" height="2" rx="1" fill="#475569" opacity="0.35" />
          <path d="M22 1 C22 5 20 7 16 7 C20 7 22 9 22 13 C22 9 24 7 28 7 C24 7 22 5 22 1 Z" fill="#f59e0b" />
          <circle cx="22" cy="7" r="1.2" fill="#fffbeb" />
        </g>
        <g transform="translate(44, 0)">
          <text x="0" y="22" fontFamily="'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" fontSize="16" fontWeight="800" letterSpacing="0.05em" fill="#f1f3f7">SMART RESUME</text>
          <text x="0.5" y="34.5" fontFamily="'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" fontSize="9" fontWeight="700" letterSpacing="0.28em" fill="#f59e0b">AI BUILDER</text>
        </g>
      </svg>
    </div>
  );
}

// Curated Professional Color Palettes
const COLOR_PALETTES = {
  blue: { primary: '#1e3a8a', accent: '#2563eb', light: '#eff6ff' },
  emerald: { primary: '#064e3b', accent: '#059669', light: '#ecfdf5' },
  purple: { primary: '#4c1d95', accent: '#7c3aed', light: '#f5f3ff' },
  amber: { primary: '#78350f', accent: '#d97706', light: '#fffbeb' },
  rose: { primary: '#881337', accent: '#e11d48', light: '#fff1f2' },
  slate: { primary: '#0f172a', accent: '#334155', light: '#f8fafc' },
  charcoal: { primary: '#18181b', accent: '#27272a', light: '#f4f4f5' }
};

// =========================================================
// CONFIGURABLE BACKEND API BASE & HEALTH CHECK
// Default: 'http://localhost:5000' (or '' when served directly from Flask on port 5000)
// Configurable via:
// 1. window.__SMART_RESUME_API_BASE__
// 2. localStorage.getItem('smart_resume_api_base')
// 3. Fallback: auto-detected host or 'http://localhost:5000'
// =========================================================
const DEFAULT_BACKEND_PORT = 5000;
const DEFAULT_BACKEND_URL = 'http://localhost:5000';

function normalizeApiBaseUrl(url) {
  if (!url || typeof url !== 'string' || !url.trim()) return DEFAULT_BACKEND_URL;
  let clean = url.trim();
  // Strip all trailing slashes
  clean = clean.replace(/\/+$/, '');
  // If protocol missing and not relative, default to http://
  if (clean && !/^https?:\/\//i.test(clean) && !clean.startsWith('/')) {
    clean = 'http://' + clean;
  }
  return clean;
}

function getApiBase() {
  if (typeof window === 'undefined') return DEFAULT_BACKEND_URL;

  // 1. Explicit window override
  if (window.__SMART_RESUME_API_BASE__) {
    return normalizeApiBaseUrl(window.__SMART_RESUME_API_BASE__);
  }

  // 2. User configured override in browser storage
  try {
    const saved = localStorage.getItem('smart_resume_api_base');
    if (saved && saved.trim()) {
      return normalizeApiBaseUrl(saved);
    }
  } catch (_) {}

  // 3. If running directly under Flask on port 5000
  if (window.location && window.location.protocol !== 'file:') {
    const port = window.location.port;
    if (port === '5000' || (!port && window.location.host && window.location.host.endsWith(':5000'))) {
      return '';
    }
    // Dynamic local hostname alignment: if frontend is on 127.0.0.1 (e.g. VS Code Live Server 127.0.0.1:5500),
    // align API requests to 127.0.0.1:5000 to avoid IPv6 vs IPv4 localhost resolution mismatch on Windows
    if (window.location.hostname === '127.0.0.1') {
      return 'http://127.0.0.1:5000';
    }
    if (window.location.hostname === 'localhost') {
      return 'http://localhost:5000';
    }
    if (window.location.hostname && window.location.hostname !== 'localhost') {
      const proto = window.location.protocol === 'https:' ? 'https:' : 'http:';
      return `${proto}//${window.location.hostname}:5000`;
    }
  }

  // 4. Default for file://, Live Server (:5500), Vite (:5173), etc.
  return DEFAULT_BACKEND_URL;
}

function setApiBase(url) {
  try {
    if (!url || !url.trim()) {
      localStorage.removeItem('smart_resume_api_base');
    } else {
      const normalized = normalizeApiBaseUrl(url);
      localStorage.setItem('smart_resume_api_base', normalized);
    }
  } catch (_) {}
}

const API_BASE = getApiBase();
const GROQ_DEFAULT_MODEL = 'llama-3.3-70b-versatile';

async function authApiFetch(endpoint, options = {}) {
  const base = getApiBase();
  const url = `${base}${endpoint}`;
  try {
    return await fetch(url, options);
  } catch (err) {
    // If request failed due to host resolution (e.g. localhost [::1] on Windows), retry on alternate local host
    if (url.includes('localhost:5000')) {
      const altUrl = url.replace('localhost:5000', '127.0.0.1:5000');
      try {
        return await fetch(altUrl, options);
      } catch (_) {}
    } else if (url.includes('127.0.0.1:5000')) {
      const altUrl = url.replace('127.0.0.1:5000', 'localhost:5000');
      try {
        return await fetch(altUrl, options);
      } catch (_) {}
    }
    throw err;
  }
}

async function checkBackendHealth(customUrl = null) {
  const rawBase = customUrl !== null ? customUrl : getApiBase();
  const baseUrl = normalizeApiBaseUrl(rawBase);
  const url = `${baseUrl}/api/health`;
  const startTime = Date.now();

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);
    let res;
    try {
      res = await fetch(url, {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
        signal: controller.signal
      });
    } catch (primaryErr) {
      if (baseUrl.includes('localhost:5000')) {
        const altUrl = url.replace('localhost:5000', '127.0.0.1:5000');
        res = await fetch(altUrl, {
          method: 'GET',
          headers: { 'Accept': 'application/json' },
          signal: controller.signal
        });
      } else if (baseUrl.includes('127.0.0.1:5000')) {
        const altUrl = url.replace('127.0.0.1:5000', 'localhost:5000');
        res = await fetch(altUrl, {
          method: 'GET',
          headers: { 'Accept': 'application/json' },
          signal: controller.signal
        });
      } else {
        throw primaryErr;
      }
    }
    clearTimeout(timeoutId);

    const latencyMs = Date.now() - startTime;
    if (res.ok) {
      const data = await res.json().catch(() => null);
      if (data && (data.status === 'healthy' || data.backend === 'running')) {
        const isDbConnected = data.database === 'connected' || data.database === 'healthy';
        return {
          reachable: true,
          status: isDbConnected ? 'healthy' : 'unhealthy',
          latencyMs,
          port: data.port || DEFAULT_BACKEND_PORT,
          database: data.database || 'connected',
          groqConfigured: !!(data.ai && data.ai.groq_configured),
          keyStatus: (data.ai && data.ai.key_status) || 'Not Configured',
          provider: (data.ai && data.ai.provider) || 'Groq Cloud AI (Llama 3.3 70B)',
          defaultModel: (data.ai && data.ai.default_model) || 'llama-3.3-70b-versatile',
          baseUrl: baseUrl,
          error: isDbConnected ? null : `Database reported issue: ${data.database}`
        };
      } else {
        return {
          reachable: true,
          status: 'unhealthy',
          latencyMs,
          port: data?.port || DEFAULT_BACKEND_PORT,
          database: data?.database || 'unknown',
          groqConfigured: !!(data?.ai && data?.ai.groq_configured),
          keyStatus: (data?.ai && data?.ai.key_status) || 'Not Configured',
          baseUrl: baseUrl,
          error: `Backend returned non-healthy status: ${JSON.stringify(data)}`
        };
      }
    } else {
      // Server responded with HTTP error: reachable, but unhealthy!
      const errText = await res.text().catch(() => '');
      return {
        reachable: true,
        status: 'unhealthy',
        latencyMs,
        baseUrl: baseUrl,
        error: `Server responded with HTTP ${res.status}: ${errText.substring(0, 100) || res.statusText}`
      };
    }
  } catch (err) {
    // Server is unreachable (connection refused, network error, timeout)
    const latencyMs = Date.now() - startTime;
    return {
      reachable: false,
      status: 'unreachable',
      latencyMs,
      baseUrl: baseUrl,
      error: err.name === 'AbortError' 
        ? `Connection timed out (>4s) attempting to reach ${baseUrl}` 
        : `Could not connect to ${baseUrl}. Connection refused or server offline.`
    };
  }
}

// Global Toast System
function toast(message, type = 'info') {
  let stack = document.getElementById('toast-stack');
  if (!stack) {
    stack = document.createElement('div');
    stack.id = 'toast-stack';
    document.body.appendChild(stack);
  }
  const el = document.createElement('div');
  el.className = `toast toast-${type}`;
  const icon = type === 'success' ? '✓' : type === 'error' ? '✕' : '✦';
  const cleanMsg = String(message).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  el.innerHTML = `<span class="toast-icon">${icon}</span> <span class="toast-msg">${cleanMsg}</span>`;
  stack.appendChild(el);

  setTimeout(() => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(10px)';
    el.style.transition = 'all 0.3s ease';
    setTimeout(() => {
      if (el.parentNode) el.remove();
    }, 300);
  }, 3200);
}

// Global Groq AI Connector routing via secure backend proxy
async function callGroqAI(prompt, systemInstruction = '', customModel = null) {
  const model = customModel || localStorage.getItem('groq_selected_model') || localStorage.getItem('smart_resume_groq_model') || GROQ_DEFAULT_MODEL;
  const apiBase = getApiBase();

  // 1. Try Backend Flask Proxy (server holds GROQ_API_KEY securely in server environment)
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 20000);
    const proxyRes = await fetch(`${apiBase}/api/groq-chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt: prompt,
        system_instruction: systemInstruction,
        model: model
      }),
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    const data = await proxyRes.json().catch(() => null);

    if (proxyRes.ok && data && data.success && data.text) {
      return { 
        success: true, 
        text: data.text.trim(), 
        engine: data.engine || `Groq AI (${model})` 
      };
    }

    if (data && data.error) {
      toast(data.error, 'error');
      return {
        success: false,
        error: data.error,
        text: null
      };
    }
  } catch (e) {
    console.warn("Backend Groq AI endpoint unreachable:", e);
    const serverUrl = apiBase || 'http://localhost:5000';
    toast(`Backend AI server unreachable. Please run 'python backend/app.py' on ${serverUrl}`, "error");
    return {
      success: false,
      error: `Backend AI server unreachable on ${serverUrl}`,
      text: null
    };
  }

  return {
    success: false,
    error: "Groq AI generation unavailable",
    text: null
  };
}

// Deterministic Smart Generative NLP Content Engine
function generateSmartNLPContent(type, params = {}) {
  const role = params.role || 'Software Engineer';
  const company = params.company || 'Tech Solutions';
  const skills = params.skills || 'TypeScript, React, Node.js, Cloud Architecture';
  const name = params.name || 'Candidate';
  const tone = (params.tone || 'professional').toLowerCase();

  const skillList = skills.split(',').map(s => s.trim()).filter(Boolean);
  const topSkills = skillList.slice(0, 4).join(', ') || 'modern full-stack software systems';
  const otherSkills = skillList.slice(4, 8).join(', ') || 'distributed cloud architecture';

  if (type === 'summary') {
    if (tone === 'executive') {
      return `Strategic and results-driven ${role} with a demonstrated record of engineering excellence in ${topSkills}. Proven track record architecting mission-critical distributed systems, improving team delivery velocity by 38%, and aligning technological roadmaps with high-growth business objectives. Adept in ${otherSkills}, cross-functional leadership, and scaling operational throughput to support 150k+ daily active users.`;
    }
    if (tone === 'technical') {
      return `Systems-oriented ${role} specializing in ${topSkills} with a deep emphasis on clean architecture, low-latency API design, and containerized cloud microservices. Successfully reduced endpoint p99 response times by 46% while sustaining 99.98% production uptime. Experienced in ${otherSkills}, test-driven development, and automated CI/CD pipelines.`;
    }
    if (tone === 'concise') {
      return `High-impact ${role} proficient in ${topSkills} and ${otherSkills}. Proven success accelerating release cycles by 35% and deploying resilient cloud software. Dedicated to clean code, performance optimization, and collaborative agile engineering.`;
    }
    if (tone === 'persuasive') {
      return `Dynamic and innovative ${role} passionate about delivering transformative user experiences through ${topSkills}. Recognized for bridging complex engineering architectures with real-world user value, boosting overall platform engagement by 40%. Highly skilled in ${otherSkills}, rapid prototyping, and cross-functional team collaboration.`;
    }
    return `Results-driven ${role} with deep technical proficiency in ${topSkills}. Proven track record of architecting resilient digital applications, accelerating feature release cycles by 35%, and scaling operational throughput to support 100k+ active users. Skilled in ${otherSkills}, test-driven development, and collaborating across agile engineering teams to achieve measurable business outcomes.`;
  }

  if (type === 'objective') {
    const spec = (params.specialization || '').toLowerCase();
    if (spec.includes('ai') || spec.includes('data')) {
      return `Analytical and forward-thinking ${role} with strong foundations in Machine Learning, Python, and data structures. Eager to contribute to high-impact predictive modeling, deep learning pipelines, and production AI deployments in a collaborative data-driven engineering team.`;
    }
    if (spec.includes('cloud') || spec.includes('devops')) {
      return `Dedicated ${role} with hands-on expertise in cloud infrastructure, container orchestration, and automated CI/CD workflows. Passionate about maximizing system reliability, optimizing serverless architectures, and driving infrastructure-as-code initiatives.`;
    }
    if (spec.includes('front') || spec.includes('ui')) {
      return `Creative and performance-focused ${role} specializing in modern responsive web applications with React, TypeScript, and state management. Driven to craft pixel-perfect, accessible, and high-performance digital interfaces that delight users.`;
    }
    return `Ambitious and forward-thinking ${role} with a rigorous academic foundation in ${topSkills}. Eager to leverage technical problem-solving capabilities, rapid prototyping agility, and clean architecture principles to deliver mission-critical software solutions in an innovative engineering environment.`;
  }

  if (type === 'role_bullets') {
    return [
      `• Architected and deployed scalable full-stack services at ${company} using ${topSkills}, cutting core API p99 response times by 42% under high concurrency.`,
      `• Engineered automated CI/CD build and testing pipelines with Docker and GitHub Actions, reducing release turnaround times from 3 hours to under 15 minutes.`,
      `• Spearheaded database query optimizations and caching strategies with Redis/PostgreSQL, reducing database server CPU utilization by 34% while ensuring 99.95% uptime.`,
      `• Collaborated with cross-functional engineering, product, and QA teams to achieve 92% automated unit and integration test coverage across all production releases.`
    ].join('\n');
  }

  if (type === 'project_bullets') {
    const projTitle = params.title || 'Full-Stack Application';
    const projTech = params.tech || topSkills;
    return [
      `• Designed and implemented end-to-end architecture for ${projTitle} utilizing ${projTech}, achieving sub-100ms response latencies for 10k+ simulated concurrent sessions.`,
      `• Integrated secure token-based authentication (JWT), role-based access control, and asynchronous job processing, eliminating 95% of unauthorized request attempts.`,
      `• Containerized full application stack using Docker and deployed on cloud infrastructure with automated zero-downtime deployment workflows.`
    ].join('\n');
  }

  if (type === 'coursework') {
    const degree = params.degree || 'B.Tech in Computer Science';
    return `GPA: 3.88 / 4.0 | Dean's Academic Honors | Relevant Coursework: Data Structures & Algorithms, Distributed Systems, Database Management Systems, Machine Learning, Computer Networks, Operating Systems, Software Engineering Methodologies.`;
  }

  if (type === 'bullets') {
    const raw = params.raw || '';
    const lines = raw.split('\n').filter(l => l.trim().length > 0);
    const actionVerbs = ['Architected', 'Engineered', 'Optimized', 'Automated', 'Spearheaded', 'Streamlined', 'Deployed', 'Refactored'];
    const metrics = ['reducing endpoint latency by 42%', 'boosting sprint velocity by 28%', 'scaling system concurrency to 50k+ daily sessions', 'cutting infrastructure overhead by 24%', 'maintaining 99.98% production service uptime'];

    if (lines.length === 0) {
      return `• Architected scalable microservices and RESTful API infrastructure, reducing endpoint response latency by 42% across core endpoints.\n• Automated continuous integration and deployment pipelines using Docker and GitHub Actions, cutting build-to-production turnaround time by 60%.\n• Spearheaded cross-functional team initiatives in clean architecture and test coverage, driving a 25% improvement in release velocity.`;
    }

    return lines.map((line, idx) => {
      const clean = line.replace(/^[•\-\*\s\d\.]+/, '').trim();
      const verb = actionVerbs[idx % actionVerbs.length];
      const metric = metrics[idx % metrics.length];
      if (/^[A-Z][a-z]+ed\b/.test(clean)) {
        return `• ${clean}${clean.endsWith('.') ? '' : '.'}`;
      }
      return `• ${verb} ${clean.charAt(0).toLowerCase() + clean.slice(1)}, ${metric}.`;
    }).join('\n');
  }

  if (type === 'skills') {
    const rLower = role.toLowerCase();
    if (rLower.includes('ai') || rLower.includes('machine learning') || rLower.includes('ml')) {
      return 'Python, PyTorch, TensorFlow, LLMs, LangChain, Hugging Face, NLP, Computer Vision, Scikit-learn, MLOps, Docker, Vector Databases, FastAPI';
    }
    if (rLower.includes('data')) {
      return 'Python, SQL, Pandas, NumPy, Scikit-learn, Apache Spark, Tableau, Feature Engineering, Machine Learning, Data Warehousing, Snowflake, BigQuery, Airflow';
    }
    if (rLower.includes('front') || rLower.includes('ui') || rLower.includes('react')) {
      return 'React, TypeScript, Next.js, JavaScript, Tailwind CSS, HTML5, CSS3, Redux Toolkit, Webpack, Responsive Design, REST APIs, Jest, Vite';
    }
    if (rLower.includes('back') || rLower.includes('cloud') || rLower.includes('devops')) {
      return 'Node.js, Python, PostgreSQL, Redis, Docker, Kubernetes, AWS, Terraform, CI/CD, Microservices, GraphQL, Linux, Prometheus';
    }
    if (rLower.includes('student') || rLower.includes('fresher') || rLower.includes('intern')) {
      return 'Data Structures, Algorithms, Python, JavaScript, Java, React, SQL, Git, OOP, Linux, Web Development, Problem Solving, REST APIs';
    }
    return 'TypeScript, React, Node.js, Next.js, PostgreSQL, Docker, AWS, GraphQL, Redis, Tailwind CSS, CI/CD, Git, REST APIs';
  }

  if (type === 'categorized_skills') {
    const rLower = role.toLowerCase();
    if (rLower.includes('ai') || rLower.includes('data')) {
      return 'Languages: Python, SQL, C++ | Frameworks & ML: PyTorch, TensorFlow, Scikit-learn, Hugging Face, LangChain | Cloud & Data: AWS, Snowflake, Spark, Docker | Databases: PostgreSQL, Vector DBs, Redis | Tools: Git, Linux, Jupyter, MLOps';
    }
    if (rLower.includes('front') || rLower.includes('ui')) {
      return 'Languages: TypeScript, JavaScript (ES6+), HTML5, CSS3 | Frameworks: React, Next.js, Redux Toolkit, Vue | Styling: Tailwind CSS, SCSS, Framer Motion | Tooling: Webpack, Vite, Jest, Git, Figma';
    }
    return 'Languages: TypeScript, JavaScript, Python, SQL | Frameworks: React, Next.js, Node.js, Express | Cloud & DevOps: AWS, Docker, Kubernetes, CI/CD | Databases: PostgreSQL, MongoDB, Redis | Tools: Git, Linux, Jest, REST APIs';
  }

  if (type === 'soft_skills') {
    return 'Cross-Functional Leadership, Agile & Scrum Delivery, Technical Mentorship, System Architecture Design, Root Cause Analysis, Clear Technical Communication, Rapid Prototyping, Stakeholder Collaboration';
  }

  if (type === 'tailor_jd') {
    const missing = params.missing || ['distributed systems', 'cloud infrastructure'];
    const kwText = missing.slice(0, 4).join(', ') || 'modern cloud architecture';
    const tailoredSummary = `Targeted ${role} with demonstrated proficiency spanning ${kwText}. Proven ability to align technical architectures with core job specifications, improving operational efficiency by 34% and accelerating release cycles. Dedicated to continuous quality, scalable system design, and cross-functional engineering excellence.`;
    const tailoredBullets = [
      `• Architected modular cloud services integrating ${missing[0] || 'modern architectural patterns'}, reducing deployment friction by 35%.`,
      `• Engineered high-performance workflows emphasizing ${missing[1] || 'automated verification'}, enhancing overall delivery velocity by 28%.`
    ];
    return {
      tailored_summary: tailoredSummary,
      tailored_bullets: tailoredBullets
    };
  }

  if (type === 'cover_letter') {
    const targetComp = params.company || 'the Hiring Organization';
    return `Dear Hiring Team at ${targetComp},\n\nI am writing to express my strong interest in the ${role} position. With a solid engineering foundation in ${topSkills}, I have consistently delivered scalable, robust applications that align with strategic product roadmaps.\n\nThroughout my career, I have prioritized clean code architecture, data-driven system optimizations, and agile collaboration. At ${targetComp}, I am excited by your dedication to technological innovation and look forward to applying my problem-solving acumen to accelerate your technical delivery.\n\nI welcome the opportunity to discuss how my technical expertise and proactive leadership can contribute directly to your team's success.\n\nSincerely,\n${name}`;
  }

  if (type === 'award_details') {
    const title = params.title || 'Excellence Award';
    const issuer = params.issuer || 'Industry Organization';
    return `Honored with ${title} by ${issuer} in recognition of outstanding technical innovation, problem-solving excellence, and measurable impact.`;
  }

  return '';
}

// 25 Standardized Templates Catalog
const TEMPLATES_CATALOG = [
  { id: 'tpl_corp_pro', name: 'Corporate Professional', category: 'Professional', tag: 'Executive', badgeColor: 'blue', desc: 'Crisp executive architecture with formal dual-line dividers, high visual hierarchy, and authoritative presence.' },
  { id: 'tpl_executive', name: 'Executive Resume', category: 'Professional', tag: 'Leadership', badgeColor: 'purple', desc: 'Two-column architecture featuring a dedicated credentials sidebar alongside an executive leadership history canvas.' },
  { id: 'tpl_biz_pro', name: 'Business Professional', category: 'Professional', tag: 'Business', badgeColor: 'amber', desc: 'Polished management format with prominent contact header band, boxed competencies, and structured career milestones.' },
  { id: 'tpl_min_pro', name: 'Minimal Professional', category: 'Professional', tag: 'Clean', badgeColor: 'slate', desc: 'Monochromatic high-contrast styling with generous whitespace, delicate hairline separators, and understated elegance.' },
  { id: 'tpl_elegant_pro', name: 'Elegant Professional', category: 'Professional', tag: 'Prestige', badgeColor: 'rose', desc: 'Sophisticated serif typography with centered monogram initials badge, warm charcoal accents, and traditional prestige layout.' },

  { id: 'tpl_modern_minimal', name: 'Modern Minimal', category: 'Modern', tag: 'Minimalist', badgeColor: 'blue', desc: 'Clean modern sans-serif layout with vertical accent border, clean pill tags, and compact modern spacing.' },
  { id: 'tpl_creative_modern', name: 'Creative Modern', category: 'Modern', tag: 'Top Pick', badgeColor: 'rose', desc: 'Top vibrant gradient header card with metric callout chips and modern border accents. Perfect for product leaders and creators.' },
  { id: 'tpl_twocol_modern', name: 'Two-Column Modern', category: 'Modern', tag: 'Modern Grid', badgeColor: 'purple', desc: 'Asymmetric 35/65 split grid with full-height tinted sidebar, skill indicators, and high-impact right column.' },
  { id: 'tpl_stylish', name: 'Stylish Resume', category: 'Modern', tag: 'Timeline', badgeColor: 'emerald', desc: 'Contemporary career timeline aesthetic with connected milestone dots, floating name badge, and dot-accented skill chips.' },
  { id: 'tpl_gradient_modern', name: 'Gradient Modern', category: 'Modern', tag: 'SaaS Vibe', badgeColor: 'blue', desc: 'Vibrant gradient underlined titles, card-styled sections with soft borders, and contemporary typography.' },

  { id: 'tpl_ats_classic', name: 'ATS Classic', category: 'ATS-Friendly', tag: '100% Parser Safe', badgeColor: 'emerald', desc: 'Harvard & Ivy League standard linear format with zero graphics, high-contrast typography, and maximum parse-rate across ATS parsers.' },
  { id: 'tpl_ats_pro', name: 'ATS Professional', category: 'ATS-Friendly', tag: '99.8% ATS Score', badgeColor: 'emerald', desc: 'Strict standard single-column with uppercase section headers, bulleted accomplishments with action verbs, and universal compatibility.' },
  { id: 'tpl_simple_onecol', name: 'Simple One-Column', category: 'ATS-Friendly', tag: 'Simple', badgeColor: 'slate', desc: 'Clean linear hierarchy with centered header, pipe-separated contact info, and crisp section dividers.' },
  { id: 'tpl_clean_corp', name: 'Clean Corporate', category: 'ATS-Friendly', tag: 'Corporate ATS', badgeColor: 'blue', desc: 'Solid horizontal section lines separating bold role titles, bulleted points, and strict adherence to corporate scanning rules.' },
  { id: 'tpl_text_pro', name: 'Text-Based Professional', category: 'ATS-Friendly', tag: 'Parser First', badgeColor: 'slate', desc: 'Markdown and plain-text inspired ultra-clean layout with bracketed dates and bulleted lists. Maximum readability.' },

  { id: 'tpl_software_dev', name: 'Software Developer', category: 'Technology & Engineering', tag: 'Dev Favorite', badgeColor: 'blue', desc: 'Engineered for developers: GitHub/portfolio badges, monospace tech stack chips, and metrics-focused bullets.' },
  { id: 'tpl_aiml_eng', name: 'AI/ML Engineer', category: 'Technology & Engineering', tag: 'AI/ML Focus', badgeColor: 'purple', desc: 'Specialized architecture for AI/ML specialists: dedicated Model & Frameworks taxonomy, research milestones, and compute metrics.' },
  { id: 'tpl_data_scientist', name: 'Data Scientist', category: 'Technology & Engineering', tag: 'Quant Focus', badgeColor: 'emerald', desc: 'Quantitative profile header with stats callout bar and categorized analytical competencies.' },
  { id: 'tpl_web_dev', name: 'Web Developer', category: 'Technology & Engineering', tag: 'Web Stack', badgeColor: 'blue', desc: 'Interactive web aesthetic with live demo links, frontend/backend/devops categorizations, and modern web badge styling.' },
  { id: 'tpl_it_pro', name: 'IT Professional', category: 'Technology & Engineering', tag: 'SysAdmin/Cloud', badgeColor: 'amber', desc: 'Prominent Certifications & Security box, network/cloud skills matrix, and incident mitigation layout.' },

  { id: 'tpl_college_student', name: 'College Student', category: 'Student & Fresher', tag: 'Campus Favorite', badgeColor: 'blue', desc: 'Education placed prominently at the top with GPA, honors, coursework, followed by Capstone Projects and Technical Skills.' },
  { id: 'tpl_fresher', name: 'Fresher Resume', category: 'Student & Fresher', tag: 'First Job', badgeColor: 'emerald', desc: 'Engineered for entry-level graduates: prominent Career Objective, Academic Projects, Technical & Soft Skills, and Extracurriculars.' },
  { id: 'tpl_internship', name: 'Internship Resume', category: 'Student & Fresher', tag: 'Intern Ready', badgeColor: 'purple', desc: 'Highlights availability, internship target, hackathons, club leadership, and coursework with faculty references.' },
  { id: 'tpl_academic', name: 'Academic Resume', category: 'Student & Fresher', tag: 'Academic CV', badgeColor: 'rose', desc: 'Traditional academic curriculum vitae format: Education first, Research Interests, Publications, Theses, and Distinctions.' },

  { id: 'tpl_compact', name: 'Compact High-Density', category: 'Professional', tag: 'Strict 1-Page', badgeColor: 'amber', desc: 'Engineered for senior professionals with extensive careers who must present a clean, zero-overflow single-page resume.' }
];

// ATS Skills Dictionary
const KNOWN_SKILL_PHRASES = [
  'machine learning', 'artificial intelligence', 'deep learning', 'computer vision',
  'natural language processing', 'large language models', 'generative ai', 'prompt engineering',
  'system design', 'distributed systems', 'microservices architecture', 'restful apis',
  'rest api', 'graphql api', 'ci/cd', 'continuous integration', 'continuous deployment',
  'test driven development', 'cloud architecture', 'amazon web services', 'google cloud platform',
  'docker containers', 'kubernetes cluster', 'relational database', 'nosql database',
  'full stack development', 'agile development', 'scrum master', 'version control',
  'object oriented programming', 'data structures', 'algorithms'
];

const HARD_SKILLS_SET = new Set([
  'react', 'react.js', 'reactjs', 'node', 'node.js', 'nodejs', 'typescript', 'javascript',
  'python', 'fastapi', 'flask', 'django', 'java', 'c++', 'c#', 'golang', 'rust', 'aws',
  'azure', 'gcp', 'docker', 'kubernetes', 'postgresql', 'postgres', 'mysql', 'mongodb',
  'redis', 'graphql', 'html5', 'css3', 'tailwind', 'tailwind css', 'git', 'linux',
  'tensorflow', 'pytorch', 'pandas', 'numpy', 'scikit-learn', 'kafka', 'next.js', 'nextjs'
]);

const SOFT_SKILLS_SET = new Set([
  'leadership', 'mentoring', 'communication', 'collaboration', 'cross-functional',
  'agile', 'scrum', 'problem-solving', 'strategic planning', 'project management',
  'code review', 'stakeholder management', 'critical thinking', 'decision making'
]);

const ATS_STOP_WORDS = new Set([
  'and', 'the', 'to', 'a', 'of', 'in', 'for', 'with', 'on', 'at', 'an', 'is', 'or', 'as',
  'be', 'are', 'this', 'that', 'you', 'we', 'will', 'have', 'from', 'by', 'about', 'can',
  'our', 'their', 'must', 'should', 'all', 'any', 'has', 'more', 'work', 'working', 'team',
  'experience', 'years', 'responsibilities', 'qualifications', 'requirements', 'role'
]);

// Initial Comprehensive Candidate Profile
const INITIAL_RESUME = {
  id: 'resume_default',
  title: 'Senior Software Engineer Resume',
  name: 'Alex Morgan',
  roleTitle: 'Senior Full Stack Software Engineer',
  avatar: 'assets/images/avatar.jpg',
  showAvatar: false,
  email: 'alex.morgan@devstudio.io',
  phone: '+1 (555) 349-2810',
  location: 'San Francisco, CA (or Remote)',
  links: 'github.com/alex-morgan | linkedin.com/in/alex-morgan-dev',
  summary: 'High-performing Senior Full Stack Engineer with 5+ years of experience architecting distributed cloud applications, high-concurrency microservices, and modern web interfaces. Proven expertise in cutting system latency by 40%, scaling API throughput to 50k+ req/sec, and mentoring cross-functional engineering teams in agile environments.',
  objective: 'Results-driven engineer seeking high-impact technical leadership opportunities to scale mission-critical cloud platforms and drive engineering excellence.',
  skills: 'TypeScript, JavaScript (ES6+), React.js, Next.js, Node.js, Python, FastAPI, PostgreSQL, MongoDB, Redis, Docker, Kubernetes, AWS, GraphQL, CI/CD, Tailwind CSS',
  softSkills: 'Cross-Functional Collaboration, Technical Leadership, System Architecture, Code Review & Mentorship, Agile/Scrum Delivery',
  template: 'tpl_software_dev',
  writingStyle: 'professional',
  color: 'blue',
  font: 'Inter',
  fontSize: 'normal',
  margins: 'normal',
  sectionHeadings: {
    summary: 'Executive Summary',
    objective: 'Career Objective',
    skills: 'Technical Skills & Tooling',
    softSkills: 'Core Competencies',
    experiences: 'Professional Experience',
    education: 'Education',
    projects: 'Key Projects',
    certifications: 'Certifications',
    awards: 'Honors & Achievements',
    internships: 'Internship Experience',
    languages: 'Languages',
    hobbies: 'Interests & Activities',
    references: 'References'
  },
  sectionOrder: [
    'summary', 'objective', 'skills', 'softSkills', 'experiences',
    'projects', 'education', 'certifications', 'internships',
    'awards', 'languages', 'hobbies', 'references'
  ],
  hiddenSections: {},
  experiences: [
    {
      id: 'exp_1',
      role: 'Senior Full Stack Engineer',
      company: 'CloudScale Technologies',
      location: 'San Francisco, CA',
      startDate: '2023-01',
      endDate: '',
      isCurrent: true,
      bullets: '• Architected high-throughput microservices using Node.js, FastAPI, and Redis, scaling active user sessions to 100,000+ while maintaining 99.99% uptime.\n• Engineered automated CI/CD deployment pipelines on AWS using GitHub Actions and Docker, reducing release lead times by 65%.\n• Spearheaded database schema optimization and indexing on PostgreSQL, cutting average query latency from 220ms to 45ms for the core analytics dashboard.\n• Mentored 4 junior developers in React best practices and test-driven development, increasing sprint velocity by 20% over two quarters.'
    },
    {
      id: 'exp_2',
      role: 'Full Stack Web Developer',
      company: 'Nexus Interactive Labs',
      location: 'San Jose, CA',
      startDate: '2021-06',
      endDate: '2022-12',
      isCurrent: false,
      bullets: '• Developed responsive client-facing web applications with React, Next.js, and Tailwind CSS, increasing user engagement metrics by 32%.\n• Implemented secure RESTful API endpoints and OAuth 2.0 authentication protocols for enterprise integrations.\n• Built real-time collaboration features using WebSockets and Socket.io, allowing 50+ concurrent users to edit shared documents without conflicts.'
    }
  ],
  education: [
    {
      id: 'edu_1',
      degree: 'B.S. in Computer Science & Engineering',
      school: 'University Institute of Technology',
      location: 'California, USA',
      startDate: '2017-08',
      endDate: '2021-05',
      isCurrent: false,
      gpa: 'GPA: 3.85 / 4.0 (Dean\'s Honor Roll)',
      coursework: 'Distributed Systems, Data Structures & Algorithms, Cloud Computing, Database Management'
    }
  ],
  projects: [
    {
      id: 'proj_1',
      title: 'Smart Resume AI Platform',
      tech: 'React, TypeScript, Groq Llama 3.3, Tailwind CSS',
      link: 'github.com/alex-morgan/smart-resume-ai',
      bullets: '• Engineered a responsive client-side resume studio compiling vector-grade A4 printable documents natively in the browser.\n• Formulated a real-time NLP token matching algorithm calculating ATS job description keyword overlap in under 12ms.\n• Integrated human-in-the-loop Groq AI review modal supporting inline editing, regeneration, and instant approval workflows.'
    },
    {
      id: 'proj_2',
      title: 'Distributed Asynchronous Task Queue',
      tech: 'Python, FastAPI, Redis, Docker',
      link: 'github.com/alex-morgan/distributed-task-queue',
      bullets: '• Constructed event-driven asynchronous job worker pool supporting priority scheduling and dead-letter recovery.\n• Benchmarked system concurrency to successfully execute 20,000 concurrent task runs with zero data degradation.'
    }
  ],
  certifications: [
    { id: 'cert_1', title: 'AWS Certified Solutions Architect – Professional', issuer: 'Amazon Web Services', year: '2024' },
    { id: 'cert_2', title: 'Meta Certified Professional Frontend Developer', issuer: 'Meta / Coursera', year: '2023' }
  ],
  awards: [
    { id: 'awd_1', title: 'Outstanding Innovation Award', issuer: 'CloudScale Hackathon', year: '2023', description: 'Built an AI-assisted cloud diagnostics tool.' }
  ],
  internships: [
    { id: 'int_1', role: 'Software Engineering Intern', company: 'Palo Alto Software', year: '2020', bullets: '• Contributed to frontend component library in React.\n• Resolved 25+ sprint bug tickets across internal admin dashboards.' }
  ],
  languages: [
    { id: 'lang_1', language: 'English', proficiency: 'Native / Bilingual' },
    { id: 'lang_2', language: 'Spanish', proficiency: 'Professional Working' }
  ],
  hobbies: 'Open-Source Contributing, Tech Blogging, Marathon Running, Chess',
  references: [
    { id: 'ref_1', name: 'Dr. Michael Vance', role: 'VP of Engineering', company: 'CloudScale Tech', contact: 'm.vance@cloudscale.io' }
  ],
  customSections: []
};



// =========================================================
// DYNAMIC 25-TEMPLATE RESUME RENDERER COMPONENT
// =========================================================
function ResumeRenderer({ resume, palette }) {
  const tpl = resume.template || 'tpl_software_dev';
  const headings = resume.sectionHeadings || {};
  const hidden = resume.hiddenSections || {};
  const isHidden = (sec) => !!hidden[sec];

  // Helper renderers
  const renderBullets = (bulletsStr) => {
    if (!bulletsStr) return null;
    return (
      <ul className="res-bullets-list">
        {bulletsStr.split('\n').map((b, i) => {
          const clean = b.replace(/^[•\-\*\s]+/, '').trim();
          return clean ? <li key={i}>{clean}</li> : null;
        })}
      </ul>
    );
  };

  const renderContactBar = (separator = ' • ') => {
    const items = [
      resume.email ? `✉ ${resume.email}` : null,
      resume.phone ? `📞 ${resume.phone}` : null,
      resume.location ? `📍 ${resume.location}` : null,
      resume.links ? `🔗 ${resume.links}` : null
    ].filter(Boolean);
    return <div className="res-contact-bar">{items.join(separator)}</div>;
  };

  // 1. Executive Two-Column (tpl_executive)
  if (tpl === 'tpl_executive') {
    return (
      <div className="flex flex-row" style={{ height: '100%', minHeight: '297mm' }}>
        <div className="res-exec-sidebar">
          {resume.showAvatar && resume.avatar && (
            <div style={{ textAlign: 'center', marginBottom: '0.8rem' }}>
              <img src={resume.avatar} style={{ width: '75px', height: '75px', borderRadius: '50%', objectFit: 'cover', border: `2.5px solid ${palette.accent}` }} alt="Avatar" />
            </div>
          )}
          <h1 className="res-header-name">{resume.name}</h1>
          <h2 className="res-header-title">{resume.roleTitle || resume.title}</h2>

          <div style={{ fontSize: '0.76rem', color: '#475569', display: 'flex', flexDirection: 'column', gap: '0.35rem', marginTop: '0.5rem' }}>
            {resume.email && <div>✉ {resume.email}</div>}
            {resume.phone && <div>📞 {resume.phone}</div>}
            {resume.location && <div>📍 {resume.location}</div>}
            {resume.links && <div>🔗 {resume.links}</div>}
          </div>

          {!isHidden('skills') && resume.skills && (
            <div style={{ marginTop: '1.25rem' }}>
              <h3 className="res-section-title">{headings.skills || 'Core Skills'}</h3>
              <div className="res-skills-cloud">
                {resume.skills.split(',').map((s, i) => <span key={i} className="res-skill-tag">{s.trim()}</span>)}
              </div>
            </div>
          )}

          {!isHidden('education') && resume.education?.length > 0 && (
            <div style={{ marginTop: '1.25rem' }}>
              <h3 className="res-section-title">{headings.education || 'Education'}</h3>
              {resume.education.map(ed => (
                <div key={ed.id} style={{ marginBottom: '0.6rem' }}>
                  <div style={{ fontWeight: 700, fontSize: '0.82rem' }}>{ed.degree}</div>
                  <div style={{ color: palette.accent, fontSize: '0.78rem' }}>{ed.school}</div>
                  <div style={{ fontSize: '0.74rem', color: '#64748b' }}>{ed.endDate || ed.year}</div>
                  {ed.gpa && <div style={{ fontSize: '0.72rem', color: '#475569' }}>{ed.gpa}</div>}
                </div>
              ))}
            </div>
          )}

          {!isHidden('certifications') && resume.certifications?.length > 0 && (
            <div style={{ marginTop: '1.25rem' }}>
              <h3 className="res-section-title">{headings.certifications || 'Certifications'}</h3>
              {resume.certifications.map(cert => (
                <div key={cert.id} style={{ marginBottom: '0.4rem', fontSize: '0.76rem' }}>
                  <div style={{ fontWeight: 700 }}>{cert.title}</div>
                  <div style={{ color: '#64748b' }}>{cert.issuer} • {cert.year}</div>
                </div>
              ))}
            </div>
          )}

          {!isHidden('languages') && resume.languages?.length > 0 && (
            <div style={{ marginTop: '1.25rem' }}>
              <h3 className="res-section-title">{headings.languages || 'Languages'}</h3>
              {resume.languages.map(l => (
                <div key={l.id} style={{ fontSize: '0.76rem', color: '#334155' }}>
                  <strong>{l.language}</strong>: {l.proficiency}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="res-exec-main">
          {!isHidden('summary') && resume.summary && (
            <div className="res-section">
              <h3 className="res-section-title">{headings.summary || 'Executive Summary'}</h3>
              <p className="res-summary-text">{resume.summary}</p>
            </div>
          )}

          {!isHidden('experiences') && resume.experiences?.length > 0 && (
            <div className="res-section">
              <h3 className="res-section-title">{headings.experiences || 'Leadership Experience'}</h3>
              {resume.experiences.map(exp => (
                <div key={exp.id} className="res-entry">
                  <div className="res-entry-head">
                    <span className="res-entry-title">{exp.role}</span>
                    <span className="res-entry-date">{exp.startDate} – {exp.isCurrent ? 'Present' : exp.endDate}</span>
                  </div>
                  <div className="res-entry-subtitle">{exp.company} • {exp.location}</div>
                  {renderBullets(exp.bullets)}
                </div>
              ))}
            </div>
          )}

          {!isHidden('projects') && resume.projects?.length > 0 && (
            <div className="res-section">
              <h3 className="res-section-title">{headings.projects || 'Key Initiatives'}</h3>
              {resume.projects.map(proj => (
                <div key={proj.id} className="res-entry">
                  <div className="res-entry-head">
                    <span className="res-entry-title">{proj.title}</span>
                    {proj.link && <span className="res-entry-location">🔗 {proj.link}</span>}
                  </div>
                  {proj.tech && <div className="res-entry-subtitle" style={{ fontSize: '0.8rem' }}>Tech: {proj.tech}</div>}
                  {renderBullets(proj.bullets)}
                </div>
              ))}
            </div>
          )}

          {!isHidden('awards') && resume.awards?.length > 0 && (
            <div className="res-section">
              <h3 className="res-section-title">{headings.awards || 'Honors & Distinctions'}</h3>
              {resume.awards.map(awd => (
                <div key={awd.id} style={{ fontSize: '0.82rem', marginBottom: '0.4rem' }}>
                  <strong>{awd.title}</strong>{awd.issuer ? ` — ${awd.issuer}` : ''}{awd.year ? ` (${awd.year})` : ''}
                  {awd.description && (
                    <div style={{ fontSize: '0.78rem', color: '#475569', marginTop: '2px' }}>
                      {awd.description}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // 2. Two-Column Modern (tpl_twocol_modern)
  if (tpl === 'tpl_twocol_modern') {
    return (
      <div className="flex flex-row" style={{ height: '100%', minHeight: '297mm' }}>
        <div className="res-twocol-sidebar">
          {resume.showAvatar && resume.avatar && (
            <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
              <img src={resume.avatar} style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover', border: `3px solid ${palette.accent}` }} alt="Avatar" />
            </div>
          )}
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: palette.primary, marginBottom: '0.2rem' }}>{resume.name}</h2>
          <div style={{ fontSize: '0.82rem', fontWeight: 600, color: palette.accent, marginBottom: '1rem' }}>{resume.roleTitle || resume.title}</div>

          <div style={{ fontSize: '0.78rem', color: '#475569', display: 'flex', flexDirection: 'column', gap: '0.4rem', marginBottom: '1.25rem' }}>
            {resume.email && <div>✉ {resume.email}</div>}
            {resume.phone && <div>📞 {resume.phone}</div>}
            {resume.location && <div>📍 {resume.location}</div>}
            {resume.links && <div>🔗 {resume.links}</div>}
          </div>

          {!isHidden('skills') && resume.skills && (
            <div style={{ marginBottom: '1.25rem' }}>
              <h3 className="res-section-title" style={{ fontSize: '0.85rem' }}>{headings.skills || 'Skills'}</h3>
              <div className="res-skills-cloud">
                {resume.skills.split(',').map((s, i) => (
                  <span key={i} className="res-skill-tag" style={{ background: '#ffffff', borderColor: '#cbd5e1' }}>{s.trim()}</span>
                ))}
              </div>
            </div>
          )}

          {!isHidden('education') && resume.education?.length > 0 && (
            <div style={{ marginBottom: '1.25rem' }}>
              <h3 className="res-section-title" style={{ fontSize: '0.85rem' }}>{headings.education || 'Education'}</h3>
              {resume.education.map(ed => (
                <div key={ed.id} style={{ marginBottom: '0.5rem', fontSize: '0.78rem' }}>
                  <div style={{ fontWeight: 700 }}>{ed.degree}</div>
                  <div style={{ color: palette.accent }}>{ed.school}</div>
                  <div style={{ color: '#64748b' }}>{ed.endDate || ed.year}</div>
                </div>
              ))}
            </div>
          )}

          {!isHidden('languages') && resume.languages?.length > 0 && (
            <div>
              <h3 className="res-section-title" style={{ fontSize: '0.85rem' }}>{headings.languages || 'Languages'}</h3>
              {resume.languages.map(l => (
                <div key={l.id} style={{ fontSize: '0.78rem', marginBottom: '0.25rem' }}>
                  <strong>{l.language}</strong>: {l.proficiency}
                </div>
              ))}
            </div>
          )}

          {!isHidden('certifications') && resume.certifications?.length > 0 && (
            <div style={{ marginTop: '1rem' }}>
              <h3 className="res-section-title" style={{ fontSize: '0.85rem' }}>{headings.certifications || 'Certifications'}</h3>
              {resume.certifications.map(c => (
                <div key={c.id} style={{ fontSize: '0.78rem', marginBottom: '0.35rem' }}>
                  <div style={{ fontWeight: 700 }}>{c.title}</div>
                  {c.issuer && <div style={{ color: palette.accent }}>{c.issuer}{c.year ? ` (${c.year})` : ''}</div>}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="res-twocol-main">
          {!isHidden('summary') && resume.summary && (
            <section className="res-section">
              <h3 className="res-section-title">{headings.summary || 'Summary'}</h3>
              <p className="res-summary-text">{resume.summary}</p>
            </section>
          )}

          {!isHidden('experiences') && resume.experiences?.length > 0 && (
            <section className="res-section">
              <h3 className="res-section-title">{headings.experiences || 'Experience'}</h3>
              {resume.experiences.map(exp => (
                <div key={exp.id} className="res-entry">
                  <div className="res-entry-head">
                    <span className="res-entry-title">{exp.role}</span>
                    <span className="res-entry-date">{exp.startDate} – {exp.isCurrent ? 'Present' : exp.endDate}</span>
                  </div>
                  <div className="res-entry-subtitle">{exp.company} • {exp.location}</div>
                  {renderBullets(exp.bullets)}
                </div>
              ))}
            </section>
          )}

          {!isHidden('projects') && resume.projects?.length > 0 && (
            <section className="res-section">
              <h3 className="res-section-title">{headings.projects || 'Projects'}</h3>
              {resume.projects.map(proj => (
                <div key={proj.id} className="res-entry">
                  <div className="res-entry-head">
                    <span className="res-entry-title">{proj.title}</span>
                    {proj.link && <span className="res-entry-location">🔗 {proj.link}</span>}
                  </div>
                  {proj.tech && <div className="res-entry-subtitle">Stack: {proj.tech}</div>}
                  {renderBullets(proj.bullets)}
                </div>
              ))}
            </section>
          )}

          {!isHidden('awards') && resume.awards?.length > 0 && (
            <section className="res-section">
              <h3 className="res-section-title">{headings.awards || 'Honors & Awards'}</h3>
              {resume.awards.map(awd => (
                <div key={awd.id} className="res-entry" style={{ marginBottom: '0.45rem' }}>
                  <div className="res-entry-head">
                    <span className="res-entry-title">{awd.title}</span>
                    {awd.year && <span className="res-entry-date">{awd.year}</span>}
                  </div>
                  {awd.issuer && <div className="res-entry-subtitle">{awd.issuer}</div>}
                  {awd.description && (
                    <div style={{ fontSize: '0.8rem', color: '#475569', marginTop: '2px' }}>
                      {awd.description}
                    </div>
                  )}
                </div>
              ))}
            </section>
          )}
        </div>
      </div>
    );
  }

  // 3. Creative Modern (tpl_creative_modern / tpl_creative)
  if (tpl === 'tpl_creative_modern' || tpl === 'tpl_creative') {
    return (
      <div>
        <div className="res-creative-banner">
          <h1 className="res-header-name">{resume.name}</h1>
          <h2 className="res-header-title">{resume.roleTitle || resume.title}</h2>
          {renderContactBar(' • ')}
        </div>

        <div className="res-creative-body">
          {!isHidden('summary') && resume.summary && (
            <section className="res-section">
              <h3 className="res-section-title">{headings.summary || 'Executive Summary'}</h3>
              <p className="res-summary-text">{resume.summary}</p>
            </section>
          )}

          {!isHidden('skills') && resume.skills && (
            <section className="res-section">
              <h3 className="res-section-title">{headings.skills || 'Core Competencies'}</h3>
              <div className="res-skills-cloud">
                {resume.skills.split(',').map((s, i) => <span key={i} className="res-skill-tag">{s.trim()}</span>)}
              </div>
            </section>
          )}

          {!isHidden('experiences') && resume.experiences?.length > 0 && (
            <section className="res-section">
              <h3 className="res-section-title">{headings.experiences || 'Work Experience'}</h3>
              {resume.experiences.map(exp => (
                <div key={exp.id} className="res-entry">
                  <div className="res-entry-head">
                    <span className="res-entry-title">{exp.role}</span>
                    <span className="res-entry-date">{exp.startDate} – {exp.isCurrent ? 'Present' : exp.endDate}</span>
                  </div>
                  <div className="res-entry-subtitle">{exp.company} • {exp.location}</div>
                  {renderBullets(exp.bullets)}
                </div>
              ))}
            </section>
          )}

          {!isHidden('projects') && resume.projects?.length > 0 && (
            <section className="res-section">
              <h3 className="res-section-title">{headings.projects || 'Featured Projects'}</h3>
              {resume.projects.map(proj => (
                <div key={proj.id} className="res-entry">
                  <div className="res-entry-head">
                    <span className="res-entry-title">{proj.title}</span>
                    {proj.link && <span className="res-entry-location">🔗 {proj.link}</span>}
                  </div>
                  {proj.tech && <div className="res-entry-subtitle">Tech: {proj.tech}</div>}
                  {renderBullets(proj.bullets)}
                </div>
              ))}
            </section>
          )}

          {!isHidden('education') && resume.education?.length > 0 && (
            <section className="res-section">
              <h3 className="res-section-title">{headings.education || 'Education'}</h3>
              {resume.education.map(ed => (
                <div key={ed.id} className="res-entry" style={{ marginBottom: '0.4rem' }}>
                  <div className="res-entry-head">
                    <span className="res-entry-title">{ed.degree}</span>
                    <span className="res-entry-date">{ed.endDate || ed.year}</span>
                  </div>
                  <div className="res-entry-subtitle">{ed.school}</div>
                </div>
              ))}
            </section>
          )}

          {!isHidden('awards') && resume.awards?.length > 0 && (
            <section className="res-section">
              <h3 className="res-section-title">{headings.awards || 'Honors & Awards'}</h3>
              {resume.awards.map(awd => (
                <div key={awd.id} className="res-entry" style={{ marginBottom: '0.45rem' }}>
                  <div className="res-entry-head">
                    <span className="res-entry-title">{awd.title}</span>
                    {awd.year && <span className="res-entry-date">{awd.year}</span>}
                  </div>
                  {awd.issuer && <div className="res-entry-subtitle">{awd.issuer}</div>}
                  {awd.description && (
                    <div style={{ fontSize: '0.8rem', color: '#475569', marginTop: '2px' }}>
                      {awd.description}
                    </div>
                  )}
                </div>
              ))}
            </section>
          )}

          {!isHidden('certifications') && resume.certifications?.length > 0 && (
            <section className="res-section">
              <h3 className="res-section-title">{headings.certifications || 'Certifications'}</h3>
              <div className="res-skills-cloud">
                {resume.certifications.map(c => (
                  <span key={c.id} className="res-skill-tag">
                    🏅 {c.title} ({c.issuer} {c.year})
                  </span>
                ))}
              </div>
            </section>
          )}

          {!isHidden('languages') && resume.languages?.length > 0 && (
            <section className="res-section">
              <h3 className="res-section-title">{headings.languages || 'Languages'}</h3>
              <div className="res-skills-cloud">
                {resume.languages.map(l => (
                  <span key={l.id} className="res-skill-tag">
                    {l.language} — {l.proficiency}
                  </span>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    );
  }

  // 4. Business Professional (tpl_biz_pro)
  if (tpl === 'tpl_biz_pro') {
    return (
      <div>
        <div className="res-biz-header-band">
          <h1 className="res-header-name">{resume.name}</h1>
          <div style={{ fontSize: '1.1rem', color: '#fde68a', fontWeight: 600, marginTop: '4px' }}>{resume.roleTitle || resume.title}</div>
          <div style={{ marginTop: '8px' }}>{renderContactBar(' | ')}</div>
        </div>

        <div className="res-biz-body">
          {!isHidden('summary') && resume.summary && (
            <section className="res-section">
              <h3 className="res-section-title">{headings.summary || 'Professional Profile'}</h3>
              <p className="res-summary-text">{resume.summary}</p>
            </section>
          )}

          {!isHidden('skills') && resume.skills && (
            <section className="res-section">
              <h3 className="res-section-title">{headings.skills || 'Strategic & Technical Competencies'}</h3>
              <div className="res-skills-cloud">
                {resume.skills.split(',').map((s, i) => <span key={i} className="res-skill-tag" style={{ borderLeft: `3px solid ${palette.accent}` }}>{s.trim()}</span>)}
              </div>
            </section>
          )}

          {!isHidden('experiences') && resume.experiences?.length > 0 && (
            <section className="res-section">
              <h3 className="res-section-title">{headings.experiences || 'Professional Experience'}</h3>
              {resume.experiences.map(exp => (
                <div key={exp.id} className="res-entry">
                  <div className="res-entry-head">
                    <span className="res-entry-title">{exp.role} — <em>{exp.company}</em></span>
                    <span className="res-entry-date">{exp.startDate} – {exp.isCurrent ? 'Present' : exp.endDate}</span>
                  </div>
                  <div className="res-entry-subtitle">{exp.location}</div>
                  {renderBullets(exp.bullets)}
                </div>
              ))}
            </section>
          )}

          {!isHidden('projects') && resume.projects?.length > 0 && (
            <section className="res-section">
              <h3 className="res-section-title">{headings.projects || 'Key Business Initiatives'}</h3>
              {resume.projects.map(proj => (
                <div key={proj.id} className="res-entry">
                  <div className="res-entry-head">
                    <span className="res-entry-title">{proj.title}</span>
                    <span className="res-entry-location">{proj.tech}</span>
                  </div>
                  {renderBullets(proj.bullets)}
                </div>
              ))}
            </section>
          )}

          {!isHidden('education') && resume.education?.length > 0 && (
            <section className="res-section">
              <h3 className="res-section-title">{headings.education || 'Academic Background'}</h3>
              {resume.education.map(ed => (
                <div key={ed.id} className="res-entry-head" style={{ marginBottom: '0.4rem' }}>
                  <span><strong>{ed.degree}</strong>, {ed.school}</span>
                  <span>{ed.endDate || ed.year}</span>
                </div>
              ))}
            </section>
          )}

          {!isHidden('awards') && resume.awards?.length > 0 && (
            <section className="res-section">
              <h3 className="res-section-title">{headings.awards || 'Honors & Awards'}</h3>
              {resume.awards.map(awd => (
                <div key={awd.id} className="res-entry" style={{ marginBottom: '0.45rem' }}>
                  <div className="res-entry-head">
                    <span className="res-entry-title">{awd.title}</span>
                    {awd.year && <span className="res-entry-location">{awd.year}</span>}
                  </div>
                  {awd.issuer && <div className="res-entry-subtitle">{awd.issuer}</div>}
                  {awd.description && (
                    <div style={{ fontSize: '0.8rem', color: '#475569', marginTop: '2px' }}>
                      {awd.description}
                    </div>
                  )}
                </div>
              ))}
            </section>
          )}

          {!isHidden('certifications') && resume.certifications?.length > 0 && (
            <section className="res-section">
              <h3 className="res-section-title">{headings.certifications || 'Certifications'}</h3>
              <div className="res-skills-cloud">
                {resume.certifications.map(c => (
                  <span key={c.id} className="res-skill-tag">
                    🏅 {c.title} ({c.issuer} {c.year})
                  </span>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    );
  }

  // 5. Elegant Professional (tpl_elegant_pro)
  if (tpl === 'tpl_elegant_pro') {
    const initials = (resume.name || 'AM').split(' ').map(n => n[0]).join('').slice(0, 2);
    return (
      <div style={{ padding: '20mm 20mm', fontFamily: 'Georgia, serif' }}>
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <div className="res-monogram-crest">{initials}</div>
          <h1 className="res-header-name" style={{ fontSize: '2.2rem', fontWeight: 400, letterSpacing: '0.04em' }}>{resume.name}</h1>
          <div style={{ fontStyle: 'italic', fontSize: '1rem', color: '#475569', margin: '4px 0 8px' }}>{resume.roleTitle || resume.title}</div>
          {renderContactBar(' • ')}
        </div>

        {!isHidden('summary') && resume.summary && (
          <section className="res-section">
            <h3 className="res-section-title" style={{ textAlign: 'center', borderBottom: '1px solid #94a3b8', paddingBottom: '3px' }}>{headings.summary || 'Summary'}</h3>
            <p className="res-summary-text" style={{ textAlign: 'justify' }}>{resume.summary}</p>
          </section>
        )}

        {!isHidden('experiences') && resume.experiences?.length > 0 && (
          <section className="res-section">
            <h3 className="res-section-title" style={{ textAlign: 'center', borderBottom: '1px solid #94a3b8', paddingBottom: '3px' }}>{headings.experiences || 'Career History'}</h3>
            {resume.experiences.map(exp => (
              <div key={exp.id} className="res-entry">
                <div className="res-entry-head">
                  <span className="res-entry-title" style={{ fontFamily: 'Georgia, serif' }}>{exp.role} — <em>{exp.company}</em></span>
                  <span className="res-entry-date">{exp.startDate} – {exp.isCurrent ? 'Present' : exp.endDate}</span>
                </div>
                {renderBullets(exp.bullets)}
              </div>
            ))}
          </section>
        )}

        {!isHidden('education') && resume.education?.length > 0 && (
          <section className="res-section">
            <h3 className="res-section-title" style={{ textAlign: 'center', borderBottom: '1px solid #94a3b8', paddingBottom: '3px' }}>{headings.education || 'Education'}</h3>
            {resume.education.map(ed => (
              <div key={ed.id} className="res-entry-head" style={{ marginBottom: '0.35rem' }}>
                <span><strong>{ed.degree}</strong>, {ed.school}</span>
                <span>{ed.endDate || ed.year}</span>
              </div>
            ))}
          </section>
        )}

        {!isHidden('skills') && resume.skills && (
          <section className="res-section">
            <h3 className="res-section-title" style={{ textAlign: 'center', borderBottom: '1px solid #94a3b8', paddingBottom: '3px' }}>{headings.skills || 'Competencies'}</h3>
            <div style={{ textAlign: 'center', fontSize: '0.85rem', color: '#334155' }}>
              {resume.skills.split(',').join(' • ')}
            </div>
          </section>
        )}

        {!isHidden('awards') && resume.awards?.length > 0 && (
          <section className="res-section">
            <h3 className="res-section-title" style={{ textAlign: 'center', borderBottom: '1px solid #94a3b8', paddingBottom: '3px' }}>{headings.awards || 'Honors & Distinctions'}</h3>
            {resume.awards.map(awd => (
              <div key={awd.id} style={{ textAlign: 'center', marginBottom: '0.45rem', fontSize: '0.85rem' }}>
                <strong>{awd.title}</strong>{awd.issuer ? ` — ${awd.issuer}` : ''}{awd.year ? ` (${awd.year})` : ''}
                {awd.description && (
                  <div style={{ fontSize: '0.8rem', color: '#475569', fontStyle: 'italic', marginTop: '2px' }}>
                    {awd.description}
                  </div>
                )}
              </div>
            ))}
          </section>
        )}

        {!isHidden('certifications') && resume.certifications?.length > 0 && (
          <section className="res-section">
            <h3 className="res-section-title" style={{ textAlign: 'center', borderBottom: '1px solid #94a3b8', paddingBottom: '3px' }}>{headings.certifications || 'Certifications'}</h3>
            <div style={{ textAlign: 'center', fontSize: '0.85rem', color: '#334155' }}>
              {resume.certifications.map(c => `${c.title} (${c.issuer} ${c.year})`).join(' • ')}
            </div>
          </section>
        )}
      </div>
    );
  }

  // 6. ATS Classic (tpl_ats_classic / tpl_minimal_ats)
  if (tpl === 'tpl_ats_classic' || tpl === 'tpl_minimal_ats') {
    return (
      <div style={{ padding: '20mm 20mm', fontFamily: 'Times New Roman, Times, serif' }}>
        <header className="res-header-center" style={{ textAlign: 'center', marginBottom: '1rem' }}>
          <h1 className="res-header-name" style={{ fontSize: '2rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{resume.name}</h1>
          <div style={{ fontStyle: 'italic', fontSize: '1rem', margin: '3px 0' }}>{resume.roleTitle || resume.title}</div>
          {renderContactBar(' | ')}
        </header>

        {!isHidden('summary') && resume.summary && (
          <section className="res-section">
            <h3 className="res-section-title" style={{ borderBottom: '1px solid #000', paddingBottom: '2px', fontWeight: 700 }}>{headings.summary || 'PROFESSIONAL SUMMARY'}</h3>
            <p className="res-summary-text">{resume.summary}</p>
          </section>
        )}

        {!isHidden('skills') && resume.skills && (
          <section className="res-section">
            <h3 className="res-section-title" style={{ borderBottom: '1px solid #000', paddingBottom: '2px', fontWeight: 700 }}>{headings.skills || 'TECHNICAL SKILLS'}</h3>
            <div style={{ fontSize: '0.88rem' }}>{resume.skills}</div>
          </section>
        )}

        {!isHidden('experiences') && resume.experiences?.length > 0 && (
          <section className="res-section">
            <h3 className="res-section-title" style={{ borderBottom: '1px solid #000', paddingBottom: '2px', fontWeight: 700 }}>{headings.experiences || 'PROFESSIONAL EXPERIENCE'}</h3>
            {resume.experiences.map(exp => (
              <div key={exp.id} className="res-entry">
                <div className="res-entry-head">
                  <span className="res-entry-title">{exp.role} — <em>{exp.company}</em></span>
                  <span className="res-entry-date">{exp.startDate} – {exp.isCurrent ? 'Present' : exp.endDate}</span>
                </div>
                {renderBullets(exp.bullets)}
              </div>
            ))}
          </section>
        )}

        {!isHidden('projects') && resume.projects?.length > 0 && (
          <section className="res-section">
            <h3 className="res-section-title" style={{ borderBottom: '1px solid #000', paddingBottom: '2px', fontWeight: 700 }}>{headings.projects || 'KEY PROJECTS'}</h3>
            {resume.projects.map(proj => (
              <div key={proj.id} className="res-entry">
                <div className="res-entry-head">
                  <span className="res-entry-title">{proj.title} {proj.tech && `(${proj.tech})`}</span>
                  {proj.link && <span className="res-entry-location">{proj.link}</span>}
                </div>
                {renderBullets(proj.bullets)}
              </div>
            ))}
          </section>
        )}

        {!isHidden('education') && resume.education?.length > 0 && (
          <section className="res-section">
            <h3 className="res-section-title" style={{ borderBottom: '1px solid #000', paddingBottom: '2px', fontWeight: 700 }}>{headings.education || 'EDUCATION'}</h3>
            {resume.education.map(ed => (
              <div key={ed.id} className="res-entry" style={{ marginBottom: '0.35rem' }}>
                <div className="res-entry-head">
                  <span className="res-entry-title">{ed.degree} — {ed.school}</span>
                  <span className="res-entry-date">{ed.endDate || ed.year}</span>
                </div>
                {ed.gpa && <div style={{ fontSize: '0.8rem', color: '#475569' }}>{ed.gpa}</div>}
              </div>
            ))}
          </section>
        )}

        {!isHidden('awards') && resume.awards?.length > 0 && (
          <section className="res-section">
            <h3 className="res-section-title" style={{ borderBottom: '1px solid #000', paddingBottom: '2px', fontWeight: 700, textTransform: 'uppercase', fontSize: '0.95rem' }}>{headings.awards || 'HONORS & AWARDS'}</h3>
            {resume.awards.map(awd => (
              <div key={awd.id} className="res-entry" style={{ marginBottom: '0.35rem' }}>
                <div className="res-entry-head">
                  <span className="res-entry-title" style={{ fontWeight: 'bold' }}>{awd.title}{awd.issuer ? ` — ${awd.issuer}` : ''}</span>
                  {awd.year && <span className="res-entry-date">{awd.year}</span>}
                </div>
                {awd.description && <div style={{ fontSize: '0.82rem', marginTop: '1px' }}>{awd.description}</div>}
              </div>
            ))}
          </section>
        )}

        {!isHidden('certifications') && resume.certifications?.length > 0 && (
          <section className="res-section">
            <h3 className="res-section-title" style={{ borderBottom: '1px solid #000', paddingBottom: '2px', fontWeight: 700, textTransform: 'uppercase', fontSize: '0.95rem' }}>{headings.certifications || 'CERTIFICATIONS'}</h3>
            {resume.certifications.map(c => (
              <div key={c.id} style={{ fontSize: '0.85rem', marginBottom: '0.25rem' }}>
                <strong>{c.title}</strong>{c.issuer ? ` — ${c.issuer}` : ''}{c.year ? ` (${c.year})` : ''}
              </div>
            ))}
          </section>
        )}
      </div>
    );
  }

  // 7. College Student & Fresher (Education / Objective First)
  if (tpl === 'tpl_college_student' || tpl === 'tpl_fresher' || tpl === 'tpl_internship') {
    return (
      <div style={{ padding: '16mm 18mm' }}>
        <header className="flex justify-between items-start" style={{ marginBottom: '1.25rem' }}>
          <div>
            <h1 className="res-header-name" style={{ fontSize: '2.1rem' }}>{resume.name}</h1>
            <div style={{ color: palette.accent, fontWeight: 700, fontSize: '1rem', marginTop: '3px' }}>{resume.roleTitle || resume.title}</div>
            <div style={{ marginTop: '6px' }}>{renderContactBar(' • ')}</div>
          </div>
          {resume.showAvatar && resume.avatar && (
            <img src={resume.avatar} style={{ width: '70px', height: '70px', borderRadius: '50%', objectFit: 'cover', border: `2px solid ${palette.accent}` }} alt="Avatar" />
          )}
        </header>

        {resume.objective && !isHidden('objective') && (
          <section className="res-section" style={{ background: '#f8fafc', padding: '0.75rem 1rem', borderRadius: '4px', borderLeft: `3px solid ${palette.accent}` }}>
            <h3 className="res-section-title" style={{ color: palette.primary, marginBottom: '0.3rem' }}>{headings.objective || 'Career Objective'}</h3>
            <p className="res-summary-text">{resume.objective}</p>
          </section>
        )}

        {!isHidden('education') && resume.education?.length > 0 && (
          <section className="res-section">
            <h3 className="res-section-title" style={{ color: palette.primary, borderBottom: `2px solid ${palette.accent}`, paddingBottom: '3px' }}>{headings.education || 'Education & Academic Honors'}</h3>
            {resume.education.map(ed => (
              <div key={ed.id} className="res-entry" style={{ background: '#eff6ff', padding: '0.6rem 0.85rem', borderRadius: '4px', marginBottom: '0.6rem' }}>
                <div className="res-entry-head">
                  <span className="res-entry-title">{ed.degree}</span>
                  <span className="res-entry-date">{ed.startDate} – {ed.isCurrent ? 'Present' : ed.endDate || ed.year}</span>
                </div>
                <div className="res-entry-subtitle" style={{ color: palette.accent }}>{ed.school} • {ed.location}</div>
                {ed.gpa && <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#1e3a8a', marginTop: '2px' }}>{ed.gpa}</div>}
                {ed.coursework && <div style={{ fontSize: '0.76rem', color: '#475569', marginTop: '2px' }}>Coursework: {ed.coursework}</div>}
              </div>
            ))}
          </section>
        )}

        {!isHidden('projects') && resume.projects?.length > 0 && (
          <section className="res-section">
            <h3 className="res-section-title" style={{ color: palette.primary, borderBottom: `2px solid ${palette.accent}`, paddingBottom: '3px' }}>{headings.projects || 'Academic & Capstone Projects'}</h3>
            {resume.projects.map(proj => (
              <div key={proj.id} className="res-entry">
                <div className="res-entry-head">
                  <span className="res-entry-title">{proj.title}</span>
                  {proj.link && <span className="res-entry-location">🔗 {proj.link}</span>}
                </div>
                {proj.tech && <div className="res-entry-subtitle" style={{ fontSize: '0.8rem', color: palette.accent }}>Tech: {proj.tech}</div>}
                {renderBullets(proj.bullets)}
              </div>
            ))}
          </section>
        )}

        {!isHidden('skills') && resume.skills && (
          <section className="res-section">
            <h3 className="res-section-title" style={{ color: palette.primary, borderBottom: `2px solid ${palette.accent}`, paddingBottom: '3px' }}>{headings.skills || 'Technical Competencies'}</h3>
            <div className="res-skills-cloud">
              {resume.skills.split(',').map((s, i) => <span key={i} className="res-skill-tag">{s.trim()}</span>)}
            </div>
          </section>
        )}

        {!isHidden('experiences') && resume.experiences?.length > 0 && (
          <section className="res-section">
            <h3 className="res-section-title" style={{ color: palette.primary, borderBottom: `2px solid ${palette.accent}`, paddingBottom: '3px' }}>{headings.experiences || 'Internships & Leadership'}</h3>
            {resume.experiences.map(exp => (
              <div key={exp.id} className="res-entry">
                <div className="res-entry-head">
                  <span className="res-entry-title">{exp.role}</span>
                  <span className="res-entry-date">{exp.startDate} – {exp.isCurrent ? 'Present' : exp.endDate}</span>
                </div>
                <div className="res-entry-subtitle">{exp.company} • {exp.location}</div>
                {renderBullets(exp.bullets)}
              </div>
            ))}
          </section>
        )}

        {!isHidden('awards') && resume.awards?.length > 0 && (
          <section className="res-section">
            <h3 className="res-section-title" style={{ color: palette.primary, borderBottom: `2px solid ${palette.accent}`, paddingBottom: '3px' }}>{headings.awards || 'Honors & Distinctions'}</h3>
            {resume.awards.map(awd => (
              <div key={awd.id} className="res-entry" style={{ marginBottom: '0.45rem' }}>
                <div className="res-entry-head">
                  <span className="res-entry-title">{awd.title}</span>
                  {awd.year && <span className="res-entry-date">{awd.year}</span>}
                </div>
                {awd.issuer && <div className="res-entry-subtitle">{awd.issuer}</div>}
                {awd.description && (
                  <div style={{ fontSize: '0.8rem', color: '#475569', marginTop: '2px' }}>
                    {awd.description}
                  </div>
                )}
              </div>
            ))}
          </section>
        )}

        {!isHidden('certifications') && resume.certifications?.length > 0 && (
          <section className="res-section">
            <h3 className="res-section-title" style={{ color: palette.primary, borderBottom: `2px solid ${palette.accent}`, paddingBottom: '3px' }}>{headings.certifications || 'Certifications'}</h3>
            <div className="res-skills-cloud">
              {resume.certifications.map(c => (
                <span key={c.id} className="res-skill-tag">
                  🏅 {c.title} ({c.issuer} {c.year})
                </span>
              ))}
            </div>
          </section>
        )}
      </div>
    );
  }

  // 8. Default: Software Developer / Modern Single Column (All Remaining 17 Templates)
  return (
    <div style={{ padding: '16mm 18mm' }}>
      <header className="flex justify-between items-start" style={{ marginBottom: '1.25rem' }}>
        <div style={{ flex: 1 }}>
          <h1 className="res-header-name" style={{ fontSize: '2.2rem', color: palette.primary }}>{resume.name}</h1>
          <h2 className="res-header-title" style={{ fontSize: '1.05rem', color: palette.accent, marginTop: '3px' }}>{resume.roleTitle || resume.title}</h2>
          <div style={{ marginTop: '6px' }}>{renderContactBar(' • ')}</div>
        </div>
        {resume.showAvatar && resume.avatar && (
          <div style={{ marginLeft: '1rem' }}>
            <img src={resume.avatar} style={{ width: '72px', height: '72px', borderRadius: '50%', objectFit: 'cover', border: `2.5px solid ${palette.accent}` }} alt="Avatar" />
          </div>
        )}
      </header>

      {!isHidden('summary') && resume.summary && (
        <section className="res-section">
          <h3 className="res-section-title" style={{ color: palette.primary, borderBottom: `2px solid ${palette.accent}`, paddingBottom: '3px' }}>{headings.summary || 'Executive Summary'}</h3>
          <p className="res-summary-text">{resume.summary}</p>
        </section>
      )}

      {!isHidden('skills') && resume.skills && (
        <section className="res-section">
          <h3 className="res-section-title" style={{ color: palette.primary, borderBottom: `2px solid ${palette.accent}`, paddingBottom: '3px' }}>{headings.skills || 'Technical Skills & Tooling'}</h3>
          <div className="res-skills-cloud">
            {resume.skills.split(',').map((s, i) => (
              <span key={i} className="res-skill-tag" style={{ borderLeft: `2.5px solid ${palette.accent}` }}>
                {s.trim()}
              </span>
            ))}
          </div>
        </section>
      )}

      {!isHidden('experiences') && resume.experiences?.length > 0 && (
        <section className="res-section">
          <h3 className="res-section-title" style={{ color: palette.primary, borderBottom: `2px solid ${palette.accent}`, paddingBottom: '3px' }}>{headings.experiences || 'Professional Experience'}</h3>
          {resume.experiences.map(exp => (
            <div key={exp.id} className="res-entry">
              <div className="res-entry-head">
                <span className="res-entry-title">{exp.role}</span>
                <span className="res-entry-date">{exp.startDate} – {exp.isCurrent ? 'Present' : exp.endDate}</span>
              </div>
              <div className="res-entry-subtitle">{exp.company} • {exp.location}</div>
              {renderBullets(exp.bullets)}
            </div>
          ))}
        </section>
      )}

      {!isHidden('projects') && resume.projects?.length > 0 && (
        <section className="res-section">
          <h3 className="res-section-title" style={{ color: palette.primary, borderBottom: `2px solid ${palette.accent}`, paddingBottom: '3px' }}>{headings.projects || 'Key Projects'}</h3>
          {resume.projects.map(proj => (
            <div key={proj.id} className="res-entry">
              <div className="res-entry-head">
                <span className="res-entry-title">{proj.title}</span>
                {proj.link && <span className="res-entry-location">🔗 {proj.link}</span>}
              </div>
              {proj.tech && <div className="res-entry-subtitle" style={{ fontSize: '0.8rem', color: palette.accent }}>Stack: {proj.tech}</div>}
              {renderBullets(proj.bullets)}
            </div>
          ))}
        </section>
      )}

      {!isHidden('education') && resume.education?.length > 0 && (
        <section className="res-section">
          <h3 className="res-section-title" style={{ color: palette.primary, borderBottom: `2px solid ${palette.accent}`, paddingBottom: '3px' }}>{headings.education || 'Education'}</h3>
          {resume.education.map(ed => (
            <div key={ed.id} className="res-entry" style={{ marginBottom: '0.4rem' }}>
              <div className="res-entry-head">
                <span className="res-entry-title">{ed.degree}</span>
                <span className="res-entry-date">{ed.endDate || ed.year}</span>
              </div>
              <div className="res-entry-subtitle">{ed.school} • {ed.location}</div>
              {ed.gpa && <div style={{ fontSize: '0.78rem', color: '#475569' }}>{ed.gpa}</div>}
            </div>
          ))}
        </section>
      )}

      {!isHidden('certifications') && resume.certifications?.length > 0 && (
        <section className="res-section">
          <h3 className="res-section-title" style={{ color: palette.primary, borderBottom: `2px solid ${palette.accent}`, paddingBottom: '3px' }}>{headings.certifications || 'Certifications'}</h3>
          <div className="res-skills-cloud">
            {resume.certifications.map(c => (
              <span key={c.id} className="res-skill-tag" style={{ background: '#f8fafc', color: '#0f172a' }}>
                🏅 {c.title} ({c.issuer} {c.year})
              </span>
            ))}
          </div>
        </section>
      )}

      {!isHidden('awards') && resume.awards?.length > 0 && (
        <section className="res-section">
          <h3 className="res-section-title" style={{ color: palette.primary, borderBottom: `2px solid ${palette.accent}`, paddingBottom: '3px' }}>{headings.awards || 'Honors & Awards'}</h3>
          {resume.awards.map(awd => (
            <div key={awd.id} className="res-entry" style={{ marginBottom: '0.45rem' }}>
              <div className="res-entry-head">
                <span className="res-entry-title">{awd.title}</span>
                {awd.year && <span className="res-entry-date">{awd.year}</span>}
              </div>
              {awd.issuer && <div className="res-entry-subtitle">{awd.issuer}</div>}
              {awd.description && (
                <div style={{ fontSize: '0.8rem', color: '#475569', marginTop: '2px' }}>
                  {awd.description}
                </div>
              )}
            </div>
          ))}
        </section>
      )}

      {!isHidden('languages') && resume.languages?.length > 0 && (
        <section className="res-section">
          <h3 className="res-section-title" style={{ color: palette.primary, borderBottom: `2px solid ${palette.accent}`, paddingBottom: '3px' }}>{headings.languages || 'Languages'}</h3>
          <div className="res-skills-cloud">
            {resume.languages.map(l => (
              <span key={l.id} className="res-skill-tag">
                {l.language} — {l.proficiency}
              </span>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}



// =========================================================
// DASHBOARD VIEW (COMMAND CENTER)
// =========================================================
function DashboardView({
  currentUser,
  resume,
  resumes,
  onSelectResume,
  onCreateResume,
  onDuplicateResume,
  onDeleteResume,
  onNavigate,
  onSelectTemplate,
  atsScore,
  atsChecks
}) {
  const activeTpl = TEMPLATES_CATALOG.find(t => t.id === resume.template) || TEMPLATES_CATALOG[0];
  const displayName = (currentUser && currentUser.name) ? currentUser.name : (resume.name || 'Candidate');

  return (
    <div className="dashboard-view">
      {/* Hero Welcome Banner */}
      <div className="dashboard-hero">
        <div className="dashboard-hero-content">
          <h1>Welcome back, {displayName}</h1>
          <p>
            Your current resume is optimized with the <strong>{activeTpl.name}</strong> template.
            Powered by high-speed Groq AI (Llama 3.3 70B) for real-time ATS scoring, Google XYZ bullet formulation, and instant vector PDF export.
          </p>
          <div className="dashboard-hero-actions">
            <button className="btn btn-primary" onClick={() => onNavigate('studio')}>
              ✦ Open Resume Studio
            </button>
            <button className="btn btn-secondary" onClick={() => onNavigate('templates')}>
              🎨 Browse 25+ Templates
            </button>
            <button className="btn btn-outline" onClick={() => onNavigate('cover-letter')}>
              ✍️ Cover Letter Writer
            </button>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-icon blue">📑</div>
          <div className="metric-data">
            <h3>{resumes.length}</h3>
            <p>Active Resumes</p>
          </div>
        </div>
        <div className="metric-card">
          <div className="metric-icon emerald">🛡️</div>
          <div className="metric-data">
            <h3>{atsScore}%</h3>
            <p>ATS Match Score</p>
          </div>
        </div>
        <div className="metric-card">
          <div className="metric-icon purple">🎨</div>
          <div className="metric-data">
            <h3>25</h3>
            <p>Design Templates</p>
          </div>
        </div>
        <div className="metric-card">
          <div className="metric-icon amber">✦</div>
          <div className="metric-data">
            <h3>Groq Llama 3.3</h3>
            <p>AI Engine Ready</p>
          </div>
        </div>
      </div>

      {/* Dashboard 2-Column Split */}
      <div className="dashboard-grid">
        {/* Left: My Resumes Manager */}
        <div className="dash-panel">
          <div className="dash-panel-header">
            <h2 className="dash-panel-title">
              <span>📄</span> My Saved Resumes ({resumes.length})
            </h2>
            <button className="btn btn-primary btn-sm" onClick={onCreateResume}>
              + New Resume
            </button>
          </div>

          <div>
            {resumes.map(r => {
              const tplObj = TEMPLATES_CATALOG.find(t => t.id === r.template) || TEMPLATES_CATALOG[0];
              const isCurrent = r.id === resume.id;
              return (
                <div key={r.id} className={`resume-item-card ${isCurrent ? 'active' : ''}`}>
                  <div className="resume-item-meta">
                    <h4>{r.title || 'Untitled Resume'}</h4>
                    <p>
                      <span className="resume-badge">{tplObj.name}</span>
                      {r.name} • {r.roleTitle || r.title}
                    </p>
                  </div>
                  <div className="flex items-center gap-xs">
                    {!isCurrent && (
                      <button className="btn btn-secondary btn-sm" onClick={() => onSelectResume(r.id)}>
                        Switch
                      </button>
                    )}
                    <button className="btn btn-primary btn-sm" onClick={() => { onSelectResume(r.id); onNavigate('studio'); }}>
                      Edit Studio
                    </button>
                    <button className="btn btn-secondary btn-sm" title="Duplicate" onClick={() => onDuplicateResume(r.id)}>
                      ⎘
                    </button>
                    {resumes.length > 1 && (
                      <button className="btn btn-danger btn-sm" title="Delete" onClick={() => onDeleteResume(r.id)}>
                        ✕
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: ATS Diagnostics & Health Checklist */}
        <div className="dash-panel">
          <div className="dash-panel-header">
            <h2 className="dash-panel-title">
              <span>🛡️</span> ATS Readiness Diagnostics
            </h2>
            <span style={{ fontSize: '0.8rem', color: '#10b981', fontWeight: 700 }}>
              {atsScore >= 80 ? '✓ Ready to Apply' : '⚠ Action Recommended'}
            </span>
          </div>

          <div className="ats-score-display">
            <div className="ats-score-circle">
              {atsScore}
              <span>SCORE</span>
            </div>
            <div>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '2px' }}>
                {atsScore >= 90 ? 'Exceptional ATS Compatibility' : atsScore >= 75 ? 'Strong Baseline ATS Score' : 'Needs Optimization'}
              </h4>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                Based on Ivy League resume formulas, recruiter keyword depth, and Harvard linear readability.
              </p>
            </div>
          </div>

          <div className="ats-checklist">
            {atsChecks.map((chk, i) => (
              <div key={i} className={`ats-check-item ${chk.passed ? 'passed' : 'failed'}`}>
                <span>{chk.passed ? '✓' : '○'}</span>
                <span>{chk.label}</span>
              </div>
            ))}
          </div>

          <button
            className="btn btn-secondary btn-sm"
            style={{ width: '100%', marginTop: '1.25rem' }}
            onClick={() => onNavigate('studio')}
          >
            Optimize in AI Studio →
          </button>
        </div>
      </div>

      {/* Featured Templates Shelf */}
      <div className="dash-panel">
        <div className="dash-panel-header">
          <h2 className="dash-panel-title">
            <span>✨</span> Featured Design Templates
          </h2>
          <button className="btn btn-ghost btn-sm" onClick={() => onNavigate('templates')}>
            View All 25 Templates →
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
          {[
            TEMPLATES_CATALOG.find(t => t.id === 'tpl_software_dev'),
            TEMPLATES_CATALOG.find(t => t.id === 'tpl_executive'),
            TEMPLATES_CATALOG.find(t => t.id === 'tpl_ats_classic'),
            TEMPLATES_CATALOG.find(t => t.id === 'tpl_college_student')
          ].filter(Boolean).map(t => (
            <div key={t.id} className="tpl-card" style={{ padding: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <span className={`tpl-badge ${t.badgeColor}`}>{t.tag}</span>
                <span style={{ fontSize: '0.75rem', color: '#f59e0b', fontWeight: 700 }}>★ 4.9</span>
              </div>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.35rem' }}>{t.name}</h4>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '0.85rem', flex: 1 }}>{t.desc}</p>
              <button
                className="btn btn-primary btn-sm"
                style={{ width: '100%' }}
                onClick={() => { onSelectTemplate(t.id); onNavigate('studio'); }}
              >
                Use Template →
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// =========================================================
// TEMPLATES SELECTION GALLERY VIEW (25 TEMPLATES)
// =========================================================
function TemplatesView({ currentTemplate, onSelectTemplate, onNavigate, resume }) {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('recommended');
  const [previewModalTpl, setPreviewModalTpl] = useState(null);

  const categories = [
    'All',
    'Professional',
    'Modern',
    'ATS-Friendly',
    'Technology & Engineering',
    'Student & Fresher'
  ];

  // Filtering
  const filteredTemplates = useMemo(() => {
    return TEMPLATES_CATALOG.filter(t => {
      const matchCat = selectedCategory === 'All' || t.category === selectedCategory;
      const q = searchQuery.toLowerCase();
      const matchSearch = !q || t.name.toLowerCase().includes(q) || t.desc.toLowerCase().includes(q) || t.tag.toLowerCase().includes(q);
      return matchCat && matchSearch;
    }).sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      return 0;
    });
  }, [selectedCategory, searchQuery, sortBy]);

  // Mini Thumbnail Component representing the actual visual architecture
  const renderMiniThumbnail = (t) => {
    // 1. Sidebar layouts
    if (t.id === 'tpl_executive' || t.id === 'tpl_twocol_modern') {
      return (
        <div className="mini-sheet">
          <div className="mini-sidebar-layout">
            <div className="mini-sidebar">
              <div style={{ width: '14px', height: '14px', borderRadius: '50%', background: '#94a3b8', margin: '0 auto 2px' }} />
              <div className="mini-header-line" style={{ width: '85%' }} />
              <div className="mini-sub-line" style={{ width: '60%' }} />
              <div className="mini-divider" />
              <div className="mini-body-line" />
              <div className="mini-body-line short" />
            </div>
            <div className="mini-main">
              <div className="mini-header-line" style={{ width: '45%' }} />
              <div className="mini-body-line" />
              <div className="mini-body-line" />
              <div className="mini-body-line short" />
              <div className="mini-divider" />
              <div className="mini-header-line" style={{ width: '45%' }} />
              <div className="mini-body-line" />
              <div className="mini-body-line short" />
            </div>
          </div>
        </div>
      );
    }

    // 2. Banner headers
    if (t.id === 'tpl_creative_modern' || t.id === 'tpl_creative' || t.id === 'tpl_biz_pro') {
      return (
        <div className="mini-sheet">
          <div className="mini-banner-header">
            <div className="mini-banner-line" />
            <div className="mini-banner-sub" />
          </div>
          <div className="mini-header-line" style={{ width: '40%' }} />
          <div className="mini-body-line" />
          <div className="mini-body-line short" />
          <div className="mini-divider" />
          <div className="mini-header-line" style={{ width: '50%' }} />
          <div className="mini-body-line" />
          <div className="mini-body-line" />
        </div>
      );
    }

    // 3. Timeline
    if (t.id === 'tpl_stylish') {
      return (
        <div className="mini-sheet">
          <div className="mini-header-line" style={{ width: '70%', marginBottom: '4px' }} />
          <div className="mini-sub-line" style={{ width: '45%', marginBottom: '6px' }} />
          <div className="mini-timeline-item">
            <div className="mini-dot" />
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '3px' }}>
              <div className="mini-header-line" style={{ width: '50%' }} />
              <div className="mini-body-line" />
            </div>
          </div>
          <div className="mini-timeline-item">
            <div className="mini-dot" />
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '3px' }}>
              <div className="mini-header-line" style={{ width: '45%' }} />
              <div className="mini-body-line short" />
            </div>
          </div>
        </div>
      );
    }

    // 4. Centered ATS Classic / Elegant
    if (t.id === 'tpl_ats_classic' || t.id === 'tpl_minimal_ats' || t.id === 'tpl_elegant_pro') {
      return (
        <div className="mini-sheet" style={{ alignItems: 'center' }}>
          <div className="mini-header-line" style={{ width: '60%', margin: '0 auto 2px' }} />
          <div className="mini-sub-line" style={{ width: '35%', margin: '0 auto 4px' }} />
          <div className="mini-divider" style={{ width: '100%' }} />
          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '3px', marginTop: '2px' }}>
            <div className="mini-header-line" style={{ width: '45%' }} />
            <div className="mini-body-line" />
            <div className="mini-body-line" />
            <div className="mini-body-line short" />
            <div className="mini-divider" style={{ width: '100%' }} />
            <div className="mini-header-line" style={{ width: '40%' }} />
            <div className="mini-body-line" />
          </div>
        </div>
      );
    }

    // Default Single Column Tech / Modern
    return (
      <div className="mini-sheet">
        <div className="mini-header-line" style={{ width: '55%' }} />
        <div className="mini-sub-line" style={{ width: '35%' }} />
        <div className="mini-divider" />
        <div className="mini-header-line" style={{ width: '40%', height: '4px' }} />
        <div className="mini-body-line" />
        <div className="mini-body-line short" />
        <div className="mini-divider" />
        <div className="mini-header-line" style={{ width: '45%', height: '4px' }} />
        <div className="mini-body-line" />
        <div className="mini-body-line" />
        <div className="mini-body-line short" />
      </div>
    );
  };

  return (
    <div className="templates-view">
      <div className="templates-header">
        <h1>25+ Professional Resume Templates</h1>
        <p>
          Engineered for 99.4% ATS parser readability and executive hiring standards.
          Switch designs anytime — your data carries over seamlessly with zero loss.
        </p>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="templates-filter-bar">
        <div className="category-pills">
          {categories.map(cat => (
            <button
              key={cat}
              className={`category-pill ${selectedCategory === cat ? 'active' : ''}`}
              onClick={() => setSelectedCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="templates-search-box">
          <input
            type="text"
            className="templates-search-input"
            placeholder="🔍 Search templates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <select
            className="form-select"
            style={{ width: 'auto', padding: '0.45rem 0.75rem', fontSize: '0.82rem' }}
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="recommended">Featured / Top Rated</option>
            <option value="name">Alphabetical (A-Z)</option>
          </select>
        </div>
      </div>

      {/* Templates Grid */}
      <div className="templates-grid">
        {filteredTemplates.map(t => {
          const isSelected = currentTemplate === t.id;
          return (
            <div key={t.id} className={`tpl-card ${isSelected ? 'active' : ''}`}>
              <div className="tpl-thumbnail-box">
                {renderMiniThumbnail(t)}
              </div>
              <div className="tpl-card-body">
                <div className="tpl-card-top">
                  <span className={`tpl-badge ${t.badgeColor}`}>{t.tag}</span>
                  <span style={{ fontSize: '0.78rem', color: '#f59e0b', fontWeight: 700 }}>★ 4.9</span>
                </div>
                <h3 className="tpl-card-title">{t.name}</h3>
                <div className="tpl-card-category">{t.category}</div>
                <p className="tpl-card-desc">{t.desc}</p>
                <div className="tpl-card-actions">
                  <button
                    className="btn btn-outline btn-sm"
                    onClick={() => setPreviewModalTpl(t)}
                  >
                    👁 Preview
                  </button>
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={() => {
                      onSelectTemplate(t.id);
                      toast(`Activated ${t.name}!`, 'success');
                      onNavigate('studio');
                    }}
                  >
                    {isSelected ? '✓ Current' : 'Use Template'}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Live Template Preview Modal */}
      {previewModalTpl && (
        <div className="modal-overlay" onClick={() => setPreviewModalTpl(null)}>
          <div className="modal-card" style={{ maxWidth: '900px', maxHeight: '92vh' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h3 className="modal-title">{previewModalTpl.name} Preview</h3>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Category: {previewModalTpl.category}</span>
              </div>
              <button className="btn-icon" onClick={() => setPreviewModalTpl(null)}>✕</button>
            </div>
            <div className="modal-body" style={{ background: '#0b0f19', padding: '2rem', display: 'flex', justifyContent: 'center', overflow: 'auto' }}>
              <div style={{ transform: 'scale(0.85)', transformOrigin: 'top center' }}>
                <div className={`a4-resume-sheet template-${previewModalTpl.id}`}>
                  <ResumeRenderer
                    resume={{ ...resume, template: previewModalTpl.id }}
                    palette={COLOR_PALETTES[resume.color] || COLOR_PALETTES.blue}
                  />
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setPreviewModalTpl(null)}>
                Close Preview
              </button>
              <button
                className="btn btn-primary"
                onClick={() => {
                  onSelectTemplate(previewModalTpl.id);
                  setPreviewModalTpl(null);
                  toast(`Activated ${previewModalTpl.name}!`, 'success');
                  onNavigate('studio');
                }}
              >
                Use This Template →
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}



// =========================================================
// AI RESUME STUDIO VIEW (EDITOR + LIVE PREVIEW)
// =========================================================
function StudioView({
  resume,
  setResume,
  onNavigate,
  onExportPDF,
  isExporting,
  atsAnalysis,
  jobDescription,
  setJobDescription,
  onOpenSettings,
  onOpenReviewModal
}) {
  const [activeTab, setActiveTab] = useState('profile');
  const [zoom, setZoom] = useState(1.0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [mobileTab, setMobileTab] = useState('editor'); // 'editor' | 'preview'

  const palette = COLOR_PALETTES[resume.color] || COLOR_PALETTES.blue;
  const headings = resume.sectionHeadings || {};
  const hidden = resume.hiddenSections || {};

  // Helper updates
  const updateField = (field, val) => setResume({ ...resume, [field]: val });

  const updateHeading = (section, val) => {
    setResume({
      ...resume,
      sectionHeadings: { ...headings, [section]: val }
    });
  };

  const toggleSectionHide = (section) => {
    setResume({
      ...resume,
      hiddenSections: { ...hidden, [section]: !hidden[section] }
    });
  };

  // Reorder sections helper
  const moveSection = (idx, dir) => {
    const list = [...(resume.sectionOrder || INITIAL_RESUME.sectionOrder || [])];
    const targetIdx = idx + dir;
    if (targetIdx < 0 || targetIdx >= list.length) return;
    const temp = list[idx];
    list[idx] = list[targetIdx];
    list[targetIdx] = temp;
    setResume({ ...resume, sectionOrder: list });
  };

  const handleAddExperience = () => {
    const newItem = {
      id: `exp_${Date.now()}`,
      role: 'Senior Software Engineer',
      company: 'Tech Enterprise',
      location: 'Remote',
      startDate: '2023-01',
      endDate: '',
      isCurrent: true,
      bullets: '• Architected resilient full-stack cloud services with 99.99% operational uptime.\n• Accelerated sprint feature velocity by 35% through modular code patterns.'
    };
    setResume({
      ...resume,
      experiences: [newItem, ...(resume.experiences || [])]
    });
    toast('Added new work experience record!', 'success');
  };

  const handleAddEducation = () => {
    const newItem = {
      id: `edu_${Date.now()}`,
      degree: 'B.S. in Computer Science & Engineering',
      school: 'University Institute of Technology',
      location: 'City, State',
      startDate: '2020',
      endDate: '2024',
      isCurrent: false,
      gpa: 'GPA: 3.8 / 4.0'
    };
    setResume({
      ...resume,
      education: [newItem, ...(resume.education || [])]
    });
    toast('Added new education record!', 'success');
  };

  const handleAddProject = () => {
    const newItem = {
      id: `proj_${Date.now()}`,
      title: 'Distributed Cloud System',
      tech: 'React, Node.js, Python, PostgreSQL, Docker',
      link: 'github.com/project',
      bullets: '• Engineered end-to-end full stack system scaling to 50k+ active sessions.'
    };
    setResume({
      ...resume,
      projects: [newItem, ...(resume.projects || [])]
    });
    toast('Added new project record!', 'success');
  };

  const handleAddCertification = () => {
    const newCert = {
      id: `cert_${Date.now()}`,
      title: 'AWS Certified Solutions Architect',
      issuer: 'Amazon Web Services',
      year: new Date().getFullYear().toString()
    };
    setResume({
      ...resume,
      certifications: [...(resume.certifications || []), newCert]
    });
    toast('Added new certification!', 'success');
  };

  const handleRemoveCertification = certId => {
    setResume({
      ...resume,
      certifications: (resume.certifications || []).filter(c => c.id !== certId)
    });
  };

  const handleUpdateCertification = (certId, field, val) => {
    setResume({
      ...resume,
      certifications: (resume.certifications || []).map(c => c.id === certId ? { ...c, [field]: val } : c)
    });
  };

  const handleAddLanguage = () => {
    const newLang = {
      id: `lang_${Date.now()}`,
      language: 'English',
      proficiency: 'Professional Working'
    };
    setResume({
      ...resume,
      languages: [...(resume.languages || []), newLang]
    });
    toast('Added new language!', 'success');
  };

  const handleRemoveLanguage = langId => {
    setResume({
      ...resume,
      languages: (resume.languages || []).filter(l => l.id !== langId)
    });
  };

  const handleUpdateLanguage = (langId, field, val) => {
    setResume({
      ...resume,
      languages: (resume.languages || []).map(l => l.id === langId ? { ...l, [field]: val } : l)
    });
  };

  const handleAddAward = () => {
    const newAward = {
      id: `awd_${Date.now()}`,
      title: 'Outstanding Innovation Award',
      issuer: 'Tech Hackathon / Organization',
      year: new Date().getFullYear().toString(),
      description: 'Recognized for technical excellence, proactive problem solving, and impactful project results.'
    };
    setResume({
      ...resume,
      awards: [...(resume.awards || []), newAward]
    });
    toast('Added new award!', 'success');
  };

  const handleRemoveAward = awardId => {
    setResume({
      ...resume,
      awards: (resume.awards || []).filter(a => a.id !== awardId)
    });
  };

  const handleUpdateAward = (awardId, field, val) => {
    setResume({
      ...resume,
      awards: (resume.awards || []).map(a => a.id === awardId ? { ...a, [field]: val } : a)
    });
  };

  const handleAIEnhanceAward = async awardId => {
    const item = (resume.awards || []).find(a => a.id === awardId);
    if (!item) return;
    setIsGenerating(true);
    toast('Polishing award accomplishments with Groq AI...', 'info');

    const prompt = `Craft a concise, impactful 1-2 sentence accomplishment description for this honor/award on a professional resume:
Award Title: "${item.title || 'Excellence Award'}"
Issuing Organization: "${item.issuer || 'Organization'}"
Year: "${item.year || ''}"
Existing Details: "${item.description || ''}"

Highlight competitive merit, innovation, and measurable impact. Return ONLY the polished 1-2 sentence description without quotes, commentary, or markdown formatting.`;

    const sys = 'You are an executive resume writer. Output ONLY a concise, high-impact award description.';
    let res = null;
    try {
      res = await callGroqAI(prompt, sys);
    } catch (e) {}

    setIsGenerating(false);

    const textToUse = res && res.text ? res.text.trim().replace(/^["']|["']$/g, '') : generateSmartNLPContent('award_details', {
      title: item.title,
      issuer: item.issuer
    });
    const badge = res && res.text ? res.engine : 'Smart NLP Engine';

    onOpenReviewModal({
      badge: badge,
      originalText: item.description || '',
      aiText: textToUse,
      onAccept: txt => {
        handleUpdateAward(awardId, 'description', txt);
        toast('Award details updated!', 'success');
      },
      onRegenerate: () => handleAIEnhanceAward(awardId)
    });
  };

  // Profile Avatar Upload Handler (FileReader -> base64 DataURL)
  const handleAvatarUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast('Image size should be under 2MB', 'error');
        return;
      }
      const reader = new FileReader();
      reader.onload = (uploadEvt) => {
        setResume({ ...resume, avatar: uploadEvt.target.result, showAvatar: true });
        toast('Avatar photo uploaded!', 'success');
      };
      reader.readAsDataURL(file);
    }
  };

  // 1. Groq AI Summary Generator
  const handleGenerateSummary = async (presetTone) => {
    setIsGenerating(true);
    const toneToUse = presetTone || resume.writingStyle || 'professional';
    toast(`Generating ${toneToUse} summary with AI...`, 'info');
    const role = resume.roleTitle || resume.title || 'Software Engineer';
    const skills = resume.skills || 'TypeScript, React, Cloud Architecture';

    const prompt = `Write a high-impact, 3-sentence executive resume summary for a candidate targeting '${role}' with skills in '${skills}'. Tone: ${toneToUse}. Include realistic outcome metrics (latency, throughput, efficiency) without confidential company names. Output ONLY the summary paragraph.`;
    const sys = "You are an executive resume writer for elite tech companies. Output only the finished summary.";

    let res = null;
    try {
      res = await callGroqAI(prompt, sys);
    } catch (e) {}

    setIsGenerating(false);

    const textToUse = (res && res.text) ? res.text : generateSmartNLPContent('summary', { role, skills, tone: toneToUse, name: resume.name });
    const badge = (res && res.text) ? res.engine : 'Smart NLP Engine';

    onOpenReviewModal({
      badge: badge,
      originalText: resume.summary,
      aiText: textToUse,
      onAccept: (txt) => {
        setResume({ ...resume, summary: txt, writingStyle: toneToUse });
        toast('Summary applied to resume!', 'success');
      },
      onRegenerate: () => handleGenerateSummary(toneToUse)
    });
  };

  // 2. Groq AI Objective Generator (Students / Freshers)
  const handleGenerateObjective = async (presetRole) => {
    setIsGenerating(true);
    const targetRole = presetRole || resume.roleTitle || resume.title || 'Software Developer';
    toast(`Formulating career objective for ${targetRole}...`, 'info');
    const skills = resume.skills || 'Python, JavaScript, Data Structures';

    const prompt = `Write a targeted 2-sentence career objective for an ambitious candidate seeking a '${targetRole}' position with skills in '${skills}'. Emphasize rapid learning agility, academic foundation, and drive to deliver scalable software. Output only the objective.`;
    const sys = "You are a career counselor. Output only the finished objective paragraph.";

    let res = null;
    try {
      res = await callGroqAI(prompt, sys);
    } catch (e) {}

    setIsGenerating(false);

    const textToUse = (res && res.text) ? res.text : generateSmartNLPContent('objective', { role: targetRole, skills, specialization: targetRole });
    const badge = (res && res.text) ? res.engine : 'Smart NLP Engine';

    onOpenReviewModal({
      badge: badge,
      originalText: resume.objective || '',
      aiText: textToUse,
      onAccept: (txt) => {
        setResume({ ...resume, objective: txt });
        toast('Career objective applied!', 'success');
      },
      onRegenerate: () => handleGenerateObjective(targetRole)
    });
  };

  // 3. Groq AI Bullet Point Enhancer (Google XYZ formula)
  const handleEnhanceBullets = async (type, id) => {
    setIsGenerating(true);
    toast('Applying Google XYZ formula with AI...', 'info');
    const item = type === 'exp'
      ? (resume.experiences || []).find(e => e.id === id)
      : (resume.projects || []).find(p => p.id === id);

    if (!item) { setIsGenerating(false); return; }

    const raw = item.bullets || '';
    const prompt = `Rewrite each bullet accomplishment using Google's XYZ formula ("Accomplished [X] as measured by [Y] by doing [Z]"). Use strong action verbs (Architected, Engineered, Optimized, Automated) and realistic metrics (e.g., 30-45% latency cut, 99.9% uptime). Raw bullets:\n${raw}\nReturn strictly formatted bullets starting with • without markdown bolding.`;
    const sys = "You are an ATS resume polisher. Output strictly formatted bullets starting with •.";

    let res = null;
    try {
      res = await callGroqAI(prompt, sys);
    } catch (e) {}

    setIsGenerating(false);

    const textToUse = (res && res.text) ? res.text : generateSmartNLPContent('bullets', { raw });
    const badge = (res && res.text) ? res.engine : 'Google XYZ Engine';

    onOpenReviewModal({
      badge: badge,
      originalText: raw,
      aiText: textToUse,
      onAccept: (txt) => {
        if (type === 'exp') {
          const updated = resume.experiences.map(e => e.id === id ? { ...e, bullets: txt } : e);
          setResume({ ...resume, experiences: updated });
        } else {
          const updated = resume.projects.map(p => p.id === id ? { ...p, bullets: txt } : p);
          setResume({ ...resume, projects: updated });
        }
        toast('Accomplishments updated with XYZ formula!', 'success');
      },
      onRegenerate: () => handleEnhanceBullets(type, id)
    });
  };

  // 3b. AI Generate Bullets for Role from Scratch
  const handleGenerateRoleBullets = async (expId) => {
    setIsGenerating(true);
    const item = (resume.experiences || []).find(e => e.id === expId);
    if (!item) { setIsGenerating(false); return; }
    const targetRole = item.role || resume.roleTitle || 'Software Engineer';
    const targetCompany = item.company || 'Tech Company';
    toast(`Generating accomplishments for ${targetRole}...`, 'info');
    const prompt = `Generate 3 high-impact, quantifiable accomplishment bullet points using Google's XYZ formula ("Accomplished [X] as measured by [Y] by doing [Z]") for a '${targetRole}' at '${targetCompany}'. Highlight relevant engineering accomplishments, performance improvements (latency, uptime, throughput), and technical stack. Output strictly 3 formatted bullets starting with • without markdown bolding.`;
    const sys = "You are an executive tech resume writer. Output strictly 3 formatted bullets starting with •.";

    let res = null;
    try {
      res = await callGroqAI(prompt, sys);
    } catch (e) {}

    setIsGenerating(false);

    const textToUse = (res && res.text) ? res.text : generateSmartNLPContent('role_bullets', { role: targetRole, company: targetCompany, skills: resume.skills });
    const badge = (res && res.text) ? res.engine : 'Google XYZ Engine';

    onOpenReviewModal({
      badge: badge,
      originalText: item.bullets || '',
      aiText: textToUse,
      onAccept: (txt) => {
        const updated = resume.experiences.map(e => e.id === expId ? { ...e, bullets: txt } : e);
        setResume({ ...resume, experiences: updated });
        toast('Role accomplishments applied!', 'success');
      },
      onRegenerate: () => handleGenerateRoleBullets(expId)
    });
  };

  // Action verb helper
  const insertActionVerb = (expId, verb) => {
    const item = (resume.experiences || []).find(e => e.id === expId);
    if (!item) return;
    const current = item.bullets || '';
    const addition = current.trim() ? `\n• ${verb} ` : `• ${verb} `;
    const updated = resume.experiences.map(e => e.id === expId ? { ...e, bullets: current + addition } : e);
    setResume({ ...resume, experiences: updated });
    toast(`Inserted action verb "${verb}"`, 'info');
  };

  // 4. Education Coursework & Honors Suggester
  const handleSuggestCoursework = async (eduId) => {
    setIsGenerating(true);
    const item = (resume.education || []).find(e => e.id === eduId);
    if (!item) { setIsGenerating(false); return; }
    const degree = item.degree || 'Bachelor of Technology';
    const school = item.school || 'University';
    toast(`Suggesting coursework & honors for ${degree}...`, 'info');
    const prompt = `Suggest relevant academic honors, dean's list distinction, and specialized coursework for a degree in '${degree}' at '${school}'. Output 1-2 lines formatted for a resume education section (e.g., 'GPA: 3.88 / 4.0 | Dean's Academic Honors | Relevant Coursework: Data Structures, Distributed Systems, Cloud Architecture'). Output ONLY the honors and coursework line.`;
    const sys = "You are an academic resume advisor. Output only the honors and coursework line.";

    let res = null;
    try {
      res = await callGroqAI(prompt, sys);
    } catch (e) {}

    setIsGenerating(false);

    const textToUse = (res && res.text) ? res.text : generateSmartNLPContent('coursework', { degree });
    const badge = (res && res.text) ? res.engine : 'Academic NLP Engine';

    onOpenReviewModal({
      badge: badge,
      originalText: item.gpa || '',
      aiText: textToUse,
      onAccept: (txt) => {
        const updated = resume.education.map(e => e.id === eduId ? { ...e, gpa: txt } : e);
        setResume({ ...resume, education: updated });
        toast('Coursework & honors applied!', 'success');
      },
      onRegenerate: () => handleSuggestCoursework(eduId)
    });
  };

  // 5. Groq AI Skill Recommendation
  const handleRecommendSkills = async () => {
    setIsGenerating(true);
    toast('Recommending industry skill stack...', 'info');
    const role = resume.roleTitle || resume.title || 'Full Stack Engineer';
    const prompt = `List the top 12 in-demand technical skills for a '${role}' as comma-separated values. Output ONLY the comma-separated list of skills.`;
    let res = null;
    try {
      res = await callGroqAI(prompt);
    } catch (e) {}
    setIsGenerating(false);

    let cleanSkills = '';
    if (res && res.text) {
      cleanSkills = res.text.replace(/^[0-9.\-\s]+/, '').trim();
    } else {
      cleanSkills = generateSmartNLPContent('skills', { role });
    }
    const badge = (res && res.text) ? res.engine : 'Skill Taxonomy Engine';

    onOpenReviewModal({
      badge: badge,
      originalText: resume.skills,
      aiText: cleanSkills,
      onAccept: (txt) => {
        setResume({ ...resume, skills: txt });
        toast('Recommended skills added!', 'success');
      },
      onRegenerate: () => handleRecommendSkills()
    });
  };

  // 5b. Skills Categorization Taxonomy
  const handleCategorizeSkills = async () => {
    setIsGenerating(true);
    toast('Categorizing skills taxonomy with AI...', 'info');
    const prompt = `Organize the following technical skills into clean categories (Languages, Frameworks & Libraries, Cloud & DevOps, Databases, Developer Tools):\n${resume.skills || ''}\nOutput format: Languages: ... | Frameworks: ... | Cloud: ... | Databases: ... | Tools: ...`;
    const sys = "You are a technical recruiter. Output only categorized skills taxonomy.";

    let res = null;
    try {
      res = await callGroqAI(prompt, sys);
    } catch (e) {}

    setIsGenerating(false);

    const textToUse = (res && res.text) ? res.text : generateSmartNLPContent('categorized_skills', { skills: resume.skills, role: resume.roleTitle });
    const badge = (res && res.text) ? res.engine : 'Skill Taxonomy Engine';

    onOpenReviewModal({
      badge: badge,
      originalText: resume.skills,
      aiText: textToUse,
      onAccept: (txt) => {
        setResume({ ...resume, skills: txt });
        toast('Categorized skill taxonomy applied!', 'success');
      },
      onRegenerate: () => handleCategorizeSkills()
    });
  };

  // 5c. Soft Skills Suggester
  const handleSuggestSoftSkills = async () => {
    setIsGenerating(true);
    toast('Formulating leadership & soft skills with AI...', 'info');
    const role = resume.roleTitle || resume.title || 'Full Stack Engineer';
    const prompt = `List the top 6 in-demand soft skills and leadership competencies for a '${role}'. Output as comma-separated values.`;
    const sys = "You are a senior recruiter. Output only the comma-separated soft skills.";

    let res = null;
    try {
      res = await callGroqAI(prompt, sys);
    } catch (e) {}

    setIsGenerating(false);

    const textToUse = (res && res.text) ? res.text : generateSmartNLPContent('soft_skills', { role });
    const badge = (res && res.text) ? res.engine : 'Behavioral Competency Engine';

    onOpenReviewModal({
      badge: badge,
      originalText: resume.softSkills || '',
      aiText: textToUse,
      onAccept: (txt) => {
        setResume({ ...resume, softSkills: txt });
        toast('Soft skills added!', 'success');
      },
      onRegenerate: () => handleSuggestSoftSkills()
    });
  };

  // 6. Project Bullets Generator
  const handleGenerateProjectBullets = async (projId) => {
    setIsGenerating(true);
    const item = (resume.projects || []).find(p => p.id === projId);
    if (!item) { setIsGenerating(false); return; }
    const title = item.title || 'Project';
    const tech = item.tech || 'Modern Tech Stack';
    toast(`Generating bullets for ${title}...`, 'info');
    const prompt = `Generate 3 high-impact accomplishment bullets for a project titled '${title}' built with '${tech}'. Use Google XYZ formula with quantifiable metrics (latency, concurrency, uptime). Output strictly 3 formatted bullets starting with • without markdown bolding.`;
    const sys = "You are an ATS technical resume writer. Output strictly 3 bullets starting with •.";

    let res = null;
    try {
      res = await callGroqAI(prompt, sys);
    } catch (e) {}

    setIsGenerating(false);

    const textToUse = (res && res.text) ? res.text : generateSmartNLPContent('project_bullets', { title, tech });
    const badge = (res && res.text) ? res.engine : 'Project Bullet Engine';

    onOpenReviewModal({
      badge: badge,
      originalText: item.bullets || '',
      aiText: textToUse,
      onAccept: (txt) => {
        const updated = resume.projects.map(p => p.id === projId ? { ...p, bullets: txt } : p);
        setResume({ ...resume, projects: updated });
        toast('Project accomplishments applied!', 'success');
      },
      onRegenerate: () => handleGenerateProjectBullets(projId)
    });
  };

  // 7. Tailor Resume to Job Description with Groq AI
  const handleTailorToJD = async () => {
    if (!jobDescription || !jobDescription.trim()) {
      toast('Please paste a target Job Description first!', 'error');
      return;
    }
    setIsGenerating(true);
    toast('Tailoring resume to Job Description...', 'info');

    const missing = atsAnalysis.missing.slice(0, 8);
    const missingStr = missing.join(', ');
    const prompt = `Job Description excerpt:\n${jobDescription.slice(0, 1000)}\n\nMissing target keywords: ${missingStr}\nCurrent Summary: ${resume.summary}\n\nProvide an optimized 3-sentence summary and 2 tailored experience bullets naturally integrating these missing keywords. Output as JSON format: {"tailored_summary": "...", "tailored_bullets": ["• ...", "• ..."]}`;
    const sys = "You are an ATS job tailoring expert. Return valid JSON only.";

    let res = null;
    try {
      res = await callGroqAI(prompt, sys);
    } catch (e) {}

    setIsGenerating(false);

    let summaryText = '';
    let bulletsText = '';
    let parsedOk = false;

    if (res && res.text) {
      try {
        const cleanJson = res.text.replace(/^```json\s*|\s*```$/g, '').trim();
        const parsed = JSON.parse(cleanJson);
        if (parsed.tailored_summary) {
          summaryText = parsed.tailored_summary;
          bulletsText = (parsed.tailored_bullets || []).join('\n');
          parsedOk = true;
        }
      } catch (e) { }
    }

    if (!parsedOk) {
      const fallbackObj = generateSmartNLPContent('tailor_jd', {
        role: resume.roleTitle || resume.title,
        missing: missing
      });
      summaryText = fallbackObj.tailored_summary;
      bulletsText = fallbackObj.tailored_bullets.join('\n');
    }

    const badge = (parsedOk && res) ? res.engine : 'ATS Optimizer Engine';

    onOpenReviewModal({
      badge: badge,
      originalText: resume.summary,
      aiText: `${summaryText}\n\nSuggested Highlights:\n${bulletsText}`,
      onAccept: (txt) => {
        const lines = txt.split('\n\nSuggested Highlights:\n');
        setResume({ ...resume, summary: lines[0] });
        toast('Tailored summary applied!', 'success');
      },
      onRegenerate: () => handleTailorToJD()
    });
  };

  // Add all missing keywords to skills with 1-click
  const handleAddAllMissingKeywords = () => {
    const missing = atsAnalysis.missing.slice(0, 10);
    if (!missing || missing.length === 0) {
      toast('No missing keywords detected!', 'info');
      return;
    }
    const existing = (resume.skills || '').split(',').map(s => s.trim().toLowerCase());
    const toAdd = missing.filter(m => !existing.includes(m.toLowerCase()));
    if (toAdd.length === 0) {
      toast('All detected keywords are already in your skills list!', 'info');
      return;
    }
    const updated = resume.skills && resume.skills.trim() ? `${resume.skills.trim()}, ${toAdd.join(', ')}` : toAdd.join(', ');
    setResume({ ...resume, skills: updated });
    toast(`Added ${toAdd.length} missing keywords to skills!`, 'success');
  };

  // Add missing keyword helper
  const addMissingKeyword = (kw) => {
    const existing = resume.skills ? resume.skills.trim() : '';
    const updated = existing ? `${existing}, ${kw}` : kw;
    setResume({ ...resume, skills: updated });
    toast(`Added "${kw}" to Technical Skills!`, 'success');
  };

  const tabs = [
    { id: 'profile', label: '👤 Profile' },
    { id: 'summary', label: '📝 Summary' },
    { id: 'objective', label: '🎯 Objective' },
    { id: 'experience', label: '💼 Experience' },
    { id: 'education', label: '🎓 Education' },
    { id: 'skills', label: '✦ Skills' },
    { id: 'projects', label: '🚀 Projects' },
    { id: 'more', label: '📑 More Sections' },
    { id: 'ats', label: '🛡️ ATS Optimizer' }
  ];

  return (
    <div className="studio-layout">
      {/* Left Editor Sidebar */}
      <div className="editor-sidebar">
        {/* Stepper Tabs Bar */}
        <div className="editor-stepper-bar">
          {tabs.map(t => (
            <button
              key={t.id}
              className={`step-tab ${activeTab === t.id ? 'active' : ''}`}
              onClick={() => setActiveTab(t.id)}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Scrollable Form Workspace */}
        <div className="editor-scroll-area">
          {/* 1. Profile Tab */}
          {activeTab === 'profile' && (
            <div className="editor-section-card">
              <div className="editor-section-head">
                <h3 className="editor-section-title">Personal Information</h3>
                <label className="flex items-center gap-xs" style={{ fontSize: '0.78rem', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={resume.showAvatar}
                    onChange={(e) => updateField('showAvatar', e.target.checked)}
                  />
                  <span>Show Photo on Resume</span>
                </label>
              </div>

              {resume.showAvatar && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem', padding: '0.75rem', background: 'var(--bg-secondary)', borderRadius: '6px' }}>
                  <img src={resume.avatar || 'assets/images/avatar.jpg'} style={{ width: '56px', height: '56px', borderRadius: '50%', objectFit: 'cover' }} alt="Avatar" />
                  <div>
                    <label className="btn btn-secondary btn-sm" style={{ cursor: 'pointer' }}>
                      Upload New Photo
                      <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleAvatarUpload} />
                    </label>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '4px' }}>PNG or JPG up to 2MB</div>
                  </div>
                </div>
              )}

              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input
                  type="text"
                  className="form-input"
                  value={resume.name || ''}
                  onChange={(e) => updateField('name', e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Professional Role Title</label>
                <input
                  type="text"
                  className="form-input"
                  value={resume.roleTitle || resume.title || ''}
                  onChange={(e) => updateField('roleTitle', e.target.value)}
                />
              </div>

              <div className="editor-grid-2">
                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <input
                    type="email"
                    className="form-input"
                    value={resume.email || ''}
                    onChange={(e) => updateField('email', e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Phone Number</label>
                  <input
                    type="text"
                    className="form-input"
                    value={resume.phone || ''}
                    onChange={(e) => updateField('phone', e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Location (City, State / Remote)</label>
                <input
                  type="text"
                  className="form-input"
                  value={resume.location || ''}
                  onChange={(e) => updateField('location', e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Links (GitHub, LinkedIn, Portfolio)</label>
                <input
                  type="text"
                  className="form-input"
                  value={resume.links || ''}
                  onChange={(e) => updateField('links', e.target.value)}
                />
              </div>
            </div>
          )}

          {/* 2. Summary Tab */}
          {activeTab === 'summary' && (
            <div className="editor-section-card">
              <div className="editor-section-head">
                <h3 className="editor-section-title">Executive Summary</h3>
                <div className="flex items-center gap-xs">
                  <select
                    className="form-select"
                    style={{ padding: '0.25rem 0.5rem', fontSize: '0.78rem' }}
                    value={resume.writingStyle || 'professional'}
                    onChange={(e) => updateField('writingStyle', e.target.value)}
                  >
                    <option value="professional">Tone: Professional</option>
                    <option value="executive">Tone: Executive</option>
                    <option value="persuasive">Tone: Persuasive</option>
                    <option value="concise">Tone: Concise</option>
                    <option value="technical">Tone: Technical</option>
                  </select>
                  <button className="btn btn-primary btn-sm" disabled={isGenerating} onClick={() => handleGenerateSummary()}>
                    ✦ Groq AI Generate
                  </button>
                </div>
              </div>

              {(!resume.summary || !resume.summary.trim()) && (
                <div className="empty-section-prompt">
                  <span>💡</span>
                  <span>No summary written yet. Click '✦ Groq AI Generate' or choose a quick AI tone below to draft an executive summary.</span>
                </div>
              )}

              <div className="form-group">
                <textarea
                  className="form-textarea"
                  rows="6"
                  value={resume.summary || ''}
                  onChange={(e) => updateField('summary', e.target.value)}
                  placeholder="3-sentence high-impact summary highlighting career achievements, metrics, and technical expertise..."
                />
                <div className="ai-preset-row" style={{ marginTop: '0.65rem' }}>
                  <span className="ai-preset-label">Quick AI Tones:</span>
                  <button type="button" className="ai-preset-btn" disabled={isGenerating} onClick={() => handleGenerateSummary('executive')}>✦ Executive</button>
                  <button type="button" className="ai-preset-btn" disabled={isGenerating} onClick={() => handleGenerateSummary('technical')}>✦ Technical</button>
                  <button type="button" className="ai-preset-btn" disabled={isGenerating} onClick={() => handleGenerateSummary('concise')}>✦ Concise</button>
                  <button type="button" className="ai-preset-btn" disabled={isGenerating} onClick={() => handleGenerateSummary('persuasive')}>✦ Persuasive</button>
                </div>
              </div>
            </div>
          )}

          {/* 3. Objective Tab */}
          {activeTab === 'objective' && (
            <div className="editor-section-card">
              <div className="editor-section-head">
                <h3 className="editor-section-title">Career Objective (Freshers & Students)</h3>
                <button className="btn btn-primary btn-sm" disabled={isGenerating} onClick={() => handleGenerateObjective()}>
                  ✦ Suggest with Groq
                </button>
              </div>

              {(!resume.objective || !resume.objective.trim()) && (
                <div className="empty-section-prompt">
                  <span>💡</span>
                  <span>No objective written yet. If you are a student or career starter, click '✦ Suggest with Groq' or select a specialization below.</span>
                </div>
              )}

              <div className="form-group">
                <textarea
                  className="form-textarea"
                  rows="4"
                  value={resume.objective || ''}
                  onChange={(e) => updateField('objective', e.target.value)}
                  placeholder="Targeted career objective outlining academic background, technical skills, and immediate team contribution goals..."
                />
                <div className="ai-preset-row" style={{ marginTop: '0.65rem' }}>
                  <span className="ai-preset-label">Quick AI Specializations:</span>
                  <button type="button" className="ai-preset-btn" disabled={isGenerating} onClick={() => handleGenerateObjective('AI & Machine Learning Engineer')}>✦ AI / Machine Learning</button>
                  <button type="button" className="ai-preset-btn" disabled={isGenerating} onClick={() => handleGenerateObjective('Full-Stack Web Developer')}>✦ Full-Stack Web</button>
                  <button type="button" className="ai-preset-btn" disabled={isGenerating} onClick={() => handleGenerateObjective('Cloud & DevOps Engineer')}>✦ Cloud & DevOps</button>
                  <button type="button" className="ai-preset-btn" disabled={isGenerating} onClick={() => handleGenerateObjective('Data Scientist & ML Engineer')}>✦ Data Science</button>
                </div>
              </div>
            </div>
          )}

          {/* 4. Experience Tab */}
          {activeTab === 'experience' && (
            <div className="editor-section-card">
              <div className="editor-section-head">
                <h3 className="editor-section-title">Work Experience</h3>
                <button
                  className="btn btn-primary btn-sm"
                  onClick={handleAddExperience}
                >
                  + Add Experience
                </button>
              </div>

              {(!resume.experiences || resume.experiences.length === 0) ? (
                <div className="empty-section-state">
                  <div className="empty-section-icon">💼</div>
                  <h4 className="empty-section-title">No Work Experience Added</h4>
                  <p className="empty-section-desc">Add your employment history, role titles, and quantifiable achievements using the Google XYZ formula.</p>
                  <button type="button" className="btn btn-primary btn-sm" onClick={handleAddExperience}>+ Add Work Experience</button>
                </div>
              ) : (
                (resume.experiences || []).map((exp, idx) => (
                  <div key={exp.id} className="repeater-card">
                    <div className="repeater-top-actions">
                      <span style={{ fontWeight: 700, fontSize: '0.82rem' }}>#{idx + 1} {exp.role || 'Position'}</span>
                      <div className="flex items-center gap-xs">
                        <button type="button" className="btn btn-ghost btn-sm" disabled={idx === 0} title="Move up" onClick={() => {
                          const list = [...resume.experiences];
                          const temp = list[idx];
                          list[idx] = list[idx - 1];
                          list[idx - 1] = temp;
                          setResume({ ...resume, experiences: list });
                        }}>↑</button>
                        <button type="button" className="btn btn-ghost btn-sm" disabled={idx === resume.experiences.length - 1} title="Move down" onClick={() => {
                          const list = [...resume.experiences];
                          const temp = list[idx];
                          list[idx] = list[idx + 1];
                          list[idx + 1] = temp;
                          setResume({ ...resume, experiences: list });
                        }}>↓</button>
                        <button type="button" className="btn btn-danger btn-sm" title="Delete record" onClick={() => {
                          setResume({ ...resume, experiences: resume.experiences.filter(e => e.id !== exp.id) });
                        }}>✕</button>
                      </div>
                    </div>

                    <div className="editor-grid-2">
                      <div className="form-group">
                        <label className="form-label">Role Title</label>
                        <input
                          type="text"
                          className="form-input"
                          placeholder="Senior Software Engineer"
                          value={exp.role || ''}
                          onChange={(e) => {
                            const updated = resume.experiences.map(item => item.id === exp.id ? { ...item, role: e.target.value } : item);
                            setResume({ ...resume, experiences: updated });
                          }}
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Company Name</label>
                        <input
                          type="text"
                          className="form-input"
                          placeholder="Tech Enterprise"
                          value={exp.company || ''}
                          onChange={(e) => {
                            const updated = resume.experiences.map(item => item.id === exp.id ? { ...item, company: e.target.value } : item);
                            setResume({ ...resume, experiences: updated });
                          }}
                        />
                      </div>
                    </div>

                    <div className="editor-grid-dates">
                      <div className="form-group">
                        <label className="form-label">Start Date</label>
                        <input
                          type="text"
                          className="form-input"
                          placeholder="2022-01"
                          value={exp.startDate || ''}
                          onChange={(e) => {
                            const updated = resume.experiences.map(item => item.id === exp.id ? { ...item, startDate: e.target.value } : item);
                            setResume({ ...resume, experiences: updated });
                          }}
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">End Date</label>
                        <input
                          type="text"
                          className="form-input"
                          placeholder="Present"
                          disabled={exp.isCurrent}
                          value={exp.isCurrent ? 'Present' : (exp.endDate || '')}
                          onChange={(e) => {
                            const updated = resume.experiences.map(item => item.id === exp.id ? { ...item, endDate: e.target.value } : item);
                            setResume({ ...resume, experiences: updated });
                          }}
                        />
                      </div>
                      <div className="form-group" style={{ paddingBottom: '0.45rem' }}>
                        <label className="flex items-center gap-xs" style={{ fontSize: '0.78rem', cursor: 'pointer' }}>
                          <input
                            type="checkbox"
                            checked={!!exp.isCurrent}
                            onChange={(e) => {
                              const updated = resume.experiences.map(item => item.id === exp.id ? { ...item, isCurrent: e.target.checked } : item);
                              setResume({ ...resume, experiences: updated });
                            }}
                          />
                          <span>Currently Working</span>
                        </label>
                      </div>
                    </div>

                    <div className="form-group">
                      <div className="accomplishments-head-row">
                        <label className="form-label" style={{ margin: 0 }}>Accomplishments (Google XYZ Formula)</label>
                        <div className="accomplishments-btn-group">
                          <button type="button" className="btn btn-outline btn-sm" disabled={isGenerating} title="AI Generate Bullets for Role" onClick={() => handleGenerateRoleBullets(exp.id)}>
                            ✦ AI Bullets
                          </button>
                          <button type="button" className="btn btn-primary btn-sm" disabled={isGenerating} title="Groq XYZ Enhance" onClick={() => handleEnhanceBullets('exp', exp.id)}>
                            ✦ Groq XYZ Enhance
                          </button>
                        </div>
                      </div>
                      <textarea
                        className="form-textarea"
                        rows="4"
                        placeholder="• Accomplished [X] as measured by [Y] by doing [Z]..."
                        value={exp.bullets || ''}
                        onChange={(e) => {
                          const updated = resume.experiences.map(item => item.id === exp.id ? { ...item, bullets: e.target.value } : item);
                          setResume({ ...resume, experiences: updated });
                        }}
                      />
                      <div className="ai-action-verb-bar">
                        <span style={{ color: 'var(--text-muted)' }}>Action Verbs:</span>
                        {['Architected', 'Engineered', 'Spearheaded', 'Optimized', 'Automated', 'Pioneered', 'Orchestrated'].map(verb => (
                          <button key={verb} type="button" className="ai-verb-chip" onClick={() => insertActionVerb(exp.id, verb)}>
                            + {verb}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* 5. Education Tab */}
          {activeTab === 'education' && (
            <div className="editor-section-card">
              <div className="editor-section-head">
                <h3 className="editor-section-title">Education</h3>
                <button
                  className="btn btn-primary btn-sm"
                  onClick={handleAddEducation}
                >
                  + Add Education
                </button>
              </div>

              {(!resume.education || resume.education.length === 0) ? (
                <div className="empty-section-state">
                  <div className="empty-section-icon">🎓</div>
                  <h4 className="empty-section-title">No Education Records Added</h4>
                  <p className="empty-section-desc">Add your university, degrees, graduation years, GPA, and relevant academic coursework.</p>
                  <button type="button" className="btn btn-primary btn-sm" onClick={handleAddEducation}>+ Add Education</button>
                </div>
              ) : (
                (resume.education || []).map((ed, idx) => (
                  <div key={ed.id} className="repeater-card">
                    <div className="repeater-top-actions">
                      <span style={{ fontWeight: 700, fontSize: '0.82rem' }}>#{idx + 1} {ed.degree || 'Degree'}</span>
                      <div className="flex items-center gap-xs">
                        <button type="button" className="btn btn-ghost btn-sm" disabled={idx === 0} title="Move up" onClick={() => {
                          const list = [...resume.education];
                          const temp = list[idx];
                          list[idx] = list[idx - 1];
                          list[idx - 1] = temp;
                          setResume({ ...resume, education: list });
                        }}>↑</button>
                        <button type="button" className="btn btn-ghost btn-sm" disabled={idx === resume.education.length - 1} title="Move down" onClick={() => {
                          const list = [...resume.education];
                          const temp = list[idx];
                          list[idx] = list[idx + 1];
                          list[idx + 1] = temp;
                          setResume({ ...resume, education: list });
                        }}>↓</button>
                        <button type="button" className="btn btn-outline btn-sm" disabled={isGenerating} onClick={() => handleSuggestCoursework(ed.id)}>
                          ✦ AI Coursework
                        </button>
                        <button type="button" className="btn btn-danger btn-sm" onClick={() => {
                          setResume({ ...resume, education: resume.education.filter(item => item.id !== ed.id) });
                        }}>✕</button>
                      </div>
                    </div>

                    <div className="editor-grid-2">
                      <div className="form-group">
                        <label className="form-label">Degree & Major</label>
                        <input
                          type="text"
                          className="form-input"
                          value={ed.degree || ''}
                          onChange={(e) => {
                            const updated = resume.education.map(item => item.id === ed.id ? { ...item, degree: e.target.value } : item);
                            setResume({ ...resume, education: updated });
                          }}
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">School / University</label>
                        <input
                          type="text"
                          className="form-input"
                          value={ed.school || ''}
                          onChange={(e) => {
                            const updated = resume.education.map(item => item.id === ed.id ? { ...item, school: e.target.value } : item);
                            setResume({ ...resume, education: updated });
                          }}
                        />
                      </div>
                    </div>

                    <div className="editor-grid-2">
                      <div className="form-group">
                        <label className="form-label">Graduation Year / Range</label>
                        <input
                          type="text"
                          className="form-input"
                          placeholder="2020 – 2024"
                          value={ed.endDate || ed.year || ''}
                          onChange={(e) => {
                            const updated = resume.education.map(item => item.id === ed.id ? { ...item, endDate: e.target.value } : item);
                            setResume({ ...resume, education: updated });
                          }}
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">GPA, Academic Honors & Key Coursework</label>
                        <input
                          type="text"
                          className="form-input"
                          placeholder="GPA: 3.88 / 4.0 | Dean's Academic Honors | Relevant Coursework..."
                          value={ed.gpa || ''}
                          onChange={(e) => {
                            const updated = resume.education.map(item => item.id === ed.id ? { ...item, gpa: e.target.value } : item);
                            setResume({ ...resume, education: updated });
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* 6. Skills Tab */}
          {activeTab === 'skills' && (
            <div className="editor-section-card">
              <div className="editor-section-head">
                <h3 className="editor-section-title">Skills & Tooling Taxonomy</h3>
                <div className="flex items-center gap-xs">
                  <button type="button" className="btn btn-outline btn-sm" disabled={isGenerating} onClick={handleCategorizeSkills}>
                    ✦ AI Categorize Taxonomy
                  </button>
                  <button type="button" className="btn btn-primary btn-sm" disabled={isGenerating} onClick={handleRecommendSkills}>
                    ✦ Recommend Skills Stack
                  </button>
                </div>
              </div>

              {(!resume.skills || !resume.skills.trim()) && (!resume.softSkills || !resume.softSkills.trim()) && (
                <div className="empty-section-prompt">
                  <span>💡</span>
                  <span>No skills entered yet. Click '✦ Recommend Skills Stack' or '✦ AI Categorize Taxonomy' to auto-populate high-demand tech skills.</span>
                </div>
              )}

              <div className="form-group">
                <label className="form-label">Technical Skills (Comma-separated or categorized)</label>
                <textarea
                  className="form-textarea"
                  rows="4"
                  value={resume.skills || ''}
                  onChange={(e) => updateField('skills', e.target.value)}
                  placeholder="TypeScript, React, Python, PostgreSQL, Docker, AWS, GraphQL, Redis..."
                />
              </div>

              <div className="form-group">
                <div className="flex justify-between items-center" style={{ marginBottom: '4px' }}>
                  <label className="form-label" style={{ margin: 0 }}>Soft Skills & Leadership Competencies</label>
                  <button type="button" className="btn btn-outline btn-sm" disabled={isGenerating} onClick={handleSuggestSoftSkills}>
                    ✦ AI Suggest Soft Skills
                  </button>
                </div>
                <textarea
                  className="form-textarea"
                  rows="3"
                  value={resume.softSkills || ''}
                  onChange={(e) => updateField('softSkills', e.target.value)}
                  placeholder="Cross-Functional Leadership, Agile & Scrum Delivery, Technical Mentorship, Clear Communication..."
                />
              </div>
            </div>
          )}

          {/* 7. Projects Tab */}
          {activeTab === 'projects' && (
            <div className="editor-section-card">
              <div className="editor-section-head">
                <h3 className="editor-section-title">Key Projects</h3>
                <button
                  className="btn btn-primary btn-sm"
                  onClick={handleAddProject}
                >
                  + Add Project
                </button>
              </div>

              {(!resume.projects || resume.projects.length === 0) ? (
                <div className="empty-section-state">
                  <div className="empty-section-icon">🚀</div>
                  <h4 className="empty-section-title">No Key Projects Added</h4>
                  <p className="empty-section-desc">Showcase your top open-source repositories, portfolio work, and full-stack applications with metrics.</p>
                  <button type="button" className="btn btn-primary btn-sm" onClick={handleAddProject}>+ Add First Project</button>
                </div>
              ) : (
                (resume.projects || []).map((p, idx) => (
                  <div key={p.id} className="repeater-card">
                    <div className="repeater-top-actions">
                      <span style={{ fontWeight: 700, fontSize: '0.82rem' }}>#{idx + 1} {p.title || 'Project'}</span>
                      <div className="flex items-center gap-xs">
                        <button type="button" className="btn btn-ghost btn-sm" disabled={idx === 0} title="Move up" onClick={() => {
                          const list = [...resume.projects];
                          const temp = list[idx];
                          list[idx] = list[idx - 1];
                          list[idx - 1] = temp;
                          setResume({ ...resume, projects: list });
                        }}>↑</button>
                        <button type="button" className="btn btn-ghost btn-sm" disabled={idx === resume.projects.length - 1} title="Move down" onClick={() => {
                          const list = [...resume.projects];
                          const temp = list[idx];
                          list[idx] = list[idx + 1];
                          list[idx + 1] = temp;
                          setResume({ ...resume, projects: list });
                        }}>↓</button>
                        <button type="button" className="btn btn-danger btn-sm" onClick={() => {
                          setResume({ ...resume, projects: resume.projects.filter(item => item.id !== p.id) });
                        }}>✕</button>
                      </div>
                    </div>

                    <div className="editor-grid-2">
                      <div className="form-group">
                        <label className="form-label">Project Title</label>
                        <input
                          type="text"
                          className="form-input"
                          placeholder="Distributed Cloud Platform"
                          value={p.title || ''}
                          onChange={(e) => {
                            const updated = resume.projects.map(item => item.id === p.id ? { ...item, title: e.target.value } : item);
                            setResume({ ...resume, projects: updated });
                          }}
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Tech Stack</label>
                        <input
                          type="text"
                          className="form-input"
                          placeholder="React, Node.js, Python, PostgreSQL"
                          value={p.tech || ''}
                          onChange={(e) => {
                            const updated = resume.projects.map(item => item.id === p.id ? { ...item, tech: e.target.value } : item);
                            setResume({ ...resume, projects: updated });
                          }}
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Project / Repository Link</label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="github.com/username/project"
                        value={p.link || ''}
                        onChange={(e) => {
                          const updated = resume.projects.map(item => item.id === p.id ? { ...item, link: e.target.value } : item);
                          setResume({ ...resume, projects: updated });
                        }}
                      />
                    </div>

                    <div className="form-group">
                      <div className="accomplishments-head-row">
                        <label className="form-label" style={{ margin: 0 }}>Project Bullets (Google XYZ Formula)</label>
                        <div className="accomplishments-btn-group">
                          <button type="button" className="btn btn-outline btn-sm" disabled={isGenerating} onClick={() => handleGenerateProjectBullets(p.id)}>
                            ✦ AI Bullets
                          </button>
                          <button type="button" className="btn btn-primary btn-sm" disabled={isGenerating} onClick={() => handleEnhanceBullets('proj', p.id)}>
                            ✦ XYZ Enhance
                          </button>
                        </div>
                      </div>
                      <textarea
                        className="form-textarea"
                        rows="3"
                        placeholder="• Engineered distributed system handling 10k+ requests/sec with sub-50ms latency..."
                        value={p.bullets || ''}
                        onChange={(e) => {
                          const updated = resume.projects.map(item => item.id === p.id ? { ...item, bullets: e.target.value } : item);
                          setResume({ ...resume, projects: updated });
                        }}
                      />
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* 8. More Sections & Order Controls */}
          {activeTab === 'more' && (
            <>
              {/* Certifications Editor Card */}
              <div className="editor-section-card" style={{ marginBottom: '1.25rem' }}>
                <div className="editor-section-head">
                  <h3 className="editor-section-title">Certifications & Credentials</h3>
                  <button type="button" className="btn btn-primary btn-sm" onClick={handleAddCertification}>
                    + Add Certification
                  </button>
                </div>
                {(!resume.certifications || resume.certifications.length === 0) ? (
                  <div className="empty-section-state">
                    <div className="empty-section-icon">📜</div>
                    <h4 className="empty-section-title">No Certifications Added</h4>
                    <p className="empty-section-desc">Add your professional licenses, cloud credentials, or industry certifications to showcase verified mastery.</p>
                    <button type="button" className="btn btn-primary btn-sm" onClick={handleAddCertification}>+ Add Certification</button>
                  </div>
                ) : (
                  (resume.certifications || []).map((cert, idx) => (
                    <div key={cert.id || `cert_${idx}`} className="repeater-card">
                      <div className="repeater-top-actions">
                        <span style={{ fontWeight: 700, fontSize: '0.82rem' }}>#{idx + 1} {cert.title || 'Certification'}</span>
                        <button type="button" className="btn btn-danger btn-sm" onClick={() => handleRemoveCertification(cert.id)}>✕</button>
                      </div>
                      <div className="editor-grid-2">
                        <div className="form-group">
                          <label className="form-label">Certification Title</label>
                          <input
                            type="text"
                            className="form-input"
                            placeholder="AWS Certified Solutions Architect"
                            value={cert.title || ''}
                            onChange={(e) => handleUpdateCertification(cert.id, 'title', e.target.value)}
                          />
                        </div>
                        <div className="form-group">
                          <label className="form-label">Issuing Organization</label>
                          <input
                            type="text"
                            className="form-input"
                            placeholder="Amazon Web Services / Coursera"
                            value={cert.issuer || ''}
                            onChange={(e) => handleUpdateCertification(cert.id, 'issuer', e.target.value)}
                          />
                        </div>
                      </div>
                      <div className="form-group">
                        <label className="form-label">Issue Year / Date</label>
                        <input
                          type="text"
                          className="form-input"
                          placeholder="2024"
                          value={cert.year || ''}
                          onChange={(e) => handleUpdateCertification(cert.id, 'year', e.target.value)}
                        />
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Natural Languages Editor Card */}
              <div className="editor-section-card" style={{ marginBottom: '1.25rem' }}>
                <div className="editor-section-head">
                  <h3 className="editor-section-title">Languages</h3>
                  <button type="button" className="btn btn-primary btn-sm" onClick={handleAddLanguage}>
                    + Add Language
                  </button>
                </div>
                {(!resume.languages || resume.languages.length === 0) ? (
                  <div className="empty-section-state">
                    <div className="empty-section-icon">🌐</div>
                    <h4 className="empty-section-title">No Languages Added</h4>
                    <p className="empty-section-desc">List the natural languages you speak and your proficiency level to stand out in global remote roles.</p>
                    <button type="button" className="btn btn-primary btn-sm" onClick={handleAddLanguage}>+ Add Language</button>
                  </div>
                ) : (
                  (resume.languages || []).map((lang, idx) => (
                    <div key={lang.id || `lang_${idx}`} className="repeater-card">
                      <div className="repeater-top-actions">
                        <span style={{ fontWeight: 700, fontSize: '0.82rem' }}>#{idx + 1} {lang.language || 'Language'}</span>
                        <button type="button" className="btn btn-danger btn-sm" onClick={() => handleRemoveLanguage(lang.id)}>✕</button>
                      </div>
                      <div className="editor-grid-2">
                        <div className="form-group">
                          <label className="form-label">Language</label>
                          <input
                            type="text"
                            className="form-input"
                            placeholder="English, Spanish, etc."
                            value={lang.language || ''}
                            onChange={(e) => handleUpdateLanguage(lang.id, 'language', e.target.value)}
                          />
                        </div>
                        <div className="form-group">
                          <label className="form-label">Proficiency</label>
                          <select
                            className="form-select"
                            value={lang.proficiency || 'Professional Working'}
                            onChange={(e) => handleUpdateLanguage(lang.id, 'proficiency', e.target.value)}
                          >
                            <option value="Native / Bilingual">Native / Bilingual</option>
                            <option value="Fluent">Fluent</option>
                            <option value="Professional Working">Professional Working</option>
                            <option value="Intermediate">Intermediate</option>
                            <option value="Elementary">Elementary</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Honors & Awards Editor Card */}
              <div className="editor-section-card" style={{ marginBottom: '1.25rem' }}>
                <div className="editor-section-head">
                  <h3 className="editor-section-title">Honors & Awards</h3>
                  <button type="button" className="btn btn-primary btn-sm" onClick={handleAddAward}>
                    + Add Award
                  </button>
                </div>
                {(!resume.awards || resume.awards.length === 0) ? (
                  <div className="empty-section-state">
                    <div className="empty-section-icon">🏆</div>
                    <h4 className="empty-section-title">No Honors & Awards Added</h4>
                    <p className="empty-section-desc">Highlight hackathon trophies, merit awards, fellowships, or company recognitions.</p>
                    <button type="button" className="btn btn-primary btn-sm" onClick={handleAddAward}>+ Add Award</button>
                  </div>
                ) : (
                  (resume.awards || []).map((awd, idx) => (
                    <div key={awd.id || `awd_${idx}`} className="repeater-card">
                      <div className="repeater-top-actions">
                        <span style={{ fontWeight: 700, fontSize: '0.82rem' }}>#{idx + 1} {awd.title || 'Honor / Award'}</span>
                        <button type="button" className="btn btn-danger btn-sm" onClick={() => handleRemoveAward(awd.id)}>✕</button>
                      </div>
                      <div className="editor-grid-2">
                        <div className="form-group">
                          <label className="form-label">Award / Recognition Title</label>
                          <input
                            type="text"
                            className="form-input"
                            placeholder="Outstanding Innovation Award"
                            value={awd.title || ''}
                            onChange={(e) => handleUpdateAward(awd.id, 'title', e.target.value)}
                          />
                        </div>
                        <div className="form-group">
                          <label className="form-label">Issuing Organization / Event</label>
                          <input
                            type="text"
                            className="form-input"
                            placeholder="Global Hackathon / Tech Enterprise"
                            value={awd.issuer || ''}
                            onChange={(e) => handleUpdateAward(awd.id, 'issuer', e.target.value)}
                          />
                        </div>
                      </div>
                      <div className="form-group">
                        <label className="form-label">Year</label>
                        <input
                          type="text"
                          className="form-input"
                          placeholder="2023"
                          value={awd.year || ''}
                          onChange={(e) => handleUpdateAward(awd.id, 'year', e.target.value)}
                        />
                      </div>
                      <div className="form-group" style={{ marginTop: '0.6rem' }}>
                        <div className="flex justify-between items-center" style={{ marginBottom: '0.35rem' }}>
                          <label className="form-label" style={{ marginBottom: 0 }}>Details & Accomplishment Description</label>
                          <button
                            type="button"
                            className="btn btn-outline btn-xs"
                            onClick={() => handleAIEnhanceAward(awd.id)}
                            title="Enhance award description using Groq AI"
                          >
                            ✦ AI Polish Details
                          </button>
                        </div>
                        <textarea
                          className="form-textarea"
                          rows={2}
                          placeholder="e.g. Awarded 1st place out of 250+ teams for architecting an AI triage tool with 99.8% precision..."
                          value={awd.description || ''}
                          onChange={(e) => handleUpdateAward(awd.id, 'description', e.target.value)}
                        />
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Sections Reordering & Visibility Card */}
              <div className="editor-section-card">
                <div className="editor-section-head">
                  <h3 className="editor-section-title">Sections Reordering & Visibility</h3>
                </div>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                  Toggle visibility (Eye icon) to show or hide any section from the preview without deleting entered data. Use arrows to change vertical order.
                </p>

                {(resume.sectionOrder || INITIAL_RESUME.sectionOrder || []).map((sec, idx, arr) => {
                  const isSecHidden = !!hidden[sec];
                  const headingLabel = headings[sec] || sec;
                  return (
                    <div key={sec} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.55rem 0.85rem', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '4px', marginBottom: '0.45rem' }}>
                      <div className="flex items-center gap-sm">
                        <button
                          type="button"
                          className={`btn-icon ${isSecHidden ? 'btn-ghost' : 'btn-secondary'}`}
                          title={isSecHidden ? 'Show Section' : 'Hide Section'}
                          onClick={() => toggleSectionHide(sec)}
                        >
                          {isSecHidden ? '👁‍🗨' : '👁'}
                        </button>
                        <span style={{ fontSize: '0.85rem', fontWeight: 600, opacity: isSecHidden ? 0.5 : 1 }}>
                          {headingLabel}
                        </span>
                      </div>

                      <div className="flex items-center gap-xs">
                        <button
                          type="button"
                          className="btn btn-ghost btn-sm"
                          disabled={idx === 0}
                          onClick={() => moveSection(idx, -1)}
                        >
                          ↑
                        </button>
                        <button
                          type="button"
                          className="btn btn-ghost btn-sm"
                          disabled={idx === arr.length - 1}
                          onClick={() => moveSection(idx, 1)}
                        >
                          ↓
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {/* 9. ATS Optimizer Tab */}
          {activeTab === 'ats' && (
            <div className="editor-section-card">
              <div className="editor-section-head">
                <h3 className="editor-section-title">ATS Job Description Keyword Matcher</h3>
                <div className="flex items-center gap-xs">
                  <button type="button" className="btn btn-outline btn-sm" onClick={handleAddAllMissingKeywords}>
                    ✦ Add All Missing to Skills
                  </button>
                  <button type="button" className="btn btn-primary btn-sm" disabled={isGenerating} onClick={handleTailorToJD}>
                    ✦ Tailor Resume with Groq
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Paste Target Job Description (JD)</label>
                <textarea
                  className="form-textarea"
                  rows="6"
                  value={jobDescription || ''}
                  onChange={(e) => setJobDescription && setJobDescription(e.target.value)}
                  placeholder="Paste target job requirements and responsibilities here to calculate keyword overlap in real time..."
                />
              </div>

              {(!jobDescription || !jobDescription.trim()) && (
                <div className="empty-section-prompt">
                  <span>💡</span>
                  <span>Paste target job requirements above to calculate real-time ATS match score and discover missing skills.</span>
                </div>
              )}

              {(jobDescription && jobDescription.trim()) && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.65rem' }}>
                    <span style={{ fontSize: '0.82rem', fontWeight: 700 }}>ATS Match Score: {atsAnalysis?.score ?? 92}%</span>
                    <span style={{ fontSize: '0.78rem', color: '#10b981' }}>{(atsAnalysis?.matched || []).length} Matched Keywords</span>
                  </div>

                  {(atsAnalysis?.missing || []).length > 0 && (
                    <div>
                      <div style={{ fontSize: '0.76rem', color: '#f59e0b', fontWeight: 600, marginBottom: '0.4rem' }}>
                        Missing Keywords (Click to 1-click add to skills):
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                        {(atsAnalysis?.missing || []).slice(0, 15).map(kw => (
                          <button
                            key={kw}
                            className="btn btn-outline btn-sm"
                            style={{ borderColor: 'rgba(245, 158, 11, 0.4)', color: '#f59e0b', fontSize: '0.75rem', padding: '0.15rem 0.5rem' }}
                            onClick={() => addMissingKeyword(kw)}
                          >
                            + {kw}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Right Live Preview Workspace */}
      <div className="preview-workspace">
        {/* Top Preview Toolbar */}
        <div className="preview-toolbar">
          <div className="preview-controls-group">
            {/* Template Dropdown */}
            <select
              className="form-select"
              style={{ width: 'auto', padding: '0.35rem 0.65rem', fontSize: '0.82rem' }}
              value={resume.template}
              onChange={(e) => {
                setResume({ ...resume, template: e.target.value });
                toast(`Switched to template!`, 'info');
              }}
            >
              {TEMPLATES_CATALOG.map(t => (
                <option key={t.id} value={t.id}>{t.name} ({t.category})</option>
              ))}
            </select>

            {/* Color Palette */}
            <select
              className="form-select"
              style={{ width: 'auto', padding: '0.35rem 0.65rem', fontSize: '0.82rem' }}
              value={resume.color || 'blue'}
              onChange={(e) => setResume({ ...resume, color: e.target.value })}
            >
              <option value="blue">Color: Royal Blue</option>
              <option value="emerald">Color: Emerald Green</option>
              <option value="purple">Color: Regal Purple</option>
              <option value="amber">Color: Warm Amber</option>
              <option value="rose">Color: Crimson Rose</option>
              <option value="slate">Color: Executive Slate</option>
              <option value="charcoal">Color: Pure Charcoal</option>
            </select>

            {/* Zoom Controls */}
            <select
              className="form-select"
              style={{ width: 'auto', padding: '0.35rem 0.65rem', fontSize: '0.82rem' }}
              value={zoom}
              onChange={(e) => setZoom(parseFloat(e.target.value))}
            >
              <option value="0.75">Zoom: 75%</option>
              <option value="0.85">Zoom: 85%</option>
              <option value="1.0">Zoom: 100%</option>
              <option value="1.15">Zoom: 115%</option>
            </select>
          </div>

          <div className="preview-controls-group">
            <button className="btn btn-outline btn-sm" onClick={() => window.print()}>
              🖨 Print
            </button>
            <button className="btn btn-primary btn-sm" disabled={isExporting} onClick={onExportPDF}>
              {isExporting ? 'Preparing...' : '📥 Download PDF'}
            </button>
          </div>
        </div>

        {/* Live A4 Sheet Representation */}
        <div className="preview-canvas-container">
          <div style={{ transform: `scale(${zoom})`, transformOrigin: 'top center' }}>
            <div id="react-resume-sheet" className={`a4-resume-sheet template-${resume.template}`}>
              <ResumeRenderer resume={resume} palette={palette} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// =========================================================
// COVER LETTER STUDIO VIEW
// =========================================================
function CoverLetterView({ resume, onNavigate, onExportPDF }) {
  const [company, setCompany] = useState('Stripe');
  const [role, setRole] = useState(resume.roleTitle || resume.title || 'Senior Software Engineer');
  const [content, setContent] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    setContent(
      `Dear Hiring Team at ${company},\n\n` +
      `I am writing to express my enthusiastic interest in the ${role} position. With over 5 years of experience architecting distributed cloud applications, responsive web interfaces, and high-concurrency APIs, I have consistently delivered mission-critical solutions that align directly with high engineering standards.\n\n` +
      `Throughout my career, I have specialized in cutting system latency by over 40%, scaling operational throughput to support 100k+ concurrent sessions, and mentoring cross-functional engineering teams. My background in ${resume.skills ? resume.skills.split(',').slice(0, 5).join(', ') : 'modern full-stack technologies'} has equipped me with both the architectural depth and product acumen needed to make an immediate impact on your technical roadmap.\n\n` +
      `I welcome the opportunity to discuss how my technical leadership and problem-solving mindset can contribute to ${company}'s ongoing success. Thank you for your time, consideration, and leadership.\n\n` +
      `Sincerely,\n${resume.name || 'Candidate'}`
    );
  }, [company, role, resume.name]);

  const handleGenerateCoverLetter = async () => {
    if (!company.trim()) {
      toast('Please enter a target company to generate your cover letter.', 'error');
      return;
    }
    if (!role.trim()) {
      toast('Please enter a target role to generate your cover letter.', 'error');
      return;
    }

    setIsGenerating(true);
    toast('Crafting tailored cover letter with Groq AI...', 'info');

    const expHighlight = (resume.experiences && resume.experiences.length > 0)
      ? `${resume.experiences[0].role} at ${resume.experiences[0].company}`
      : 'leading full-stack software development initiatives';

    try {
      const apiBase = getApiBase();
      const response = await fetch(`${apiBase}/api/ai/cover-letter`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          company: company.trim(),
          role: role.trim(),
          candidate_name: resume.name || 'Candidate',
          skills: resume.skills || 'Full Stack Software Engineering',
          experience_highlight: expHighlight
        })
      });

      const data = await response.json().catch(() => null);

      if (response.ok && data && data.success && data.cover_letter) {
        setContent(data.cover_letter);
        toast(`Cover letter generated with ${data.engine || 'Groq AI'}!`, 'success');
      } else {
        const errorMsg = data?.error || 'AI generation failed. Please ensure GROQ_API_KEY is configured on the server.';
        toast(errorMsg, 'error');
      }
    } catch (err) {
      const serverUrl = getApiBase() || 'http://localhost:5000';
      toast(`Could not connect to AI backend service. Please ensure the Python backend is running on ${serverUrl}`, 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="dashboard-view cover-letter-studio-view" style={{ maxWidth: '1100px' }}>
      <div className="dash-panel-header cover-letter-screen-only">
        <h2 className="dash-panel-title">
          <span>✍️</span> Executive Cover Letter Studio
        </h2>
        <button className="btn btn-outline btn-sm" onClick={() => onNavigate('dashboard')}>
          ← Back to Dashboard
        </button>
      </div>

      <div className="cover-letter-studio-grid">
        {/* Editor Form */}
        <div className="dash-panel cover-letter-editor-panel">
          <div className="form-group">
            <label className="form-label">Target Company</label>
            <input
              type="text"
              className="form-input"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Target Role</label>
            <input
              type="text"
              className="form-input"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            />
          </div>

          <button
            className="btn btn-primary"
            style={{ width: '100%', marginBottom: '1.25rem' }}
            disabled={isGenerating}
            onClick={handleGenerateCoverLetter}
          >
            {isGenerating ? "⏳ Generating Cover Letter..." : "✦ Generate Letter with Groq AI"}
          </button>

          <div className="form-group">
            <label className="form-label">Letter Content (Editable)</label>
            <textarea
              className="form-textarea"
              rows="12"
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
          </div>
        </div>

        {/* Live Printable Letter Preview */}
        <div className="cover-letter-preview-col">
          <div className="cover-letter-toolbar" style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '0.85rem', gap: '0.5rem' }}>
            <button className="btn btn-secondary btn-sm" onClick={() => window.print()}>
              🖨 Print Cover Letter
            </button>
            <button className="btn btn-primary btn-sm" onClick={() => onExportPDF ? onExportPDF('cover-letter') : window.print()}>
              📥 Download PDF
            </button>
          </div>

          <div id="cover-letter-sheet" className="cover-letter-sheet">
            {content}
          </div>
        </div>
      </div>
    </div>
  );
}

// =========================================================
// SETTINGS & AI REVIEW MODALS
// =========================================================
function SettingsModal({ onClose, backendHealth: initialHealth, refreshBackendHealth }) {
  const [model, setModel] = useState(() => localStorage.getItem('groq_selected_model') || localStorage.getItem('smart_resume_groq_model') || GROQ_DEFAULT_MODEL);
  const [apiUrl, setApiUrl] = useState(() => localStorage.getItem('smart_resume_api_base') || DEFAULT_BACKEND_URL);
  const [healthStatus, setHealthStatus] = useState(initialHealth || { loading: true, reachable: false, groqConfigured: false, keyStatus: 'Checking...' });
  const [testResult, setTestResult] = useState(null);
  const [isChecking, setIsChecking] = useState(false);
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [isSavingKey, setIsSavingKey] = useState(false);

  const performHealthCheck = async (urlToCheck = null) => {
    setIsChecking(true);
    const targetUrl = urlToCheck !== null ? urlToCheck : (apiUrl || DEFAULT_BACKEND_URL);
    const result = await checkBackendHealth(targetUrl);
    setHealthStatus({
      loading: false,
      reachable: result.reachable,
      groqConfigured: result.groqConfigured,
      keyStatus: result.keyStatus || 'Not Configured',
      port: result.port || 5000,
      database: result.database || 'connected',
      provider: result.provider || 'Groq Cloud AI (Llama 3.3 70B)',
      latencyMs: result.latencyMs,
      error: result.error
    });
    setIsChecking(false);
    if (refreshBackendHealth) refreshBackendHealth();
  };

  // Security cleanup: Purge any legacy client-side API keys from browser storage
  useEffect(() => {
    try {
      localStorage.removeItem('groq_api_key');
      localStorage.removeItem('smart_resume_groq_key');
    } catch (_) {}

    performHealthCheck();
  }, []);

  const handleSaveApiKey = async () => {
    if (!apiKeyInput.trim()) {
      toast('Please enter a valid API key', 'error');
      return;
    }
    setIsSavingKey(true);
    const currentBase = apiUrl || getApiBase();
    try {
      const res = await fetch(`${currentBase}/api/ai/configure-key`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: apiKeyInput.trim() })
      });
      const data = await res.json().catch(() => null);
      if (res.ok && data && data.success) {
        toast(data.message || 'API key saved to server successfully!', 'success');
        setApiKeyInput('');
        performHealthCheck(currentBase);
      } else {
        toast(data?.error || 'Failed to save API key to server.', 'error');
      }
    } catch (err) {
      toast(`Could not connect to ${currentBase} to save key.`, 'error');
    }
    setIsSavingKey(false);
  };

  const handleSaveUrl = () => {
    setApiBase(apiUrl);
    toast(`Backend API URL updated to: ${getApiBase()}`, 'success');
    performHealthCheck(apiUrl);
  };

  const handleResetUrl = () => {
    setApiUrl(DEFAULT_BACKEND_URL);
    setApiBase(DEFAULT_BACKEND_URL);
    toast(`Backend API URL reset to default: ${DEFAULT_BACKEND_URL}`, 'info');
    performHealthCheck(DEFAULT_BACKEND_URL);
  };

  const handleSave = () => {
    setApiBase(apiUrl);
    localStorage.setItem('groq_selected_model', model);
    localStorage.setItem('smart_resume_groq_model', model);
    toast('Settings saved successfully!', 'success');
    if (refreshBackendHealth) refreshBackendHealth();
    onClose();
  };

  const handleTestConnection = async () => {
    setTestResult({ testing: true, msg: 'Testing backend Groq AI connection...' });

    const currentBase = apiUrl || getApiBase();
    try {
      const res = await fetch(`${currentBase}/api/groq-chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: 'Respond with "Groq AI connected successfully" in 5 words.',
          model: model
        })
      });

      const data = await res.json().catch(() => null);

      if (res.ok && data && data.success) {
        setTestResult({
          success: true,
          msg: `✓ ${data.engine || 'Groq AI'} connected successfully!`
        });
      } else {
        const errorMsg = data?.error || 'GROQ_API_KEY is not configured on the server.';
        setTestResult({
          success: false,
          msg: `⚠️ ${errorMsg}`
        });
      }
    } catch (err) {
      setTestResult({
        success: false,
        msg: `⚠️ Could not reach server at ${currentBase}. Please ensure 'python backend/app.py' is running on port 5000.`
      });
    }
  };

  const isHealthy = healthStatus.status === 'healthy';
  const isUnhealthy = healthStatus.status === 'unhealthy';
  const isUnreachable = !healthStatus.loading && (healthStatus.status === 'unreachable' || (!healthStatus.reachable && !isUnhealthy));
  const isKeyMissing = isHealthy && !healthStatus.groqConfigured;
  const isReady = isHealthy && healthStatus.groqConfigured;

  const badgeLabel = (isChecking || healthStatus.loading)
    ? 'Checking...'
    : isReady
      ? '🟢 Healthy & Online'
      : isKeyMissing
        ? '⚠️ Online (Key Missing)'
        : isUnhealthy
          ? '⚠️ Backend Unhealthy'
          : '🔴 Server Unreachable';

  const badgeBg = isReady
    ? 'rgba(16, 185, 129, 0.15)'
    : (isKeyMissing || isUnhealthy)
      ? 'rgba(245, 158, 11, 0.15)'
      : 'rgba(244, 63, 94, 0.15)';

  const badgeColor = isReady
    ? '#10b981'
    : (isKeyMissing || isUnhealthy)
      ? '#f59e0b'
      : '#f43f5e';

  let descriptionText = '';
  if (isReady) {
    descriptionText = `Backend running on port ${healthStatus.port} (${healthStatus.latencyMs}ms). Groq AI active (${healthStatus.keyStatus}). Database: ${healthStatus.database}.`;
  } else if (isKeyMissing) {
    descriptionText = `Backend is reachable on port ${healthStatus.port} (${healthStatus.latencyMs}ms), but GROQ_API_KEY is not configured in .env. AI generation requires GROQ_API_KEY.`;
  } else if (isUnhealthy) {
    descriptionText = `Backend Unhealthy: Server was reached at ${healthStatus.baseUrl || apiUrl}, but reported issues: ${healthStatus.error || 'Server error'}. Check backend console logs.`;
  } else {
    descriptionText = `Server Unreachable: Cannot connect to ${healthStatus.baseUrl || apiUrl}. The backend server is not running or the address is incorrect. Run 'python backend/app.py' from the project root to start it.`;
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" style={{ maxWidth: '580px' }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">✦ AI & Backend Configuration</h3>
          <button className="btn-icon" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
            Powered by Groq's high-speed LPU Inference Engine. All AI requests execute securely via your local Python Flask backend.
          </p>

          <div style={{
            padding: '0.9rem 1rem',
            background: 'rgba(255, 255, 255, 0.03)',
            border: `1px solid ${isReady ? 'rgba(16, 185, 129, 0.3)' : (isKeyMissing || isUnhealthy) ? 'rgba(245, 158, 11, 0.3)' : 'rgba(244, 63, 94, 0.3)'}`,
            borderRadius: '8px',
            marginBottom: '1.25rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
              <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)' }}>Backend Health Status</span>
              <span style={{
                fontSize: '0.75rem',
                fontWeight: 600,
                padding: '2px 8px',
                borderRadius: '4px',
                background: badgeBg,
                color: badgeColor
              }}>
                {badgeLabel}
              </span>
            </div>
            <p style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', margin: '0 0 0.5rem 0', lineHeight: 1.5 }}>
              {descriptionText}
            </p>
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
              <button
                className="btn btn-secondary btn-sm"
                style={{ fontSize: '0.75rem', padding: '0.25rem 0.65rem' }}
                disabled={isChecking}
                onClick={() => performHealthCheck()}
              >
                {isChecking ? "Checking Health..." : "🔄 Test Health Check"}
              </button>
            </div>
          </div>

          {isUnreachable && (
            <div style={{
              padding: '0.85rem 1rem',
              background: 'rgba(244, 63, 94, 0.05)',
              border: '1px solid rgba(244, 63, 94, 0.25)',
              borderRadius: '6px',
              marginBottom: '1.25rem',
              fontSize: '0.78rem'
            }}>
              <div style={{ fontWeight: 600, color: '#f43f5e', marginBottom: '0.4rem' }}>
                🔴 Server Unreachable — Startup Instructions
              </div>
              <ol style={{ margin: '0 0 0.4rem 1.2rem', padding: 0, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                <li>Open your terminal in the project directory: <code style={{ background: 'rgba(0,0,0,0.3)', padding: '1px 4px', borderRadius: '3px' }}>cd smart-resume-ai</code></li>
                <li>Start the Python Flask server: <code style={{ background: 'rgba(0,0,0,0.3)', padding: '1px 4px', borderRadius: '3px' }}>python backend/app.py</code></li>
                <li>Verify the server output: <code style={{ background: 'rgba(0,0,0,0.3)', padding: '1px 4px', borderRadius: '3px' }}>Starting Smart Resume AI Server on http://localhost:5000</code></li>
                <li>Click "Test Health Check" above once running.</li>
              </ol>
            </div>
          )}

          {isUnhealthy && (
            <div style={{
              padding: '0.85rem 1rem',
              background: 'rgba(245, 158, 11, 0.05)',
              border: '1px solid rgba(245, 158, 11, 0.25)',
              borderRadius: '6px',
              marginBottom: '1.25rem',
              fontSize: '0.78rem'
            }}>
              <div style={{ fontWeight: 600, color: '#f59e0b', marginBottom: '0.4rem' }}>
                ⚠️ Backend Diagnostics & Action Required
              </div>
              <p style={{ margin: '0 0 0.4rem 0', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                {healthStatus.error || "The server responded with an error status. Check backend terminal logs for tracebacks."}
              </p>
            </div>
          )}

          {isKeyMissing && (
            <div style={{
              padding: '0.85rem 1rem',
              background: 'rgba(245, 158, 11, 0.05)',
              border: '1px solid rgba(245, 158, 11, 0.25)',
              borderRadius: '6px',
              marginBottom: '1.25rem',
              fontSize: '0.78rem'
            }}>
              <div style={{ fontWeight: 600, color: 'var(--accent-amber)', marginBottom: '0.4rem' }}>
                🔑 Groq AI API Key Setup Required
              </div>
              <ol style={{ margin: '0 0 0.4rem 1.2rem', padding: 0, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                <li>Copy <code>.env.example</code> to <code>.env</code> in the project root: <code style={{ background: 'rgba(0,0,0,0.3)', padding: '1px 4px', borderRadius: '3px' }}>copy .env.example .env</code></li>
                <li>Get a free API key from <a href="https://console.groq.com/keys" target="_blank" rel="noreferrer" style={{ color: 'var(--accent-blue)', textDecoration: 'underline' }}>console.groq.com/keys</a></li>
                <li>In <code>.env</code>, set: <code style={{ background: 'rgba(0,0,0,0.3)', padding: '1px 4px', borderRadius: '3px' }}>GROQ_API_KEY=gsk_your_key_here</code></li>
                <li>Click "Test Health Check" above to reload configuration.</li>
              </ol>
            </div>
          )}

          <div className="form-group" style={{
            padding: '0.85rem 1rem',
            background: 'rgba(255, 255, 255, 0.02)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '8px',
            marginBottom: '1rem'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
              <label className="form-label" style={{ margin: 0, fontWeight: 600 }}>✦ Configure Grok / Groq API Key</label>
              <span style={{
                fontSize: '0.72rem',
                fontWeight: 600,
                padding: '2px 8px',
                borderRadius: '4px',
                background: healthStatus.groqConfigured ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                color: healthStatus.groqConfigured ? '#10b981' : '#f59e0b'
              }}>
                {healthStatus.keyStatus || 'Not Configured'}
              </span>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input
                type="password"
                className="form-input"
                value={apiKeyInput}
                onChange={(e) => setApiKeyInput(e.target.value)}
                placeholder="Paste key (starts with gsk_ or xai-...)"
              />
              <button
                className="btn btn-primary btn-sm"
                disabled={isSavingKey || !apiKeyInput.trim()}
                onClick={handleSaveApiKey}
              >
                {isSavingKey ? 'Saving...' : 'Save Key'}
              </button>
            </div>
            <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.35rem', marginBottom: 0 }}>
              Saved securely to server's .env file. Never exposed in browser storage. Free Groq key: <a href="https://console.groq.com/keys" target="_blank" rel="noreferrer" style={{ color: 'var(--accent-blue)', textDecoration: 'underline' }}>console.groq.com/keys</a> • xAI Grok: <a href="https://console.x.ai/" target="_blank" rel="noreferrer" style={{ color: 'var(--accent-blue)', textDecoration: 'underline' }}>console.x.ai</a>
            </p>
          </div>

          <div className="form-group">
            <label className="form-label">Backend API Base URL</label>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input
                type="text"
                className="form-input"
                value={apiUrl}
                onChange={(e) => setApiUrl(e.target.value)}
                placeholder="http://localhost:5000"
              />
              <button className="btn btn-secondary btn-sm" onClick={handleSaveUrl}>Save</button>
              <button className="btn btn-ghost btn-sm" onClick={handleResetUrl}>Reset</button>
            </div>
            <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.25rem', marginBottom: 0 }}>
              Default: http://localhost:5000. Configures the single source of truth for all API calls.
            </p>
          </div>

          <div className="form-group">
            <label className="form-label">Selected Model</label>
            <select
              className="form-select"
              value={model}
              onChange={(e) => setModel(e.target.value)}
            >
              <option value="llama-3.3-70b-versatile">Llama 3.3 70B Versatile (Groq • Recommended)</option>
              <option value="llama-3.1-8b-instant">Llama 3.1 8B Instant (Groq • Ultra Fast)</option>
              <option value="mixtral-8x7b-32768">Mixtral 8x7B (Groq • MoE 32k Context)</option>
              <option value="grok-beta">Grok Beta (xAI)</option>
              <option value="grok-2-latest">Grok 2 Latest (xAI)</option>
            </select>
          </div>

          <div style={{ marginTop: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <button className="btn btn-secondary btn-sm" onClick={handleTestConnection}>
                Test Backend Groq AI Generation
              </button>
            </div>
            {testResult && (
              <div style={{
                fontSize: '0.8rem',
                color: testResult.success ? '#10b981' : '#f59e0b',
                fontWeight: 500,
                padding: '0.5rem 0.75rem',
                background: 'rgba(0,0,0,0.2)',
                borderRadius: '4px',
                borderLeft: `3px solid ${testResult.success ? '#10b981' : '#f59e0b'}`
              }}>
                {testResult.msg}
              </div>
            )}
          </div>

          <p style={{ fontSize: '0.73rem', color: 'var(--text-muted)', marginTop: '1.25rem', marginBottom: 0, lineHeight: 1.4 }}>
            🔒 Security Architecture: To protect your credentials, API keys are never stored in the browser or exposed in frontend code. Set GROQ_API_KEY in .env on the server.
          </p>
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>Close</button>
          <button className="btn btn-primary" onClick={handleSave}>Save Preferences</button>
        </div>
      </div>
    </div>
  );
}

function ReviewModal({ reviewData, onClose }) {
  if (!reviewData) return null;
  const [editText, setEditText] = useState(reviewData.aiText || '');

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" style={{ maxWidth: '680px' }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h3 className="modal-title">Human-in-the-Loop AI Review</h3>
            <span style={{ fontSize: '0.78rem', color: 'var(--accent-blue)', fontWeight: 600 }}>
              Generated via {reviewData.badge}
            </span>
          </div>
          <button className="btn-icon" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '0.85rem' }}>
            Review, edit, or customize the AI suggestion below before applying it directly to your resume.
          </p>

          <div className="form-group">
            <textarea
              className="form-textarea"
              rows="8"
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
            />
          </div>
        </div>
        <div className="modal-footer">
          {reviewData.onRegenerate && (
            <button className="btn btn-secondary" onClick={reviewData.onRegenerate}>
              🔄 Regenerate
            </button>
          )}
          <button className="btn btn-ghost" onClick={onClose}>
            Discard
          </button>
          <button
            className="btn btn-primary"
            onClick={() => {
              reviewData.onAccept(editText);
              onClose();
            }}
          >
            ✓ Apply to Resume
          </button>
        </div>
      </div>
    </div>
  );
}

// =========================================================
// CINEMATIC AUTHENTICATION VIEW (LOGIN & REGISTER)
// =========================================================
function AuthView({ onLoginSuccess }) {
  const [authMode, setAuthMode] = useState('login'); // 'login' | 'register' | 'verify'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [pendingUser, setPendingUser] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [infoMessage, setInfoMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const isValidEmail = (str) => {
    return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(str);
  };

  // 1. Strict Login Submission
  const handleLoginSubmit = async (e) => {
    if (e) e.preventDefault();
    setErrorMessage('');
    setInfoMessage('');
    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();

    if (!cleanEmail || !isValidEmail(cleanEmail)) {
      setErrorMessage('Please enter a valid email address with a proper domain (e.g. name@domain.com).');
      return;
    }
    if (cleanPassword.length < 6) {
      setErrorMessage('Password must be at least 6 characters.');
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch(`${getApiBase()}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail, password: cleanPassword })
      });
      const data = await res.json().catch(() => null);
      if (res.ok && data && data.success && data.user) {
        setIsLoading(false);
        onLoginSuccess({
          ...data.user,
          token: data.token || 'session_' + Date.now()
        });
        return;
      }
      if (res.status === 404 || (data && data.error && data.error.includes('not found'))) {
        setErrorMessage('No registered account found with this email. You must register and verify your email first before logging in.');
        setIsLoading(false);
        return;
      }
      if (res.status === 401 || (data && data.error && data.error.includes('password'))) {
        setErrorMessage('Invalid password. Please check your credentials and try again.');
        setIsLoading(false);
        return;
      }
      if (res.status === 403 || (data && data.requires_verification)) {
        setErrorMessage('This account is not verified yet. Please register or complete email verification.');
        setIsLoading(false);
        return;
      }
    } catch (err) { }

    let registeredUsers = [];
    try {
      registeredUsers = JSON.parse(localStorage.getItem('smart_resume_registered_users') || '[]');
    } catch (e) { }

    const match = registeredUsers.find(u => u.email.toLowerCase() === cleanEmail);

    if (!match) {
      setErrorMessage('No registered account found with this email. You must register and verify your email first before logging in.');
      setIsLoading(false);
      return;
    }

    if (match.password !== cleanPassword) {
      setErrorMessage('Invalid password. Please check your credentials and try again.');
      setIsLoading(false);
      return;
    }

    if (match.isVerified === false) {
      setErrorMessage('This account is not verified yet. Please register and complete email verification.');
      setIsLoading(false);
      return;
    }

    setIsLoading(false);
    onLoginSuccess(match);
  };

  // 2. Register Submission (Initiate Mandatory Email Verification)
  const handleRegisterSubmit = async (e) => {
    if (e) e.preventDefault();
    setErrorMessage('');
    setInfoMessage('');
    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();
    const cleanName = name.trim();

    if (!cleanName) {
      setErrorMessage('Please enter your full name.');
      return;
    }
    if (!cleanEmail || !isValidEmail(cleanEmail)) {
      setErrorMessage('Please enter a valid email address with a real domain (e.g. name@domain.com).');
      return;
    }
    if (cleanPassword.length < 6) {
      setErrorMessage('Password must be at least 6 characters.');
      return;
    }

    let registeredUsers = [];
    try {
      registeredUsers = JSON.parse(localStorage.getItem('smart_resume_registered_users') || '[]');
    } catch (e) {}

    if (registeredUsers.some(u => u.email.toLowerCase() === cleanEmail && u.isVerified !== false)) {
      setErrorMessage('An account with this email already exists. Please sign in instead.');
      return;
    }

    setIsLoading(true);

    // Dispatch verification code via authoritative server-side endpoint
    try {
      const res = await authApiFetch('/api/auth/send-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail, name: cleanName, password: cleanPassword })
      });
      const data = await res.json().catch(() => null);
      if (res.ok && data && data.success) {
        setPendingUser({
          email: cleanEmail,
          name: cleanName,
          password: cleanPassword,
          createdAt: Date.now()
        });
        setIsLoading(false);
        setAuthMode('verify');
        setInfoMessage(`A 6-digit confirmation code has been dispatched to ${cleanEmail}. Please check your inbox.`);
        return;
      } else {
        setErrorMessage(data?.error || 'Failed to dispatch verification email. Please check your address or server settings.');
        setIsLoading(false);
        return;
      }
    } catch (err) {
      const serverUrl = getApiBase() || 'http://localhost:5000';
      setErrorMessage(`Could not connect to authentication server at ${serverUrl}. Please ensure the backend server is running ('python backend/app.py').`);
      setIsLoading(false);
      return;
    }
  };

  // 3. Verification Code Submission (Authoritative Server Verification)
  const handleVerifySubmit = async (e) => {
    if (e) e.preventDefault();
    setErrorMessage('');
    const enteredCode = verificationCode.trim();

    if (!enteredCode || enteredCode.length !== 6) {
      setErrorMessage('Please enter the complete 6-digit verification code.');
      return;
    }

    if (!pendingUser) {
      setErrorMessage('Session expired. Please restart the registration process.');
      setAuthMode('register');
      return;
    }

    setIsLoading(true);

    try {
      const res = await authApiFetch('/api/auth/verify-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: pendingUser.email,
          code: enteredCode,
          name: pendingUser.name,
          password: pendingUser.password
        })
      });
      const data = await res.json().catch(() => null);
      if (res.ok && data && data.success && data.user) {
        let registeredUsers = [];
        try {
          registeredUsers = JSON.parse(localStorage.getItem('smart_resume_registered_users') || '[]');
        } catch (e) {}
        const newUser = {
          id: data.user.id || `user_${Date.now()}`,
          email: pendingUser.email,
          name: pendingUser.name,
          role: 'Candidate',
          isVerified: true
        };
        const filtered = registeredUsers.filter(u => u.email.toLowerCase() !== pendingUser.email);
        filtered.push(newUser);
        localStorage.setItem('smart_resume_registered_users', JSON.stringify(filtered));

        setIsLoading(false);
        toast('Email verified successfully! Welcome to Smart Resume AI.', 'success');
        onLoginSuccess({
          ...newUser,
          token: data.token || 'session_' + Date.now()
        });
        return;
      } else {
        setErrorMessage(data?.error || 'Invalid verification code. Please check and try again.');
        setIsLoading(false);
        return;
      }
    } catch (err) {
      const serverUrl = getApiBase() || 'http://localhost:5000';
      setErrorMessage(`Could not connect to authentication server at ${serverUrl}. Please check your connection.`);
      setIsLoading(false);
      return;
    }
  };

  const handleResendCode = async () => {
    if (!pendingUser) return;
    setIsLoading(true);
    setErrorMessage('');
    try {
      const res = await authApiFetch('/api/auth/send-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: pendingUser.email, name: pendingUser.name, password: pendingUser.password })
      });
      const data = await res.json().catch(() => null);
      if (res.ok && data && data.success) {
        setInfoMessage(`A new 6-digit verification code has been dispatched to ${pendingUser.email}.`);
      } else {
        setErrorMessage(data?.error || 'Failed to resend verification code. Please try again later.');
      }
    } catch (err) {
      const serverUrl = getApiBase() || 'http://localhost:5000';
      setErrorMessage(`Could not reach authentication server at ${serverUrl} to resend code.`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header" style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.25rem' }}>
            <BrandLogo size="lg" />
          </div>
          <p className="auth-subtitle">
            {authMode === 'verify'
              ? 'Enter the 6-digit confirmation code to activate your account'
              : authMode === 'register'
                ? 'Create your account to start building vector-grade resumes'
                : 'Sign in to access your resumes, templates & Groq AI studio'}
          </p>
        </div>

        {errorMessage && (
          <div className="auth-error-alert">⚠️ {errorMessage}</div>
        )}
        {infoMessage && (
          <div className="auth-info-alert">ℹ️ {infoMessage}</div>
        )}

        {authMode === 'verify' ? (
          <form onSubmit={handleVerifySubmit} className="auth-form">
            <div className="verification-email-badge">
              {pendingUser ? pendingUser.email : email}
            </div>
            <div className="verification-notice">
              We have dispatched a 6-digit confirmation code to your email address. Please check your inbox and enter the code below to activate your account.
            </div>

            <div className="form-group" style={{ marginTop: '1rem' }}>
              <label className="form-label" style={{ textAlign: 'center', display: 'block' }}>
                Enter 6-Digit Verification Code
              </label>
              <input
                type="text"
                maxLength="6"
                className="form-input verification-code-input"
                placeholder="• • • • • •"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                autoFocus
                required
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary auth-submit-btn"
              disabled={isLoading}
            >
              {isLoading ? 'Activating Account...' : 'Verify & Activate Account'}
            </button>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem', fontSize: '0.8rem' }}>
              <button
                type="button"
                onClick={handleResendCode}
                style={{ background: 'none', border: 'none', color: 'var(--accent-amber)', cursor: 'pointer', textDecoration: 'underline' }}
              >
                Resend Code
              </button>
              <button
                type="button"
                onClick={() => {
                  setAuthMode('register');
                  setErrorMessage('');
                  setInfoMessage('');
                }}
                style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
              >
                ← Back to Register
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={authMode === 'register' ? handleRegisterSubmit : handleLoginSubmit} className="auth-form">
            {authMode === 'register' && (
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Aditya Patel"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                type="email"
                className="form-input"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <div className="flex justify-between items-center">
                <label className="form-label">Password</label>
                <button
                  type="button"
                  className="auth-toggle-pwd"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                className="form-input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary auth-submit-btn"
              disabled={isLoading}
            >
              {isLoading ? 'Processing...' : (authMode === 'register' ? 'Continue & Verify Email →' : 'Sign In to Workspace')}
            </button>

            {authMode !== 'verify' && (
              <div className="auth-switch">
                <span>{authMode === 'register' ? 'Already have an account? ' : "Don't have an account yet? "}</span>
                <button
                  type="button"
                  className="auth-link-btn"
                  onClick={() => {
                    setAuthMode(authMode === 'register' ? 'login' : 'register');
                    setErrorMessage('');
                    setInfoMessage('');
                  }}
                >
                  {authMode === 'register' ? 'Sign In' : 'Register Here'}
                </button>
              </div>
            )}
          </form>
        )}
      </div>
    </div>
  );
}

// User Profile & Scoped Resumes Helpers
function getStarterResumeForUser(user) {
  const username = (user && user.name && user.name.trim()) ? user.name.trim() : 'Candidate';
  const useremail = (user && user.email && user.email.trim()) ? user.email.trim() : 'candidate@devstudio.io';
  const slug = username.toLowerCase().replace(/[^a-z0-9]/g, '-');
  return {
    ...INITIAL_RESUME,
    id: `resume_${Date.now()}`,
    title: `${username}'s Resume`,
    name: username,
    email: useremail,
    links: `github.com/${slug} | linkedin.com/in/${slug}`
  };
}

function loadUserResumes(user) {
  if (!user) return [INITIAL_RESUME];
  const userKey = `smart_resume_resumes_u_${encodeURIComponent(user.email || user.id || 'default')}`;
  try {
    const raw = localStorage.getItem(userKey);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map(r => {
          if (!r.name || r.name === 'Alex Morgan' || r.name.toLowerCase() === 'alex morgan') {
            return {
              ...r,
              name: user.name || 'Candidate',
              email: user.email || r.email,
              title: (!r.title || r.title.includes('Alex Morgan')) ? `${user.name || 'My'}'s Resume` : r.title
            };
          }
          return r;
        });
      }
    }
  } catch (e) { }

  const starter = getStarterResumeForUser(user);
  try {
    localStorage.setItem(userKey, JSON.stringify([starter]));
  } catch (e) { }
  return [starter];
}

function saveUserResumes(user, resumesList) {
  if (!user) return;
  const userKey = `smart_resume_resumes_u_${encodeURIComponent(user.email || user.id || 'default')}`;
  try {
    localStorage.setItem(userKey, JSON.stringify(resumesList));
  } catch (e) { }
}

// =========================================================
// MASTER ROOT APPLICATION COMPONENT
// =========================================================
function App() {
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const raw = localStorage.getItem('smart_resume_auth_user');
      if (raw) return JSON.parse(raw);
    } catch (e) { }
    return null;
  });

  const handleLoginSuccess = (user) => {
    setCurrentUser(user);
    try {
      localStorage.setItem('smart_resume_auth_user', JSON.stringify(user));
    } catch (e) { }
    const userResumes = loadUserResumes(user);
    setResumes(userResumes);
    setActiveResumeId(userResumes[0]?.id || INITIAL_RESUME.id);
    toast(`Welcome back, ${user.name}! Workspace ready.`, 'success');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    try {
      localStorage.removeItem('smart_resume_auth_user');
    } catch (e) { }
    toast('Logged out successfully.', 'info');
  };

  const [currentView, setCurrentView] = useState(() => {
    const hash = window.location.hash.replace('#', '').toLowerCase();
    const path = window.location.pathname.toLowerCase();
    if (hash === 'studio' || path.includes('builder')) return 'studio';
    if (hash === 'templates' || path.includes('templates')) return 'templates';
    if (hash === 'cover-letter') return 'cover-letter';
    return 'dashboard';
  });

  const [theme, setTheme] = useState(() => localStorage.getItem('smart_resume_theme') || 'dark');
  const [jobDescription, setJobDescription] = useState('');
  const [isExporting, setIsExporting] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [reviewModalData, setReviewModalData] = useState(null);
  const [backendHealth, setBackendHealth] = useState({
    checked: false,
    reachable: false,
    groqConfigured: false,
    keyStatus: 'Checking...',
    port: 5000,
    database: 'connected',
    error: null
  });

  const refreshBackendHealth = useCallback(async () => {
    const res = await checkBackendHealth();
    setBackendHealth({
      checked: true,
      reachable: res.reachable,
      groqConfigured: res.groqConfigured,
      keyStatus: res.keyStatus,
      port: res.port || 5000,
      database: res.database,
      error: res.error
    });
  }, []);

  useEffect(() => {
    refreshBackendHealth();
    const interval = setInterval(refreshBackendHealth, 30000);
    return () => clearInterval(interval);
  }, [refreshBackendHealth]);

  // User-Scoped Resumes Manager State
  const [resumes, setResumes] = useState(() => {
    try {
      const savedUser = JSON.parse(localStorage.getItem('smart_resume_auth_user') || 'null');
      if (savedUser) {
        return loadUserResumes(savedUser);
      }
    } catch (e) { }
    return [INITIAL_RESUME];
  });

  const [activeResumeId, setActiveResumeId] = useState(() => {
    return resumes[0]?.id || INITIAL_RESUME.id;
  });

  const resume = useMemo(() => {
    return resumes.find(r => r.id === activeResumeId) || resumes[0] || INITIAL_RESUME;
  }, [resumes, activeResumeId]);

  const setResume = (updated) => {
    setResumes(prev => {
      const list = prev.map(r => r.id === updated.id ? updated : r);
      if (!list.some(r => r.id === updated.id)) list.push(updated);
      saveUserResumes(currentUser, list);
      return list;
    });
  };

// Sync Theme
useEffect(() => {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('smart_resume_theme', theme);
}, [theme]);

// Sync Hash
const navigateTo = (view) => {
  setCurrentView(view);
  window.location.hash = view === 'dashboard' ? '' : `#${view}`;
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

useEffect(() => {
  const handleHash = () => {
    const hash = window.location.hash.replace('#', '').toLowerCase();
    if (hash === 'studio') setCurrentView('studio');
    else if (hash === 'templates') setCurrentView('templates');
    else if (hash === 'cover-letter') setCurrentView('cover-letter');
    else setCurrentView('dashboard');
  };
  window.addEventListener('hashchange', handleHash);
  return () => window.removeEventListener('hashchange', handleHash);
}, []);

// Multi-Resume Actions
const handleCreateResume = () => {
  const newId = `resume_${Date.now()}`;
  const newRes = {
    ...INITIAL_RESUME,
    id: newId,
    title: `Resume v${resumes.length + 1}`,
    template: 'tpl_software_dev'
  };
  setResumes(prev => {
    const next = [...prev, newRes];
    try { localStorage.setItem('smart_resume_resumes_v5', JSON.stringify(next)); } catch (e) { }
    return next;
  });
  setActiveResumeId(newId);
  toast('New resume created!', 'success');
};

const handleDuplicateResume = (id) => {
  const target = resumes.find(r => r.id === id);
  if (!target) return;
  const dupId = `resume_${Date.now()}`;
  const duplicated = {
    ...target,
    id: dupId,
    title: `${target.title} (Copy)`
  };
  setResumes(prev => {
    const next = [...prev, duplicated];
    try { localStorage.setItem('smart_resume_resumes_v5', JSON.stringify(next)); } catch (e) { }
    return next;
  });
  setActiveResumeId(dupId);
  toast('Resume duplicated!', 'success');
};

const handleDeleteResume = (id) => {
  if (resumes.length <= 1) {
    toast('Cannot delete the last remaining resume.', 'error');
    return;
  }
  setResumes(prev => {
    const next = prev.filter(r => r.id !== id);
    try { localStorage.setItem('smart_resume_resumes_v5', JSON.stringify(next)); } catch (e) { }
    return next;
  });
  setActiveResumeId(resumes.find(r => r.id !== id)?.id || resumes[0].id);
  toast('Resume deleted.', 'info');
};

// Real-time ATS Analysis Engine
const atsAnalysis = useMemo(() => {
  if (!jobDescription || !jobDescription.trim()) {
    return { score: 92, matched: [], missing: [] };
  }
  const corpus = [
    resume.name, resume.roleTitle, resume.title, resume.summary, resume.skills,
    ...(resume.experiences || []).map(e => `${e.role} ${e.company} ${e.bullets}`),
    ...(resume.projects || []).map(p => `${p.title} ${p.tech} ${p.bullets}`),
    ...(resume.education || []).map(ed => `${ed.degree} ${ed.school}`)
  ].join(' ').toLowerCase();

  const jdText = jobDescription.toLowerCase();
  const detectedTargets = new Set();

  KNOWN_SKILL_PHRASES.forEach(p => {
    if (jdText.includes(p)) detectedTargets.add(p);
  });

  const words = jdText.match(/[a-z0-9+#.-]{2,}/g) || [];
  words.forEach(w => {
    if (!ATS_STOP_WORDS.has(w) && (HARD_SKILLS_SET.has(w) || SOFT_SKILLS_SET.has(w) || w.length > 3)) {
      detectedTargets.add(w);
    }
  });

  const matched = [];
  const missing = [];
  detectedTargets.forEach(t => {
    if (corpus.includes(t)) matched.push(t);
    else missing.push(t);
  });

  const total = detectedTargets.size || 1;
  const score = Math.min(99, Math.max(55, Math.round((matched.length / total) * 100)));
  return { score, matched, missing };
}, [resume, jobDescription]);

// Diagnostics Checklist
const atsDiagnostics = useMemo(() => {
  const checks = [];
  let score = 20;

  const hasContact = !!(resume.email && resume.phone && resume.location);
  checks.push({ label: 'Complete Contact Details (Email, Phone, City)', passed: hasContact });
  if (hasContact) score += 20;

  const summaryWordCount = (resume.summary || '').split(/\s+/).filter(Boolean).length;
  const goodSummary = summaryWordCount >= 20 && summaryWordCount <= 90;
  checks.push({ label: 'Executive Summary (25-85 Words)', passed: goodSummary });
  if (goodSummary) score += 20;

  const allBullets = [
    ...(resume.experiences || []).map(e => e.bullets || ''),
    ...(resume.projects || []).map(p => p.bullets || '')
  ].join('\n');
  const metricsCount = (allBullets.match(/(\d+[\d,.]*|\d+%\+?|\$\d+[\d,.]*[kmb]?)/gi) || []).length;
  const hasMetrics = metricsCount >= 3;
  checks.push({ label: 'Quantifiable Metrics (3+ metrics detected)', passed: hasMetrics });
  if (hasMetrics) score += 20;

  const skillsCount = (resume.skills || '').split(',').filter(s => s.trim().length > 0).length;
  const goodSkills = skillsCount >= 6 && skillsCount <= 22;
  checks.push({ label: 'Skills Density (6-22 Target Skills)', passed: goodSkills });
  if (goodSkills) score += 10;

  const hasEdu = (resume.education || []).length >= 1;
  checks.push({ label: 'Academic Credentials Present', passed: hasEdu });
  if (hasEdu) score += 10;

  return { score, checks };
}, [resume]);

// PDF Vector Export Handler (Pure A4 Dimensions with Off-Screen Staging)
const exportPDF = (targetType = 'resume') => {
  setIsExporting(true);
  toast('Preparing high-resolution vector PDF...', 'info');

  const isCoverLetter = targetType === 'cover-letter';
  if (!isCoverLetter && currentView !== 'studio') {
    setCurrentView('studio');
  }

  setTimeout(async () => {
    let staging = null;
    try {
      const targetId = isCoverLetter ? 'cover-letter-sheet' : 'react-resume-sheet';
      const original = document.getElementById(targetId);
      if (!original) {
        setIsExporting(false);
        toast(`${isCoverLetter ? 'Cover letter' : 'Resume'} sheet not found.`, 'error');
        return;
      }

      // Wait for web fonts if ready
      if (document.fonts && document.fonts.ready) {
        try {
          await document.fonts.ready;
        } catch (_) {}
      }

      // Wait for any images inside the document
      const imgs = Array.from(original.querySelectorAll('img'));
      if (imgs.length > 0) {
        await Promise.all(imgs.map(img => {
          if (img.complete) return Promise.resolve();
          return new Promise(resolve => {
            img.onload = resolve;
            img.onerror = resolve;
          });
        }));
      }

      // Mount staging wrapper cleanly off-screen to avoid viewport scale / scroll clipping
      staging = document.createElement('div');
      staging.id = 'react-resume-pdf-staging';
      staging.style.cssText = 'position: fixed; top: 0; left: 0; width: 210mm; min-height: 297mm; z-index: 99999; background: #ffffff; margin: 0; padding: 0; overflow: visible; pointer-events: none;';

      const clone = original.cloneNode(true);
      clone.id = isCoverLetter ? 'cover-letter-export-clone' : 'react-resume-sheet-export-clone';
      clone.style.display = 'block';
      clone.style.transform = 'none';
      clone.style.margin = '0';
      clone.style.boxShadow = 'none';
      clone.style.width = '210mm';
      clone.style.minHeight = '297mm';
      clone.style.background = '#ffffff';

      // Apply active palette CSS variables to ensure correct colors
      const activePalette = COLOR_PALETTES[resume.color] || COLOR_PALETTES.blue;
      if (activePalette) {
        clone.style.setProperty('--res-primary', activePalette.primary);
        clone.style.setProperty('--res-accent', activePalette.accent);
      }

      staging.appendChild(clone);
      document.body.appendChild(staging);

      const safeName = ((resume.name || 'Candidate').trim().replace(/[^a-zA-Z0-9_-]/g, '_')) || 'Document';
      const fileName = isCoverLetter ? `${safeName}_Cover_Letter.pdf` : `${safeName}_Resume.pdf`;

      if (typeof html2pdf !== 'undefined') {
        const opt = {
          margin: [0, 0, 0, 0],
          filename: fileName,
          image: { type: 'jpeg', quality: 0.98 },
          html2canvas: {
            scale: 2,
            useCORS: true,
            allowTaint: true,
            letterRendering: true,
            logging: false,
            scrollY: 0,
            scrollX: 0,
            windowWidth: 1024,
            windowHeight: 1600
          },
          jsPDF: {
            unit: 'mm',
            format: 'a4',
            orientation: 'portrait'
          }
        };

        await html2pdf().set(opt).from(clone).save();
        toast('PDF downloaded successfully!', 'success');
      } else {
        toast('PDF export library unavailable. Opening print dialog...', 'info');
        window.print();
      }
    } catch (err) {
      console.warn('PDF export error, falling back to print dialog:', err);
      toast('PDF generation error. Opening print dialog as fallback...', 'error');
      window.print();
    } finally {
      if (staging && staging.parentNode) {
        staging.parentNode.removeChild(staging);
      }
      setIsExporting(false);
    }
  }, 350);
};

if (!currentUser) {
  return <AuthView onLoginSuccess={handleLoginSuccess} />;
}

return (
  <div className="flex flex-col" style={{ minHeight: '100vh' }}>
    {/* Top Navbar */}
    <header className="navbar">
      <div className="navbar-brand" onClick={() => navigateTo('dashboard')}>
        <BrandLogo size="sm" />
      </div>

      <nav className="navbar-nav">
        <button
          className={`nav-link ${currentView === 'dashboard' ? 'active' : ''}`}
          onClick={() => navigateTo('dashboard')}
        >
          📊 Dashboard
        </button>
        <button
          className={`nav-link ${currentView === 'studio' ? 'active' : ''}`}
          onClick={() => navigateTo('studio')}
        >
          📄 Resume Studio
        </button>
        <button
          className={`nav-link ${currentView === 'templates' ? 'active' : ''}`}
          onClick={() => navigateTo('templates')}
        >
          🎨 Templates (25)
        </button>
        <button
          className={`nav-link ${currentView === 'cover-letter' ? 'active' : ''}`}
          onClick={() => navigateTo('cover-letter')}
        >
          ✍️ Cover Letter
        </button>
      </nav>

      <div className="navbar-actions">
        <button
          className={`backend-status-pill ${backendHealth.reachable ? (backendHealth.groqConfigured ? 'status-healthy' : 'status-warning') : 'status-unreachable'}`}
          onClick={() => setShowSettingsModal(true)}
          title={
            backendHealth.reachable
              ? (backendHealth.groqConfigured
                  ? `Backend Online (port ${backendHealth.port}) • Groq AI Ready`
                  : `Backend Online (port ${backendHealth.port}) • GROQ_API_KEY Missing in .env`)
              : `Backend Offline (http://localhost:5000 unreachable) • Click for setup steps`
          }
        >
          <span className="status-dot"></span>
          <span className="status-label">
            {!backendHealth.checked
              ? 'Connecting...'
              : (backendHealth.reachable
                  ? (backendHealth.groqConfigured ? 'AI Ready' : 'Key Missing')
                  : 'Backend Offline')}
          </span>
        </button>

        <button
          className="btn-icon"
          title="Toggle Light / Dark Mode"
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        >
          {theme === 'dark' ? '☀️' : '🌙'}
        </button>

        <button
          className="btn btn-secondary btn-sm"
          onClick={() => setShowSettingsModal(true)}
        >
          ✦ AI Settings
        </button>

        <button
          className="btn btn-primary btn-sm"
          onClick={() => {
            if (currentView === 'studio') exportPDF('resume');
            else if (currentView === 'cover-letter') exportPDF('cover-letter');
            else navigateTo('studio');
          }}
        >
          {currentView === 'studio' ? '📥 Download PDF' : currentView === 'cover-letter' ? '📥 Download PDF' : 'Open Studio'}
        </button>

        {currentUser && (
          <div className="user-profile-badge">
            <span className="user-avatar">👤</span>
            <span className="user-name">{currentUser.name || 'Candidate'}</span>
            <button className="btn-logout" title="Sign Out" onClick={handleLogout}>
              Logout
            </button>
          </div>
        )}
      </div>
    </header>

    {/* Main Views Container */}
    <main className="flex-1 flex flex-col">
      {currentView === 'dashboard' && (
        <DashboardView
          currentUser={currentUser}
          resume={resume}
          resumes={resumes}
          onSelectResume={setActiveResumeId}
          onCreateResume={handleCreateResume}
          onDuplicateResume={handleDuplicateResume}
          onDeleteResume={handleDeleteResume}
          onNavigate={navigateTo}
          onSelectTemplate={(tplId) => setResume({ ...resume, template: tplId })}
          atsScore={atsDiagnostics.score}
          atsChecks={atsDiagnostics.checks}
        />
      )}

      {currentView === 'templates' && (
        <TemplatesView
          currentTemplate={resume.template}
          onSelectTemplate={(tplId) => setResume({ ...resume, template: tplId })}
          onNavigate={navigateTo}
          resume={resume}
        />
      )}

      {currentView === 'studio' && (
        <StudioView
          resume={resume}
          setResume={setResume}
          onNavigate={navigateTo}
          onExportPDF={exportPDF}
          isExporting={isExporting}
          atsAnalysis={atsAnalysis}
          jobDescription={jobDescription}
          setJobDescription={setJobDescription}
          onOpenSettings={() => setShowSettingsModal(true)}
          onOpenReviewModal={setReviewModalData}
        />
      )}

      {currentView === 'cover-letter' && (
        <CoverLetterView
          resume={resume}
          onNavigate={navigateTo}
          onExportPDF={exportPDF}
        />
      )}
    </main>

    {/* Settings Modal */}
    {showSettingsModal && (
      <SettingsModal
        onClose={() => setShowSettingsModal(false)}
        backendHealth={backendHealth}
        refreshBackendHealth={refreshBackendHealth}
      />
    )}

    {/* Human-in-the-Loop AI Review Modal */}
    {reviewModalData && (
      <ReviewModal reviewData={reviewModalData} onClose={() => setReviewModalData(null)} />
    )}
  </div>
);
}


const rootElement = document.getElementById('root');
if (rootElement) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(<App />);
}
