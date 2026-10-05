@echo off

echo ========================================
echo   CLEAR PATH — BASELINE LOAD TEST SUITE
echo ========================================
echo.

:: 1. Verify Backend Health
echo [1/4] Checking Clear Path FastAPI Backend readiness on http://localhost:8000/health ...
curl.exe -s http://localhost:8000/health > %~dp0temp_health.txt 2>nul
findstr /i "status" %~dp0temp_health.txt >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Clear Path Backend server is NOT running or unreachable at http://localhost:8000!
    echo Please start the FastAPI backend server first using run_all.bat or:
    echo cd clear-path-backend\clear-path-backend ^&^& python -m uvicorn main:app --reload --port 8000
    if exist %~dp0temp_health.txt del %~dp0temp_health.txt
    exit /b 1
)
if exist %~dp0temp_health.txt del %~dp0temp_health.txt
echo [OK] Backend server is healthy.
echo.

:: 2. Determine k6 Executable Path
echo [2/4] Locating k6 load test engine ...
set K6_CMD=
where k6 >nul 2>&1
if %ERRORLEVEL%==0 (
    set K6_CMD=k6
) else if exist "%~dp0bin\k6.exe" (
    set K6_CMD="%~dp0bin\k6.exe"
) else if exist "%~dp0..\load-tests\bin\k6.exe" (
    set K6_CMD="%~dp0..\load-tests\bin\k6.exe"
) else (
    echo [INFO] k6 binary not found locally. Downloading portable k6 executable ...
    powershell -Command "New-Item -ItemType Directory -Force -Path '%~dp0bin'; Invoke-WebRequest -Uri 'https://github.com/grafana/k6/releases/download/v0.54.0/k6-v0.54.0-windows-amd64.zip' -OutFile '%~dp0bin\k6.zip'; Expand-Archive -Path '%~dp0bin\k6.zip' -DestinationPath '%~dp0bin\temp' -Force; Move-Item -Path '%~dp0bin\temp\k6-v0.54.0-windows-amd64\k6.exe' -Destination '%~dp0bin\k6.exe' -Force; Remove-Item -Recurse -Force '%~dp0bin\k6.zip', '%~dp0bin\temp';"
    set K6_CMD="%~dp0bin\k6.exe"
)

echo [OK] Using k6 engine: %K6_CMD%
echo.

:: 3. Create Report Output Directories
if not exist "%~dp0reports\excel" mkdir "%~dp0reports\excel"
if not exist "%~dp0reports\json" mkdir "%~dp0reports\json"
if not exist "%~dp0reports\html" mkdir "%~dp0reports\html"

:: 4. Run k6 Baseline Load Test (100 VUs / 60 seconds)
echo [3/4] Executing 60-second Baseline Load Test (100 Concurrent Virtual Users) ...
cd /d "%~dp0"
%K6_CMD% run scripts\baseline_load_test.js
if %ERRORLEVEL% neq 0 (
    echo [INFO] k6 run completed. Processing results...
)
echo.

:: 5. Generate Excel and HTML Performance Reports
echo [4/4] Processing raw metrics and generating Excel and HTML reports ...
python utils\generate_excel_report.py
set REPORT_EXIT=%ERRORLEVEL%

echo.
exit /b %REPORT_EXIT%
