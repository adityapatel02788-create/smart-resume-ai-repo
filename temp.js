/**
 * Smart Resume AI — Full React 18 Application Component
 * Built with Pure CSS Flexbox, Reactive Hooks, and Direct Google Gemini AI Integration
 */

const {
  useState,
  useEffect,
  useRef
} = React;

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
  experiences: [{
    id: 1,
    role: 'Senior Full Stack Engineer',
    company: 'CloudScale Technologies',
    location: 'San Francisco, CA',
    startDate: '2023',
    endDate: 'Present',
    bullets: '• Architected high-throughput microservices using Node.js, FastAPI, and Redis, scaling real-time active user sessions to 100,000+ while maintaining 99.99% uptime.\n• Engineered automated CI/CD deployment pipelines on AWS using GitHub Actions and Docker, reducing production release lead times by 65% and eliminating manual deployment errors.\n• Spearheaded database schema optimization and indexing on PostgreSQL, cutting average query latency from 220ms to 45ms for the core analytics dashboard.\n• Mentored 4 junior developers in React best practices and test-driven development, increasing sprint velocity by 20% over two quarters.'
  }, {
    id: 2,
    role: 'Full Stack Web Developer',
    company: 'Nexus Interactive Labs',
    location: 'San Jose, CA',
    startDate: '2021',
    endDate: '2023',
    bullets: '• Developed responsive client-facing web applications with React, Next.js, and Tailwind CSS, increasing overall user engagement metrics by 32% within the first month of launch.\n• Implemented secure RESTful API endpoints and OAuth 2.0 / JWT authentication protocols for enterprise integrations, successfully passing third-party security audits.\n• Built real-time collaboration features using WebSockets and Socket.io, allowing 50+ concurrent users to edit shared documents without sync conflicts.\n• Collaborated across agile sprints to achieve 94% test coverage using Jest, React Testing Library, and Cypress.'
  }],
  education: [{
    id: 1,
    degree: 'B.S. in Computer Science & Engineering',
    school: 'University Institute of Technology',
    location: 'California, USA',
    year: '2017 – 2021',
    gpa: 'GPA: 3.85 / 4.0 (Dean\'s Honor Roll, Magna Cum Laude)'
  }],
  projects: [{
    id: 1,
    title: 'Smart Resume AI Platform',
    tech: 'React, TypeScript, Google Gemini API, Tailwind CSS',
    link: 'github.com/alex-morgan/smart-resume-ai',
    bullets: '• Engineered a responsive client-side resume studio compiling vector-grade A4 printable documents natively in the browser.\n• Formulated a real-time NLP token matching algorithm calculating ATS job description keyword overlap in under 12ms.\n• Integrated human-in-the-loop AI review modal supporting inline editing, regeneration, and instant approval workflows.'
  }, {
    id: 2,
    title: 'Distributed Asynchronous Task Engine',
    tech: 'Python, FastAPI, Redis, Docker',
    link: 'github.com/alex-morgan/distributed-task-queue',
    bullets: 'Constructed event-driven asynchronous job worker pool supporting priority scheduling and dead-letter recovery.\nBenchmarked system concurrency to successfully execute 20,000 concurrent task runs with zero data degradation.'
  }],
  certifications: [{
    id: 1,
    title: 'AWS Certified Solutions Architect – Professional',
    issuer: 'Amazon Web Services',
    year: '2024'
  }, {
    id: 2,
    title: 'Meta Certified Professional Frontend Developer',
    issuer: 'Meta / Coursera',
    year: '2023'
  }]
};
const COLOR_PALETTES = {
  blue: {
    primary: '#1e3a8a',
    accent: '#2563eb'
  },
  emerald: {
    primary: '#064e3b',
    accent: '#059669'
  },
  purple: {
    primary: '#4c1d95',
    accent: '#7c3aed'
  },
  amber: {
    primary: '#78350f',
    accent: '#d97706'
  },
  rose: {
    primary: '#881337',
    accent: '#e11d48'
  },
  slate: {
    primary: '#0f172a',
    accent: '#334155'
  }
};
const ATS_STOP_WORDS = new Set(['and', 'the', 'to', 'a', 'of', 'in', 'for', 'with', 'on', 'at', 'an', 'is', 'or', 'as', 'be', 'are', 'this', 'that', 'you', 'we', 'will', 'have', 'from', 'by', 'about', 'can', 'our', 'their', 'must', 'should', 'all', 'any', 'has', 'more', 'work', 'working', 'team']);
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
  const [currentView, setCurrentView] = useState(getInitialView);
  const [resumes, setResumes] = useState(() => {
    try {
      const raw = localStorage.getItem('smart_resume_resumes_v4');
      if (raw) return JSON.parse(raw);
    } catch (e) {}
    return [INITIAL_RESUME];
  });
  const [activeResumeId, setActiveResumeId] = useState(() => {
    return localStorage.getItem('smart_resume_active_id_v4') || resumes[0]?.id || 'resume_1';
  });

  // Save activeResumeId
  useEffect(() => {
    try {
      localStorage.setItem('smart_resume_active_id_v4', activeResumeId);
    } catch (e) {}
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
      } catch (e) {}
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
    const resumeText = [resume.name, resume.title, resume.summary, resume.skills, ...resume.experiences.map(e => `${e.role} ${e.company} ${e.bullets}`), ...resume.projects.map(p => `${p.title} ${p.tech} ${p.bullets}`), ...resume.education.map(ed => `${ed.degree} ${ed.school}`)].join(' ').toLowerCase();
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
    let hardTotal = 0,
      softTotal = 0,
      expTotal = 0;
    let hardMatch = 0,
      softMatch = 0,
      expMatch = 0;
    const matched = [];
    const missing = [];
    jdWords.forEach(word => {
      const escapeRegExp = string => string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const wordRegex = new RegExp(`(^|[^a-z0-9])(${escapeRegExp(word)})([^a-z0-9]|$)`, 'i');
      let isMatch = wordRegex.test(resumeText);
      if (!isMatch && SYNONYMS[word]) {
        isMatch = SYNONYMS[word].some(syn => {
          const synRegex = new RegExp(`(^|[^a-z0-9])(${escapeRegExp(syn)})([^a-z0-9]|$)`, 'i');
          return synRegex.test(resumeText);
        });
      }
      let category = 'exp';
      if (HARD_SKILLS.has(word)) category = 'hard';else if (SOFT_SKILLS.has(word)) category = 'soft';
      if (category === 'hard') hardTotal++;else if (category === 'soft') softTotal++;else expTotal++;
      if (isMatch) {
        matched.push(word);
        if (category === 'hard') hardMatch++;else if (category === 'soft') softMatch++;else expMatch++;
      } else {
        missing.push(word);
      }
    });
    const hardScore = hardTotal > 0 ? hardMatch / hardTotal * 40 : hardTotal === 0 ? 40 : 0;
    const softScore = softTotal > 0 ? softMatch / softTotal * 15 : softTotal === 0 ? 15 : 0;
    const expScore = expTotal > 0 ? expMatch / expTotal * 45 : expTotal === 0 ? 45 : 0;
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
  const addSkill = skill => {
    const existing = resume.skills ? resume.skills.trim() : '';
    const updated = existing ? `${existing}, ${skill}` : skill;
    setResume({
      ...resume,
      skills: updated
    });
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
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              contents: [{
                parts: [{
                  text: prompt
                }]
              }],
              systemInstruction: {
                parts: [{
                  text: systemInstruction
                }]
              }
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
              messages: [{
                role: 'system',
                content: systemInstruction
              }, {
                role: 'user',
                content: prompt
              }],
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
          headers: {
            'Content-Type': 'application/json'
          },
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
      onAccept: text => setResume({
        ...resume,
        summary: text
      }),
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
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                contents: [{
                  parts: [{
                    text: prompt
                  }]
                }],
                systemInstruction: {
                  parts: [{
                    text: systemInstruction
                  }]
                }
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
                messages: [{
                  role: 'system',
                  content: systemInstruction
                }, {
                  role: 'user',
                  content: prompt
                }],
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
            headers: {
              'Content-Type': 'application/json'
            },
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
      onAccept: text => {
        if (type === 'exp') {
          setResume({
            ...resume,
            experiences: resume.experiences.map(e => e.id === id ? {
              ...e,
              bullets: text
            } : e)
          });
        } else {
          setResume({
            ...resume,
            projects: resume.projects.map(p => p.id === id ? {
              ...p,
              bullets: text
            } : p)
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
        image: {
          type: 'jpeg',
          quality: 1
        },
        html2canvas: {
          scale: 3,
          useCORS: true,
          logging: false,
          scrollY: 0,
          scrollX: 0
        },
        jsPDF: {
          unit: 'mm',
          format: 'a4',
          orientation: 'portrait'
        },
        pagebreak: {
          mode: ['avoid-all', 'css', 'legacy']
        }
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
  return /*#__PURE__*/React.createElement("div", {
    className: "flex flex-col",
    style: {
      minHeight: '100vh'
    }
  }, /*#__PURE__*/React.createElement("header", {
    className: "navbar"
  }, /*#__PURE__*/React.createElement("div", {
    className: "logo",
    onClick: () => setCurrentView('home')
  }, /*#__PURE__*/React.createElement("div", {
    className: "logo-badge"
  }, /*#__PURE__*/React.createElement("svg", {
    width: "20",
    height: "20",
    viewBox: "0 0 24 24",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M12 2L2 7L12 12L22 7L12 2Z",
    fill: "white"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M2 17L12 22L22 17M2 12L12 17L22 12",
    stroke: "white",
    strokeWidth: "2",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }))), "Smart", /*#__PURE__*/React.createElement("span", {
    className: "highlight"
  }, "Resume AI"), /*#__PURE__*/React.createElement("span", {
    className: "workspace-tag"
  }, "React v4.0")), /*#__PURE__*/React.createElement("nav", {
    className: "nav-links"
  }, /*#__PURE__*/React.createElement("a", {
    className: currentView === 'home' ? 'active' : '',
    onClick: () => setCurrentView('home')
  }, "Home"), /*#__PURE__*/React.createElement("a", {
    className: currentView === 'templates' ? 'active' : '',
    onClick: () => setCurrentView('templates')
  }, "Templates"), /*#__PURE__*/React.createElement("a", {
    className: currentView === 'studio' ? 'active' : '',
    onClick: () => setCurrentView('studio')
  }, "AI Studio"), /*#__PURE__*/React.createElement("a", {
    className: currentView === 'login' ? 'active' : '',
    onClick: () => setCurrentView('login')
  }, "Sign In")), /*#__PURE__*/React.createElement("div", {
    className: "flex items-center gap-sm"
  }, /*#__PURE__*/React.createElement("button", {
    className: "btn btn-glass btn-sm",
    onClick: () => setTheme(theme === 'dark' ? 'light' : 'dark'),
    title: "Toggle Theme",
    style: {
      padding: '0.4rem 0.6rem',
      fontSize: '1rem'
    }
  }, theme === 'dark' ? '☀️' : '🌙'), /*#__PURE__*/React.createElement("div", {
    className: `ai-status-pill ${apiKey ? 'connected' : 'offline'}`,
    onClick: () => setShowApiKeyModal(true),
    style: {
      cursor: 'pointer'
    }
  }, apiKey ? `🟢 Gemini Live (${selectedModel.replace('gemini-', '')})` : '🟡 Smart AI (Offline)'), /*#__PURE__*/React.createElement("button", {
    className: "btn btn-glow btn-sm",
    onClick: () => setCurrentView('studio')
  }, "Launch Studio 🚀"))), currentView === 'home' && /*#__PURE__*/React.createElement(HomeView, {
    onOpenStudio: () => setCurrentView('studio'),
    onSelectTemplate: tpl => {
      setResume({
        ...resume,
        template: tpl
      });
      setCurrentView('studio');
    }
  }), currentView === 'templates' && /*#__PURE__*/React.createElement(TemplatesView, {
    onSelectTemplate: tpl => {
      setResume({
        ...resume,
        template: tpl
      });
      setCurrentView('studio');
    },
    templates: globalTemplates
  }), currentView === 'login' && /*#__PURE__*/React.createElement(LoginView, {
    onLoginSuccess: () => setCurrentView('studio')
  }), currentView === 'studio' && /*#__PURE__*/React.createElement(StudioView, {
    resume: resume,
    setResume: setResume,
    resumes: resumes,
    activeResumeId: activeResumeId,
    onSwitchResume: id => {
      const found = resumes.find(r => r.id === id);
      if (found) {
        setActiveResumeId(id);
        setResume(found);
      }
    },
    onCreateResume: () => {
      const newId = 'resume_' + Date.now();
      const newRes = {
        ...INITIAL_RESUME,
        id: newId,
        name: 'New Candidate',
        experiences: [],
        projects: []
      };
      setResumes([...resumes, newRes]);
      setActiveResumeId(newId);
      setResume(newRes);
    },
    onDuplicateResume: () => {
      const newId = 'resume_' + Date.now();
      const copy = {
        ...resume,
        id: newId,
        name: `${resume.name} (Copy)`
      };
      setResumes([...resumes, copy]);
      setActiveResumeId(newId);
      setResume(copy);
    },
    onDeleteResume: () => {
      if (resumes.length <= 1) {
        toast('Cannot delete the only resume in your profile.');
        return;
      }
      const remaining = resumes.filter(r => r.id !== resume.id);
      setResumes(remaining);
      setActiveResumeId(remaining[0].id);
      setResume(remaining[0]);
    },
    zoom: zoom,
    setZoom: setZoom,
    jobDescription: jobDescription,
    setJobDescription: setJobDescription,
    atsScore: atsScore,
    matchedKeywords: matchedKeywords,
    missingKeywords: missingKeywords,
    atsWarnings: atsWarnings,
    onAddSkill: addSkill,
    onGenerateSummary: handleGenerateSummary,
    onEnhanceBullets: handleEnhanceBullets,
    onExportPDF: exportPDF,
    isGenerating: isGenerating,
    onOpenApiKeyModal: () => setShowApiKeyModal(true),
    palette: palette,
    templates: globalTemplates,
    fonts: globalFonts,
    writingStyles: globalWritingStyles
  }), isGenerating && /*#__PURE__*/React.createElement("div", {
    className: "generating-overlay"
  }, /*#__PURE__*/React.createElement("div", {
    className: "spinner"
  }), /*#__PURE__*/React.createElement("p", null, "AI is analyzing and writing...")), reviewModal && /*#__PURE__*/React.createElement("div", {
    className: "modal-overlay"
  }, /*#__PURE__*/React.createElement("div", {
    className: "ai-review-modal-box"
  }, /*#__PURE__*/React.createElement("div", {
    className: "ai-review-header"
  }, /*#__PURE__*/React.createElement("h3", null, /*#__PURE__*/React.createElement("span", null, "✨"), " AI Suggestion Review & Approval"), /*#__PURE__*/React.createElement("span", {
    className: "ai-review-badge"
  }, reviewModal.badge)), /*#__PURE__*/React.createElement("div", {
    className: "ai-review-body"
  }, /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: '0.84rem',
      color: 'var(--text-muted)'
    }
  }, "Review the AI-generated enhancement. Edit the text directly before accepting or reject it entirely."), reviewModal.originalText && /*#__PURE__*/React.createElement("div", {
    className: "ai-review-section"
  }, /*#__PURE__*/React.createElement("label", null, "Original Draft:"), /*#__PURE__*/React.createElement("div", {
    className: "ai-review-original"
  }, reviewModal.originalText)), /*#__PURE__*/React.createElement("div", {
    className: "ai-review-section"
  }, /*#__PURE__*/React.createElement("label", null, "AI Enhanced Content (Editable):"), /*#__PURE__*/React.createElement("div", {
    className: "ai-review-suggestion"
  }, /*#__PURE__*/React.createElement("textarea", {
    value: reviewModal.aiText,
    onChange: e => setReviewModal({
      ...reviewModal,
      aiText: e.target.value
    }),
    rows: 4
  })))), /*#__PURE__*/React.createElement("div", {
    className: "ai-review-actions"
  }, /*#__PURE__*/React.createElement("button", {
    className: "btn btn-glass btn-sm",
    onClick: reviewModal.onRegenerate
  }, "🔄 Regenerate"), /*#__PURE__*/React.createElement("div", {
    className: "flex gap-sm"
  }, /*#__PURE__*/React.createElement("button", {
    className: "btn btn-glass btn-sm",
    style: {
      color: '#f87171'
    },
    onClick: () => setReviewModal(null)
  }, "✕ Reject"), /*#__PURE__*/React.createElement("button", {
    className: "btn btn-glow btn-sm",
    onClick: () => {
      reviewModal.onAccept(reviewModal.aiText);
      setReviewModal(null);
      toast('Approved & Applied to Resume!');
    }
  }, "✓ Accept & Apply to Resume"))))), showApiKeyModal && /*#__PURE__*/React.createElement("div", {
    className: "modal-overlay"
  }, /*#__PURE__*/React.createElement("div", {
    className: "modal-box",
    style: {
      maxWidth: '540px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex justify-between items-center"
  }, /*#__PURE__*/React.createElement("h3", null, "🔑 Connect Google Gemini AI"), /*#__PURE__*/React.createElement("span", {
    className: `ai-status-pill ${apiKey ? 'connected' : 'offline'}`
  }, apiKey ? 'Live' : 'Offline')), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: '0.85rem',
      color: 'var(--text-muted)',
      lineHeight: '1.5'
    }
  }, "Connect your Gemini API Key for deep generative summaries and XYZ bullet point expansion. Get your free key at ", /*#__PURE__*/React.createElement("a", {
    href: "https://aistudio.google.com/app/apikey",
    target: "_blank",
    style: {
      color: 'var(--accent-cyan)',
      textDecoration: 'underline'
    }
  }, "Google AI Studio"), "."), /*#__PURE__*/React.createElement("div", {
    className: "form-group"
  }, /*#__PURE__*/React.createElement("label", null, "AI Provider & Model"), "\\n", /*#__PURE__*/React.createElement("select", {
    className: "dropdown-select",
    value: selectedModel,
    onChange: e => setSelectedModel(e.target.value)
  }, /*#__PURE__*/React.createElement("optgroup", {
    label: "Google Gemini"
  }, /*#__PURE__*/React.createElement("option", {
    value: "gemini-1.5-flash"
  }, "Gemini 1.5 Flash (Fast & Recommended)"), /*#__PURE__*/React.createElement("option", {
    value: "gemini-2.0-flash"
  }, "Gemini 2.0 Flash (Ultra Low Latency)"), /*#__PURE__*/React.createElement("option", {
    value: "gemini-1.5-pro"
  }, "Gemini 1.5 Pro (Deep Reasoning)")), /*#__PURE__*/React.createElement("optgroup", {
    label: "Groq (Requires Groq API Key)"
  }, /*#__PURE__*/React.createElement("option", {
    value: "llama-3.3-70b-versatile"
  }, "Llama 3.3 70B Versatile")))), /*#__PURE__*/React.createElement("div", {
    className: "form-group"
  }, /*#__PURE__*/React.createElement("label", null, "API Key"), /*#__PURE__*/React.createElement("input", {
    type: "password",
    placeholder: "AIzaSy...",
    value: apiKey,
    onChange: e => setApiKey(e.target.value)
  })), /*#__PURE__*/React.createElement("div", {
    className: "modal-actions"
  }, /*#__PURE__*/React.createElement("button", {
    className: "btn btn-glass btn-sm",
    onClick: () => setShowApiKeyModal(false)
  }, "Cancel"), /*#__PURE__*/React.createElement("button", {
    className: "btn btn-glow btn-sm",
    onClick: () => {
      localStorage.setItem('gemini_api_key', apiKey.trim());
      localStorage.setItem('gemini_selected_model', selectedModel);
      setShowApiKeyModal(false);
      toast(apiKey ? 'Connected to Gemini AI!' : 'Offline AI active.');
    }
  }, "Save & Connect")))), /*#__PURE__*/React.createElement("footer", {
    className: "site-footer"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex flex-col gap-xs"
  }, /*#__PURE__*/React.createElement("div", {
    className: "logo",
    style: {
      fontSize: '1.1rem'
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "logo-badge",
    style: {
      width: '24px',
      height: '24px'
    }
  }, /*#__PURE__*/React.createElement("svg", {
    width: "14",
    height: "14",
    viewBox: "0 0 24 24",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M12 2L2 7L12 12L22 7L12 2Z",
    fill: "white"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M2 17L12 22L22 17M2 12L12 17L22 12",
    stroke: "white",
    strokeWidth: "2",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }))), " Smart", /*#__PURE__*/React.createElement("span", {
    className: "highlight"
  }, "Resume AI")), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: '0.8rem',
      color: 'var(--text-dim)'
    }
  }, "High-Performance AI Resume Engineering & ATS Optimization Platform.")), /*#__PURE__*/React.createElement("div", {
    className: "footer-links"
  }, /*#__PURE__*/React.createElement("a", {
    onClick: () => setCurrentView('home')
  }, "Home"), /*#__PURE__*/React.createElement("a", {
    onClick: () => setCurrentView('templates')
  }, "Templates"), /*#__PURE__*/React.createElement("a", {
    onClick: () => setCurrentView('studio')
  }, "AI Studio"), /*#__PURE__*/React.createElement("a", {
    onClick: () => setCurrentView('login')
  }, "Sign In"))));
}

