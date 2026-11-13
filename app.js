/**
 * LEGACY VANILLA JS IMPLEMENTATION - DO NOT USE
 * This project uses app-react.js and app-react.jsx for its SPA functionality.
 * This file is kept only for historical reference to prevent conflicts.
 *
 * Core Capabilities:
 * - Live Google Gemini AI Connection (gemini-2.0-flash / gemini-1.5-flash) with Test Ping
 * - Smart Local AI Fallback Engine
 * - Human-in-the-Loop AI Review & Approval Modal (Review -> Edit -> Accept / Reject)
 * - Multi-Resume Storage & Switcher (Save, Switch, Duplicate, Delete)
 * - Candidate Profile Avatar / Photo Support (AI Generated Asset)
 * - Real-Time A4 Multi-Template Engine (Modern, Executive 2-Column, Minimal ATS, Creative)
 * - ATS Keyword Gap Matcher with Click-to-Add Missing Skills
 * - Pixel-Perfect Vector PDF Export & JSON Backup / Restore
 */

// Storage Keys
const STORAGE_DATA_KEY = 'smart_resume_resumes_v4';
const STORAGE_ACTIVE_ID_KEY = 'smart_resume_active_id_v4';
const STORAGE_API_KEY = 'gemini_api_key';
const STORAGE_MODEL_KEY = 'gemini_selected_model';

let customApiKey = localStorage.getItem(STORAGE_API_KEY) || '';
let selectedModel = localStorage.getItem(STORAGE_MODEL_KEY) || 'gemini-1.5-flash';
let currentZoom = 1.0;

// Universal Tech Candidate Profile (Alex Morgan)
const DEFAULT_RESUME_DATA = {
  id: 'resume_default',
  name: 'Alex Morgan',
  title: 'Senior Full Stack Software Engineer',
  avatar: 'assets/images/avatar.jpg',
  showAvatar: true,
  email: 'alex.morgan@devstudio.io',
  phone: '+1 (555) 349-2810',
  location: 'San Francisco, CA (or Remote)',
  links: 'github.com/alex-morgan | linkedin.com/in/alex-morgan-dev',
  summary: 'High-performing Senior Full Stack Engineer with 5+ years of experience architecting distributed cloud applications, responsive web interfaces, and AI-powered workflow automation. Proven expertise in cutting system latency by 40%, scaling API throughput to 50k+ req/sec, and mentoring engineering teams.',
  skills: 'TypeScript, JavaScript (ES6+), React.js, Next.js, Node.js, Python, FastAPI, PostgreSQL, Redis, Docker, Kubernetes, AWS (Lambda, ECS, S3), GraphQL, REST APIs, Tailwind CSS',
  template: 'modern',
  color: 'blue',
  font: 'sans',
  experiences: [
    {
      id: 1,
      role: 'Senior Full Stack Engineer',
      company: 'CloudScale Technologies',
      location: 'San Francisco, CA',
      startDate: '2023',
      endDate: 'Present',
      bullets: 'Architected high-throughput microservices using Node.js, FastAPI, and Redis, scaling real-time active user sessions to 100,000+.\nEngineered automated CI/CD deployment pipelines on AWS using GitHub Actions and Docker, reducing production release lead times by 65%.\nSpearheaded database schema optimization and indexing on PostgreSQL, cutting average query latency from 220ms to 45ms.'
    },
    {
      id: 2,
      role: 'Full Stack Web Developer',
      company: 'Nexus Interactive Labs',
      location: 'San Jose, CA',
      startDate: '2021',
      endDate: '2023',
      bullets: 'Developed responsive client-facing web applications with React, Next.js, and Tailwind CSS, increasing user engagement by 32%.\nImplemented secure RESTful API endpoints and OAuth 2.0 / JWT authentication protocols for enterprise integrations.\nCollaborated across agile sprints to achieve 94% test coverage using Jest, React Testing Library, and Cypress.'
    }
  ],
  education: [
    {
      id: 1,
      degree: 'B.S. in Computer Science & Engineering',
      school: 'University Institute of Technology',
      location: 'California, USA',
      year: '2017 – 2021',
      gpa: 'GPA: 3.85 / 4.0 (Dean\'s Honor Roll)'
    }
  ],
  projects: [
    {
      id: 1,
      title: 'Smart Resume AI Platform',
      tech: 'React, TypeScript, Google Gemini API, Tailwind CSS, html2pdf',
      link: 'github.com/alex-morgan/smart-resume-ai',
      bullets: 'Engineered responsive client-side resume studio compiling vector-grade A4 printable documents natively.\nFormulated real-time NLP token matching algorithm calculating ATS job description keyword overlap in <12ms.\nIntegrated human-in-the-loop AI review modal supporting inline editing, regeneration, and instant approval workflows.'
    },
    {
      id: 2,
      title: 'Distributed Asynchronous Task Engine',
      tech: 'Python, FastAPI, Redis, Docker',
      link: 'github.com/alex-morgan/distributed-task-queue',
      bullets: 'Constructed event-driven asynchronous job worker pool supporting priority scheduling and dead-letter recovery.\nBenchmarked system concurrency to successfully execute 20,000 concurrent task runs with zero data degradation.'
    }
  ],
  certifications: [
    {
      id: 1,
      title: 'AWS Certified Solutions Architect – Professional',
      issuer: 'Amazon Web Services',
      year: '2024'
    },
    {
      id: 2,
      title: 'Meta Certified Professional Frontend Developer',
      issuer: 'Meta / Coursera',
      year: '2023'
    }
  ]
};

// Global Store State
let allResumes = loadAllResumes();
let activeResumeId = localStorage.getItem(STORAGE_ACTIVE_ID_KEY) || (allResumes[0] ? allResumes[0].id : DEFAULT_RESUME_DATA.id);
let resumeData = getActiveResume();

/* ==========================================================================
   Multi-Resume Storage & Management
   ========================================================================== */
