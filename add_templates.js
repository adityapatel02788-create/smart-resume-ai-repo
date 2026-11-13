const fs = require('fs');
const path = require('path');

const jsxPath = path.join(__dirname, 'app-react.jsx');
const cssPath = path.join(__dirname, 'style.css');

let jsx = fs.readFileSync(jsxPath, 'utf8');
let css = fs.readFileSync(cssPath, 'utf8');

// 1. Add 50+ Writing Styles
const writingStyles = [
  "professional", "persuasive", "analytical", "concise", "narrative",
  "conversational", "technical", "formal", "visionary", "assertive",
  "empathetic", "academic", "results_driven", "strategic", "authoritative",
  "humorous", "direct", "creative", "enthusiastic", "confident",
  "objective", "subjective", "instructive", "inspirational", "provocative",
  "philosophical", "pragmatic", "diplomatic", "candid", "respectful",
  "thoughtful", "urgent", "casual", "quirky", "bold",
  "data_driven", "storytelling", "minimalist", "comprehensive", "poetic",
  "journalistic", "consultative", "coaching", "mentoring", "pioneering",
  "rebellious", "unconventional", "traditional", "futuristic", "nostalgic",
  "friendly", "warm", "crisp", "punchy", "eloquent"
];

const stylesOptions = writingStyles.map(s => {
  const label = s.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  return `            <option value="${s}">Tone: ${label}</option>`;
}).join('\n');

const stylesRegex = /<select\s+className="dropdown-select"\s+value=\{resume\.writingStyle \|\| 'professional'\}\s+onChange=\{\(e\) => setResume\(\{ \.\.\.resume, writingStyle: e\.target\.value \}\)\}\s*>([\s\S]*?)<\/select>/;

jsx = jsx.replace(stylesRegex, `<select \n            className="dropdown-select" \n            value={resume.writingStyle || 'professional'} \n            onChange={(e) => setResume({ ...resume, writingStyle: e.target.value })}\n          >\n${stylesOptions}\n          </select>`);

// 2. Add 50+ Templates
// Existing: modern, executive, minimal, creative, academic, technical, visionary, startup, formal, timeline, elegant, portfolio, techlead (13)
// Let's add 40 more.
const newTemplates = [];
let newCss = '';

const adjectives = ['Dynamic', 'Compact', 'Spacious', 'Sleek', 'Vibrant', 'Muted', 'Sharp', 'Rounded', 'Classic', 'Neo', 'Retro', 'Pro', 'Elite', 'Prime', 'Ultra', 'Core', 'Aura', 'Nova', 'Zen', 'Pulse'];
const nouns = ['Grid', 'Flow', 'Block', 'Line', 'Wave', 'Shift', 'Edge', 'Space', 'Focus', 'Base'];

let idCount = 14;
for (let i = 0; i < adjectives.length; i++) {
  for (let j = 0; j < 2; j++) {
    if (newTemplates.length >= 40) break;
    const tplId = `tpl_${idCount}`;
    const name = `${adjectives[i]} ${nouns[(i+j)%nouns.length]}`;
    newTemplates.push(`{ id: '${tplId}', name: '${name}', tag: 'Variant', badgeColor: 'slate', desc: 'A procedurally generated template style.', pills: ['Unique', 'Custom'] }`);
    
    // Generate some random-ish CSS for each template
    const align = ['left', 'center', 'right'][i % 3];
    const headerBorder = ['none', '2px solid var(--res-accent)', '1px dashed var(--res-primary)'][j % 3];
    const sectionBorder = ['none', '1px solid var(--res-border)', '2px solid var(--res-primary)'][i % 3];
    
    newCss += `
.template-${tplId} .res-header-name { text-align: ${align}; }
.template-${tplId} .res-header-title { text-align: ${align}; }
.template-${tplId} .res-contact-bar { justify-content: ${align === 'center' ? 'center' : align === 'right' ? 'flex-end' : 'flex-start'}; border-bottom: ${headerBorder}; padding-bottom: 0.5rem; }
.template-${tplId} .res-section-title { border-bottom: ${sectionBorder}; text-align: ${align === 'right' ? 'right' : 'left'}; }
`;
    idCount++;
  }
}

// Inject templates array in TemplatesView
const templatesArrayRegex = /const templates = \[([\s\S]*?)\];/;
const existingTemplatesMatch = jsx.match(templatesArrayRegex);
if (existingTemplatesMatch) {
  let innerTemplates = existingTemplatesMatch[1].trim();
  const addedTemplatesStr = newTemplates.join(',\n    ');
  innerTemplates += ',\n    ' + addedTemplatesStr;
  jsx = jsx.replace(templatesArrayRegex, `const templates = [\n    ${innerTemplates}\n  ];`);
}

// Inject templates options in StudioView select
let templateOptionsStr = newTemplates.map(t => {
  const match = t.match(/id: '([^']+)', name: '([^']+)'/);
  return `            <option value="${match[1]}">📄 ${match[2]}</option>`;
}).join('\n');

const selectRegex = /<select \n            className="dropdown-select" \n            value=\{resume\.template\} \n            onChange=\{\(e\) => setResume\(\{ \.\.\.resume, template: e\.target\.value \}\)\}\n          >([\s\S]*?)<\/select>/;

const selectMatch = jsx.match(selectRegex);
if (selectMatch) {
  jsx = jsx.replace(selectRegex, `<select \n            className="dropdown-select" \n            value={resume.template} \n            onChange={(e) => setResume({ ...resume, template: e.target.value })}\n          >${selectMatch[1]}${templateOptionsStr}\n          </select>`);
}

css += `\n/* Procedurally Generated Templates */\n${newCss}`;

fs.writeFileSync(jsxPath, jsx);
fs.writeFileSync(cssPath, css);

console.log("Updated jsx and css with 50+ templates and 50+ writing styles.");