// ----------------- Home View Component (Flexbox) -----------------
function HomeView({
  onOpenStudio,
  onSelectTemplate
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: "flex flex-col items-center"
  }, /*#__PURE__*/React.createElement("section", {
    className: "hero-section"
  }, /*#__PURE__*/React.createElement("div", {
    className: "hero-content"
  }, /*#__PURE__*/React.createElement("div", {
    className: "badge-wrapper"
  }, /*#__PURE__*/React.createElement("span", {
    className: "badge"
  }, /*#__PURE__*/React.createElement("span", {
    className: "pulse"
  }), " Powered by Google Gemini AI & Real-time ATS Analytics")), /*#__PURE__*/React.createElement("h1", null, "Build ATS-Optimized Resumes ", /*#__PURE__*/React.createElement("br", null), /*#__PURE__*/React.createElement("span", {
    className: "gradient-text"
  }, "In Seconds with AI")), /*#__PURE__*/React.createElement("p", null, "Transform raw experience notes into high-impact, metric-driven bullet points using Google's XYZ formula. Scan job descriptions in real-time, customize 4+ templates, and download vector A4 PDFs without watermarks."), /*#__PURE__*/React.createElement("div", {
    className: "hero-buttons"
  }, /*#__PURE__*/React.createElement("button", {
    className: "btn btn-glow",
    onClick: onOpenStudio
  }, "Launch AI Studio 🚀"), /*#__PURE__*/React.createElement("button", {
    className: "btn btn-glass",
    onClick: () => onSelectTemplate('modern')
  }, "Explore 4+ Templates 🎨"))), /*#__PURE__*/React.createElement("div", {
    className: "hero-image-wrapper"
  }, /*#__PURE__*/React.createElement("img", {
    src: "assets/images/hero-ai-preview.jpg",
    alt: "AI Resume Builder Interface"
  }), /*#__PURE__*/React.createElement("div", {
    className: "hero-image-caption"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex items-center gap-sm"
  }, /*#__PURE__*/React.createElement("span", {
    className: "pulse"
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: '0.85rem',
      fontWeight: 600,
      color: '#f8fafc'
    }
  }, "Next-Gen AI Resume Engine with Live ATS Telemetry")), /*#__PURE__*/React.createElement("button", {
    className: "btn btn-glow btn-sm",
    onClick: onOpenStudio
  }, "Try Live Demo →")))), /*#__PURE__*/React.createElement("section", {
    className: "stats-section"
  }, /*#__PURE__*/React.createElement("div", {
    className: "stat-box"
  }, /*#__PURE__*/React.createElement("h3", {
    className: "gradient-text"
  }, "99.4%"), /*#__PURE__*/React.createElement("p", null, "ATS Parser Match Rate")), /*#__PURE__*/React.createElement("div", {
    className: "stat-box"
  }, /*#__PURE__*/React.createElement("h3", {
    className: "gradient-text"
  }, "< 15ms"), /*#__PURE__*/React.createElement("p", null, "Instant Client NLP Speed")), /*#__PURE__*/React.createElement("div", {
    className: "stat-box"
  }, /*#__PURE__*/React.createElement("h3", {
    className: "gradient-text"
  }, "100%"), /*#__PURE__*/React.createElement("p", null, "Private & Client-Side")), /*#__PURE__*/React.createElement("div", {
    className: "stat-box"
  }, /*#__PURE__*/React.createElement("h3", {
    className: "gradient-text"
  }, "Vector"), /*#__PURE__*/React.createElement("p", null, "Crisp A4 Printable PDF"))), /*#__PURE__*/React.createElement("section", {
    className: "features-section"
  }, /*#__PURE__*/React.createElement("h2", {
    className: "section-title"
  }, "Engineered for Technical High-Achievers"), /*#__PURE__*/React.createElement("p", {
    className: "section-subtitle"
  }, "Everything you need to craft high-converting resumes that breeze through Automated Tracking Systems (ATS) and impress engineering hiring managers."), /*#__PURE__*/React.createElement("div", {
    className: "features-grid"
  }, /*#__PURE__*/React.createElement("div", {
    className: "feature-card"
  }, /*#__PURE__*/React.createElement("div", {
    className: "feature-icon"
  }, "🧠"), /*#__PURE__*/React.createElement("h3", null, "XYZ Bullet Generation"), /*#__PURE__*/React.createElement("p", null, "Automatically rewrite passive job duties into quantifiable achievements using the Google XYZ framework (Accomplished [X] as measured by [Y], by doing [Z]).")), /*#__PURE__*/React.createElement("div", {
    className: "feature-card"
  }, /*#__PURE__*/React.createElement("div", {
    className: "feature-icon"
  }, "🎯"), /*#__PURE__*/React.createElement("h3", null, "Real-time ATS Scoring"), /*#__PURE__*/React.createElement("p", null, "Paste a Job Description and watch your match score update live. Identifies missing keywords and highlights high-impact terms.")), /*#__PURE__*/React.createElement("div", {
    className: "feature-card"
  }, /*#__PURE__*/React.createElement("div", {
    className: "feature-icon"
  }, "🎨"), /*#__PURE__*/React.createElement("h3", null, "React Component Templates"), /*#__PURE__*/React.createElement("p", null, "Our templates aren't dumb HTML. They are responsive React components that elegantly reflow your content to fit exactly on A4 pages without overflow.")))));
}