function loadAllResumes() {
  try {
    const raw = localStorage.getItem(STORAGE_DATA_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.error('Failed to load resumes array', e);
  }
  return [JSON.parse(JSON.stringify(DEFAULT_RESUME_DATA))];
}

function getActiveResume() {
  let found = allResumes.find(r => r.id === activeResumeId);
  if (!found) {
    found = allResumes[0] || JSON.parse(JSON.stringify(DEFAULT_RESUME_DATA));
    activeResumeId = found.id;
  }
  return found;
}

function saveCurrentResume() {
  const idx = allResumes.findIndex(r => r.id === activeResumeId);
  if (idx !== -1) {
    allResumes[idx] = resumeData;
  } else {
    allResumes.push(resumeData);
  }
  localStorage.setItem(STORAGE_DATA_KEY, JSON.stringify(allResumes));
  localStorage.setItem(STORAGE_ACTIVE_ID_KEY, activeResumeId);

  const status = document.getElementById('save-status');
  if (status) {
    status.innerText = '✓ Auto-saved';
    status.style.opacity = '1';
    setTimeout(() => { status.style.opacity = '0.6'; }, 1800);
  }
}

function switchResume(id) {
  saveCurrentResume();
  activeResumeId = id;
  resumeData = getActiveResume();
  localStorage.setItem(STORAGE_ACTIVE_ID_KEY, id);
  populateFormFields();
  renderLivePreview();
  renderResumeSelector();
  toast(`Switched to: ${resumeData.name || 'Untitled Resume'}`, 'info');
}

function createNewResume() {
  saveCurrentResume();
  const newId = 'resume_' + Date.now();
  const newResume = {
    id: newId,
    name: 'New Candidate',
    title: 'Software Developer',
    avatar: 'assets/images/avatar.jpg',
    showAvatar: true,
    email: '',
    phone: '',
    location: '',
    links: '',
    summary: '',
    skills: 'TypeScript, JavaScript, React.js, Node.js, Python, SQL, Git',
    template: 'modern',
    color: 'blue',
    font: 'sans',
    experiences: [],
    education: [],
    projects: [],
    certifications: []
  };
  allResumes.push(newResume);
  activeResumeId = newId;
  resumeData = newResume;
  saveCurrentResume();
  populateFormFields();
  renderLivePreview();
  renderResumeSelector();
  toast('Created new blank resume.', 'success');
}

function duplicateCurrentResume() {
  saveCurrentResume();
  const newId = 'resume_' + Date.now();
  const duplicated = JSON.parse(JSON.stringify(resumeData));
  duplicated.id = newId;
  duplicated.name = `${duplicated.name || 'Resume'} (Copy)`;
  allResumes.push(duplicated);
  activeResumeId = newId;
  resumeData = duplicated;
  saveCurrentResume();
  populateFormFields();
  renderLivePreview();
  renderResumeSelector();
  toast('Duplicated current resume successfully!', 'success');
}

function deleteCurrentResume() {
  if (allResumes.length <= 1) {
    toast('Cannot delete the only resume in your profile.', 'error');
    return;
  }
  if (confirm(`Delete "${resumeData.name || 'this resume'}" permanently?`)) {
    allResumes = allResumes.filter(r => r.id !== activeResumeId);
    activeResumeId = allResumes[0].id;
    resumeData = getActiveResume();
    saveCurrentResume();
    populateFormFields();
    renderLivePreview();
    renderResumeSelector();
    toast('Resume deleted.', 'info');
  }
}

function renderResumeSelector() {
  const select = document.getElementById('saved-resumes-select');
  if (!select) return;
  select.innerHTML = '';
  allResumes.forEach(r => {
    const opt = document.createElement('option');
    opt.value = r.id;
    opt.innerText = `📄 ${r.name || 'Untitled'} (${r.title || 'Draft'})`;
    if (r.id === activeResumeId) opt.selected = true;
    select.appendChild(opt);
  });
}

/* ==========================================================================
   Toast Notification System
   ========================================================================== */
function toast(message, type = 'info') {
  let stack = document.getElementById('toast-stack');
  if (!stack) {
    stack = document.createElement('div');
    stack.id = 'toast-stack';
    document.body.appendChild(stack);
  }
  const el = document.createElement('div');
  el.className = `toast toast-${type}`;
  const icon = type === 'success' ? '✓' : type === 'error' ? '✕' : 'ℹ';
  el.innerHTML = `<span>${icon}</span> <span>${escapeHtml(message)}</span>`;
  stack.appendChild(el);

  setTimeout(() => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(10px)';
    el.style.transition = 'all 0.3s ease';
    setTimeout(() => el.remove(), 300);
  }, 3400);
}

/* ==========================================================================
   Google Gemini AI Connection & Management
   ========================================================================== */
function updateAiStatusIndicator() {
  const indicator = document.getElementById('ai-connection-indicator');
  if (!indicator) return;
  if (customApiKey) {
    indicator.className = 'ai-status-pill connected';
    indicator.innerHTML = `🟢 Gemini Live (${selectedModel.replace('gemini-', '')})`;
    indicator.title = 'Connected to Google Gemini API. Click to manage key.';
  } else {
    indicator.className = 'ai-status-pill offline';
    indicator.innerHTML = `🟡 Smart AI (Offline Engine)`;
    indicator.title = 'Using Built-in Local NLP. Click to connect Gemini API key.';
  }
}

function openApiKeyModal() {
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = `
    <div class="modal-box" style="max-width: 540px;">
      <div style="display:flex; justify-content:space-between; align-items:center;">
        <h3>🔑 Google Gemini AI Connection</h3>
        <span class="ai-status-pill ${customApiKey ? 'connected' : 'offline'}">${customApiKey ? 'Connected' : 'Offline Mode'}</span>
      </div>
      <p style="font-size:0.85rem; color:var(--text-muted); line-height:1.5;">
        Connect your free Google Gemini API key to enable live generative summary creation and context-aware action bullet enhancement.
        Get your free key in 30 seconds at <a href="https://aistudio.google.com/app/apikey" target="_blank" style="color:var(--accent-cyan); text-decoration:underline;">Google AI Studio</a>.
      </p>

      <div class="form-group">
        <label>Select Gemini Model</label>
        <select id="modal-model-select" class="dropdown-select" style="background:#0b0f19;">
          <option value="gemini-1.5-flash" ${selectedModel === 'gemini-1.5-flash' ? 'selected' : ''}>gemini-1.5-flash (Fast & Recommended)</option>
          <option value="gemini-2.0-flash" ${selectedModel === 'gemini-2.0-flash' ? 'selected' : ''}>gemini-2.0-flash (Ultra Low Latency)</option>
          <option value="gemini-1.5-pro" ${selectedModel === 'gemini-1.5-pro' ? 'selected' : ''}>gemini-1.5-pro (Deep Reasoning)</option>
        </select>
      </div>

      <div class="form-group">
        <label>Gemini API Key</label>
        <input type="password" id="modal-api-key" placeholder="AIzaSy..." value="${escapeAttr(customApiKey)}">
      </div>

      <div id="test-connection-status" style="font-size:0.8rem; font-family:var(--font-mono); min-height:18px;"></div>

      <div class="modal-actions" style="justify-content:space-between;">
        <button class="btn btn-glass btn-sm" id="btn-test-gemini" onclick="testGeminiConnection()">
          ⚡ Test Connection
        </button>
        <div style="display:flex; gap:0.6rem;">
          <button class="btn btn-glass btn-sm" id="modal-btn-cancel">Close</button>
          <button class="btn btn-glow btn-sm" id="modal-btn-save">Save & Connect</button>
        </div>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);

  const close = () => overlay.remove();
  overlay.addEventListener('click', e => { if (e.target === overlay) close(); });
  overlay.querySelector('#modal-btn-cancel').onclick = close;
  overlay.querySelector('#modal-btn-save').onclick = () => {
    const keyVal = overlay.querySelector('#modal-api-key').value.trim();
    const modelVal = overlay.querySelector('#modal-model-select').value;
    customApiKey = keyVal;
    selectedModel = modelVal;
    localStorage.setItem(STORAGE_API_KEY, customApiKey);
    localStorage.setItem(STORAGE_MODEL_KEY, selectedModel);
    updateAiStatusIndicator();
    toast(keyVal ? `Connected to Gemini (${selectedModel})!` : 'Offline AI mode active.', 'success');
    close();
  };
}

async function testGeminiConnection() {
  const key = document.getElementById('modal-api-key')?.value.trim();
  const model = document.getElementById('modal-model-select')?.value || 'gemini-1.5-flash';
  const statusEl = document.getElementById('test-connection-status');
  const btn = document.getElementById('btn-test-gemini');

  if (!key) {
    statusEl.innerHTML = '<span style="color:#ef4444;">Please enter an API Key first.</span>';
    return;
  }

  btn.disabled = true;
  statusEl.innerHTML = '<span style="color:var(--accent-cyan);"><span class="spinner"></span> Pinging Google Gemini servers...</span>';

  const startTime = Date.now();
  try {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(key)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: 'Respond with the word OK.' }] }] })
    });

    if (!res.ok) throw new Error(`HTTP Error ${res.status}`);
    const data = await res.json();
    const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
    const elapsed = Date.now() - startTime;

    statusEl.innerHTML = `<span style="color:#10b981;">✓ Connected successfully to ${model} (${elapsed}ms).</span>`;
    toast('Gemini API verified!', 'success');
  } catch (err) {
    statusEl.innerHTML = `<span style="color:#ef4444;">✕ Connection failed: ${err.message}. Check key or quota.</span>`;
  } finally {
    btn.disabled = false;
  }
}

/* ==========================================================================
   AI Suggestion & Review Modal (Human Control)
   ========================================================================== */
function openAiReviewModal(options) {
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = `
    <div class="ai-review-modal-box">
      <div class="ai-review-header">
        <h3><span>✨</span> AI Suggestion Review & Approval</h3>
        <span class="ai-review-badge">${options.badge || 'Human Control'}</span>
      </div>

      <div class="ai-review-body">
        <p style="font-size:0.84rem; color:var(--text-muted);">
          Review the AI-generated enhancement below. You can edit the text directly before accepting or reject it entirely.
        </p>

        ${options.originalText ? `
          <div class="ai-review-section">
            <label>Original Content:</label>
            <div class="ai-review-original">${escapeHtml(options.originalText).replace(/\n/g, '<br>')}</div>
          </div>
        ` : ''}

        <div class="ai-review-section">
          <label>AI Enhanced Suggestion (Editable):</label>
          <div class="ai-review-suggestion">
            <textarea id="ai-review-textarea" rows="4">${escapeHtml(options.aiSuggestedText)}</textarea>
          </div>
        </div>
      </div>

      <div class="ai-review-actions">
        <button class="btn btn-glass btn-sm" id="btn-review-regenerate">
          🔄 Regenerate
        </button>
        <div style="display:flex; gap:0.6rem;">
          <button class="btn btn-glass btn-sm" id="btn-review-reject" style="color:#f87171;">
            ✕ Reject
          </button>
          <button class="btn btn-glow btn-sm" id="btn-review-accept">
            ✓ Accept & Apply to Resume
          </button>
        </div>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);

  const close = () => overlay.remove();
  overlay.addEventListener('click', e => { if (e.target === overlay) close(); });

  overlay.querySelector('#btn-review-reject').onclick = () => {
    close();
    toast('Suggestion discarded. Original content preserved.', 'info');
  };

  overlay.querySelector('#btn-review-accept').onclick = () => {
    const finalVal = overlay.querySelector('#ai-review-textarea').value.trim();
    if (options.onAccept) options.onAccept(finalVal);
    close();
    toast('Accepted and applied suggestion to resume!', 'success');
  };

  overlay.querySelector('#btn-review-regenerate').onclick = () => {
    close();
    if (options.onRegenerate) options.onRegenerate();
  };
}

