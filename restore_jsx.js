const fs = require('fs');

const missingJsx = `
              <select className="dropdown-select" value={selectedModel} onChange={(e) => setSelectedModel(e.target.value)}>
                <optgroup label="Google Gemini">
                  <option value="gemini-1.5-flash">Gemini 1.5 Flash (Fast & Recommended)</option>
                  <option value="gemini-2.0-flash">Gemini 2.0 Flash (Ultra Low Latency)</option>
                  <option value="gemini-1.5-pro">Gemini 1.5 Pro (Deep Reasoning)</option>
                </optgroup>
                <optgroup label="Groq (Requires Groq API Key)">
                  <option value="llama-3.3-70b-versatile">Llama 3.3 70B Versatile</option>
                </optgroup>
              </select>
            </div>
            <div className="form-group">
              <label>API Key</label>
              <input type="password" placeholder="AIzaSy..." value={apiKey} onChange={(e) => setApiKey(e.target.value)} />
            </div>
            <div className="modal-actions">
              <button className="btn btn-glass btn-sm" onClick={() => setShowApiKeyModal(false)}>Cancel</button>
              <button className="btn btn-glow btn-sm" onClick={() => {
                localStorage.setItem('gemini_api_key', apiKey.trim());
                localStorage.setItem('gemini_selected_model', selectedModel);
                setShowApiKeyModal(false);
                toast(apiKey ? 'Connected to Gemini AI!' : 'Offline AI active.');
              }}>Save & Connect</button>
            </div>
          </div>
        </div>
      )}

      <footer className="site-footer">
        <div className="flex flex-col gap-xs">
          <div className="logo" style={{ fontSize: '1.1rem' }}>
            <div className="logo-badge" style={{ width: '24px', height: '24px' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="white"/>
                <path d="M2 17L12 22L22 17M2 12L12 17L22 12" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div> Smart<span className="highlight">Resume AI</span>
          </div>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>High-Performance AI Resume Engineering & ATS Optimization Platform.</p>
        </div>
        <div className="footer-links">
          <a onClick={() => setCurrentView('home')}>Home</a>
          <a onClick={() => setCurrentView('templates')}>Templates</a>
          <a onClick={() => setCurrentView('studio')}>AI Studio</a>
          <a onClick={() => setCurrentView('login')}>Sign In</a>
        </div>
      </footer>
    </div>
  );
}

// ----------------- Home View Component (Flexbox) -----------------
function HomeView({ onOpenStudio, onSelectTemplate }) {
  return (
    <div className="flex flex-col items-center">
      <section className="hero-section">
        <div className="hero-content">
          <div className="badge-wrapper">
            <span className="badge"><span className="pulse"></span> Powered by Google Gemini AI & Real-time ATS Analytics</span>
          </div>
          <h1>Build ATS-Optimized Resumes <br/><span className="gradient-text">In Seconds with AI</span></h1>
          <p>Transform raw experience notes into high-impact, metric-driven bullet points using Google's XYZ formula. Scan job descriptions in real-time, customize 4+ templates, and download vector A4 PDFs without watermarks.</p>
          <div className="hero-buttons">
            <button className="btn btn-glow" onClick={onOpenStudio}>Launch AI Studio 🚀</button>
            <button className="btn btn-glass" onClick={() => onSelectTemplate('modern')}>Explore 4+ Templates 🎨</button>
          </div>
        </div>
        <div className="hero-image-wrapper">
          <img src="assets/images/hero-ai-preview.jpg" alt="AI Resume Builder Interface" />
          <div className="hero-image-caption">
            <div className="flex items-center gap-sm">
              <span className="pulse"></span>
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#f8fafc' }}>Next-Gen AI Resume Engine with Live ATS Telemetry</span>
            </div>
            <button className="btn btn-glow btn-sm" onClick={onOpenStudio}>Try Live Demo →</button>
          </div>
        </div>
      </section>
      
      <section className="stats-section">
        <div className="stat-box">
          <h3 className="gradient-text">99.4%</h3>
          <p>ATS Parser Match Rate</p>
        </div>
        <div className="stat-box">
          <h3 className="gradient-text">&lt; 15ms</h3>
          <p>Instant Client NLP Speed</p>
        </div>
        <div className="stat-box">
          <h3 className="gradient-text">100%</h3>
          <p>Private & Client-Side</p>
        </div>
        <div className="stat-box">
          <h3 className="gradient-text">Vector</h3>
          <p>Crisp A4 Printable PDF</p>
        </div>
      </section>

      <section className="features-section">
        <h2 className="section-title">Engineered for Technical High-Achievers</h2>
        <p className="section-subtitle">Everything you need to craft high-converting resumes that breeze through Automated Tracking Systems (ATS) and impress engineering hiring managers.</p>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">🧠</div>
            <h3>XYZ Bullet Generation</h3>
            <p>Automatically rewrite passive job duties into quantifiable achievements using the Google XYZ framework (Accomplished [X] as measured by [Y], by doing [Z]).</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🎯</div>
            <h3>Real-time ATS Scoring</h3>
            <p>Paste a Job Description and watch your match score update live. Identifies missing keywords and highlights high-impact terms.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🎨</div>
            <h3>React Component Templates</h3>
            <p>Our templates aren't dumb HTML. They are responsive React components that elegantly reflow your content to fit exactly on A4 pages without overflow.</p>
          </div>
        </div>
      </section>
    </div>
  );
}

// ----------------- Templates View (Flexbox) -----------------
function TemplatesView({ onSelectTemplate, templates }) {
  const [filter, setFilter] = React.useState('all');
  const [search, setSearch] = React.useState('');

  const categories = Array.from(new Set(templates.map(t => t.category))).filter(Boolean);

  const filtered = templates.filter(t => {
    if (filter !== 'all' && t.category !== filter) return false;
    if (search && !t.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <main className="templates-section">
      <div className="section-header" style={{ textAlign: 'center', margin: '1rem auto 2.5rem', maxWidth: '650px' }}>
        <h1 className="section-title">Engineered for ATS Parsers & Recruiters</h1>
        <p className="section-subtitle">Your resume data carries over automatically between templates without losing a single word. Pick a style to launch directly into the AI Studio.</p>
      </div>
      
      <div className="filter-wrapper" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center' }}>
        <input 
          type="text" 
          placeholder="Search templates..." 
          value={search} 
          onChange={e => setSearch(e.target.value)} 
          style={{ padding: '0.5rem 1rem', borderRadius: '4px', border: '1px solid var(--border)', background: 'var(--bg-elevated)', color: 'var(--text)', width: '100%', maxWidth: '400px' }}
        />
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', justifyContent: 'center' }}>
          <button className={\`filter-btn \${filter === 'all' ? 'active' : ''}\`} onClick={() => setFilter('all')}>All Categories</button>
          {categories.map(c => (
            <button key={c} className={\`filter-btn \${filter === c ? 'active' : ''}\`} onClick={() => setFilter(c)}>{c}</button>
          ))}
        </div>
      </div>

      <div className="templates-grid">
        {filtered.map(t => (
          <div key={t.id} className="template-card" onClick={() => onSelectTemplate(t.id)}>
            <div className="template-mockup">
              <div className="mock-document">
                <div className="mock-header" style={{ width: '60%', marginBottom: '1rem' }}></div>
                <div className="mock-line"></div>
                <div className="mock-line w-80"></div>
                <div className="mock-header" style={{ width: '40%', marginTop: '1rem' }}></div>
                <div className="mock-line w-60"></div>
                <div className="mock-line" style={{ width: '100%', marginBottom: '0.8rem' }}></div>
                <div className="mock-header"></div>
                <div className="mock-line"></div>
                <div className="mock-line w-80"></div>
                <div className="mock-line w-60"></div>
              </div>
            </div>
            <div className="card-details">
              <span className={\`badge-tag \${t.badgeColor || 'indigo'}\`}>{t.category}</span>
              <h3>{t.name}</h3>
              <p>{t.description || t.desc}</p>
              <div className="feature-pills">
                {t.pills && t.pills.map((p, i) => (
                  <span key={i}>✓ {p}</span>
                ))}
              </div>
              <button className="btn btn-glow btn-full" onClick={(e) => { e.stopPropagation(); onSelectTemplate(t.id); }}>Apply & Edit in Studio 🚀</button>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}

// ----------------- Auth / Login View (Flexbox) -----------------
function LoginView({ onLoginSuccess }) {
  return (
    <main className="flex justify-center items-center" style={{ flex: 1, padding: '3rem 1.5rem' }}>
      <div className="glass-card auth-card">
        <div className="auth-header">
          <h2>Welcome to AI Studio (Demo)</h2>
          <p>This is a local demo. Sign in or continue as guest to access your local workspace.</p>
        </div>
        <form className="auth-form" onSubmit={(e) => { e.preventDefault(); onLoginSuccess(); }}>
          <div className="form-group">
            <label>Email Address</label>
            <input type="email" defaultValue="alex.morgan@devstudio.io" required />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input type="password" defaultValue="password123" required />
          </div>
          <button type="submit" className="btn btn-glow btn-full">Sign In to Studio 🚀</button>
        </form>
        <div className="auth-divider"><span>OR</span></div>
        <button className="btn btn-glass btn-full" onClick={onLoginSuccess}>🌐 Continue as Guest</button>
      </div>
    </main>
  );
}

// ----------------- Studio Workspace Component (Pure Flexbox) -----------------
function StudioView({
  resume,
  setResume,
  resumes,
  activeResumeId,
  onSwitchResume,
  onCreateResume,
  onDuplicateResume,
  onDeleteResume,
  zoom,
  setZoom,
  jobDescription,
  setJobDescription,
  atsScore,
  matchedKeywords,
  missingKeywords,
  atsWarnings,
  onAddSkill,
  onGenerateSummary,
  onEnhanceBullets,
  onExportPDF,
  isGenerating,
  onOpenApiKeyModal,
  palette,
  templates,
  fonts,
  writingStyles
}) {
  return (
    <div className="flex flex-col" style={{ width: '100%' }}>
      <div className="studio-header">
        <div className="studio-brand">
          <select className="dropdown-select" value={resume.id} onChange={e => onSwitchResume(e.target.value)}>
            {resumes.map(r => (
              <option key={r.id} value={r.id}>📄 {r.name || 'Untitled'} ({r.title || 'Draft'})</option>
            ))}
          </select>
          <button className="btn btn-glass btn-sm" onClick={onCreateResume}>+ New</button>
          <button className="btn btn-glass btn-sm" onClick={onDuplicateResume}>📑 Duplicate</button>
          <button className="btn btn-glass btn-sm" style={{ color: '#f87171' }} onClick={onDeleteResume}>🗑️</button>
        </div>
        <div className="studio-toolbar">
`;

