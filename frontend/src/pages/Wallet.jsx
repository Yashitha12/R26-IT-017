import { useLocation, useNavigate } from "react-router-dom";
import Header from "../components/Header";

export default function Wallet() {
  const { state } = useLocation();
  const navigate = useNavigate();

  const prediction = state?.prediction;
  const application = state?.application;

  if (!prediction || !application) {
    return <p>No wallet data found</p>;
  }

  return (
    <div className="phone wallet-page">
      <Header />

      <div className="page-card">
        <h2>My Wallet</h2>
        <p>Digital wallet linked to your DID</p>
      </div>

      <div className="wallet-card blue">
        <p>Total Balance</p>
        <h1>Rs. 47,500.00</h1>
        <div className="wallet-tags">
          <span>✓ Verified Account</span>
          <span>Samupath Bank</span>
        </div>
        <small>DID: did:sg:{application.nic || "user"}</small>
      </div>

      <div className="form-card">
        <h3>🏦 Active Loan</h3>

        <p>
          <b>Loan Type:</b> {application.loan_title || application.loan_type}
        </p>
        <p>
          <b>Original Amount:</b> Rs. {prediction.recommended_loan_amount}
        </p>
        <p>
          <b>Remaining:</b> Rs.{" "}
          {Math.max(
            prediction.recommended_loan_amount -
              prediction.suggested_monthly_installment,
            0
          )}
        </p>
        <p>
          <b>Monthly EMI:</b> Rs. {prediction.suggested_monthly_installment}
        </p>
        <p>
          <b>Next Payment:</b> May 15, 2026
        </p>

        <div className="progress-line">
          <div className="progress-fill"></div>
        </div>
        <small>2% Repaid</small>
      </div>

      <div className="form-card">
        <h3>🤝 Welfare Benefits</h3>

        <p>
          <b>Program:</b> Samurdhi
        </p>
        <p>
          <b>Monthly Amount:</b> Rs. 5,000
        </p>
        <p>
          <b>Status:</b> Active
        </p>
        <p>
          <b>Next Payment:</b> June 1, 2026
        </p>
      </div>

      <div className="form-card">
        <h3>📜 Payment History</h3>

        <div className="history-row">
          <span>May 1</span>
          <span>Loan EMI</span>
          <b>Rs. {prediction.suggested_monthly_installment}</b>
        </div>

        <div className="history-row">
          <span>May 1</span>
          <span>Welfare</span>
          <b>Rs. 5,000</b>
        </div>

        <div className="history-row">
          <span>Apr 30</span>
          <span>Group Contribution</span>
          <b>Rs. 1,000</b>
        </div>
      </div>

      <button
        onClick={() =>
          navigate("/admin-review", {
            state: {
              prediction,
              application,
            },
          })
        }
      >
        Admin Dashboard
      </button>
    </div>
  );
}