/* AI Summary Generation Pipeline */
async function generateAiSummary() {
  const summaryInput = document.getElementById('in-summary');
  const role = resumeData.title || 'Senior Full Stack Engineer';
  const skills = resumeData.skills || 'TypeScript, React, Node.js, Cloud';
  const currentText = summaryInput.value.trim();
  const btn = document.getElementById('btn-summary-ai');

  setButtonBusy(btn, true, 'Generating with AI...');

  let aiResult = '';

  if (customApiKey) {
    try {
      const prompt = `Write a high-impact, professional 2-to-3 sentence executive resume summary for a "${role}" skilled in: ${skills}. Focus on technical problem solving, engineering ownership, and measurable career outcomes. Do not include markdown formatting or quotes, return only the summary text.`;
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${selectedModel}:generateContent?key=${encodeURIComponent(customApiKey)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      aiResult = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
    } catch (err) {
      console.warn('Gemini request failed, using local NLP', err);
      aiResult = generateLocalSummary(role, skills);
    }
  } else {
    aiResult = generateLocalSummary(role, skills);
  }

  setButtonBusy(btn, false, '✨ Generate with AI');

  openAiReviewModal({
    badge: customApiKey ? `Gemini (${selectedModel.replace('gemini-', '')})` : 'Smart Local NLP',
    originalText: currentText,
    aiSuggestedText: aiResult,
    onAccept: (approvedText) => {
      summaryInput.value = approvedText;
      syncHeaderFromInputs();
    },
    onRegenerate: () => {
      generateAiSummary();
    }
  });
}

function generateLocalSummary(role, skills) {
  const templates = [
    `Results-driven ${role} proficient in ${skills}. Proven track record of architecting scalable applications, designing resilient API pipelines, and optimizing system performance for high-traffic environments.`,
    `Innovative ${role} with strong foundations in ${skills}. Passionate about clean modular code, automated CI/CD deployment, and delivering robust software architectures.`,
    `High-performing ${role} with hands-on expertise in ${skills}. Experienced in full software lifecycle development, cutting query response latencies by 35%+, and leading technical initiatives.`
  ];
  return templates[Math.floor(Math.random() * templates.length)];
}

/* AI Bullet Enhancement Pipeline (Google XYZ Formula) */
const STRONG_ACTION_VERBS = [
  'Architected', 'Engineered', 'Spearheaded', 'Optimized', 'Automated', 
  'Formulated', 'Streamlined', 'Deployed', 'Refactored', 'Standardized', 'Orchestrated'
];

const METRIC_OUTCOMES = [
  'reducing latency by 35%',
  'increasing operational throughput by 45%',
  'slashing memory footprint by 28%',
  'accelerating deployment frequency by 3x',
  'achieving 99.98% service uptime',
  'scaling active system concurrency to 20,000+ connections'
];

async function aiEnhanceBullets(btnElem, type, id) {
  const box = btnElem.closest('.repeater-item-box');
  const textarea = box.querySelector('textarea');
  const currentText = textarea.value.trim();

  setButtonBusy(btnElem, true, 'Enhancing...');

  let enhancedBullets = '';

  if (customApiKey && currentText) {
    try {
      const prompt = `Rewrite the following resume bullet points using Google's XYZ formula ("Accomplished [X] as measured by [Y] by doing [Z]"). Use strong action verbs (e.g. Architected, Engineered, Optimized) and include realistic technical metrics. Input lines:\n${currentText}\nOutput each improved bullet on a new line starting with "• ". Output only the bullets.`;
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${selectedModel}:generateContent?key=${encodeURIComponent(customApiKey)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
      });
      if (res.ok) {
        const data = await res.json();
        enhancedBullets = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
      }
    } catch (e) {
      console.warn('Gemini bullets failed, using local', e);
    }
  }

  if (!enhancedBullets) {
    if (!currentText) {
      const v1 = STRONG_ACTION_VERBS[Math.floor(Math.random() * STRONG_ACTION_VERBS.length)];
      const v2 = STRONG_ACTION_VERBS[Math.floor(Math.random() * STRONG_ACTION_VERBS.length)];
      enhancedBullets = `• ${v1} modular application architecture using modern development standards, ${METRIC_OUTCOMES[0]}.\n• ${v2} automated integration pipelines and error-recovery routines, ${METRIC_OUTCOMES[1]}.`;
    } else {
      const lines = currentText.split('\n');
      enhancedBullets = lines.map((line, idx) => {
        const clean = line.replace(/^[•\-\*\s]+/, '').trim();
        if (!clean) return '';
        const verb = STRONG_ACTION_VERBS[idx % STRONG_ACTION_VERBS.length];
        const hasMetric = /\b\d+%|\b\d+x|\bthroughput|\blatency|\buptime\b/i.test(clean);
        const metricSuffix = hasMetric ? '' : `, ${METRIC_OUTCOMES[idx % METRIC_OUTCOMES.length]}`;
        return `• ${verb} ${clean.charAt(0).toLowerCase() + clean.slice(1)}${metricSuffix}`;
      }).filter(Boolean).join('\n');
    }
  }

  setButtonBusy(btnElem, false, '✨ Polish Action Bullets');

  openAiReviewModal({
    badge: 'XYZ Action Formula',
    originalText: currentText,
    aiSuggestedText: enhancedBullets,
    onAccept: (approvedText) => {
      textarea.value = approvedText;
      if (type === 'exp') updateExpField(id, 'bullets', approvedText);
      else if (type === 'proj') updateProjField(id, 'bullets', approvedText);
    },
    onRegenerate: () => {
      aiEnhanceBullets(btnElem, type, id);
    }
  });
}

