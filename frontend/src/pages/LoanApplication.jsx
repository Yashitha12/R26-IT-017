import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Header from "../components/Header";
import ProgressSteps from "../components/ProgressSteps";
import { predictLoan } from "../api/loanApi";

export default function LoanApplication() {
  const navigate = useNavigate();
  const location = useLocation();

  const selectedLoan = location.state?.loanType || "Personal Loan";

  const [step, setStep] = useState(1);

  const [form, setForm] = useState({
    membershipId: "",
    fullName: "",
    nic: "",
    mobile: "",
    email: "",
    address: "",

    monthly_income: "",
    other_income: "",
    expenses: "",
    loan_amount: "",
    loan_type: selectedLoan,
    savings_balance: "",
    existing_loans: "",
    repayment_history: "1",
    guarantor_support_count: "",
  });

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const submitApplication = async () => {
    const loanData = {
      monthly_income: Number(form.monthly_income),
      other_income: Number(form.other_income),
      expenses: Number(form.expenses),
      loan_amount: Number(form.loan_amount),
      loan_type: form.loan_type,
      savings_balance: Number(form.savings_balance),
      existing_loans: Number(form.existing_loans),
      repayment_history: Number(form.repayment_history),
      guarantor_support_count: Number(form.guarantor_support_count),
    };

    const prediction = await predictLoan(loanData);

    navigate("/loan-result", {
      state: {
        prediction,
        application: form,
      },
    });
  };

  return (
    <div className="phone">
      <Header />

      <div className="page-card">
        <h2>Loan Application</h2>
        <p>{selectedLoan} - Step {step} of 5</p>
      </div>

      <ProgressSteps step={step} />

      {step === 1 && (
        <div className="form-card">
          <h3>👤 Personal Details</h3>

          <input name="membershipId" placeholder="Membership ID" onChange={handleChange} />
          <input name="fullName" placeholder="Full Name" onChange={handleChange} />
          <input name="nic" placeholder="NIC Number" onChange={handleChange} />
          <input name="mobile" placeholder="Mobile" onChange={handleChange} />
          <input name="email" placeholder="Email" onChange={handleChange} />
          <input name="address" placeholder="Home Address" onChange={handleChange} />

          <button onClick={() => setStep(2)}>Next →</button>
        </div>
      )}

      {step === 2 && (
        <div className="form-card">
          <h3>💰 Loan Details</h3>

          <input name="loan_type" value={form.loan_type} onChange={handleChange} />
          <input name="loan_amount" placeholder="Loan Amount Rs." onChange={handleChange} />
          <input placeholder="Interest Rate" />
          <input placeholder="Loan Date" />
          <input placeholder="Repayment Period Months" />

          <button className="secondary" onClick={() => setStep(1)}>← Back</button>
          <button onClick={() => setStep(3)}>Next →</button>
        </div>
      )}

      {step === 3 && (
        <div className="form-card">
          <h3>📊 Financial Details</h3>

          <input name="monthly_income" placeholder="Monthly Income Rs." onChange={handleChange} />
          <input name="other_income" placeholder="Other Income Rs." onChange={handleChange} />
          <input name="expenses" placeholder="Monthly Expenses Rs." onChange={handleChange} />
          <input name="savings_balance" placeholder="Savings Balance Rs." onChange={handleChange} />
          <input name="existing_loans" placeholder="Existing Loans Amount Rs." onChange={handleChange} />

          <button className="secondary" onClick={() => setStep(2)}>← Back</button>
          <button onClick={() => setStep(4)}>Next →</button>
        </div>
      )}

      {step === 4 && (
        <div className="form-card">
          <h3>🤝 Guarantor Details</h3>

          <input
            name="guarantor_support_count"
            placeholder="Number of Guarantors"
            onChange={handleChange}
          />

          <select name="repayment_history" onChange={handleChange}>
            <option value="1">Good Repayment History</option>
            <option value="0">Poor Repayment History</option>
          </select>

          <button className="secondary" onClick={() => setStep(3)}>← Back</button>
          <button onClick={() => setStep(5)}>Next →</button>
        </div>
      )}

      {step === 5 && (
        <div className="form-card">
          <h3>✅ Review Application</h3>

          <p>Name: {form.fullName}</p>
          <p>Loan Type: {form.loan_type}</p>
          <p>Loan Amount: Rs. {form.loan_amount}</p>
          <p>Monthly Income: Rs. {form.monthly_income}</p>
          <p>Expenses: Rs. {form.expenses}</p>

          <button className="secondary" onClick={() => setStep(4)}>← Back</button>
          <button onClick={submitApplication}>Submit Application</button>
        </div>
      )}
    </div>
  );
}