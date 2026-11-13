const fs = require('fs');
const path = require('path');

const jsxPath = path.join(__dirname, 'app-react.jsx');
let jsx = fs.readFileSync(jsxPath, 'utf8');

const target = `  const [resume, setResume] = useState(() => {
    return resumes.find(r => r.id === activeResumeId) || INITIAL_RESUME;
  });`;

const replacement = `  const [resume, setResume] = useState(() => {
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
      link.href = \`https://fonts.googleapis.com/css2?family=\${resume.font.replace(/ /g, '+')}:wght@300;400;500;600;700;800;900&display=swap\`;
    }
  }, [resume.font]);`;

// Replace ignoring \r
const normalizedJsx = jsx.replace(/\r\n/g, '\n');
const normalizedTarget = target.replace(/\r\n/g, '\n');
const normalizedReplacement = replacement.replace(/\r\n/g, '\n');

if (normalizedJsx.includes(normalizedTarget)) {
  const newJsx = normalizedJsx.replace(normalizedTarget, normalizedReplacement);
  fs.writeFileSync(jsxPath, newJsx);
  console.log('Fixed useEffect placement!');
} else {
  console.log('Could not find target content.');
}