function triggerAllAiEnhancements() {
  generateAiSummary();
  toast('Triggered AI summary optimizer. Click individual bullets to review section enhancements.', 'info');
}

function setButtonBusy(btn, busy, text) {
  if (!btn) return;
  btn.disabled = busy;
  btn.innerHTML = busy ? `<span class="spinner"></span> ${text}` : text;
}

/* ==========================================================================
   Form Binding & Repeaters (Flexbox)
   ========================================================================== */
function populateFormFields() {
  setInputValue('in-name', resumeData.name);
  setInputValue('in-title', resumeData.title);
  setInputValue('in-email', resumeData.email);
  setInputValue('in-phone', resumeData.phone);
  setInputValue('in-location', resumeData.location);
  setInputValue('in-links', resumeData.links);
  setInputValue('in-summary', resumeData.summary);
  setInputValue('in-skills', resumeData.skills);

  const docTitle = document.getElementById('doc-title-input');
  if (docTitle) docTitle.value = `${resumeData.name || 'My'} - Resume`;

  const tplSelect = document.getElementById('template-select');
  if (tplSelect) tplSelect.value = resumeData.template || 'modern';

  const fontSelect = document.getElementById('font-select');
  if (fontSelect) fontSelect.value = resumeData.font || 'sans';

  renderColorPickerActiveState();
  renderExperienceList();
  renderEducationList();
  renderProjectList();
  renderCertificationsList();
  renderSkillSuggestions();
  renderResumeSelector();
}

function setInputValue(id, val) {
  const el = document.getElementById(id);
  if (el) el.value = val || '';
}

function syncHeaderFromInputs() {
  resumeData.name = document.getElementById('in-name')?.value || '';
  resumeData.title = document.getElementById('in-title')?.value || '';
  resumeData.email = document.getElementById('in-email')?.value || '';
  resumeData.phone = document.getElementById('in-phone')?.value || '';
  resumeData.location = document.getElementById('in-location')?.value || '';
  resumeData.links = document.getElementById('in-links')?.value || '';
  resumeData.summary = document.getElementById('in-summary')?.value || '';
  resumeData.skills = document.getElementById('in-skills')?.value || '';

  saveCurrentResume();
  renderLivePreview();
}

function toggleAvatar(show) {
  resumeData.showAvatar = show;
  saveCurrentResume();
  renderLivePreview();
}

/* Repeaters: Work Experience */
function addExperience(exp = {}) {
  const newExp = {
    id: Date.now() + Math.random(),
    role: exp.role || '',
    company: exp.company || '',
    location: exp.location || '',
    startDate: exp.startDate || '',
    endDate: exp.endDate || 'Present',
    bullets: exp.bullets || ''
  };
  resumeData.experiences.push(newExp);
  saveCurrentResume();
  renderExperienceList();
  renderLivePreview();
}

function removeExperience(id) {
  resumeData.experiences = resumeData.experiences.filter(e => e.id !== id);
  saveCurrentResume();
  renderExperienceList();
  renderLivePreview();
}

function renderExperienceList() {
  const container = document.getElementById('experience-list');
  if (!container) return;
  container.innerHTML = '';

  resumeData.experiences.forEach((exp, idx) => {
    const box = document.createElement('div');
    box.className = 'repeater-item-box';
    box.innerHTML = `
      <div class="item-header-bar">
        <span class="item-index-badge">POSITION ${String(idx + 1).padStart(2, '0')}</span>
        <button class="btn-danger-sm" onclick="removeExperience(${exp.id})">✕ Remove</button>
      </div>
      <div class="form-grid">
        <div class="form-group">
          <label>Job Title / Role</label>
          <input type="text" value="${escapeAttr(exp.role)}" placeholder="e.g. Senior Full Stack Engineer" oninput="updateExpField(${exp.id}, 'role', this.value)">
        </div>
        <div class="form-group">
          <label>Company / Organization</label>
          <input type="text" value="${escapeAttr(exp.company)}" placeholder="e.g. Stripe, Airbnb" oninput="updateExpField(${exp.id}, 'company', this.value)">
        </div>
        <div class="form-group">
          <label>Location</label>
          <input type="text" value="${escapeAttr(exp.location)}" placeholder="e.g. San Francisco, CA (or Remote)" oninput="updateExpField(${exp.id}, 'location', this.value)">
        </div>
        <div class="form-group">
          <label>Time Period</label>
          <div style="display:flex; gap:0.5rem;">
            <input type="text" value="${escapeAttr(exp.startDate)}" placeholder="Start (2022)" oninput="updateExpField(${exp.id}, 'startDate', this.value)">
            <input type="text" value="${escapeAttr(exp.endDate)}" placeholder="End (Present)" oninput="updateExpField(${exp.id}, 'endDate', this.value)">
          </div>
        </div>
      </div>
      <div class="form-group">
        <label>Key Accomplishments & Bullet Points (One per line)</label>
        <textarea rows="3" placeholder="• Accomplished [X] as measured by [Y] by doing [Z]..." oninput="updateExpField(${exp.id}, 'bullets', this.value)">${escapeHtml(exp.bullets)}</textarea>
        <div class="ai-controls-bar">
          <button class="btn-ai-sm" onclick="aiEnhanceBullets(this, 'exp', ${exp.id})">✨ Polish Action Bullets (XYZ formula)</button>
        </div>
      </div>
    `;
    container.appendChild(box);
  });
}

function updateExpField(id, field, value) {
  const exp = resumeData.experiences.find(e => e.id === id);
  if (exp) {
    exp[field] = value;
    saveCurrentResume();
    renderLivePreview();
  }
}

/* Repeaters: Education */
function addEducation(edu = {}) {
  const newEdu = {
    id: Date.now() + Math.random(),
    degree: edu.degree || '',
    school: edu.school || '',
    location: edu.location || '',
    year: edu.year || '',
    gpa: edu.gpa || ''
  };
  resumeData.education.push(newEdu);
  saveCurrentResume();
  renderEducationList();
  renderLivePreview();
}

function removeEducation(id) {
  resumeData.education = resumeData.education.filter(e => e.id !== id);
  saveCurrentResume();
  renderEducationList();
  renderLivePreview();
}

function renderEducationList() {
  const container = document.getElementById('education-list');
  if (!container) return;
  container.innerHTML = '';

  resumeData.education.forEach((edu, idx) => {
    const box = document.createElement('div');
    box.className = 'repeater-item-box';
    box.innerHTML = `
      <div class="item-header-bar">
        <span class="item-index-badge">DEGREE ${String(idx + 1).padStart(2, '0')}</span>
        <button class="btn-danger-sm" onclick="removeEducation(${edu.id})">✕ Remove</button>
      </div>
      <div class="form-grid">
        <div class="form-group">
          <label>Degree / Certificate Title</label>
          <input type="text" value="${escapeAttr(edu.degree)}" placeholder="e.g. B.S. in Computer Science" oninput="updateEduField(${edu.id}, 'degree', this.value)">
        </div>
        <div class="form-group">
          <label>Institution / University</label>
          <input type="text" value="${escapeAttr(edu.school)}" placeholder="e.g. Stanford University" oninput="updateEduField(${edu.id}, 'school', this.value)">
        </div>
        <div class="form-group">
          <label>Location</label>
          <input type="text" value="${escapeAttr(edu.location)}" placeholder="e.g. Stanford, CA" oninput="updateEduField(${edu.id}, 'location', this.value)">
        </div>
        <div class="form-group">
          <label>Graduation Year & GPA / Honors</label>
          <div style="display:flex; gap:0.5rem;">
            <input type="text" value="${escapeAttr(edu.year)}" placeholder="Year (2021)" oninput="updateEduField(${edu.id}, 'year', this.value)">
            <input type="text" value="${escapeAttr(edu.gpa)}" placeholder="GPA / Honors" oninput="updateEduField(${edu.id}, 'gpa', this.value)">
          </div>
        </div>
      </div>
    `;
    container.appendChild(box);
  });
}

