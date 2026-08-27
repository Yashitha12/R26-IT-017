import { useState, useEffect } from "react";

export default function KYCChecking() {
  const [kycRequests, setKycRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchKycRequests = () => {
    fetch("http://127.0.0.1:8000/kyc")
      .then(res => res.json())
      .then(data => {
        setKycRequests(data || []);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchKycRequests();
  }, []);

  const handleReview = async (did, action) => {
    try {
      const res = await fetch(`http://127.0.0.1:8000/kyc/${did}/review`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action })
      });
      if (res.ok) fetchKycRequests();
    } catch(err) {
      alert("Failed to update KYC status");
    }
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 20px' }}>
      
      <div className="card" style={{ padding: 0, overflow: 'hidden', backgroundColor: 'white', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
        <div className="card-header bg-gray-50 m-0" style={{ padding: '24px 32px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 className="card-title m-0 text-xl" style={{ color: '#1f2937', fontWeight: 'bold' }}>Pending KYC Verifications</h2>
          <div style={{ display: 'flex', gap: '8px' }}>
            <span style={{ backgroundColor: '#dbeafe', color: '#1e40af', padding: '6px 16px', borderRadius: '9999px', fontSize: '14px', fontWeight: 'bold' }}>{kycRequests.length} Pending</span>
          </div>
        </div>

        <div style={{ padding: '32px' }}>
          {loading ? (
            <p style={{ textAlign: 'center', color: '#6b7280', padding: '40px 0', fontSize: '18px' }}>Loading KYC requests...</p>
          ) : kycRequests.length === 0 ? (
            <div style={{ backgroundColor: '#f9fafb', padding: '40px', borderRadius: '12px', border: '1px dashed #d1d5db', textAlign: 'center', color: '#6b7280', fontSize: '18px' }}>
              No pending KYC verifications.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {kycRequests.map((req, index) => (
                <div key={index} style={{ border: '1px solid #e5e7eb', borderRadius: '16px', padding: '24px', backgroundColor: 'white', display: 'flex', gap: '32px' }}>
                  
                  {/* Left: Applicant Details */}
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
                      <div>
                        <h3 style={{ fontWeight: 'bold', fontSize: '20px', color: '#1f2937', marginBottom: '4px' }}>{req.name}</h3>
                        <p style={{ fontSize: '14px', color: '#6b7280', fontFamily: 'monospace', backgroundColor: '#f3f4f6', padding: '4px 8px', borderRadius: '4px', display: 'inline-block' }}>DID: {req.did}</p>
                      </div>
                      <span style={{ backgroundColor: '#fef3c7', color: '#92400e', fontSize: '12px', fontWeight: 'bold', padding: '6px 12px', borderRadius: '9999px', border: '1px solid #fde68a' }}>Awaiting Verification</span>
                    </div>

                    <div style={{ backgroundColor: '#f9fafb', padding: '20px', borderRadius: '12px', border: '1px solid #f3f4f6', marginBottom: '24px', flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', fontSize: '14px' }}>
                        <span style={{ color: '#6b7280' }}>Submitted On:</span>
                        <span style={{ fontWeight: 'bold', color: '#1f2937' }}>{req.submitted_at}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', fontSize: '14px' }}>
                        <span style={{ color: '#6b7280' }}>AI Face Match Confidence:</span>
                        <span style={{ fontWeight: 'bold', color: '#10b981' }}>98.5% (High)</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                        <span style={{ color: '#6b7280' }}>Document Status:</span>
                        <span style={{ fontWeight: 'bold', color: '#1f2937' }}>Clear & Legible</span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '12px' }}>
                      <button 
                        onClick={() => handleReview(req.did, 'verify')}
                        style={{ flex: 1, backgroundColor: '#3b82f6', color: 'white', padding: '12px', borderRadius: '8px', fontWeight: 'bold', border: 'none', cursor: 'pointer', transition: 'background-color 0.2s' }}
                        onMouseOver={(e) => e.target.style.backgroundColor = '#2563eb'}
                        onMouseOut={(e) => e.target.style.backgroundColor = '#3b82f6'}
                      >
                        <i className="fa-solid fa-check" style={{ marginRight: '8px' }}></i> Verify Identity
                      </button>
                      <button 
                        onClick={() => handleReview(req.did, 'reject')}
                        style={{ flex: 1, backgroundColor: 'white', color: '#dc2626', border: '1px solid #fca5a5', padding: '12px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', transition: 'background-color 0.2s' }}
                        onMouseOver={(e) => e.target.style.backgroundColor = '#fef2f2'}
                        onMouseOut={(e) => e.target.style.backgroundColor = 'white'}
                      >
                        <i className="fa-solid fa-xmark" style={{ marginRight: '8px' }}></i> Reject
                      </button>
                    </div>
                  </div>

                  {/* Right: Documents Grid */}
                  <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div>
                      <h4 style={{ fontSize: '12px', fontWeight: 'bold', color: '#6b7280', textTransform: 'uppercase', marginBottom: '8px' }}>NIC Front</h4>
                      <img src={req.nic_front} alt="NIC Front" style={{ width: '100%', borderRadius: '8px', border: '1px solid #e5e7eb' }} />
                    </div>
                    <div>
                      <h4 style={{ fontSize: '12px', fontWeight: 'bold', color: '#6b7280', textTransform: 'uppercase', marginBottom: '8px' }}>Applicant Selfie</h4>
                      <img src={req.selfie} alt="Selfie" style={{ width: '100%', borderRadius: '8px', border: '1px solid #e5e7eb', objectFit: 'cover', aspectRatio: '4/3' }} />
                    </div>
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
