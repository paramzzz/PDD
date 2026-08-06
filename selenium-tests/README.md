# CLEAR PATH — Enterprise Selenium E2E Automation Testing Framework

An enterprise-grade, independent **Selenium WebDriver End-to-End Testing Framework** designed for **CLEAR PATH: An AI-Powered Multi-Document Clinical Intelligence System for Automated Treatment Approval and Emergency Prioritization in Hospitals**.

---

## 🛠️ Technology Stack

- **Node.js** (v18+)
- **Selenium WebDriver** (`selenium-webdriver`)
- **ChromeDriver** (`@chromedriver/chromedriver`)
- **Mocha** (Test runner & BDD syntax)
- **Chai** (Assertion library)
- **ExcelJS** & **XLSX** (Excel report generation with formatting)
- **Mochawesome** (Interactive HTML report generator with charts)
- **dotenv** (Environment configuration)

---

## 📁 Directory Structure

```text
selenium-tests/
├── config/
│   └── config.js                   # Framework configuration & environment settings
├── pages/                          # Page Object Model (POM) Design Pattern
│   ├── LoginPage.js                # Role switching & user session management
│   ├── DashboardPage.js            # Executive dashboard telemetry & bottom navigation
│   ├── PatientPage.js              # Patient directory, card listing & patient search
│   ├── ScanCenterPage.js           # Medical Document Center & repository management
│   ├── UploadPage.js               # Multi-document upload modal & step progress
│   ├── ViewerPage.js               # Medical Document Viewer, controls & AI report
│   ├── CareTeamPage.js             # Care team directory
│   ├── AlertsPage.js               # Real-time clinical alerts
│   └── CommandCenterPage.js        # Operations Command Center
├── tests/                          # Automated E2E Test Suites
│   ├── login.test.js               # Application launch & login test cases
│   ├── navigation.test.js          # Bottom navigation bar verification
│   ├── dashboard.test.js           # Telemetry stat cards & metrics
│   ├── patient.test.js             # Patient search & directory
│   ├── repository.test.js          # Document repository filtering & cards
│   ├── upload.test.js              # Multi-document upload workflow & animation
│   ├── aiSummary.test.js           # AI Bundle summary & risk engine report
│   ├── treatmentApproval.test.js   # Automated treatment approval decision
│   ├── viewer.test.js              # Image viewer controls & corner close button
│   ├── search.test.js              # Multi-field search & telemetry
│   ├── emergencyPriority.test.js   # Emergency priority badges & queue
│   └── fullWorkflow.test.js        # End-to-end clinical journey
├── utils/                          # Framework Utilities
│   ├── driverFactory.js            # Chrome WebDriver instantiation (Headless support)
│   ├── excelReporter.js            # Formatted Excel reports (Test_Report.xlsx & Test_Summary.xlsx)
│   ├── screenshot.js               # Automatic screenshot capture
│   ├── logger.js                   # Execution logger
│   ├── generateReports.js          # Report generator trigger
│   └── sampleGenerator.js          # Sample document generator for upload tests
├── reports/                        # Automated Reports Directory
│   ├── excel/                      # Excel reports
│   ├── html/                       # Mochawesome HTML report
│   └── screenshots/                # Captured screenshots (Pass/Fail/Before/After)
├── package.json                    # NPM dependencies & scripts
├── run-all-tests.bat               # One-click Windows batch execution script
└── README.md                       # Documentation
```

---

## 🚀 Execution Instructions

### Option 1: One-Click Windows Execution
Double-click `run-all-tests.bat` or run from terminal:
```cmd
cd selenium-tests
run-all-tests.bat
```

### Option 2: NPM Command Line
1. **Install dependencies**:
   ```bash
   cmd /c npm install
   ```
2. **Execute all tests**:
   ```bash
   cmd /c npm test
   ```
3. **Generate Excel & HTML Reports**:
   ```bash
   cmd /c npm run all
   ```

---

## 📊 Automated Reports

- **Excel Detailed Report**: `reports/excel/Test_Report.xlsx`
  - Includes: `Test ID`, `Module`, `Test Name`, `Expected Result`, `Actual Result`, `Status` (Green PASS / Red FAIL / Yellow WARNING), `Execution Time`, `Duration`, `Screenshot Path`, `Remarks`.
- **Excel Executive Summary**: `reports/excel/Test_Summary.xlsx`
  - Includes: `Total Tests`, `Passed`, `Failed`, `Skipped`, `Success Rate %`, `Execution Time`, `Average API Response Time`, `Average Multi-Doc Upload Time`, `Average Viewer Load Time`.
- **Mochawesome HTML Report**: `reports/html/mochawesome.html`
- **Screenshots**: Saved in `reports/screenshots/`
