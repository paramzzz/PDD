@echo off

echo ========================================
echo   CLEAR PATH — SELENIUM E2E SUITE
echo ========================================
echo.

:: 1. Verify Backend Health
echo [1/3] Checking Clear Path FastAPI Backend readiness on http://localhost:8000/health ...
curl.exe -s http://localhost:8000/health > %~dp0temp_backend.txt 2>nul
findstr /i "status" %~dp0temp_backend.txt >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Clear Path Backend server is NOT running on http://localhost:8000!
    if exist %~dp0temp_backend.txt del %~dp0temp_backend.txt
    exit /b 1
)
if exist %~dp0temp_backend.txt del %~dp0temp_backend.txt
echo [OK] Backend server is online.

:: 2. Verify Frontend Web Availability
echo [2/3] Checking Clear Path Web Server on http://localhost:3000 ...
curl.exe -s http://localhost:3000 > %~dp0temp_frontend.txt 2>nul
findstr /i "ClearPath" %~dp0temp_frontend.txt >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Clear Path Web Server is NOT running on http://localhost:3000!
    if exist %~dp0temp_frontend.txt del %~dp0temp_frontend.txt
    exit /b 1
)
if exist %~dp0temp_frontend.txt del %~dp0temp_frontend.txt
echo [OK] Frontend web server is online.
echo.

:: 3. Create Report Output Directories
if not exist "%~dp0reports\excel" mkdir "%~dp0reports\excel"
if not exist "%~dp0reports\html" mkdir "%~dp0reports\html"
if not exist "%~dp0reports\screenshots" mkdir "%~dp0reports\screenshots"
if not exist "%~dp0reports\logs" mkdir "%~dp0reports\logs"

:: 4. Run Selenium E2E Test Suite
echo [3/3] Executing Selenium End-to-End Test Suite ...
cd /d "%~dp0"
call npx mocha tests/*.test.js --file utils/mochaHooks.js --timeout 120000 --reporter mochawesome --reporter-options reportDir=reports/html,reportFilename=mochawesome
set TEST_EXIT=%ERRORLEVEL%

echo.
echo ========================================
echo CLEAR PATH SELENIUM E2E TESTING SUMMARY
echo ========================================
echo.
echo Excel Report:
echo reports/excel/ClearPath_E2E_Test_Report.xlsx
echo.
echo HTML Report:
echo reports/html/mochawesome.html
echo.
echo Screenshots:
echo reports/screenshots/
echo ========================================
echo.

exit /b %TEST_EXIT%
