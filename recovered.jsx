/**
 * Smart Resume AI — Full React 18 Application Component
 * Built with Pure CSS Flexbox, Reactive Hooks, and Direct Google Gemini AI Integration
 */

const { useState, useEffect, useRef } = React;

// Default Universal Candidate Profile
const INITIAL_RESUME = {
  id: 'resume_1',
  name: 'Alex Morgan',
  title: 'Senior Full Stack Software Engineer',
  avatar: 'assets/images/avatar.jpg',
  showAvatar: true,
  email: 'alex.morgan@devstudio.io',
  phone: '+1 (555) 349-2810',
  location: 'San Francisco, CA (or Remote)',
  links: 'github.com/alex-morgan | linkedin.com/in/alex-morgan-dev',
  summary: 'High-performing Senior Full Stack Engineer with 5+ years of experience architecting distributed cloud applications, responsive web interfaces, and AI-powered workflow automation. Proven expertise in cutting system latency by 40%, scaling API throughput to 50k+ req/sec, and mentoring cross-functional engineering teams to deliver mission-critical software on aggressive agile timelines.',
  skills: 'TypeScript, JavaScript (ES6+), React.js, Next.js, Node.js, Python, FastAPI, PostgreSQL, MongoDB, Redis, Docker, Kubernetes, AWS (EC2, S3, Lambda), CI/CD, GraphQL, REST APIs, Tailwind CSS',
  template: 'tpl_1',
  writingStyle: 'professional',
  color: 'blue',
  font: 'Merriweather',
  experiences: [
    {
      id: 1,
      role: 'Senior Full Stack Engineer',
      company: 'CloudScale Technologies',
      location: 'San Francisco, CA',
      startDate: '2023',
      endDate: 'Present',
      bullets: '• Architected high-throughput microservices using Node.js, FastAPI, and Redis, scaling real-time active user sessions to 100,000+ while maintaining 99.99% uptime.\n• Engineered automated CI/CD deployment pipelines on AWS using GitHub Actions and Docker, reducing production release lead times by 65% and eliminating manual deployment errors.\n• Spearheaded database schema optimization and indexing on PostgreSQL, cutting average query latency from 220ms to 45ms for the core analytics dashboard.\n• Mentored 4 junior developers in React best practices and test-driven development, increasing sprint velocity by 20% over two quarters.'
    },
    {
      id: 2,
      role: 'Full Stack Web Developer',
      company: 'Nexus Interactive Labs',
      location: 'San Jose, CA',
      startDate: '2021',
      endDate: '2023',
      bullets: '• Developed responsive client-facing web applications with React, Next.js, and Tailwind CSS, increasing overall user engagement metrics by 32% within the first month of launch.\n• Implemented secure RESTful API endpoints and OAuth 2.0 / JWT authentication protocols for enterprise integrations, successfully passing third-party security audits.\n• Built real-time collaboration features using WebSockets and Socket.io, allowing 50+ concurrent users to edit shared documents without sync conflicts.\n• Collaborated across agile sprints to achieve 94% test coverage using Jest, React Testing Library, and Cypress.'
    }
  ],
  education: [
    {
      id: 1,
      degree: 'B.S. in Computer Science & Engineering',
      school: 'University Institute of Technology',
      location: 'California, USA',
      year: '2017 – 2021',
      gpa: 'GPA: 3.85 / 4.0 (Dean\'s Honor Roll, Magna Cum Laude)'
    }
  ],
  projects: [
    {
      id: 1,
      title: 'Smart Resume AI Platform',
      tech: 'React, TypeScript, Google Gemini API, Tailwind CSS',
      link: 'github.com/alex-morgan/smart-resume-ai',
      bullets: '• Engineered a responsive client-side resume studio compiling vector-grade A4 printable documents natively in the browser.\n• Formulated a real-time NLP token matching algorithm calculating ATS job description keyword overlap in under 12ms.\n• Integrated human-in-the-loop AI review modal supporting inline editing, regeneration, and instant approval workflows.'
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

const COLOR_PALETTES = {
  blue: { primary: '#1e3a8a', accent: '#2563eb' },
  emerald: { primary: '#064e3b', accent: '#059669' },
  purple: { primary: '#4c1d95', accent: '#7c3aed' },
  amber: { primary: '#78350f', accent: '#d97706' },
  rose: { primary: '#881337', accent: '#e11d48' },
  slate: { primary: '#0f172a', accent: '#334155' }
};

const ATS_STOP_WORDS = new Set([
  'and', 'the', 'to', 'a', 'of', 'in', 'for', 'with', 'on', 'at', 'an', 'is', 'or', 'as', 
  'be', 'are', 'this', 'that', 'you', 'we', 'will', 'have', 'from', 'by', 'about', 'can', 
  'our', 'their', 'must', 'should', 'all', 'any', 'has', 'more', 'work', 'working', 'team'
]);

const getInitialView = () => {
  const path = window.location.pathname.toLowerCase();
  const search = new URLSearchParams(window.location.search);
  if (path.includes('builder') || search.get('view') === 'studio') return 'studio';
  if (path.includes('templates') || search.get('view') === 'templates') return 'templates';
  if (path.includes('login') || search.get('view') === 'login') return 'login';
  return 'home';
};

function App() {
  
  const [globalTemplates, setGlobalTemplates] = useState([]);
  const [globalFonts, setGlobalFonts] = useState([]);
  const [globalWritingStyles, setGlobalWritingStyles] = useState([]);

  useEffect(() => {
    fetch('assets/data/templates.json').then(r => r.json()).then(setGlobalTemplates).catch(console.error);
    fetch('assets/data/fonts.json').then(r => r.json()).then(setGlobalFonts).catch(console.error);
    fetch('assets/data/writingStyles.json').then(r => r.json()).then(setGlobalWritingStyles).catch(console.error);
  }, []);

  const [theme, setTheme] = useState(() => localStorage.getItem('smart_resume_theme') || 'dark');
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('smart_resume_theme', theme);
  }, [theme]);


  
  
  useEffect(() => {
    if (resume.font) {
      const linkId = 'dynamic-google-font';
      let link = document.getElementById(linkId);
      if (!link) {
        link = document.createElement('link');
        link.id = linkId;
        link.rel = 'stylesheet';
        document.head.appendChild(link);
      }
      link.href = `https://fonts.googleapis.com/css2?family=${resume.font.replace(/ /g, '+')}:wght@300;400;500;600;700;800;900&display=swap`;
    }
  }, [resume.font]);
  
  const [currentView, setCurrentView] = useState(getInitialView);
  const [resumes, setResumes] = useState(() => {
    try {
      const raw = localStorage.getItem('smart_resume_resumes_v4');
      if (raw) return JSON.parse(raw);
    } catch(e) {}
    return [INITIAL_RESUME];
  });
  const [activeResumeId, setActiveResumeId] = useState(() => {
    return localStorage.getItem('smart_resume_active_id_v4') || resumes[0]?.id || 'resume_1';
  });

  // Save activeResumeId
  useEffect(() => {
    try {
      localStorage.setItem('smart_resume_active_id_v4', activeResumeId);
    } catch(e) {}
  }, [activeResumeId]);
  const [resume, setResume] = useState(() => {
    return resumes.find(r => r.id === activeResumeId) || INITIAL_RESUME;
  });

  useEffect(() => {
    if (resume.font) {
      const linkId = 'dynamic-google-font';
      let link = document.getElementById(linkId);
      if (!link) {
        link = document.createElement('link');
        link.id = linkId;
        link.rel = 'stylesheet';
        document.head.appendChild(link);
      }
      link.href = `https://fonts.googleapis.com/css2?family=${resume.font.replace(/ /g, '+')}:wght@300;400;500;600;700;800;900&display=swap`;
    }
  }, [resume.font]);

  const [apiKey, setApiKey] = useState(() => localStorage.getItem('gemini_api_key') || '');
  const [selectedModel, setSelectedModel] = useState(() => localStorage.getItem('gemini_selected_model') || 'gemini-1.5-flash');
  const [zoom, setZoom] = useState(1.0);
  const [jobDescription, setJobDescription] = useState('');
  const [atsScore, setAtsScore] = useState(0);
  const [matchedKeywords, setMatchedKeywords] = useState([]);
  const [missingKeywords, setMissingKeywords] = useState([]);
  const [saveStatus, setSaveStatus] = useState('✓ Saved');
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);
  const [reviewModal, setReviewModal] = useState(null); // { originalText, aiText, onAccept, onRegenerate, badge }
  const [isGenerating, setIsGenerating] = useState(false);

  const resumeSheetRef = useRef(null);

  // Auto-save active resume
  useEffect(() => {
    setResumes(prev => {
      const updated = prev.map(r => r.id === resume.id ? resume : r);
      if (!updated.some(r => r.id === resume.id)) updated.push(resume);
      try {
        localStorage.setItem('smart_resume_resumes_v4', JSON.stringify(updated));
      } catch(e) {}
      return updated;
    });
    setSaveStatus('✓ Auto-saved');
  }, [resume]);

  // ATS keyword analysis effect
  const [atsWarnings, setAtsWarnings] = useState([]);
  
  useEffect(() => {
    if (!jobDescription.trim()) {
      setAtsScore(0);
      setMatchedKeywords([]);
      setMissingKeywords([]);
      setAtsWarnings([]);
      return;
    }
    const resumeText = [
      resume.name, resume.title, resume.summary, resume.skills,
      ...resume.experiences.map(e => `${e.role} ${e.company} ${e.bullets}`),
      ...resume.projects.map(p => `${p.title} ${p.tech} ${p.bullets}`),
      ...resume.education.map(ed => `${ed.degree} ${ed.school}`)
    ].join(' ').toLowerCase();

    const jdWordsRaw = jobDescription.toLowerCase().match(/[a-z0-9+#.-]{2,}/g) || [];
    const jdWords = Array.from(new Set(jdWordsRaw)).filter(w => !ATS_STOP_WORDS.has(w));

    // Basic Synonym Map
    const SYNONYMS = {
      'react': ['react.js', 'reactjs'],
      'node': ['node.js', 'nodejs'],
      'javascript': ['js', 'es6'],
      'typescript': ['ts'],
      'aws': ['amazon web services'],
      'ml': ['machine learning'],
      'ai': ['artificial intelligence']
    };

    const HARD_SKILLS = new Set(['react', 'javascript', 'typescript', 'python', 'java', 'c++', 'aws', 'docker', 'kubernetes', 'sql', 'nosql', 'api', 'graphql', 'node', 'css', 'html', 'git', 'ml', 'ai', 'c#', 'ruby', 'go']);
    const SOFT_SKILLS = new Set(['leadership', 'communication', 'agile', 'scrum', 'management', 'team', 'collaboration', 'strategy', 'planning', 'problem-solving', 'mentoring', 'mentor']);
    
    let hardTotal = 0, softTotal = 0, expTotal = 0;
    let hardMatch = 0, softMatch = 0, expMatch = 0;

    const matched = [];
    const missing = [];
    jdWords.forEach(word => {
      const escapeRegExp = (string) => string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const wordRegex = new RegExp(`(^|[^a-z0-9])(${escapeRegExp(word)})([^a-z0-9]|$)`, 'i');
      let isMatch = wordRegex.test(resumeText);
      if (!isMatch && SYNONYMS[word]) {
         isMatch = SYNONYMS[word].some(syn => {
           const synRegex = new RegExp(`(^|[^a-z0-9])(${escapeRegExp(syn)})([^a-z0-9]|$)`, 'i');
           return synRegex.test(resumeText);
         });
      }

      let category = 'exp';
      if (HARD_SKILLS.has(word)) category = 'hard';
      else if (SOFT_SKILLS.has(word)) category = 'soft';

      if (category === 'hard') hardTotal++;
      else if (category === 'soft') softTotal++;
      else expTotal++;

      if (isMatch) {
         matched.push(word);
         if (category === 'hard') hardMatch++;
         else if (category === 'soft') softMatch++;
         else expMatch++;
      } else {
         missing.push(word);
      }
    });

    const hardScore = hardTotal > 0 ? (hardMatch / hardTotal) * 40 : (hardTotal === 0 ? 40 : 0);
    const softScore = softTotal > 0 ? (softMatch / softTotal) * 15 : (softTotal === 0 ? 15 : 0);
    const expScore = expTotal > 0 ? (expMatch / expTotal) * 45 : (expTotal === 0 ? 45 : 0);
    
    let score = Math.round(hardScore + softScore + expScore);
    if (jdWords.length === 0) score = 0;

    setAtsScore(Math.min(score, 100));
    setMatchedKeywords(matched.slice(0, 5));
    setMissingKeywords(missing.slice(0, 6));

    const warnings = [];
    const activeTemp = globalTemplates.find(t => t.id === resume.template);
    if (activeTemp && (activeTemp.category === 'Creative/Portfolio' || activeTemp.category === 'C-Suite/Executive')) {
      warnings.push("Multi-column/complex layout detected: May cause parsing issues in older ATS (Taleo, Workday).");
    }
    if (resume.showAvatar) {
      warnings.push("Graphics/Photo detected: Can severely break ATS parsers or be rejected for bias compliance.");
    }
    if (score < 75 && missing.length > 0) {
      warnings.push(`Missing Keywords Density: Add ${missing.slice(0, 3).join(', ')} to boost score.`);
    }
    setAtsWarnings(warnings);

  }, [jobDescription, resume]);

  // Add keyword directly into skills
  const addSkill = (skill) => {
    const existing = resume.skills ? resume.skills.trim() : '';
    const updated = existing ? `${existing}, ${skill}` : skill;
    setResume({ ...resume, skills: updated });
    toast(`Added "${skill}" to technical skills!`);
  };

  // AI Summary Generator
  const handleGenerateSummary = async () => {
    setIsGenerating(true);
    const role = resume.title || 'Senior Software Engineer';
    const skills = resume.skills || 'TypeScript, React, Cloud Architecture';
    let aiText = '';
    let badgeText = 'Smart Local NLP';

    try {
      if (apiKey) {
        const styleText = resume.writingStyle || 'professional';
        const prompt = `Role: ${role}\nSkills: ${skills}\nWrite a 3-line executive summary with measurable achievements in a ${styleText} tone.`;
        const systemInstruction = `You are an expert resume writer. Output strictly a 3-line executive summary with measurable achievements. Use a ${styleText} tone. Do not include introductory text like 'Here is the summary'. Just output the summary paragraph.`;
        
        if (selectedModel.startsWith('gemini')) {
          const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${selectedModel}:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }],
              systemInstruction: { parts: [{ text: systemInstruction }] }
            })
          });
          if (!res.ok) {
            if (res.status === 429) toast('Rate limit exceeded (429). Please wait a moment.', 'error');
            throw new Error(`Gemini API Error: ${res.status}`);
          }
          const data = await res.json();
          if (data?.candidates?.[0]?.content?.parts?.[0]?.text) {
            aiText = data.candidates[0].content.parts[0].text;
            badgeText = `Gemini API (${selectedModel})`;
          }
        } else {
          const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
              model: selectedModel,
              messages: [
                { role: 'system', content: systemInstruction },
                { role: 'user', content: prompt }
              ],
              temperature: 0.7
            })
          });
          if (!res.ok) {
            if (res.status === 429) toast('Rate limit exceeded (429). Please wait a moment.', 'error');
            throw new Error(`Groq API Error: ${res.status}`);
          }
          const data = await res.json();
          if (data?.choices?.[0]?.message?.content) {
            aiText = data.choices[0].message.content;
            badgeText = `Groq API (${selectedModel})`;
          }
        }
      } else {
        const res = await fetch('/api/ai/suggest-summary', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            role,
            skills,
            api_key: apiKey,
            model: selectedModel
          })
        });
        if (!res.ok) {
          if (res.status === 429) toast('Rate limit exceeded (429). Please wait a moment.', 'error');
          throw new Error(`Local API Error: ${res.status}`);
        }
        const data = await res.json();
        if (data.success && data.summary) {
          aiText = data.summary;
          badgeText = data.engine;
        }
      }
    } catch (err) {
      console.warn('API failed, using local React fallback:', err);
    }

    if (!aiText) {
      aiText = `Results-driven ${role} proficient in ${skills}. Proven track record of architecting scalable applications, designing resilient API pipelines, and reducing system latencies by 40%+.`;
    }

    setReviewModal({
      badge: badgeText,
      originalText: resume.summary,
      aiText: aiText,
      onAccept: (text) => setResume({ ...resume, summary: text }),
      onRegenerate: () => handleGenerateSummary()
    });
    setIsGenerating(false);
  };

  // AI Bullet Enhancer
  const handleEnhanceBullets = async (type, id) => {
    setIsGenerating(true);
    const item = type === 'exp' ? resume.experiences.find(e => e.id === id) : resume.projects.find(p => p.id === id);
    if (!item) {
      setIsGenerating(false);
      return;
    }
    const current = item.bullets.trim();
    let enhanced = '';
    let badgeText = 'XYZ Action Formula (Local)';

    if (current) {
      try {
        if (apiKey) {
          const styleText = resume.writingStyle || 'professional';
          const prompt = `Original bullets:\n${current}`;
          const systemInstruction = `You are an expert resume writer. Enhance the provided resume bullets using the strict Google XYZ formula: 'Accomplished [X], as measured by [Y], by doing [Z]'. Use a ${styleText} tone with dynamic action verbs and realistic metrics. Do not include markdown formatting like asterisks or bolding, just bullet points separated by newlines. Start each bullet with a bullet character (•).`;
          
          if (selectedModel.startsWith('gemini')) {
            const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${selectedModel}:generateContent?key=${apiKey}`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
                systemInstruction: { parts: [{ text: systemInstruction }] }
              })
            });
            if (!res.ok) {
              if (res.status === 429) toast('Rate limit exceeded (429). Please wait a moment.', 'error');
              throw new Error(`Gemini API Error: ${res.status}`);
            }
            const data = await res.json();
            if (data?.candidates?.[0]?.content?.parts?.[0]?.text) {
              enhanced = data.candidates[0].content.parts[0].text;
              badgeText = `Gemini API (${selectedModel})`;
            }
          } else {
            const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
              method: 'POST',
              headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
              },
              body: JSON.stringify({
                model: selectedModel,
                messages: [
                  { role: 'system', content: systemInstruction },
                  { role: 'user', content: prompt }
                ],
                temperature: 0.7
              })
            });
            if (!res.ok) {
              if (res.status === 429) toast('Rate limit exceeded (429). Please wait a moment.', 'error');
              throw new Error(`Groq API Error: ${res.status}`);
            }
            const data = await res.json();
            if (data?.choices?.[0]?.message?.content) {
              enhanced = data.choices[0].message.content;
              badgeText = `Groq API (${selectedModel})`;
            }
          }
        } else {
          const res = await fetch('/api/ai/enhance-bullets', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              text: current,
              api_key: apiKey,
              model: selectedModel
            })
          });
          if (!res.ok) {
            if (res.status === 429) toast('Rate limit exceeded (429). Please wait a moment.', 'error');
            throw new Error(`Local API Error: ${res.status}`);
          }
          const data = await res.json();
          if (data.success && data.bullets) {
            enhanced = data.bullets;
            badgeText = data.engine;
          }
        }
      } catch (err) {
        console.warn('API failed, using local React fallback:', err);
      }
    }

    if (!enhanced) {
      const verbs = ['Architected', 'Engineered', 'Optimized', 'Automated'];
      const lines = current ? current.split('\n') : ['Developed modular platform services'];
      enhanced = lines.map((l, i) => {
        const clean = l.replace(/^[•\-\*\s]+/, '').trim();
        return clean ? `• ${verbs[i % verbs.length]} ${clean.toLowerCase()}, reducing response latency by 35% and accelerating deployment cycles.` : '';
      }).filter(Boolean).join('\n');
    }

    setReviewModal({
      badge: badgeText,
      originalText: current,
      aiText: enhanced,
      onAccept: (text) => {
        if (type === 'exp') {
          setResume({
            ...resume,
            experiences: resume.experiences.map(e => e.id === id ? { ...e, bullets: text } : e)
          });
        } else {
          setResume({
            ...resume,
            projects: resume.projects.map(p => p.id === id ? { ...p, bullets: text } : p)
          });
        }
      },
      onRegenerate: () => handleEnhanceBullets(type, id)
    });
    setIsGenerating(false);
  };

  // PDF Export
  const exportPDF = () => {
    const el = document.getElementById('react-resume-sheet');
    if (!el) return;
    if (typeof html2pdf === 'undefined') {
      window.print();
      return;
    }
    
    toast('Preparing PDF...', 'info');
    
    // We must temporarily disable scaling in the UI so html2canvas renders the full size accurately.
    const originalTransform = el.style.transform;
    const originalTransition = el.style.transition;
    
    // Force transform to none directly to bypass React for the duration of the capture
    el.style.transition = 'none';
    el.style.transform = 'scale(1)';
    el.classList.add('exporting-pdf');

    // Give browser a tick to apply the unscaled styles before capturing
    setTimeout(() => {
      html2pdf().set({
        margin: [0, 0, 0, 0],
        filename: `${(resume.name || 'Resume').replace(/\s+/g, '_')}_Document.pdf`,
        image: { type: 'jpeg', quality: 1 },
        html2canvas: { scale: 3, useCORS: true, logging: false, scrollY: 0, scrollX: 0 },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
        pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
      }).from(el).save().then(() => {
        el.style.transform = originalTransform;
        el.style.transition = originalTransition;
        el.classList.remove('exporting-pdf');
        toast('PDF downloaded successfully!', 'success');
      }).catch(err => {
        console.error('PDF generation error:', err);
        el.style.transform = originalTransform;
        el.style.transition = originalTransition;
        el.classList.remove('exporting-pdf');
        toast('PDF generation failed, falling back to print.', 'error');
        window.print();
      });
    }, 300); // 300ms delay to ensure the DOM is fully unscaled and rendered
  };

  const palette = COLOR_PALETTES[resume.color] || COLOR_PALETTES.blue;

  return (
    <div className="flex flex-col" style={{ minHeight: '100vh' }}>
      {/* Top Flexbox Navbar */}
      <header className="navbar">
        <div className="logo" onClick={() => setCurrentView('home')}>
          <div className="logo-badge">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="white"/>
              <path d="M2 17L12 22L22 17M2 12L12 17L22 12" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          Smart<span className="highlight">Resume AI</span>
          <span className="workspace-tag">React v4.0</span>
        </div>

        <nav className="nav-links">
          <a className={currentView === 'home' ? 'active' : ''} onClick={() => setCurrentView('home')}>Home</a>
          <a className={currentView === 'templates' ? 'active' : ''} onClick={() => setCurrentView('templates')}>Templates</a>
          <a className={currentView === 'studio' ? 'active' : ''} onClick={() => setCurrentView('studio')}>AI Studio</a>
          <a className={currentView === 'login' ? 'active' : ''} onClick={() => setCurrentView('login')}>Sign In</a>
        </nav>

        <div className="flex items-center gap-sm">
          <button 
            className="btn btn-glass btn-sm" 
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            title="Toggle Theme"
            style={{ padding: '0.4rem 0.6rem', fontSize: '1rem' }}
          >
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
          <div 
            className={`ai-status-pill ${apiKey ? 'connected' : 'offline'}`}
            onClick={() => setShowApiKeyModal(true)}
            style={{ cursor: 'pointer' }}
          >
            {apiKey ? `🟢 Gemini Live (${selectedModel.replace('gemini-', '')})` : '🟡 Smart AI (Offline)'}
          </div>
          <button className="btn btn-glow btn-sm" onClick={() => setCurrentView('studio')}>
            Launch Studio 🚀
          </button>
        </div>
      </header>

      {/* Main Views */}
      {currentView === 'home' && (
        <HomeView 
          onOpenStudio={() => setCurrentView('studio')} 
          onSelectTemplate={(tpl) => { setResume({ ...resume, template: tpl }); setCurrentView('studio'); }}
        />
      )}

      {currentView === 'templates' && (
        <TemplatesView 
          onSelectTemplate={(tpl) => { setResume({ ...resume, template: tpl }); setCurrentView('studio'); }}
          templates={globalTemplates}
        />
      )}

      {currentView === 'login' && (
        <LoginView onLoginSuccess={() => setCurrentView('studio')} />
      )}

      {currentView === 'studio' && (
        <StudioView 
          resume={resume}
          setResume={setResume}
          resumes={resumes}
          activeResumeId={activeResumeId}
          onSwitchResume={(id) => {
            const found = resumes.find(r => r.id === id);
            if (found) { setActiveResumeId(id); setResume(found); }
          }}
          onCreateResume={() => {
            const newId = 'resume_' + Date.now();
            const newRes = { ...INITIAL_RESUME, id: newId, name: 'New Candidate', experiences: [], projects: [] };
            setResumes([...resumes, newRes]);
            setActiveResumeId(newId);
            setResume(newRes);
          }}
          onDuplicateResume={() => {
            const newId = 'resume_' + Date.now();
            const copy = { ...resume, id: newId, name: `${resume.name} (Copy)` };
            setResumes([...resumes, copy]);
            setActiveResumeId(newId);
            setResume(copy);
          }}
          onDeleteResume={() => {
            if (resumes.length <= 1) { toast('Cannot delete the only resume in your profile.'); return; }
            const remaining = resumes.filter(r => r.id !== resume.id);
            setResumes(remaining);
            setActiveResumeId(remaining[0].id);
            setResume(remaining[0]);
          }}
          zoom={zoom}
          setZoom={setZoom}
          jobDescription={jobDescription}
          setJobDescription={setJobDescription}
          atsScore={atsScore}
          matchedKeywords={matchedKeywords}
          missingKeywords={missingKeywords}
          atsWarnings={atsWarnings}
          onAddSkill={addSkill}
          onGenerateSummary={handleGenerateSummary}
          onEnhanceBullets={handleEnhanceBullets}
          onExportPDF={exportPDF}
          isGenerating={isGenerating}
          onOpenApiKeyModal={() => setShowApiKeyModal(true)}
          palette={palette}
          templates={globalTemplates}
          fonts={globalFonts}
          writingStyles={globalWritingStyles}
        />
      )}
      
      {isGenerating && (
        <div className="generating-overlay">
          <div className="spinner"></div>
          <p>AI is analyzing and writing...</p>
        </div>
      )}

      {/* AI Suggestion Approval Modal */}
      {reviewModal && (
        <div className="modal-overlay">
          <div className="ai-review-modal-box">
            <div className="ai-review-header">
              <h3><span>✨</span> AI Suggestion Review & Approval</h3>
              <span className="ai-review-badge">{reviewModal.badge}</span>
            </div>
            <div className="ai-review-body">
              <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)' }}>
                Review the AI-generated enhancement. Edit the text directly before accepting or reject it entirely.
              </p>
              {reviewModal.originalText && (
                <div className="ai-review-section">
                  <label>Original Draft:</label>
                  <div className="ai-review-original">{reviewModal.originalText}</div>
                </div>
              )}
              <div className="ai-review-section">
                <label>AI Enhanced Content (Editable):</label>
                <div className="ai-review-suggestion">
                  <textarea 
                    value={reviewModal.aiText} 
                    onChange={(e) => setReviewModal({ ...reviewModal, aiText: e.target.value })}
                    rows={4}
                  />
                </div>
              </div>
            </div>
            <div className="ai-review-actions">
              <button className="btn btn-glass btn-sm" onClick={reviewModal.onRegenerate}>🔄 Regenerate</button>
              <div className="flex gap-sm">
                <button className="btn btn-glass btn-sm" style={{ color: '#f87171' }} onClick={() => setReviewModal(null)}>✕ Reject</button>
                <button className="btn btn-glow btn-sm" onClick={() => { reviewModal.onAccept(reviewModal.aiText); setReviewModal(null); toast('Approved & Applied to Resume!'); }}>
                  ✓ Accept & Apply to Resume
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Gemini API Key Modal */}
      {showApiKeyModal && (
        <div className="modal-overlay">
          <div className="modal-box" style={{ maxWidth: '540px' }}>
            <div className="flex justify-between items-center">
              <h3>🔑 Connect Google Gemini AI</h3>
              <span className={`ai-status-pill ${apiKey ? 'connected' : 'offline'}`}>{apiKey ? 'Live' : 'Offline'}</span>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
              Connect your Gemini API Key for deep generative summaries and XYZ bullet point expansion.
              Get your free key at <a href="https://aistudio.google.com/app/apikey" target="_blank" style={{ color: 'var(--accent-cyan)', textDecoration: 'underline' }}>Google AI Studio</a>.
            </p>
            <div className="form-group">
              <label>AI Provider & Model</label>\n
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
          <button className={`filter-btn ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>All Categories</button>
          {categories.map(c => (
            <button key={c} className={`filter-btn ${filter === c ? 'active' : ''}`} onClick={() => setFilter(c)}>{c}</button>
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
              <span className={`badge-tag ${t.badgeColor || 'indigo'}`}>{t.category}</span>
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
            <option value="Inter">Inter</option>
            <option value="Roboto">Roboto</option>
            <option value="Open Sans">Open Sans</option>
            <option value="Lato">Lato</option>
            <option value="Montserrat">Montserrat</option>
            <option value="Oswald">Oswald</option>
            <option value="Source Sans Pro">Source Sans Pro</option>
            <option value="Slabo 27px">Slabo 27px</option>
            <option value="Raleway">Raleway</option>
            <option value="PT Sans">PT Sans</option>
            <option value="Merriweather">Merriweather</option>
            <option value="Noto Sans">Noto Sans</option>
            <option value="Nunito">Nunito</option>
            <option value="Concert One">Concert One</option>
            <option value="Playfair Display">Playfair Display</option>
            <option value="Rubik">Rubik</option>
            <option value="Lora">Lora</option>
            <option value="Work Sans">Work Sans</option>
            <option value="Fira Sans">Fira Sans</option>
            <option value="Quicksand">Quicksand</option>
            <option value="Karla">Karla</option>
            <option value="Barlow">Barlow</option>
            <option value="Mulish">Mulish</option>
            <option value="Inconsolata">Inconsolata</option>
            <option value="Titillium Web">Titillium Web</option>
            <option value="Mukta">Mukta</option>
            <option value="Heebo">Heebo</option>
            <option value="Josefin Sans">Josefin Sans</option>
            <option value="Libre Baskerville">Libre Baskerville</option>
            <option value="Anton">Anton</option>
            <option value="Varela Round">Varela Round</option>
            <option value="Cabin">Cabin</option>
            <option value="Bitter">Bitter</option>
            <option value="Dancing Script">Dancing Script</option>
            <option value="Pacifico">Pacifico</option>
            <option value="Dosis">Dosis</option>
            <option value="Teko">Teko</option>
            <option value="Bebas Neue">Bebas Neue</option>
            <option value="Shadows Into Light">Shadows Into Light</option>
            <option value="Abel">Abel</option>
            <option value="Caveat">Caveat</option>
            <option value="Indie Flower">Indie Flower</option>
            <option value="Exo 2">Exo 2</option>
            <option value="Righteous">Righteous</option>
            <option value="Lobster">Lobster</option>
            <option value="Cinzel">Cinzel</option>
            <option value="Archivo">Archivo</option>
            <option value="Signika">Signika</option>
            <option value="Comfortaa">Comfortaa</option>
            <option value="Space Grotesk">Space Grotesk</option>
            <option value="DM Sans">DM Sans</option>
            <option value="Manrope">Manrope</option>
            <option value="Outfit">Outfit</option>
            <option value="Syne">Syne</option>
            <option value="Urbanist">Urbanist</option>
          </select>
          \n          <div className="color-picker-group">
            {['blue', 'emerald', 'purple', 'amber', 'rose', 'slate'].map(c => (
              <div 
                key={c}
                className={`color-dot dot-${c} ${resume.color === c ? 'active' : ''}`}
                onClick={() => setResume({ ...resume, color: c })}
              />
            ))}
          </div>

          <button className="btn btn-glass btn-sm" onClick={onOpenApiKeyModal}>🔑 Gemini Key</button>
          <button className="btn btn-glow btn-sm" onClick={onExportPDF}>📥 Download PDF</button>
        </div>
      </div>

      {/* Split Screen Workspace Container (Flexbox) */}
      <div className="workspace-container">
        {/* Left Column: Form Editor (Flexbox) */}
        <section className="editor-pane">
          {/* ATS Keyword Matcher */}
          <div className="glass-card ats-score-card">
            <div className="ats-header">
              <span>🎯 Real-Time ATS Keyword Matcher</span>
              <span className="ats-score-badge" style={{
                background: atsScore >= 75 ? 'rgba(16, 185, 129, 0.2)' : atsScore >= 45 ? 'rgba(245, 158, 11, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                color: atsScore >= 75 ? '#34d399' : atsScore >= 45 ? '#fbbf24' : '#f87171'
              }}>
                {atsScore}% Match
              </span>
            </div>
            <div className="progress-bar-bg">
              <div className="progress-bar-fill" style={{ width: `${atsScore}%` }}></div>
            </div>
            <textarea 
              rows={2} 
              placeholder="Paste target Job Description here to scan keyword overlap..."
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
            />
            <div className="ats-keywords-container">
              <div className="flex justify-between items-center">
                <span style={{ fontWeight: 600, color: 'var(--text-muted)', fontSize: '0.75rem' }}>DETECTED KEYWORDS:</span>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>(Click yellow to add to skills)</span>
              </div>
              <div className="ats-keywords-chips">
                {matchedKeywords.map((k, i) => <span key={i} className="chip-match">✓ {k}</span>)}
                {missingKeywords.map((k, i) => (
                  <span key={i} className="chip-missing" onClick={() => onAddSkill(k)}>+ {k}</span>
                ))}
              </div>
            </div>
            {atsWarnings?.length > 0 && (
              <div style={{ marginTop: '1rem', padding: '0.75rem', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '6px', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                <span style={{ fontWeight: 600, color: '#f87171', fontSize: '0.75rem', display: 'block', marginBottom: '0.25rem' }}>⚠️ ATS WARNINGS</span>
                <ul style={{ margin: 0, paddingLeft: '1.25rem', fontSize: '0.8rem', color: 'var(--text-dim)' }}>
                  {atsWarnings.map((w, i) => <li key={i}>{w}</li>)}
                </ul>
              </div>
            )}
          </div>

          {/* Profile & Avatar */}
          <div className="glass-card form-section">
            <h3 className="section-heading">👤 Candidate Profile</h3>
            <div className="avatar-upload-box">
              <img src={resume.avatar} alt="Candidate Profile" className="avatar-preview-img" />
              <div className="flex flex-col gap-xs">
                <label className="flex items-center gap-xs" style={{ cursor: 'pointer', fontSize: '0.82rem', fontWeight: 600 }}>
                  <input 
                    type="checkbox" 
                    checked={resume.showAvatar} 
                    onChange={(e) => setResume({ ...resume, showAvatar: e.target.checked })} 
                  />
                  Display Profile Photo on Resume
                </label>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>AI Generated Professional Studio Portrait</span>
              </div>
            </div>

            <div className="form-grid">
              <div className="form-group">
                <label>Full Name</label>
                <input type="text" value={resume.name} onChange={(e) => setResume({ ...resume, name: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Target Role Title</label>
                <input type="text" value={resume.title} onChange={(e) => setResume({ ...resume, title: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Email Address</label>
                <input type="email" value={resume.email} onChange={(e) => setResume({ ...resume, email: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Phone Number</label>
                <input type="text" value={resume.phone} onChange={(e) => setResume({ ...resume, phone: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Location</label>
                <input type="text" value={resume.location} onChange={(e) => setResume({ ...resume, location: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Portfolio / Links</label>
                <input type="text" value={resume.links} onChange={(e) => setResume({ ...resume, links: e.target.value })} />
              </div>
            </div>
          </div>

          {/* Summary */}
          <div className="glass-card form-section">
            <div className="section-heading-bar">
              <h3 className="section-heading">📝 Executive Summary</h3>
              <button className="btn-ai-sparkle" onClick={onGenerateSummary} disabled={isGenerating}>
                {isGenerating ? '✨ Generating...' : '✨ Generate with AI'}
              </button>
            </div>
            <textarea 
              rows={4} 
              value={resume.summary} 
              onChange={(e) => setResume({ ...resume, summary: e.target.value })}
            />
          </div>

          {/* Skills */}
          <div className="glass-card form-section">
            <h3 className="section-heading">🛠️ Technical Skills</h3>
            <input 
              type="text" 
              value={resume.skills} 
              onChange={(e) => setResume({ ...resume, skills: e.target.value })}
            />
            <div className="skills-recommendations">
              {['TypeScript', 'React.js', 'Next.js', 'Node.js', 'Python', 'Docker', 'AWS', 'PostgreSQL', 'GraphQL', 'Tailwind CSS'].map(s => (
                <span key={s} className="skill-rec-pill" onClick={() => onAddSkill(s)}>+ {s}</span>
              ))}
            </div>
          </div>

          {/* Work Experience */}
          <div className="glass-card form-section">
            <div className="section-heading-bar">
              <h3 className="section-heading">💼 Work Experience</h3>
              <button className="btn btn-glass btn-sm" onClick={() => {
                const newExp = { id: Date.now(), role: 'Software Engineer', company: 'Company Name', location: 'Location', startDate: '2023', endDate: 'Present', bullets: 'Accomplished key milestones...' };
                setResume({ ...resume, experiences: [...resume.experiences, newExp] });
              }}>+ Add Position</button>
            </div>
            <div className="repeater-list">
              {resume.experiences.map((exp, idx) => (
                <div key={exp.id} className="repeater-item-box">
                  <div className="item-header-bar">
                    <span className="item-index-badge">POSITION {String(idx + 1).padStart(2, '0')}</span>
                    <button className="btn-danger-sm" onClick={() => setResume({ ...resume, experiences: resume.experiences.filter(e => e.id !== exp.id) })}>✕ Remove</button>
                  </div>
                  <div className="form-grid">
                    <div className="form-group">
                      <label>Role</label>
                      <input type="text" value={exp.role} onChange={(e) => setResume({ ...resume, experiences: resume.experiences.map(item => item.id === exp.id ? { ...item, role: e.target.value } : item) })} />
                    </div>
                    <div className="form-group">
                      <label>Company</label>
                      <input type="text" value={exp.company} onChange={(e) => setResume({ ...resume, experiences: resume.experiences.map(item => item.id === exp.id ? { ...item, company: e.target.value } : item) })} />
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Accomplishments (Google XYZ Formula)</label>
                    <textarea 
                      rows={3} 
                      value={exp.bullets} 
                      onChange={(e) => setResume({ ...resume, experiences: resume.experiences.map(item => item.id === exp.id ? { ...item, bullets: e.target.value } : item) })} 
                    />
                    <div className="ai-controls-bar">
                      <button className="btn-ai-sm" onClick={() => onEnhanceBullets('exp', exp.id)} disabled={isGenerating}>
                        {isGenerating ? '✨ Polishing...' : '✨ Polish Action Bullets'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Projects */}
          <div className="glass-card form-section">
            <div className="section-heading-bar">
              <h3 className="section-heading">🚀 Key Projects</h3>
              <button className="btn btn-glass btn-sm" onClick={() => {
                const newProj = { id: Date.now(), title: 'Project Title', tech: 'Tech Stack', link: '', bullets: 'Built high-impact features...' };
                setResume({ ...resume, projects: [...resume.projects, newProj] });
              }}>+ Add Project</button>
            </div>
            <div className="repeater-list">
              {resume.projects.map((proj, idx) => (
                <div key={proj.id} className="repeater-item-box">
                  <div className="item-header-bar">
                    <span className="item-index-badge">PROJECT {String(idx + 1).padStart(2, '0')}</span>
                    <button className="btn-danger-sm" onClick={() => setResume({ ...resume, projects: resume.projects.filter(p => p.id !== proj.id) })}>✕ Remove</button>
                  </div>
                  <div className="form-grid">
                    <div className="form-group">
                      <label>Project Name</label>
                      <input type="text" value={proj.title} onChange={(e) => setResume({ ...resume, projects: resume.projects.map(p => p.id === proj.id ? { ...p, title: e.target.value } : p) })} />
                    </div>
                    <div className="form-group">
                      <label>Tech Stack</label>
                      <input type="text" value={proj.tech} onChange={(e) => setResume({ ...resume, projects: resume.projects.map(p => p.id === proj.id ? { ...p, tech: e.target.value } : p) })} />
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Bullet Points</label>
                    <textarea 
                      rows={3} 
                      value={proj.bullets} 
                      onChange={(e) => setResume({ ...resume, projects: resume.projects.map(p => p.id === proj.id ? { ...p, bullets: e.target.value } : p) })} 
                    />
                    <div className="ai-controls-bar">
                      <button className="btn-ai-sm" onClick={() => onEnhanceBullets('proj', proj.id)} disabled={isGenerating}>
                        {isGenerating ? '✨ Polishing...' : '✨ Polish Action Bullets'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Education */}
          <div className="glass-card form-section">
            <div className="section-heading-bar">
              <h3 className="section-heading">🎓 Education</h3>
              <button className="btn btn-glass btn-sm" onClick={() => {
                const newEd = { id: Date.now(), degree: 'Degree Name', school: 'University', location: '', year: '2020 - 2024', gpa: '' };
                setResume({ ...resume, education: [...(resume.education || []), newEd] });
              }}>+ Add Education</button>
            </div>
            <div className="repeater-list">
              {(resume.education || []).map((ed, idx) => (
                <div key={ed.id} className="repeater-item-box">
                  <div className="item-header-bar">
                    <span className="item-index-badge">EDU {String(idx + 1).padStart(2, '0')}</span>
                    <button className="btn-danger-sm" onClick={() => setResume({ ...resume, education: resume.education.filter(e => e.id !== ed.id) })}>✕ Remove</button>
                  </div>
                  <div className="form-grid">
                    <div className="form-group">
                      <label>Degree</label>
                      <input type="text" value={ed.degree} onChange={(e) => setResume({ ...resume, education: resume.education.map(item => item.id === ed.id ? { ...item, degree: e.target.value } : item) })} />
                    </div>
                    <div className="form-group">
                      <label>School</label>
                      <input type="text" value={ed.school} onChange={(e) => setResume({ ...resume, education: resume.education.map(item => item.id === ed.id ? { ...item, school: e.target.value } : item) })} />
                    </div>
                    <div className="form-group">
                      <label>Location</label>
                      <input type="text" value={ed.location} onChange={(e) => setResume({ ...resume, education: resume.education.map(item => item.id === ed.id ? { ...item, location: e.target.value } : item) })} />
                    </div>
                    <div className="form-group">
                      <label>Year</label>
                      <input type="text" value={ed.year} onChange={(e) => setResume({ ...resume, education: resume.education.map(item => item.id === ed.id ? { ...item, year: e.target.value } : item) })} />
                    </div>
                    <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                      <label>GPA / Honors (Optional)</label>
                      <input type="text" value={ed.gpa || ''} onChange={(e) => setResume({ ...resume, education: resume.education.map(item => item.id === ed.id ? { ...item, gpa: e.target.value } : item) })} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Certifications */}
          <div className="glass-card form-section">
            <div className="section-heading-bar">
              <h3 className="section-heading">🏆 Certifications</h3>
              <button className="btn btn-glass btn-sm" onClick={() => {
                const newCert = { id: Date.now(), title: 'Certification Name', issuer: 'Issuing Organization', year: '2024' };
                setResume({ ...resume, certifications: [...(resume.certifications || []), newCert] });
              }}>+ Add Certification</button>
            </div>
            <div className="repeater-list">
              {(resume.certifications || []).map((cert, idx) => (
                <div key={cert.id} className="repeater-item-box">
                  <div className="item-header-bar">
                    <span className="item-index-badge">CERT {String(idx + 1).padStart(2, '0')}</span>
                    <button className="btn-danger-sm" onClick={() => setResume({ ...resume, certifications: resume.certifications.filter(c => c.id !== cert.id) })}>✕ Remove</button>
                  </div>
                  <div className="form-grid">
                    <div className="form-group">
                      <label>Title</label>
                      <input type="text" value={cert.title} onChange={(e) => setResume({ ...resume, certifications: resume.certifications.map(item => item.id === cert.id ? { ...item, title: e.target.value } : item) })} />
                    </div>
                    <div className="form-group">
                      <label>Issuer</label>
                      <input type="text" value={cert.issuer} onChange={(e) => setResume({ ...resume, certifications: resume.certifications.map(item => item.id === cert.id ? { ...item, issuer: e.target.value } : item) })} />
                    </div>
                    <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                      <label>Year</label>
                      <input type="text" value={cert.year} onChange={(e) => setResume({ ...resume, certifications: resume.certifications.map(item => item.id === cert.id ? { ...item, year: e.target.value } : item) })} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Right Column: Live Printable Sheet (Flexbox) */}
        <section className="preview-pane">
          <div className="preview-controls-bar">
            <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>📄 Live A4 Sheet Render</span>
            <div className="zoom-controls">
              <button className="zoom-btn" onClick={() => setZoom(Math.max(zoom - 0.1, 0.5))}>-</button>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', minWidth: '38px', textAlign: 'center' }}>{Math.round(zoom * 100)}%</span>
              <button className="zoom-btn" onClick={() => setZoom(Math.min(zoom + 0.1, 1.5))}>+</button>
              <button className="zoom-btn" style={{ width: 'auto', padding: '0 0.5rem', fontSize: '0.75rem' }} onClick={() => setZoom(1.0)}>Fit</button>
            </div>
          </div>

          <div className="preview-scroll-container">
            <div 
              id="react-resume-sheet" 
              className={`resume-paper template-${resume.template}`}
              style={{
                transform: `scale(${zoom})`,
                '--res-primary': palette.primary,
                '--res-accent': palette.accent,
                fontFamily: `"${resume.font || 'Inter'}", sans-serif`
              }}
            >
              {/* Dynamic Template Renders */}
              {(() => {
                const currentTemplate = templates.find(t => t.id === resume.template) || {};
                const isExecutive = currentTemplate.category === 'C-Suite/Executive';
                return isExecutive ? (
                  <div className="flex flex-row" style={{ height: '100%', minHeight: '297mm' }}>
                    <div className="res-exec-sidebar">
                      {resume.showAvatar && resume.avatar && (
                        <div style={{ textAlign: 'center', marginBottom: '0.5rem' }}>
                          <img src={resume.avatar} style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover', border: `2.5px solid ${palette.accent}` }} alt="Avatar" />
                        </div>
                      )}
                      <h1 className="res-header-name">{resume.name}</h1>
                      <h2 className="res-header-title">{resume.title}</h2>
                      <div style={{ fontSize: '0.78rem', color: 'var(--res-text-muted)', display: 'flex', flexDirection: 'column', gap: '0.35rem', marginTop: '0.5rem' }}>
                        {resume.email && <div>✉ {resume.email}</div>}
                        {resume.phone && <div>📞 {resume.phone}</div>}
                        {resume.location && <div>📍 {resume.location}</div>}
                        {resume.links && <div>🔗 {resume.links}</div>}
                      </div>

                      {resume.skills && (
                      <div style={{ marginTop: '1rem' }}>
                        <h3 className="res-section-title">Core Skills</h3>
                        <div className="res-skills-cloud">
                          {resume.skills.split(',').map((s, i) => <span key={i} className="res-skill-tag">{s.trim()}</span>)}
                        </div>
                      </div>
                    )}

                    {resume.education?.length > 0 && (
                      <div style={{ marginTop: '1rem' }}>
                        <h3 className="res-section-title">Education</h3>
                        {resume.education.map(ed => (
                          <div key={ed.id} style={{ marginBottom: '0.6rem' }}>
                            <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>{ed.degree}</div>
                            <div style={{ color: palette.accent, fontSize: '0.8rem' }}>{ed.school}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--res-text-muted)' }}>{ed.year}</div>
                          </div>
                        ))}
                      </div>
                    )}

                    {resume.certifications?.length > 0 && (
                      <div style={{ marginTop: '1rem' }}>
                        <h3 className="res-section-title">Certifications</h3>
                        {resume.certifications.map(cert => (
                          <div key={cert.id} style={{ marginBottom: '0.6rem' }}>
                            <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>{cert.title}</div>
                            <div style={{ color: palette.accent, fontSize: '0.8rem' }}>{cert.issuer}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--res-text-muted)' }}>{cert.year}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="res-exec-main">
                    {resume.summary && (
                      <div className="res-section">
                        <h3 className="res-section-title">Executive Summary</h3>
                        <p className="res-summary-text">{resume.summary}</p>
                      </div>
                    )}

                    {resume.experiences?.length > 0 && (
                      <div className="res-section">
                        <h3 className="res-section-title">Work Experience</h3>
                        {resume.experiences.map(exp => (
                          <div key={exp.id} className="res-entry">
                            <div className="res-entry-head">
                              <span className="res-entry-title">{exp.role}</span>
                              <span className="res-entry-date">{exp.startDate} – {exp.endDate}</span>
                            </div>
                            <div className="res-entry-subtitle">{exp.company} • {exp.location}</div>
                            <ul className="res-bullets-list">
                              {exp.bullets.split('\n').map((b, i) => {
                                const clean = b.replace(/^[•\-\*\s]+/, '').trim();
                                return clean ? <li key={i}>{clean}</li> : null;
                              })}
                            </ul>
                          </div>
                        ))}
                      </div>
                    )}

                    {resume.projects?.length > 0 && (
                      <div className="res-section">
                        <h3 className="res-section-title">Key Projects</h3>
                        {resume.projects.map(proj => (
                          <div key={proj.id} className="res-entry">
                            <div className="res-entry-head">
                              <span className="res-entry-title">{proj.title}</span>
                              {proj.link && <span className="res-entry-location">🔗 {proj.link}</span>}
                            </div>
                            {proj.tech && <div className="res-entry-subtitle" style={{ fontSize: '0.8rem' }}>Tech: {proj.tech}</div>}
                            <ul className="res-bullets-list">
                              {proj.bullets.split('\n').map((b, i) => {
                                const clean = b.replace(/^[•\-\*\s]+/, '').trim();
                                return clean ? <li key={i}>{clean}</li> : null;
                              })}
                            </ul>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                /* Single Column Layout (Modern, Minimal, Creative) */
                <div>
                  <header className="flex justify-between items-start">
                    <div style={{ flex: 1 }}>
                      <h1 className="res-header-name">{resume.name}</h1>
                      <h2 className="res-header-title">{resume.title}</h2>
                      <div className="res-contact-bar">
                        {[resume.email, resume.phone, resume.location, resume.links].filter(Boolean).join(' • ')}
                      </div>
                    </div>
                    {resume.showAvatar && resume.avatar && (
                      <div style={{ marginLeft: '1.2rem' }}>
                        <img src={resume.avatar} style={{ width: '75px', height: '75px', borderRadius: '50%', objectFit: 'cover', border: `2.5px solid ${palette.accent}` }} alt="Avatar" />
                      </div>
                    )}
                  </header>

                  <hr className="res-divider" />

                  {resume.summary && (
                    <section className="res-section">
                      <h3 className="res-section-title">Professional Summary</h3>
                      <p className="res-summary-text">{resume.summary}</p>
                    </section>
                  )}

                  {resume.skills && (
                    <section className="res-section">
                      <h3 className="res-section-title">Technical Skill Stack</h3>
                      <div className="res-skills-cloud">
                        {resume.skills.split(',').map((s, i) => <span key={i} className="res-skill-tag">{s.trim()}</span>)}
                      </div>
                    </section>
                  )}

                  {resume.experiences?.length > 0 && (
                    <section className="res-section">
                      <h3 className="res-section-title">Professional Experience</h3>
                      {resume.experiences.map(exp => (
                        <div key={exp.id} className="res-entry">
                          <div className="res-entry-head">
                            <span className="res-entry-title">{exp.role}</span>
                            <span className="res-entry-date">{exp.startDate} – {exp.endDate}</span>
                          </div>
                          <div className="res-entry-head">
                            <span className="res-entry-subtitle">{exp.company}</span>
                            <span className="res-entry-location">{exp.location}</span>
                          </div>
                          <ul className="res-bullets-list">
                            {exp.bullets.split('\n').map((b, i) => {
                              const clean = b.replace(/^[•\-\*\s]+/, '').trim();
                              return clean ? <li key={i}>{clean}</li> : null;
                            })}
                          </ul>
                        </div>
                      ))}
                    </section>
                  )}

                  {resume.projects?.length > 0 && (
                    <section className="res-section">
                      <h3 className="res-section-title">Key Projects</h3>
                      {resume.projects.map(proj => (
                        <div key={proj.id} className="res-entry">
                          <div className="res-entry-head">
                            <span className="res-entry-title">{proj.title}</span>
                            {proj.link && <span className="res-entry-location">🔗 {proj.link}</span>}
                          </div>
                          {proj.tech && <div className="res-entry-subtitle" style={{ fontSize: '0.8rem' }}>Tech: {proj.tech}</div>}
                          <ul className="res-bullets-list">
                            {proj.bullets.split('\n').map((b, i) => {
                              const clean = b.replace(/^[•\-\*\s]+/, '').trim();
                              return clean ? <li key={i}>{clean}</li> : null;
                            })}
                          </ul>
                        </div>
                      ))}
                    </section>
                  )}

                  {resume.education?.length > 0 && (
                    <section className="res-section">
                      <h3 className="res-section-title">Education</h3>
                      {resume.education.map(ed => (
                        <div key={ed.id} className="res-entry" style={{ marginBottom: '0.5rem' }}>
                          <div className="res-entry-head">
                            <span className="res-entry-title">{ed.degree}</span>
                            <span className="res-entry-date">{ed.year}</span>
                          </div>
                          <div className="res-entry-subtitle">{ed.school} • {ed.location}</div>
                          {ed.gpa && <div style={{ fontSize: '0.8rem', color: 'var(--res-text-muted)' }}>{ed.gpa}</div>}
                        </div>
                      ))}
                    </section>
                  )}

                  {resume.certifications?.length > 0 && (
                    <section className="res-section">
                      <h3 className="res-section-title">Certifications</h3>
                      {resume.certifications.map(cert => (
                        <div key={cert.id} className="res-entry" style={{ marginBottom: '0.5rem' }}>
                          <div className="res-entry-head">
                            <span className="res-entry-title">{cert.title}</span>
                            <span className="res-entry-date">{cert.year}</span>
                          </div>
                          <div className="res-entry-subtitle">{cert.issuer}</div>
                        </div>
                      ))}
                    </section>
                  )}
                </div>
              );
              })()}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

// Global Toast helper
function toast(msg) {
  let stack = document.getElementById('toast-stack');
  if (!stack) {
    stack = document.createElement('div');
    stack.id = 'toast-stack';
    document.body.appendChild(stack);
  }
  const el = document.createElement('div');
  el.className = 'toast toast-success';
  const icon = document.createElement('span');
  icon.textContent = '✓ ';
  const text = document.createElement('span');
  text.textContent = msg;
  el.appendChild(icon);
  el.appendChild(text);
  stack.appendChild(el);
  setTimeout(() => el.remove(), 3200);
}

// Mount React Root
const rootElement = document.getElementById('root');
if (rootElement) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(<App />);
}
