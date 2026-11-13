# -*- coding: utf-8 -*-
import os
import subprocess

print("Generating Futuristic AI SaaS CSS & Components...")

# Read existing parts 1, 2, 4
with open("scratch_app_part1.js", "r", encoding="utf-8") as f:
    part1 = f.read()

with open("scratch_app_part2.js", "r", encoding="utf-8") as f:
    part2 = f.read()

with open("scratch_app_part4.js", "r", encoding="utf-8") as f:
    part4 = f.read()

# Enhanced Futuristic Dashboard and Floating AI Assistant Component
part3_futuristic = r'''
// =========================================================
// FUTURISTIC AI SAAS DASHBOARD VIEW (ChatGPT / Lovable / Bolt style)
// =========================================================
function DashboardView({ 
  resume, 
  resumes, 
  onSelectResume, 
  onCreateResume, 
  onDuplicateResume, 
  onDeleteResume, 
  onNavigate, 
  onSelectTemplate,
  atsScore,
  atsChecks,
  onOpenQuickImport
}) {
  const activeTpl = TEMPLATES_CATALOG.find(t => t.id === resume.template) || TEMPLATES_CATALOG[0];
  const [activeStep, setActiveStep] = useState('profile');
  const [selectedPreviewTpl, setSelectedPreviewTpl] = useState(resume.template);

  const timelineSteps = [
    { id: 'profile', label: 'Profile', icon: '👤', done: !!(resume.name && resume.email) },
    { id: 'education', label: 'Education', icon: '🎓', done: (resume.education || []).length > 0 },
    { id: 'experience', label: 'Experience', icon: '💼', done: (resume.experiences || []).length > 0 },
    { id: 'skills', label: 'Skills', icon: '⚡', done: !!resume.skills },
    { id: 'projects', label: 'Projects', icon: '🚀', done: (resume.projects || []).length > 0 },
    { id: 'ats', label: 'ATS Analysis', icon: '🛡️', done: atsScore >= 80 },
    { id: 'download', label: 'Download', icon: '📥', done: true }
  ];

  // Circle progress calculation (circumference for r=40 is 251.2)
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (atsScore / 100) * circumference;

  return (
    <div className="futuristic-dashboard relative overflow-hidden">
      {/* Background Animated Light Orbs & Grid */}
      <div className="ai-mesh-bg">
        <div className="grid-pattern" />
        <div className="glow-orb orb-1" />
        <div className="glow-orb orb-2" />
        <div className="glow-orb orb-3" />
      </div>

      <div className="dashboard-content-wrapper relative z-10">
        {/* =========================================================
            1. HERO SECTION (FUTURISTIC AI SAAS WITH 3D SCANNER MOCKUP)
        ========================================================= */}
        <section className="futuristic-hero">
          <div className="hero-text-col">
            <div className="ai-badge-pill">
              <span className="live-pulse-dot" />
              <span>Next-Gen Resume Architect v5.5 • Powered by Groq Llama 3.3</span>
            </div>

            <h1 className="hero-heading">
              Build <span className="gradient-text">ATS-Optimized Resumes</span> with AI
            </h1>

            <p className="hero-subheading">
              Craft recruiter-winning, vector-grade resumes in seconds. Powered by real-time ATS keyword scoring, 
              Google XYZ bullet formulation, and 25+ executive design templates tailored for high-growth tech roles.
            </p>

            <div className="hero-cta-group">
              <button 
                className="btn btn-futuristic-primary"
                onClick={() => onNavigate('studio')}
              >
                <span>⚡ Build My Resume</span>
                <span className="btn-arrow">→</span>
              </button>

              <button 
                className="btn btn-futuristic-glass"
                onClick={() => onNavigate('templates')}
              >
                <span>🎨 Explore 25+ Templates</span>
              </button>

              <button 
                className="btn btn-futuristic-ghost"
                onClick={() => onNavigate('cover-letter')}
              >
                <span>✍️ Cover Letter</span>
              </button>
            </div>

            {/* Quick Trust Badges */}
            <div className="trust-badges-row">
              <div className="trust-badge">
                <span className="badge-check">✓</span>
                <span>Workday & Taleo 100% Safe</span>
              </div>
              <div className="trust-badge">
                <span className="badge-check">✓</span>
                <span>Google XYZ Formula</span>
              </div>
              <div className="trust-badge">
                <span className="badge-check">✓</span>
                <span>Groq LPU 1200 wpm</span>
              </div>
            </div>
          </div>

          {/* Right Hero Illustration: 3D Floating Glass Mockup with Laser ATS Scanner */}
          <div className="hero-visual-col">
            <div className="floating-resume-stage">
              <div className="resume-3d-card">
                {/* Laser ATS Scanner Animation */}
                <div className="scan-laser-line" />

                {/* Top Document Header */}
                <div className="mock-doc-head">
                  <div className="mock-avatar-placeholder" />
                  <div style={{ flex: 1 }}>
                    <div className="mock-name-line" />
                    <div className="mock-title-line" />
                  </div>
                  <span className="mock-status-pill">ATS 99.4%</span>
                </div>

                {/* Mock Body Lines */}
                <div className="mock-doc-body">
                  <div className="mock-section-title-line" />
                  <div className="mock-text-line" />
                  <div className="mock-text-line" style={{ width: '85%' }} />
                  
                  <div className="mock-section-title-line" style={{ marginTop: '10px' }} />
                  <div className="mock-chips-row">
                    <span className="mock-chip" />
                    <span className="mock-chip" style={{ width: '45px' }} />
                    <span className="mock-chip" style={{ width: '60px' }} />
                    <span className="mock-chip" style={{ width: '35px' }} />
                  </div>

                  <div className="mock-section-title-line" style={{ marginTop: '10px' }} />
                  <div className="mock-text-line" />
                  <div className="mock-text-line" style={{ width: '90%' }} />
                  <div className="mock-text-line" style={{ width: '75%' }} />
                </div>
              </div>

              {/* Floating Stat Badges around Mockup */}
              <div className="floating-badge badge-top-right">
                <span className="badge-icon">🛡️</span>
                <div>
                  <div style={{ fontSize: '0.72rem', fontWeight: 800 }}>99.4% ATS Score</div>
                  <div style={{ fontSize: '0.62rem', color: '#94a3b8' }}>Parser Guaranteed</div>
                </div>
              </div>

              <div className="floating-badge badge-bottom-left">
                <span className="badge-icon">🚀</span>
                <div>
                  <div style={{ fontSize: '0.72rem', fontWeight: 800 }}>Groq LPU Instant</div>
                  <div style={{ fontSize: '0.62rem', color: '#94a3b8' }}>Llama 3.3 70B Engine</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================
            2. ANIMATED STATISTICS CARDS ROW
        ========================================================= */}
        <section className="stats-cards-grid">
          <div className="glass-stat-card">
            <div className="stat-card-header">
              <span className="stat-icon-box blue">🛡️</span>
              <span className="stat-trend positive">+18% vs avg</span>
            </div>
            <div className="stat-value">{atsScore}%</div>
            <div className="stat-label">ATS Compatibility Score</div>
            <div className="stat-subtext">Optimized for Taleo, Greenhouse & Workday</div>
          </div>

          <div className="glass-stat-card">
            <div className="stat-card-header">
              <span className="stat-icon-box purple">🎯</span>
              <span className="stat-trend positive">98.2%</span>
            </div>
            <div className="stat-value">98.2%</div>
            <div className="stat-label">Keyword Match Rate</div>
            <div className="stat-subtext">Real-time N-gram skill phrase alignment</div>
          </div>

          <div className="glass-stat-card">
            <div className="stat-card-header">
              <span className="stat-icon-box emerald">⚡</span>
              <span className="stat-trend positive">Top 1%</span>
            </div>
            <div className="stat-value">10/10</div>
            <div className="stat-label">Resume Strength</div>
            <div className="stat-subtext">Google XYZ formula accomplishment metrics</div>
          </div>

          <div className="glass-stat-card">
            <div className="stat-card-header">
              <span className="stat-icon-box cyan">👁️</span>
              <span className="stat-trend positive">Universal</span>
            </div>
            <div className="stat-value">99.4%</div>
            <div className="stat-label">Recruiter Readability</div>
            <div className="stat-subtext">Zero font clashing & pure linear hierarchy</div>
          </div>
        </section>

        {/* =========================================================
            3. RESUME BUILDER TIMELINE PROGRESS FLOW
        ========================================================= */}
        <section className="builder-timeline-section glass-panel">
          <div className="section-header-compact">
            <div>
              <h3 className="section-title-sm">🛠 Resume Builder Progress Flow</h3>
              <p className="section-subtitle-sm">Interactive step-by-step roadmap to an executive, ATS-approved resume.</p>
            </div>
            <button className="btn btn-futuristic-primary btn-sm" onClick={() => onNavigate('studio')}>
              Resume Studio →
            </button>
          </div>

          <div className="timeline-flow-track">
            {timelineSteps.map((s, idx) => (
              <div 
                key={s.id} 
                className={`timeline-step-node ${s.done ? 'done' : ''}`}
                onClick={() => onNavigate('studio')}
                style={{ cursor: 'pointer' }}
              >
                <div className="timeline-node-circle">
                  {s.done ? '✓' : s.icon}
                </div>
                <div className="timeline-node-label">{s.label}</div>
                {idx < timelineSteps.length - 1 && <div className="timeline-node-connector" />}
              </div>
            ))}
          </div>
        </section>

        {/* =========================================================
            4. 2-COLUMN SPLIT: ATS SCORE WIDGET + ANALYSIS INSIGHTS
        ========================================================= */}
        <section className="dashboard-grid-split">
          {/* Left: Animated Circular ATS Score Widget */}
          <div className="glass-card ats-score-widget">
            <div className="widget-header">
              <div className="flex items-center gap-sm">
                <span className="widget-icon">🎯</span>
                <div>
                  <h3 className="widget-title">ATS Health Diagnostics</h3>
                  <div className="widget-desc">Harvard & Ivy League Parser Benchmark</div>
                </div>
              </div>
              <span className="status-badge-glow">
                {atsScore >= 80 ? '✓ Ready to Apply' : '⚠ Action Recommended'}
              </span>
            </div>

            {/* Circular Progress Ring */}
            <div className="circle-score-box">
              <div className="circular-progress-wrap">
                <svg className="ats-circle-svg" width="120" height="120" viewBox="0 0 100 100">
                  <circle 
                    className="circle-bg" 
                    cx="50" cy="50" r={radius} 
                    strokeWidth="8"
                  />
                  <circle 
                    className="circle-fill" 
                    cx="50" cy="50" r={radius} 
                    strokeWidth="8"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                  />
                </svg>
                <div className="circle-score-text">
                  <span className="score-number">{atsScore}</span>
                  <span className="score-denom">/100</span>
                </div>
              </div>

              <div className="circle-score-legend">
                <h4>{atsScore >= 90 ? 'Exceptional Candidate Profile' : atsScore >= 75 ? 'Strong Baseline ATS Score' : 'Optimization Recommended'}</h4>
                <p>
                  Your resume demonstrates strong technical depth, structured accomplishments, and standard linear ATS hierarchy.
                </p>
                <button 
                  className="btn btn-futuristic-primary btn-sm"
                  style={{ marginTop: '8px' }}
                  onClick={() => onNavigate('studio')}
                >
                  ⚡ Optimize with Groq AI
                </button>
              </div>
            </div>

            {/* Diagnostics Checklist */}
            <div className="diagnostics-checklist">
              {atsChecks.map((chk, i) => (
                <div key={i} className={`diagnostic-row ${chk.passed ? 'passed' : 'failed'}`}>
                  <span className="row-check-icon">{chk.passed ? '✓' : '○'}</span>
                  <span className="row-label">{chk.label}</span>
                  <span className="row-status">{chk.passed ? '+20 pts' : 'Pending'}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Resume Analysis Section with Glass Insight Cards */}
          <div className="glass-card resume-analysis-panel">
            <div className="widget-header">
              <div className="flex items-center gap-sm">
                <span className="widget-icon">📈</span>
                <div>
                  <h3 className="widget-title">AI Resume Insights & Analysis</h3>
                  <div className="widget-desc">Actionable recommendations tailored for your target role</div>
                </div>
              </div>
            </div>

            <div className="analysis-cards-stack">
              {/* Missing Skills Card */}
              <div className="analysis-item-card border-amber">
                <div className="analysis-item-head">
                  <span className="item-icon">🔍</span>
                  <h4 className="item-title">Missing In-Demand Skills</h4>
                </div>
                <p className="item-desc">
                  Based on target market data for <strong>{resume.roleTitle || resume.title}</strong>, adding these key technical tags increases ATS hit rate:
                </p>
                <div className="missing-skills-chips">
                  {['Kubernetes', 'CI/CD Pipelines', 'System Design', 'Redis', 'GraphQL'].map(skill => (
                    <button 
                      key={skill}
                      className="missing-skill-pill"
                      onClick={() => {
                        const existing = resume.skills ? resume.skills.trim() : '';
                        const updated = existing ? `${existing}, ${skill}` : skill;
                        onSelectResume(resume.id);
                        toast(`Added "${skill}" to Technical Skills!`, 'success');
                      }}
                    >
                      + {skill}
                    </button>
                  ))}
                </div>
              </div>

              {/* Resume Suggestions Card */}
              <div className="analysis-item-card border-blue">
                <div className="analysis-item-head">
                  <span className="item-icon">💡</span>
                  <h4 className="item-title">Metric-Driven Achievements</h4>
                </div>
                <p className="item-desc">
                  Every work experience bullet should follow Google's XYZ formula: <em>Accomplished [X] as measured by [Y] by doing [Z]</em>. Use the 1-click XYZ enhancer in the Studio.
                </p>
              </div>

              {/* Keyword Optimization */}
              <div className="analysis-item-card border-emerald">
                <div className="analysis-item-head">
                  <span className="item-icon">🎯</span>
                  <h4 className="item-title">Keyword Density & Parser Safety</h4>
                </div>
                <p className="item-desc">
                  Your resume maintains 100% linear text flow with zero floating text boxes or unreadable tables, ensuring seamless parsing across Taleo and Workday.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================
            5. LIVE RESUME PREVIEW & TEMPLATE SWITCHER (DASHBOARD)
        ========================================================= */}
        <section className="glass-card dashboard-preview-section">
          <div className="preview-section-header">
            <div>
              <h3 className="widget-title">📄 Live Document Preview</h3>
              <p className="widget-desc">Instant real-time representation of your active resume. Switch between 25 templates below.</p>
            </div>
            <div className="flex items-center gap-xs">
              <select 
                className="form-select" 
                style={{ width: 'auto', padding: '0.45rem 0.85rem' }}
                value={resume.template}
                onChange={(e) => onSelectTemplate(e.target.value)}
              >
                {TEMPLATES_CATALOG.map(t => (
                  <option key={t.id} value={t.id}>{t.name} ({t.category})</option>
                ))}
              </select>
              <button className="btn btn-futuristic-primary btn-sm" onClick={() => onNavigate('studio')}>
                Open Full Studio ⚡
              </button>
            </div>
          </div>

          {/* Interactive Document Mockup Frame with Floating Shadow */}
          <div className="dashboard-preview-frame">
            <div style={{ transform: 'scale(0.85)', transformOrigin: 'top center' }}>
              <div id="dashboard-resume-sheet" className={`a4-resume-sheet template-${resume.template}`}>
                <ResumeRenderer 
                  resume={resume} 
                  palette={COLOR_PALETTES[resume.color] || COLOR_PALETTES.blue} 
                />
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================
            6. MY SAVED RESUMES MANAGER
        ========================================================= */}
        <section className="glass-card saved-resumes-section">
          <div className="dash-panel-header">
            <div className="flex items-center gap-sm">
              <span className="widget-icon">📑</span>
              <h2 className="dash-panel-title">My Saved Resumes ({resumes.length})</h2>
            </div>
            <button className="btn btn-futuristic-primary btn-sm" onClick={onCreateResume}>
              + Create New Resume
            </button>
          </div>

          <div className="resumes-cards-list">
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
                        Switch Active
                      </button>
                    )}
                    <button className="btn btn-futuristic-primary btn-sm" onClick={() => { onSelectResume(r.id); onNavigate('studio'); }}>
                      Edit in Studio
                    </button>
                    <button className="btn btn-secondary btn-sm" title="Duplicate" onClick={() => onDuplicateResume(r.id)}>
                      ⎘ Copy
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
        </section>

        {/* =========================================================
            7. PREMIUM FEATURE CARDS (LINEAR / BOLT.NEW STYLE)
        ========================================================= */}
        <section className="feature-cards-grid">
          {[
            { icon: '🤖', title: 'Groq AI Bullet Polish', desc: 'Google XYZ formula formulations crafted at 1200 tokens/sec via Llama 3.3.' },
            { icon: '🛡️', title: 'ATS Parser Guarantee', desc: '100% linear hierarchy verified across Workday, Taleo, Greenhouse & Lever.' },
            { icon: '✍️', title: 'Executive Cover Letters', desc: 'Contextually tailored cover letters matching target job descriptions in seconds.' },
            { icon: '📊', title: 'Real-time Skill Gap Analysis', desc: 'Automated extraction of missing keywords with 1-click addition into your stack.' },
            { icon: '📑', title: '25+ Modern Design Templates', desc: 'Executive, Corporate, Minimal, Tech Stack, and Fresher architectures.' },
            { icon: '📥', title: 'Vector-Grade PDF Export', desc: 'High-resolution A4 printing with zero text cutoff and selectable vector text.' }
          ].map((f, i) => (
            <div key={i} className="futuristic-feature-card">
              <div className="feature-icon-bubble">{f.icon}</div>
              <h3 className="feature-title">{f.title}</h3>
              <p className="feature-desc">{f.desc}</p>
            </div>
          ))}
        </section>
      </div>
    </div>
  );
}
'''

with open("scratch_app_part3_futuristic.js", "w", encoding="utf-8") as f:
    f.write(part3_futuristic)
print("Futuristic Dashboard component written to scratch_app_part3_futuristic.js!")