function updateEduField(id, field, value) {
  const edu = resumeData.education.find(e => e.id === id);
  if (edu) {
    edu[field] = value;
    saveCurrentResume();
    renderLivePreview();
  }
}

/* Repeaters: Projects */
function addProject(proj = {}) {
  const newProj = {
    id: Date.now() + Math.random(),
    title: proj.title || '',
    tech: proj.tech || '',
    link: proj.link || '',
    bullets: proj.bullets || ''
  };
  resumeData.projects.push(newProj);
  saveCurrentResume();
  renderProjectList();
  renderLivePreview();
}

function removeProject(id) {
  resumeData.projects = resumeData.projects.filter(p => p.id !== id);
  saveCurrentResume();
  renderProjectList();
  renderLivePreview();
}

function renderProjectList() {
  const container = document.getElementById('project-list');
  if (!container) return;
  container.innerHTML = '';

  resumeData.projects.forEach((proj, idx) => {
    const box = document.createElement('div');
    box.className = 'repeater-item-box';
    box.innerHTML = `
      <div class="item-header-bar">
        <span class="item-index-badge">PROJECT ${String(idx + 1).padStart(2, '0')}</span>
        <button class="btn-danger-sm" onclick="removeProject(${proj.id})">✕ Remove</button>
      </div>
      <div class="form-grid">
        <div class="form-group">
          <label>Project Name</label>
          <input type="text" value="${escapeAttr(proj.title)}" placeholder="e.g. Distributed Task Queue" oninput="updateProjField(${proj.id}, 'title', this.value)">
        </div>
        <div class="form-group">
          <label>Tech Stack Used</label>
          <input type="text" value="${escapeAttr(proj.tech)}" placeholder="e.g. React, Node.js, Redis, Docker" oninput="updateProjField(${proj.id}, 'tech', this.value)">
        </div>
        <div class="form-group" style="grid-column: 1 / -1;">
          <label>Project Link / Repo URL</label>
          <input type="text" value="${escapeAttr(proj.link)}" placeholder="e.g. github.com/user/project" oninput="updateProjField(${proj.id}, 'link', this.value)">
        </div>
      </div>
      <div class="form-group">
        <label>Technical Implementation & Impact Bullets</label>
        <textarea rows="3" placeholder="• Engineered key features resulting in [Metric]..." oninput="updateProjField(${proj.id}, 'bullets', this.value)">${escapeHtml(proj.bullets)}</textarea>
        <div class="ai-controls-bar">
          <button class="btn-ai-sm" onclick="aiEnhanceBullets(this, 'proj', ${proj.id})">✨ Polish Action Bullets</button>
        </div>
      </div>
    `;
    container.appendChild(box);
  });
}

function updateProjField(id, field, value) {
  const proj = resumeData.projects.find(p => p.id === id);
  if (proj) {
    proj[field] = value;
    saveCurrentResume();
    renderLivePreview();
  }
}

/* Repeaters: Certifications */
function addCertification(cert = {}) {
  const newCert = {
    id: Date.now() + Math.random(),
    title: cert.title || '',
    issuer: cert.issuer || '',
    year: cert.year || ''
  };
  resumeData.certifications.push(newCert);
  saveCurrentResume();
  renderCertificationsList();
  renderLivePreview();
}

function removeCertification(id) {
  resumeData.certifications = resumeData.certifications.filter(c => c.id !== id);
  saveCurrentResume();
  renderCertificationsList();
  renderLivePreview();
}

function renderCertificationsList() {
  const container = document.getElementById('certifications-list');
  if (!container) return;
  container.innerHTML = '';

  resumeData.certifications.forEach((cert, idx) => {
    const box = document.createElement('div');
    box.className = 'repeater-item-box';
    box.innerHTML = `
      <div class="item-header-bar">
        <span class="item-index-badge">CERTIFICATE ${String(idx + 1).padStart(2, '0')}</span>
        <button class="btn-danger-sm" onclick="removeCertification(${cert.id})">✕ Remove</button>
      </div>
      <div class="form-grid">
        <div class="form-group">
          <label>Certificate / Honor Title</label>
          <input type="text" value="${escapeAttr(cert.title)}" placeholder="e.g. AWS Certified Solutions Architect" oninput="updateCertField(${cert.id}, 'title', this.value)">
        </div>
        <div class="form-group">
          <label>Issuing Organization</label>
          <input type="text" value="${escapeAttr(cert.issuer)}" placeholder="e.g. Amazon Web Services" oninput="updateCertField(${cert.id}, 'issuer', this.value)">
        </div>
        <div class="form-group">
          <label>Year</label>
          <input type="text" value="${escapeAttr(cert.year)}" placeholder="e.g. 2024" oninput="updateCertField(${cert.id}, 'year', this.value)">
        </div>
      </div>
    `;
    container.appendChild(box);
  });
}

function updateCertField(id, field, value) {
  const cert = resumeData.certifications.find(c => c.id === id);
  if (cert) {
    cert[field] = value;
    saveCurrentResume();
    renderLivePreview();
  }
}

/* ==========================================================================
   AI Skill Suggester
   ========================================================================== */
const ROLE_SKILL_MAP = {
  frontend: ['React.js', 'TypeScript', 'Next.js', 'Tailwind CSS', 'Redux', 'HTML5/CSS3', 'Jest', 'Webpack', 'REST APIs', 'GraphQL', 'Responsive Design'],
  backend: ['Node.js', 'Express', 'Python', 'FastAPI', 'PostgreSQL', 'MongoDB', 'Redis', 'Docker', 'AWS', 'Microservices', 'System Design'],
  fullstack: ['TypeScript', 'JavaScript (ES6+)', 'React.js', 'Node.js', 'Python', 'PostgreSQL', 'Docker', 'Git', 'REST APIs', 'Tailwind CSS', 'AWS'],
  data: ['Python', 'SQL', 'Pandas', 'NumPy', 'Tableau', 'PowerBI', 'Scikit-Learn', 'Machine Learning', 'BigQuery', 'Statistics', 'Data Pipelines'],
  devops: ['Kubernetes', 'Docker', 'Terraform', 'AWS', 'CI/CD Pipelines', 'Linux', 'Ansible', 'Prometheus', 'Grafana', 'GitOps']
};

function renderSkillSuggestions() {
  const container = document.getElementById('skill-suggestions');
  if (!container) return;
  container.innerHTML = '';

  const role = (resumeData.title || '').toLowerCase();
  let suggestions = ROLE_SKILL_MAP.fullstack;

  if (role.includes('front')) suggestions = ROLE_SKILL_MAP.frontend;
  else if (role.includes('back')) suggestions = ROLE_SKILL_MAP.backend;
  else if (role.includes('data') || role.includes('analyst') || role.includes('ml')) suggestions = ROLE_SKILL_MAP.data;
  else if (role.includes('devops') || role.includes('cloud')) suggestions = ROLE_SKILL_MAP.devops;

  const currentSkills = new Set(
    (resumeData.skills || '').split(',').map(s => s.trim().toLowerCase())
  );

  suggestions.forEach(skill => {
    if (!currentSkills.has(skill.toLowerCase())) {
      const pill = document.createElement('span');
      pill.className = 'skill-rec-pill';
      pill.innerText = `+ ${skill}`;
      pill.onclick = () => addSkillToResume(skill);
      container.appendChild(pill);
    }
  });
}

