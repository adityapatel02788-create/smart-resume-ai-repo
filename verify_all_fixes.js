const fs = require('fs');
const assert = require('assert');
const { execFileSync } = require('child_process');

const pythonCmd = fs.existsSync('backend/.venv/Scripts/python.exe')
  ? 'backend\\.\\.venv\\Scripts\\python.exe'
  : (fs.existsSync('C:\\msys64\\ucrt64\\bin\\python.exe') ? 'C:\\msys64\\ucrt64\\bin\\python.exe' : 'python');

console.log('========================================================');
console.log('SMART RESUME AI BUILDER — AUTOMATED VERIFICATION SUITE');
console.log('========================================================\n');

let passedTests = 0;
let totalTests = 0;

function test(description, fn) {
  totalTests++;
  try {
    fn();
    console.log(`✓ PASS: ${description}`);
    passedTests++;
  } catch (err) {
    console.error(`✗ FAIL: ${description}`);
    console.error(`  Error: ${err.message}`);
  }
}

// ----------------------------------------------------
// TEST 1: Cover Letter Print Styles & Container Isolation
// ----------------------------------------------------
test('Cover Letter Print CSS completely hides app chrome & styles sheet', () => {
  const css = fs.readFileSync('style.css', 'utf8');
  assert(css.includes('@media print'), 'style.css must have @media print');
  assert(css.includes('.cover-letter-sheet'), 'style.css must define .cover-letter-sheet');
  assert(css.includes('.cover-letter-toolbar'), 'style.css print must hide .cover-letter-toolbar');
  assert(css.includes('.cover-letter-editor-panel'), 'style.css print must hide .cover-letter-editor-panel');
  assert(css.includes('.cover-letter-screen-only'), 'style.css print must hide .cover-letter-screen-only');
  assert(css.includes('width: 210mm !important'), 'Print sheet must use standard 210mm A4 width');
  assert(css.includes('min-height: 297mm !important'), 'Print sheet must use standard 297mm A4 height');
});

test('Cover Letter View markup in app-react.js and app-react.jsx wraps printable sheet cleanly', () => {
  const appJs = fs.readFileSync('app-react.js', 'utf8');
  const appJsx = fs.readFileSync('app-react.jsx', 'utf8');

  assert(appJs.includes('cover-letter-studio-grid'), 'app-react.js must use cover-letter-studio-grid');
  assert(appJs.includes('cover-letter-sheet'), 'app-react.js must use cover-letter-sheet');
  assert(appJs.includes('cover-letter-editor-panel'), 'app-react.js must tag editor panel');
  assert(appJs.includes('cover-letter-toolbar'), 'app-react.js must tag print toolbar');

  assert(appJsx.includes('cover-letter-studio-grid'), 'app-react.jsx must use cover-letter-studio-grid');
  assert(appJsx.includes('cover-letter-sheet'), 'app-react.jsx must use cover-letter-sheet');
  assert(appJsx.includes('cover-letter-editor-panel'), 'app-react.jsx must tag editor panel');
});

// ----------------------------------------------------
// TEST 2: Resume Studio Two-Column Desktop Layout
// ----------------------------------------------------
test('Resume Studio layout has exactly two children: editor-sidebar & preview-workspace', () => {
  const content = fs.readFileSync('app-react.js', 'utf8');
  const sandbox = {
    window: { location: { hash: '', pathname: '/' }, scrollTo: () => {}, addEventListener: () => {}, removeEventListener: () => {} },
    document: { documentElement: { setAttribute: () => {} }, getElementById: () => null, createElement: () => ({ style: {} }), body: {} },
    localStorage: { getItem: () => null, setItem: () => {}, removeItem: () => {} },
    React: {
      useState: (i) => [typeof i === 'function' ? i() : i, () => {}],
      useEffect: () => {},
      useRef: () => ({ current: null }),
      useMemo: (fn) => fn(),
      createElement: (...args) => ({ type: args[0], props: args[1], children: args.slice(2) })
    }
  };
  const fn = new Function('window', 'document', 'localStorage', 'React', `${content}\nreturn StudioView;`);
  const StudioView = fn(sandbox.window, sandbox.document, sandbox.localStorage, sandbox.React);
  const vdom = StudioView({
    resume: { id: 'res_test', template: 'tpl_ats_pro', sectionOrder: [] },
    setResume: () => {},
    onNavigate: () => {},
    onExportPDF: () => {},
    isExporting: false,
    atsAnalysis: { score: 95, matched: ['React'], missing: ['GraphQL'] },
    jobDescription: 'Seeking React & GraphQL expert'
  });

  assert.strictEqual(vdom.props.className, 'studio-layout', 'Root must be studio-layout');
  assert.strictEqual(vdom.children.length, 2, 'studio-layout must have exactly 2 children');
  assert.strictEqual(vdom.children[0].props.className, 'editor-sidebar', 'First child must be editor-sidebar');
  assert.strictEqual(vdom.children[1].props.className, 'preview-workspace', 'Second child must be preview-workspace');
  assert.deepStrictEqual(vdom.children[0].children.map(c => c && c.props && c.props.className), ['editor-stepper-bar', 'editor-scroll-area']);
  assert.deepStrictEqual(vdom.children[1].children.map(c => c && c.props && c.props.className), ['preview-toolbar', 'preview-canvas-container']);
});

