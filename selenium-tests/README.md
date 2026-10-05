# CLEAR PATH — Enterprise Selenium End-to-End (E2E) Testing Framework

This directory contains the complete **Selenium End-to-End (E2E) Testing Framework** for the **CLEAR PATH** hospital clinical workflow web application.

---

## 1. Overview & Architecture

The testing framework uses the **Page Object Model (POM)** design pattern to automate web browser interactions, validate clinical UI workflows, and verify backend state integration.

- **Test Runner:** Mocha
- **Assertion Library:** Chai
- **Browser Automation:** Selenium WebDriver (Chrome / Headless Chrome)
- **Reporting Engine:** ExcelJS (Multi-sheet Excel workbook) & Mochawesome (HTML Dashboard)

---

## 2. Directory & File Structure

```
selenium-tests/
├── config/
│   └── test.config.js               # Framework configuration & environment defaults
├── pages/                           # Page Object Model (POM) Screen Representations
│   ├── BasePage.js                  # Common WebDriver helper methods
│   ├── LoginPage.js                 # Authentication & Role Selection page
│   ├── DashboardPage.js              # Executive Dashboard & AI Copilot page
│   ├── PatientPage.js                # Patient Directory & Registration form
│   ├── DocumentPage.js               # MDMS Upload & Document Viewer modal
│   ├── ClinicalAnalysisPage.js       # RAG Synthesis & AI Summary card page
│   ├── RiskScorePage.js              # Clinical Risk Scoring & Priority badge page
│   ├── InsurancePage.js              # Cashless Pre-Authorization Insurance page
│   ├── PaymentPage.js                # Billing & Finance Clearance page
│   ├── PreOpPage.js                  # Smart Pre-Op Checklist & Surgery Readiness page
│   └── TreatmentApprovalPage.js     # Automated Treatment Approval page
├── tests/                           # Complete Test Suites
│   ├── login.test.js                # Authentication test suite
│   ├── navigation.test.js           # Navigation bar & routing suite
│   ├── patient.test.js              # Patient registration & listing suite
│   ├── document_upload.test.js      # Multi-document PDF/Image upload suite
│   ├── clinical_analysis.test.js    # AI clinical summary & extraction suite
│   ├── risk_scoring.test.js         # Risk score generation suite
│   ├── emergency_priority.test.js   # Emergency priority categorization suite
│   ├── insurance.test.js            # Insurance pre-authorization suite
│   ├── payment.test.js              # Billing clearance suite
│   ├── preop.test.js                # Smart Pre-Op checklist suite
│   ├── treatment_approval.test.js   # Treatment approval recommendation suite
│   ├── dashboard.test.js            # Telemetry & AI Copilot suite
│   ├── document_viewer.test.js      # MDMS Document Viewer modal suite
│   ├── search.test.js               # Keyword search suite
│   ├── logout.test.js               # Session sign-out suite
│   └── complete_end_to_end.test.js  # Full 37-step end-to-end journey test suite
├── utils/
│   ├── driver.js                    # WebDriver factory
│   ├── testData.js                  # Synthetic test patient data & file paths
│   ├── logger.js                    # Formatted file logger
│   ├── screenshot.js                # Failure screenshot capture utility
│   ├── excelReport.js               # ExcelJS 5-sheet report generator
│   ├── testRunner.js                # Test registry & execution recorder
│   └── mochaHooks.js                # Global Mocha hooks for report generation
├── test-data/                       # Synthetic Test Files
│   ├── sample_prescription.pdf
│   ├── sample_lab_report.pdf
│   ├── sample_scan_report.pdf
│   ├── sample_insurance.pdf
│   └── sample_payment_receipt.pdf
├── reports/                         # Execution Artifacts
│   ├── excel/                       # ClearPath_E2E_Test_Report.xlsx
│   ├── html/                        # HTML test report
│   ├── screenshots/                 # Captured failure/milestone PNGs
│   └── logs/                        # ClearPath_E2E_Execution.log
├── package.json
├── run-all-tests.bat
└── README.md
```

---

## 3. How to Run Tests Locally (Windows)

### Prerequisites
1. Clear Path FastAPI Backend running on `http://localhost:8000`.
2. Clear Path Web Server running on `http://localhost:3000`.

### Execution Commands
From the `selenium-tests` directory:

```bash
# Run all Selenium tests and generate Excel & HTML reports
npm test

# Run complete 37-step end-to-end journey test suite
npm run test:e2e

# Generate Excel report from execution log
npm run report
```

Or run via Windows batch script:
```cmd
run-all-tests.bat
```

### Running in Headless Mode
To execute tests headlessly (e.g. for CI environments):
```bash
HEADLESS=true npm test
```

---

## 4. Multi-Sheet Excel Report (`reports/excel/ClearPath_E2E_Test_Report.xlsx`)

After every test execution, an Excel workbook is generated with **5 dedicated worksheets**:

1. **Sheet 1: Summary** — High-level metadata (`Test Suite`, `Total Tests`, `Passed`, `Failed`, `Pass Rate %`, `Duration`, `Start Time`, `End Time`).
2. **Sheet 2: Passed Tests** — `No.`, `Category`, `Test Name`, `Time (sec)`, `Status` (Green badge).
3. **Sheet 3: Failed Tests** — `No.`, `Category`, `Test Name`, `Error`, `Status` (Red badge), `Timestamp`.
4. **Sheet 4: Execution Log** — Structured log timestamps, levels, and execution messages.
5. **Sheet 5: Test Details** — Comprehensive test-by-test failure reason and status matrix.

---

## 5. GitHub Actions Integration & Artifact Download

The GitHub Actions workflow is defined in `.github/workflows/selenium-e2e.yml`.

### How to Download Reports from GitHub Actions:
1. Go to your repository on GitHub.
2. Click on the **Actions** tab.
3. Select **CLEAR PATH Enterprise CI/CD & Selenium E2E Suite**.
4. Click on the latest workflow run.
5. Scroll down to the **Artifacts** section at the bottom.
6. Click **`CLEAR-PATH-SELENIUM-E2E-REPORT`** to download the ZIP package containing:
   - `ClearPath_E2E_Test_Report.xlsx`
   - HTML report
   - Failure screenshots (if any)
   - Execution log file
