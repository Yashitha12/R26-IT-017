import { useLocation, useNavigate } from "react-router-dom";

export default function LoanResult() {
  const { state } = useLocation();
  const navigate = useNavigate();

  const prediction = state?.prediction;
  const application = state?.application;

  if (!prediction) {
    return <p>No prediction found</p>;
  }

  return (
    <div className="phone result-bg">
      <div className="result-card">
        <h2>Loan Evaluation Result</h2>
        <h3>{prediction.final_decision}</h3>
        <p>AI Evaluation Complete</p>

        <div className="result-row">
          <span>Requested Amount</span>
          <b>Rs. {prediction.requested_loan_amount}</b>
        </div>

        <div className="result-row">
          <span>Recommended Amount</span>
          <b>Rs. {prediction.recommended_loan_amount}</b>
        </div>

        <div className="result-row">
          <span>Monthly Installment</span>
          <b>Rs. {prediction.suggested_monthly_installment}</b>
        </div>

        <div className="result-row">
          <span>Repayment Duration</span>
          <b>{prediction.estimated_repayment_duration_months} months</b>
        </div>

        <div className="result-row">
          <span>Risk Level</span>
          <b>{prediction.predicted_risk_level}</b>
        </div>

        <div className="warning-box">
          ⚠ AI result should be reviewed by a loan officer before final approval.
        </div>

        <div className="tip-box">
          💡 Tip: Maintaining savings and reducing expenses can improve loan eligibility.
        </div>

        <button className="secondary" onClick={() => navigate("/")}>
          Review Later
        </button>

        <button
          onClick={() =>
            navigate("/wallet", {
              state: {
                prediction,
                application,
              },
            })
          }
        >
          ✓ Accept Offer
        </button>

        <button
          className="secondary"
          onClick={() =>
            navigate("/admin-review", {
              state: {
                prediction,
                application,
              },
            })
          }
        >
          Admin Review
        </button>
      </div>
    </div>
  );
}