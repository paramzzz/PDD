import sys
import os

# Set UTF-8 encoding for stdout
sys.stdout.reconfigure(encoding='utf-8')

backend_dir = r"c:\Users\Param\Downloads\clear-path-app\clear-path-backend\clear-path-backend"
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from fastapi.testclient import TestClient
from main import app

def run_tests():
    print("=" * 60)
    print("TESTING KPI DASHBOARD DRILL-DOWN REST APIS & DATA")
    print("=" * 60)

    client = TestClient(app)

    # 1. Critical Cases API
    print("\n[1/6] Testing GET /api/dashboard/critical...")
    res = client.get("/api/dashboard/critical")
    assert res.status_code == 200, f"Expected 200, got {res.status_code}"
    data = res.json()
    assert isinstance(data, list), "Expected list of critical cases"
    print(f"PASSED: Received {len(data)} critical cases")
    if len(data) > 0:
        c = data[0]
        assert "case_id" in c and "stat_score" in c and "assigned_doctor" in c
        print(f"  Sample Critical Case: {c['full_name']} ({c['case_id']}) - Score {c['stat_score']}")

    # 2. Pending Verification API
    print("\n[2/6] Testing GET /api/dashboard/pending-verification...")
    res = client.get("/api/dashboard/pending-verification")
    assert res.status_code == 200, f"Expected 200, got {res.status_code}"
    data = res.json()
    assert isinstance(data, list), "Expected list of pending documents"
    print(f"PASSED: Received {len(data)} pending verification documents")

    # 3. Cleared Cases API
    print("\n[3/6] Testing GET /api/dashboard/cleared...")
    res = client.get("/api/dashboard/cleared")
    assert res.status_code == 200, f"Expected 200, got {res.status_code}"
    data = res.json()
    assert isinstance(data, list), "Expected list of cleared cases"
    print(f"PASSED: Received {len(data)} cleared cases")
    if len(data) > 0:
        cl = data[0]
        assert "case_id" in cl and "approval_date" in cl and "verified_documents_count" in cl
        print(f"  Sample Cleared Case: {cl['full_name']} ({cl['case_id']}) - Approved {cl['approval_date']}")

    # 4. Approval Time Analytics API
    print("\n[4/6] Testing GET /api/dashboard/approval-time...")
    res = client.get("/api/dashboard/approval-time")
    assert res.status_code == 200, f"Expected 200, got {res.status_code}"
    data = res.json()
    assert "today_avg_minutes" in data
    assert "department_averages" in data
    assert "doctor_performance" in data
    print(f"PASSED: Today's Avg Approval Time: {data['today_avg_minutes']} min (Target: {data['target_benchmark_minutes']} min)")
    print(f"PASSED: Department Breakdown: {len(data['department_averages'])} departments tracked")
    print(f"PASSED: Doctor Throughput: {len(data['doctor_performance'])} physicians tracked")

    # 5. Critical Patient Deep Details API
    print("\n[5/6] Testing GET /api/dashboard/critical/1...")
    res = client.get("/api/dashboard/critical/1")
    assert res.status_code == 200, f"Expected 200, got {res.status_code}"
    data = res.json()
    assert "emergency_status" in data and "pre_op_checklist" in data
    print(f"PASSED: Patient #{data['id']} Deep Details: Status={data['emergency_status']}, Checklist items={len(data['pre_op_checklist'])}")

    # 6. Analytics Overview API
    print("\n[6/6] Testing GET /api/dashboard/analytics...")
    res = client.get("/api/dashboard/analytics")
    assert res.status_code == 200, f"Expected 200, got {res.status_code}"
    print("PASSED: Analytics Overview API verified")

    print("\n" + "=" * 60)
    print("ALL 6 KPI DASHBOARD DRILL-DOWN TESTS PASSED 100% SUCCESS!")
    print("=" * 60)

if __name__ == "__main__":
    run_tests()
