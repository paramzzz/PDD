import urllib.request
import json
import sys
import io

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

BASE_URL = "http://localhost:8000"

def run_test(name, fn):
    print(f"==================================================")
    print(f"🧪 TESTING: {name}")
    try:
        res = fn()
        print(f"✅ PASSED: {name}")
        print(f"   Result: {res}")
        return True
    except Exception as e:
        print(f"❌ FAILED: {name} - Error: {e}")
        return False

def http_post(endpoint, data):
    url = f"{BASE_URL}{endpoint}"
    if isinstance(data, dict):
        req = urllib.request.Request(url, data=json.dumps(data).encode('utf-8'), headers={'Content-Type': 'application/json'})
    else:
        req = urllib.request.Request(url, data=data.encode('utf-8'), headers={'Content-Type': 'application/x-www-form-urlencoded'})
    with urllib.request.urlopen(req) as resp:
        return json.loads(resp.read().decode('utf-8'))

def http_get(endpoint):
    url = f"{BASE_URL}{endpoint}"
    with urllib.request.urlopen(url) as resp:
        return json.loads(resp.read().decode('utf-8'))

results = []

# 1. DOCTOR & NURSE LOGIN
def test_doc_login():
    r = http_post("/login", {"email": "doctor@clearpath.ai", "password": "doctor123", "role": "DOCTOR"})
    assert r.get("success") == True, "Doctor login failed"
    return f"Logged in as {r.get('fullname')} (Doctor)"

def test_nurse_login():
    r = http_post("/login", {"email": "priya@clearpath.ai", "password": "nurse123", "role": "NURSE"})
    assert r.get("success") == True, "Nurse login failed"
    return f"Logged in as {r.get('fullname')} ({r.get('nurse_id')})"

# 2. PATIENT QUEUE & DETAIL
def test_patient_queue():
    pts = http_get("/patients")
    assert isinstance(pts, list) and len(pts) > 0, "No patients returned"
    return f"Fetched {len(pts)} active patients. First patient: {pts[0].get('full_name')} ({pts[0].get('initial_risk')})"

def test_patient_detail():
    p = http_get("/api/patient-detail?id=1")
    assert p.get("id") == 1, "Invalid patient returned"
    return f"Patient #1: {p.get('full_name')} - Complaint: {p.get('chief_complaint')} - BP: {p.get('bp')}"

# 3. RAG CLINICAL COPILOT
def test_copilot_missing_info():
    res = http_post("/api/copilot/query", {"query": "Do we have today vitals?", "patient_id": 1})
    assert res.get("intent") == "GET_LATEST_VITALS", "Incorrect intent"
    return f"Copilot intent: {res.get('intent')}, Action Required: {res.get('action_required')}"

def test_copilot_emergency():
    res = http_post("/api/copilot/query", {"query": "Patient is having severe chest pain. Ask nurse immediately.", "patient_id": 1})
    assert res.get("is_emergency") == True, "Emergency not detected"
    return f"Emergency flagged: {res.get('is_emergency')}, Intent: {res.get('intent')}"

# 4. NURSE WORKFLOW & TASK DISPATCH
def test_nurse_workflow():
    # Doctor creates request
    req = http_post("/api/nurse-requests/create", {
        "patient_id": 1,
        "request_text": "Verify blood pressure & heart rate.",
        "priority": "HIGH",
        "doctor_name": "Dr. Sarah Wilson"
    })
    req_id = req.get("request_id")
    assert req_id is not None, "Request creation failed"
    
    # Nurse responds with vitals
    resp = http_post("/api/nurse-requests/respond", {
        "request_id": req_id,
        "nurse_id": "NUR-1007",
        "nurse_name": "Nurse Priya Nair",
        "bp": "126/80",
        "hr": "78",
        "spo2": "99%",
        "temperature": "98.6F",
        "clinical_notes": "Patient is stable and resting comfortably."
    })
    assert resp.get("success") == True, "Nurse response submission failed"
    return f"Task #{req_id} completed by Nurse Priya. Vitals updated: {resp.get('vitals_summary')}"

# 5. DOCUMENT VERIFICATION RULES (DOCTOR VS NURSE)
def test_doctor_doc_upload():
    r = http_post("/api/upload-document", "patient_id=1&document_type=Cath+Lab+Report&uploaded_by_role=DOCTOR&uploaded_by_name=Dr.+Sarah+Wilson")
    assert r.get("verification_status") == "APPROVED", "Doctor upload should be auto-approved"
    assert r.get("saved_to_patient_record") == True, "Doctor upload should be directly saved"
    return f"Doctor Upload: Status={r.get('verification_status')}, Saved={r.get('saved_to_patient_record')}"

def test_nurse_doc_upload():
    # Nurse uploads document -> pending doctor approval
    r = http_post("/api/upload-document", "patient_id=1&document_type=ECHO+Scan&uploaded_by_role=NURSE&uploaded_by_name=Nurse+Priya+Nair")
    assert r.get("verification_status") == "PENDING_DOCTOR_APPROVAL", "Nurse upload should be pending doctor approval"
    assert r.get("saved_to_patient_record") == False, "Nurse upload must NOT be saved to record yet"
    doc_id = r.get("document_id")
    
    # Doctor accepts document
    rev = http_post("/api/documents/review", {
        "document_id": doc_id,
        "action": "ACCEPT",
        "doctor_name": "Dr. Sarah Wilson"
    })
    assert rev.get("verification_status") == "APPROVED", "Doctor review accept failed"
    assert rev.get("saved_to_patient_record") == True, "Accepted document must be saved"
    return f"Nurse Upload (Pending) -> Doctor Accept: Final Status={rev.get('verification_status')}, Saved={rev.get('saved_to_patient_record')}"

# 6. DASHBOARD STATS & NOTIFICATIONS
def test_dashboard_stats():
    s = http_get("/api/dashboard-stats")
    assert "stat_patients" in s and "active_cases" in s, "Stats error"
    return f"Dashboard Telemetry: Active={s.get('active_cases')}, STAT={s.get('stat_patients')}, Cleared={s.get('cleared_today')}"

# RUN SUITE
tests = [
    ("Doctor Authentication", test_doc_login),
    ("Nurse Authentication", test_nurse_login),
    ("Active Patient Queue", test_patient_queue),
    ("Patient Risk & Vitals Detail", test_patient_detail),
    ("RAG Copilot Intent Parsing", test_copilot_missing_info),
    ("RAG Copilot Emergency Escalation", test_copilot_emergency),
    ("Doctor-Nurse Task & Vitals Loop", test_nurse_workflow),
    ("Doctor Document Direct Upload", test_doctor_doc_upload),
    ("Nurse Document Doctor Approval Rule", test_nurse_doc_upload),
    ("Dashboard Operations Telemetry", test_dashboard_stats)
]

passed_count = 0
for name, fn in tests:
    if run_test(name, fn):
        passed_count += 1

print("\n==================================================")
print(f"📊 SAMPLE TEST SUITE SUMMARY: {passed_count}/{len(tests)} TESTS PASSED")
print("==================================================")

if passed_count == len(tests):
    print("🎉 ALL SAMPLE TESTS PASSED PERFECTLY!")
    sys.exit(0)
else:
    print("⚠️ SOME TESTS FAILED")
    sys.exit(1)
