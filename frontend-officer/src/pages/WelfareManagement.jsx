import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function WelfareManagement() {
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchApplications = () => {
    fetch("http://127.0.0.1:8000/applications/all")
      .then(res => res.json())
      .then(data => {
        setApplications(data.welfare || []);
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

  const handleReview = async (assessmentId, action) => {
    try {
      if (action === "approve") {
        // 1. Anchor eligibility verdict to blockchain ledger (Zero-PII)
        try {
          await fetch(`http://127.0.0.1:5001/api/welfare/aswesuma/applications/${assessmentId}/eligibility/blockchain`, {
            method: "POST",
            headers: { "Content-Type": "application/json" }
          });
        } catch (bcErr) {
          console.warn("Blockchain anchoring notice:", bcErr);
        }

        // 2. Transition benefit lifecycle state to BENEFIT_ACTIVATED
        try {
          await fetch(`http://127.0.0.1:5001/api/welfare/aswesuma/applications/${assessmentId}/lifecycle`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              event: "BENEFIT_ACTIVATED",
              officerId: "OFFICER-PROTOTYPE-001",
              reason: "Approved & verified by Divisional Secretariat"
            })
          });
        } catch (lcErr) {
          console.warn("Lifecycle transition notice:", lcErr);
        }
      }

      // 3. Update status in Python backend
      const res = await fetch(`http://127.0.0.1:8000/welfare/${assessmentId}/review`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action })
      });
      if (res.ok) fetchApplications();
    } catch(err) {
      console.error(err);
      alert("Failed to update status");
    }
  };

  const pendingApps = applications.filter(a => a.status.startsWith('Eligible') || a.status.includes('Pending'));

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 20px' }}>
      
      <div className="card" style={{ padding: 0, overflow: 'hidden', backgroundColor: 'white', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
        <div className="card-header bg-gray-50 m-0" style={{ padding: '24px 32px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 className="card-title m-0 text-xl" style={{ color: '#1f2937', fontWeight: 'bold' }}>Pending Welfare Applications</h2>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <span 
              onClick={() => navigate("/")} 
              style={{ backgroundColor: 'white', border: '1px solid #d1d5db', color: '#4b5563', padding: '6px 16px', borderRadius: '9999px', fontSize: '14px', fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.2s' }}
              onMouseOver={(e) => e.target.style.backgroundColor = '#f3f4f6'}
              onMouseOut={(e) => e.target.style.backgroundColor = 'white'}
            >
              Loans
            </span>
            <span style={{ backgroundColor: '#dbeafe', color: '#1e40af', padding: '6px 16px', borderRadius: '9999px', fontSize: '14px', fontWeight: 'bold', cursor: 'pointer' }}>
              Welfare ({pendingApps.length})
            </span>
          </div>
        </div>

        <div style={{ padding: '32px' }}>
          {loading ? (
            <p style={{ textAlign: 'center', color: '#6b7280', padding: '40px 0', fontSize: '18px' }}>Loading welfare requests...</p>
          ) : pendingApps.length === 0 ? (
            <div style={{ backgroundColor: '#f9fafb', padding: '40px', borderRadius: '12px', border: '1px dashed #d1d5db', textAlign: 'center', color: '#6b7280', fontSize: '18px' }}>
              No pending welfare applications for review.
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
                    <span style={{ backgroundColor: '#fef3c7', color: '#92400e', fontSize: '12px', fontWeight: 'bold', padding: '6px 12px', borderRadius: '9999px', border: '1px solid #fde68a' }}>Aswesuma Assessment</span>
                  </div>

                  <div style={{ backgroundColor: '#f9fafb', padding: '20px', borderRadius: '12px', border: '1px solid #f3f4f6', marginBottom: '24px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', fontSize: '14px' }}>
                      <span style={{ color: '#6b7280' }}>GN Division:</span>
                      <span style={{ fontWeight: 'bold', color: '#1f2937' }}>{app.gn_division}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', fontSize: '14px' }}>
                      <span style={{ color: '#6b7280' }}>Poverty Score:</span>
                      <span style={{ fontWeight: 'bold', color: app.welfare_score >= 55 ? '#ea580c' : '#eab308' }}>
                        {app.welfare_score} / 100
                      </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', fontSize: '14px' }}>
                      <span style={{ color: '#6b7280' }}>Eligible Tier:</span>
                      <span style={{ fontWeight: 'bold', color: '#1f2937' }}>{app.tier}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', paddingTop: '12px', borderTop: '1px solid #e5e7eb' }}>
                      <span style={{ color: '#6b7280', fontWeight: '500' }}>Recommended Stipend:</span>
                      <span style={{ fontWeight: 'bold', color: '#10b981', fontSize: '18px' }}>Rs. {app.monthly_stipend?.toLocaleString()} / mo</span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '12px', marginTop: 'auto' }}>
                    <button 
                      onClick={() => handleReview(app.assessment_id, 'approve')}
                      style={{ flex: 1, backgroundColor: '#10b981', color: 'white', padding: '12px', borderRadius: '8px', fontWeight: 'bold', border: 'none', cursor: 'pointer', transition: 'background-color 0.2s' }}
                      onMouseOver={(e) => e.target.style.backgroundColor = '#059669'}
                      onMouseOut={(e) => e.target.style.backgroundColor = '#10b981'}
                    >
                      <i className="fa-solid fa-check" style={{ marginRight: '8px' }}></i> Approve Stipend
                    </button>
                    <button 
                      onClick={() => handleReview(app.assessment_id, 'reject')}
                      style={{ flex: 1, backgroundColor: 'white', color: '#dc2626', border: '1px solid #fca5a5', padding: '12px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', transition: 'background-color 0.2s' }}
                      onMouseOver={(e) => e.target.style.backgroundColor = '#fef2f2'}
                      onMouseOut={(e) => e.target.style.backgroundColor = 'white'}
                    >
                      <i className="fa-solid fa-xmark" style={{ marginRight: '8px' }}></i> Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
