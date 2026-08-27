import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function OfficerManagement() {
  const [officers, setOfficers] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const officerData = JSON.parse(localStorage.getItem("officer_data") || "{}");
  const isSuperadmin = officerData.username === "superadmin";

  useEffect(() => {
    if (!isSuperadmin) {
      navigate("/"); // Only superadmin can access this
      return;
    }
    fetchOfficers();
  }, [isSuperadmin, navigate]);

  const fetchOfficers = async () => {
    try {
      const res = await fetch("http://127.0.0.1:8000/auth/officers");
      const data = await res.json();
      setOfficers(data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const ALL_RESPONSIBILITIES = [
    { id: "samupakara_loans", label: "Samupakara Loan Reviews" },
    { id: "samurdhi_loans", label: "Samurdhi Loan Reviews" },
    { id: "welfare_checking", label: "Aswesuma Welfare Checking" },
    { id: "wadihiti_dimana", label: "Elderly Allowance (Wadihiti)" },
    { id: "kyc_checking", label: "KYC & Identity Verification" },
    { id: "tickets_review", label: "Support Tickets Review" }
  ];

  const toggleResponsibility = async (username, responsibilityId, currentResponsibilities) => {
    if (username === "superadmin") return; // Superadmin cannot be demoted this easily

    const updatedResponsibilities = currentResponsibilities.includes(responsibilityId)
      ? currentResponsibilities.filter(r => r !== responsibilityId)
      : [...currentResponsibilities, responsibilityId];

    try {
      const res = await fetch(`http://127.0.0.1:8000/auth/officers/${username}/permissions`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ responsibilities: updatedResponsibilities })
      });
      if (res.ok) {
        setOfficers(officers.map(o => o.username === username ? { ...o, responsibilities: updatedResponsibilities } : o));
      }
    } catch (err) {
      alert("Failed to update permissions");
    }
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 20px' }}>
      <div className="card" style={{ padding: 0, overflow: 'hidden', backgroundColor: 'white', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
        <div className="card-header bg-gray-50 m-0" style={{ padding: '24px 32px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 className="card-title m-0 text-xl" style={{ color: '#1f2937', fontWeight: 'bold' }}>Manage Officer Permissions</h2>
        </div>

        <div style={{ padding: '32px' }}>
          {loading ? (
            <p style={{ textAlign: 'center', color: '#6b7280', padding: '40px 0', fontSize: '18px' }}>Loading officers...</p>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '24px' }}>
              {officers.map(officer => (
                <div key={officer.username} style={{ border: '1px solid #e5e7eb', borderRadius: '12px', padding: '24px', backgroundColor: officer.username === 'superadmin' ? '#f8fafc' : 'white', display: 'flex', flexDirection: 'column' }}>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e5e7eb', paddingBottom: '16px', marginBottom: '24px' }}>
                    <div>
                      <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#1f2937', marginBottom: '4px' }}>{officer.name}</h3>
                      <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>@{officer.username}</p>
                    </div>
                    {officer.username === "superadmin" && (
                      <span style={{ backgroundColor: '#fee2e2', color: '#991b1b', fontSize: '12px', fontWeight: 'bold', padding: '4px 12px', borderRadius: '9999px', border: '1px solid #fecaca' }}>Super Admin (Unrestricted)</span>
                    )}
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
                    {ALL_RESPONSIBILITIES.map(res => (
                      <label key={res.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', backgroundColor: '#f9fafb', borderRadius: '8px', border: '1px solid #f3f4f6', cursor: officer.username === 'superadmin' ? 'not-allowed' : 'pointer' }}>
                        <input 
                          type="checkbox" 
                          checked={officer.responsibilities.includes(res.id)}
                          disabled={officer.username === 'superadmin'}
                          onChange={() => toggleResponsibility(officer.username, res.id, officer.responsibilities)}
                          style={{ width: '20px', height: '20px', cursor: 'inherit' }}
                        />
                        <span style={{ fontSize: '14px', fontWeight: '500', color: officer.username === 'superadmin' ? '#9ca3af' : '#4b5563' }}>{res.label}</span>
                      </label>
                    ))}
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