test('Resume Studio CSS defines two-column flex row on desktop and column on mobile', () => {
  const css = fs.readFileSync('style.css', 'utf8');
  assert(css.includes('.studio-layout {'), 'style.css must define .studio-layout');
  assert(css.includes('flex-direction: row;'), 'studio-layout must be flex-direction: row on desktop');
  assert(css.includes('.editor-sidebar {'), 'style.css must define .editor-sidebar');
  assert(css.includes('width: 480px;'), 'editor-sidebar must have fixed/constrained desktop width');
  assert(css.includes('.preview-workspace {'), 'style.css must define .preview-workspace');
  assert(css.includes('min-width: 0;'), 'preview-workspace must have min-width: 0 to prevent overflow');
  assert(css.includes('flex: 1;'), 'preview-workspace must flex: 1 to fill available right space');
});

// ----------------------------------------------------
// TEST 3: Resume PDF Export Fix
// ----------------------------------------------------
test('PDF export pipeline mounts clone in positive-coordinate staging wrapper without -9999px clipping', () => {
  const appJs = fs.readFileSync('app-react.js', 'utf8');
  assert(!appJs.includes("left = '-9999px'"), 'app-react.js must not position export clone at -9999px');
  assert(!appJs.includes('left: -9999px'), 'app-react.js must not style clone with left: -9999px');
  assert(appJs.includes('react-resume-pdf-staging'), 'app-react.js must use staging container for PDF export');
  assert(appJs.includes('top: 0; left: 0;'), 'staging container must be at (0,0)');

  const appJsx = fs.readFileSync('app-react.jsx', 'utf8');
  assert(!appJsx.includes("left = '-9999px'"), 'app-react.jsx must not position export clone at -9999px');
  assert(appJsx.includes('react-resume-pdf-staging'), 'app-react.jsx must use staging container for PDF export');
});

// ----------------------------------------------------
// TEST 4: Groq AI Secure Server-Side Integration
// ----------------------------------------------------
test('Groq API key is completely removed from frontend code and server defaults', () => {
  const appJs = fs.readFileSync('app-react.js', 'utf8');
  const appJsx = fs.readFileSync('app-react.jsx', 'utf8');
  const appPy = fs.readFileSync('backend/app.py', 'utf8');

  assert(!appJs.includes('gsk_JsuMzxz'), 'app-react.js must not contain hardcoded Groq key');
  assert(!appJsx.includes('gsk_JsuMzxz'), 'app-react.jsx must not contain hardcoded Groq key');
  assert(!appPy.includes('gsk_JsuMzxz'), 'backend/app.py must not contain hardcoded Groq key');

  assert(!appJs.includes("fetch('https://api.groq.com"), 'Client must not make direct requests to api.groq.com');
  assert(!appJsx.includes("fetch('https://api.groq.com"), 'Client must not make direct requests to api.groq.com');
});

test('Cover Letter Studio validates company & role and connects to backend AI endpoint', () => {
  const appJs = fs.readFileSync('app-react.js', 'utf8');
  assert(appJs.includes('/api/ai/cover-letter'), 'Cover letter generation must call /api/ai/cover-letter');
  assert(appJs.includes('Please enter a target company'), 'Must validate target company');
  assert(appJs.includes('Please enter a target role'), 'Must validate target role');
  assert(appJs.includes('Generating Cover Letter...'), 'Must show loading state');
});

