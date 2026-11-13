const fs = require('fs');
const path = require('path');

const jsxPath = path.join(__dirname, 'app-react.jsx');
const cssPath = path.join(__dirname, 'style.css');

let jsx = fs.readFileSync(jsxPath, 'utf8');
let css = fs.readFileSync(cssPath, 'utf8');

// 1. Add 50+ Google Fonts
const fonts = [
  "Inter", "Roboto", "Open Sans", "Lato", "Montserrat",
  "Oswald", "Source Sans Pro", "Slabo 27px", "Raleway", "PT Sans",
  "Merriweather", "Noto Sans", "Nunito", "Concert One", "Playfair Display",
  "Rubik", "Lora", "Work Sans", "Fira Sans", "Quicksand",
  "Karla", "Barlow", "Mulish", "Inconsolata", "Titillium Web",
  "Mukta", "Heebo", "Josefin Sans", "Libre Baskerville", "Anton",
  "Varela Round", "Cabin", "Bitter", "Dancing Script", "Pacifico",
  "Dosis", "Teko", "Bebas Neue", "Shadows Into Light", "Abel",
  "Caveat", "Indie Flower", "Exo 2", "Righteous", "Lobster",
  "Cinzel", "Archivo", "Signika", "Comfortaa", "Space Grotesk",
  "DM Sans", "Manrope", "Outfit", "Syne", "Urbanist"
];

const fontOptions = fonts.map(f => {
  return `            <option value="${f}">${f}</option>`;
}).join('\n');

const fontsRegex = /<select \n            className="dropdown-select" \n            value=\{resume\.font\} \n            onChange=\{\(e\) => setResume\(\{ \.\.\.resume, font: e\.target\.value \}\)\}\n          >([\s\S]*?)<\/select>/;

jsx = jsx.replace(fontsRegex, `<select \n            className="dropdown-select" \n            value={resume.font} \n            onChange={(e) => setResume({ ...resume, font: e.target.value })}\n          >\n${fontOptions}\n          </select>`);

// Fix the inline fontFamily in StudioView
const inlineFontRegex = /fontFamily: resume\.font === 'serif' \? 'var\(--font-serif\)' : resume\.font === 'modern' \? 'var\(--font-display\)' : 'var\(--font-body\)'/;
jsx = jsx.replace(inlineFontRegex, `fontFamily: \`"\${resume.font || 'Inter'}", sans-serif\``);

// Inject the useEffect for dynamically loading the Google Font
const useEffectRegex = /function App\(\) \{([\s\S]*?)const \[currentView/;
const existingUseEffect = jsx.match(useEffectRegex);
if (existingUseEffect && !existingUseEffect[1].includes('dynamic-google-font')) {
  const hookToInject = `
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
      link.href = \`https://fonts.googleapis.com/css2?family=\${resume.font.replace(/ /g, '+')}:wght@300;400;500;600;700;800;900&display=swap\`;
    }
  }, [resume.font]);
  
  `;
  jsx = jsx.replace(useEffectRegex, `function App() {${existingUseEffect[1]}${hookToInject}const [currentView`);
}


// 2. Make the 40 procedural templates actually visibly distinct in CSS!
// We will replace the old procedural CSS with a better one.
let newCss = '/* Procedural Distinct Templates */\n';
for (let i = 1; i <= 54; i++) {
  // Generate wild variations
  const bgColor = i % 2 === 0 ? 'var(--res-paper-bg)' : '#f8f9fa';
  const nameColor = i % 3 === 0 ? 'var(--res-primary)' : i % 3 === 1 ? 'var(--res-text)' : 'var(--res-accent)';
  const nameSize = 1.8 + (i % 4) * 0.4;
  const nameAlign = ['left', 'center', 'right', 'left'][i % 4];
  const sectionBorderTop = i % 5 === 0 ? '2px solid var(--res-primary)' : 'none';
  const sectionBorderBottom = i % 5 === 1 ? '1px dashed var(--res-accent)' : i % 5 === 2 ? '3px double var(--res-border)' : '1px solid var(--res-border)';
  const entryMargin = 0.5 + (i % 3) * 0.3;
  
  newCss += `
.template-tpl_${i} { background-color: ${bgColor}; padding: ${10 + (i % 5)*5}mm !important; }
.template-tpl_${i} .res-header-name { text-align: ${nameAlign}; font-size: ${nameSize}rem; color: ${nameColor}; text-transform: ${i % 2 === 0 ? 'uppercase' : 'none'}; font-weight: ${i % 2 === 0 ? '900' : '400'}; }
.template-tpl_${i} .res-header-title { text-align: ${nameAlign}; font-size: ${1 + (i%3)*0.2}rem; color: var(--res-accent); margin-bottom: 0.5rem; }
.template-tpl_${i} .res-contact-bar { justify-content: ${nameAlign === 'center' ? 'center' : nameAlign === 'right' ? 'flex-end' : 'flex-start'}; border-bottom: ${i % 3 === 0 ? '1px solid var(--res-border)' : 'none'}; padding-bottom: 0.5rem; margin-bottom: 1.5rem; }
.template-tpl_${i} .res-section-title { text-align: ${nameAlign === 'center' ? 'center' : 'left'}; border-top: ${sectionBorderTop}; border-bottom: ${sectionBorderBottom}; padding: 0.4rem 0; margin-top: 1rem; color: ${i % 2 === 0 ? 'var(--res-primary)' : 'var(--res-text)'}; background: ${i % 4 === 0 ? 'rgba(0,0,0,0.03)' : 'transparent'}; }
.template-tpl_${i} .res-entry { margin-bottom: ${entryMargin}rem; }
.template-tpl_${i} .res-skill-tag { border-radius: ${i % 2 === 0 ? '0px' : '99px'}; border: 1px solid ${i % 3 === 0 ? 'var(--res-primary)' : 'transparent'}; background: ${i % 3 === 0 ? 'transparent' : 'rgba(0,0,0,0.05)'}; color: var(--res-text); }
`;
}

// Replace the old procedural CSS in style.css
const oldCssSplit = css.split('/* Procedurally Generated Templates */');
if (oldCssSplit.length > 1) {
  css = oldCssSplit[0] + newCss;
} else {
  css += '\n' + newCss;
}

fs.writeFileSync(jsxPath, jsx);
fs.writeFileSync(cssPath, css);
console.log('Fixed templates and fonts!');
