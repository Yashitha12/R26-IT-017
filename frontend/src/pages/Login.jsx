import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ identifier: "user-prototype-001" });
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
      const inputId = formData.identifier.trim();
      let userData = null;
      let did = null;
      let kycStatus = "PENDING";

      // 1. Try querying registration profile by User ID (Port 5001)
      try {
        const regRes = await fetch(`http://127.0.0.1:5001/api/registration/${inputId}`);
        if (regRes.ok) {
          const regJson = await regRes.json();
          userData = regJson.data;
        }
      } catch (_) {}

      // 2. Query Digital Identity & Verifiable Credentials (Port 5001)
      try {
        const idRes = await fetch(`http://127.0.0.1:5001/api/identity/user/${inputId}`);
        if (idRes.ok) {
          const idJson = await idRes.json();
          if (idJson.data?.did) {
            did = idJson.data.did;
            kycStatus = idJson.data.status || "VERIFIED";
          }
        }
      } catch (_) {}

      // If user data not found via registration lookup, check default/prototype identities
      if (!userData) {
        if (inputId.startsWith("did:")) {
          did = inputId;
          kycStatus = "VERIFIED";
        }
        userData = {
          name: inputId === "user-prototype-001" ? "Aravinda Kumara" : (formData.name || "Citizen Resident"),
          nic: inputId === "user-prototype-001" ? "200223003053" : inputId,
          memberId: inputId,
          district: "Gampaha",
          gnDivision: "Minuwangoda North",
          address: "45/A, Jayawickrama Road",
        };
      }

      const userSession = {
        name: userData.name || "Citizen Resident",
        nic: userData.nic || "200223003053",
        memberId: userData.userId || inputId,
        district: userData.district || "Gampaha",
        gnDivision: userData.gnDivision || "Minuwangoda North",
        address: userData.address || "45/A, Jayawickrama Road",
        phone: userData.phone || "+94 78 145 3248",
        email: userData.email || "citizen@example.com",
        did: did || "did:smartgrama:prototype:001",
        kycStatus: kycStatus || "VERIFIED",
      };

      // Store user session in localStorage
      localStorage.setItem("user", JSON.stringify(userSession));
      if (kycStatus === "VERIFIED") {
        navigate("/dashboard");
      } else {
        navigate("/identity");
      }
    } catch (err) {
      setError(err.message || "Failed to log in");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh", backgroundColor: "#f3f4f6", padding: "40px 20px" }}>
      <div style={{ backgroundColor: "white", padding: "40px", borderRadius: "16px", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)", width: "100%", maxWidth: "440px" }}>
        
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <div style={{ backgroundColor: "#2563eb", color: "white", width: "64px", height: "64px", borderRadius: "16px", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", fontSize: "28px" }}>
            <i className="fa-solid fa-fingerprint"></i>
          </div>
          <h1 style={{ fontSize: "24px", fontWeight: "bold", color: "#1f2937" }}>SmartGrama Citizen Portal</h1>
          <p style={{ color: "#6b7280", fontSize: "14px", marginTop: "8px" }}>Decentralized Digital Identity & Citizen Sign-In</p>
        </div>

        {error && <div style={{ backgroundColor: "#fee2e2", color: "#dc2626", padding: "12px", borderRadius: "8px", marginBottom: "24px", fontSize: "14px", textAlign: "center" }}>{error}</div>}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
          
          <div>
            <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#374151", marginBottom: "6px" }}>
              Citizen User ID, NIC, or Verified DID *
            </label>
            <input
              type="text"
              name="identifier"
              value={formData.identifier}
              onChange={handleChange}
              placeholder="e.g. user-prototype-001 or 200223003053"
              required
              style={inputStyle}
            />
            <div style={{ fontSize: "12px", color: "#6b7280", marginTop: "4px" }}>
              Demo IDs: <code style={{ backgroundColor: "#f1f5f9", padding: "2px 4px", borderRadius: "4px" }}>user-prototype-001</code>, <code style={{ backgroundColor: "#f1f5f9", padding: "2px 4px", borderRadius: "4px" }}>user-prototype-002</code>
            </div>
          </div>

          <div style={{ marginTop: "12px" }}>
            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%",
                backgroundColor: "#2563eb",
                color: "white",
                padding: "14px",
                borderRadius: "8px",
                fontWeight: "bold",
                border: "none",
                cursor: loading ? "not-allowed" : "pointer",
                fontSize: "15px",
                opacity: loading ? 0.7 : 1,
              }}
            >
              {loading ? "Verifying Digital Identity..." : "Sign In with Digital Identity →"}
            </button>
          </div>

          <div style={{ textAlign: "center", marginTop: "16px", fontSize: "14px", color: "#4b5563" }}>
            New citizen? <Link to="/register" style={{ color: "#2563eb", fontWeight: "bold", textDecoration: "none" }}>Register & Biometric KYC</Link>
          </div>

        </form>
      </div>
    </div>
  );
}

const inputStyle = {
  width: "100%",
  padding: "12px",
  borderRadius: "8px",
  border: "1px solid #d1d5db",
  backgroundColor: "#f9fafb",
  fontSize: "14px",
};
