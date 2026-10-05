# CLEAR PATH — Baseline Load Testing & Excel Reporting Suite

This directory contains the **Baseline / Load Testing Module** for **CLEAR PATH** — a Multi-Document Clinical Intelligence System for Automated Treatment Approval and Emergency Prioritization.

---

## 1. Executive Overview & Purpose

The purpose of baseline load testing is to measure how the Clear Path FastAPI backend performs under expected peak concurrent usage by hospital clinical staff (emergency physicians, nurses, triage coordinators, and billing specialists).

The test evaluates whether the application maintains low latency, high throughput, and zero/minimal error rates under continuous concurrent load.

---

## 2. Load Testing Profile

| Stage | Duration | Virtual User Target | Description |
|---|---|---|---|
| **Stage 1 – Ramp Up** | 15 Seconds | 0 → 100 VUs | Gradually ramps up active virtual clinical users |
| **Stage 2 – Sustained Load** | 30 Seconds | 100 VUs | Sustains peak 100 concurrent virtual users |
| **Stage 3 – Ramp Down** | 15 Seconds | 100 → 0 VUs | Gradually ramps down traffic to complete test cycle |

- **Total Test Duration:** ~60 Seconds
- **Target Endpoint:** `http://localhost:8000` (or `LOAD_TEST_BASE_URL`)
- **Load Generation Engine:** Grafana k6

---

## 3. Metrics & Terminology

- **Virtual Users (VUs):** Simulated concurrent clinical staff interacting with the backend API simultaneously.
- **Total Requests:** The total number of HTTP GET/POST API calls made to the backend during the 60-second test window.
- **Requests Per Second (RPS):** The overall throughput calculated as `Total Requests / Test Duration`.
- **Response Time Percentiles:**
  - **Min / Avg / Median:** Minimum, average, and 50th percentile response latencies.
  - **P90 (90th Percentile):** 90% of requests completed faster than this time.
  - **P95 (95th Percentile):** Key performance SLA metric (95% of requests completed faster than this time).
  - **P99 (99th Percentile):** Tail latency indicator under heavy concurrent load.
  - **Max:** Maximum observed single request latency.
- **Error Rate (%):** Percentage of total requests returning unexpected HTTP 4xx/5xx status codes or connection errors.

---

## 4. Performance Thresholds & Pass/Fail Criteria

The test automatically evaluates three standard baseline performance SLAs:

1. **Error Rate:** `< 5.0%`
2. **P95 Response Time:** `< 1000 ms` (1.0 second)
3. **P99 Response Time:** `< 2000 ms` (2.0 seconds)

- If **all three thresholds** are satisfied, the overall test result is **PASS**.
- If **any single threshold** fails, the test result is **FAIL**.

> *Note: These performance thresholds validate baseline system responsiveness under test conditions.*

---

## 5. Directory & File Structure

```
load-tests/
├── scripts/
│   └── baseline_load_test.js        # k6 load test script defining 100 VU profile & requests
├── config/
│   └── load_test_config.json        # Test configuration & threshold parameters
├── reports/
│   ├── excel/
│   │   ├── ClearPath_Load_Test_Report.xlsx            # Primary generated Excel report
│   │   └── ClearPath_Load_Test_Report_<timestamp>.xlsx # Historical timestamped Excel report
│   ├── html/
│   │   └── ClearPath_Load_Test_Report.html            # Standalone HTML report
│   └── json/
│       └── ClearPath_Load_Test_Raw.json               # Raw k6 JSON output
├── utils/
│   └── generate_excel_report.py     # Python openpyxl script for 6-sheet Excel & HTML generation
├── bin/
│   └── k6.exe                        # Portable Windows k6 binary
├── requirements.txt                 # Python dependencies (openpyxl)
├── run-load-test.bat                # Windows local execution batch script
└── README.md                        # Documentation & user guide
```

---

## 6. How to Run Locally (Windows)

1. Ensure the Clear Path FastAPI backend server is running on `http://localhost:8000`.
2. Open Command Prompt or PowerShell in the project root directory.
3. Run:

```cmd
load-tests\run-load-test.bat
```

The script will:
- Verify backend health on `http://localhost:8000/health`.
- Execute the k6 baseline load test (100 VUs over 60 seconds).
- Process raw metrics and generate the 6-sheet Excel report in `reports/excel/ClearPath_Load_Test_Report.xlsx`.
- Generate the HTML report in `reports/html/ClearPath_Load_Test_Report.html`.
- Display a clean summary box in your terminal.

---

## 7. Excel Report Architecture

The generated Excel workbook (`reports/excel/ClearPath_Load_Test_Report.xlsx`) contains 6 formatted worksheets:

1. **Sheet 1: Summary** — High-level metadata, total requests, RPS, response time statistics, error rate, and bold overall result badge (PASS/FAIL).
2. **Sheet 2: Endpoint Performance** — Detailed breakdown per tested endpoint (`/health`, `/login`, `/patients`, `/api/dashboard-stats`, `/api/copilot/query`, etc.) including Min, Avg, Med, P95, P99, Max, and Error %.
3. **Sheet 3: HTTP Status** — HTTP status code distribution (200, 201, 400, 401, 403, 404, 422, 500, 502, 503).
4. **Sheet 4: Performance Thresholds** — Target vs. Actual metric evaluation table with color-coded status badges.
5. **Sheet 5: Virtual User Load** — Load stage progression timeline table (Ramp Up, Sustained Peak, Ramp Down).
6. **Sheet 6: Raw Results** — Structured JSON metric summary dump for complete auditability.

---

## 8. GitHub Actions Integration & Artifact Download

The repository includes a dedicated GitHub Actions workflow: `.github/workflows/load-testing.yml`.

To download the Excel report from GitHub Actions:
1. Go to your GitHub repository.
2. Click on the **Actions** tab.
3. Select **CLEAR PATH Baseline Load Testing & Excel Performance Suite**.
4. Click on the latest workflow run.
5. Scroll down to the **Artifacts** section at the bottom of the page.
6. Download **`CLEAR-PATH-LOAD-TEST-REPORT`**.
7. Extract the ZIP file to access `ClearPath_Load_Test_Report.xlsx` and `ClearPath_Load_Test_Report.html`.
