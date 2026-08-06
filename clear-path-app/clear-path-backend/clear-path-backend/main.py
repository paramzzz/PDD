import os
from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import pymysql
from typing import List, Optional
from dotenv import load_dotenv

load_dotenv()

app = FastAPI()

# Enable CORS for production
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Database configuration using environment variables
DB_HOST = os.getenv("DB_HOST", "localhost")
DB_USER = os.getenv("DB_USER", "root")
DB_PASSWORD = os.getenv("DB_PASSWORD", "root")
DB_NAME = os.getenv("DB_NAME", "clearpath_ai")

def get_db_connection():
    return pymysql.connect(
        host=DB_HOST,
        user=DB_USER,
        password=DB_PASSWORD,
        database=DB_NAME,
        autocommit=True
    )

db = get_db_connection()


class SignupModel(BaseModel):
    name: str
    email: str
    phone: str
    clinic_name: str
    doctor_license_id: str
    password: str


class LoginModel(BaseModel):
    email: str
    password: str

class PatientResponse(BaseModel):
    id: int
    full_name: str
    age: str
    gender: str
    chief_complaint: str
    initial_risk: str
    bp: str
    hr: str
    temperature: str
    spo2: str
    time_elapsed: str
    insurance_provider: Optional[str] = ""
    policy_number: Optional[str] = ""
    insurance_status: Optional[str] = ""
    finance_status: Optional[str] = ""
    clinical_status: Optional[str] = ""
    pre_op_status: Optional[str] = ""
    approval_status: Optional[str] = ""
    co_pay: Optional[int] = 0
    coverage_percent: Optional[int] = 0
    unpaid_dues: Optional[int] = 0
    coverage_details: Optional[str] = ""

class NewPatientRequest(BaseModel):
    full_name: str
    age: str
    gender: str
    chief_complaint: str
    initial_risk: Optional[str] = "Low"  # Fallback if field is left empty
    bp: Optional[str] = ""
    hr: Optional[str] = ""
    temperature: Optional[str] = ""
    spo2: Optional[str] = ""
    insurance_provider: Optional[str] = ""
    policy_number: Optional[str] = ""




@app.post("/signup")
def signup(data: SignupModel):

    cursor = db.cursor()

    sql = """
    INSERT INTO doctors
    (name,email,phone,clinic_name,
    doctor_license_id,password)
    VALUES (%s,%s,%s,%s,%s,%s)
    """

    values = (
        data.name,
        data.email,
        data.phone,
        data.clinic_name,
        data.doctor_license_id,
        data.password
    )

    cursor.execute(sql, values)
    db.commit()

    return {
        "success": True,
        "message": "Registration Successful"
    }


@app.post("/login")
def login(data: LoginModel):

    cursor = db.cursor()

    sql = """
    SELECT id,name FROM doctors
    WHERE email=%s AND password=%s
    """

    cursor.execute(sql, (
        data.email,
        data.password
    ))

    user = cursor.fetchone()

    if user:

        return {
            "success": True,
            "message": "Login Successful",
            "user_id": user[0],
            "fullname":user[1].strip()
        }

    return {
        "success": False,
        "message": "Invalid Credentials"
    }