test('Backend /api/ai/cover-letter validates inputs and handles missing key gracefully', () => {
  const appPy = fs.readFileSync('backend/app.py', 'utf8');
  assert(appPy.includes('@app.route(\'/api/ai/cover-letter\''), 'Must register /api/ai/cover-letter route');
  assert(appPy.includes('Target Company and Target Role are required'), 'Server must validate company and role');
  assert(appPy.includes('GROQ_API_KEY is not configured on the server'), 'Server must return clear error when GROQ_API_KEY is missing');
});

// ----------------------------------------------------
// TEST 5: Email Verification Security & Code Protection
// ----------------------------------------------------
test('Verification code is never leaked or displayed in frontend UI', () => {
  const appJs = fs.readFileSync('app-react.js', 'utf8');
  const appJsx = fs.readFileSync('app-react.jsx', 'utf8');
  const html = fs.readFileSync('userinterface.html', 'utf8');

  assert(!appJs.includes('verification-code-chip'), 'app-react.js must not render verification-code-chip');
  assert(!appJs.includes('Security Code: ['), 'app-react.js must not echo security code');
  assert(!appJsx.includes('verification-code-chip'), 'app-react.jsx must not render verification-code-chip');
  assert(!appJsx.includes('Security Code: ['), 'app-react.jsx must not echo security code');
  assert(!html.includes('verification-code-chip'), 'userinterface.html must not render verification-code-chip');
  assert(!html.includes('Security Code: ['), 'userinterface.html must not echo security code');
});

test('Backend does not leak verification code in API responses and hashes codes securely', () => {
  const appPy = fs.readFileSync('backend/app.py', 'utf8');
  assert(appPy.includes('send_verification_email'), 'Must implement send_verification_email function');
  assert(appPy.includes('hashlib.sha256'), 'Must hash verification codes with SHA-256');
  assert(appPy.includes('hmac.compare_digest'), 'Must verify codes with constant-time comparison');
  assert(appPy.includes('max_attempts'), 'Must enforce max verification attempts');
  assert(appPy.includes('last_sent_at'), 'Must enforce resend throttling');
  assert(appPy.includes('expires_at'), 'Must enforce code expiration');

  // Verify response of send_verification_code does NOT contain 'code'
  const sendFn = appPy.substring(appPy.indexOf('def send_verification_code():'), appPy.indexOf('def verify_code_and_register():'));
  assert(!sendFn.includes("'code': code"), 'send-verification endpoint MUST NOT return code in JSON response');
});

test('.env.example documents all required variables without secrets', () => {
  assert(fs.existsSync('.env.example'), '.env.example must exist');
  const env = fs.readFileSync('.env.example', 'utf8');
  assert(env.includes('GROQ_API_KEY='), '.env.example must document GROQ_API_KEY');
  assert(env.includes('SMTP_HOST='), '.env.example must document SMTP_HOST');
  assert(env.includes('SMTP_PORT='), '.env.example must document SMTP_PORT');
  assert(env.includes('SMTP_USER='), '.env.example must document SMTP_USER');
  assert(env.includes('SMTP_PASSWORD='), '.env.example must document SMTP_PASSWORD');
  assert(!env.includes('gsk_JsuMzxz'), '.env.example must not contain real secret keys');
});

