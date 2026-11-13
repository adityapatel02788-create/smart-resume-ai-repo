"""
Smart Resume Builder — SQLite Database Layer (Enterprise Grade)
Affiliation: Hindustan College of Science & Technology, Farah, Mathura (AKTU)
Department: CSE - AIML
Features: Salted PBKDF2 Password Hashing, Session Management, Resume Versions,
          Job Application Tracking (CRM), Cover Letter Storage
"""

import sqlite3
import os
import json
import hashlib
import secrets

DB_PATH = os.path.join(os.path.dirname(__file__), 'smart_resume.db')

def get_db_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def hash_password(password: str, salt: bytes = None) -> tuple[str, str]:
    """Generates a cryptographically secure PBKDF2-HMAC-SHA256 password hash with 100,000 iterations."""
    if salt is None:
        salt = secrets.token_bytes(16)
    hashed = hashlib.pbkdf2_hmac('sha256', password.encode('utf-8'), salt, 100_000)
    return hashed.hex(), salt.hex()

def verify_password(password: str, stored_hash: str, stored_salt_hex: str = None) -> bool:
    """Verifies password using PBKDF2-HMAC-SHA256 or falls back to legacy SHA-256 for backward compatibility."""
    if stored_salt_hex:
        try:
            salt = bytes.fromhex(stored_salt_hex)
            computed = hashlib.pbkdf2_hmac('sha256', password.encode('utf-8'), salt, 100_000).hex()
            return secrets.compare_digest(computed, stored_hash)
        except Exception:
            return False
    # Legacy fallback for old un-salted passwords
    legacy_hash = hashlib.sha256(password.encode('utf-8')).hexdigest()
    return secrets.compare_digest(legacy_hash, stored_hash)

def init_db():
    conn = get_db_connection()
    cursor = conn.cursor()

    # 1. Users Table with Salt Column
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            password_salt TEXT,
            name TEXT NOT NULL,
            institution TEXT DEFAULT 'Hindustan College of Science & Technology (AKTU)',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')

    # Add password_salt, is_verified, verification_code columns if missing from earlier migration
    cursor.execute("PRAGMA table_info(users)")
    user_columns = [col[1] for col in cursor.fetchall()]
    if 'password_salt' not in user_columns:
        cursor.execute("ALTER TABLE users ADD COLUMN password_salt TEXT")
    if 'is_verified' not in user_columns:
        cursor.execute("ALTER TABLE users ADD COLUMN is_verified INTEGER DEFAULT 0")
    if 'verification_code' not in user_columns:
        cursor.execute("ALTER TABLE users ADD COLUMN verification_code TEXT")

    # 2. Sessions Table for Secure Token-based Authentication
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS sessions (
            token TEXT PRIMARY KEY,
            user_id INTEGER NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
        )
    ''')

    # 3. Resumes Table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS resumes (
            id TEXT PRIMARY KEY,
            user_id INTEGER NOT NULL,
            title TEXT NOT NULL,
            content_json TEXT NOT NULL,
            template TEXT DEFAULT 'tpl_modern',
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
        )
    ''')

    # 4. Job Applications Tracker (Mini Kanban CRM)
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS applications (
            id TEXT PRIMARY KEY,
            user_id INTEGER NOT NULL,
            company TEXT NOT NULL,
            role TEXT NOT NULL,
            status TEXT DEFAULT 'applied', -- 'saved', 'applied', 'interviewing', 'offer', 'rejected'
            job_description TEXT,
            resume_id TEXT,
            applied_date TEXT,
            notes TEXT,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
        )
    ''')

    # 5. Cover Letters Table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS cover_letters (
            id TEXT PRIMARY KEY,
            user_id INTEGER NOT NULL,
            resume_id TEXT,
            title TEXT NOT NULL,
            company TEXT,
            role TEXT,
            content TEXT NOT NULL,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
        )
    ''')

    # Pre-seed Project Team Accounts with Salted Hashes
    team_accounts = [
        ('aditya.patel@hcst.edu', 'Aditya Patel (Team Lead)', 'aiml2026'),
        ('aditya.saxena@hcst.edu', 'Aditya Saxena', 'aiml2026'),
        ('anuj.sharma@hcst.edu', 'Anuj Sharma', 'aiml2026'),
        ('himanshu.sen@hcst.edu', 'Himanshu Sen', 'aiml2026'),
        ('guest@hcst.edu', 'Guest Candidate', 'guest123')
    ]

    for email, name, pwd in team_accounts:
        cursor.execute('SELECT id, password_salt FROM users WHERE email = ?', (email,))
        row = cursor.fetchone()
        h, salt = hash_password(pwd)
        if not row:
            cursor.execute(
                'INSERT INTO users (email, password_hash, password_salt, name) VALUES (?, ?, ?, ?)',
                (email, h, salt, name)
            )
        elif not row['password_salt']:
            # Upgrade legacy account to salted hash
            cursor.execute(
                'UPDATE users SET password_hash = ?, password_salt = ? WHERE id = ?',
                (h, salt, row['id'])
            )

    conn.commit()
    conn.close()
    print("Database initialized successfully with enterprise security at:", DB_PATH)

if __name__ == '__main__':
    init_db()
