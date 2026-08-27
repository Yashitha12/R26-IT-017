import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function AdminLogin() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ username: "", password: "" });
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
      const res = await fetch("http://127.0.0.1:8000/auth/admin-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.detail || "Login failed");

      // Store admin token and officer details
      localStorage.setItem("admin_token", data.token);
      localStorage.setItem("officer_data", JSON.stringify(data.officer));
      navigate("/");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: '#f9fafb', padding: '40px 20px' }}>
      <div style={{ backgroundColor: 'white', padding: '40px', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', width: '100%', maxWidth: '400px', borderTop: '4px solid #1e40af' }}>
        
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ backgroundColor: '#1e40af', color: 'white', width: '64px', height: '64px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontSize: '28px' }}>
            <i className="fa-solid fa-shield-halved"></i>
          </div>
          <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827' }}>Officer Portal</h1>
          <p style={{ color: '#6b7280', fontSize: '14px', marginTop: '8px' }}>Secure Administrative Access</p>
        </div>

        {error && <div style={{ backgroundColor: '#fee2e2', color: '#dc2626', padding: '12px', borderRadius: '8px', marginBottom: '24px', fontSize: '14px', textAlign: 'center' }}>{error}</div>}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          <div>
            <label style={{ display: 'block', fontSize: '14px', color: '#4b5563', marginBottom: '4px', fontWeight: 'bold' }}>Admin ID</label>
            <input type="text" name="username" value={formData.username} onChange={handleChange} required style={inputStyle} />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '14px', color: '#4b5563', marginBottom: '4px', fontWeight: 'bold' }}>Password</label>
            <input type="password" name="password" value={formData.password} onChange={handleChange} required style={inputStyle} />
          </div>

          <div style={{ marginTop: '16px' }}>
            <button type="submit" disabled={loading} style={{ width: '100%', backgroundColor: '#1e40af', color: 'white', padding: '14px', borderRadius: '8px', fontWeight: 'bold', border: 'none', cursor: loading ? 'not-allowed' : 'pointer', fontSize: '16px', opacity: loading ? 0.7 : 1 }}>
              {loading ? "Authenticating..." : "Login to Dashboard"}
            </button>
          </div>

        </form>

        <p style={{ textAlign: 'center', marginTop: '24px', fontSize: '14px', color: '#6b7280' }}>
          New Officer? <a href="#" onClick={(e) => { e.preventDefault(); navigate("/register"); }} style={{ color: '#2563eb', fontWeight: 'bold', textDecoration: 'none' }}>Create an account</a>
        </p>
      </div>
    </div>
  );
}

const inputStyle = {
  width: '100%',
  padding: '12px',
  borderRadius: '8px',
  border: '1px solid #d1d5db',
  backgroundColor: '#f3f4f6',
  fontSize: '14px'
};
