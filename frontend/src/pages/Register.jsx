import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

export default function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    nic: "",
    dob: "",
    gender: "",
    mobile: "",
    email: "",
    address: "",
    district: "",
    occupation: "",
    username: "",
    password: "",
    securityQuestion: "",
    securityAnswer: ""
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("http://127.0.0.1:8000/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.detail || "Registration failed");

      // After registration, store to blockchain stub
      await fetch("http://127.0.0.1:8000/blockchain/store", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "member_registration", data: formData })
      });

      alert(`Registration Successful! Your Member ID is: ${data.memberId}`);
      navigate("/login");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: '#f3f4f6', padding: '40px 20px' }}>
      <div style={{ backgroundColor: 'white', padding: '40px', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', width: '100%', maxWidth: '600px' }}>
        
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ backgroundColor: '#2563eb', color: 'white', width: '64px', height: '64px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontSize: '28px' }}>
            <i className="fa-solid fa-user-plus"></i>
          </div>
          <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#1f2937' }}>Member Registration</h1>
          <p style={{ color: '#6b7280', fontSize: '14px', marginTop: '8px' }}>Join SmartGrama for Microloans & Welfare</p>
        </div>

        {error && <div style={{ backgroundColor: '#fee2e2', color: '#dc2626', padding: '12px', borderRadius: '8px', marginBottom: '24px', fontSize: '14px', textAlign: 'center' }}>{error}</div>}

        <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          
          <div style={{ gridColumn: '1 / -1' }}>
            <label style={{ display: 'block', fontSize: '14px', color: '#4b5563', marginBottom: '4px' }}>Full Name *</label>
            <input type="text" name="name" value={formData.name} onChange={handleChange} required style={inputStyle} />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '14px', color: '#4b5563', marginBottom: '4px' }}>NIC Number *</label>
            <input type="text" name="nic" value={formData.nic} onChange={handleChange} required style={inputStyle} />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '14px', color: '#4b5563', marginBottom: '4px' }}>Date of Birth *</label>
            <input type="date" name="dob" value={formData.dob} onChange={handleChange} required style={inputStyle} />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '14px', color: '#4b5563', marginBottom: '4px' }}>Gender</label>
            <select name="gender" value={formData.gender} onChange={handleChange} style={inputStyle}>
              <option value="">Select...</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '14px', color: '#4b5563', marginBottom: '4px' }}>Mobile Number *</label>
            <input type="text" name="mobile" value={formData.mobile} onChange={handleChange} required style={inputStyle} />
          </div>

          <div style={{ gridColumn: '1 / -1' }}>
            <label style={{ display: 'block', fontSize: '14px', color: '#4b5563', marginBottom: '4px' }}>Address</label>
            <input type="text" name="address" value={formData.address} onChange={handleChange} style={inputStyle} />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '14px', color: '#4b5563', marginBottom: '4px' }}>District</label>
            <input type="text" name="district" value={formData.district} onChange={handleChange} style={inputStyle} />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '14px', color: '#4b5563', marginBottom: '4px' }}>Occupation</label>
            <input type="text" name="occupation" value={formData.occupation} onChange={handleChange} style={inputStyle} />
          </div>

          <div style={{ gridColumn: '1 / -1', borderTop: '1px solid #e5e7eb', marginTop: '16px', paddingTop: '16px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 'bold', color: '#1f2937', marginBottom: '16px' }}>Account Security</h3>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '14px', color: '#4b5563', marginBottom: '4px' }}>Username *</label>
            <input type="text" name="username" value={formData.username} onChange={handleChange} required style={inputStyle} />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '14px', color: '#4b5563', marginBottom: '4px' }}>Password *</label>
            <input type="password" name="password" value={formData.password} onChange={handleChange} required style={inputStyle} />
          </div>

          <div style={{ gridColumn: '1 / -1', marginTop: '24px' }}>
            <button type="submit" disabled={loading} style={{ width: '100%', backgroundColor: '#2563eb', color: 'white', padding: '14px', borderRadius: '8px', fontWeight: 'bold', border: 'none', cursor: loading ? 'not-allowed' : 'pointer', fontSize: '16px', opacity: loading ? 0.7 : 1 }}>
              {loading ? "Registering..." : "Register"}
            </button>
          </div>

          <div style={{ gridColumn: '1 / -1', textAlign: 'center', marginTop: '16px', fontSize: '14px', color: '#4b5563' }}>
            Already have an account? <Link to="/login" style={{ color: '#2563eb', fontWeight: 'bold', textDecoration: 'none' }}>Login here</Link>
          </div>

        </form>
      </div>
    </div>
  );
}

const inputStyle = {
  width: '100%',
  padding: '10px 12px',
  borderRadius: '8px',
  border: '1px solid #d1d5db',
  backgroundColor: '#f9fafb',
  fontSize: '14px'
};