let jsx = fs.readFileSync('app-react.jsx', 'utf8');
const badStartStr = '<label>AI Provider & Model</label>';
const badStartIndex = jsx.indexOf(badStartStr);
const badEndIndex = jsx.indexOf('<div className="color-picker-group">');

if (badStartIndex > -1 && badEndIndex > -1) {
    const before = jsx.substring(0, badStartIndex + badStartStr.length);
    const after = jsx.substring(badEndIndex);
    
    const dropdowns = `
          <select 
            className="dropdown-select" 
            value={resume.template} 
            onChange={(e) => setResume({ ...resume, template: e.target.value })}
          >
            {templates.map(t => (
              <option key={t.id} value={t.id}>📄 {t.name}</option>
            ))}
          </select>

          <select 
            className="dropdown-select" 
            value={resume.writingStyle || 'professional'} 
            onChange={(e) => setResume({ ...resume, writingStyle: e.target.value })}
          >
            {writingStyles.map(s => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>

          <select 
            className="dropdown-select" 
            value={resume.font} 
            onChange={(e) => setResume({ ...resume, font: e.target.value })}
          >
            {fonts.map(f => (
              <option key={f.id} value={f.id}>{f.name} ({f.category})</option>
            ))}
          </select>
          `;

    const newJsx = before + "\\n" + missingJsx + dropdowns + "\\n          " + after;
    fs.writeFileSync('app-react.jsx', newJsx);
    console.log("Restored missing code! Check compilation.");
} else {
    console.log("Could not find boundaries.");
}
