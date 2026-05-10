import React from 'react';
import { useNavigate } from 'react-router-dom';

const LoanPrograms = () => {
  const navigate = useNavigate();

  const loans = [
    {
      title: "Personal Loan",
      desc: "Flexible loan for personal expenses",
      rate: "12%",
      term: "5 years",
      amount: "Rs. 500,000",
      time: "24 hrs",
    },
    {
      title: "Home Improvement Loan",
      desc: "Funding for home renovations and improvements",
      rate: "8.5%",
      term: "10 years",
      amount: "Rs. 5,000,000",
      time: "3-5 days",
    },
    {
      title: "Business Loan",
      desc: "Capital for starting or expanding your business",
      rate: "9.75%",
      term: "7 years",
      amount: "Rs. 10,000,000",
      time: "5-7 days",
    },
  ];

  return (
    <div className="loan-programs-page">
      {/* Header */}
      <div className="header">
        <div className="logo">
          <span className="sg-logo">SG</span>
          <h1>SmartGrama</h1>
        </div>
      </div>

      <div className="content">
        <h2>Loan Programs</h2>
        <p className="subtitle">
          Choose from our variety of loan options designed to meet your financial needs
        </p>

        {loans.map((loan, index) => (
          <div key={index} className="loan-card">
            <h3>{loan.title}</h3>
            <p className="loan-desc">{loan.desc}</p>

            <div className="loan-info">
              <div className="info-row">
                <strong>{loan.rate}</strong>
                <span>Interest Rate</span>
              </div>
              <div className="info-row">
                <strong>{loan.term}</strong>
                <span>Max Term</span>
              </div>
              <div className="info-row">
                <strong>{loan.amount}</strong>
                <span>Loan Amount</span>
              </div>
              <div className="info-row">
                <strong>{loan.time}</strong>
                <span>Approval Time</span>
              </div>
            </div>

            <button 
              onClick={() => navigate('/loan-application', { state: { loanType: loan.title } })}
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