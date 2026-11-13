const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const candidates = [
  path.join(__dirname, 'backend', '.venv', 'Scripts', 'python.exe'),
  'C:\\msys64\\ucrt64\\bin\\python.exe',
  'python',
  'py'
];

let pythonBin = candidates.find(p => fs.existsSync(p)) || 'python';
console.log(`Starting Smart Resume AI server with: ${pythonBin}`);

const proc = spawn(pythonBin, [path.join(__dirname, 'backend', 'app.py')], {
  stdio: 'inherit',
  shell: true,
  cwd: __dirname
});

proc.on('close', code => {
  console.log(`Backend process exited with code ${code}`);
  process.exit(code || 0);
});

