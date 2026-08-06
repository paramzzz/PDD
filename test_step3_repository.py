import sqlite3
import os
import sys
import io
import json

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

backend_dir = r"C:\Users\Param\Downloads\clear-path-app\clear-path-backend\clear-path-backend"
sys.path.insert(0, backend_dir)

import main

print("==================================================")
print("🧪 TESTING STEP 3: PRODUCTION REPOSITORY APIS")
print("==================================================")

main.USE_SQLITE = True
main.init_db()

conn = main.get_db_connection()
cursor = conn.cursor()
now = "2026-08-06 14:30:00"

# Insert sample document for testing
cursor.execute("""
INSERT INTO document_verifications (
    patient_id, patient_name, document_name, document_type, uploaded_by_role, uploaded_by_name,
    verification_status, created_at, document_category, document_subtype, case_id, assigned_doctor,
    assigned_nurse, ocr_status, classification, classification_confidence, medical_document,
    version_number, storage_path, thumbnail_path, is_deleted, extracted_json, validation_json
) VALUES (
    1, 'Ravi Sharma', 'sample_mri_brain.pdf', 'MRI', 'DOCTOR', 'Dr. Sarah Wilson',
    'APPROVED', ?, 'Diagnostic', 'Brain MRI', 'CP-901', 'Dr. Sarah Wilson',
    'Nurse Priya Nair', 'COMPLETED', 'MRI', 0.95, 1,
    1, 'uploads/patient_1/sample_mri_brain.pdf', 'uploads/patient_1/thumb_sample_mri_brain.png', 0,
    '{"diagnosis": "Mild LVH", "icd_codes": ["ICD-10: I51.7"]}', '{"validation_status": "PASSED"}'
)
""", (now,))
conn.commit()
test_doc_id = cursor.lastrowid

# 1. Test Patient Repository API
print("\n--- 1. Testing Patient Document Repository API ---")
repo_res = main.get_patient_documents_repository(1, include_all=True, role="DOCTOR", user_name="Dr. Sarah Wilson")
print(f"✓ Repository Output: Patient={repo_res['patient']['full_name']}, TotalDocs={repo_res['total_documents']}")
assert repo_res["patient"]["id"] == 1
assert repo_res["total_documents"] >= 1
assert any(d["id"] == test_doc_id for d in repo_res["documents"])

# 2. Test Single Document Information API
print("\n--- 2. Testing Single Document Detail API ---")
doc_info = main.get_document_by_id(test_doc_id)
print(f"✓ Document Info: ID={doc_info['id']}, Name='{doc_info['document_name']}', Type='{doc_info['document_type']}'")
assert doc_info["id"] == test_doc_id
assert doc_info["document_name"] == "sample_mri_brain.pdf"

# 3. Test Document Viewer Metadata API
print("\n--- 3. Testing Document Viewer Metadata API ---")
viewer_info = main.get_document_viewer_api(test_doc_id, role="DOCTOR", user_name="Dr. Sarah Wilson")
print(f"✓ Viewer Info: MimeType={viewer_info['mime_type']}, Classification='{viewer_info['classification']}', ExtractedDiagnosis='{viewer_info['ocr_extracted'].get('diagnosis')}'")
assert viewer_info["mime_type"] == "application/pdf"
assert viewer_info["classification"] == "MRI"

# 4. Test Patient Event Timeline API
print("\n--- 4. Testing Patient Chronological Timeline API ---")
timeline_info = main.get_patient_timeline_api(1)
print(f"✓ Patient Timeline: TotalEvents={timeline_info['total_events']}, NewestEvent='{timeline_info['timeline'][0]['title']}'")
assert timeline_info["total_events"] >= 2
assert "timeline" in timeline_info

# 5. Test Multi-Field Paginated Search API
print("\n--- 5. Testing Multi-Field Paginated Search API ---")
search_res = main.search_documents_api(query="mri", classification="MRI", page=1, limit=10)
print(f"✓ Search Result: TotalItems={search_res['total_items']}, ReturnedCount={len(search_res['items'])}")
assert search_res["total_items"] >= 1
assert search_res["items"][0]["classification"] == "MRI"

# 6. Test Archive (Soft Delete) API
print("\n--- 6. Testing Document Archive (Soft Delete) API ---")
arch_res = main.archive_document_endpoint(test_doc_id, user_role="DOCTOR", user_name="Dr. Sarah Wilson")
print(f"✓ Archive Result: IsDeleted={arch_res['is_deleted']}, Message='{arch_res['message']}'")
assert arch_res["is_deleted"] == True

# Verify file is in archived documents list
arch_list = main.get_archived_documents_api()
print(f"✓ Archived List Count: {len(arch_list)}")
assert any(d["id"] == test_doc_id for d in arch_list)

# 7. Test Restore Document API
print("\n--- 7. Testing Restore Document API ---")
rest_res = main.restore_document_endpoint(test_doc_id, user_role="DOCTOR", user_name="Dr. Sarah Wilson")
print(f"✓ Restore Result: IsDeleted={rest_res['is_deleted']}, Message='{rest_res['message']}'")
assert rest_res["is_deleted"] == False

# 8. Test Document Version Tree API
print("\n--- 8. Testing Document Version Control Tree API ---")
ver_tree = main.get_document_versions_api(test_doc_id)
print(f"✓ Version Tree: DocID={ver_tree['document_id']}, CurrentVersion={ver_tree['current_version']}, TotalVersions={ver_tree['total_versions']}")
assert ver_tree["document_id"] == test_doc_id
assert ver_tree["total_versions"] >= 1

# 9. Test Audit Trail Verification
print("\n--- 9. Testing Audit Trail Logs ---")
cursor.execute("SELECT * FROM audit_logs WHERE document_id = ? ORDER BY id DESC", (test_doc_id,))
audit_rows = cursor.fetchall()
print(f"✓ Audit Trail Entries for Doc #{test_doc_id}: {len(audit_rows)}")
assert len(audit_rows) >= 2

conn.close()

print("\n==================================================")
print("🎉 STEP 3 PRODUCTION REPOSITORY TEST: 100% SUCCESS")
print("==================================================")
