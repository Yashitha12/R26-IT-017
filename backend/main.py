from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
import pandas as pd
import joblib
import hashlib
import time
import uuid
import os
import json
import mysql.connector
from mysql.connector import Error
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent

# -------------------------------------------------------------
# DATABASE CONFIGURATION & CONNECTION POOL
# -------------------------------------------------------------
DB_HOST = os.getenv("DB_HOST", "localhost")
DB_USER = os.getenv("DB_USER", "root")
DB_PASSWORD = os.getenv("DB_PASSWORD", "root")
DB_NAME = os.getenv("DB_NAME", "smartgrama")
DB_PORT = int(os.getenv("DB_PORT", "3306"))

DB_CONFIG = {
    "host": DB_HOST,
    "user": DB_USER,
    "password": DB_PASSWORD,
    "database": DB_NAME,
    "port": DB_PORT,
    "charset": "utf8mb4",
    "collation": "utf8mb4_unicode_ci",
    "autocommit": True
}

def get_db_connection():
    return mysql.connector.connect(**DB_CONFIG)

def init_db():
    try:
        # Step 1: Ensure database exists
        server_conn = mysql.connector.connect(
            host=DB_HOST,
            user=DB_USER,
            password=DB_PASSWORD,
            port=DB_PORT,
            charset="utf8mb4"
        )
        server_cursor = server_conn.cursor()
        server_cursor.execute(f"CREATE DATABASE IF NOT EXISTS `{DB_NAME}` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;")
        server_cursor.close()
        server_conn.close()

        # Step 2: Connect to the database and initialize tables
        conn = get_db_connection()
        cursor = conn.cursor()

        # Officers table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS officers (
                id INT AUTO_INCREMENT PRIMARY KEY,
                username VARCHAR(100) UNIQUE NOT NULL,
                name VARCHAR(255) NOT NULL,
                password VARCHAR(255) NOT NULL,
                responsibilities JSON,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            ) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
        """)

        # Loan applications & Blockchain ledger table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS loan_applications (
                id INT AUTO_INCREMENT PRIMARY KEY,
                tx_hash VARCHAR(120) UNIQUE NOT NULL,
                ref_id VARCHAR(50),
                block_number BIGINT,
                timestamp VARCHAR(50),
                did VARCHAR(100),
                membership_id VARCHAR(50),
                applicant_name VARCHAR(255),
                nic VARCHAR(50),
                mobile VARCHAR(50),
                email VARCHAR(100),
                address TEXT,
                loan_type VARCHAR(100),
                requested_amount DOUBLE DEFAULT 0,
                approved_amount DOUBLE DEFAULT 0,
                share_amount DOUBLE DEFAULT 0,
                interest_rate VARCHAR(50),
                duration_months INT DEFAULT 0,
                risk_level VARCHAR(50),
                decision VARCHAR(100),
                reason TEXT,
                job VARCHAR(100),
                main_income DOUBLE DEFAULT 0,
                other_income DOUBLE DEFAULT 0,
                annual_expenses DOUBLE DEFAULT 0,
                saving_acc VARCHAR(100),
                saving_date VARCHAR(50),
                assets TEXT,
                guarantor_acc VARCHAR(100),
                guarantor_name VARCHAR(255),
                guarantor_nic VARCHAR(50),
                guarantor_job VARCHAR(100),
                guarantor_income DOUBLE DEFAULT 0,
                guarantor_expenses DOUBLE DEFAULT 0,
                guarantor_existing_loans VARCHAR(50),
                guarantor_loan_amount DOUBLE DEFAULT 0,
                guarantor_loan_balance DOUBLE DEFAULT 0,
                guarantor_acc_date VARCHAR(50),
                guarantor_acc_balance DOUBLE DEFAULT 0,
                smart_contract VARCHAR(100),
                channel VARCHAR(100),
                consensus_status VARCHAR(150),
                status VARCHAR(50) DEFAULT 'Pending',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            ) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
        """)

        # Welfare assessments table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS welfare_assessments (
                id INT AUTO_INCREMENT PRIMARY KEY,
                assessment_id VARCHAR(100) UNIQUE NOT NULL,
                application_id VARCHAR(100),
                did VARCHAR(100),
                applicant_name VARCHAR(255),
                gn_division VARCHAR(100),
                welfare_score DOUBLE DEFAULT 0,
                tier VARCHAR(100),
                monthly_stipend DOUBLE DEFAULT 0,
                status VARCHAR(100),
                recommended_programs JSON,
                assessed_at VARCHAR(50),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            ) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
        """)

        # KYC records table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS kyc_records (
                id INT AUTO_INCREMENT PRIMARY KEY,
                did VARCHAR(100) UNIQUE NOT NULL,
                verification_id VARCHAR(100),
                name VARCHAR(255),
                submitted_at VARCHAR(50),
                nic_front LONGTEXT,
                nic_back LONGTEXT,
                selfie LONGTEXT,
                status VARCHAR(50) DEFAULT 'Pending',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            ) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
        """)

        # Banks table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS banks (
                id VARCHAR(50) PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            ) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
        """)

        # Loan programs table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS loan_programs (
                id VARCHAR(50) PRIMARY KEY,
                bank_id VARCHAR(50) NOT NULL,
                title VARCHAR(255) NOT NULL,
                subtitle TEXT,
                tag VARCHAR(100),
                tagColor BIGINT,
                apr VARCHAR(50),
                loan_limit VARCHAR(100),
                months VARCHAR(50),
                features JSON,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            ) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
        """)

        # Users table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                member_id VARCHAR(50) UNIQUE,
                user_id VARCHAR(50) UNIQUE,
                did VARCHAR(100) UNIQUE,
                name VARCHAR(255) NOT NULL,
                nic VARCHAR(50) UNIQUE NOT NULL,
                dob VARCHAR(50),
                gender VARCHAR(20),
                mobile VARCHAR(50),
                email VARCHAR(100),
                address TEXT,
                district VARCHAR(100),
                gn_division VARCHAR(100),
                occupation VARCHAR(100),
                username VARCHAR(100) UNIQUE,
                password VARCHAR(255),
                security_question TEXT,
                security_answer TEXT,
                registered_at VARCHAR(50),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            ) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
        """)

        # Step 3: Seed initial demo data if tables are empty
        # Seed Officers
        cursor.execute("SELECT COUNT(*) FROM officers;")
        if cursor.fetchone()[0] == 0:
            cursor.execute("""
                INSERT INTO officers (username, name, password, responsibilities)
                VALUES (%s, %s, %s, %s);
            """, (
                "superadmin",
                "System Administrator",
                "superadmin123",
                json.dumps([
                    "samupakara_loans",
                    "samurdhi_loans",
                    "welfare_checking",
                    "wadihiti_dimana",
                    "kyc_checking",
                    "tickets_review"
                ])
            ))

        # Seed Banks
        cursor.execute("SELECT COUNT(*) FROM banks;")
        if cursor.fetchone()[0] == 0:
            cursor.execute("INSERT INTO banks (id, name) VALUES ('b1', 'Samupakara (Sanasa)');")
            cursor.execute("INSERT INTO banks (id, name) VALUES ('b2', 'Samurdhi Bank');")

        # Seed Loan Programs
        cursor.execute("SELECT COUNT(*) FROM loan_programs;")
        if cursor.fetchone()[0] == 0:
            seed_programs = [
                ("below_25000", "b1", "Below Rs. 25,000 Micro-Loan", "Quick emergency micro-credit with minimal documentation", "8% Low Interest", 4283215696, "8%", "Rs. 5,000 - Rs. 25,000", "24 months", ["No collateral required", "Approval within 24 hours", "Repayment up to 24 months"]),
                ("above_25000", "b1", "Above Rs. 25,000 Development Loan", "Affordable capital financing for local micro-enterprises", "8% Low Interest", 4283215696, "8%", "Rs. 25,000 - Rs. 500,000", "48 months", ["Business plan required", "Group guarantee options"]),
                ("long_term", "b1", "Long Term Investment Loan", "Extended term capital financing for equipment & asset building", "Long Term", 4283215696, "20%", "Rs. 100,000+", "60 months", ["Asset backed security", "Grace period available"]),
                ("epf_loan", "b1", "EPF Backed Secured Loan", "Low rate credit secured against your employee provident fund", "13% APR", 4283215696, "13%", "Up to 75% of EPF balance", "60 months", ["Directly secured by EPF", "Fast processing"]),
                ("lakjaya", "b2", "Lak Jaya Microloan (ලක් ජය)", "Livelihood & cottage industry micro-capital", "Samurdhi Certified", 4283215696, "15%", "Rs. 10,000 - Rs. 100,000", "36 months", ["Designed for low-income entrepreneurs", "Group guarantee acceptance", "No hidden processing fees"]),
                ("lak_wasana", "b2", "Lak Wasana Business Loan (ලක් වාසනා)", "Enterprise expansion capital for established micro-businesses", "High Limit", 4294938624, "16%", "Rs. 50,000 - Rs. 500,000", "48 months", ["Business registration required", "Flexible repayment schedules"]),
                ("liya_sawiya", "b2", "Liya Sawiya Women Loan (ලිය සවිය)", "Special subsidized micro-finance empowering female entrepreneurs", "12% Subsidized", 4280391411, "12%", "Rs. 20,000 - Rs. 200,000", "48 months", ["Female applicants only", "Skill development training included"]),
                ("jiwanopaya", "b2", "Jiwanopaya Livelihood Loan (ජීවනෝපාය)", "Farming, poultry, and home-based craft enhancement loan", "Livelihood Aid", 4283215696, "14%", "Rs. 10,000 - Rs. 50,000", "24 months", ["No collateral", "Quick disbursement"]),
                ("chakrya", "b2", "Chakrya Revolving Loan (චක්රීය ණය)", "Rotating community credit fund with ultra-low interest", "10% Revolving", 4283215696, "10%", "Rs. 5,000 - Rs. 20,000", "12 months", ["Community managed", "Revolving credit line"])
            ]
            for p in seed_programs:
                cursor.execute("""
                    INSERT INTO loan_programs (id, bank_id, title, subtitle, tag, tagColor, apr, loan_limit, months, features)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s);
                """, (p[0], p[1], p[2], p[3], p[4], p[5], p[6], p[7], p[8], json.dumps(p[9])))

        # Seed KYC
        cursor.execute("SELECT COUNT(*) FROM kyc_records;")
        if cursor.fetchone()[0] == 0:
            cursor.execute("""
                INSERT INTO kyc_records (did, name, submitted_at, nic_front, nic_back, selfie, status)
                VALUES 
                ('did:sg:921345678V', 'Kamal Perera', '2026-08-25 10:15:00', 'https://placehold.co/600x400/eeeeee/888888?text=NIC+Front+Scan', 'https://placehold.co/600x400/eeeeee/888888?text=NIC+Back+Scan', 'https://placehold.co/400x400/eeeeee/888888?text=Applicant+Selfie', 'Pending'),
                ('did:sg:881234567V', 'Sunil Silva', '2026-08-26 08:30:00', 'https://placehold.co/600x400/eeeeee/888888?text=NIC+Front+Scan', 'https://placehold.co/600x400/eeeeee/888888?text=NIC+Back+Scan', 'https://placehold.co/400x400/eeeeee/888888?text=Applicant+Selfie', 'Pending');
            """)

        # Seed Loan Applications / Blockchain Ledger
        cursor.execute("SELECT COUNT(*) FROM loan_applications;")
        if cursor.fetchone()[0] == 0:
            cursor.execute("""
                INSERT INTO loan_applications (
                    tx_hash, ref_id, block_number, timestamp, did, applicant_name, loan_type,
                    approved_amount, interest_rate, duration_months, risk_level, decision,
                    smart_contract, channel, consensus_status, status
                ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s);
            """, (
                "0x3f7a8b9c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a",
                "LOAN-20260001",
                1845201,
                "2026-04-10 14:32:00",
                "did:sg:198723456789",
                "Nimal Perera",
                "Agricultural Microloan",
                150000.0,
                "12%",
                48,
                "Low Risk",
                "Approved",
                "0x71C8A33E2B6c0f81A2b1d3A84988f4AcE9812",
                "sg-interbank-financial-channel",
                "Verified & Committed (Hyperledger/DLT Anchor)",
                "Approved"
            ))

        cursor.close()
        conn.close()
        print("[DATABASE] MySQL database & tables initialized successfully.")
    except Exception as e:
        print(f"[DATABASE ERROR] Could not initialize database: {e}")

# Initialize Database on Startup
init_db()

# -------------------------------------------------------------
# FASTAPI APP SETUP
# -------------------------------------------------------------
app = FastAPI(
    title="SmartGrama Unified Microfinance & Welfare Backend",
    description="Decentralized microfinance credit risk evaluation, Aswesuma welfare assessment, and blockchain inter-bank ledger with MySQL persistence.",
    version="2.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:5173",
        "*"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# -------------------------------------------------------------
# 0. OFFICER AUTHENTICATION & ADMIN MANAGEMENT (MySQL)
# -------------------------------------------------------------
class AdminLogin(BaseModel):
    username: str
    password: str

class OfficerRegister(BaseModel):
    username: str
    name: str
    password: str

class UpdatePermissions(BaseModel):
    responsibilities: List[str]

@app.post("/auth/admin-register")
def admin_register(officer: OfficerRegister):
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT id FROM officers WHERE username = %s;", (officer.username,))
        existing = cursor.fetchone()
        if existing:
            cursor.close()
            conn.close()
            raise HTTPException(status_code=400, detail="Username already exists")

        cursor.execute("""
            INSERT INTO officers (username, name, password, responsibilities)
            VALUES (%s, %s, %s, %s);
        """, (officer.username, officer.name, officer.password, json.dumps([])))
        cursor.close()
        conn.close()
        return {"status": "success", "username": officer.username}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

@app.post("/auth/admin-login")
def admin_login(creds: AdminLogin):
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT * FROM officers WHERE username = %s AND password = %s;", (creds.username, creds.password))
        officer = cursor.fetchone()
        cursor.close()
        conn.close()

        if officer:
            responsibilities = officer.get("responsibilities")
            if isinstance(responsibilities, str):
                try:
                    responsibilities = json.loads(responsibilities)
                except Exception:
                    responsibilities = []
            elif not responsibilities:
                responsibilities = []

            return {
                "status": "success",
                "token": f"token-{officer['username']}",
                "officer": {
                    "username": officer["username"],
                    "name": officer["name"],
                    "responsibilities": responsibilities
                }
            }
        raise HTTPException(status_code=401, detail="Invalid admin credentials")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

@app.get("/auth/officers")
def get_officers():
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT username, name, responsibilities FROM officers ORDER BY id ASC;")
        rows = cursor.fetchall()
        cursor.close()
        conn.close()

        result = []
        for r in rows:
            resp = r.get("responsibilities")
            if isinstance(resp, str):
                try:
                    resp = json.loads(resp)
                except Exception:
                    resp = []
            elif not resp:
                resp = []
            result.append({
                "username": r["username"],
                "name": r["name"],
                "responsibilities": resp
            })
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

@app.patch("/auth/officers/{username}/permissions")
def update_officer_permissions(username: str, data: UpdatePermissions):
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute(
            "UPDATE officers SET responsibilities = %s WHERE username = %s;",
            (json.dumps(data.responsibilities), username)
        )
        affected = cursor.rowcount
        cursor.close()
        conn.close()

        if affected == 0:
            raise HTTPException(status_code=404, detail="Officer not found")
        return {"status": "success"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")


# -------------------------------------------------------------
# 0.5 BLOCKCHAIN API STUBS (MySQL Backend Integration)
# -------------------------------------------------------------
class BlockchainPayload(BaseModel):
    type: str
    data: dict

@app.post("/blockchain/store")
def blockchain_store(payload: BlockchainPayload):
    print(f"[BLOCKCHAIN] Storing {payload.type} data onto DLT: {payload.data}")
    return {"status": "success", "tx_hash": f"0x{uuid.uuid4().hex}"}

@app.get("/blockchain/retrieve/{did}")
def blockchain_retrieve(did: str):
    # Fetch identity record from MySQL users table
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT * FROM users WHERE did = %s OR member_id = %s OR nic = %s;", (did, did, did))
        user = cursor.fetchone()
        cursor.close()
        conn.close()

        if user:
            return {
                "status": "success",
                "did": did,
                "data": {
                    "name": user.get("name") or "",
                    "nic": user.get("nic") or "",
                    "dob": user.get("dob") or "",
                    "mobile": user.get("mobile") or "",
                    "address": user.get("address") or "",
                    "district": user.get("district") or "",
                    "occupation": user.get("occupation") or "",
                    "gender": user.get("gender") or ""
                }
            }
    except Exception as e:
        print(f"[BLOCKCHAIN ERROR] Retrieve failed: {e}")

    raise HTTPException(status_code=404, detail="Blockchain record not found")


# -------------------------------------------------------------
# 1. ML CREDIT RISK PREDICTION ENGINE (Preserved 100%)
# -------------------------------------------------------------
model = joblib.load(BASE_DIR / "combined_risk_prediction_model.pkl")
model_columns = joblib.load(BASE_DIR / "combined_model_columns.pkl")

class LoanInput(BaseModel):
    monthly_income: float
    other_income: float = 0.0
    expenses: float
    loan_amount: float
    loan_type: str
    savings_balance: float = 0.0
    existing_loans: float = 0.0
    repayment_history: int = 1
    guarantor_support_count: int = 1

def decision_recommendation(risk_level, monthly_income, expenses, requested_loan_amount):
    disposable_income = monthly_income - expenses
    if disposable_income < 0:
        disposable_income = 0

    suggested_monthly_installment = disposable_income * 0.35

    # Safe loan caps based on affordable installment term limits
    if risk_level == "Low Risk":
        max_loan = suggested_monthly_installment * 36
    elif risk_level == "Medium Risk":
        max_loan = suggested_monthly_installment * 24
    else:  # High Risk
        max_loan = suggested_monthly_installment * 12

    reason = ""

    if disposable_income <= 0:
        final_decision = "Rejected"
        recommended_loan = 0
        reason = "Currently, your expenses exceed or equal your income, making loan repayment unsafe."
    elif risk_level == "High Risk":
        if requested_loan_amount <= max_loan:
            final_decision = "Approved with Strict Caution"
            recommended_loan = requested_loan_amount
            reason = "Approved, but please be cautious with repayments to improve your risk profile."
        else:
            final_decision = "Reduced Amount Approved"
            recommended_loan = max_loan
            reason = "Due to a high risk profile, we cannot approve the full amount. We recommend starting with a smaller, safer micro-loan."
    elif requested_loan_amount <= max_loan:
        final_decision = "Approved" if risk_level == "Low Risk" else "Approved with Caution"
        recommended_loan = requested_loan_amount
        reason = "Your requested amount is safely within your affordable limits."
    else:
        final_decision = "Reduced Amount Approved"
        recommended_loan = max_loan
        reason = "The requested amount exceeds safe borrowing limits. We recommend a lower amount to ensure comfortable monthly repayments."

    repayment_months = (
        recommended_loan / suggested_monthly_installment
        if suggested_monthly_installment > 0
        else 0
    )

    return {
        "predicted_risk_level": risk_level,
        "final_decision": final_decision,
        "reason": reason,
        "requested_loan_amount": round(requested_loan_amount, 2),
        "recommended_loan_amount": round(recommended_loan, 2),
        "suggested_monthly_installment": round(suggested_monthly_installment, 2),
        "estimated_repayment_duration_months": int(round(repayment_months)),
    }

@app.post("/predict-loan")
def predict_loan(data: LoanInput):
    input_data = data.dict()

    total_income = input_data["monthly_income"] + input_data["other_income"]
    disposable_income = total_income - input_data["expenses"]

    input_data["total_income"] = total_income
    input_data["disposable_income"] = disposable_income
    input_data["disposable_income_ratio"] = disposable_income / total_income if total_income > 0 else 0
    input_data["loan_to_income_ratio"] = input_data["loan_amount"] / total_income if total_income > 0 else 999
    input_data["savings_to_income_ratio"] = input_data["savings_balance"] / total_income if total_income > 0 else 0
    input_data["guarantor_requirement_met"] = 1 if input_data["guarantor_support_count"] >= 2 else 0

    df = pd.DataFrame([input_data])
    df = pd.get_dummies(df)
    df = df.reindex(columns=model_columns, fill_value=0)

    risk_level = model.predict(df)[0]

    result = decision_recommendation(
        risk_level=risk_level,
        monthly_income=input_data["monthly_income"],
        expenses=input_data["expenses"],
        requested_loan_amount=input_data["loan_amount"],
    )

    return result


# -------------------------------------------------------------
# 2. ASWESUMA & SAMURDHI WELFARE ELIGIBILITY ENGINE (MySQL)
# -------------------------------------------------------------
class WelfareInput(BaseModel):
    nic: str
    full_name: str
    family_size: int
    dependents_children: int
    elderly_count: int
    disabled_members: int = 0
    monthly_income: float
    monthly_expenses: float
    house_ownership: str = "rented"  # rented, own_temporary, own_permanent
    electricity_units_monthly: float = 45.0
    samurdhi_beneficiary: bool = False
    gn_division: str = "Homagama - Division 542/A"

@app.post("/welfare/assess")
def assess_welfare(data: WelfareInput):
    # Poverty Score Calculation (Proxy Means Test Model)
    score = 0.0

    # Family dependency burden
    dependency_ratio = (data.dependents_children + data.elderly_count + (data.disabled_members * 2)) / max(data.family_size, 1)
    score += min(dependency_ratio * 30.0, 30.0)

    # Income deficit / per capita income
    per_capita_income = data.monthly_income / max(data.family_size, 1)
    if per_capita_income < 10000:
        score += 35.0
    elif per_capita_income < 20000:
        score += 20.0
    elif per_capita_income < 35000:
        score += 10.0

    # Electricity and asset indicators
    if data.electricity_units_monthly < 30:
        score += 15.0
    elif data.electricity_units_monthly < 60:
        score += 8.0

    # Housing condition
    if data.house_ownership == "own_temporary":
        score += 15.0
    elif data.house_ownership == "rented":
        score += 10.0

    # Disabled members priority
    if data.disabled_members > 0:
        score += 10.0

    score = min(round(score, 1), 100.0)

    # Determine Aswesuma / Welfare Category
    if score >= 75:
        tier = "Severely Impoverished (අන්ත දිළිඳු)"
        stipend = 15000.0
        status = "Eligible - Tier 1 Priority"
    elif score >= 55:
        tier = "Poor (දිළිඳු)"
        stipend = 8500.0
        status = "Eligible - Tier 2"
    elif score >= 38:
        tier = "Vulnerable (අවදානමට ලක්වූ)"
        stipend = 4500.0
        status = "Eligible - Tier 3 Transitional"
    elif score >= 25:
        tier = "Transitional (සංක්‍රාන්තික)"
        stipend = 2500.0
        status = "Eligible - Tier 4 Temporary"
    else:
        tier = "Non-Vulnerable / Self-Sufficient"
        stipend = 0.0
        status = "Not Eligible for Direct Cash Aid (Microfinance Recommended)"

    assessment_id = f"WEL-{int(time.time())}"
    did = f"did:sg:{data.nic}"
    assessed_at = time.strftime("%Y-%m-%d %H:%M:%S")
    recommended_programs = [
        "Aswesuma Social Safety Net",
        "Samurdhi Community Livelihood Scheme",
        "Sanasa Micro-Savings Group"
    ] if score >= 38 else ["Samupakara Self-Development Microloan"]

    record = {
        "assessment_id": assessment_id,
        "did": did,
        "applicant_name": data.full_name,
        "gn_division": data.gn_division,
        "welfare_score": score,
        "tier": tier,
        "monthly_stipend": stipend,
        "status": status,
        "recommended_programs": recommended_programs,
        "assessed_at": assessed_at
    }

    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO welfare_assessments (
                assessment_id, application_id, did, applicant_name, gn_division,
                welfare_score, tier, monthly_stipend, status, recommended_programs, assessed_at
            ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            ON DUPLICATE KEY UPDATE
                applicant_name = VALUES(applicant_name),
                welfare_score = VALUES(welfare_score),
                tier = VALUES(tier),
                monthly_stipend = VALUES(monthly_stipend),
                status = VALUES(status),
                recommended_programs = VALUES(recommended_programs),
                assessed_at = VALUES(assessed_at);
        """, (
            assessment_id,
            assessment_id,
            did,
            data.full_name,
            data.gn_division,
            score,
            tier,
            stipend,
            status,
            json.dumps(recommended_programs),
            assessed_at
        ))
        cursor.close()
        conn.close()
    except Exception as e:
        print(f"[DB ERROR] Save welfare assessment: {e}")

    return record

