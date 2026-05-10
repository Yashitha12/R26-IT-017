from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import pandas as pd
import joblib

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:5173"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

model = joblib.load("combined_risk_prediction_model.pkl")
model_columns = joblib.load("combined_model_columns.pkl")


class LoanInput(BaseModel):
    monthly_income: float
    other_income: float
    expenses: float
    loan_amount: float
    loan_type: str
    savings_balance: float
    existing_loans: float
    repayment_history: int
    guarantor_support_count: int


def decision_recommendation(risk_level, monthly_income, expenses, requested_loan_amount):
    disposable_income = monthly_income - expenses

    if risk_level == "Low Risk":
        max_loan = monthly_income * 6
    elif risk_level == "Medium Risk":
        max_loan = monthly_income * 3
    else:
        max_loan = monthly_income * 1.5

    if requested_loan_amount <= max_loan and risk_level == "Low Risk":
        final_decision = "Approved"
        recommended_loan = requested_loan_amount

    elif requested_loan_amount <= max_loan and risk_level == "Medium Risk":
        final_decision = "Approved with Caution"
        recommended_loan = requested_loan_amount

    elif risk_level == "High Risk":
        final_decision = "Reduced Amount Approved"
        recommended_loan = max_loan

    else:
        final_decision = "Reduced Amount Approved"
        recommended_loan = max_loan

    suggested_monthly_installment = disposable_income * 0.35

    repayment_months = (
        recommended_loan / suggested_monthly_installment
        if suggested_monthly_installment > 0
        else 0
    )

    return {
        "predicted_risk_level": risk_level,
        "final_decision": final_decision,
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