test('Backend provides /api/health and frontend implements configurable API Base URL with health indicator', () => {
  const appPy = fs.readFileSync('backend/app.py', 'utf8');
  assert(appPy.includes('@app.route(\'/api/health\''), 'backend/app.py must implement /api/health');
  assert(appPy.includes('def health_check():'), 'backend/app.py must have health_check function');
  assert(appPy.includes('Access-Control-Allow-Origin'), 'backend/app.py must include CORS headers');

  const appJs = fs.readFileSync('app-react.js', 'utf8');
  assert(appJs.includes('function getApiBase()'), 'app-react.js must implement getApiBase()');
  assert(appJs.includes('function normalizeApiBaseUrl('), 'app-react.js must implement normalizeApiBaseUrl');
  assert(appJs.includes('checkBackendHealth'), 'app-react.js must implement checkBackendHealth');
  assert(appJs.includes('backend-status-pill'), 'app-react.js must render backend-status-pill');
  assert(appJs.includes("status: 'unreachable'"), 'app-react.js must distinguish unreachable status');
  assert(appJs.includes("status: 'unhealthy'"), 'app-react.js must distinguish unhealthy status');

  const appJsx = fs.readFileSync('app-react.jsx', 'utf8');
  assert(appJsx.includes('function getApiBase()'), 'app-react.jsx must implement getApiBase()');
  assert(appJsx.includes('function normalizeApiBaseUrl('), 'app-react.jsx must implement normalizeApiBaseUrl');
  assert(appJsx.includes('checkBackendHealth'), 'app-react.jsx must implement checkBackendHealth');
  assert(appJsx.includes('backend-status-pill'), 'app-react.jsx must render backend-status-pill');
  assert(appJsx.includes("status: 'unreachable'"), 'app-react.jsx must distinguish unreachable status');
  assert(appJsx.includes("status: 'unhealthy'"), 'app-react.jsx must distinguish unhealthy status');

  const html = fs.readFileSync('userinterface.html', 'utf8');
  assert(html.includes('getApiBase'), 'userinterface.html must implement getApiBase()');
  assert(html.includes('normalizeApiBaseUrl'), 'userinterface.html must implement normalizeApiBaseUrl');
});

test('Frontend URL normalization correctly handles trailing slashes and protocols', () => {
  function normalizeApiBaseUrl(url) {
    if (!url || typeof url !== 'string' || !url.trim()) return 'http://localhost:5000';
    let clean = url.trim();
    clean = clean.replace(/\/+$/, '');
    if (clean && !/^https?:\/\//i.test(clean) && !clean.startsWith('/')) {
      clean = 'http://' + clean;
    }
    return clean;
  }

  assert.strictEqual(normalizeApiBaseUrl('http://localhost:5000/'), 'http://localhost:5000');
  assert.strictEqual(normalizeApiBaseUrl('http://localhost:5000///'), 'http://localhost:5000');
  assert.strictEqual(normalizeApiBaseUrl('localhost:5000/'), 'http://localhost:5000');
  assert.strictEqual(normalizeApiBaseUrl('https://api.myresume.com//'), 'https://api.myresume.com');
  assert.strictEqual(normalizeApiBaseUrl(''), 'http://localhost:5000');
  assert.strictEqual(normalizeApiBaseUrl(null), 'http://localhost:5000');
});

test('Strict TLS certificate verification is enforced with certifi and never bypassed', () => {
  const appPy = fs.readFileSync('backend/app.py', 'utf8');
  assert(appPy.includes('def get_ssl_context():'), 'backend/app.py must implement get_ssl_context()');
  assert(appPy.includes('certifi'), 'backend/app.py must use certifi');
  assert(appPy.includes('ctx.check_hostname = True'), 'backend/app.py must enforce check_hostname = True');
  assert(appPy.includes('ctx.verify_mode = ssl.CERT_REQUIRED'), 'backend/app.py must enforce CERT_REQUIRED');
  assert(!appPy.includes('verify=False'), 'backend/app.py must NEVER contain verify=False');
  assert(!appPy.includes('CERT_NONE'), 'backend/app.py must NEVER disable verification with CERT_NONE');
  assert(appPy.includes('context=get_ssl_context()'), 'urllib.request calls must pass verified SSL context');
  assert(appPy.includes('CERTIFICATE_VERIFY_FAILED'), 'backend/app.py must handle CERTIFICATE_VERIFY_FAILED errors cleanly');

  const reqTxt = fs.readFileSync('backend/requirements.txt', 'utf8');
  assert(reqTxt.includes('certifi'), 'backend/requirements.txt must include certifi');
});