@app.post("/welfare/register-reference")
def register_welfare_reference(data: dict):
    app_id = data.get("applicationId") or data.get("assessment_id") or f"ASW-{int(time.time())}"
    did = data.get("did") or f"did:smartgrama:prototype:001"
    applicant_name = data.get("applicant_name") or data.get("full_name") or "Citizen Applicant"
    gn_division = data.get("gn_division", "Homagama - Division 542/A")
    welfare_score = float(data.get("welfare_score", 56.5))
    tier = data.get("tier") or data.get("category", "POOR")
    monthly_stipend = float(data.get("monthly_stipend") or data.get("monthlyBenefitLkr") or 8500.0)
    status = data.get("status", "Eligible - Pending Review")
    recommended_programs = data.get("recommended_programs", ["Aswesuma Social Safety Net"])
    assessed_at = time.strftime("%Y-%m-%d %H:%M:%S")

    record = {
        "assessment_id": app_id,
        "applicationId": app_id,
        "did": did,
        "applicant_name": applicant_name,
        "gn_division": gn_division,
        "welfare_score": welfare_score,
        "tier": tier,
        "monthly_stipend": monthly_stipend,
        "status": status,
        "recommended_programs": recommended_programs,
        "assessed_at": assessed_at
    }

    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO welfare_assessments (
                assessment_id, application_id, did, applicant_name, gn_division,
                welfare_score, tier, monthly_stipend, status, recommended_programs, assessed_at
            ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            ON DUPLICATE KEY UPDATE
                application_id = VALUES(application_id),
                did = VALUES(did),
                applicant_name = VALUES(applicant_name),
                gn_division = VALUES(gn_division),
                welfare_score = VALUES(welfare_score),
                tier = VALUES(tier),
                monthly_stipend = VALUES(monthly_stipend),
                status = VALUES(status),
                recommended_programs = VALUES(recommended_programs),
                assessed_at = VALUES(assessed_at);
        """, (
            app_id,
            app_id,
            did,
            applicant_name,
            gn_division,
            welfare_score,
            tier,
            monthly_stipend,
            status,
            json.dumps(recommended_programs),
            assessed_at
        ))
        cursor.close()
        conn.close()
    except Exception as e:
        print(f"[DB ERROR] Upsert welfare reference: {e}")

    return {"status": "success", "record": record}

class WelfareReviewDecision(BaseModel):
    action: str  # 'approve' or 'reject'

@app.post("/welfare/{assessment_id}/review")
def review_welfare(assessment_id: str, decision: WelfareReviewDecision):
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("""
            SELECT * FROM welfare_assessments 
            WHERE assessment_id = %s OR application_id = %s;
        """, (assessment_id, assessment_id))
        entry = cursor.fetchone()

        if not entry:
            cursor.close()
            conn.close()
            raise HTTPException(status_code=404, detail="Assessment not found")

        if decision.action == "approve":
            new_status = "Approved for Disbursement (Blockchain Anchored)"
            new_stipend = entry["monthly_stipend"]
        else:
            new_status = "Rejected by Officer"
            new_stipend = 0.0

        cursor.execute("""
            UPDATE welfare_assessments 
            SET status = %s, monthly_stipend = %s 
            WHERE id = %s;
        """, (new_status, new_stipend, entry["id"]))

        entry["status"] = new_status
        entry["monthly_stipend"] = new_stipend
        if isinstance(entry.get("recommended_programs"), str):
            try:
                entry["recommended_programs"] = json.loads(entry["recommended_programs"])
            except Exception:
                entry["recommended_programs"] = []

        cursor.close()
        conn.close()
        return {"status": "success", "receipt": entry}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")


# -------------------------------------------------------------
# 2.5 KYC CHECKING (MySQL Database)
# -------------------------------------------------------------
@app.get("/kyc")
def get_pending_kyc():
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT * FROM kyc_records WHERE status = 'Pending' ORDER BY id ASC;")
        rows = cursor.fetchall()
        cursor.close()
        conn.close()
        return rows
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

class KYCReviewDecision(BaseModel):
    action: str  # 'verify' or 'reject'

@app.post("/kyc/{did}/review")
def review_kyc(did: str, decision: KYCReviewDecision):
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT * FROM kyc_records WHERE did = %s;", (did,))
        entry = cursor.fetchone()

        if not entry:
            cursor.close()
            conn.close()
            raise HTTPException(status_code=404, detail="KYC record not found")

        new_status = "Verified" if decision.action == "verify" else "Rejected"
        cursor.execute("UPDATE kyc_records SET status = %s WHERE did = %s;", (new_status, did))
        entry["status"] = new_status

        cursor.close()
        conn.close()
        return {"status": "success", "receipt": entry}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")


# -------------------------------------------------------------
# 3. BLOCKCHAIN DLT & TAMPER-RESISTANT ANCHORING (MySQL)
# -------------------------------------------------------------
class BlockchainLoanRecord(BaseModel):
    applicant_name: str
    nic: str
    loan_type: str
    loan_amount: float
    recommended_loan_amount: float
    interest_rate: float
    repayment_months: int
    risk_level: str
    decision: str

@app.post("/blockchain/record-loan")
def record_on_blockchain(data: BlockchainLoanRecord):
    did = f"did:sg:{data.nic}"
    timestamp_epoch = int(time.time())
    timestamp_str = time.strftime("%Y-%m-%d %H:%M:%S", time.localtime(timestamp_epoch))

    # Generate cryptographic SHA256 proof hash
    payload = f"{did}:{data.loan_type}:{data.recommended_loan_amount}:{data.decision}:{timestamp_epoch}"
    tx_hash = "0x" + hashlib.sha256(payload.encode()).hexdigest()

    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT COUNT(*) as count FROM loan_applications;")
        total_count = cursor.fetchone()["count"]
        block_number = 1845200 + total_count + 1

        ledger_entry = {
            "tx_hash": tx_hash,
            "block_number": block_number,
            "timestamp": timestamp_str,
            "did": did,
            "applicant_name": data.applicant_name,
            "loan_type": data.loan_type,
            "approved_amount": data.recommended_loan_amount,
            "interest_rate": f"{data.interest_rate}%",
            "duration_months": data.repayment_months,
            "risk_level": data.risk_level,
            "decision": data.decision,
            "smart_contract": "0x71C8A33E2B6c0f81A2b1d3A84988f4AcE9812",
            "channel": "sg-interbank-financial-channel",
            "consensus_status": "Pending Officer Approval",
            "status": "Pending"
        }

        cursor.execute("""
            INSERT INTO loan_applications (
                tx_hash, ref_id, block_number, timestamp, did, applicant_name, nic,
                loan_type, requested_amount, approved_amount, interest_rate, duration_months,
                risk_level, decision, smart_contract, channel, consensus_status, status
            ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s);
        """, (
            tx_hash,
            f"LOAN-{timestamp_epoch}",
            block_number,
            timestamp_str,
            did,
            data.applicant_name,
            data.nic,
            data.loan_type,
            data.loan_amount,
            data.recommended_loan_amount,
            f"{data.interest_rate}%",
            data.repayment_months,
            data.risk_level,
            data.decision,
            ledger_entry["smart_contract"],
            ledger_entry["channel"],
            ledger_entry["consensus_status"],
            ledger_entry["status"]
        ))
        cursor.close()
        conn.close()

        return {
            "status": "success",
            "message": "Loan application recorded and pending officer review.",
            "receipt": ledger_entry
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

class ReviewDecision(BaseModel):
    action: str  # 'approve' or 'reject'

@app.post("/applications/{tx_hash}/review")
def review_application(tx_hash: str, decision: ReviewDecision):
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT * FROM loan_applications WHERE tx_hash = %s;", (tx_hash,))
        entry = cursor.fetchone()

        if not entry:
            cursor.close()
            conn.close()
            raise HTTPException(status_code=404, detail="Transaction not found")

        if decision.action == "approve":
            new_status = "Active"
            new_consensus = "Verified & Committed (Hyperledger/DLT Anchor)"
        else:
            new_status = "Rejected"
            new_consensus = "Rejected by Officer"

        cursor.execute("""
            UPDATE loan_applications 
            SET status = %s, consensus_status = %s 
            WHERE tx_hash = %s;
        """, (new_status, new_consensus, tx_hash))

        entry["status"] = new_status
        entry["consensus_status"] = new_consensus

        cursor.close()
        conn.close()
        return {"status": "success", "receipt": entry}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

@app.get("/blockchain/transactions")
def get_blockchain_transactions():
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT * FROM loan_applications ORDER BY id DESC;")
        rows = cursor.fetchall()
        cursor.close()
        conn.close()

        return {
            "total_transactions": len(rows),
            "ledger": rows
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

@app.get("/applications/all")
def get_all_applications():
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        cursor.execute("SELECT * FROM loan_applications ORDER BY id DESC;")
        loans = cursor.fetchall()

        cursor.execute("SELECT * FROM welfare_assessments ORDER BY id DESC;")
        welfare = cursor.fetchall()

        for w in welfare:
            if isinstance(w.get("recommended_programs"), str):
                try:
                    w["recommended_programs"] = json.loads(w["recommended_programs"])
                except Exception:
                    w["recommended_programs"] = []

        cursor.close()
        conn.close()

        return {
            "loans": loans,
            "welfare": welfare
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")


# -------------------------------------------------------------
# 3.5 DYNAMIC BANKS & LOAN PROGRAMS REGISTRY (MySQL)
# -------------------------------------------------------------
class BankCreate(BaseModel):
    name: str

class LoanProgramCreate(BaseModel):
    bank_id: str
    title: str
    subtitle: str
    tag: str
    tagColor: int
    apr: str
    limit: str
    months: str
    features: List[str]

@app.get("/banks")
def get_banks():
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT id, name FROM banks ORDER BY id ASC;")
        rows = cursor.fetchall()
        cursor.close()
        conn.close()
        return rows
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

@app.post("/banks")
def add_bank(bank: BankCreate):
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT COUNT(*) as count FROM banks;")
        count = cursor.fetchone()["count"]
        new_id = f"b{count + 1}_{int(time.time()) % 10000}"

        cursor.execute("INSERT INTO banks (id, name) VALUES (%s, %s);", (new_id, bank.name))
        cursor.close()
        conn.close()
        return {"id": new_id, "name": bank.name}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

@app.delete("/banks/{bank_id}")
def delete_bank(bank_id: str):
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("DELETE FROM loan_programs WHERE bank_id = %s;", (bank_id,))
        cursor.execute("DELETE FROM banks WHERE id = %s;", (bank_id,))
        cursor.close()
        conn.close()
        return {"status": "success"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

@app.get("/loan-programs")
def get_loan_programs():
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT * FROM loan_programs ORDER BY id ASC;")
        rows = cursor.fetchall()
        cursor.close()
        conn.close()

        result = []
        for p in rows:
            feat = p.get("features")
            if isinstance(feat, str):
                try:
                    feat = json.loads(feat)
                except Exception:
                    feat = []
            elif not feat:
                feat = []

            result.append({
                "id": p["id"],
                "bank_id": p["bank_id"],
                "title": p["title"],
                "subtitle": p.get("subtitle") or "",
                "tag": p.get("tag") or "",
                "tagColor": p.get("tagColor") or 4283215696,
                "apr": p.get("apr") or "",
                "limit": p.get("loan_limit") or p.get("limit") or "",
                "loan_limit": p.get("loan_limit") or p.get("limit") or "",
                "months": p.get("months") or "",
                "features": feat
            })
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

@app.post("/loan-programs")
def add_loan_program(program: LoanProgramCreate):
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT COUNT(*) as count FROM loan_programs;")
        count = cursor.fetchone()["count"]
        new_id = f"lp{count + 1}_{int(time.time()) % 10000}"

        cursor.execute("""
            INSERT INTO loan_programs (id, bank_id, title, subtitle, tag, tagColor, apr, loan_limit, months, features)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s);
        """, (
            new_id,
            program.bank_id,
            program.title,
            program.subtitle,
            program.tag,
            program.tagColor,
            program.apr,
            program.limit,
            program.months,
            json.dumps(program.features)
        ))
        cursor.close()
        conn.close()

        res = program.dict()
        res["id"] = new_id
        res["loan_limit"] = program.limit
        return res
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

@app.delete("/loan-programs/{program_id}")
def delete_loan_program(program_id: str):
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("DELETE FROM loan_programs WHERE id = %s;", (program_id,))
        cursor.close()
        conn.close()
        return {"status": "success"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")


# -------------------------------------------------------------
# 4. MULTILINGUAL CONVERSATIONAL AI & RAG ASSISTANT
# -------------------------------------------------------------
class ChatMessage(BaseModel):
    message: str
    language: str = "en"  # en, si, ta
    user_context: Optional[dict] = None

@app.post("/assistant/chat")
def assistant_chat(data: ChatMessage):
    q = data.message.lower()
    lang = data.language

    # Multilingual response generator for Microfinance, Loans & Welfare
    if "aswesuma" in q or "අස්වැසුම" in q or "welfare" in q or "relief" in q or "සුභසාධන" in q:
        if lang == "si":
            reply = "අස්වැසුම (Aswesuma) සුභසාධන ප්‍රතිලාභය සඳහා පවුලේ සාමාජික සංඛ්‍යාව, යැපෙන්නන්, ආබාධිත පුද්ගලයින් සහ මාසික ආදායම මත ලකුණු ගණනය කෙරේ. ඔබට අපගේ 'Apply Welfare' ටැබ් එක හරහා අයදුම් කර ඔබේ සුදුසුකම් මට්ටම පරීක්ෂා කරගත හැක."
        elif lang == "ta":
            reply = "அஸ்வெசும (Aswesuma) நலத்திட்டத்திற்கு உங்கள் குடும்ப அளவு, வருமானம் மற்றும் சார்புள்ளவர்களின் அடிப்படையில் புள்ளிகள் கணக்கிடப்படுகின்றன. 'Apply Welfare' பக்கத்தில் விண்ணப்பிக்கலாம்."
        else:
            reply = "Aswesuma Welfare Program evaluates household poverty score based on family dependency, per capita income, and vulnerability index. You can apply directly through the 'Apply Welfare' section to check your eligible stipend tier."
    elif "interest" in q or "rate" in q or "පොලී" in q or "samupakara" in q or "සමුපකාර" in q:
        if lang == "si":
            reply = "සමුපකාර (Samupakara) ණය පොලී අනුපාත: රු. 25,000 ට අඩු ක්ෂුද්‍ර ණය 8% APR, රු. 25,000 ට වැඩි ණය 8% APR, දිගුකාලීන ණය 20% APR සහ EPF ඇපකර ණය 13% APR වේ."
        else:
            reply = "Samupakara (Cooperative Rural Bank) rates: Below Rs. 25,000 at 8% APR, Above Rs. 25,000 at 8% APR, Long Term Loans at 20% APR, and EPF-backed loans at 13% APR."
    elif "samurdhi" in q or "සමෘද්ධි" in q or "lak jaya" in q or "liya sawiya" in q:
        if lang == "si":
            reply = "සමෘද්ධි බැංකු සමිති මඟින් ලක් ජය (15%), ලක් වාසනා (16%), ලිය සවිය කාන්තා ණය (12%), ජීවනෝපාය සංවර්ධන ණය (14%), සහ චක්‍රීය ණය (10%) ලබාදේ."
        else:
            reply = "Samurdhi Banking Society offers: Lak Jaya (15% APR, Rs. 10k-100k), Lak Wasana (16% APR, Rs. 100k-1M), Liya Sawiya for women entrepreneurs (12% APR), Jiwanopaya livelihood (14% APR), and Chakrya revolving loans (10% APR)."
    elif "blockchain" in q or "did" in q or "secure" in q or "බ්ලොක්චේන්" in q:
        if lang == "si":
            reply = "SmartGrama පද්ධතිය ඔබගේ ජාතික හැඳුනුම්පත (NIC) මඟින් Decentralized ID (DID) එකක් සාදා ගන්නා අතර, අනුමත වන සෑම ණයක්ම වෙනස් කළ නොහැකි Blockchain Ledger එකක ආරක්ෂිතව සටහන් කරයි."
        else:
            reply = "SmartGrama links your profile to a Decentralized Identifier (DID: did:sg:nic). Every approved loan is cryptographically anchored onto a permissioned blockchain ledger, ensuring tamper-proof verification across financial institutions."
    else:
        if lang == "si":
            reply = "ආයුබෝවන්! SmartGrama සහායක වෙත සාදරයෙන් පිළිගනිමු. මට ඔබට සමුපකාර සහ සමෘද්ධි ණය අයදුම්පත්, අස්වැසුම සුභසාධන ප්‍රතිලාභ, සහ ඩිජිටල් මුදල් පසුම්බිය පිළිබඳ ඕනෑම තොරතුරක් ලබාදිය හැක."
        elif lang == "ta":
            reply = "வணக்கம்! SmartGrama உதவி மையத்திற்கு வரவேற்கிறோம். நுண்கடன், அஸ்வெசும உதவித்தொகை மற்றும் டிஜிட்டல் அடையாளம் பற்றிய தகவல்களை நான் வழங்க முடியும்."
        else:
            reply = "Hello! I am your SmartGrama AI Assistant. I can assist you with Samupakara & Samurdhi microloans, Aswesuma welfare scoring, EMI estimation, and blockchain verification. How can I help you today?"

    return {
        "reply": reply,
        "language": lang,
        "timestamp": time.strftime("%H:%M")
    }
