import React from "react";
import { useNavigate } from "react-router-dom";
import { loanProducts } from "../data/loanProducts";

const LoanPrograms = () => {
  const navigate = useNavigate();

  const loans = Object.entries(loanProducts).map(([key, value]) => ({
    key,
    ...value,
  }));

  return (
    <div className="loan-programs-page">
      <div className="header">
        <div className="logo">
          <span className="sg-logo">SG</span>
          <h1>SmartGrama</h1>
        </div>

        <button
          className="secondary"
          onClick={() => navigate("/admin-review")}
        >
          Admin Dashboard
        </button>
      </div>

      <div className="content">
        <h2>Loan Programs</h2>
        <p className="subtitle">
          Select a loan type and continue to application
        </p>

        {loans.map((loan) => (
          <div key={loan.key} className="loan-card">
            <h3>{loan.title}</h3>

            <div className="loan-info">
              <div className="info-row">
                <strong>{loan.interestRate}%</strong>
                <span>Interest Rate</span>
              </div>

              <div className="info-row">
                <strong>{loan.maxMonths} months</strong>
                <span>Max Term</span>
              </div>

              <div className="info-row">
                <strong>
                  Rs. {loan.min.toLocaleString()} - Rs.{" "}
                  {loan.max.toLocaleString()}
                </strong>
                <span>Loan Limit</span>
              </div>
            </div>

            <button
              onClick={() =>
                navigate("/loan-application", {
                  state: { loanType: loan.key },
                })
              }
              className="apply-btn"
            >
              Apply Now
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LoanPrograms;