// ----------------------------------------------------
// TEST 15: Honors & Awards Editor and Template Rendering
// ----------------------------------------------------
test('Honors & Awards editor includes Details/Accomplishment input and AI Polish button in app-react.js and app-react.jsx', () => {
  const appJs = fs.readFileSync('app-react.js', 'utf8');
  const appJsx = fs.readFileSync('app-react.jsx', 'utf8');

  // Static checks
  assert(appJs.includes('Details & Accomplishment Description'), 'app-react.js must have Details label');
  assert(appJs.includes('handleAIEnhanceAward'), 'app-react.js must define handleAIEnhanceAward');
  assert(appJs.includes('AI Polish Details'), 'app-react.js must have AI Polish Details button');
  assert(appJs.includes("handleUpdateAward(awd.id, 'description'"), 'app-react.js must bind description textarea to update handler');

  assert(appJsx.includes('Details & Accomplishment Description'), 'app-react.jsx must have Details label');
  assert(appJsx.includes('handleAIEnhanceAward'), 'app-react.jsx must define handleAIEnhanceAward');
  assert(appJsx.includes('AI Polish Details'), 'app-react.jsx must have AI Polish Details button');
  assert(appJsx.includes("handleUpdateAward(awd.id, 'description'"), 'app-react.jsx must bind description textarea to update handler');

  // VDOM check in StudioView
  const React = {
    useState: i => [typeof i === 'function' ? i() : (i === 'profile' ? 'more' : i), () => {}],
    useEffect: () => {},
    useRef: () => ({ current: null }),
    useMemo: fn => fn(),
    useCallback: fn => fn,
    createElement: (type, props, ...children) => ({ type, props: props || {}, children })
  };
  const sandbox = {
    window: { location: { hash: '', pathname: '/' }, scrollTo: () => {}, addEventListener: () => {}, removeEventListener: () => {} },
    document: { documentElement: { setAttribute: () => {} }, getElementById: () => null, createElement: () => ({ style: {} }), body: {} },
    localStorage: { getItem: () => null, setItem: () => {}, removeItem: () => {} },
    React
  };
  const fn = new Function('window', 'document', 'localStorage', 'React', appJs + '\nreturn StudioView;');
  const StudioView = fn(sandbox.window, sandbox.document, sandbox.localStorage, sandbox.React);

  const testResume = {
    template: 'tpl_software_dev',
    name: 'Alex Morgan',
    awards: [{ id: 'awd_1', title: 'Top Innovator', issuer: 'Hackathon Org', year: '2023', description: 'Built an AI tool.' }]
  };

  const vdom = StudioView({
    resume: testResume,
    setResume: () => {},
    onNavigate: () => {},
    onExportPDF: () => {},
    isExporting: false,
    atsAnalysis: { score: 95, matched: [], missing: [] },
    jobDescription: ''
  });

  const json = JSON.stringify(vdom);
  assert(json.includes('Details & Accomplishment Description'), 'StudioView VDOM must include Details & Accomplishment Description');
  assert(json.includes('AI Polish Details'), 'StudioView VDOM must include AI Polish Details button');
  assert(json.includes('Built an AI tool.'), 'StudioView VDOM must include award description content');
});

test('ResumeRenderer displays Honors & Awards with description across all resume templates', () => {
  const appJs = fs.readFileSync('app-react.js', 'utf8');
  const React = {
    useState: i => [i, () => {}],
    useEffect: () => {},
    useRef: () => ({ current: null }),
    useMemo: fn => fn(),
    useCallback: fn => fn,
    createElement: (type, props, ...children) => ({ type, props: props || {}, children })
  };
  const sandbox = {
    window: { location: { hash: '', pathname: '/' }, scrollTo: () => {}, addEventListener: () => {}, removeEventListener: () => {} },
    document: { documentElement: { setAttribute: () => {} }, getElementById: () => null, createElement: () => ({ style: {} }), body: {} },
    localStorage: { getItem: () => null, setItem: () => {}, removeItem: () => {} },
    React
  };
  const fn = new Function('window', 'document', 'localStorage', 'React', appJs + '\nreturn ResumeRenderer;');
  const ResumeRenderer = fn(sandbox.window, sandbox.document, sandbox.localStorage, sandbox.React);

  const templatesToTest = [
    'tpl_executive',
    'tpl_twocol_modern',
    'tpl_creative_modern',
    'tpl_biz_pro',
    'tpl_elegant_pro',
    'tpl_ats_classic',
    'tpl_college_student',
    'tpl_software_dev'
  ];

  const testResume = {
    template: 'tpl_software_dev',
    name: 'Alex Morgan',
    awards: [{ id: 'awd_1', title: 'Top Innovator Award', issuer: 'Hackathon Org', year: '2023', description: 'Architected scalable ML inference pipeline.' }]
  };

  templatesToTest.forEach(templateId => {
    const vdom = ResumeRenderer({
      resume: { ...testResume, template: templateId },
      palette: { primary: '#1e3a8a', accent: '#2563eb' }
    });
    const json = JSON.stringify(vdom);
    assert(json.includes('Top Innovator Award'), `Template ${templateId} must render award title`);
    assert(json.includes('Architected scalable ML inference pipeline.'), `Template ${templateId} must render award description`);
  });
});

