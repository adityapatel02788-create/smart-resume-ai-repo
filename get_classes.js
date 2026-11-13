const fs = require('fs');
const content = fs.readFileSync('app-react.jsx', 'utf8');
const matches = [...content.matchAll(/className=["']([^"']+)["']/g)].map(m => m[1]);
const uniqueClasses = Array.from(new Set(matches.join(' ').split(/\s+/)));
console.log(uniqueClasses.sort().join('\n'));
