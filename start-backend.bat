@echo off
echo ========================================================
echo Starting Smart Resume AI Backend Server...
echo ========================================================
cd /d "%~dp0"
if exist "%~dp0backend\.venv\Scripts\python.exe" (
    "%~dp0backend\.venv\Scripts\python.exe" backend\app.py
) else if exist "C:\msys64\ucrt64\bin\python.exe" (
    "C:\msys64\ucrt64\bin\python.exe" backend\app.py
) else (
    python backend\app.py
)
pause