@app.get("/patients", response_model=List[PatientResponse])
def get_patient_details():
    """
    Fetches patient card items from your MySQL database.
    Maps results directly to keys read by Retrofit on Android.
    """
    try:
        # Refresh connection if it timed out or dropped dropped out silently
        db.ping(reconnect=True)
        
        cursor = db.cursor(pymysql.cursors.DictCursor) # Using DictCursor to read columns by name easily
        
        sql = """
        SELECT id, full_name, age, gender, chief_complaint, 
               initial_risk, bp, hr, temperature, spo2,
               insurance_provider, policy_number, insurance_status,
               finance_status, clinical_status, pre_op_status, approval_status
        FROM patients
        """
        cursor.execute(sql)
        patient_records = cursor.fetchall()
        
        response_data = []
        for row in patient_records:
            risk = row["initial_risk"].upper() if row["initial_risk"] else "LOW"
            co_pay = 18000 if "STAT" in risk else 5000
            cov_pct = 85 if "STAT" in risk else 90
            unpaid = 0
            cov_det = "Cashless eligible. Pre-auth request sent." if "STAT" in risk else "Pre-auth approved. Standard copay."

            response_data.append({
                "id": row["id"],
                "full_name": row["full_name"] if row["full_name"] else "",
                "age": row["age"] if row["age"] else "",
                "gender": row["gender"] if row["gender"] else "",
                "chief_complaint": row["chief_complaint"] if row["chief_complaint"] else "",
                "initial_risk": row["initial_risk"] if row["initial_risk"] else "Low",
                "bp": row["bp"] if row["bp"] else "N/A",
                "hr": row["hr"] if row["hr"] else "N/A",
                "temperature": row["temperature"] if row["temperature"] else "N/A",
                "spo2": row["spo2"] if row["spo2"] else "N/A",
                "time_elapsed": "5m ago", # Placeholder string for UI. You can later compute this via tracking columns.
                "insurance_provider": row["insurance_provider"] if row["insurance_provider"] else "None",
                "policy_number": row["policy_number"] if row["policy_number"] else "None",
                "insurance_status": row["insurance_status"] if row["insurance_status"] else "Checking...",
                "finance_status": row["finance_status"] if row["finance_status"] else "Cleared",
                "clinical_status": row["clinical_status"] if row["clinical_status"] else "Checking...",
                "pre_op_status": row["pre_op_status"] if row["pre_op_status"] else "Pending",
                "approval_status": row["approval_status"] if row["approval_status"] else "Pending",
                "co_pay": co_pay,
                "coverage_percent": cov_pct,
                "unpaid_dues": unpaid,
                "coverage_details": cov_det
            })
            
        return response_data

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Database query operation failed: {str(e)}"
        )

@app.get("/api/patient-detail", response_model=PatientResponse)
def get_single_patient_detail(id: int):
    """
    Fetches details for a single target patient record based on ID.
    """
    try:
        db.ping(reconnect=True)
        cursor = db.cursor(pymysql.cursors.DictCursor)
        
        sql = """
        SELECT id, full_name, age, gender, chief_complaint, 
               initial_risk, bp, hr, temperature, spo2,
               insurance_provider, policy_number, insurance_status,
               finance_status, clinical_status, pre_op_status, approval_status
        FROM patients WHERE id = %s
        """
        cursor.execute(sql, (id,))
        row = cursor.fetchone()
        
        if not row:
            raise HTTPException(status_code=404, detail="Patient file tracking key match failed.")
            
        risk = row["initial_risk"].upper() if row["initial_risk"] else "LOW"
        co_pay = 18000 if "STAT" in risk else 5000
        cov_pct = 85 if "STAT" in risk else 90
        unpaid = 0
        cov_det = "Cashless eligible. Pre-auth request sent." if "STAT" in risk else "Pre-auth approved. Standard copay."

        return {
            "id": row["id"],
            "full_name": row["full_name"] if row["full_name"] else "Unknown",
            "age": row["age"] if row["age"] else "",
            "gender": row["gender"] if row["gender"] else "",
            "chief_complaint": row["chief_complaint"] if row["chief_complaint"] else "",
            "initial_risk": row["initial_risk"] if row["initial_risk"] else "Low",
            "bp": row["bp"] if row["bp"] else "N/A",
            "hr": row["hr"] if row["hr"] else "N/A",
            "temperature": row["temperature"] if row["temperature"] else "N/A",
            "spo2": row["spo2"] if row["spo2"] else "N/A",
            "time_elapsed": "8m ago",
            "insurance_provider": row["insurance_provider"] if row["insurance_provider"] else "None",
            "policy_number": row["policy_number"] if row["policy_number"] else "None",
            "insurance_status": row["insurance_status"] if row["insurance_status"] else "Checking...",
            "finance_status": row["finance_status"] if row["finance_status"] else "Cleared",
            "clinical_status": row["clinical_status"] if row["clinical_status"] else "Checking...",
            "pre_op_status": row["pre_op_status"] if row["pre_op_status"] else "Pending",
            "approval_status": row["approval_status"] if row["approval_status"] else "Pending",
            "co_pay": co_pay,
            "coverage_percent": cov_pct,
            "unpaid_dues": unpaid,
            "coverage_details": cov_det
        }
    except Exception as e:
        if isinstance(e, HTTPException): raise e
        raise HTTPException(status_code=500, detail=str(e))
    