// ----------------- Templates View (Flexbox) -----------------
function TemplatesView({
  onSelectTemplate,
  templates
}) {
  const [filter, setFilter] = React.useState('all');
  const [search, setSearch] = React.useState('');
  const categories = Array.from(new Set(templates.map(t => t.category))).filter(Boolean);
  const filtered = templates.filter(t => {
    if (filter !== 'all' && t.category !== filter) return false;
    if (search && !t.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });
  return /*#__PURE__*/React.createElement("main", {
    className: "templates-section"
  }, /*#__PURE__*/React.createElement("div", {
    className: "section-header",
    style: {
      textAlign: 'center',
      margin: '1rem auto 2.5rem',
      maxWidth: '650px'
    }
  }, /*#__PURE__*/React.createElement("h1", {
    className: "section-title"
  }, "Engineered for ATS Parsers & Recruiters"), /*#__PURE__*/React.createElement("p", {
    className: "section-subtitle"
  }, "Your resume data carries over automatically between templates without losing a single word. Pick a style to launch directly into the AI Studio.")), /*#__PURE__*/React.createElement("div", {
    className: "filter-wrapper",
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: '1rem',
      alignItems: 'center'
    }
  }, /*#__PURE__*/React.createElement("input", {
    type: "text",
    placeholder: "Search templates...",
    value: search,
    onChange: e => setSearch(e.target.value),
    style: {
      padding: '0.5rem 1rem',
      borderRadius: '4px',
      border: '1px solid var(--border)',
      background: 'var(--bg-elevated)',
      color: 'var(--text)',
      width: '100%',
      maxWidth: '400px'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: '0.5rem',
      justifyContent: 'center'
    }
  }, /*#__PURE__*/React.createElement("button", {
    className: `filter-btn ${filter === 'all' ? 'active' : ''}`,
    onClick: () => setFilter('all')
  }, "All Categories"), categories.map(c => /*#__PURE__*/React.createElement("button", {
    key: c,
    className: `filter-btn ${filter === c ? 'active' : ''}`,
    onClick: () => setFilter(c)
  }, c)))), /*#__PURE__*/React.createElement("div", {
    className: "templates-grid"
  }, filtered.map(t => /*#__PURE__*/React.createElement("div", {
    key: t.id,
    className: "template-card",
    onClick: () => onSelectTemplate(t.id)
  }, /*#__PURE__*/React.createElement("div", {
    className: "template-mockup"
  }, /*#__PURE__*/React.createElement("div", {
    className: "mock-document"
  }, /*#__PURE__*/React.createElement("div", {
    className: "mock-header",
    style: {
      width: '60%',
      marginBottom: '1rem'
    }
  }), /*#__PURE__*/React.createElement("div", {
    className: "mock-line"
  }), /*#__PURE__*/React.createElement("div", {
    className: "mock-line w-80"
  }), /*#__PURE__*/React.createElement("div", {
    className: "mock-header",
    style: {
      width: '40%',
      marginTop: '1rem'
    }
  }), /*#__PURE__*/React.createElement("div", {
    className: "mock-line w-60"
  }), /*#__PURE__*/React.createElement("div", {
    className: "mock-line",
    style: {
      width: '100%',
      marginBottom: '0.8rem'
    }
  }), /*#__PURE__*/React.createElement("div", {
    className: "mock-header"
  }), /*#__PURE__*/React.createElement("div", {
    className: "mock-line"
  }), /*#__PURE__*/React.createElement("div", {
    className: "mock-line w-80"
  }), /*#__PURE__*/React.createElement("div", {
    className: "mock-line w-60"
  }))), /*#__PURE__*/React.createElement("div", {
    className: "card-details"
  }, /*#__PURE__*/React.createElement("span", {
    className: `badge-tag ${t.badgeColor || 'indigo'}`
  }, t.category), /*#__PURE__*/React.createElement("h3", null, t.name), /*#__PURE__*/React.createElement("p", null, t.description || t.desc), /*#__PURE__*/React.createElement("div", {
    className: "feature-pills"
  }, t.pills && t.pills.map((p, i) => /*#__PURE__*/React.createElement("span", {
    key: i
  }, "✓ ", p))), /*#__PURE__*/React.createElement("button", {
    className: "btn btn-glow btn-full",
    onClick: e => {
      e.stopPropagation();
      onSelectTemplate(t.id);
    }
  }, "Apply & Edit in Studio 🚀"))))));
}

