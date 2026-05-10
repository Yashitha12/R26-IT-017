import { useLocation } from "react-router-dom";
import Header from "../components/Header";

export default function AdminApplicantReview() {
  const { state } = useLocation();

  const prediction = state?.prediction;
  const application = state?.application;

  if (!prediction || !application) {
    return <p>No applicant data found</p>;
  }

  return (
    <div className="phone">
      <Header />

      <button className="secondary">← Back to List</button>

      <h2>Applicant Review</h2>
      <p>{application.fullName} - Loan Application</p>

      <div className="form-card">
        <h3>👤 Applicant Profile</h3>

        <div className="result-row">
          <span>Name</span>
          <b>{application.fullName}</b>
        </div>

        <div className="result-row">
          <span>NIC</span>
          <b>{application.nic}</b>
        </div>

        <div className="result-row">
          <span>KYC Status</span>
          <b className="pending">Pending</b>
        </div>
      </div>

      <div className="form-card">
        <h3>💰 Financial Summary</h3>

        <div className="result-row">
          <span>Monthly Income</span>
          <b>Rs. {application.monthly_income}</b>
        </div>

        <div className="result-row">
          <span>Monthly Expenses</span>
          <b>Rs. {application.expenses}</b>
        </div>

        <div className="result-row">
          <span>Net Savings</span>
          <b>Rs. {application.savings_balance}</b>
        </div>

        <div className="result-row">
          <span>Existing Loans</span>
          <b>Rs. {application.existing_loans}</b>
        </div>
      </div>

      <div className="form-card">
        <button className="danger">✕ Reject</button>
        <button>✓ Submit</button>
      </div>

      <div className="form-card">
        <div className="result-row">
          <span>Requested</span>
          <b>Rs. {prediction.requested_loan_amount}</b>
        </div>

        <div className="result-row">
          <span>AI Recommended</span>
          <b>Rs. {prediction.recommended_loan_amount}</b>
        </div>

        <div className="result-row">
          <span>Suggested EMI</span>
          <b>Rs. {prediction.suggested_monthly_installment}</b>
        </div>
      </div>

      <div className="form-card">
        <h3>✅ Officer Decision</h3>

        <select>
          <option>Approve — Recommended Amount</option>
          <option>Approve — Reduced Amount</option>
          <option>Reject</option>
        </select>

        <textarea placeholder="Add verification notes..." />
      </div>
    </div>
  );
}