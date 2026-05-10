import pandas as pd
import numpy as np
import joblib

from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix


# =========================
# 1. LOAD DATASETS
# =========================

india_df = pd.read_csv("alternative_credit_scoring.csv")
sri_df = pd.read_csv("sri lankan .csv")


# =========================
# 2. HELPER FUNCTIONS
# =========================

def clean_money(value):
    value = str(value)
    value = value.replace("LKR", "")
    value = value.replace(",", "")
    value = value.replace("%", "")
    value = value.strip().lower()

    invalid_values = ["", "nan", "no", "none", "inactive", "active", "-"]

    if value in invalid_values:
        return 0.0

    try:
        return float(value)
    except ValueError:
        return 0.0

def yes_no_to_number(value):
    value = str(value).strip().lower()

    if value in ["yes", "y", "1", "true"]:
        return 1
    return 0


def count_guarantors(row):
    cols = ["Gurantor 1", "Gurantor 2", "Gurantor 3", "Gurantor 4"]
    count = 0

    for col in cols:
        value = str(row[col]).strip().lower()

        if value not in ["", "nan", "no", "none"]:
            count += 1

    return count


# =========================
# 3. PREPARE INDIA DATASET
# =========================

india_df = india_df.rename(columns={
    "monthly_income_inr": "monthly_income",
    "gig_monthly_earnings": "other_income",
    "jandhan_avg_balance": "savings_balance",
    "credit_risk_label": "risk_level"
})

# Synthetic values because Indian dataset does not have these direct fields
np.random.seed(42)

india_df["expenses"] = (
    india_df["monthly_income"] * np.random.uniform(0.3, 0.8, len(india_df))
).round(2)

india_df["loan_amount"] = (
    india_df["monthly_income"] * np.random.uniform(2, 6, len(india_df))
).round(2)

india_df["loan_type"] = np.where(
    india_df["loan_amount"] <= 25000,
    "Below_25000",
    "Above_25000"
)

india_df["existing_loans"] = np.random.randint(0, 4, len(india_df))

india_df["repayment_history"] = np.where(
    india_df["microfinance_loans_repaid_count"] > 0,
    1,
    0
)

india_df["guarantor_support_count"] = np.random.randint(2, 5, len(india_df))


# =========================
# 4. PREPARE SRI LANKAN DATASET
# =========================

sri_df = sri_df.rename(columns={
    "share amt": "share_amount",
    "Loan Type": "loan_type",
    "Amount": "loan_amount",
    "saving balance": "savings_balance",
    "existing loans": "existing_loans",
    "Monthly income": "monthly_income",
    "other income": "other_income",
    "expences": "expenses"
})

# Clean money columns
money_cols = [
    "share_amount",
    "loan_amount",
    "savings_balance",
    "monthly_income",
    "other_income",
    "expenses"
]

for col in money_cols:
    sri_df[col] = sri_df[col].apply(clean_money)

# Existing loans yes/no
sri_df["existing_loans"] = sri_df["existing_loans"].apply(yes_no_to_number)

# All available records are approved, so temporary repayment history = 1
sri_df["repayment_history"] = 1

# Guarantor support count
sri_df["guarantor_support_count"] = sri_df.apply(count_guarantors, axis=1)


# =========================
# 5. CREATE RISK LABEL FOR SRI LANKAN DATA
# =========================

def create_sri_risk(row):
    total_income = row["monthly_income"] + row["other_income"]
    expenses = row["expenses"]
    loan_amount = row["loan_amount"]
    savings = row["savings_balance"]
    existing_loans = row["existing_loans"]
    guarantors = row["guarantor_support_count"]

    disposable_income = total_income - expenses

    loan_to_income_ratio = loan_amount / total_income if total_income > 0 else 999
    savings_ratio = savings / total_income if total_income > 0 else 0

    if (
        loan_to_income_ratio <= 3
        and disposable_income > 0
        and existing_loans == 0
        and guarantors >= 2
    ):
        return "Low Risk"

    elif (
        loan_to_income_ratio <= 6
        and disposable_income > 0
    ):
        return "Medium Risk"

    else:
        return "High Risk"


sri_df["risk_level"] = sri_df.apply(create_sri_risk, axis=1)


# =========================
# 6. FINAL COMMON COLUMNS
# =========================

final_columns = [
    "monthly_income",
    "other_income",
    "expenses",
    "loan_amount",
    "loan_type",
    "savings_balance",
    "existing_loans",
    "repayment_history",
    "guarantor_support_count",
    "risk_level"
]

india_final = india_df[final_columns]
sri_final = sri_df[final_columns]


# =========================
# 7. COMBINE DATASETS
# =========================

combined_df = pd.concat([india_final, sri_final], ignore_index=True)

combined_df.to_csv("combined_microfinance_dataset.csv", index=False)

print("Combined dataset saved")
print(combined_df.head())
print(combined_df.shape)
print(combined_df["risk_level"].value_counts())


# =========================
# 8. TRAIN MODEL
# =========================

X = combined_df.drop(columns=["risk_level"])
y = combined_df["risk_level"]

X = pd.get_dummies(X, drop_first=True)

X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.2,
    random_state=42,
    stratify=y
)

model = RandomForestClassifier(
    n_estimators=200,
    random_state=42,
    class_weight="balanced"
)

model.fit(X_train, y_train)

y_pred = model.predict(X_test)

print("Accuracy:", accuracy_score(y_test, y_pred))
print(classification_report(y_test, y_pred))
print(confusion_matrix(y_test, y_pred))


# =========================
# 9. SAVE MODEL
# =========================

joblib.dump(model, "combined_risk_prediction_model.pkl")
joblib.dump(X.columns.tolist(), "combined_model_columns.pkl")

print("Combined model saved successfully")