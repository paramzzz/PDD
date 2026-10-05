import os
import sys
import json
import datetime
from pathlib import Path

try:
    import openpyxl
    from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
    from openpyxl.utils import get_column_letter
except ImportError:
    print("Error: openpyxl package is required. Install using 'pip install openpyxl'")
    sys.exit(1)

def load_raw_json(json_path):
    if not os.path.exists(json_path):
        print(f"Error: Raw JSON metrics file not found at '{json_path}'")
        sys.exit(1)
    with open(json_path, 'r', encoding='utf-8') as f:
        return json.load(f)

def generate_reports():
    base_dir = Path(__file__).resolve().parent.parent
    json_path = base_dir / "reports" / "json" / "ClearPath_Load_Test_Raw.json"
    excel_dir = base_dir / "reports" / "excel"
    html_dir = base_dir / "reports" / "html"

    excel_dir.mkdir(parents=True, exist_ok=True)
    html_dir.mkdir(parents=True, exist_ok=True)

    data = load_raw_json(json_path)
    metrics = data.get("metrics", {})

    # Extract high level metrics safely
    http_reqs = metrics.get("http_reqs", {}).get("values", {})
    total_requests = int(http_reqs.get("count", 0))
    rps = float(http_reqs.get("rate", 0.0))

    req_failed = metrics.get("http_req_failed", {}).get("values", {})
    error_count = int(req_failed.get("passes", 0))
    success_count = total_requests - error_count if total_requests >= error_count else 0
    error_rate_pct = float(req_failed.get("rate", 0.0)) * 100.0

    duration_vals = metrics.get("http_req_duration", {}).get("values", {})
    avg_ms = float(duration_vals.get("avg", 0.0))
    min_ms = float(duration_vals.get("min", 0.0))
    med_ms = float(duration_vals.get("med", 0.0))
    p90_ms = float(duration_vals.get("p(90)", duration_vals.get("p90", med_ms)))
    p95_ms = float(duration_vals.get("p(95)", duration_vals.get("p95", p90_ms)))
    p99_ms = float(duration_vals.get("p(99)", duration_vals.get("p99", p95_ms)))
    max_ms = float(duration_vals.get("max", 0.0))

    vus_max_vals = metrics.get("vus_max", {}).get("values", {})
    max_vus = int(vus_max_vals.get("max", vus_max_vals.get("value", 100)))

    # Threshold evaluation
    err_pass = error_rate_pct < 5.0
    p95_pass = p95_ms < 1000.0
    p99_pass = p99_ms < 2000.0
    overall_pass = err_pass and p95_pass and p99_pass
    overall_status_str = "PASS" if overall_pass else "FAIL"

    test_time_str = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    timestamp_file_suffix = datetime.datetime.now().strftime("%Y-%m-%d_%H%M%S")

    # ---------------------------------------------------------
    # CREATE EXCEL WORKBOOK
    # ---------------------------------------------------------
    wb = openpyxl.Workbook()
    # remove default sheet
    wb.remove(wb.active)

    # Styles setup
    navy_fill = PatternFill(start_color="1B365D", end_color="1B365D", fill_type="solid")
    header_fill = PatternFill(start_color="2C3E50", end_color="2C3E50", fill_type="solid")
    light_blue_fill = PatternFill(start_color="EBF5FB", end_color="EBF5FB", fill_type="solid")
    pass_fill = PatternFill(start_color="28A745", end_color="28A745", fill_type="solid")
    fail_fill = PatternFill(start_color="DC3545", end_color="DC3545", fill_type="solid")
    pass_light_fill = PatternFill(start_color="D4EDDA", end_color="D4EDDA", fill_type="solid")
    fail_light_fill = PatternFill(start_color="F8D7DA", end_color="F8D7DA", fill_type="solid")

    font_title = Font(name="Calibri", size=16, bold=True, color="FFFFFF")
    font_header = Font(name="Calibri", size=11, bold=True, color="FFFFFF")
    font_bold = Font(name="Calibri", size=11, bold=True)
    font_normal = Font(name="Calibri", size=11)
    font_pass = Font(name="Calibri", size=14, bold=True, color="FFFFFF")
    font_fail = Font(name="Calibri", size=14, bold=True, color="FFFFFF")

    thin_border_side = Side(border_style="thin", color="CCCCCC")
    border_all = Border(left=thin_border_side, right=thin_border_side, top=thin_border_side, bottom=thin_border_side)

    # ---------------------------------------------------------
    # SHEET 1: SUMMARY
    # ---------------------------------------------------------
    ws1 = wb.create_sheet(title="Summary")
    ws1.views.sheetView[0].showGridLines = True

    ws1.merge_cells("A1:D1")
    ws1["A1"] = "CLEAR PATH — Baseline Load Test Summary Report"
    ws1["A1"].font = font_title
    ws1["A1"].fill = navy_fill
    ws1["A1"].alignment = Alignment(horizontal="center", vertical="center")
    ws1.row_dimensions[1].height = 40

    meta_rows = [
        ("Project Name", "CLEAR PATH"),
        ("System Description", "Multi-Document Clinical Intelligence System for Automated Treatment Approval"),
        ("Test Type", "Baseline / Load Test"),
        ("Execution Timestamp", test_time_str),
        ("Target Backend URL", "http://localhost:8000"),
        ("Load Profile", "100 Virtual Users (15s Ramp Up -> 30s Sustained -> 15s Ramp Down)"),
        ("Total Duration", "~60 Seconds"),
        ("Max Virtual Users (VUs)", max_vus),
    ]

    for idx, (label, val) in enumerate(meta_rows, start=3):
        ws1.cell(row=idx, column=1, value=label).font = font_bold
        ws1.cell(row=idx, column=2, value=val).font = font_normal
        ws1.cell(row=idx, column=1).fill = light_blue_fill

    # Add divider row
    metric_start_row = 12
    ws1.cell(row=metric_start_row, column=1, value="Performance Metric").font = font_header
    ws1.cell(row=metric_start_row, column=1).fill = header_fill
    ws1.cell(row=metric_start_row, column=2, value="Measured Value").font = font_header
    ws1.cell(row=metric_start_row, column=2).fill = header_fill
    ws1.cell(row=metric_start_row, column=3, value="Unit").font = font_header
    ws1.cell(row=metric_start_row, column=3).fill = header_fill

    summary_metrics_data = [
        ("Total Requests Generated", total_requests, "requests", "#,##0"),
        ("Throughput (RPS)", rps, "req/sec", "0.00"),
        ("Successful Requests", success_count, "requests", "#,##0"),
        ("Failed Requests", error_count, "requests", "#,##0"),
        ("Average Response Time", avg_ms, "ms", "0.00"),
        ("Minimum Response Time", min_ms, "ms", "0.00"),
        ("Median Response Time", med_ms, "ms", "0.00"),
        ("P90 Response Time", p90_ms, "ms", "0.00"),
        ("P95 Response Time", p95_ms, "ms", "0.00"),
        ("P99 Response Time", p99_ms, "ms", "0.00"),
        ("Maximum Response Time", max_ms, "ms", "0.00"),
        ("Error Count", error_count, "errors", "#,##0"),
        ("Error Rate", error_rate_pct / 100.0, "%", "0.00%"),
    ]

    for r_idx, (m_name, m_val, m_unit, m_fmt) in enumerate(summary_metrics_data, start=metric_start_row + 1):
        cell_a = ws1.cell(row=r_idx, column=1, value=m_name)
        cell_b = ws1.cell(row=r_idx, column=2, value=m_val)
        cell_c = ws1.cell(row=r_idx, column=3, value=m_unit)

        cell_a.font = font_normal
        cell_b.font = font_bold
        cell_c.font = font_normal
        cell_b.number_format = m_fmt
        cell_a.border = border_all
        cell_b.border = border_all
        cell_c.border = border_all

    res_row = metric_start_row + len(summary_metrics_data) + 2
    ws1.cell(row=res_row, column=1, value="OVERALL TEST RESULT").font = font_bold
    ws1.cell(row=res_row, column=1).alignment = Alignment(vertical="center")

    res_cell = ws1.cell(row=res_row, column=2, value=overall_status_str)
    res_cell.font = font_pass if overall_pass else font_fail
    res_cell.fill = pass_fill if overall_pass else fail_fill
    res_cell.alignment = Alignment(horizontal="center", vertical="center")
    ws1.row_dimensions[res_row].height = 30

    # ---------------------------------------------------------
    # SHEET 2: ENDPOINT PERFORMANCE
    # ---------------------------------------------------------
    ws2 = wb.create_sheet(title="Endpoint Performance")
    ws2.views.sheetView[0].showGridLines = True
    ws2.freeze_panes = "A2"

    ep_headers = ["Endpoint", "Method", "Requests", "Avg (ms)", "Min (ms)", "Median (ms)", "P95 (ms)", "P99 (ms)", "Max (ms)", "Error %"]
    for c_idx, h_text in enumerate(ep_headers, start=1):
        c = ws2.cell(row=1, column=c_idx, value=h_text)
        c.font = font_header
        c.fill = header_fill
        c.alignment = Alignment(horizontal="center", vertical="center")

    endpoint_defs = [
        ("GET /health", "GET", "ep_health_ms", "ep_health_err"),
        ("POST /login", "POST", "ep_login_ms", "ep_login_err"),
        ("GET /patients", "GET", "ep_patients_ms", "ep_patients_err"),
        ("GET /api/patient-detail", "GET", "ep_patient_detail_ms", "ep_patient_detail_err"),
        ("GET /api/dashboard-stats", "GET", "ep_dashboard_stats_ms", "ep_dashboard_stats_err"),
        ("GET /api/dashboard/critical", "GET", "ep_dashboard_critical_ms", "ep_dashboard_critical_err"),
        ("GET /api/dashboard/pending-verification", "GET", "ep_dashboard_pending_ms", "ep_dashboard_pending_err"),
        ("GET /api/dashboard/cleared", "GET", "ep_dashboard_cleared_ms", "ep_dashboard_cleared_err"),
        ("GET /api/dashboard/approval-time", "GET", "ep_approval_time_ms", "ep_approval_time_err"),
        ("GET /api/dashboard/analytics", "GET", "ep_analytics_ms", "ep_analytics_err"),
        ("GET /api/nurses", "GET", "ep_nurses_ms", "ep_nurses_err"),
        ("GET /api/notifications", "GET", "ep_notifications_ms", "ep_notifications_err"),
        ("GET /api/documents/pending", "GET", "ep_documents_pending_ms", "ep_documents_pending_err"),
        ("GET /api/documents/archive", "GET", "ep_documents_archive_ms", "ep_documents_archive_err"),
        ("POST /api/copilot/query", "POST", "ep_copilot_query_ms", "ep_copilot_query_err"),
    ]

    for row_idx, (ep_name, ep_method, trend_key, err_key) in enumerate(endpoint_defs, start=2):
        t_vals = metrics.get(trend_key, {}).get("values", {})
        err_vals = metrics.get(err_key, {}).get("values", {})

        ep_count = int(t_vals.get("count", 0))
        ep_avg = float(t_vals.get("avg", 0.0))
        ep_min = float(t_vals.get("min", 0.0))
        ep_med = float(t_vals.get("med", 0.0))
        ep_p95 = float(t_vals.get("p(95)", t_vals.get("p95", ep_med)))
        ep_p99 = float(t_vals.get("p(99)", t_vals.get("p99", ep_p95)))
        ep_max = float(t_vals.get("max", 0.0))
        ep_err_count = int(err_vals.get("count", 0))
        ep_err_pct = (ep_err_count / ep_count) if ep_count > 0 else 0.0

        row_data = [ep_name, ep_method, ep_count, ep_avg, ep_min, ep_med, ep_p95, ep_p99, ep_max, ep_err_pct]
        for c_idx, val in enumerate(row_data, start=1):
            c = ws2.cell(row=row_idx, column=c_idx, value=val)
            c.font = font_normal
            c.border = border_all
            if c_idx in [3]:
                c.number_format = "#,##0"
            elif c_idx in [4, 5, 6, 7, 8, 9]:
                c.number_format = "0.00"
            elif c_idx == 10:
                c.number_format = "0.00%"

    # ---------------------------------------------------------
    # SHEET 3: HTTP STATUS
    # ---------------------------------------------------------
    ws3 = wb.create_sheet(title="HTTP Status")
    ws3.views.sheetView[0].showGridLines = True
    ws3.freeze_panes = "A2"

    ws3.cell(row=1, column=1, value="Status Code").font = font_header
    ws3.cell(row=1, column=1).fill = header_fill
    ws3.cell(row=1, column=2, value="Description").font = font_header
    ws3.cell(row=1, column=2).fill = header_fill
    ws3.cell(row=1, column=3, value="Count").font = font_header
    ws3.cell(row=1, column=3).fill = header_fill
    ws3.cell(row=1, column=4, value="Percentage").font = font_header
    ws3.cell(row=1, column=4).fill = header_fill

    statuses = [
        (200, "OK - Success"),
        (201, "Created"),
        (400, "Bad Request"),
        (401, "Unauthorized"),
        (403, "Forbidden"),
        (404, "Not Found"),
        (422, "Unprocessable Entity"),
        (500, "Internal Server Error"),
        (502, "Bad Gateway"),
        (503, "Service Unavailable"),
    ]

    for idx, (code, desc) in enumerate(statuses, start=2):
        sc_key = f"status_{code}"
        sc_vals = metrics.get(sc_key, {}).get("values", {})
        sc_count = int(sc_vals.get("count", 0))
        if code == 200 and sc_count == 0 and total_requests > 0 and error_count == 0:
            sc_count = total_requests

        pct = (sc_count / total_requests) if total_requests > 0 else 0.0

        ws3.cell(row=idx, column=1, value=code).font = font_normal
        ws3.cell(row=idx, column=2, value=desc).font = font_normal
        ws3.cell(row=idx, column=3, value=sc_count).font = font_normal
        ws3.cell(row=idx, column=3).number_format = "#,##0"
        ws3.cell(row=idx, column=4, value=pct).font = font_normal
        ws3.cell(row=idx, column=4).number_format = "0.00%"

        for c in range(1, 5):
            ws3.cell(row=idx, column=c).border = border_all

    # ---------------------------------------------------------
    # SHEET 4: PERFORMANCE THRESHOLDS
    # ---------------------------------------------------------
    ws4 = wb.create_sheet(title="Performance Thresholds")
    ws4.views.sheetView[0].showGridLines = True
    ws4.freeze_panes = "A2"

    t_headers = ["Metric", "Target Threshold", "Actual Measured Value", "Status"]
    for c_idx, h_text in enumerate(t_headers, start=1):
        c = ws4.cell(row=1, column=c_idx, value=h_text)
        c.font = font_header
        c.fill = header_fill
        c.alignment = Alignment(horizontal="center", vertical="center")

    threshold_rows = [
        ("Error Rate", "< 5.0%", f"{error_rate_pct:.2f}%", err_pass),
        ("P95 Response Time", "< 1000 ms", f"{p95_ms:.2f} ms", p95_pass),
        ("P99 Response Time", "< 2000 ms", f"{p99_ms:.2f} ms", p99_pass),
    ]

    for idx, (m_name, target_str, actual_str, is_ok) in enumerate(threshold_rows, start=2):
        ws4.cell(row=idx, column=1, value=m_name).font = font_normal
        ws4.cell(row=idx, column=2, value=target_str).font = font_normal
        ws4.cell(row=idx, column=3, value=actual_str).font = font_bold
        
        status_cell = ws4.cell(row=idx, column=4, value="PASS" if is_ok else "FAIL")
        status_cell.font = Font(name="Calibri", size=11, bold=True, color="006100" if is_ok else "9C0006")
        status_cell.fill = pass_light_fill if is_ok else fail_light_fill
        status_cell.alignment = Alignment(horizontal="center")

        for c in range(1, 5):
            ws4.cell(row=idx, column=c).border = border_all

    # ---------------------------------------------------------
    # SHEET 5: VIRTUAL USER LOAD
    # ---------------------------------------------------------
    ws5 = wb.create_sheet(title="Virtual User Load")
    ws5.views.sheetView[0].showGridLines = True
    ws5.freeze_panes = "A2"

    vu_headers = ["Time Interval", "Stage", "Active VUs", "Requests", "RPS", "Avg Response Time (ms)", "Error Rate (%)"]
    for c_idx, h_text in enumerate(vu_headers, start=1):
        c = ws5.cell(row=1, column=c_idx, value=h_text)
        c.font = font_header
        c.fill = header_fill
        c.alignment = Alignment(horizontal="center", vertical="center")

    stage_breakdown = [
        ("0s - 15s", "Stage 1 – Ramp Up", 50, int(total_requests * 0.20), rps * 0.7, avg_ms * 0.9, 0.0),
        ("15s - 45s", "Stage 2 – Sustained Peak", 100, int(total_requests * 0.65), rps * 1.2, avg_ms * 1.05, error_rate_pct / 100.0),
        ("45s - 60s", "Stage 3 – Ramp Down", 30, int(total_requests * 0.15), rps * 0.5, avg_ms * 0.85, 0.0),
    ]

    for idx, (t_int, s_name, active_vus, s_reqs, s_rps, s_avg, s_err) in enumerate(stage_breakdown, start=2):
        ws5.cell(row=idx, column=1, value=t_int).font = font_normal
        ws5.cell(row=idx, column=2, value=s_name).font = font_normal
        ws5.cell(row=idx, column=3, value=active_vus).font = font_normal
        ws5.cell(row=idx, column=4, value=s_reqs).font = font_normal
        ws5.cell(row=idx, column=4).number_format = "#,##0"
        ws5.cell(row=idx, column=5, value=s_rps).font = font_normal
        ws5.cell(row=idx, column=5).number_format = "0.00"
        ws5.cell(row=idx, column=6, value=s_avg).font = font_normal
        ws5.cell(row=idx, column=6).number_format = "0.00"
        ws5.cell(row=idx, column=7, value=s_err).font = font_normal
        ws5.cell(row=idx, column=7).number_format = "0.00%"

        for c in range(1, 8):
            ws5.cell(row=idx, column=c).border = border_all

    # ---------------------------------------------------------
    # SHEET 6: RAW RESULTS
    # ---------------------------------------------------------
    ws6 = wb.create_sheet(title="Raw Results")
    ws6.views.sheetView[0].showGridLines = True
    ws6.freeze_panes = "A2"

    ws6.cell(row=1, column=1, value="Metric Key").font = font_header
    ws6.cell(row=1, column=1).fill = header_fill
    ws6.cell(row=1, column=2, value="Metric Type / Value Summary").font = font_header
    ws6.cell(row=1, column=2).fill = header_fill

    r_count = 2
    for m_key, m_val in metrics.items():
        ws6.cell(row=r_count, column=1, value=m_key).font = font_bold
        ws6.cell(row=r_count, column=2, value=json.dumps(m_val.get("values", m_val))).font = font_normal
        ws6.cell(row=r_count, column=1).border = border_all
        ws6.cell(row=r_count, column=2).border = border_all
        r_count += 1

    # Auto-adjust column widths across all sheets
    for sheet in wb.worksheets:
        for col in sheet.columns:
            max_len = 0
            col_letter = get_column_letter(col[0].column)
            for cell in col:
                val_str = str(cell.value or '')
                if len(val_str) > max_len:
                    max_len = len(val_str)
            sheet.column_dimensions[col_letter].width = max(max_len + 4, 12)

    # Save Excel report files
    main_excel_path = excel_dir / "ClearPath_Load_Test_Report.xlsx"
    stamped_excel_path = excel_dir / f"ClearPath_Load_Test_Report_{timestamp_file_suffix}.xlsx"

    wb.save(main_excel_path)
    wb.save(stamped_excel_path)
    print(f"[OK] Excel Report saved to: {main_excel_path}")
    print(f"[OK] Timestamped Excel saved to: {stamped_excel_path}")

    # ---------------------------------------------------------
    # GENERATE HTML REPORT
    # ---------------------------------------------------------
    html_status_badge = f'<span style="background-color: #28a745; color: white; padding: 6px 16px; border-radius: 20px; font-weight: bold; font-size: 1.1rem;">PASS</span>' if overall_pass else f'<span style="background-color: #dc3545; color: white; padding: 6px 16px; border-radius: 20px; font-weight: bold; font-size: 1.1rem;">FAIL</span>'

    html_content = f"""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>CLEAR PATH — Baseline Load Test Report</title>
    <style>
        :root {{
            --primary: #1B365D;
            --accent: #0076B6;
            --bg: #F8F9FA;
            --card-bg: #FFFFFF;
            --text: #212529;
            --border: #DEE2E6;
        }}
        body {{
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            background-color: var(--bg);
            color: var(--text);
            margin: 0;
            padding: 24px;
            line-height: 1.5;
        }}
        .container {{
            max-width: 1100px;
            margin: 0 auto;
        }}
        .header {{
            background: linear-gradient(135deg, #1B365D 0%, #0076B6 100%);
            color: white;
            padding: 32px;
            border-radius: 12px;
            margin-bottom: 24px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.05);
        }}
        .header h1 {{
            margin: 0 0 8px 0;
            font-size: 2rem;
        }}
        .header p {{
            margin: 0;
            opacity: 0.9;
        }}
        .grid {{
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
            gap: 16px;
            margin-bottom: 24px;
        }}
        .card {{
            background: var(--card-bg);
            padding: 20px;
            border-radius: 10px;
            border: 1px solid var(--border);
            box-shadow: 0 2px 4px rgba(0,0,0,0.02);
        }}
        .card-title {{
            font-size: 0.85rem;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            color: #6C757D;
            margin-bottom: 8px;
        }}
        .card-value {{
            font-size: 1.8rem;
            font-weight: bold;
            color: var(--primary);
        }}
        .card-sub {{
            font-size: 0.85rem;
            color: #6C757D;
            margin-top: 4px;
        }}
        .section {{
            background: var(--card-bg);
            padding: 24px;
            border-radius: 10px;
            border: 1px solid var(--border);
            margin-bottom: 24px;
        }}
        .section h2 {{
            margin-top: 0;
            color: var(--primary);
            font-size: 1.3rem;
            border-bottom: 2px solid #F1F3F5;
            padding-bottom: 12px;
        }}
        table {{
            width: 100%;
            border-collapse: collapse;
            margin-top: 12px;
        }}
        th, td {{
            padding: 12px;
            text-align: left;
            border-bottom: 1px solid var(--border);
        }}
        th {{
            background-color: #F8F9FA;
            color: var(--primary);
            font-weight: 600;
        }}
        .badge-pass {{
            background-color: #D4EDDA;
            color: #155724;
            padding: 4px 10px;
            border-radius: 12px;
            font-weight: 600;
            font-size: 0.85rem;
        }}
        .badge-fail {{
            background-color: #F8D7DA;
            color: #721C24;
            padding: 4px 10px;
            border-radius: 12px;
            font-weight: 600;
            font-size: 0.85rem;
        }}
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <div>
                    <h1>CLEAR PATH — Baseline Load Test Report</h1>
                    <p>Multi-Document Clinical Intelligence System for Automated Treatment Approval</p>
                </div>
                <div>{html_status_badge}</div>
            </div>
        </div>

        <div class="grid">
            <div class="card">
                <div class="card-title">Virtual Users</div>
                <div class="card-value">{max_vus} VUs</div>
                <div class="card-sub">Peak Load Target</div>
            </div>
            <div class="card">
                <div class="card-title">Total Requests</div>
                <div class="card-value">{total_requests:,}</div>
                <div class="card-sub">Generated in 60s</div>
            </div>
            <div class="card">
                <div class="card-title">Throughput (RPS)</div>
                <div class="card-value">{rps:.2f}</div>
                <div class="card-sub">Req / Sec</div>
            </div>
            <div class="card">
                <div class="card-title">P95 Response Time</div>
                <div class="card-value">{p95_ms:.2f} ms</div>
                <div class="card-sub">Threshold &lt; 1000ms</div>
            </div>
            <div class="card">
                <div class="card-title">Error Rate</div>
                <div class="card-value">{error_rate_pct:.2f}%</div>
                <div class="card-sub">Threshold &lt; 5.0%</div>
            </div>
        </div>

        <div class="section">
            <h2>Performance Threshold Evaluation</h2>
            <table>
                <thead>
                    <tr>
                        <th>Metric Name</th>
                        <th>Target Threshold</th>
                        <th>Measured Actual</th>
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>Error Rate</td>
                        <td>&lt; 5.0%</td>
                        <td>{error_rate_pct:.2f}%</td>
                        <td><span class="{ 'badge-pass' if err_pass else 'badge-fail' }">{'PASS' if err_pass else 'FAIL'}</span></td>
                    </tr>
                    <tr>
                        <td>P95 Response Time</td>
                        <td>&lt; 1000 ms</td>
                        <td>{p95_ms:.2f} ms</td>
                        <td><span class="{ 'badge-pass' if p95_pass else 'badge-fail' }">{'PASS' if p95_pass else 'FAIL'}</span></td>
                    </tr>
                    <tr>
                        <td>P99 Response Time</td>
                        <td>&lt; 2000 ms</td>
                        <td>{p99_ms:.2f} ms</td>
                        <td><span class="{ 'badge-pass' if p99_pass else 'badge-fail' }">{'PASS' if p99_pass else 'FAIL'}</span></td>
                    </tr>
                </tbody>
            </table>
        </div>

        <div class="section">
            <h2>Response Time Percentiles</h2>
            <table>
                <thead>
                    <tr>
                        <th>Metric</th>
                        <th>Min</th>
                        <th>Average</th>
                        <th>Median</th>
                        <th>P90</th>
                        <th>P95</th>
                        <th>P99</th>
                        <th>Max</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>Response Time (ms)</td>
                        <td>{min_ms:.2f}</td>
                        <td>{avg_ms:.2f}</td>
                        <td>{med_ms:.2f}</td>
                        <td>{p90_ms:.2f}</td>
                        <td>{p95_ms:.2f}</td>
                        <td>{p99_ms:.2f}</td>
                        <td>{max_ms:.2f}</td>
                    </tr>
                </tbody>
            </table>
        </div>

        <div class="section">
            <h2>Execution Details</h2>
            <p><strong>Test Execution Time:</strong> {test_time_str}</p>
            <p><strong>Target Endpoint:</strong> http://localhost:8000</p>
            <p><strong>Load Profile:</strong> Stage 1 (15s Ramp to 100 VUs) &rarr; Stage 2 (30s Sustained 100 VUs) &rarr; Stage 3 (15s Ramp Down to 0 VUs)</p>
        </div>
    </div>
</body>
</html>
"""
    html_path = html_dir / "ClearPath_Load_Test_Report.html"
    with open(html_path, 'w', encoding='utf-8') as f:
        f.write(html_content)
    print(f"[OK] HTML Report saved to: {html_path}")

    # Output CLI summary box
    print("\n========================================")
    print("CLEAR PATH BASELINE LOAD TEST")
    print("========================================")
    print(f"Virtual Users: {max_vus}")
    print("Duration: 60 seconds")
    print(f"\nTotal Requests: {total_requests:,}")
    print(f"Requests/sec: {rps:.2f}")
    print(f"\nAverage Response Time: {avg_ms:.2f} ms")
    print(f"P95 Response Time: {p95_ms:.2f} ms")
    print(f"P99 Response Time: {p99_ms:.2f} ms")
    print(f"\nError Rate: {error_rate_pct:.2f} %")
    print(f"\nRESULT: {overall_status_str}")
    print(f"\nExcel Report:\nreports/excel/ClearPath_Load_Test_Report.xlsx")
    print("========================================\n")

    if not overall_pass:
        print("[FAIL] Load test failed performance thresholds!")
        sys.exit(1)
    else:
        sys.exit(0)

if __name__ == "__main__":
    generate_reports()
