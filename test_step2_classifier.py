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
print("🧪 TESTING STEP 2: AI CLASSIFICATION, VALIDATION & OCR")
print("==================================================")

# Ensure SQLite engine active for test
main.USE_SQLITE = True
main.init_db()

conn = main.get_db_connection()

# 1. Test Medical Document Upload & Classification
print("\n--- 1. Testing Medical Document Classification ---")
res_mri = main.classify_document("brain_mri_scan.pdf", "MRI")
print(f"✓ MRI Classification: {res_mri['classification']} (Category: {res_mri['category']}, Confidence: {res_mri['confidence']})")
assert res_mri["classification"] == "MRI"
assert res_mri["medical_document"] == True

res_cbc = main.classify_document("cbc_blood_report.pdf", "CBC")
print(f"✓ CBC Classification: {res_cbc['classification']} (Category: {res_cbc['category']}, Confidence: {res_cbc['confidence']})")
assert res_cbc["classification"] in ["CBC", "Blood Report", "Lab Report"]
assert res_cbc["medical_document"] == True

# 2. Test Non-Medical Document Detection
print("\n--- 2. Testing Non-Medical Document Safeguards ---")
res_passport = main.classify_document("passport_copy.jpg", "")
print(f"✓ Non-Medical Passport Result: MedDoc={res_passport['medical_document']}, Warning='{res_passport['warning']}'")
assert res_passport["medical_document"] == False
assert "Passport" in res_passport["subtype"]

res_dl = main.classify_document("driving_license_scan.png", "Driving License")
print(f"✓ Non-Medical DL Result: MedDoc={res_dl['medical_document']}, Reason='{res_dl['reason']}'")
assert res_dl["medical_document"] == False

# 3. Test Unknown Document Classification
print("\n--- 3. Testing Unknown Document Fallback ---")
res_unk = main.classify_document("random_file.xyz", "")
print(f"✓ Unknown Classification: {res_unk['classification']} (Confidence: {res_unk['confidence']})")
assert res_unk["classification"] == "UNKNOWN"

# 4. Test Pre-OCR Validation Engine
print("\n--- 4. Testing Pre-OCR Validation Engine ---")
val_normal = main.run_pre_ocr_validation("mri_scan.pdf", b"12345" * 10000)
print(f"✓ Validation Normal: Status={val_normal['validation_status']}, Score={val_normal['validation_score']}, Messages={val_normal['validation_messages']}")
assert val_normal["validation_status"] == "PASSED"

val_pwd = main.run_pre_ocr_validation("protected.pdf", b"%PDF-1.4 /Encrypt 12 0 R ...")
print(f"✓ Validation Password PDF: Score={val_pwd['validation_score']}, Messages={val_pwd['validation_messages']}")
assert any("password-protected" in m for m in val_pwd["validation_messages"])

# 5. Test Smart OCR Extraction
print("\n--- 5. Testing Smart OCR Extraction ---")
ocr_res = main.run_smart_ocr("cbc_report.pdf", "CBC", "Ravi Sharma")
print(f"✓ Smart OCR Extracted: Diagnosis='{ocr_res['diagnosis']}', ICD={ocr_res['icd_codes']}, LOINC={ocr_res['loinc_codes']}")
assert "ICD-10" in ocr_res["icd_codes"][0]
assert "LOINC" in ocr_res["loinc_codes"][0]
assert ocr_res["patient_name"] == "Ravi Sharma"

# 6. Test Duplicate Detection Engine
print("\n--- 6. Testing Duplicate Upload Detection ---")
cursor = conn.cursor()
cursor.execute("DELETE FROM document_verifications WHERE document_name = 'test_cbc_blood.pdf'")
conn.commit()

dup_check1 = main.check_duplicate_upload(conn, 1, "test_cbc_blood.pdf", b"test_content_123")
print(f"✓ First Upload Check: Duplicate={dup_check1['is_duplicate']}, Version={dup_check1['new_version_number']}")
assert dup_check1["is_duplicate"] == False

# Insert record into DB to simulate first upload
cursor = conn.cursor()
now = "2026-08-06 14:20:00"
cursor.execute("""
INSERT INTO document_verifications (
    patient_id, patient_name, document_name, document_type, uploaded_by_role, uploaded_by_name,
    verification_status, created_at, storage_path, duplicate_of, version_number, is_deleted
) VALUES (1, 'Ravi Sharma', 'test_cbc_blood.pdf', 'CBC', 'DOCTOR', 'Dr. Sarah Wilson', 'APPROVED', ?, ?, NULL, 1, 0)
""", (now, f"uploads/patient_1/test_cbc_blood.pdf"))
conn.commit()
orig_doc_id = cursor.lastrowid

dup_check2 = main.check_duplicate_upload(conn, 1, "test_cbc_blood.pdf", b"test_content_123")
print(f"✓ Duplicate Upload Check: Duplicate={dup_check2['is_duplicate']}, OrigID={dup_check2['duplicate_of']}, Version={dup_check2['new_version_number']}")
assert dup_check2["is_duplicate"] == True
assert dup_check2["duplicate_of"] == orig_doc_id
assert dup_check2["new_version_number"] == 2

# 7. Test Phase 7 Inspection APIs
print("\n--- 7. Testing Phase 7 Inspection APIs ---")
cls_api = main.get_document_classification_api(orig_doc_id)
print(f"✓ GET /api/documents/classification/{orig_doc_id}: {cls_api}")
assert cls_api["document_id"] == orig_doc_id

val_api = main.get_document_validation_api(orig_doc_id)
print(f"✓ GET /api/documents/validation/{orig_doc_id}: Status={val_api['validation_status']}")
assert val_api["document_id"] == orig_doc_id

ext_api = main.get_document_extracted_api(orig_doc_id)
print(f"✓ GET /api/documents/extracted/{orig_doc_id}: Patient={ext_api['extracted']['patient_name']}")
assert ext_api["document_id"] == orig_doc_id

status_api = main.get_document_status_api(orig_doc_id)
print(f"✓ GET /api/documents/status/{orig_doc_id}: VerificationStatus={status_api['verification_status']}")
assert status_api["document_id"] == orig_doc_id

conn.close()

print("\n==================================================")
print("🎉 STEP 2 CLASSIFIER & OCR TEST: 100% SUCCESS")
print("==================================================")