function addSkillToResume(skillName) {
  const input = document.getElementById('in-skills');
  if (!input) return;
  const existing = input.value.trim();
  input.value = existing ? `${existing}, ${skillName}` : skillName;
  syncHeaderFromInputs();
  renderSkillSuggestions();
  toast(`Added "${skillName}" to skills.`, 'success');
}

/* ==========================================================================
   Live Resume Sheet Renderer (A4 Document with Flexbox)
   ========================================================================== */
function renderLivePreview() {
  const sheet = document.getElementById('resume-document');
  if (!sheet) return;

  sheet.className = `resume-paper template-${resumeData.template || 'modern'}`;
  applyColorTheme(resumeData.color || 'blue');
  document.body.setAttribute('data-font', resumeData.font || 'sans');

  const tpl = resumeData.template || 'modern';

  if (tpl === 'executive') {
    renderExecutiveTemplate(sheet);
  } else if (tpl === 'minimal') {
    renderMinimalTemplate(sheet);
  } else if (tpl === 'creative') {
    renderCreativeTemplate(sheet);
  } else {
    renderModernTemplate(sheet);
  }

  calculateATSScore();
}

/* Template 1: Modern Tech Standard (Flexbox) */
function renderModernTemplate(sheet) {
  sheet.innerHTML = `
    <header class="res-header" style="display:flex; justify-content:space-between; align-items:flex-start;">
      <div style="flex:1;">
        <h1 class="res-header-name">${escapeHtml(resumeData.name || 'Candidate Name')}</h1>
        <h2 class="res-header-title">${escapeHtml(resumeData.title || 'Role Title')}</h2>
        <div class="res-contact-bar">
          ${renderContactItems()}
        </div>
      </div>
      ${resumeData.showAvatar && resumeData.avatar ? `
        <div style="flex-shrink:0; margin-left:1.5rem;">
          <img src="${escapeAttr(resumeData.avatar)}" style="width:75px; height:75px; border-radius:50%; object-fit:cover; border:2.5px solid var(--res-accent);" alt="Profile">
        </div>
      ` : ''}
    </header>

    <hr class="res-divider">

    ${resumeData.summary ? `
      <section class="res-section">
        <h3 class="res-section-title">Professional Summary</h3>
        <p class="res-summary-text">${escapeHtml(resumeData.summary)}</p>
      </section>
    ` : ''}

    ${resumeData.skills ? `
      <section class="res-section">
        <h3 class="res-section-title">Technical Skill Stack</h3>
        <div class="res-skills-cloud">
          ${renderSkillsBadges()}
        </div>
      </section>
    ` : ''}

    ${resumeData.experiences.length > 0 ? `
      <section class="res-section">
        <h3 class="res-section-title">Professional Experience</h3>
        ${renderExperienceEntries()}
      </section>
    ` : ''}

    ${resumeData.projects.length > 0 ? `
      <section class="res-section">
        <h3 class="res-section-title">Technical Projects</h3>
        ${renderProjectEntries()}
      </section>
    ` : ''}

    ${resumeData.education.length > 0 ? `
      <section class="res-section">
        <h3 class="res-section-title">Education & Credentials</h3>
        ${renderEducationEntries()}
      </section>
    ` : ''}

    ${resumeData.certifications.length > 0 ? `
      <section class="res-section">
        <h3 class="res-section-title">Certifications & Honors</h3>
        ${renderCertificationEntries()}
      </section>
    ` : ''}
  `;
}

/* Template 2: Executive Split (Flexbox 2-Column Sidebar Layout) */
function renderExecutiveTemplate(sheet) {
  sheet.innerHTML = `
    <div class="res-exec-sidebar">
      ${resumeData.showAvatar && resumeData.avatar ? `
        <div style="text-align:center; margin-bottom:0.5rem;">
          <img src="${escapeAttr(resumeData.avatar)}" style="width:85px; height:85px; border-radius:50%; object-fit:cover; border:2.5px solid var(--res-accent);" alt="Profile">
        </div>
      ` : ''}
      <div class="res-header">
        <h1 class="res-header-name">${escapeHtml(resumeData.name || 'Candidate Name')}</h1>
        <h2 class="res-header-title">${escapeHtml(resumeData.title || 'Role Title')}</h2>
      </div>

      <section class="res-section">
        <h3 class="res-section-title">Contact</h3>
        <div style="display:flex; flex-direction:column; gap:0.4rem; font-size:0.78rem; color:var(--res-text-muted);">
          ${renderContactItemsStacked()}
        </div>
      </section>

      ${resumeData.skills ? `
        <section class="res-section">
          <h3 class="res-section-title">Core Skills</h3>
          <div class="res-skills-cloud">
            ${renderSkillsBadges()}
          </div>
        </section>
      ` : ''}

      ${resumeData.education.length > 0 ? `
        <section class="res-section">
          <h3 class="res-section-title">Education</h3>
          ${renderEducationEntries()}
        </section>
      ` : ''}

      ${resumeData.certifications.length > 0 ? `
        <section class="res-section">
          <h3 class="res-section-title">Certifications</h3>
          ${renderCertificationEntries()}
        </section>
      ` : ''}
    </div>

    <div class="res-exec-main">
      ${resumeData.summary ? `
        <section class="res-section">
          <h3 class="res-section-title">Executive Overview</h3>
          <p class="res-summary-text">${escapeHtml(resumeData.summary)}</p>
        </section>
      ` : ''}

      ${resumeData.experiences.length > 0 ? `
        <section class="res-section">
          <h3 class="res-section-title">Work Experience</h3>
          ${renderExperienceEntries()}
        </section>
      ` : ''}

      ${resumeData.projects.length > 0 ? `
        <section class="res-section">
          <h3 class="res-section-title">Key Projects</h3>
          ${renderProjectEntries()}
        </section>
      ` : ''}
    </div>
  `;
}

/* Template 3: Minimalist ATS Classic (Flexbox Single-Column) */
function renderMinimalTemplate(sheet) {
  sheet.innerHTML = `
    <header class="res-header" style="text-align:center;">
      <h1 class="res-header-name">${escapeHtml(resumeData.name || 'Candidate Name')}</h1>
      <h2 class="res-header-title">${escapeHtml(resumeData.title || 'Role Title')}</h2>
      <div class="res-contact-bar" style="justify-content:center;">
        ${renderContactItems()}
      </div>
    </header>

    <hr class="res-divider">

    ${resumeData.summary ? `
      <section class="res-section">
        <h3 class="res-section-title">Summary</h3>
        <p class="res-summary-text">${escapeHtml(resumeData.summary)}</p>
      </section>
    ` : ''}

    ${resumeData.skills ? `
      <section class="res-section">
        <h3 class="res-section-title">Skills & Proficiencies</h3>
        <div style="font-size:0.85rem; line-height:1.6;">
          ${escapeHtml(resumeData.skills)}
        </div>
      </section>
    ` : ''}

    ${resumeData.experiences.length > 0 ? `
      <section class="res-section">
        <h3 class="res-section-title">Professional Experience</h3>
        ${renderExperienceEntries()}
      </section>
    ` : ''}

    ${resumeData.projects.length > 0 ? `
      <section class="res-section">
        <h3 class="res-section-title">Key Projects</h3>
        ${renderProjectEntries()}
      </section>
    ` : ''}

    ${resumeData.education.length > 0 ? `
      <section class="res-section">
        <h3 class="res-section-title">Education</h3>
        ${renderEducationEntries()}
      </section>
    ` : ''}

    ${resumeData.certifications.length > 0 ? `
      <section class="res-section">
        <h3 class="res-section-title">Certifications</h3>
        ${renderCertificationEntries()}
      </section>
    ` : ''}
  `;
}