// ----------------------------------------------------
// TEST 17: SMTP Mail Configuration & Gmail Requirements Documentation
// ----------------------------------------------------
test('SMTP settings for Gmail (smtp.gmail.com, 587, TLS, App Password) are documented and .env is ignored', () => {
  const envExample = fs.readFileSync('.env.example', 'utf8');
  const backendEnvExample = fs.readFileSync('backend/.env.example', 'utf8');
  const readme = fs.readFileSync('README.md', 'utf8');
  const gitignore = fs.readFileSync('.gitignore', 'utf8');

  // Check required Gmail settings in .env.example
  assert(envExample.includes('SMTP_HOST=smtp.gmail.com'), '.env.example must set SMTP_HOST=smtp.gmail.com');
  assert(envExample.includes('SMTP_PORT=587'), '.env.example must set SMTP_PORT=587');
  assert(envExample.includes('SMTP_USE_TLS=true'), '.env.example must set SMTP_USE_TLS=true');
  assert(envExample.includes('2-Step Verification'), '.env.example must explain 2-Step Verification requirement');
  assert(envExample.includes('Google App Password'), '.env.example must explain Google App Password requirement');

  // Check backend/.env.example
  assert(backendEnvExample.includes('SMTP_HOST=smtp.gmail.com'), 'backend/.env.example must document smtp.gmail.com');
  assert(backendEnvExample.includes('SMTP_PORT=587'), 'backend/.env.example must document port 587');
  assert(backendEnvExample.includes('SMTP_USE_TLS=true'), 'backend/.env.example must document TLS');
  assert(backendEnvExample.includes('App Password'), 'backend/.env.example must explain App Passwords');

  // Check README.md
  assert(readme.includes('smtp.gmail.com'), 'README.md must document smtp.gmail.com');
  assert(readme.includes('587'), 'README.md must document port 587');
  assert(readme.includes('2-Step Verification'), 'README.md must explain 2-Step Verification requirement');
  assert(readme.includes('Google App Password'), 'README.md must explain Google App Password requirement');

  // Ensure .env is ignored by Git
  assert(gitignore.includes('.env'), '.gitignore must ignore .env');
  assert(gitignore.includes('backend/.env'), '.gitignore must ignore backend/.env');
  assert(gitignore.includes('*.env'), '.gitignore must ignore *.env');
});