// ----------------- Auth / Login View (Flexbox) -----------------
function LoginView({
  onLoginSuccess
}) {
  return /*#__PURE__*/React.createElement("main", {
    className: "flex justify-center items-center",
    style: {
      flex: 1,
      padding: '3rem 1.5rem'
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "glass-card auth-card"
  }, /*#__PURE__*/React.createElement("div", {
    className: "auth-header"
  }, /*#__PURE__*/React.createElement("h2", null, "Welcome to AI Studio (Demo)"), /*#__PURE__*/React.createElement("p", null, "This is a local demo. Sign in or continue as guest to access your local workspace.")), /*#__PURE__*/React.createElement("form", {
    className: "auth-form",
    onSubmit: e => {
      e.preventDefault();
      onLoginSuccess();
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "form-group"
  }, /*#__PURE__*/React.createElement("label", null, "Email Address"), /*#__PURE__*/React.createElement("input", {
    type: "email",
    defaultValue: "alex.morgan@devstudio.io",
    required: true
  })), /*#__PURE__*/React.createElement("div", {
    className: "form-group"
  }, /*#__PURE__*/React.createElement("label", null, "Password"), /*#__PURE__*/React.createElement("input", {
    type: "password",
    defaultValue: "password123",
    required: true
  })), /*#__PURE__*/React.createElement("button", {
    type: "submit",
    className: "btn btn-glow btn-full"
  }, "Sign In to Studio 🚀")), /*#__PURE__*/React.createElement("div", {
    className: "auth-divider"
  }, /*#__PURE__*/React.createElement("span", null, "OR")), /*#__PURE__*/React.createElement("button", {
    className: "btn btn-glass btn-full",
    onClick: onLoginSuccess
  }, "🌐 Continue as Guest")));
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
  return /*#__PURE__*/React.createElement("div", {
    className: "flex flex-col",
    style: {
      width: '100%'
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "studio-header"
  }, /*#__PURE__*/React.createElement("div", {
    className: "studio-brand"
  }, /*#__PURE__*/React.createElement("select", {
    className: "dropdown-select",
    value: resume.id,
    onChange: e => onSwitchResume(e.target.value)
  }, resumes.map(r => /*#__PURE__*/React.createElement("option", {
    key: r.id,
    value: r.id
  }, "📄 ", r.name || 'Untitled', " (", r.title || 'Draft', ")"))), /*#__PURE__*/React.createElement("button", {
    className: "btn btn-glass btn-sm",
    onClick: onCreateResume
  }, "+ New"), /*#__PURE__*/React.createElement("button", {
    className: "btn btn-glass btn-sm",
    onClick: onDuplicateResume
  }, "📑 Duplicate"), /*#__PURE__*/React.createElement("button", {
    className: "btn btn-glass btn-sm",
    style: {
      color: '#f87171'
    },
    onClick: onDeleteResume
  }, "🗑️")), /*#__PURE__*/React.createElement("div", {
    className: "studio-toolbar"
  }, /*#__PURE__*/React.createElement("select", {
    className: "dropdown-select",
    value: resume.template,
    onChange: e => setResume({
      ...resume,
      template: e.target.value
    })
  }, templates.map(t => /*#__PURE__*/React.createElement("option", {
    key: t.id,
    value: t.id
  }, "📄 ", t.name))), /*#__PURE__*/React.createElement("select", {
    className: "dropdown-select",
    value: resume.writingStyle || 'professional',
    onChange: e => setResume({
      ...resume,
      writingStyle: e.target.value
    })
  }, writingStyles.map(s => /*#__PURE__*/React.createElement("option", {
    key: s.id,
    value: s.id
  }, s.name))), /*#__PURE__*/React.createElement("select", {
    className: "dropdown-select",
    value: resume.font,
    onChange: e => setResume({
      ...resume,
      font: e.target.value
    })
  }, fonts.map(f => /*#__PURE__*/React.createElement("option", {
    key: f.id,
    value: f.id
  }, f.name, " (", f.category, ")"))), "\\n          ", /*#__PURE__*/React.createElement("div", {
    className: "color-picker-group"
  }, ['blue', 'emerald', 'purple', 'amber', 'rose', 'slate'].map(c => /*#__PURE__*/React.createElement("div", {
    key: c,
    className: `color-dot dot-${c} ${resume.color === c ? 'active' : ''}`,
    onClick: () => setResume({
      ...resume,
      color: c
    })
  }))), /*#__PURE__*/React.createElement("button", {
    className: "btn btn-glass btn-sm",
    onClick: onOpenApiKeyModal
  }, "🔑 Gemini Key"), /*#__PURE__*/React.createElement("button", {
    className: "btn btn-glow btn-sm",
    onClick: onExportPDF
  }, "📥 Download PDF"))), /*#__PURE__*/React.createElement("div", {
    className: "workspace-container"
  }, /*#__PURE__*/React.createElement("section", {
    className: "editor-pane"
  }, /*#__PURE__*/React.createElement("div", {
    className: "glass-card ats-score-card"
  }, /*#__PURE__*/React.createElement("div", {
    className: "ats-header"
  }, /*#__PURE__*/React.createElement("span", null, "🎯 Real-Time ATS Keyword Matcher"), /*#__PURE__*/React.createElement("span", {
    className: "ats-score-badge",
    style: {
      background: atsScore >= 75 ? 'rgba(16, 185, 129, 0.2)' : atsScore >= 45 ? 'rgba(245, 158, 11, 0.2)' : 'rgba(239, 68, 68, 0.2)',
      color: atsScore >= 75 ? '#34d399' : atsScore >= 45 ? '#fbbf24' : '#f87171'
    }
  }, atsScore, "% Match")), /*#__PURE__*/React.createElement("div", {
    className: "progress-bar-bg"
  }, /*#__PURE__*/React.createElement("div", {
    className: "progress-bar-fill",
    style: {
      width: `${atsScore}%`
    }
  })), /*#__PURE__*/React.createElement("textarea", {
    rows: 2,
    placeholder: "Paste target Job Description here to scan keyword overlap...",
    value: jobDescription,
    onChange: e => setJobDescription(e.target.value)
  }), /*#__PURE__*/React.createElement("div", {
    className: "ats-keywords-container"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex justify-between items-center"
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontWeight: 600,
      color: 'var(--text-muted)',
      fontSize: '0.75rem'
    }
  }, "DETECTED KEYWORDS:"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: '0.7rem',
      color: 'var(--text-dim)'
    }
  }, "(Click yellow to add to skills)")), /*#__PURE__*/React.createElement("div", {
    className: "ats-keywords-chips"
  }, matchedKeywords.map((k, i) => /*#__PURE__*/React.createElement("span", {
    key: i,
    className: "chip-match"
  }, "✓ ", k)), missingKeywords.map((k, i) => /*#__PURE__*/React.createElement("span", {
    key: i,
    className: "chip-missing",
    onClick: () => onAddSkill(k)
  }, "+ ", k)))), atsWarnings?.length > 0 && /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: '1rem',
      padding: '0.75rem',
      background: 'rgba(239, 68, 68, 0.1)',
      borderRadius: '6px',
      border: '1px solid rgba(239, 68, 68, 0.2)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontWeight: 600,
      color: '#f87171',
      fontSize: '0.75rem',
      display: 'block',
      marginBottom: '0.25rem'
    }
  }, "⚠️ ATS WARNINGS"), /*#__PURE__*/React.createElement("ul", {
    style: {
      margin: 0,
      paddingLeft: '1.25rem',
      fontSize: '0.8rem',
      color: 'var(--text-dim)'
    }
  }, atsWarnings.map((w, i) => /*#__PURE__*/React.createElement("li", {
    key: i
  }, w))))), /*#__PURE__*/React.createElement("div", {
    className: "glass-card form-section"
  }, /*#__PURE__*/React.createElement("h3", {
    className: "section-heading"
  }, "👤 Candidate Profile"), /*#__PURE__*/React.createElement("div", {
    className: "avatar-upload-box"
  }, /*#__PURE__*/React.createElement("img", {
    src: resume.avatar,
    alt: "Candidate Profile",
    className: "avatar-preview-img"
  }), /*#__PURE__*/React.createElement("div", {
    className: "flex flex-col gap-xs"
  }, /*#__PURE__*/React.createElement("label", {
    className: "flex items-center gap-xs",
    style: {
      cursor: 'pointer',
      fontSize: '0.82rem',
      fontWeight: 600
    }
  }, /*#__PURE__*/React.createElement("input", {
    type: "checkbox",
    checked: resume.showAvatar,
    onChange: e => setResume({
      ...resume,
      showAvatar: e.target.checked
    })
  }), "Display Profile Photo on Resume"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: '0.75rem',
      color: 'var(--text-dim)'
    }
  }, "AI Generated Professional Studio Portrait"))), /*#__PURE__*/React.createElement("div", {
    className: "form-grid"
  }, /*#__PURE__*/React.createElement("div", {
    className: "form-group"
  }, /*#__PURE__*/React.createElement("label", null, "Full Name"), /*#__PURE__*/React.createElement("input", {
    type: "text",
    value: resume.name,
    onChange: e => setResume({
      ...resume,
      name: e.target.value
    })
  })), /*#__PURE__*/React.createElement("div", {
    className: "form-group"
  }, /*#__PURE__*/React.createElement("label", null, "Target Role Title"), /*#__PURE__*/React.createElement("input", {
    type: "text",
    value: resume.title,
    onChange: e => setResume({
      ...resume,
      title: e.target.value
    })
  })), /*#__PURE__*/React.createElement("div", {
    className: "form-group"
  }, /*#__PURE__*/React.createElement("label", null, "Email Address"), /*#__PURE__*/React.createElement("input", {
    type: "email",
    value: resume.email,
    onChange: e => setResume({
      ...resume,
      email: e.target.value
    })
  })), /*#__PURE__*/React.createElement("div", {
    className: "form-group"
  }, /*#__PURE__*/React.createElement("label", null, "Phone Number"), /*#__PURE__*/React.createElement("input", {
    type: "text",
    value: resume.phone,
    onChange: e => setResume({
      ...resume,
      phone: e.target.value
    })
  })), /*#__PURE__*/React.createElement("div", {
    className: "form-group"
  }, /*#__PURE__*/React.createElement("label", null, "Location"), /*#__PURE__*/React.createElement("input", {
    type: "text",
    value: resume.location,
    onChange: e => setResume({
      ...resume,
      location: e.target.value
    })
  })), /*#__PURE__*/React.createElement("div", {
    className: "form-group"
  }, /*#__PURE__*/React.createElement("label", null, "Portfolio / Links"), /*#__PURE__*/React.createElement("input", {
    type: "text",
    value: resume.links,
    onChange: e => setResume({
      ...resume,
      links: e.target.value
    })
  })))), /*#__PURE__*/React.createElement("div", {
    className: "glass-card form-section"
  }, /*#__PURE__*/React.createElement("div", {
    className: "section-heading-bar"
  }, /*#__PURE__*/React.createElement("h3", {
    className: "section-heading"
  }, "📝 Executive Summary"), /*#__PURE__*/React.createElement("button", {
    className: "btn-ai-sparkle",
    onClick: onGenerateSummary,
    disabled: isGenerating
  }, isGenerating ? '✨ Generating...' : '✨ Generate with AI')), /*#__PURE__*/React.createElement("textarea", {
    rows: 4,
    value: resume.summary,
    onChange: e => setResume({
      ...resume,
      summary: e.target.value
    })
  })), /*#__PURE__*/React.createElement("div", {
    className: "glass-card form-section"
  }, /*#__PURE__*/React.createElement("h3", {
    className: "section-heading"
  }, "🛠️ Technical Skills"), /*#__PURE__*/React.createElement("input", {
    type: "text",
    value: resume.skills,
    onChange: e => setResume({
      ...resume,
      skills: e.target.value
    })
  }), /*#__PURE__*/React.createElement("div", {
    className: "skills-recommendations"
  }, ['TypeScript', 'React.js', 'Next.js', 'Node.js', 'Python', 'Docker', 'AWS', 'PostgreSQL', 'GraphQL', 'Tailwind CSS'].map(s => /*#__PURE__*/React.createElement("span", {
    key: s,
    className: "skill-rec-pill",
    onClick: () => onAddSkill(s)
  }, "+ ", s)))), /*#__PURE__*/React.createElement("div", {
    className: "glass-card form-section"
  }, /*#__PURE__*/React.createElement("div", {
    className: "section-heading-bar"
  }, /*#__PURE__*/React.createElement("h3", {
    className: "section-heading"
  }, "💼 Work Experience"), /*#__PURE__*/React.createElement("button", {
    className: "btn btn-glass btn-sm",
    onClick: () => {
      const newExp = {
        id: Date.now(),
        role: 'Software Engineer',
        company: 'Company Name',
        location: 'Location',
        startDate: '2023',
        endDate: 'Present',
        bullets: 'Accomplished key milestones...'
      };
      setResume({
        ...resume,
        experiences: [...resume.experiences, newExp]
      });
    }
  }, "+ Add Position")), /*#__PURE__*/React.createElement("div", {
    className: "repeater-list"
  }, resume.experiences.map((exp, idx) => /*#__PURE__*/React.createElement("div", {
    key: exp.id,
    className: "repeater-item-box"
  }, /*#__PURE__*/React.createElement("div", {
    className: "item-header-bar"
  }, /*#__PURE__*/React.createElement("span", {
    className: "item-index-badge"
  }, "POSITION ", String(idx + 1).padStart(2, '0')), /*#__PURE__*/React.createElement("button", {
    className: "btn-danger-sm",
    onClick: () => setResume({
      ...resume,
      experiences: resume.experiences.filter(e => e.id !== exp.id)
    })
  }, "✕ Remove")), /*#__PURE__*/React.createElement("div", {
    className: "form-grid"
  }, /*#__PURE__*/React.createElement("div", {
    className: "form-group"
  }, /*#__PURE__*/React.createElement("label", null, "Role"), /*#__PURE__*/React.createElement("input", {
    type: "text",
    value: exp.role,
    onChange: e => setResume({
      ...resume,
      experiences: resume.experiences.map(item => item.id === exp.id ? {
        ...item,
        role: e.target.value
      } : item)
    })
  })), /*#__PURE__*/React.createElement("div", {
    className: "form-group"
  }, /*#__PURE__*/React.createElement("label", null, "Company"), /*#__PURE__*/React.createElement("input", {
    type: "text",
    value: exp.company,
    onChange: e => setResume({
      ...resume,
      experiences: resume.experiences.map(item => item.id === exp.id ? {
        ...item,
        company: e.target.value
      } : item)
    })
  }))), /*#__PURE__*/React.createElement("div", {
    className: "form-group"
  }, /*#__PURE__*/React.createElement("label", null, "Accomplishments (Google XYZ Formula)"), /*#__PURE__*/React.createElement("textarea", {
    rows: 3,
    value: exp.bullets,
    onChange: e => setResume({
      ...resume,
      experiences: resume.experiences.map(item => item.id === exp.id ? {
        ...item,
        bullets: e.target.value
      } : item)
    })
  }), /*#__PURE__*/React.createElement("div", {
    className: "ai-controls-bar"
  }, /*#__PURE__*/React.createElement("button", {
    className: "btn-ai-sm",
    onClick: () => onEnhanceBullets('exp', exp.id),
    disabled: isGenerating
  }, isGenerating ? '✨ Polishing...' : '✨ Polish Action Bullets'))))))), /*#__PURE__*/React.createElement("div", {
    className: "glass-card form-section"
  }, /*#__PURE__*/React.createElement("div", {
    className: "section-heading-bar"
  }, /*#__PURE__*/React.createElement("h3", {
    className: "section-heading"
  }, "🚀 Key Projects"), /*#__PURE__*/React.createElement("button", {
    className: "btn btn-glass btn-sm",
    onClick: () => {
      const newProj = {
        id: Date.now(),
        title: 'Project Title',
        tech: 'Tech Stack',
        link: '',
        bullets: 'Built high-impact features...'
      };
      setResume({
        ...resume,
        projects: [...resume.projects, newProj]
      });
    }
  }, "+ Add Project")), /*#__PURE__*/React.createElement("div", {
    className: "repeater-list"
  }, resume.projects.map((proj, idx) => /*#__PURE__*/React.createElement("div", {
    key: proj.id,
    className: "repeater-item-box"
  }, /*#__PURE__*/React.createElement("div", {
    className: "item-header-bar"
  }, /*#__PURE__*/React.createElement("span", {
    className: "item-index-badge"
  }, "PROJECT ", String(idx + 1).padStart(2, '0')), /*#__PURE__*/React.createElement("button", {
    className: "btn-danger-sm",
    onClick: () => setResume({
      ...resume,
      projects: resume.projects.filter(p => p.id !== proj.id)
    })
  }, "✕ Remove")), /*#__PURE__*/React.createElement("div", {
    className: "form-grid"
  }, /*#__PURE__*/React.createElement("div", {
    className: "form-group"
  }, /*#__PURE__*/React.createElement("label", null, "Project Name"), /*#__PURE__*/React.createElement("input", {
    type: "text",
    value: proj.title,
    onChange: e => setResume({
      ...resume,
      projects: resume.projects.map(p => p.id === proj.id ? {
        ...p,
        title: e.target.value
      } : p)
    })
  })), /*#__PURE__*/React.createElement("div", {
    className: "form-group"
  }, /*#__PURE__*/React.createElement("label", null, "Tech Stack"), /*#__PURE__*/React.createElement("input", {
    type: "text",
    value: proj.tech,
    onChange: e => setResume({
      ...resume,
      projects: resume.projects.map(p => p.id === proj.id ? {
        ...p,
        tech: e.target.value
      } : p)
    })
  }))), /*#__PURE__*/React.createElement("div", {
    className: "form-group"
  }, /*#__PURE__*/React.createElement("label", null, "Bullet Points"), /*#__PURE__*/React.createElement("textarea", {
    rows: 3,
    value: proj.bullets,
    onChange: e => setResume({
      ...resume,
      projects: resume.projects.map(p => p.id === proj.id ? {
        ...p,
        bullets: e.target.value
      } : p)
    })
  }), /*#__PURE__*/React.createElement("div", {
    className: "ai-controls-bar"
  }, /*#__PURE__*/React.createElement("button", {
    className: "btn-ai-sm",
    onClick: () => onEnhanceBullets('proj', proj.id),
    disabled: isGenerating
  }, isGenerating ? '✨ Polishing...' : '✨ Polish Action Bullets'))))))), /*#__PURE__*/React.createElement("div", {
    className: "glass-card form-section"
  }, /*#__PURE__*/React.createElement("div", {
    className: "section-heading-bar"
  }, /*#__PURE__*/React.createElement("h3", {
    className: "section-heading"
  }, "🎓 Education"), /*#__PURE__*/React.createElement("button", {
    className: "btn btn-glass btn-sm",
    onClick: () => {
      const newEd = {
        id: Date.now(),
        degree: 'Degree Name',
        school: 'University',
        location: '',
        year: '2020 - 2024',
        gpa: ''
      };
      setResume({
        ...resume,
        education: [...(resume.education || []), newEd]
      });
    }
  }, "+ Add Education")), /*#__PURE__*/React.createElement("div", {
    className: "repeater-list"
  }, (resume.education || []).map((ed, idx) => /*#__PURE__*/React.createElement("div", {
    key: ed.id,
    className: "repeater-item-box"
  }, /*#__PURE__*/React.createElement("div", {
    className: "item-header-bar"
  }, /*#__PURE__*/React.createElement("span", {
    className: "item-index-badge"
  }, "EDU ", String(idx + 1).padStart(2, '0')), /*#__PURE__*/React.createElement("button", {
    className: "btn-danger-sm",
    onClick: () => setResume({
      ...resume,
      education: resume.education.filter(e => e.id !== ed.id)
    })
  }, "✕ Remove")), /*#__PURE__*/React.createElement("div", {
    className: "form-grid"
  }, /*#__PURE__*/React.createElement("div", {
    className: "form-group"
  }, /*#__PURE__*/React.createElement("label", null, "Degree"), /*#__PURE__*/React.createElement("input", {
    type: "text",
    value: ed.degree,
    onChange: e => setResume({
      ...resume,
      education: resume.education.map(item => item.id === ed.id ? {
        ...item,
        degree: e.target.value
      } : item)
    })
  })), /*#__PURE__*/React.createElement("div", {
    className: "form-group"
  }, /*#__PURE__*/React.createElement("label", null, "School"), /*#__PURE__*/React.createElement("input", {
    type: "text",
    value: ed.school,
    onChange: e => setResume({
      ...resume,
      education: resume.education.map(item => item.id === ed.id ? {
        ...item,
        school: e.target.value
      } : item)
    })
  })), /*#__PURE__*/React.createElement("div", {
    className: "form-group"
  }, /*#__PURE__*/React.createElement("label", null, "Location"), /*#__PURE__*/React.createElement("input", {
    type: "text",
    value: ed.location,
    onChange: e => setResume({
      ...resume,
      education: resume.education.map(item => item.id === ed.id ? {
        ...item,
        location: e.target.value
      } : item)
    })
  })), /*#__PURE__*/React.createElement("div", {
    className: "form-group"
  }, /*#__PURE__*/React.createElement("label", null, "Year"), /*#__PURE__*/React.createElement("input", {
    type: "text",
    value: ed.year,
    onChange: e => setResume({
      ...resume,
      education: resume.education.map(item => item.id === ed.id ? {
        ...item,
        year: e.target.value
      } : item)
    })
  })), /*#__PURE__*/React.createElement("div", {
    className: "form-group",
    style: {
      gridColumn: '1 / -1'
    }
  }, /*#__PURE__*/React.createElement("label", null, "GPA / Honors (Optional)"), /*#__PURE__*/React.createElement("input", {
    type: "text",
    value: ed.gpa || '',
    onChange: e => setResume({
      ...resume,
      education: resume.education.map(item => item.id === ed.id ? {
        ...item,
        gpa: e.target.value
      } : item)
    })
  }))))))), /*#__PURE__*/React.createElement("div", {
    className: "glass-card form-section"
  }, /*#__PURE__*/React.createElement("div", {
    className: "section-heading-bar"
  }, /*#__PURE__*/React.createElement("h3", {
    className: "section-heading"
  }, "🏆 Certifications"), /*#__PURE__*/React.createElement("button", {
    className: "btn btn-glass btn-sm",
    onClick: () => {
      const newCert = {
        id: Date.now(),
        title: 'Certification Name',
        issuer: 'Issuing Organization',
        year: '2024'
      };
      setResume({
        ...resume,
        certifications: [...(resume.certifications || []), newCert]
      });
    }
  }, "+ Add Certification")), /*#__PURE__*/React.createElement("div", {
    className: "repeater-list"
  }, (resume.certifications || []).map((cert, idx) => /*#__PURE__*/React.createElement("div", {
    key: cert.id,
    className: "repeater-item-box"
  }, /*#__PURE__*/React.createElement("div", {
    className: "item-header-bar"
  }, /*#__PURE__*/React.createElement("span", {
    className: "item-index-badge"
  }, "CERT ", String(idx + 1).padStart(2, '0')), /*#__PURE__*/React.createElement("button", {
    className: "btn-danger-sm",
    onClick: () => setResume({
      ...resume,
      certifications: resume.certifications.filter(c => c.id !== cert.id)
    })
  }, "✕ Remove")), /*#__PURE__*/React.createElement("div", {
    className: "form-grid"
  }, /*#__PURE__*/React.createElement("div", {
    className: "form-group"
  }, /*#__PURE__*/React.createElement("label", null, "Title"), /*#__PURE__*/React.createElement("input", {
    type: "text",
    value: cert.title,
    onChange: e => setResume({
      ...resume,
      certifications: resume.certifications.map(item => item.id === cert.id ? {
        ...item,
        title: e.target.value
      } : item)
    })
  })), /*#__PURE__*/React.createElement("div", {
    className: "form-group"
  }, /*#__PURE__*/React.createElement("label", null, "Issuer"), /*#__PURE__*/React.createElement("input", {
    type: "text",
    value: cert.issuer,
    onChange: e => setResume({
      ...resume,
      certifications: resume.certifications.map(item => item.id === cert.id ? {
        ...item,
        issuer: e.target.value
      } : item)
    })
  })), /*#__PURE__*/React.createElement("div", {
    className: "form-group",
    style: {
      gridColumn: '1 / -1'
    }
  }, /*#__PURE__*/React.createElement("label", null, "Year"), /*#__PURE__*/React.createElement("input", {
    type: "text",
    value: cert.year,
    onChange: e => setResume({
      ...resume,
      certifications: resume.certifications.map(item => item.id === cert.id ? {
        ...item,
        year: e.target.value
      } : item)
    })
  })))))))), /*#__PURE__*/React.createElement("section", {
    className: "preview-pane"
  }, /*#__PURE__*/React.createElement("div", {
    className: "preview-controls-bar"
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontWeight: 600,
      color: 'var(--text-main)'
    }
  }, "📄 Live A4 Sheet Render"), /*#__PURE__*/React.createElement("div", {
    className: "zoom-controls"
  }, /*#__PURE__*/React.createElement("button", {
    className: "zoom-btn",
    onClick: () => setZoom(Math.max(zoom - 0.1, 0.5))
  }, "-"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: '0.75rem',
      minWidth: '38px',
      textAlign: 'center'
    }
  }, Math.round(zoom * 100), "%"), /*#__PURE__*/React.createElement("button", {
    className: "zoom-btn",
    onClick: () => setZoom(Math.min(zoom + 0.1, 1.5))
  }, "+"), /*#__PURE__*/React.createElement("button", {
    className: "zoom-btn",
    style: {
      width: 'auto',
      padding: '0 0.5rem',
      fontSize: '0.75rem'
    },
    onClick: () => setZoom(1.0)
  }, "Fit"))), /*#__PURE__*/React.createElement("div", {
    className: "preview-scroll-container"
  }, /*#__PURE__*/React.createElement("div", {
    id: "react-resume-sheet",
    className: `resume-paper template-${resume.template}`,
    style: {
      transform: `scale(${zoom})`,
      '--res-primary': palette.primary,
      '--res-accent': palette.accent,
      fontFamily: `"${resume.font || 'Inter'}", sans-serif`
    }
  }, (() => {
    const currentTemplate = templates.find(t => t.id === resume.template) || {};
    const isExecutive = currentTemplate.category === 'C-Suite/Executive';
    return isExecutive ? /*#__PURE__*/React.createElement("div", {
      className: "flex flex-row",
      style: {
        height: '100%',
        minHeight: '297mm'
      }
    }, /*#__PURE__*/React.createElement("div", {
      className: "res-exec-sidebar"
    }, resume.showAvatar && resume.avatar && /*#__PURE__*/React.createElement("div", {
      style: {
        textAlign: 'center',
        marginBottom: '0.5rem'
      }
    }, /*#__PURE__*/React.createElement("img", {
      src: resume.avatar,
      style: {
        width: '80px',
        height: '80px',
        borderRadius: '50%',
        objectFit: 'cover',
        border: `2.5px solid ${palette.accent}`
      },
      alt: "Avatar"
    })), /*#__PURE__*/React.createElement("h1", {
      className: "res-header-name"
    }, resume.name), /*#__PURE__*/React.createElement("h2", {
      className: "res-header-title"
    }, resume.title), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: '0.78rem',
        color: 'var(--res-text-muted)',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.35rem',
        marginTop: '0.5rem'
      }
    }, resume.email && /*#__PURE__*/React.createElement("div", null, "✉ ", resume.email), resume.phone && /*#__PURE__*/React.createElement("div", null, "📞 ", resume.phone), resume.location && /*#__PURE__*/React.createElement("div", null, "📍 ", resume.location), resume.links && /*#__PURE__*/React.createElement("div", null, "🔗 ", resume.links)), resume.skills && /*#__PURE__*/React.createElement("div", {
      style: {
        marginTop: '1rem'
      }
    }, /*#__PURE__*/React.createElement("h3", {
      className: "res-section-title"
    }, "Core Skills"), /*#__PURE__*/React.createElement("div", {
      className: "res-skills-cloud"
    }, resume.skills.split(',').map((s, i) => /*#__PURE__*/React.createElement("span", {
      key: i,
      className: "res-skill-tag"
    }, s.trim())))), resume.education?.length > 0 && /*#__PURE__*/React.createElement("div", {
      style: {
        marginTop: '1rem'
      }
    }, /*#__PURE__*/React.createElement("h3", {
      className: "res-section-title"
    }, "Education"), resume.education.map(ed => /*#__PURE__*/React.createElement("div", {
      key: ed.id,
      style: {
        marginBottom: '0.6rem'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontWeight: 700,
        fontSize: '0.85rem'
      }
    }, ed.degree), /*#__PURE__*/React.createElement("div", {
      style: {
        color: palette.accent,
        fontSize: '0.8rem'
      }
    }, ed.school), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: '0.75rem',
        color: 'var(--res-text-muted)'
      }
    }, ed.year)))), resume.certifications?.length > 0 && /*#__PURE__*/React.createElement("div", {
      style: {
        marginTop: '1rem'
      }
    }, /*#__PURE__*/React.createElement("h3", {
      className: "res-section-title"
    }, "Certifications"), resume.certifications.map(cert => /*#__PURE__*/React.createElement("div", {
      key: cert.id,
      style: {
        marginBottom: '0.6rem'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontWeight: 700,
        fontSize: '0.85rem'
      }
    }, cert.title), /*#__PURE__*/React.createElement("div", {
      style: {
        color: palette.accent,
        fontSize: '0.8rem'
      }
    }, cert.issuer), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: '0.75rem',
        color: 'var(--res-text-muted)'
      }
    }, cert.year))))), /*#__PURE__*/React.createElement("div", {
      className: "res-exec-main"
    }, resume.summary && /*#__PURE__*/React.createElement("div", {
      className: "res-section"
    }, /*#__PURE__*/React.createElement("h3", {
      className: "res-section-title"
    }, "Executive Summary"), /*#__PURE__*/React.createElement("p", {
      className: "res-summary-text"
    }, resume.summary)), resume.experiences?.length > 0 && /*#__PURE__*/React.createElement("div", {
      className: "res-section"
    }, /*#__PURE__*/React.createElement("h3", {
      className: "res-section-title"
    }, "Work Experience"), resume.experiences.map(exp => /*#__PURE__*/React.createElement("div", {
      key: exp.id,
      className: "res-entry"
    }, /*#__PURE__*/React.createElement("div", {
      className: "res-entry-head"
    }, /*#__PURE__*/React.createElement("span", {
      className: "res-entry-title"
    }, exp.role), /*#__PURE__*/React.createElement("span", {
      className: "res-entry-date"
    }, exp.startDate, " – ", exp.endDate)), /*#__PURE__*/React.createElement("div", {
      className: "res-entry-subtitle"
    }, exp.company, " • ", exp.location), /*#__PURE__*/React.createElement("ul", {
      className: "res-bullets-list"
    }, exp.bullets.split('\n').map((b, i) => {
      const clean = b.replace(/^[•\-\*\s]+/, '').trim();
      return clean ? /*#__PURE__*/React.createElement("li", {
        key: i
      }, clean) : null;
    }))))), resume.projects?.length > 0 && /*#__PURE__*/React.createElement("div", {
      className: "res-section"
    }, /*#__PURE__*/React.createElement("h3", {
      className: "res-section-title"
    }, "Key Projects"), resume.projects.map(proj => /*#__PURE__*/React.createElement("div", {
      key: proj.id,
      className: "res-entry"
    }, /*#__PURE__*/React.createElement("div", {
      className: "res-entry-head"
    }, /*#__PURE__*/React.createElement("span", {
      className: "res-entry-title"
    }, proj.title), proj.link && /*#__PURE__*/React.createElement("span", {
      className: "res-entry-location"
    }, "🔗 ", proj.link)), proj.tech && /*#__PURE__*/React.createElement("div", {
      className: "res-entry-subtitle",
      style: {
        fontSize: '0.8rem'
      }
    }, "Tech: ", proj.tech), /*#__PURE__*/React.createElement("ul", {
      className: "res-bullets-list"
    }, proj.bullets.split('\n').map((b, i) => {
      const clean = b.replace(/^[•\-\*\s]+/, '').trim();
      return clean ? /*#__PURE__*/React.createElement("li", {
        key: i
      }, clean) : null;
    }))))))) :
    /*#__PURE__*/
    /* Single Column Layout (Modern, Minimal, Creative) */
    React.createElement("div", null, /*#__PURE__*/React.createElement("header", {
      className: "flex justify-between items-start"
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1
      }
    }, /*#__PURE__*/React.createElement("h1", {
      className: "res-header-name"
    }, resume.name), /*#__PURE__*/React.createElement("h2", {
      className: "res-header-title"
    }, resume.title), /*#__PURE__*/React.createElement("div", {
      className: "res-contact-bar"
    }, [resume.email, resume.phone, resume.location, resume.links].filter(Boolean).join(' • '))), resume.showAvatar && resume.avatar && /*#__PURE__*/React.createElement("div", {
      style: {
        marginLeft: '1.2rem'
      }
    }, /*#__PURE__*/React.createElement("img", {
      src: resume.avatar,
      style: {
        width: '75px',
        height: '75px',
        borderRadius: '50%',
        objectFit: 'cover',
        border: `2.5px solid ${palette.accent}`
      },
      alt: "Avatar"
    }))), /*#__PURE__*/React.createElement("hr", {
      className: "res-divider"
    }), resume.summary && /*#__PURE__*/React.createElement("section", {
      className: "res-section"
    }, /*#__PURE__*/React.createElement("h3", {
      className: "res-section-title"
    }, "Professional Summary"), /*#__PURE__*/React.createElement("p", {
      className: "res-summary-text"
    }, resume.summary)), resume.skills && /*#__PURE__*/React.createElement("section", {
      className: "res-section"
    }, /*#__PURE__*/React.createElement("h3", {
      className: "res-section-title"
    }, "Technical Skill Stack"), /*#__PURE__*/React.createElement("div", {
      className: "res-skills-cloud"
    }, resume.skills.split(',').map((s, i) => /*#__PURE__*/React.createElement("span", {
      key: i,
      className: "res-skill-tag"
    }, s.trim())))), resume.experiences?.length > 0 && /*#__PURE__*/React.createElement("section", {
      className: "res-section"
    }, /*#__PURE__*/React.createElement("h3", {
      className: "res-section-title"
    }, "Professional Experience"), resume.experiences.map(exp => /*#__PURE__*/React.createElement("div", {
      key: exp.id,
      className: "res-entry"
    }, /*#__PURE__*/React.createElement("div", {
      className: "res-entry-head"
    }, /*#__PURE__*/React.createElement("span", {
      className: "res-entry-title"
    }, exp.role), /*#__PURE__*/React.createElement("span", {
      className: "res-entry-date"
    }, exp.startDate, " – ", exp.endDate)), /*#__PURE__*/React.createElement("div", {
      className: "res-entry-head"
    }, /*#__PURE__*/React.createElement("span", {
      className: "res-entry-subtitle"
    }, exp.company), /*#__PURE__*/React.createElement("span", {
      className: "res-entry-location"
    }, exp.location)), /*#__PURE__*/React.createElement("ul", {
      className: "res-bullets-list"
    }, exp.bullets.split('\n').map((b, i) => {
      const clean = b.replace(/^[•\-\*\s]+/, '').trim();
      return clean ? /*#__PURE__*/React.createElement("li", {
        key: i
      }, clean) : null;
    }))))), resume.projects?.length > 0 && /*#__PURE__*/React.createElement("section", {
      className: "res-section"
    }, /*#__PURE__*/React.createElement("h3", {
      className: "res-section-title"
    }, "Key Projects"), resume.projects.map(proj => /*#__PURE__*/React.createElement("div", {
      key: proj.id,
      className: "res-entry"
    }, /*#__PURE__*/React.createElement("div", {
      className: "res-entry-head"
    }, /*#__PURE__*/React.createElement("span", {
      className: "res-entry-title"
    }, proj.title), proj.link && /*#__PURE__*/React.createElement("span", {
      className: "res-entry-location"
    }, "🔗 ", proj.link)), proj.tech && /*#__PURE__*/React.createElement("div", {
      className: "res-entry-subtitle",
      style: {
        fontSize: '0.8rem'
      }
    }, "Tech: ", proj.tech), /*#__PURE__*/React.createElement("ul", {
      className: "res-bullets-list"
    }, proj.bullets.split('\n').map((b, i) => {
      const clean = b.replace(/^[•\-\*\s]+/, '').trim();
      return clean ? /*#__PURE__*/React.createElement("li", {
        key: i
      }, clean) : null;
    }))))), resume.education?.length > 0 && /*#__PURE__*/React.createElement("section", {
      className: "res-section"
    }, /*#__PURE__*/React.createElement("h3", {
      className: "res-section-title"
    }, "Education"), resume.education.map(ed => /*#__PURE__*/React.createElement("div", {
      key: ed.id,
      className: "res-entry",
      style: {
        marginBottom: '0.5rem'
      }
    }, /*#__PURE__*/React.createElement("div", {
      className: "res-entry-head"
    }, /*#__PURE__*/React.createElement("span", {
      className: "res-entry-title"
    }, ed.degree), /*#__PURE__*/React.createElement("span", {
      className: "res-entry-date"
    }, ed.year)), /*#__PURE__*/React.createElement("div", {
      className: "res-entry-subtitle"
    }, ed.school, " • ", ed.location), ed.gpa && /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: '0.8rem',
        color: 'var(--res-text-muted)'
      }
    }, ed.gpa)))), resume.certifications?.length > 0 && /*#__PURE__*/React.createElement("section", {
      className: "res-section"
    }, /*#__PURE__*/React.createElement("h3", {
      className: "res-section-title"
    }, "Certifications"), resume.certifications.map(cert => /*#__PURE__*/React.createElement("div", {
      key: cert.id,
      className: "res-entry",
      style: {
        marginBottom: '0.5rem'
      }
    }, /*#__PURE__*/React.createElement("div", {
      className: "res-entry-head"
    }, /*#__PURE__*/React.createElement("span", {
      className: "res-entry-title"
    }, cert.title), /*#__PURE__*/React.createElement("span", {
      className: "res-entry-date"
    }, cert.year)), /*#__PURE__*/React.createElement("div", {
      className: "res-entry-subtitle"
    }, cert.issuer)))));
  })())))));
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
  root.render(/*#__PURE__*/React.createElement(App, null));
}
