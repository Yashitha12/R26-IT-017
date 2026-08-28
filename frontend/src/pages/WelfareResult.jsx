import { useNavigate, useLocation } from "react-router-dom";
import Header from "../components/Header";

export default function WelfareResult() {
  const navigate = useNavigate();
  const location = useLocation();
  const result = location.state?.result || {
    applicationId: "ASW-2026-000001",
    welfare_score: 565.0,
    tier: "POOR",
    category: "POOR",
    monthly_stipend: 8500,
    status: "ELIGIBLE",
    applicant_name: "Aravinda Kumara",
    gn_division: "Minuwangoda North",
    did: "did:smartgrama:prototype:001"
  };

  const getTierColor = (cat) => {
    switch (cat) {
      case "SEVERELY_POOR":
        return { bg: "#fee2e2", text: "#991b1b", border: "#fca5a5" };
      case "POOR":
        return { bg: "#fef3c7", text: "#92400e", border: "#fde68a" };
      case "VULNERABLE":
        return { bg: "#e0e7ff", text: "#3730a3", border: "#c7d2fe" };
      case "TRANSITIONAL":
        return { bg: "#f3e8ff", text: "#6b21a8", border: "#e9d5ff" };
      default:
        return { bg: "#dcfce7", text: "#166534", border: "#86efac" };
    }
  };

  const tierColors = getTierColor(result.category || result.tier);

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
          color: "var(--text-secondary)",
          fontSize: "13px",
          cursor: "pointer",
        }}
        onClick={() => navigate(-1)}
      >
        <i className="fa-solid fa-arrow-left"></i>
        <span>Welfare Application</span>
      </div>

      <main
        className="content-container flex justify-center items-center"
        style={{ minHeight: "calc(100vh - 120px)", padding: "24px" }}
      >
        <div
          className="card"
          style={{
            maxWidth: 560,
            width: "100%",
            padding: "36px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
            boxShadow: "var(--shadow-md)",
            borderRadius: "16px",
          }}
        >
          <div
            style={{
              background: "#dcfce7",
              width: "64px",
              height: "64px",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: "20px",
            }}
          >
            <i className="fa-solid fa-check" style={{ color: "var(--success)", fontSize: "32px" }}></i>
          </div>

          <h2
            style={{
              fontSize: "22px",
              fontWeight: "bold",
              color: "var(--text-primary)",
              marginBottom: "6px",
            }}
          >
            Aswesuma Assessment Certified
          </h2>

          <p
            style={{
              color: "var(--text-secondary)",
              fontSize: "13px",
              marginBottom: "24px",
              maxWidth: "380px",
            }}
          >
            Your multi-dimensional Proxy Means Test (PMT) eligibility score has been evaluated and registered for officer review.
          </p>

          <div
            style={{
              background: "var(--background)",
              width: "100%",
              borderRadius: "12px",
              padding: "20px",
              marginBottom: "20px",
              border: "1px solid var(--border)",
              textAlign: "left",
              display: "flex",
              flexDirection: "column",
              gap: "12px",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>Application ID:</span>
              <span style={{ fontFamily: "monospace", fontWeight: "bold", color: "var(--text-primary)", fontSize: "13px" }}>
                {result.applicationId || result.assessment_id}
              </span>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>Verified DID:</span>
              <span style={{ fontFamily: "monospace", fontSize: "11px", backgroundColor: "#f1f5f9", padding: "2px 6px", borderRadius: "4px" }}>
                {result.did}
              </span>
            </div>

            <div style={{ height: "1px", background: "var(--border)", margin: "4px 0" }}></div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: "13px", fontWeight: "600", color: "var(--text-secondary)" }}>PMT Poverty Score:</span>
              <span style={{ fontSize: "20px", fontWeight: "bold", color: "#ea580c" }}>
                {result.welfare_score} pts
              </span>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: "13px", fontWeight: "600", color: "var(--text-secondary)" }}>Category Tier:</span>
              <span
                style={{
                  backgroundColor: tierColors.bg,
                  color: tierColors.text,
                  border: `1px solid ${tierColors.border}`,
                  padding: "4px 10px",
                  borderRadius: "12px",
                  fontSize: "12px",
                  fontWeight: "bold",
                }}
              >
                {result.category || result.tier}
              </span>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: "13px", fontWeight: "600", color: "var(--text-secondary)" }}>Eligible Monthly Stipend:</span>
              <span style={{ fontSize: "20px", fontWeight: "bold", color: "var(--success)" }}>
                Rs. {Number(result.monthly_stipend || 0).toLocaleString()}
              </span>
            </div>
          </div>

          <div
            style={{
              padding: "14px 16px",
              background: "#eff6ff",
              borderRadius: "8px",
              border: "1px solid #bfdbfe",
              color: "#1e40af",
              fontSize: "12px",
              width: "100%",
              textAlign: "left",
              marginBottom: "24px",
            }}
          >
            <i className="fa-solid fa-shield-halved" style={{ marginRight: "6px" }}></i>
            Zero-PII verification proof will be anchored to the blockchain ledger upon Divisional Secretariat review.
          </div>

          <div style={{ width: "100%" }}>
            <button
              onClick={() => navigate("/welfare")}
              style={{
                background: "var(--success)",
                color: "white",
                border: "none",
                padding: "14px",
                borderRadius: "8px",
                width: "100%",
                fontSize: "15px",
                fontWeight: "bold",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              Back to Welfare Home
            </button>
          </div>
        </div>
      </main>
    </>
  );
}