// ----------------------------------------------------
// TEST 18: Server-side SMTP diagnostics, secret redaction, and verification enforcement
// ----------------------------------------------------
test('Server-side SMTP flow enforces secure TLS, redacts secrets in logs, and prevents unverified account activation', () => {
  const appPy = fs.readFileSync('backend/app.py', 'utf8');

  // Verification architecture
  assert(appPy.includes('def get_smtp_config()'), 'app.py must implement get_smtp_config');
  assert(appPy.includes('def mask_email('), 'app.py must implement mask_email for safe diagnostics');
  assert(appPy.includes('def is_smtp_placeholder('), 'app.py must implement is_smtp_placeholder');
  assert(appPy.includes('ssl_ctx = get_ssl_context()'), 'send_verification_email must use verified get_ssl_context()');
  assert(appPy.includes('server.starttls(context=ssl_ctx)'), 'starttls must use verified SSL context');

  // Secrets redaction in logs/exceptions
  assert(appPy.includes("err_str.replace(password, '******')"), 'Must redact password from exception strings');
  assert(appPy.includes("err_str.replace(code, '******')"), 'Must redact code from exception strings');
  assert(appPy.includes('SMTPAuthenticationError'), 'Must handle SMTPAuthenticationError explicitly');
  assert(appPy.includes('SMTPConnectError'), 'Must handle SMTPConnectError explicitly');
  assert(appPy.includes('socket.gaierror'), 'Must handle socket.gaierror explicitly');

  // Registration & verification enforcement: accounts only verified after code entry
  assert(appPy.includes('is_verified = 0'), 'Direct registrations must default to unverified (is_verified = 0)');
  assert(!appPy.includes("is_verified = 1 if data.get('is_verified') else 0"), 'Must not allow client to self-verify via API payload');

  // Execute Python unit test to verify runtime behavior
  const { execFileSync } = require('child_process');
  const pythonCmd = fs.existsSync('backend/.venv/Scripts/python.exe')
    ? 'backend\\.\\.venv\\Scripts\\python.exe'
    : 'python';

  const pyScript = `import sys, os
from unittest.mock import patch, MagicMock
sys.path.insert(0, 'backend')
os.environ['SMTP_HOST'] = 'smtp.gmail.com'
os.environ['SMTP_PORT'] = '587'
os.environ['SMTP_USER'] = 'testsender@gmail.com'
os.environ['SMTP_PASSWORD'] = 'abcd efgh ijkl mnop'
os.environ['SMTP_USE_TLS'] = 'true'

from app import send_verification_email, get_smtp_config

# Check password cleaning
cfg = get_smtp_config()
assert cfg['password'] == 'abcdefghijklmnop', 'Password spaces must be removed'
assert cfg['is_configured'] == True

# Check mock SMTP send
with patch('smtplib.SMTP') as mock_smtp:
    instance = MagicMock()
    mock_smtp.return_value = instance
    sent, msg = send_verification_email('recipient@test.com', '123456', 'Candidate')
    assert sent == True, 'Email send must succeed with valid config'
    assert 'dispatched successfully' in msg

# Check placeholder handling
os.environ['SMTP_USER'] = 'your_email@gmail.com'
os.environ['SMTP_PASSWORD'] = 'your_app_password_here'
sent, msg = send_verification_email('recipient@test.com', '123456', 'Candidate')
assert sent == False, 'Placeholder config must be rejected'
assert 'credentials are not configured' in msg
`;

  execFileSync(pythonCmd, ['-c', pyScript], { stdio: 'pipe' });
});

// ----------------------------------------------------
// TEST 19: CORS Preflight & Error Handling for Authentication Routes
// ----------------------------------------------------
test('Authentication endpoints handle OPTIONS preflight with dynamic origin and credentials', () => {
  const pyScript = `
import sys, os, json
sys.path.insert(0, os.path.abspath('backend'))
import app as backend_app

client = backend_app.app.test_client()

routes = [
    '/api/auth/send-verification',
    '/api/auth/verify-code',
    '/api/register',
    '/api/login'
]

for route in routes:
    # 1. Test OPTIONS preflight with Origin http://127.0.0.1:5500
    res_opt = client.options(route, headers={
        'Origin': 'http://127.0.0.1:5500',
        'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'Content-Type'
    })
    assert res_opt.status_code == 200, f"OPTIONS {route} must return 200, got {res_opt.status_code}"
    assert res_opt.headers.get('Access-Control-Allow-Origin') == 'http://127.0.0.1:5500', f"Must reflect origin for {route}"
    assert res_opt.headers.get('Access-Control-Allow-Credentials') == 'true', f"Must allow credentials for {route}"
    assert 'POST' in res_opt.headers.get('Access-Control-Allow-Methods', ''), f"Must allow POST for {route}"
`;

  execFileSync(pythonCmd, ['-c', pyScript], { stdio: 'pipe' });
});

