import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Header from "../components/Header";
import { recordLoanOnBlockchain } from "../api/loanApi";

export default function LoanResult() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const [isRecording, setIsRecording] = useState(false);
  const [txReceipt, setTxReceipt] = useState(null);

  const prediction = state?.prediction;
  const application = state?.application;

  if (!prediction) {
    return (
      <>
        <Header />
        <main className="content-container flex flex-col justify-center items-center" style={{ minHeight: '60vh', gap: '16px' }}>
          <p style={{ color: 'var(--text-secondary)' }}>No prediction data found. Please submit an application.</p>
          <button style={{ padding: '12px 24px', background: 'var(--accent)', color: 'white', borderRadius: '8px', border: 'none', cursor: 'pointer' }} onClick={() => navigate("/")}>Go Home</button>
        </main>
      </>
    );
  }

  const decision = prediction?.final_decision || "Approved";
  const isRejected = decision.includes("Rejected");
  const isReduced = decision.includes("Reduced");
  const isCaution = decision.includes("Caution");
  const isFullyApproved = !isRejected && !isReduced && !isCaution;

  let statusColor = "var(--success)";
  let statusIcon = "fa-check";
  let statusTitle = "Approved!";

  if (isRejected) {
    statusColor = "var(--error, #ef4444)";
    statusIcon = "fa-xmark";
    statusTitle = "Application Rejected";
  } else if (isReduced) {
    statusColor = "#eab308"; // yellow
    statusIcon = "fa-scale-balanced";
    statusTitle = "Amount Adjusted";
  } else if (isCaution) {
    statusColor = "#f97316"; // orange
    statusIcon = "fa-triangle-exclamation";
    statusTitle = "Approved with Caution";
  }

  let riskColor = "var(--success)";
  const riskLevel = prediction?.predicted_risk_level || "Low Risk";
  if (riskLevel.includes("High")) {
    riskColor = "var(--error, #ef4444)";
  } else if (riskLevel.includes("Medium")) {
    riskColor = "#eab308";
  }

  const handleRecordBlockchain = async () => {
    setIsRecording(true);
    try {
      const recordData = {
        applicant_name: application.fullName,
        nic: application.nic,
        loan_type: application.loan_title,
        loan_amount: application.loan_amount,
        recommended_loan_amount: prediction.recommended_loan_amount,
        interest_rate: application.interest_rate,
        repayment_months: prediction.estimated_repayment_duration_months,
        risk_level: prediction.predicted_risk_level,
        decision: prediction.final_decision
      };

      const result = await recordLoanOnBlockchain(recordData);
      setTxReceipt(result.receipt);
    } catch (error) {
      alert("Error recording to blockchain.");
      console.error(error);
    } finally {
      setIsRecording(false);
    }
  };

  return (
    <>
      <Header />

      <main className="content-container flex justify-center items-start" style={{ padding: '40px 0', minHeight: 'calc(100vh - 80px)' }}>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '32px', width: '100%' }}>
          
          {/* Main ML Analysis Panel */}
          <div className="card" style={{ padding: '40px' }}>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px', paddingBottom: '24px', borderBottom: '1px solid var(--border)' }}>
              <div style={{ background: statusColor, width: '64px', height: '64px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <i className={`fa-solid ${statusIcon}`} style={{ color: 'white', fontSize: '32px' }}></i>
              </div>
              <div>
                <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--text-primary)', marginBottom: '4px' }}>
                  {statusTitle}
                </h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
                  SmartGrama AI Evaluation Complete
                </p>
              </div>
            </div>

            <div style={{ background: 'var(--background)', borderRadius: '12px', padding: '24px', marginBottom: '32px', borderLeft: `4px solid ${statusColor}` }}>
              <div style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--text-secondary)', marginBottom: '8px', textTransform: 'uppercase' }}>AI Reasoning</div>
              <div style={{ fontSize: '15px', color: 'var(--text-primary)', lineHeight: 1.5 }}>
                {prediction.reason}
              </div>
            </div>

            <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '24px', color: 'var(--text-primary)' }}>Detailed Assessment</h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '32px' }}>
              <div style={{ border: '1px solid var(--border)', borderRadius: '12px', padding: '20px' }}>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '8px' }}>Predicted Risk Profile</div>
                <div style={{ fontSize: '18px', fontWeight: 'bold', color: riskColor, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <i className="fa-solid fa-shield-cat"></i> {riskLevel}
                </div>
              </div>
              <div style={{ border: '1px solid var(--border)', borderRadius: '12px', padding: '20px' }}>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '8px' }}>Requested Amount</div>
                <div style={{ fontSize: '18px', fontWeight: 'bold', color: 'var(--text-primary)' }}>
                  Rs. {Number(prediction.requested_loan_amount || 0).toLocaleString()}
                </div>
              </div>
            </div>

            {/* Blockchain Action */}
            <div style={{ marginTop: 'auto', borderTop: '1px solid var(--border)', paddingTop: '32px' }}>
                {!txReceipt ? (
                  <div style={{ display: 'flex', gap: '16px' }}>
                    <button 
                      onClick={handleRecordBlockchain}
                      disabled={isRecording}
                      style={{ flex: 1, background: 'var(--success)', color: 'white', border: 'none', padding: '16px', borderRadius: '8px', fontSize: '15px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                    >
                      {isRecording ? "Processing..." : <>Accept Suggestion</>}
                    </button>
                    <button 
                      onClick={() => navigate("/")}
                      disabled={isRecording}
                      style={{ flex: 1, background: 'white', color: 'var(--error, #ef4444)', border: '1px solid var(--error, #ef4444)', padding: '16px', borderRadius: '8px', fontSize: '15px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                    >
                      Reject Application
                    </button>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div style={{ padding: '16px', background: '#fffbeb', borderRadius: '8px', border: '1px solid #f59e0b' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#d97706', fontWeight: 'bold', marginBottom: '8px' }}>
                        <i className="fa-solid fa-clock"></i> Application Pending Officer Review
                      </div>
                      <div style={{ fontSize: '12px', color: '#b45309', wordBreak: 'break-all', fontFamily: 'monospace' }}>
                        Tracking ID: {txReceipt.tx_hash}
                      </div>
                    </div>
                    <button 
                      style={{ background: 'var(--accent)', color: 'white', border: 'none', padding: '16px', borderRadius: '8px', width: '100%', fontSize: '15px', fontWeight: 'bold', cursor: 'pointer' }}
                      onClick={() => navigate("/wallet")}
                    >
                      View in Wallet
                    </button>
                  </div>
                )}
            </div>
          </div>

          {/* Right Panel: Final Offer Terms */}
          <div style={{ height: 'fit-content', position: 'sticky', top: '100px' }}>
            <div style={{ background: 'var(--primary-light)', borderRadius: 'var(--radius-lg)', padding: '40px 32px', border: '1px solid #d8b4fe' }}>
                <div style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--text-secondary)', letterSpacing: '0.5px', marginBottom: '24px' }}>FINAL APPROVED TERMS</div>
                
                <div style={{ marginBottom: '24px' }}>
                  <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '4px' }}>Approved Amount</div>
                  <div style={{ fontSize: '32px', fontWeight: 'bold', color: 'var(--primary)' }}>
                    Rs. {Number(prediction.recommended_loan_amount || 0).toLocaleString()}
                  </div>
                </div>
                
                <div style={{ borderTop: '1px solid #d8b4fe', paddingTop: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Monthly EMI</span>
                    <span style={{ fontSize: '16px', fontWeight: 'bold', color: 'var(--text-primary)' }}>Rs. {Number(prediction.suggested_monthly_installment || 0).toLocaleString()}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Duration</span>
                    <span style={{ fontSize: '16px', fontWeight: 'bold', color: 'var(--text-primary)' }}>{prediction.estimated_repayment_duration_months || 12} months</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Interest Rate</span>
                    <span style={{ fontSize: '16px', fontWeight: 'bold', color: 'var(--text-primary)' }}>{application?.interest_rate || 12}% APR</span>
                  </div>
                </div>
            </div>
          </div>

        </div>
      </main>
    </>
  );
}