@app.post("/api/patients/run-clearance", response_model=PatientResponse)
def run_patient_clearance(id: int):
    try:
        db.ping(reconnect=True)
        cursor = db.cursor()
        sql = """
        UPDATE patients 
        SET insurance_status = 'Cleared', finance_status = 'Cleared', clinical_status = 'Cleared' 
        WHERE id = %s
        """
        cursor.execute(sql, (id,))
        db.commit()
        
        # Now fetch and return the updated patient details
        cursor = db.cursor(pymysql.cursors.DictCursor)
        sql_fetch = """
        SELECT id, full_name, age, gender, chief_complaint, 
               initial_risk, bp, hr, temperature, spo2,
               insurance_provider, policy_number, insurance_status,
               finance_status, clinical_status, pre_op_status, approval_status
        FROM patients WHERE id = %s
        """
        cursor.execute(sql_fetch, (id,))
        row = cursor.fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Patient not found.")
            
        risk = row["initial_risk"].upper() if row["initial_risk"] else "LOW"
        co_pay = 18000 if "STAT" in risk else 5000
        cov_pct = 85 if "STAT" in risk else 90
        unpaid = 0
        cov_det = "Cashless eligible. Pre-auth request sent." if "STAT" in risk else "Pre-auth approved. Standard copay."

        return {
            "id": row["id"],
            "full_name": row["full_name"] if row["full_name"] else "Unknown",
            "age": row["age"] if row["age"] else "",
            "gender": row["gender"] if row["gender"] else "",
            "chief_complaint": row["chief_complaint"] if row["chief_complaint"] else "",
            "initial_risk": row["initial_risk"] if row["initial_risk"] else "Low",
            "bp": row["bp"] if row["bp"] else "N/A",
            "hr": row["hr"] if row["hr"] else "N/A",
            "temperature": row["temperature"] if row["temperature"] else "N/A",
            "spo2": row["spo2"] if row["spo2"] else "N/A",
            "time_elapsed": "8m ago",
            "insurance_provider": row["insurance_provider"] if row["insurance_provider"] else "None",
            "policy_number": row["policy_number"] if row["policy_number"] else "None",
            "insurance_status": row["insurance_status"] if row["insurance_status"] else "Checking...",
            "finance_status": row["finance_status"] if row["finance_status"] else "Cleared",
            "clinical_status": row["clinical_status"] if row["clinical_status"] else "Checking...",
            "pre_op_status": row["pre_op_status"] if row["pre_op_status"] else "Pending",
            "approval_status": row["approval_status"] if row["approval_status"] else "Pending",
            "co_pay": co_pay,
            "coverage_percent": cov_pct,
            "unpaid_dues": unpaid,
            "coverage_details": cov_det
        }
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/patients/update-status", response_model=PatientResponse)
def update_patient_status(id: int, pre_op_status: Optional[str] = None, approval_status: Optional[str] = None):
    try:
        db.ping(reconnect=True)
        cursor = db.cursor()
        
        updates = []
        params = []
        if pre_op_status is not None:
            updates.append("pre_op_status = %s")
            params.append(pre_op_status)
        if approval_status is not None:
            updates.append("approval_status = %s")
            params.append(approval_status)
            
        if updates:
            sql = f"UPDATE patients SET {', '.join(updates)} WHERE id = %s"
            params.append(id)
            cursor.execute(sql, tuple(params))
            db.commit()
            
        # Fetch updated details
        cursor = db.cursor(pymysql.cursors.DictCursor)
        sql_fetch = """
        SELECT id, full_name, age, gender, chief_complaint, 
               initial_risk, bp, hr, temperature, spo2,
               insurance_provider, policy_number, insurance_status,
               finance_status, clinical_status, pre_op_status, approval_status
        FROM patients WHERE id = %s
        """
        cursor.execute(sql_fetch, (id,))
        row = cursor.fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Patient not found.")
            
        risk = row["initial_risk"].upper() if row["initial_risk"] else "LOW"
        co_pay = 18000 if "STAT" in risk else 5000
        cov_pct = 85 if "STAT" in risk else 90
        unpaid = 0
        cov_det = "Cashless eligible. Pre-auth request sent." if "STAT" in risk else "Pre-auth approved. Standard copay."

        return {
            "id": row["id"],
            "full_name": row["full_name"] if row["full_name"] else "Unknown",
            "age": row["age"] if row["age"] else "",
            "gender": row["gender"] if row["gender"] else "",
            "chief_complaint": row["chief_complaint"] if row["chief_complaint"] else "",
            "initial_risk": row["initial_risk"] if row["initial_risk"] else "Low",
            "bp": row["bp"] if row["bp"] else "N/A",
            "hr": row["hr"] if row["hr"] else "N/A",
            "temperature": row["temperature"] if row["temperature"] else "N/A",
            "spo2": row["spo2"] if row["spo2"] else "N/A",
            "time_elapsed": "8m ago",
            "insurance_provider": row["insurance_provider"] if row["insurance_provider"] else "None",
            "policy_number": row["policy_number"] if row["policy_number"] else "None",
            "insurance_status": row["insurance_status"] if row["insurance_status"] else "Checking...",
            "finance_status": row["finance_status"] if row["finance_status"] else "Cleared",
            "clinical_status": row["clinical_status"] if row["clinical_status"] else "Checking...",
            "pre_op_status": row["pre_op_status"] if row["pre_op_status"] else "Pending",
            "approval_status": row["approval_status"] if row["approval_status"] else "Pending",
            "co_pay": co_pay,
            "coverage_percent": cov_pct,
            "unpaid_dues": unpaid,
            "coverage_details": cov_det
        }
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    
class NewPatientSubmitResponse(BaseModel):
    success: bool
    message: str