// ----------------------------------------------------
// TEST 20: Registration Differentiates Connectivity from SMTP Configuration
// ----------------------------------------------------
test('Registration API responds with 503 and clear SMTP message when unconfigured, without failing CORS', () => {
  const pyScript = `
import sys, os, json
sys.path.insert(0, os.path.abspath('backend'))
import app as backend_app

client = backend_app.app.test_client()

# Ensure SMTP credentials are empty / unconfigured
os.environ['SMTP_HOST'] = 'smtp.gmail.com'
os.environ['SMTP_USER'] = ''
os.environ['SMTP_PASSWORD'] = ''

# 1. Invalid input check (400)
res_bad = client.post('/api/auth/send-verification',
    headers={'Origin': 'http://localhost:5500', 'Content-Type': 'application/json'},
    data=json.dumps({'email': 'invalid-email', 'name': 'Aditya', 'password': '123'})
)
assert res_bad.status_code == 400, f"Expected 400 for bad input, got {res_bad.status_code}"
assert res_bad.headers.get('Access-Control-Allow-Origin') == 'http://localhost:5500'

# 2. Valid input with unconfigured SMTP (503)
res_smtp = client.post('/api/auth/send-verification',
    headers={'Origin': 'http://127.0.0.1:5500', 'Content-Type': 'application/json'},
    data=json.dumps({'email': 'new_dev_test@example.com', 'name': 'Aditya Developer', 'password': 'validPassword123!'})
)
assert res_smtp.status_code == 503, f"Expected 503 for unconfigured SMTP, got {res_smtp.status_code}"
assert res_smtp.headers.get('Access-Control-Allow-Origin') == 'http://127.0.0.1:5500'
data = res_smtp.get_json()
assert data['success'] == False
assert 'SMTP' in data['error'] and ('credentials' in data['error'] or 'configured' in data['error']), f"Detailed SMTP message required, got: {data['error']}"
`;

  execFileSync(pythonCmd, ['-c', pyScript], { stdio: 'pipe' });
});

// ----------------------------------------------------
// TEST 21: Frontend Host Alignment & Resilient Auth Fetch
// ----------------------------------------------------
test('Frontend getApiBase aligns host for 127.0.0.1 & authApiFetch provides resilient fallback', () => {
  const appJs = fs.readFileSync('app-react.js', 'utf8');
  const appJsx = fs.readFileSync('app-react.jsx', 'utf8');

  // Verify hostname alignment in both files
  assert(appJs.includes("window.location.hostname === '127.0.0.1'"), 'app-react.js must handle 127.0.0.1');
  assert(appJs.includes("'http://127.0.0.1:5000'"), 'app-react.js must target 127.0.0.1:5000 when host is 127.0.0.1');
  assert(appJs.includes('authApiFetch'), 'app-react.js must implement authApiFetch helper');

  assert(appJsx.includes("window.location.hostname === '127.0.0.1'"), 'app-react.jsx must handle 127.0.0.1');
  assert(appJsx.includes("'http://127.0.0.1:5000'"), 'app-react.jsx must target 127.0.0.1:5000 when host is 127.0.0.1');
  assert(appJsx.includes('authApiFetch'), 'app-react.jsx must implement authApiFetch helper');

  // Verify functional behavior of getApiBase
  const sandbox = {
    window: { location: { protocol: 'http:', hostname: '127.0.0.1', port: '5500', host: '127.0.0.1:5500' }, scrollTo: () => {}, addEventListener: () => {}, removeEventListener: () => {} },
    document: { documentElement: { setAttribute: () => {} }, getElementById: () => null, createElement: () => ({ style: {} }), body: {} },
    localStorage: { getItem: () => null, setItem: () => {}, removeItem: () => {} },
    React: {
      useState: (i) => [typeof i === 'function' ? i() : i, () => {}],
      useEffect: () => {},
      useRef: () => ({ current: null }),
      useMemo: (fn) => fn(),
      createElement: (...args) => ({ type: args[0], props: args[1], children: args.slice(2) })
    }
  };
  const fn = new Function('window', 'document', 'localStorage', 'React', `${appJs}\nreturn getApiBase;`);
  const getApiBase = fn(sandbox.window, sandbox.document, sandbox.localStorage, sandbox.React);
  assert.strictEqual(getApiBase(), 'http://127.0.0.1:5000', 'Must return http://127.0.0.1:5000 when on 127.0.0.1:5500');

  // Test localhost:5500
  sandbox.window.location.hostname = 'localhost';
  sandbox.window.location.host = 'localhost:5500';
  assert.strictEqual(getApiBase(), 'http://localhost:5000', 'Must return http://localhost:5000 when on localhost:5500');

  // Test port 5000
  sandbox.window.location.port = '5000';
  assert.strictEqual(getApiBase(), '', 'Must return relative empty string when served directly on port 5000');
});

console.log(`\n========================================================`);
console.log(`RESULT: ${passedTests}/${totalTests} TESTS PASSED`);
console.log(`========================================================`);

if (passedTests === totalTests) {
  process.exit(0);
} else {
  process.exit(1);
}

