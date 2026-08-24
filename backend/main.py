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

# -------------------------------------------------------------
# 1. ML CREDIT RISK PREDICTION ENGINE (Preserved 100%)
# -------------------------------------------------------------
model = joblib.load("combined_risk_prediction_model.pkl")
model_columns = joblib.load("combined_model_columns.pkl")


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


@app.post("/welfare/assess")
def assess_welfare(data: WelfareInput):
    # Poverty Score Calculation (Proxy Means Test Model)
    # Range 0 - 100 (Higher score = greater vulnerability / higher welfare priority)
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

    record = {
        "assessment_id": assessment_id,
        "did": did,
        "applicant_name": data.full_name,
        "gn_division": data.gn_division,
        "welfare_score": score,
        "tier": tier,
        "monthly_stipend": stipend,
        "status": status,
        "recommended_programs": [
            "Aswesuma Social Safety Net",
            "Samurdhi Community Livelihood Scheme",
            "Sanasa Micro-Savings Group"
        ] if score >= 38 else ["Samupakara Self-Development Microloan"],
        "assessed_at": time.strftime("%Y-%m-%d %H:%M:%S")
    }

    welfare_applications_db.append(record)
    return record


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
        "consensus_status": "Verified & Committed (Hyperledger/DLT Anchor)",
        "status": "Active"
    }

    blockchain_ledger_db.append(ledger_entry)
    loan_applications_db.append(ledger_entry)

    return {
        "status": "success",
        "message": "Loan agreement anchored on blockchain ledger successfully.",
        "receipt": ledger_entry
    }


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
