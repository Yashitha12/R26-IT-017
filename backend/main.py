from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Optional, List
import pandas as pd
import joblib
import hashlib
import time
import uuid

app = FastAPI(
    title="SmartGrama Unified Microfinance & Welfare Backend",
    description="Decentralized microfinance credit risk evaluation, Aswesuma welfare assessment, and blockchain inter-bank ledger.",
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

from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent

# -------------------------------------------------------------
# 0. OFFICER AUTHENTICATION & ADMIN MANAGEMENT
# -------------------------------------------------------------
class AdminLogin(BaseModel):
    username: str
    password: str

officers_db = [
    {
        "username": "superadmin",
        "name": "System Administrator",
        "password": "superadmin123",
        "responsibilities": [
            "samupakara_loans",
            "samurdhi_loans",
            "welfare_checking",
            "wadihiti_dimana",
            "kyc_checking",
            "tickets_review"
        ]
    }
]

class OfficerRegister(BaseModel):
    username: str
    name: str
    password: str

@app.post("/auth/admin-register")
def admin_register(officer: OfficerRegister):
    for o in officers_db:
        if o["username"] == officer.username:
            raise HTTPException(status_code=400, detail="Username already exists")
    
    new_officer = {
        "username": officer.username,
        "name": officer.name,
        "password": officer.password,
        "responsibilities": [
            "samupakara_loans",
            "samurdhi_loans",
            "welfare_checking",
            "wadihiti_dimana",
            "kyc_checking",
            "tickets_review"
        ]
    }
    officers_db.append(new_officer)
    return {"status": "success", "username": new_officer["username"]}

@app.post("/auth/admin-login")
def admin_login(creds: AdminLogin):
    for o in officers_db:
        if o["username"] == creds.username and o["password"] == creds.password:
            return {
                "status": "success", 
                "token": f"token-{o['username']}",
                "officer": {
                    "username": o["username"],
                    "name": o["name"],
                    "responsibilities": o["responsibilities"]
                }
            }
    raise HTTPException(status_code=401, detail="Invalid admin credentials")

@app.get("/auth/officers")
def get_officers():
    return [{"username": o["username"], "name": o["name"], "responsibilities": o["responsibilities"]} for o in officers_db]

class UpdatePermissions(BaseModel):
    responsibilities: List[str]

@app.patch("/auth/officers/{username}/permissions")
def update_officer_permissions(username: str, data: UpdatePermissions):
    for o in officers_db:
        if o["username"] == username:
            o["responsibilities"] = data.responsibilities
            return {"status": "success"}
    raise HTTPException(status_code=404, detail="Officer not found")


# -------------------------------------------------------------
# 0.5 BLOCKCHAIN API STUBS (For future integration)
# -------------------------------------------------------------
class BlockchainPayload(BaseModel):
    type: str
    data: dict

@app.post("/blockchain/store")
def blockchain_store(payload: BlockchainPayload):
    # This is a stub where the external smart contract logic will go
    print(f"[BLOCKCHAIN] Storing {payload.type} data onto DLT: {payload.data}")
    return {"status": "success", "tx_hash": f"0x{uuid.uuid4().hex}"}

@app.get("/blockchain/retrieve/{did}")
def blockchain_retrieve(did: str):
    # This is a stub to fetch on-chain identity/records
    # We search the in-memory users_db to simulate a smart contract lookup
    for user in users_db:
        if user["memberId"] == did:
            return {
                "status": "success", 
                "did": did, 
                "data": {
                    "name": user["name"],
                    "nic": user["nic"],
                    "dob": user["dob"],
                    "mobile": user["mobile"],
                    "address": user.get("address", ""),
                    "district": user.get("district", ""),
                    "occupation": user.get("occupation", ""),
                    "gender": user.get("gender", "")
                }
            }
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
# 2. ASWESUMA & SAMURDHI WELFARE ELIGIBILITY ENGINE
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
    language: Optional[str] = "en"


@app.post("/welfare/assess")
def assess_welfare(data: WelfareInput):
    # Poverty Score Calculation (Proxy Means Test Model)
    # Range 0 - 100 (Higher score = greater vulnerability / higher welfare priority)
    score = 0.0

    # Family dependency burden
    dependency_ratio = (data.dependents_children + data.elderly_count + (data.disabled_members * 2)) / max(data.family_size, 1)
    dep_score = min(dependency_ratio * 30.0, 30.0)
    score += dep_score

    # Income deficit / per capita income
    per_capita_income = data.monthly_income / max(data.family_size, 1)
    inc_score = 0.0
    if per_capita_income < 10000:
        inc_score = 35.0
    elif per_capita_income < 20000:
        inc_score = 20.0
    elif per_capita_income < 35000:
        inc_score = 10.0
    score += inc_score

    # Electricity and asset indicators
    util_score = 0.0
    if data.electricity_units_monthly < 30:
        util_score = 15.0
    elif data.electricity_units_monthly < 60:
        util_score = 8.0
    score += util_score

    # Housing condition
    house_score = 0.0
    if data.house_ownership == "own_temporary":
        house_score = 15.0
    elif data.house_ownership == "rented":
        house_score = 10.0
    score += house_score

    # Disabled members priority
    health_score = 0.0
    if data.disabled_members > 0:
        health_score = 10.0
    score += health_score

    # Samurdhi / Community support priority
    livelihood_score = 5.0 if data.samurdhi_beneficiary else 0.0
    score += livelihood_score

    score = min(round(score, 1), 100.0)

    # Determine Aswesuma / Welfare Category (Bilingual & Multi-tier)
    if score >= 75:
        category_code = "SEVERELY_POOR"
        tier_en = "Severely Impoverished (Tier 1)"
        tier_si = "අතිශය දුප්පත් කාණ්ඩය (ප්‍රමුඛතා මට්ටම 1)"
        stipend = 15000.0
        status_en = "Eligible - Tier 1 Priority"
        status_si = "සුදුසුකම් සපුරා ඇත - ප්‍රමුඛතා මට්ටම 1"
        desc_en = "Severe multi-dimensional deprivation and extreme income poverty."
        desc_si = "දැඩි බහුමාන දිළිඳුකම සහ අන්ත ආදායම් විෂමතාවය සහිත පවුලකි."
    elif score >= 55:
        category_code = "POOR"
        tier_en = "Poor Household Tier (Tier 2)"
        tier_si = "දුප්පත් පවුල් කාණ්ඩය (මට්ටම 2)"
        stipend = 8500.0
        status_en = "Eligible - Tier 2"
        status_si = "සුදුසුකම් සපුරා ඇත - මට්ටම 2"
        desc_en = "Low income with structural and demographic vulnerabilities."
        desc_si = "ව්‍යුහාත්මක සහ ජනගහන අවදානම් සහිත අඩු ආදායම්ලාභී පවුලකි."
    elif score >= 38:
        category_code = "VULNERABLE"
        tier_en = "Vulnerable Household Tier (Tier 3)"
        tier_si = "අවදානමට ලක්වූ කාණ්ඩය (මට්ටම 3)"
        stipend = 4500.0
        status_en = "Eligible - Tier 3 Transitional"
        status_si = "සුදුසුකම් සපුරා ඇත - මට්ටම 3 සංක්‍රාන්තික"
        desc_en = "Vulnerable near-poor with moderate multi-dimensional dependency."
        desc_si = "මධ්‍යස්ථ බහුමාන යැපීම් සහිත අවදානමට ලක්විය හැකි පවුලකි."
    elif score >= 25:
        category_code = "TRANSITIONAL"
        tier_en = "Transitional Cushion Tier (Tier 4)"
        tier_si = "සංක්‍රාන්තික කාණ්ඩය (මට්ටම 4)"
        stipend = 2500.0
        status_en = "Eligible - Tier 4 Temporary"
        status_si = "සුදුසුකම් සපුරා ඇත - මට්ටම 4 තාවකාලික"
        desc_en = "Transitional cushion for households near poverty boundary."
        desc_si = "දිළිඳුතා සීමාව ආසන්නයේ සිටින පවුල් සඳහා තාවකාලික සංක්‍රාන්ති ආධාර."
    else:
        category_code = "NON_POOR"
        tier_en = "Non-Vulnerable / Self-Sufficient"
        tier_si = "දිළිඳු නොවන / ස්වයංපෝෂිත"
        stipend = 0.0
        status_en = "Not Eligible for Direct Cash Aid (Microfinance Recommended)"
        status_si = "සෘජු මුදල් ආධාර සඳහා සුදුසුකම් නොලබයි (ක්ෂුද්‍ර මූල්‍ය නිර්දේශිතයි)"
        desc_en = "Above welfare eligibility threshold with adequate economic resilience."
        desc_si = "ප්‍රමාණවත් ආර්ථික ශක්තියක් සහිත සුබසාධන සීමාවෙන් ඔබ්බෙහි පවුලකි."

    assessment_id = f"WEL-{int(time.time())}"
    did = f"did:sg:{data.nic}"

    programs_en = [
        "Aswesuma Social Safety Net",
        "Samurdhi Community Livelihood Scheme",
        "Sanasa Micro-Savings Group"
    ] if score >= 38 else ["Samupakara Self-Development Microloan"]

    programs_si = [
        "අස්වැසුම සමාජ ආරක්ෂණ ජාලය",
        "සමෘද්ධි ප්‍රජා ජීවනෝපාය යෝජනා ක්‍රමය",
        "සනස ක්ෂුද්‍ර ඉතුරුම් කණ්ඩායම"
    ] if score >= 38 else ["සමුපකාර ස්වයං සංවර්ධන ක්ෂුද්‍ර ණය"]

    dimensions = [
        {
            "key": "FAMILY_DEMOGRAPHY",
            "name_en": "Family Demography & Dependency",
            "name_si": "පවුල් ජනගහනය සහ යැපීම් අනුපාතය",
            "score": round(dep_score, 1),
            "max_score": 30.0,
            "reason_en": f"Dependency ratio: {dependency_ratio:.2f} ({data.dependents_children} child, {data.elderly_count} elderly)",
            "reason_si": f"යැපීම් අනුපාතය: {dependency_ratio:.2f} (දරුවන් {data.dependents_children}, වැඩිහිටියන් {data.elderly_count})"
        },
        {
            "key": "ECONOMIC_LEVEL_AND_INCOME",
            "name_en": "Per Capita Household Income",
            "name_si": "ඒක පුද්ගල ගෘහස්ථ ආදායම",
            "score": inc_score,
            "max_score": 35.0,
            "reason_en": f"Monthly per-capita income: Rs. {int(per_capita_income):,}",
            "reason_si": f"මාසික ඒක පුද්ගල ආදායම: රු. {int(per_capita_income):,}"
        },
        {
            "key": "UTILITIES_ENERGY",
            "name_en": "Electricity & Energy Consumption",
            "name_si": "විදුලි සහ බලශක්ති පරිභෝජනය",
            "score": util_score,
            "max_score": 15.0,
            "reason_en": f"Monthly electricity units: {data.electricity_units_monthly} kWh",
            "reason_si": f"මාසික විදුලි ඒකක: {data.electricity_units_monthly} kWh"
        },
        {
            "key": "HOUSING_CONDITIONS",
            "name_en": "Housing & Shelter Tenure",
            "name_si": "නිවාස සහ වාසස්ථාන තත්ත්වය",
            "score": house_score,
            "max_score": 15.0,
            "reason_en": f"Tenure: {data.house_ownership.replace('_', ' ').title()}",
            "reason_si": f"හිමිකාරිත්වය: {'තාවකාලික නිවාස' if data.house_ownership == 'own_temporary' else ('කුලී නිවාස' if data.house_ownership == 'rented' else 'ස්ථිර නිවාස')}"
        },
        {
            "key": "HEALTH_AND_SPECIAL_NEEDS",
            "name_en": "Health, Chronic Illness & Disability",
            "name_si": "සෞඛ්‍ය, නිදන්ගත රෝග සහ ආබාධිත තත්ත්වයන්",
            "score": health_score,
            "max_score": 10.0,
            "reason_en": f"Disabled household members: {data.disabled_members}",
            "reason_si": f"ආබාධිත පවුලේ සාමාජිකයන්: {data.disabled_members}"
        },
        {
            "key": "ASSETS_LIVELIHOOD",
            "name_en": "Community Livelihood & Vulnerability",
            "name_si": "ප්‍රජා ජීවනෝපාය සහ සමාජ ආරක්ෂණය",
            "score": livelihood_score,
            "max_score": 5.0,
            "reason_en": "Registered Samurdhi beneficiary household" if data.samurdhi_beneficiary else "New social safety net applicant",
            "reason_si": "ලියාපදිංචි සමෘද්ධි ප්‍රතිලාභී පවුලකි" if data.samurdhi_beneficiary else "නව සමාජ ආරක්ෂණ අයදුම්කරු"
        }
    ]

    is_si = data.language == "si"
    record = {
        "assessment_id": assessment_id,
        "did": did,
        "applicant_name": data.full_name,
        "gn_division": data.gn_division,
        "welfare_score": score,
        "category_code": category_code,
        "tier": tier_si if is_si else tier_en,
        "tier_en": tier_en,
        "tier_si": tier_si,
        "monthly_stipend": stipend,
        "monthly_stipend_formatted_en": f"Rs. {int(stipend):,} / month",
        "monthly_stipend_formatted_si": f"රු. {int(stipend):,} / මසකට",
        "status": status_si if is_si else status_en,
        "status_en": status_en,
        "status_si": status_si,
        "description": desc_si if is_si else desc_en,
        "description_en": desc_en,
        "description_si": desc_si,
        "recommended_programs": programs_si if is_si else programs_en,
        "recommended_programs_en": programs_en,
        "recommended_programs_si": programs_si,
        "dimension_breakdown": dimensions,
        "assessed_at": time.strftime("%Y-%m-%d %H:%M:%S")
    }

    welfare_applications_db.append(record)
    return record


@app.post("/welfare/register-reference")
def register_welfare_reference(data: dict):
    # This stores a reference in Python DB so the Officer Dashboard can list pending apps
    app_id = data.get("applicationId") or data.get("assessment_id") or f"ASW-{int(time.time())}"
    record = {
        "assessment_id": app_id,
        "applicationId": app_id,
        "did": data.get("did") or f"did:smartgrama:prototype:001",
        "applicant_name": data.get("applicant_name") or data.get("full_name") or "Citizen Applicant",
        "gn_division": data.get("gn_division", "Homagama - Division 542/A"),
        "welfare_score": data.get("welfare_score", 565.0),
        "tier": data.get("tier") or data.get("category", "POOR"),
        "monthly_stipend": float(data.get("monthly_stipend") or data.get("monthlyBenefitLkr") or 8500.0),
        "status": data.get("status", "Eligible - Pending Review"),
        "recommended_programs": data.get("recommended_programs", ["Aswesuma Social Safety Net"]),
        "assessed_at": time.strftime("%Y-%m-%d %H:%M:%S")
    }
    # Check if already exists, update or append
    existing = next((r for r in welfare_applications_db if r.get("assessment_id") == app_id or r.get("applicationId") == app_id), None)
    if existing:
        existing.update(record)
    else:
        welfare_applications_db.append(record)
    return {"status": "success", "record": record}


class WelfareReviewDecision(BaseModel):
    action: str  # 'approve' or 'reject'

@app.post("/welfare/{assessment_id}/review")
def review_welfare(assessment_id: str, decision: WelfareReviewDecision):
    for entry in welfare_applications_db:
        if entry.get("assessment_id") == assessment_id or entry.get("applicationId") == assessment_id:
            if decision.action == "approve":
                entry["status"] = "Approved for Disbursement (Blockchain Anchored)"
            else:
                entry["status"] = "Rejected by Officer"
                entry["monthly_stipend"] = 0.0
            return {"status": "success", "receipt": entry}
            
    raise HTTPException(status_code=404, detail="Assessment not found")


# -------------------------------------------------------------
# 2.5 KYC CHECKING (MOCK DATABASE)
# -------------------------------------------------------------
kyc_db = [
    {
        "did": "did:sg:921345678V",
        "name": "Kamal Perera",
        "submitted_at": "2026-08-25 10:15:00",
        "nic_front": "https://placehold.co/600x400/eeeeee/888888?text=NIC+Front+Scan",
        "nic_back": "https://placehold.co/600x400/eeeeee/888888?text=NIC+Back+Scan",
        "selfie": "https://placehold.co/400x400/eeeeee/888888?text=Applicant+Selfie",
        "status": "Pending"
    },
    {
        "did": "did:sg:881234567V",
        "name": "Sunil Silva",
        "submitted_at": "2026-08-26 08:30:00",
        "nic_front": "https://placehold.co/600x400/eeeeee/888888?text=NIC+Front+Scan",
        "nic_back": "https://placehold.co/600x400/eeeeee/888888?text=NIC+Back+Scan",
        "selfie": "https://placehold.co/400x400/eeeeee/888888?text=Applicant+Selfie",
        "status": "Pending"
    }
]

@app.get("/kyc")
def get_pending_kyc():
    return [k for k in kyc_db if k["status"] == "Pending"]

class KYCReviewDecision(BaseModel):
    action: str  # 'verify' or 'reject'

@app.post("/kyc/{did}/review")
def review_kyc(did: str, decision: KYCReviewDecision):
    for entry in kyc_db:
        if entry["did"] == did:
            if decision.action == "verify":
                entry["status"] = "Verified"
            else:
                entry["status"] = "Rejected"
            return {"status": "success", "receipt": entry}
            
    raise HTTPException(status_code=404, detail="KYC record not found")



# -------------------------------------------------------------
# 3. BLOCKCHAIN DLT & TAMPER-RESISTANT ANCHORING
# -------------------------------------------------------------
blockchain_ledger_db = []
loan_applications_db = []
welfare_applications_db = []

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
    timestamp = int(time.time())
    
    # Generate cryptographic SHA256 proof hash
    payload = f"{did}:{data.loan_type}:{data.recommended_loan_amount}:{data.decision}:{timestamp}"
    tx_hash = "0x" + hashlib.sha256(payload.encode()).hexdigest()
    block_number = 1845200 + len(blockchain_ledger_db) + 1

    ledger_entry = {
        "tx_hash": tx_hash,
        "block_number": block_number,
        "timestamp": time.strftime("%Y-%m-%d %H:%M:%S", time.localtime(timestamp)),
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

    blockchain_ledger_db.append(ledger_entry)
    loan_applications_db.append(ledger_entry)

    return {
        "status": "success",
        "message": "Loan application recorded and pending officer review.",
        "receipt": ledger_entry
    }

class ReviewDecision(BaseModel):
    action: str  # 'approve' or 'reject'

@app.post("/applications/{tx_hash}/review")
def review_application(tx_hash: str, decision: ReviewDecision):
    for entry in loan_applications_db:
        if entry["tx_hash"] == tx_hash:
            if decision.action == "approve":
                entry["status"] = "Active"
                entry["consensus_status"] = "Verified & Committed (Hyperledger/DLT Anchor)"
            else:
                entry["status"] = "Rejected"
                entry["consensus_status"] = "Rejected by Officer"
            return {"status": "success", "receipt": entry}
            
    raise HTTPException(status_code=404, detail="Transaction not found")


@app.get("/blockchain/transactions")
def get_blockchain_transactions():
    return {
        "total_transactions": len(blockchain_ledger_db),
        "ledger": blockchain_ledger_db[::-1]
    }


@app.get("/applications/all")
def get_all_applications():
    return {
        "loans": loan_applications_db[::-1],
        "welfare": welfare_applications_db[::-1]
    }
# -------------------------------------------------------------
# 3.5 DYNAMIC BANKS & LOAN PROGRAMS REGISTRY
# -------------------------------------------------------------
banks_db = [
    {"id": "b1", "name": "Samupakara (Sanasa)"},
    {"id": "b2", "name": "Samurdhi Bank"}
]

loan_programs_db = [
    {
        "id": "below_25000",
        "bank_id": "b1",
        "title": "Below Rs. 25,000 Micro-Loan",
        "subtitle": "Quick emergency micro-credit with minimal documentation",
        "tag": "8% Low Interest",
        "tagColor": 0xFF4CAF50, # green equivalent
        "apr": "8%",
        "limit": "Rs. 5,000 - Rs. 25,000",
        "months": "24 months",
        "features": ["No collateral required", "Approval within 24 hours", "Repayment up to 24 months"]
    },
    {
        "id": "above_25000",
        "bank_id": "b1",
        "title": "Above Rs. 25,000 Development Loan",
        "subtitle": "Affordable capital financing for local micro-enterprises",
        "tag": "8% Low Interest",
        "tagColor": 0xFF4CAF50,
        "apr": "8%",
        "limit": "Rs. 25,000 - Rs. 500,000",
        "months": "48 months",
        "features": ["Business plan required", "Group guarantee options"]
    },
    {
        "id": "long_term",
        "bank_id": "b1",
        "title": "Long Term Investment Loan",
        "subtitle": "Extended term capital financing for equipment & asset building",
        "tag": "Long Term",
        "tagColor": 0xFF4CAF50,
        "apr": "20%",
        "limit": "Rs. 100,000+",
        "months": "60 months",
        "features": ["Asset backed security", "Grace period available"]
    },
    {
        "id": "epf_loan",
        "bank_id": "b1",
        "title": "EPF Backed Secured Loan",
        "subtitle": "Low rate credit secured against your employee provident fund",
        "tag": "13% APR",
        "tagColor": 0xFF4CAF50,
        "apr": "13%",
        "limit": "Up to 75% of EPF balance",
        "months": "60 months",
        "features": ["Directly secured by EPF", "Fast processing"]
    },
    {
        "id": "lakjaya",
        "bank_id": "b2",
        "title": "Lak Jaya Microloan (ලක් ජය)",
        "subtitle": "Livelihood & cottage industry micro-capital",
        "tag": "Samurdhi Certified",
        "tagColor": 0xFF4CAF50,
        "apr": "15%",
        "limit": "Rs. 10,000 - Rs. 100,000",
        "months": "36 months",
        "features": ["Designed for low-income entrepreneurs", "Group guarantee acceptance", "No hidden processing fees"]
    },
    {
        "id": "lak_wasana",
        "bank_id": "b2",
        "title": "Lak Wasana Business Loan (ලක් වාසනා)",
        "subtitle": "Enterprise expansion capital for established micro-businesses",
        "tag": "High Limit",
        "tagColor": 0xFFFF9800, # orange
        "apr": "16%",
        "limit": "Rs. 50,000 - Rs. 500,000",
        "months": "48 months",
        "features": ["Business registration required", "Flexible repayment schedules"]
    },
    {
        "id": "liya_sawiya",
        "bank_id": "b2",
        "title": "Liya Sawiya Women Loan (ලිය සවිය)",
        "subtitle": "Special subsidized micro-finance empowering female entrepreneurs",
        "tag": "12% Subsidized",
        "tagColor": 0xFF2196F3, # blue
        "apr": "12%",
        "limit": "Rs. 20,000 - Rs. 200,000",
        "months": "48 months",
        "features": ["Female applicants only", "Skill development training included"]
    },
    {
        "id": "jiwanopaya",
        "bank_id": "b2",
        "title": "Jiwanopaya Livelihood Loan (ජීවනෝපාය)",
        "subtitle": "Farming, poultry, and home-based craft enhancement loan",
        "tag": "Livelihood Aid",
        "tagColor": 0xFF4CAF50,
        "apr": "14%",
        "limit": "Rs. 10,000 - Rs. 50,000",
        "months": "24 months",
        "features": ["No collateral", "Quick disbursement"]
    },
    {
        "id": "chakrya",
        "bank_id": "b2",
        "title": "Chakrya Revolving Loan (චක්රීය ණය)",
        "subtitle": "Rotating community credit fund with ultra-low interest",
        "tag": "10% Revolving",
        "tagColor": 0xFF4CAF50,
        "apr": "10%",
        "limit": "Rs. 5,000 - Rs. 20,000",
        "months": "12 months",
        "features": ["Community managed", "Revolving credit line"]
    }
]

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
    return banks_db

@app.post("/banks")
def add_bank(bank: BankCreate):
    new_bank = {"id": f"b{len(banks_db) + 1}", "name": bank.name}
    banks_db.append(new_bank)
    return new_bank

@app.get("/loan-programs")
def get_loan_programs():
    return loan_programs_db

@app.post("/loan-programs")
def add_loan_program(program: LoanProgramCreate):
    new_program = program.dict()
    new_program["id"] = f"lp{len(loan_programs_db) + 1}"
    loan_programs_db.append(new_program)
    return new_program

@app.delete("/banks/{bank_id}")
def delete_bank(bank_id: str):
    global banks_db, loan_programs_db
    banks_db = [b for b in banks_db if b["id"] != bank_id]
    loan_programs_db = [p for p in loan_programs_db if p["bank_id"] != bank_id]
    return {"status": "success"}

@app.delete("/loan-programs/{program_id}")
def delete_loan_program(program_id: str):
    global loan_programs_db
    loan_programs_db = [p for p in loan_programs_db if p["id"] != program_id]
    return {"status": "success"}

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
            reply = f"ආයුබෝවන්! SmartGrama සහායක වෙත සාදරයෙන් පිළිගනිමු. මට ඔබට සමුපකාර සහ සමෘද්ධි ණය අයදුම්පත්, අස්වැසුම සුභසාධන ප්‍රතිලාභ, සහ ඩිජිටල් මුදල් පසුම්බිය පිළිබඳ ඕනෑම තොරතුරක් ලබාදිය හැක."
        elif lang == "ta":
            reply = "வணக்கம்! SmartGrama உதவி மையத்திற்கு வரவேற்கிறோம். நுண்கடன், அஸ்வெசும உதவித்தொகை மற்றும் டிஜிட்டல் அடையாளம் பற்றிய தகவல்களை நான் வழங்க முடியும்."
        else:
            reply = "Hello! I am your SmartGrama AI Assistant. I can assist you with Samupakara & Samurdhi microloans, Aswesuma welfare scoring, EMI estimation, and blockchain verification. How can I help you today?"

    return {
        "reply": reply,
        "language": lang,
        "timestamp": time.strftime("%H:%M")
    }


# Initial Demo Seeding for smooth demo presentation
if not blockchain_ledger_db:
    blockchain_ledger_db.append({
        "tx_hash": "0x3f7a8b9c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a",
        "block_number": 1845201,
        "timestamp": "2026-04-10 14:32:00",
        "did": "did:sg:198723456789",
        "applicant_name": "Nimal Perera",
        "loan_type": "Agricultural Microloan",
        "approved_amount": 150000.0,
        "interest_rate": "12%",
        "duration_months": 48,
        "risk_level": "Low Risk",
        "decision": "Approved",
        "smart_contract": "0x71C8A33E2B6c0f81A2b1d3A84988f4AcE9812",
        "channel": "sg-interbank-financial-channel",
        "consensus_status": "Verified & Committed (Hyperledger/DLT Anchor)",
        "status": "Approved"
    })
    loan_applications_db.append(blockchain_ledger_db[0])
