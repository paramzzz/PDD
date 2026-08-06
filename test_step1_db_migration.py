import sqlite3
import os
import sys
import io

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

backend_dir = r"C:\Users\Param\Downloads\clear-path-app\clear-path-backend\clear-path-backend"
sys.path.insert(0, backend_dir)

import main

print("==================================================")
print("🧪 TESTING STEP 1: DB MIGRATION & FOUNDATION")
print("==================================================")

# 1. Trigger init_db()
main.USE_SQLITE = True
main.init_db()
print(f"✓ Executed main.init_db() successfully (DB Path: {main.SQLITE_DB_PATH})")

conn = sqlite3.connect(main.SQLITE_DB_PATH)
cursor = conn.cursor()

# 2. Inspect document_verifications table columns
cursor.execute("PRAGMA table_info(document_verifications)")
cols = {row[1]: row[2] for row in cursor.fetchall()}
print(f"✓ Total columns in document_verifications: {len(cols)}")
print(f"✓ Columns: {list(cols.keys())}")

required_new_cols = [
    "document_category", "document_subtype", "case_id", "assigned_doctor",
    "assigned_nurse", "ocr_status", "classification", "classification_confidence",
    "medical_document", "duplicate_of", "version_number", "storage_path",
    "thumbnail_path", "updated_at", "approved_at", "is_deleted",
    "extracted_json", "validation_json"
]

for c in required_new_cols:
    assert c in cols, f"MISSING COLUMN: {c}"
print(f"✅ PASSED: All 18 new MDMS columns verified in document_verifications table!")

# 3. Inspect audit_logs table columns
cursor.execute("PRAGMA table_info(audit_logs)")
audit_cols = [row[1] for row in cursor.fetchall()]
assert "document_id" in audit_cols, "MISSING COLUMN in audit_logs: document_id"
print(f"✅ PASSED: document_id verified in audit_logs table!")

# 4. Check indexes
cursor.execute("PRAGMA index_list(document_verifications)")
indices = [row[1] for row in cursor.fetchall()]
print(f"✓ Indexes on document_verifications: {indices}")
assert any("idx_doc_verif_patient" in idx for idx in indices), "Missing index idx_doc_verif_patient"
assert any("idx_doc_verif_deleted" in idx for idx in indices), "Missing index idx_doc_verif_deleted"
print(f"✅ PASSED: Database indexes created successfully!")

# 5. Verify existing data is preserved
cursor.execute("SELECT COUNT(*) FROM patients")
p_count = cursor.fetchone()[0]
print(f"✓ Patients record count: {p_count}")
assert p_count >= 4, f"Patient records corrupted or lost! Found: {p_count}"

cursor.execute("SELECT COUNT(*) FROM document_verifications")
d_count = cursor.fetchone()[0]
print(f"✓ Document verifications record count: {d_count}")

# 6. Verify log_audit_event helper
main.log_audit_event(1, "Dr. Sarah Wilson", "DOCTOR", "STEP1_MIGRATION_VERIFIED", "Schema migration test completed cleanly", 1)
cursor.execute("SELECT * FROM audit_logs WHERE action='STEP1_MIGRATION_VERIFIED'")
audit_row = cursor.fetchone()
assert audit_row is not None, "Failed to record audit event!"
print(f"✅ PASSED: Audit logger operational (Audit ID #{audit_row[0]})!")

conn.close()
print("\n==================================================")
print("🎉 STEP 1 MIGRATION TEST: 100% SUCCESS")
print("==================================================")
