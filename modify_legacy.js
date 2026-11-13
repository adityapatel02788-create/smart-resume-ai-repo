const fs = require('fs');

let content = fs.readFileSync('frontend/src/LegacyApp.jsx', 'utf8');

// 1. Replace React global extraction with actual imports
content = content.replace(
  'const { useState, useEffect, useRef } = React;',
  `import React, { useState, useEffect, useRef } from 'react';\nimport { motion, AnimatePresence } from 'framer-motion';\nimport { FileText, Download, Code2, Sparkles, Plus, Trash2, Edit2, GripVertical, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';`
);

// 2. Add export default
content = content + '\n\nexport default App;\n';

// 3. Inject animations into key components
// Inject AnimatePresence into the main App return if we can find it
// Let's replace standard divs with motion.div for the studio layout
content = content.replace(
  /<div className="studio-container">/g,
  '<motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="studio-container">'
);
content = content.replace(
  /<\/div>\s*<\/div>\s*<\/div>\s*\)\s*}/g,
  '</motion.div></div></div>)}'
);

// Modify buttons to be motion.buttons
content = content.replace(/<button /g, '<motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} ');
content = content.replace(/<\/button>/g, '</motion.button>');

// Save back
fs.writeFileSync('frontend/src/LegacyApp.jsx', content);
console.log('LegacyApp updated!');
