import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import { getCurrentUser } from "../utils/user";

export default function Profile() {
  const navigate = useNavigate();
  const user = getCurrentUser();

  if (!user) {
    navigate("/login");
    return null;
  }

  const {
    name = "Member",
    nic = "—",
    memberId = "—",
    mobile = "—",
    email = "—",
    address = "—",
    district = "—",
    occupation = "—",
    dob = "—",
    gender = "—",
  } = user;

  return (
    <>
      <Header />
      <div
        style={{
          paddingLeft: "40px",
          paddingTop: "16px",
          display: "flex",
          alignItems: "center",
          gap: "8px",
          color: "var(--text-primary)",
          fontSize: "20px",
          fontWeight: "bold",
        }}
      >
        My Profile
      </div>

      <main className="content-container">
        <div className="dashboard-grid" style={{ gridTemplateColumns: "320px 1fr", gap: "32px" }}>
          {/* Left: Identity Card */}
          <div
            style={{
              background: "var(--primary)",
              borderRadius: "16px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              padding: "48px 24px 32px 24px",
              color: "white",
            }}
          >
            <div
              style={{
                width: "80px",
                height: "80px",
                borderRadius: "50%",
                background: "rgba(255,255,255,0.2)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: "24px",
              }}
            >
              <i className="fa-solid fa-user" style={{ fontSize: "32px" }}></i>
            </div>

            <h2 style={{ fontSize: "20px", fontWeight: "bold", marginBottom: "4px" }}>{name}</h2>
            <div style={{ fontSize: "13px", opacity: 0.8, marginBottom: "48px" }}>NIC: {nic}</div>

            <div
              style={{
                background: "rgba(255,255,255,0.1)",
                width: "100%",
                borderRadius: "12px",
                padding: "16px",
                display: "flex",
                flexDirection: "column",
                gap: "12px",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px" }}>
                <span style={{ opacity: 0.8 }}>DID</span>
                <span style={{ fontWeight: "bold", fontSize: "11px", fontFamily: "monospace" }}>{user?.did || "did:smartgrama:prototype:001"}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px" }}>
                <span style={{ opacity: 0.8 }}>Member ID</span>
                <span style={{ fontWeight: "bold" }}>{memberId}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px" }}>
                <span style={{ opacity: 0.8 }}>District</span>
                <span style={{ fontWeight: "bold" }}>{district || "—"}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px" }}>
                <span style={{ opacity: 0.8 }}>KYC Status</span>
                <span style={{ fontWeight: "bold", color: "#4ade80" }}>
                  <i className="fa-solid fa-shield-check" style={{ marginRight: "4px" }}></i>
                  {user?.kycStatus || "VERIFIED"}
                </span>
              </div>
            </div>

            <button
              onClick={() => {
                localStorage.removeItem("user");
                navigate("/login");
              }}
              style={{
                marginTop: "24px",
                width: "100%",
                padding: "12px",
                backgroundColor: "rgba(239, 68, 68, 0.2)",
                color: "#fca5a5",
                border: "1px solid rgba(239, 68, 68, 0.5)",
                borderRadius: "8px",
                fontWeight: "bold",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                transition: "background-color 0.2s"
              }}
              onMouseOver={(e) => e.target.style.backgroundColor = "rgba(239, 68, 68, 0.4)"}
              onMouseOut={(e) => e.target.style.backgroundColor = "rgba(239, 68, 68, 0.2)"}
            >
              <i className="fa-solid fa-arrow-right-from-bracket"></i>
              Logout
            </button>
          </div>

          {/* Right: Info cards */}
          <div className="flex flex-col gap-6">
            <div className="card" style={{ padding: "24px" }}>
              <h3 style={{ fontSize: "14px", fontWeight: "bold", color: "var(--text-primary)", marginBottom: "16px" }}>
                Personal Information
              </h3>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <InfoItem label="Full Name" value={name} />
                <InfoItem label="NIC" value={nic} />
                <InfoItem label="Date of Birth" value={dob} />
                <InfoItem label="Gender" value={gender} />
                <InfoItem label="Mobile" value={mobile} />
                <InfoItem label="Email" value={email || "—"} />
                <InfoItem label="Address" value={address || "—"} full />
              </div>
            </div>

            <div className="card" style={{ padding: "24px" }}>
              <h3 style={{ fontSize: "14px", fontWeight: "bold", color: "var(--text-primary)", marginBottom: "16px" }}>
                Employment
              </h3>
              <InfoItem label="Occupation" value={occupation || "—"} />
            </div>
          </div>
        </div>
      </main>
    </>
  );
}

function InfoItem({ label, value, full }) {
  return (
    <div
      style={{
        background: "var(--background)",
        borderRadius: "12px",
        padding: "12px",
        gridColumn: full ? "1 / -1" : undefined,
      }}
    >
      <div style={{ fontSize: "11px", color: "var(--text-secondary)" }}>{label}</div>
      <div style={{ fontSize: "14px", fontWeight: "bold" }}>{value}</div>
    </div>
  );
}