# --- NEW PATIENT SUBMISSION ENDPOINT ---
@app.post("/new_patient", response_model=NewPatientSubmitResponse)
def add_new_patient(data: NewPatientRequest):
    """
    Inserts a newly registered patient file into the MySQL database engine.
    """
    try:
        # Re-establish a database connection link if dropped out silently
        db.ping(reconnect=True)
        cursor = db.cursor()

        sql = """
        INSERT INTO patients (
            full_name, age, gender, chief_complaint, initial_risk,
            bp, hr, temperature, spo2, insurance_provider, policy_number
        ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """

        values = (
            data.full_name,
            data.age,
            data.gender,
            data.chief_complaint,
            data.initial_risk if data.initial_risk else "Low",
            data.bp if data.bp else "N/A",
            data.hr if data.hr else "N/A",
            data.temperature if data.temperature else "N/A",
            data.spo2 if data.spo2 else "N/A",
            data.insurance_provider if data.insurance_provider else "None",
            data.policy_number if data.policy_number else "None"
        )

        cursor.execute(sql, values)
        db.commit()

        return {
            "success": True,
            "message": "Patient Registered & Workflow Launched"
        }

    except Exception as e:
        db.rollback()  # Rollback transaction safety state metrics on failure
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Database persistent storage sequence write failed: {str(e)}"
        )

@app.get("/api/dashboard-stats")
def get_dashboard_stats():
    """
    Calculates summary aggregate statistics for the primary dashboard grid.
    """
    try:
        db.ping(reconnect=True)
        cursor = db.cursor(pymysql.cursors.DictCursor)
        
        # 1. Tally STAT patients directly
        cursor.execute("SELECT COUNT(*) as count FROM patients WHERE LOWER(initial_risk) = 'stat'")
        stat_count = cursor.fetchone()["count"]
        
        # 2. Total active case metrics
        cursor.execute("SELECT COUNT(*) as count FROM patients")
        active_count = cursor.fetchone()["count"]
        
        # Mocking production clearance metrics until workflow status engine integration is complete
        pending_approval = 3
        cleared_today = 1
        
        return {
            "stat_patients": stat_count,
            "pending_approval": pending_approval,
            "cleared_today": cleared_today,
            "active_cases": active_count
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))