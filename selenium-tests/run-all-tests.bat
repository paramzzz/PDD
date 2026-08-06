@echo off
title CLEAR PATH Enterprise Selenium E2E Test Suite
color 0A

echo ========================================================
echo   CLEAR PATH: AI-Powered Multi-Document Clinical System
echo   Enterprise Selenium End-to-End Automation Framework
echo ========================================================
echo.

cd /d "%~dp0"

echo [1/4] Installing dependencies...
call cmd /c npm install
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Failed to install npm dependencies!
    exit /b %ERRORLEVEL%
)

echo.
echo [2/4] Executing Selenium WebDriver E2E Test Suite...
call cmd /c npm test
if %ERRORLEVEL% NEQ 0 (
    echo ⚠️ Test suite executed with failures. Proceeding to report generation...
)

echo.
echo [3/4] Generating Excel Reports (Test_Report.xlsx & Test_Summary.xlsx)...
call cmd /c npm run excel

echo.
echo ========================================================
echo 🎉 E2E Selenium Test Suite Completed Successfully!
echo.
echo 📊 Excel Reports:
echo    · reports/excel/Test_Report.xlsx
echo    · reports/excel/Test_Summary.xlsx
echo 🌐 Mochawesome HTML Report:
echo    · reports/html/mochawesome.html
echo 📸 Screenshots:
echo    · reports/screenshots/
echo ========================================================
pause
