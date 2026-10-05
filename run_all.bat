@echo off
echo ===================================================
echo   Starting ClearPath AI Platform (Backend and Web)
echo ===================================================
echo.

:: 1. Start FastAPI Backend Service in a new window
echo [1/3] Starting FastAPI Backend on http://localhost:8000 ...
start "ClearPath AI - Backend Server" cmd /k "cd /d %~dp0clear-path-backend\clear-path-backend && uvicorn main:app --reload --host 0.0.0.0 --port 8000"

:: 2. Start Python Web Server in a new window
echo [2/3] Starting Web Server on http://localhost:3000 ...
start "ClearPath AI - Web Dashboard" cmd /k "cd /d %~dp0clear-path-web && python -m http.server 3000"

:: 3. Pause briefly and open Web Browser automatically
ping -n 3 127.0.0.1 >nul
echo [3/3] Opening Web Dashboard in Browser...
start http://localhost:3000

echo.
echo ===================================================
echo All services launched successfully!
echo - Backend API Docs: http://localhost:8000/docs
echo - Web Dashboard:    http://localhost:3000
echo ===================================================
