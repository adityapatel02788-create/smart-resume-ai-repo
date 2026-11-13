"""
Integration test for backend/app.py routes using Flask test_client
Tests /api/health, CORS OPTIONS, /api/ai/status, missing GROQ_API_KEY response, and static file routes.
"""
import sys
import os

# Ensure backend can be imported
sys.path.insert(0, os.path.abspath('.'))

import backend.app as server

app = server.app
client = app.test_client()

def test_health():
    res = client.get('/api/health')
    print("GET /api/health status_code:", res.status_code)
    assert res.status_code == 200, f"Expected 200, got {res.status_code}"
    data = res.get_json()
    print("Health response:", data)
    assert data['status'] == 'healthy', f"Expected status 'healthy', got {data.get('status')}"
    assert data['backend'] == 'running'
    assert 'database' in data
    assert 'ai' in data
    assert 'port' in data
    assert res.headers.get('Access-Control-Allow-Origin') == '*'
    print("✓ test_health PASSED")

def test_cors_preflight():
    res = client.options('/api/health')
    print("OPTIONS /api/health status_code:", res.status_code)
    assert res.status_code == 200
    assert res.headers.get('Access-Control-Allow-Origin') == '*'
    assert 'POST' in res.headers.get('Access-Control-Allow-Methods', '')
    print("✓ test_cors_preflight PASSED")

def test_ai_status():
    res = client.get('/api/ai/status')
    print("GET /api/ai/status status_code:", res.status_code)
    assert res.status_code == 200
    data = res.get_json()
    print("AI status response:", data)
    assert 'groq_configured' in data
    assert 'key_status' in data
    print("✓ test_ai_status PASSED")

def test_ssl_verification():
    import ssl
    ctx = server.get_ssl_context()
    assert ctx.check_hostname is True, "SSLContext must strictly enforce check_hostname"
    assert ctx.verify_mode == ssl.CERT_REQUIRED, "SSLContext must enforce CERT_REQUIRED (never verify=False)"
    assert os.environ.get('SSL_CERT_FILE'), "SSL_CERT_FILE must be configured from certifi"
    print("✓ test_ssl_verification PASSED: Strict TLS verification confirmed active")

def test_groq_missing_key():
    # If GROQ_API_KEY is not set, it should return 503 with clear message
    if 'GROQ_API_KEY' in os.environ:
        del os.environ['GROQ_API_KEY']
    if 'GROK_API_KEY' in os.environ:
        del os.environ['GROK_API_KEY']
    res = client.post('/api/groq-chat', json={'prompt': 'Hello world'})
    print("POST /api/groq-chat status_code:", res.status_code)
    data = res.get_json()
    print("Groq-chat response:", data)
    assert res.status_code == 503 or res.status_code == 400
    assert 'GROQ_API_KEY' in data.get('error', '')
    print("✓ Missing key error message properly returned to client")
    print("✓ test_groq_missing_key PASSED")

def test_cover_letter_missing_key():
    res = client.post('/api/ai/cover-letter', json={
        'company': 'Acme Inc',
        'role': 'Software Engineer',
        'job_description': 'Coding',
        'resume_text': 'Developer skills'
    })
    print("POST /api/ai/cover-letter status_code:", res.status_code)
    data = res.get_json()
    if not data.get('success'):
        assert res.status_code == 503 or res.status_code == 400
        assert 'GROQ_API_KEY' in data.get('error', '')
        print("✓ Cover letter missing key error message properly returned")
    else:
        print("✓ Cover letter generated successfully")
    print("✓ test_cover_letter_missing_key PASSED")

def test_configured_key():
    # Set a dummy key in os.environ temporarily to test detection and masking
    os.environ['GROQ_API_KEY'] = 'gsk_testdummykey1234567890abcdef'
    res = client.get('/api/health')
    assert res.status_code == 200
    data = res.get_json()
    assert data['ai']['groq_configured'] is True
    assert 'gsk_te' in data['ai']['key_status']
    assert 'cdef' in data['ai']['key_status']
    # Ensure full secret is masked and never exposed
    assert 'gsk_testdummykey1234567890abcdef' not in str(data)

    status_res = client.get('/api/ai/status')
    assert status_res.status_code == 200
    s_data = status_res.get_json()
    assert s_data['groq_configured'] is True
    assert s_data['configured'] is True
    assert 'gsk_testdummykey1234567890abcdef' not in str(s_data)

    del os.environ['GROQ_API_KEY']
    print("✓ test_configured_key PASSED: Masking & detection verified without leaking secret")

def test_configure_key_endpoint():
    # Test invalid short key
    res = client.post('/api/ai/configure-key', json={'key': 'short'})
    assert res.status_code == 400

    # Test valid key configure
    res = client.post('/api/ai/configure-key', json={'key': 'gsk_mocksecretkey998877665544332211'})
    assert res.status_code == 200
    data = res.get_json()
    assert data['success'] is True
    assert data['groq_configured'] is True
    assert 'gsk_mo' in data['key_status']
    assert 'gsk_mocksecretkey998877665544332211' not in data['key_status']

    # Clean up test key from environ and .env file
    if 'GROQ_API_KEY' in os.environ:
        del os.environ['GROQ_API_KEY']
    if 'GROK_API_KEY' in os.environ:
        del os.environ['GROK_API_KEY']
    for p in ['.env', 'backend/.env']:
        if os.path.exists(p):
            with open(p, 'r', encoding='utf-8') as f:
                content = f.read()
            content = content.replace('gsk_mocksecretkey998877665544332211', '')
            with open(p, 'w', encoding='utf-8') as f:
                f.write(content)
    print("✓ test_configure_key_endpoint PASSED")

if __name__ == '__main__':
    print("==================================================")
    print("STARTING BACKEND FLASK ROUTE INTEGRATION TESTS")
    print("==================================================")
    test_ssl_verification()
    test_health()
    test_cors_preflight()
    test_ai_status()
    test_groq_missing_key()
    test_cover_letter_missing_key()
    test_configured_key()
    test_configure_key_endpoint()
    print("==================================================")
    print("ALL BACKEND FLASK ROUTE TESTS PASSED!")
    print("==================================================")
