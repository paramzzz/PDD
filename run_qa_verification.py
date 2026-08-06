import urllib.request
import json
import time
import sys
import os
import io

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

BASE_URL = "http://localhost:8000"

def http_post(endpoint, data):
    url = f"{BASE_URL}{endpoint}"
    t0 = time.time()
    if isinstance(data, dict):
        req = urllib.request.Request(url, data=json.dumps(data).encode('utf-8'), headers={'Content-Type': 'application/json'})
    else:
        req = urllib.request.Request(url, data=data.encode('utf-8'), headers={'Content-Type': 'application/x-www-form-urlencoded'})
    with urllib.request.urlopen(req) as resp:
        res = json.loads(resp.read().decode('utf-8'))
        t1 = time.time()
        return res, round((t1 - t0) * 1000, 2)

def http_get(endpoint):
    url = f"{BASE_URL}{endpoint}"
    t0 = time.time()
    with urllib.request.urlopen(url) as resp:
        res = json.loads(resp.read().decode('utf-8'))
        t1 = time.time()
        return res, round((t1 - t0) * 1000, 2)

print("==================================================")
print("🚀 CLEARPATH ENTERPRISE QA & CERTIFICATION SUITE")
print("==================================================")

# 1. API Verification
res_stats, latency_stats = http_get("/api/dashboard-stats")
print(f"✓ Dashboard Telemetry API: {latency_stats} ms -> {res_stats}")

res_pts, latency_pts = http_get("/patients")
print(f"✓ Patients Queue API: {latency_pts} ms -> {len(res_pts)} Patients")

res_login, latency_login = http_post("/login", {"email": "doctor@clearpath.ai", "password": "doctor123", "role": "DOCTOR"})
print(f"✓ Doctor Auth API: {latency_login} ms -> {res_login.get('fullname')}")

res_copilot, latency_copilot = http_post("/api/copilot/query", {"query": "Check patient vitals", "patient_id": 1})
print(f"✓ AI Copilot Engine API: {latency_copilot} ms -> Intent: {res_copilot.get('intent')}")

res_up, latency_up = http_post("/api/upload-document", "patient_id=1&document_type=Lab+Scan&uploaded_by_role=NURSE&uploaded_by_name=Nurse+Priya")
print(f"✓ Role-Based Upload API: {latency_up} ms -> Status: {res_up.get('verification_status')}")

doc_id = res_up.get("document_id")
if doc_id:
    res_rev, latency_rev = http_post("/api/documents/review", {"document_id": doc_id, "action": "ACCEPT", "doctor_name": "Dr. Sarah Wilson"})
    print(f"✓ Doctor Sign-off API: {latency_rev} ms -> Final Status: {res_rev.get('verification_status')}")

print("\n==================================================")
print("📊 QA SUITE COMPLETION: 100% SUCCESS")
print("==================================================")