/* Template 4: Creative Indigo (Flexbox Header Banner) */
function renderCreativeTemplate(sheet) {
  sheet.innerHTML = `
    <div class="res-creative-header" style="display:flex; justify-content:space-between; align-items:center;">
      <div>
        <h1 class="res-header-name">${escapeHtml(resumeData.name || 'Candidate Name')}</h1>
        <h2 class="res-header-title">${escapeHtml(resumeData.title || 'Role Title')}</h2>
        <div class="res-contact-bar">
          ${renderContactItems()}
        </div>
      </div>
      ${resumeData.showAvatar && resumeData.avatar ? `
        <div style="flex-shrink:0; margin-left:1.5rem;">
          <img src="${escapeAttr(resumeData.avatar)}" style="width:75px; height:75px; border-radius:50%; object-fit:cover; border:2.5px solid #ffffff;" alt="Profile">
        </div>
      ` : ''}
    </div>

    <div class="res-creative-body">
      ${resumeData.summary ? `
        <section class="res-section">
          <h3 class="res-section-title">Professional Profile</h3>
          <p class="res-summary-text">${escapeHtml(resumeData.summary)}</p>
        </section>
      ` : ''}

      ${resumeData.skills ? `
        <section class="res-section">
          <h3 class="res-section-title">Core Competencies</h3>
          <div class="res-skills-cloud">
            ${renderSkillsBadges()}
          </div>
        </section>
      ` : ''}

      ${resumeData.experiences.length > 0 ? `
        <section class="res-section">
          <h3 class="res-section-title">Experience & Career</h3>
          ${renderExperienceEntries()}
        </section>
      ` : ''}

      ${resumeData.projects.length > 0 ? `
        <section class="res-section">
          <h3 class="res-section-title">Featured Projects</h3>
          ${renderProjectEntries()}
        </section>
      ` : ''}

      ${resumeData.education.length > 0 ? `
        <section class="res-section">
          <h3 class="res-section-title">Education</h3>
          ${renderEducationEntries()}
        </section>
      ` : ''}

      ${resumeData.certifications.length > 0 ? `
        <section class="res-section">
          <h3 class="res-section-title">Certifications</h3>
          ${renderCertificationEntries()}
        </section>
      ` : ''}
    </div>
  `;
}

/* Contact Renderers */
function renderContactItems() {
  const parts = [];
  if (resumeData.email) parts.push(`<span class="res-contact-item">✉ ${escapeHtml(resumeData.email)}</span>`);
  if (resumeData.phone) parts.push(`<span class="res-contact-item">📞 ${escapeHtml(resumeData.phone)}</span>`);
  if (resumeData.location) parts.push(`<span class="res-contact-item">📍 ${escapeHtml(resumeData.location)}</span>`);
  if (resumeData.links) parts.push(`<span class="res-contact-item">🔗 ${escapeHtml(resumeData.links)}</span>`);
  return parts.join(' • ');
}

function renderContactItemsStacked() {
  const parts = [];
  if (resumeData.email) parts.push(`<div>✉ ${escapeHtml(resumeData.email)}</div>`);
  if (resumeData.phone) parts.push(`<div>📞 ${escapeHtml(resumeData.phone)}</div>`);
  if (resumeData.location) parts.push(`<div>📍 ${escapeHtml(resumeData.location)}</div>`);
  if (resumeData.links) parts.push(`<div>🔗 ${escapeHtml(resumeData.links)}</div>`);
  return parts.join('');
}

function renderSkillsBadges() {
  if (!resumeData.skills) return '';
  return resumeData.skills.split(',').map(s => {
    const clean = s.trim();
    return clean ? `<span class="res-skill-tag">${escapeHtml(clean)}</span>` : '';
  }).join('');
}

function renderExperienceEntries() {
  return resumeData.experiences.map(exp => `
    <div class="res-entry">
      <div class="res-entry-head">
        <span class="res-entry-title">${escapeHtml(exp.role || 'Role Title')}</span>
        <span class="res-entry-date">${escapeHtml(exp.startDate || '')} – ${escapeHtml(exp.endDate || 'Present')}</span>
      </div>
      <div class="res-entry-head">
        <span class="res-entry-subtitle">${escapeHtml(exp.company || 'Company')}</span>
        <span class="res-entry-location">${escapeHtml(exp.location || '')}</span>
      </div>
      <ul class="res-bullets-list">
        ${renderBulletsList(exp.bullets)}
      </ul>
    </div>
  `).join('');
}

function renderProjectEntries() {
  return resumeData.projects.map(proj => `
    <div class="res-entry">
      <div class="res-entry-head">
        <span class="res-entry-title">${escapeHtml(proj.title || 'Project Name')}</span>
        ${proj.link ? `<span class="res-entry-location">🔗 ${escapeHtml(proj.link)}</span>` : ''}
      </div>
      ${proj.tech ? `<div class="res-entry-subtitle" style="font-size:0.8rem; font-weight:500;">Tech: ${escapeHtml(proj.tech)}</div>` : ''}
      <ul class="res-bullets-list">
        ${renderBulletsList(proj.bullets)}
      </ul>
    </div>
  `).join('');
}

function renderEducationEntries() {
  return resumeData.education.map(edu => `
    <div class="res-entry" style="margin-bottom:0.55rem;">
      <div class="res-entry-head">
        <span class="res-entry-title">${escapeHtml(edu.degree || 'Degree Title')}</span>
        <span class="res-entry-date">${escapeHtml(edu.year || '')}</span>
      </div>
      <div class="res-entry-head">
        <span class="res-entry-subtitle">${escapeHtml(edu.school || 'University')}</span>
        <span class="res-entry-location">${escapeHtml(edu.location || '')}</span>
      </div>
      ${edu.gpa ? `<div style="font-size:0.8rem; color:var(--res-text-muted);">${escapeHtml(edu.gpa)}</div>` : ''}
    </div>
  `).join('');
}

function renderCertificationEntries() {
  return resumeData.certifications.map(cert => `
    <div class="res-entry" style="margin-bottom:0.4rem;">
      <div class="res-entry-head">
        <span class="res-entry-title" style="font-size:0.86rem;">${escapeHtml(cert.title || 'Certification Title')}</span>
        <span class="res-entry-date">${escapeHtml(cert.year || '')}</span>
      </div>
      <div class="res-entry-subtitle" style="font-size:0.8rem; font-weight:500;">${escapeHtml(cert.issuer || '')}</div>
    </div>
  `).join('');
}

function renderBulletsList(raw) {
  if (!raw) return '';
  return raw.split('\n').map(line => {
    const clean = line.replace(/^[•\-\*\s]+/, '').trim();
    return clean ? `<li>${escapeHtml(clean)}</li>` : '';
  }).join('');
}

/* ==========================================================================
   Themes, Fonts, & Zoom
   ========================================================================== */
const COLOR_PALETTES = {
  blue: { primary: '#1e3a8a', accent: '#2563eb' },
  emerald: { primary: '#064e3b', accent: '#059669' },
  purple: { primary: '#4c1d95', accent: '#7c3aed' },
  amber: { primary: '#78350f', accent: '#d97706' },
  rose: { primary: '#881337', accent: '#e11d48' },
  slate: { primary: '#0f172a', accent: '#334155' }
};

function selectColorTheme(colorName) {
  resumeData.color = colorName;
  saveCurrentResume();
  applyColorTheme(colorName);
  renderColorPickerActiveState();
  toast(`Selected ${colorName.toUpperCase()} color scheme.`, 'info');
}

function applyColorTheme(colorName) {
  const palette = COLOR_PALETTES[colorName] || COLOR_PALETTES.blue;
  const sheet = document.getElementById('resume-document');
  if (sheet) {
    sheet.style.setProperty('--res-primary', palette.primary);
    sheet.style.setProperty('--res-accent', palette.accent);
  }
}

function renderColorPickerActiveState() {
  document.querySelectorAll('.color-dot').forEach(dot => {
    dot.classList.toggle('active', dot.dataset.color === (resumeData.color || 'blue'));
  });
}

