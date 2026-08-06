import urllib.request
import json
import sys
import io

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
BASE_URL = "http://localhost:8000"

def get(path):
    req = urllib.request.Request(f"{BASE_URL}{path}")
    with urllib.request.urlopen(req) as resp:
        return json.loads(resp.read().decode('utf-8'))

def post(path, data):
    body = json.dumps(data).encode('utf-8')
    req = urllib.request.Request(f"{BASE_URL}{path}", data=body, headers={'Content-Type': 'application/json'})
    with urllib.request.urlopen(req) as resp:
        return json.loads(resp.read().decode('utf-8'))

print("==================================================")
print("🧪 TESTING PENDING VERIFICATION WORKFLOW & APIS")
print("==================================================")

# 1. Fetch Stats & Check Consistency
stats = get("/api/dashboard-stats")
print(f"✓ Dashboard Stats: Pending Count = {stats['pending_approval']}")

pending_docs = get("/api/documents/pending")
print(f"✓ Pending Documents API: Fetched {len(pending_docs)} documents")

assert stats['pending_approval'] == len(pending_docs), f"INCONSISTENCY ERROR! Stats count ({stats['pending_approval']}) != Pending list length ({len(pending_docs)})"
print("✅ PASSED: Dashboard count & Document list match 1:1 perfectly!")

if pending_docs:
    doc_id = pending_docs[0]['id']
    doc_detail = get(f"/api/document/{doc_id}")
    print(f"✓ Document #{doc_id} Detail API: {doc_detail.get('document_name')} for {doc_detail.get('patient_name')}")
    
    doc_hist = get(f"/api/document/{doc_id}/history")
    print(f"✓ Document History API: {len(doc_hist.get('timeline', []))} timeline events")

print("\n==================================================")
print("🎉 ALL PENDING VERIFICATION WORKFLOW TESTS PASSED!")
print("==================================================")
