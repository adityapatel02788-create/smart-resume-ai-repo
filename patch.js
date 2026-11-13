const fs = require('fs');
let code = fs.readFileSync('app-react.jsx', 'utf8');

const oldFnStart =   const exportPDF = () => {;
const startIdx = code.indexOf(oldFnStart);
const endIdx = code.indexOf(};, startIdx + 50) + 2;

const newFn = \  const exportPDF = () => {
    const el = document.getElementById('react-resume-sheet');
    if (!el) return;
    if (typeof html2pdf === 'undefined') {
      window.print();
      return;
    }
    
    toast('Preparing PDF...', 'info');
    setIsExporting(true);

    setTimeout(() => {
      html2pdf().set({
        margin: [0, 0, 0, 0],
        filename: \\\\_Document.pdf\,
        image: { type: 'jpeg', quality: 1 },
        html2canvas: { scale: 3, useCORS: true, logging: false, scrollY: 0, scrollX: 0 },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
        pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
      }).from(el).save().then(() => {
        setIsExporting(false);
        toast('PDF downloaded successfully!', 'success');
      }).catch(err => {
        console.error('PDF generation error:', err);
        setIsExporting(false);
        toast('Failed to generate PDF', 'error');
      });
    }, 500);
  };\;

code = code.substring(0, startIdx) + newFn + code.substring(endIdx);
fs.writeFileSync('app-react.jsx', code, 'utf8');
console.log('Patched');
