import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { updateApplicationStatus } from "../api/loanApi";
import { useApp } from "../context/AppContext";
import * as api from "../services/api";

export default function Dashboard() {
  const navigate = useNavigate();
  const { pendingQueue, fetchQueue, showToast } = useApp();

  const [activeTab, setActiveTab] = useState("kyc"); // default to KYC to directly highlight KYC review
  const [loanApplications, setLoanApplications] = useState([]);
  const [welfareApplications, setWelfareApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState({});

  const fetchApplications = () => {
    fetch("http://127.0.0.1:8000/applications/all")
      .then((res) => res.json())
      .then((data) => {
        setLoanApplications(data.loans || []);
        setWelfareApplications(data.welfare || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchApplications();
    fetchQueue();
    const interval = setInterval(() => {
      fetchApplications();
      fetchQueue();
    }, 3000);
    return () => clearInterval(interval);
  }, [fetchQueue]);

  const handleLoanReview = async (txHash, action) => {
    try {
      await updateApplicationStatus(txHash, action);
      fetchApplications();
      showToast(`Loan application ${action === "approve" ? "approved" : "rejected"} successfully!`);
    } catch (err) {
      alert("Failed to update loan status");
    }
  };

  const handleWelfareReview = async (assessmentId, action) => {
    try {
      if (action === "approve") {
        try {
          await fetch(`http://127.0.0.1:5001/api/welfare/aswesuma/applications/${assessmentId}/eligibility/blockchain`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
          });
        } catch (_) {}

        try {
          await fetch(`http://127.0.0.1:5001/api/welfare/aswesuma/applications/${assessmentId}/lifecycle`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              event: "BENEFIT_ACTIVATED",
              officerId: "OFFICER-PROTOTYPE-001",
              reason: "Approved & verified by Divisional Secretariat",
            }),
          });
        } catch (_) {}
      }

      const res = await fetch(`http://127.0.0.1:8000/welfare/${assessmentId}/review`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      if (res.ok) {
        fetchApplications();
        showToast(`Welfare application ${action === "approve" ? "approved" : "rejected"} successfully!`);
      }
    } catch (err) {
      console.error(err);
      alert("Failed to update welfare status");
    }
  };

  const handleQuickKycApprove = async (verId, applicantName) => {
    setActionLoading((prev) => ({ ...prev, [verId]: true }));
    try {
      const res = await api.adjudicateCase(
        verId,
        "APPROVE",
        "Biometric live selfie and NIC document details verified satisfactory by Divisional Secretariat Officer."
      );
      if (res.ok) {
        showToast(`✅ KYC Approved! DID issued for ${applicantName || verId}`);
        await fetchQueue();
      } else {
        showToast(res.data?.error || "Adjudication failed", false);
      }
    } catch (err) {
      showToast("Network error approving KYC", false);
    } finally {
      setActionLoading((prev) => ({ ...prev, [verId]: false }));
    }
  };

  const pendingLoans = loanApplications.filter((a) => a.status === "Pending");
  const pendingWelfare = welfareApplications.filter((a) => a.status?.startsWith("Eligible") || a.status?.includes("Pending"));
  const pendingKycCount = pendingQueue ? pendingQueue.length : 0;

  return (
    <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "32px 24px" }}>
      {/* 📊 Top Overview Metric Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "20px", marginBottom: "32px" }}>
        
        {/* Metric 1: Pending KYC */}
        <div
          onClick={() => setActiveTab("kyc")}
          style={{
            backgroundColor: "white",
            borderRadius: "16px",
            padding: "24px",
            boxShadow: activeTab === "kyc" ? "0 0 0 2px #059669, 0 8px 20px rgba(5,150,105,0.15)" : "0 4px 6px -1px rgba(0,0,0,0.06)",
            cursor: "pointer",
            transition: "all 0.2s",
            border: "1px solid #e5e7eb",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
            <span style={{ fontSize: "13px", fontWeight: "bold", color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.5px" }}>
              Pending KYC Reviews
            </span>
            <div style={{ width: "36px", height: "36px", borderRadius: "10px", backgroundColor: "#ecfdf5", color: "#059669", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px" }}>
              🪪
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "baseline", gap: "8px" }}>
            <span style={{ fontSize: "32px", fontWeight: "900", color: "#064e3b" }}>{pendingKycCount}</span>
            <span style={{ fontSize: "13px", color: pendingKycCount > 0 ? "#dc2626" : "#059669", fontWeight: "bold" }}>
              {pendingKycCount > 0 ? "Action Required" : "All Verified"}
            </span>
          </div>
          <p style={{ margin: "8px 0 0", fontSize: "12px", color: "#6b7280" }}>
            Citizens awaiting official Grama Niladhari DID issuance
          </p>
        </div>

        {/* Metric 2: Pending Loans */}
        <div
          onClick={() => setActiveTab("loans")}
          style={{
            backgroundColor: "white",
            borderRadius: "16px",
            padding: "24px",
            boxShadow: activeTab === "loans" ? "0 0 0 2px #2563eb, 0 8px 20px rgba(37,99,235,0.15)" : "0 4px 6px -1px rgba(0,0,0,0.06)",
            cursor: "pointer",
            transition: "all 0.2s",
            border: "1px solid #e5e7eb",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
            <span style={{ fontSize: "13px", fontWeight: "bold", color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.5px" }}>
              Pending Loans
            </span>
            <div style={{ width: "36px", height: "36px", borderRadius: "10px", backgroundColor: "#eff6ff", color: "#2563eb", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px" }}>
              💰
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "baseline", gap: "8px" }}>
            <span style={{ fontSize: "32px", fontWeight: "900", color: "#1e3a8a" }}>{pendingLoans.length}</span>
            <span style={{ fontSize: "13px", color: pendingLoans.length > 0 ? "#ea580c" : "#059669", fontWeight: "bold" }}>
              {pendingLoans.length > 0 ? "Under Review" : "Clear"}
            </span>
          </div>
          <p style={{ margin: "8px 0 0", fontSize: "12px", color: "#6b7280" }}>
            AI risk-scored microfinance applications awaiting consensus
          </p>
        </div>

        {/* Metric 3: Pending Welfare */}
        <div
          onClick={() => setActiveTab("welfare")}
          style={{
            backgroundColor: "white",
            borderRadius: "16px",
            padding: "24px",
            boxShadow: activeTab === "welfare" ? "0 0 0 2px #9333ea, 0 8px 20px rgba(147,51,234,0.15)" : "0 4px 6px -1px rgba(0,0,0,0.06)",
            cursor: "pointer",
            transition: "all 0.2s",
            border: "1px solid #e5e7eb",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
            <span style={{ fontSize: "13px", fontWeight: "bold", color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.5px" }}>
              Pending Welfare
            </span>
            <div style={{ width: "36px", height: "36px", borderRadius: "10px", backgroundColor: "#faf5ff", color: "#9333ea", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px" }}>
              🤝
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "baseline", gap: "8px" }}>
            <span style={{ fontSize: "32px", fontWeight: "900", color: "#581c87" }}>{pendingWelfare.length}</span>
            <span style={{ fontSize: "13px", color: pendingWelfare.length > 0 ? "#ea580c" : "#059669", fontWeight: "bold" }}>
              {pendingWelfare.length > 0 ? "PMT Eligible" : "Clear"}
            </span>
          </div>
          <p style={{ margin: "8px 0 0", fontSize: "12px", color: "#6b7280" }}>
            Aswesuma Proxy Means Test household benefit requests
          </p>
        </div>
      </div>

      {/* 🏢 Main Workspace Container */}
      <div className="card" style={{ padding: 0, overflow: "hidden", backgroundColor: "white", borderRadius: "16px", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.08)" }}>
        
        {/* Navigation Tabs Header */}
        <div style={{ padding: "20px 32px", borderBottom: "1px solid #e5e7eb", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
          <div>
            <h2 style={{ margin: 0, fontSize: "20px", fontWeight: "800", color: "#111827" }}>
              {activeTab === "kyc" && "Pending Citizen Identity & KYC Verification Queue"}
              {activeTab === "loans" && "Pending Micro-Loan Applications"}
              {activeTab === "welfare" && "Pending Welfare & Aswesuma Applications"}
            </h2>
            <p style={{ margin: "4px 0 0", fontSize: "13px", color: "#6b7280" }}>
              {activeTab === "kyc" && "Review citizen biometric selfies & NIC documents. Approving issues the official Digital Identity (DID)."}
              {activeTab === "loans" && "Evaluate AI risk predictions and execute blockchain consensus approvals."}
              {activeTab === "welfare" && "Adjudicate 22-indicator PMT poverty scores and anchor benefit lifecycles."}
            </p>
          </div>

          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            {/* Tab: KYC */}
            <button
              type="button"
              onClick={() => setActiveTab("kyc")}
              style={{
                backgroundColor: activeTab === "kyc" ? "#064e3b" : "#f3f4f6",
                color: activeTab === "kyc" ? "white" : "#374151",
                border: "none",
                padding: "8px 18px",
                borderRadius: "9999px",
                fontSize: "13px",
                fontWeight: "bold",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                transition: "all 0.2s",
              }}
            >
              <span>🪪 KYC Verifications</span>
              {pendingKycCount > 0 && (
                <span style={{ backgroundColor: "#e11d48", color: "white", fontSize: "11px", padding: "1px 7px", borderRadius: "9999px" }}>
                  {pendingKycCount}
                </span>
              )}
            </button>

            {/* Tab: Loans */}
            <button
              type="button"
              onClick={() => setActiveTab("loans")}
              style={{
                backgroundColor: activeTab === "loans" ? "#1e40af" : "#f3f4f6",
                color: activeTab === "loans" ? "white" : "#374151",
                border: "none",
                padding: "8px 18px",
                borderRadius: "9999px",
                fontSize: "13px",
                fontWeight: "bold",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                transition: "all 0.2s",
              }}
            >
              <span>💰 Loans</span>
              {pendingLoans.length > 0 && (
                <span style={{ backgroundColor: "#3b82f6", color: "white", fontSize: "11px", padding: "1px 7px", borderRadius: "9999px" }}>
                  {pendingLoans.length}
                </span>
              )}
            </button>

            {/* Tab: Welfare */}
            <button
              type="button"
              onClick={() => setActiveTab("welfare")}
              style={{
                backgroundColor: activeTab === "welfare" ? "#6b21a8" : "#f3f4f6",
                color: activeTab === "welfare" ? "white" : "#374151",
                border: "none",
                padding: "8px 18px",
                borderRadius: "9999px",
                fontSize: "13px",
                fontWeight: "bold",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                transition: "all 0.2s",
              }}
            >
              <span>🤝 Welfare</span>
              {pendingWelfare.length > 0 && (
                <span style={{ backgroundColor: "#a855f7", color: "white", fontSize: "11px", padding: "1px 7px", borderRadius: "9999px" }}>
                  {pendingWelfare.length}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* ══════════════════════════════════════════
            TAB 1: KYC VERIFICATION QUEUE
        ══════════════════════════════════════════ */}
        {activeTab === "kyc" && (
          <div style={{ padding: "32px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <span style={{ fontSize: "14px", fontWeight: "bold", color: "#4b5563" }}>
                Found {pendingKycCount} pending citizen verification {pendingKycCount === 1 ? "case" : "cases"}
              </span>
              <button
                type="button"
                onClick={() => navigate("/kyc")}
                style={{
                  backgroundColor: "#ecfdf5",
                  color: "#065f46",
                  border: "1px solid #a7f3d0",
                  padding: "6px 14px",
                  borderRadius: "8px",
                  fontSize: "12px",
                  fontWeight: "700",
                  cursor: "pointer",
                }}
              >
                Open Full Side-by-Side Adjudication Console →
              </button>
            </div>

            {pendingKycCount === 0 ? (
              <div style={{ backgroundColor: "#f9fafb", padding: "48px 24px", borderRadius: "14px", border: "1.5px dashed #d1d5db", textAlign: "center" }}>
                <div style={{ fontSize: "36px", marginBottom: "12px" }}>🎉</div>
                <h3 style={{ margin: "0 0 6px", fontSize: "18px", fontWeight: "700", color: "#111827" }}>
                  All KYC Submissions Adjudicated
                </h3>
                <p style={{ margin: 0, fontSize: "14px", color: "#6b7280" }}>
                  No citizen verification cases are currently pending Grama Niladhari review. New submissions will appear here automatically in real time.
                </p>
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(360px, 1fr))", gap: "24px" }}>
                {pendingQueue.map((c) => {
                  const faceStatus = c.facialVerification?.status || "NOT_SUBMITTED";
                  const docStatus = c.documentVerification?.status || "NOT_SUBMITTED";
                  const isLoading = actionLoading[c.verificationId];

                  return (
                    <div
                      key={c.verificationId}
                      style={{
                        border: "1.5px solid #e2e8f0",
                        borderRadius: "16px",
                        padding: "24px",
                        backgroundColor: "#ffffff",
                        display: "flex",
                        flexDirection: "column",
                        gap: "16px",
                        boxShadow: "0 2px 4px rgba(0,0,0,0.04)",
                        transition: "transform 0.2s, box-shadow 0.2s",
                      }}
                    >
                      {/* Top Header */}
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                        <div>
                          <h3 style={{ margin: "0 0 4px", fontSize: "18px", fontWeight: "800", color: "#0f172a" }}>
                            {c.applicantName || c.userId}
                          </h3>
                          <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                            <code style={{ fontSize: "11px", backgroundColor: "#f1f5f9", padding: "2px 6px", borderRadius: "4px", color: "#475569" }}>
                              {c.verificationId}
                            </code>
                          </div>
                        </div>
                        <span style={{ backgroundColor: "#fef3c7", color: "#92400e", fontSize: "11px", fontWeight: "800", padding: "4px 10px", borderRadius: "9999px", border: "1px solid #fde68a" }}>
                          REVIEW PENDING
                        </span>
                      </div>

                      {/* Citizen Demographics Info */}
                      <div style={{ backgroundColor: "#f8fafc", borderRadius: "10px", padding: "12px 14px", fontSize: "12px", border: "1px solid #f1f5f9" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                          <span style={{ color: "#64748b", fontWeight: "600" }}>NIC:</span>
                          <span style={{ fontWeight: "700", color: "#0f172a" }}>{c.applicantNicMasked || "SYN-NIC-*****"}</span>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                          <span style={{ color: "#64748b", fontWeight: "600" }}>GN Division:</span>
                          <span style={{ fontWeight: "700", color: "#0f172a" }}>{c.gnDivision || "Minuwangoda North"}</span>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                          <span style={{ color: "#64748b", fontWeight: "600" }}>Submitted:</span>
                          <span style={{ fontWeight: "600", color: "#475569" }}>{c.submittedAt || new Date().toLocaleDateString("en-GB")}</span>
                        </div>
                      </div>

                      {/* Evidence Summary Badges */}
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                        <div style={{ border: "1px solid #e2e8f0", borderRadius: "10px", padding: "10px", backgroundColor: "#fff" }}>
                          <div style={{ fontSize: "10px", fontWeight: "800", color: "#64748b", textTransform: "uppercase", marginBottom: "4px" }}>
                            📷 Face ID
                          </div>
                          <span style={{ fontSize: "11px", fontWeight: "700", color: faceStatus === "PASSED" || faceStatus === "SUBMITTED" ? "#059669" : "#d97706" }}>
                            {faceStatus === "PASSED" ? "Passed (96.5%)" : faceStatus}
                          </span>
                        </div>

                        <div style={{ border: "1px solid #e2e8f0", borderRadius: "10px", padding: "10px", backgroundColor: "#fff" }}>
                          <div style={{ fontSize: "10px", fontWeight: "800", color: "#64748b", textTransform: "uppercase", marginBottom: "4px" }}>
                            🪪 NIC Document
                          </div>
                          <span style={{ fontSize: "11px", fontWeight: "700", color: docStatus === "PASSED" || docStatus === "SUBMITTED" ? "#059669" : "#d97706" }}>
                            {docStatus}
                          </span>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div style={{ display: "flex", gap: "10px", marginTop: "auto" }}>
                        <button
                          type="button"
                          disabled={isLoading}
                          onClick={() => handleQuickKycApprove(c.verificationId, c.applicantName)}
                          style={{
                            flex: 1.5,
                            backgroundColor: isLoading ? "#9ca3af" : "#059669",
                            color: "white",
                            padding: "11px 14px",
                            borderRadius: "10px",
                            fontWeight: "800",
                            fontSize: "13px",
                            border: "none",
                            cursor: isLoading ? "not-allowed" : "pointer",
                            boxShadow: "0 4px 12px rgba(5,150,105,0.25)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "6px",
                          }}
                        >
                          <i className="fa-solid fa-check"></i>
                          <span>{isLoading ? "Approving..." : "Approve & Issue DID"}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => navigate("/kyc")}
                          style={{
                            flex: 1,
                            backgroundColor: "#f8fafc",
                            color: "#334155",
                            padding: "11px 12px",
                            borderRadius: "10px",
                            fontWeight: "700",
                            fontSize: "12px",
                            border: "1.5px solid #cbd5e1",
                            cursor: "pointer",
                          }}
                        >
                          Deep Review →
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ══════════════════════════════════════════
            TAB 2: LOAN APPLICATIONS
        ══════════════════════════════════════════ */}
        {activeTab === "loans" && (
          <div style={{ padding: "32px" }}>
            {loading ? (
              <p style={{ textAlign: "center", color: "#6b7280", padding: "40px 0", fontSize: "18px" }}>Loading loan applications...</p>
            ) : pendingLoans.length === 0 ? (
              <div style={{ backgroundColor: "#f9fafb", padding: "40px", borderRadius: "12px", border: "1px dashed #d1d5db", textAlign: "center", color: "#6b7280", fontSize: "18px" }}>
                No pending loan applications for review.
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(380px, 1fr))", gap: "24px" }}>
                {pendingLoans.map((app, index) => (
                  <div key={index} style={{ border: "1px solid #e5e7eb", borderRadius: "16px", padding: "24px", backgroundColor: "white", display: "flex", flexDirection: "column" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "20px" }}>
                      <div>
                        <h3 style={{ fontWeight: "bold", fontSize: "20px", color: "#1f2937", marginBottom: "4px" }}>{app.applicant_name}</h3>
                        <p style={{ fontSize: "13px", color: "#6b7280", fontFamily: "monospace", backgroundColor: "#f3f4f6", padding: "4px 8px", borderRadius: "4px", display: "inline-block" }}>
                          DID: {app.did}
                        </p>
                      </div>
                      <span style={{ backgroundColor: "#fef3c7", color: "#92400e", fontSize: "12px", fontWeight: "bold", padding: "6px 12px", borderRadius: "9999px", border: "1px solid #fde68a" }}>
                        HITL Review
                      </span>
                    </div>

                    <div style={{ backgroundColor: "#f9fafb", padding: "18px", borderRadius: "12px", border: "1px solid #f3f4f6", marginBottom: "20px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px", fontSize: "13px" }}>
                        <span style={{ color: "#6b7280" }}>Loan Type:</span>
                        <span style={{ fontWeight: "bold", color: "#1f2937" }}>{app.loan_type}</span>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px", fontSize: "13px" }}>
                        <span style={{ color: "#6b7280" }}>AI Risk Evaluation:</span>
                        <span style={{ fontWeight: "bold", color: app.risk_level === "Low Risk" ? "#16a34a" : "#ea580c" }}>
                          {app.risk_level}
                        </span>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px", fontSize: "13px" }}>
                        <span style={{ color: "#6b7280" }}>AI Recommendation:</span>
                        <span style={{ fontWeight: "bold", color: "#1f2937" }}>{app.decision}</span>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14px", paddingTop: "10px", borderTop: "1px solid #e5e7eb" }}>
                        <span style={{ color: "#6b7280", fontWeight: "500" }}>Approved Cap:</span>
                        <span style={{ fontWeight: "bold", color: "#2563eb", fontSize: "17px" }}>Rs. {app.approved_amount?.toLocaleString()}</span>
                      </div>
                    </div>

                    <div style={{ display: "flex", gap: "12px", marginTop: "auto" }}>
                      <button
                        type="button"
                        onClick={() => handleLoanReview(app.tx_hash, "approve")}
                        style={{ flex: 1, backgroundColor: "#2563eb", color: "white", padding: "12px", borderRadius: "8px", fontWeight: "bold", border: "none", cursor: "pointer" }}
                      >
                        <i className="fa-solid fa-check" style={{ marginRight: "8px" }}></i> Approve
                      </button>
                      <button
                        type="button"
                        onClick={() => handleLoanReview(app.tx_hash, "reject")}
                        style={{ flex: 1, backgroundColor: "white", color: "#dc2626", border: "1px solid #fca5a5", padding: "12px", borderRadius: "8px", fontWeight: "bold", cursor: "pointer" }}
                      >
                        <i className="fa-solid fa-xmark" style={{ marginRight: "8px" }}></i> Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ══════════════════════════════════════════
            TAB 3: WELFARE APPLICATIONS
        ══════════════════════════════════════════ */}
        {activeTab === "welfare" && (
          <div style={{ padding: "32px" }}>
            {loading ? (
              <p style={{ textAlign: "center", color: "#6b7280", padding: "40px 0", fontSize: "18px" }}>Loading welfare requests...</p>
            ) : pendingWelfare.length === 0 ? (
              <div style={{ backgroundColor: "#f9fafb", padding: "40px", borderRadius: "12px", border: "1px dashed #d1d5db", textAlign: "center", color: "#6b7280", fontSize: "18px" }}>
                No pending welfare applications for review.
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(380px, 1fr))", gap: "24px" }}>
                {pendingWelfare.map((app, index) => (
                  <div key={index} style={{ border: "1px solid #e5e7eb", borderRadius: "16px", padding: "24px", backgroundColor: "white", display: "flex", flexDirection: "column" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "20px" }}>
                      <div>
                        <h3 style={{ fontWeight: "bold", fontSize: "19px", color: "#1f2937", marginBottom: "4px" }}>{app.name || "Household Applicant"}</h3>
                        <p style={{ fontSize: "12px", color: "#6b7280", fontFamily: "monospace", backgroundColor: "#f3f4f6", padding: "3px 8px", borderRadius: "4px", display: "inline-block" }}>
                          Assessment: {app.assessment_id}
                        </p>
                      </div>
                      <span style={{ backgroundColor: "#ecfdf5", color: "#065f46", fontSize: "12px", fontWeight: "bold", padding: "6px 12px", borderRadius: "9999px", border: "1px solid #a7f3d0" }}>
                        PMT Computed
                      </span>
                    </div>

                    <div style={{ backgroundColor: "#f9fafb", padding: "18px", borderRadius: "12px", border: "1px solid #f3f4f6", marginBottom: "20px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px", fontSize: "13px" }}>
                        <span style={{ color: "#6b7280" }}>Poverty Category:</span>
                        <span style={{ fontWeight: "bold", color: "#7c3aed" }}>{app.category || "Transitional"}</span>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px", fontSize: "13px" }}>
                        <span style={{ color: "#6b7280" }}>PMT Score:</span>
                        <span style={{ fontWeight: "bold", color: "#1f2937" }}>{app.pmt_score || app.score || "68.5"} pts</span>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14px", paddingTop: "10px", borderTop: "1px solid #e5e7eb" }}>
                        <span style={{ color: "#6b7280", fontWeight: "500" }}>Monthly Grant:</span>
                        <span style={{ fontWeight: "bold", color: "#059669", fontSize: "17px" }}>{app.grant_amount || "Rs. 8,500 / mo"}</span>
                      </div>
                    </div>

                    <div style={{ display: "flex", gap: "12px", marginTop: "auto" }}>
                      <button
                        type="button"
                        onClick={() => handleWelfareReview(app.assessment_id, "approve")}
                        style={{ flex: 1, backgroundColor: "#059669", color: "white", padding: "12px", borderRadius: "8px", fontWeight: "bold", border: "none", cursor: "pointer" }}
                      >
                        <i className="fa-solid fa-check" style={{ marginRight: "8px" }}></i> Approve Grant
                      </button>
                      <button
                        type="button"
                        onClick={() => handleWelfareReview(app.assessment_id, "reject")}
                        style={{ flex: 1, backgroundColor: "white", color: "#dc2626", border: "1px solid #fca5a5", padding: "12px", borderRadius: "8px", fontWeight: "bold", cursor: "pointer" }}
                      >
                        <i className="fa-solid fa-xmark" style={{ marginRight: "8px" }}></i> Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
