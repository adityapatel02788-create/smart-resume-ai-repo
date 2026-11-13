const fs = require('fs');
const path = require('path');

const jsxPath = path.join(__dirname, 'app-react.jsx');
let jsx = fs.readFileSync(jsxPath, 'utf8');

// 1. Add global state in App()
const appRegex = /(function App\(\) \{[\s\S]*?)(const \[theme, setTheme\])/;
const globalState = `
  const [globalTemplates, setGlobalTemplates] = useState([]);
  const [globalFonts, setGlobalFonts] = useState([]);
  const [globalWritingStyles, setGlobalWritingStyles] = useState([]);

  useEffect(() => {
    fetch('assets/data/templates.json').then(r => r.json()).then(setGlobalTemplates).catch(console.error);
    fetch('assets/data/fonts.json').then(r => r.json()).then(setGlobalFonts).catch(console.error);
    fetch('assets/data/writingStyles.json').then(r => r.json()).then(setGlobalWritingStyles).catch(console.error);
  }, []);

  `;
jsx = jsx.replace(appRegex, `$1${globalState}$2`);

// 2. Pass props to TemplatesView and StudioView
jsx = jsx.replace(
  /<TemplatesView \n          onSelectTemplate=\{([\s\S]*?)\}\n        \/>/,
  `<TemplatesView \n          onSelectTemplate={$1}\n          templates={globalTemplates}\n        />`
);

jsx = jsx.replace(
  /palette=\{palette\}\n        \/>/,
  `palette={palette}\n          templates={globalTemplates}\n          fonts={globalFonts}\n          writingStyles={globalWritingStyles}\n        />`
);

// 3. Modify TemplatesView
const templatesViewRegex = /function TemplatesView\(\{ onSelectTemplate \}\) \{([\s\S]*?)return \(/;
const newTemplatesViewHeader = `function TemplatesView({ onSelectTemplate, templates }) {
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  const categories = Array.from(new Set(templates.map(t => t.category))).filter(Boolean);

  const filtered = templates.filter(t => {
    if (filter !== 'all' && t.category !== filter) return false;
    if (search && !t.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (`;

jsx = jsx.replace(templatesViewRegex, newTemplatesViewHeader);

// Update filter wrapper
const filterWrapperRegex = /<div className="filter-wrapper">([\s\S]*?)<\/div>/;
const newFilterWrapper = `<div className="filter-wrapper" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center' }}>
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
      </div>`;
jsx = jsx.replace(filterWrapperRegex, newFilterWrapper);


// 4. Modify StudioView signature
const studioViewRegex = /function StudioView\(\{([\s\S]*?)\}\) \{/;
const newStudioViewSig = `function StudioView({$1, templates, fonts, writingStyles}) {`;
jsx = jsx.replace(studioViewRegex, newStudioViewSig);

// 5. Replace Writing Style Dropdown
const styleSelectRegex = /<select[\s\S]*?className="dropdown-select"[\s\S]*?value=\{resume\.writingStyle \|\| 'professional'\}[\s\S]*?onChange=\{\(e\) => setResume\(\{ \.\.\.resume, writingStyle: e\.target\.value \}\)\}[\s\S]*?>[\s\S]*?<\/select>/;
const newStyleSelect = `<select 
            className="dropdown-select" 
            value={resume.writingStyle || 'professional'} 
            onChange={(e) => setResume({ ...resume, writingStyle: e.target.value })}
          >
            {writingStyles.map(s => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>`;
jsx = jsx.replace(styleSelectRegex, newStyleSelect);

// 6. Replace Font Dropdown
const fontSelectRegex = /<select \n            className="dropdown-select" \n            value=\{resume\.font\} \n            onChange=\{\(e\) => setResume\(\{ \.\.\.resume, font: e\.target\.value \}\)\}\n          >([\s\S]*?)<\/select>/;
const newFontSelect = `<select 
            className="dropdown-select" 
            value={resume.font} 
            onChange={(e) => setResume({ ...resume, font: e.target.value })}
          >
            {fonts.map(f => (
              <option key={f.id} value={f.id}>{f.name} ({f.category})</option>
            ))}
          </select>`;
jsx = jsx.replace(fontSelectRegex, newFontSelect);

// 7. Replace Template Dropdown
const templateSelectRegex = /<select \n            className="dropdown-select" \n            value=\{resume\.template\} \n            onChange=\{\(e\) => setResume\(\{ \.\.\.resume, template: e\.target\.value \}\)\}\n          >([\s\S]*?)<\/select>/;
const newTemplateSelect = `<select 
            className="dropdown-select" 
            value={resume.template} 
            onChange={(e) => setResume({ ...resume, template: e.target.value })}
          >
            {templates.map(t => (
              <option key={t.id} value={t.id}>📄 {t.name}</option>
            ))}
          </select>`;
jsx = jsx.replace(templateSelectRegex, newTemplateSelect);


fs.writeFileSync(jsxPath, jsx);
console.log('Refactored app-react.jsx');
