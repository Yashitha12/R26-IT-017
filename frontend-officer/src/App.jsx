import { useState, useEffect } from "react";
import Header from "./components/Header";
import { updateApplicationStatus } from "./api/loanApi";

export default function App() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchApplications = () => {
    fetch("http://127.0.0.1:8000/applications/all")
      .then(res => res.json())
      .then(data => {
        setApplications(data.loans || []);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const handleReview = async (txHash, action) => {
    try {
      await updateApplicationStatus(txHash, action);
      fetchApplications();
    } catch(err) {
      alert("Failed to update status");
    }
  };

  const pendingApps = applications.filter(a => a.status === 'Pending');

  return (
    <div style={{ backgroundColor: '#f9fafb', minHeight: '100vh', paddingBottom: '40px' }}>
      <Header title="Officer Dashboard" />

      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 20px' }}>
        
        <div className="card" style={{ padding: 0, overflow: 'hidden', backgroundColor: 'white', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
          <div className="card-header bg-gray-50 m-0" style={{ padding: '24px 32px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 className="card-title m-0 text-xl" style={{ color: '#1f2937', fontWeight: 'bold' }}>Pending Loan Applications</h2>
            <div style={{ display: 'flex', gap: '8px' }}>
              <span style={{ backgroundColor: '#dbeafe', color: '#1e40af', padding: '6px 16px', borderRadius: '9999px', fontSize: '14px', fontWeight: 'bold' }}>Loans</span>
              <span style={{ backgroundColor: 'white', border: '1px solid #d1d5db', color: '#4b5563', padding: '6px 16px', borderRadius: '9999px', fontSize: '14px', fontWeight: 'bold' }}>Welfare</span>
            </div>
          </div>

          <div style={{ padding: '32px' }}>
            {loading ? (
              <p style={{ textAlign: 'center', color: '#6b7280', padding: '40px 0', fontSize: '18px' }}>Loading applications...</p>
            ) : pendingApps.length === 0 ? (
              <div style={{ backgroundColor: '#f9fafb', padding: '40px', borderRadius: '12px', border: '1px dashed #d1d5db', textAlign: 'center', color: '#6b7280', fontSize: '18px' }}>
                No pending applications for review.
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: '24px' }}>
                {pendingApps.map((app, index) => (
                  <div key={index} style={{ border: '1px solid #e5e7eb', borderRadius: '16px', padding: '24px', backgroundColor: 'white', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
                      <div>
                        <h3 style={{ fontWeight: 'bold', fontSize: '20px', color: '#1f2937', marginBottom: '4px' }}>{app.applicant_name}</h3>
                        <p style={{ fontSize: '14px', color: '#6b7280', fontFamily: 'monospace', backgroundColor: '#f3f4f6', padding: '4px 8px', borderRadius: '4px', display: 'inline-block' }}>DID: {app.did}</p>
                      </div>
                      <span style={{ backgroundColor: '#fef3c7', color: '#92400e', fontSize: '12px', fontWeight: 'bold', padding: '6px 12px', borderRadius: '9999px', border: '1px solid #fde68a' }}>HITL Review</span>
                    </div>

                    <div style={{ backgroundColor: '#f9fafb', padding: '20px', borderRadius: '12px', border: '1px solid #f3f4f6', marginBottom: '24px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', fontSize: '14px' }}>
                        <span style={{ color: '#6b7280' }}>Loan Type:</span>
                        <span style={{ fontWeight: 'bold', color: '#1f2937' }}>{app.loan_type}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', fontSize: '14px' }}>
                        <span style={{ color: '#6b7280' }}>AI Risk Evaluation:</span>
                        <span style={{ fontWeight: 'bold', color: app.risk_level === 'Low Risk' ? '#16a34a' : '#ea580c' }}>
                          {app.risk_level}
                        </span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', fontSize: '14px' }}>
                        <span style={{ color: '#6b7280' }}>AI Recommendation:</span>
                        <span style={{ fontWeight: 'bold', color: '#1f2937' }}>{app.decision}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', paddingTop: '12px', borderTop: '1px solid #e5e7eb' }}>
                        <span style={{ color: '#6b7280', fontWeight: '500' }}>Approved Cap:</span>
                        <span style={{ fontWeight: 'bold', color: '#2563eb', fontSize: '18px' }}>Rs. {app.approved_amount?.toLocaleString()}</span>
                      </div>
                    </div>

                    <div style={{ marginBottom: '24px' }}>
                      <h4 style={{ fontSize: '12px', fontWeight: 'bold', color: '#6b7280', textTransform: 'uppercase', marginBottom: '8px' }}>Blockchain Consensus Status</h4>
                      <div style={{ backgroundColor: '#fffbeb', border: '1px solid #fde68a', color: '#92400e', fontSize: '12px', padding: '12px', borderRadius: '8px', fontFamily: 'monospace', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <span style={{ fontWeight: 'bold', color: '#b45309', display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <i className="fa-solid fa-clock"></i> {app.consensus_status}
                        </span>
                        <span style={{ wordBreak: 'break-all', opacity: 0.8 }}>Tx: {app.tx_hash}</span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '16px', marginTop: 'auto' }}>
                      <button 
                        onClick={() => handleReview(app.tx_hash, 'approve')}
                        style={{ flex: 1, backgroundColor: '#16a34a', color: 'white', fontWeight: 'bold', padding: '12px 16px', borderRadius: '12px', border: 'none', cursor: 'pointer', transition: 'background-color 0.2s' }}
                      >
                        Final Approve
                      </button>
                      <button 
                        onClick={() => handleReview(app.tx_hash, 'reject')}
                        style={{ flex: 1, backgroundColor: 'white', border: '1px solid #fca5a5', color: '#dc2626', fontWeight: 'bold', padding: '12px 16px', borderRadius: '12px', cursor: 'pointer', transition: 'background-color 0.2s' }}
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