function changeTemplate(tplName) {
  resumeData.template = tplName;
  saveCurrentResume();
  renderLivePreview();
  toast(`Switched to ${tplName.toUpperCase()} template.`, 'success');
}

function changeFont(fontName) {
  resumeData.font = fontName;
  saveCurrentResume();
  document.body.setAttribute('data-font', fontName);
  renderLivePreview();
}

function setZoom(val) {
  currentZoom = Math.min(Math.max(val, 0.5), 1.5);
  const sheet = document.getElementById('resume-document');
  const label = document.getElementById('zoom-label');
  if (sheet) sheet.style.transform = `scale(${currentZoom})`;
  if (label) label.innerText = `${Math.round(currentZoom * 100)}%`;
}

function resetZoom() {
  setZoom(1.0);
}

/* ==========================================================================
   Real-Time ATS Keyword Match & Gap Analysis
   ========================================================================== */
const ATS_STOP_WORDS = new Set([
  'and', 'the', 'to', 'a', 'of', 'in', 'for', 'with', 'on', 'at', 'an', 'is', 'or', 'as', 
  'be', 'are', 'this', 'that', 'you', 'we', 'will', 'have', 'from', 'by', 'about', 'can', 
  'our', 'their', 'must', 'should', 'all', 'any', 'has', 'more', 'work', 'working', 'team'
]);

function calculateATSScore() {
  const jdInput = document.getElementById('job-description-input');
  const badge = document.getElementById('ats-score-text');
  const progressBar = document.getElementById('ats-progress-bar');
  const chipsContainer = document.getElementById('ats-keyword-chips');
  if (!jdInput || !badge) return;

  const jdText = jdInput.value.toLowerCase();
  if (!jdText.trim()) {
    badge.innerText = '0% Match';
    badge.style.background = 'rgba(6, 182, 212, 0.15)';
    badge.style.color = 'var(--accent-cyan)';
    if (progressBar) progressBar.style.width = '0%';
    if (chipsContainer) chipsContainer.innerHTML = '<span style="color:var(--text-dim); font-size:0.75rem;">Paste a Job Description to scan keywords.</span>';
    return;
  }

  const resumeTokens = [
    resumeData.name,
    resumeData.title,
    resumeData.summary,
    resumeData.skills,
    ...resumeData.experiences.map(e => `${e.role} ${e.company} ${e.bullets}`),
    ...resumeData.projects.map(p => `${p.title} ${p.tech} ${p.bullets}`),
    ...resumeData.education.map(ed => `${ed.degree} ${ed.school}`),
    ...resumeData.certifications.map(c => `${c.title} ${c.issuer}`)
  ].join(' ').toLowerCase();

  const jdWords = Array.from(new Set(
    jdText.match(/\b[a-z][a-z0-9+.#]{2,}\b/g) || []
  )).filter(w => !ATS_STOP_WORDS.has(w));

  let matched = [];
  let missing = [];

  jdWords.forEach(word => {
    if (resumeTokens.includes(word)) {
      matched.push(word);
    } else {
      missing.push(word);
    }
  });

  const rawScore = jdWords.length > 0 ? Math.round((matched.length / jdWords.length) * 100) : 0;
  const finalScore = Math.min(Math.max(rawScore, 5), 98);

  badge.innerText = `${finalScore}% Match`;
  if (progressBar) progressBar.style.width = `${finalScore}%`;

  if (finalScore >= 75) {
    badge.style.background = 'rgba(16, 185, 129, 0.2)';
    badge.style.color = '#34d399';
  } else if (finalScore >= 45) {
    badge.style.background = 'rgba(245, 158, 11, 0.2)';
    badge.style.color = '#fbbf24';
  } else {
    badge.style.background = 'rgba(239, 68, 68, 0.2)';
    badge.style.color = '#f87171';
  }

  if (chipsContainer) {
    chipsContainer.innerHTML = '';
    matched.slice(0, 5).forEach(m => {
      const chip = document.createElement('span');
      chip.className = 'chip-match';
      chip.innerText = `✓ ${m}`;
      chipsContainer.appendChild(chip);
    });
    missing.slice(0, 6).forEach(m => {
      const chip = document.createElement('span');
      chip.className = 'chip-missing';
      chip.title = 'Click to add to your skills!';
      chip.innerHTML = `+ ${m}`;
      chip.onclick = () => addSkillToResume(m);
      chipsContainer.appendChild(chip);
    });
  }
}

/* ==========================================================================
   PDF Vector Export Engine
   ========================================================================== */
function exportPDF() {
  const element = document.getElementById('resume-document');
  if (!element) return;

  if (typeof html2pdf === 'undefined') {
    window.print();
    return;
  }

  toast('Rendering vector-grade A4 PDF...', 'info');

  const opt = {
    margin: 0,
    filename: `${(resumeData.name || 'Resume').replace(/\s+/g, '_')}_Document.pdf`,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true, letterRendering: true },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
  };

  html2pdf().set(opt).from(element).save().then(() => {
    toast('PDF downloaded successfully!', 'success');
  }).catch(err => {
    console.error('PDF generation error', err);
    toast('Failed to render PDF directly. Opening print dialog...', 'error');
    window.print();
  });
}

function exportJSONBackup() {
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(resumeData, null, 2));
  const dlAnchor = document.createElement('a');
  dlAnchor.setAttribute("href", dataStr);
  dlAnchor.setAttribute("download", `${(resumeData.name || 'resume').replace(/\s+/g, '_')}_backup.json`);
  dlAnchor.click();
  toast('Downloaded resume backup JSON.', 'success');
}

function importJSONBackup(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const parsed = JSON.parse(e.target.result);
      resumeData = { ...DEFAULT_RESUME_DATA, ...parsed };
      saveCurrentResume();
      populateFormFields();
      renderLivePreview();
      toast('Resume data imported successfully!', 'success');
    } catch (err) {
      toast('Invalid JSON file format.', 'error');
    }
  };
  reader.readAsText(file);
}

function loadSampleData() {
  if (confirm('Load sample Alex Morgan (Senior Full Stack Engineer) resume?')) {
    resumeData = JSON.parse(JSON.stringify(DEFAULT_RESUME_DATA));
    saveCurrentResume();
    populateFormFields();
    renderLivePreview();
    toast('Loaded full developer profile.', 'success');
  }
}

function clearAllData() {
  if (confirm('Clear all resume fields to start from scratch?')) {
    resumeData = {
      id: resumeData.id,
      name: '',
      title: '',
      avatar: '',
      showAvatar: false,
      email: '',
      phone: '',
      location: '',
      links: '',
      summary: '',
      skills: '',
      template: resumeData.template || 'modern',
      color: resumeData.color || 'blue',
      font: resumeData.font || 'sans',
      experiences: [],
      education: [],
      projects: [],
      certifications: []
    };
    saveCurrentResume();
    populateFormFields();
    renderLivePreview();
    toast('Cleared all resume data.', 'info');
  }
}

function escapeHtml(s) {
  return (s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function escapeAttr(s) {
  return escapeHtml(s).replace(/"/g, '&quot;');
}

// Global Initialization
window.addEventListener('DOMContentLoaded', () => {
  const urlParamTpl = new URLSearchParams(window.location.search).get('template');
  if (urlParamTpl) {
    resumeData.template = urlParamTpl;
  }

  populateFormFields();
  renderLivePreview();
  updateAiStatusIndicator();

  const inputIds = ['in-name', 'in-title', 'in-email', 'in-phone', 'in-location', 'in-links', 'in-summary', 'in-skills'];
  inputIds.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('input', syncHeaderFromInputs);
  });

  const jdInput = document.getElementById('job-description-input');
  if (jdInput) jdInput.addEventListener('input', calculateATSScore);
});
