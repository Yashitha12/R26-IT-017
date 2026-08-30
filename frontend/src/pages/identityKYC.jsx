import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useApp } from "../context/AppContext";
import * as api from "../services/api";
import welfareBg from "../assets/sri_lanka_welfare_bg.jpg";

/* ─── Shared style tokens (same language as registration) ─── */
const S = {
  page: {
    minHeight: "100vh", position: "relative",
    backgroundImage: `url(${welfareBg})`,
    backgroundSize: "cover", backgroundPosition: "center", backgroundAttachment: "fixed",
    fontFamily: "'Inter', 'Segoe UI', sans-serif",
    display: "flex", flexDirection: "column", alignItems: "center",
    padding: "40px 20px 60px",
  },
  overlay: {
    position: "fixed", inset: 0, zIndex: 0,
    background: "linear-gradient(160deg, rgba(4,20,55,0.78) 0%, rgba(6,60,35,0.75) 100%)",
  },
  inner: { position: "relative", zIndex: 1, width: "100%", maxWidth: 620, display: "flex", flexDirection: "column", gap: 22 },

  /* Wordmark */
  brand: { textAlign: "center", marginBottom: 4 },
  brandName: { fontSize: 42, fontWeight: 900, color: "#fff", letterSpacing: -1.5, lineHeight: 1, margin: 0, textShadow: "0 2px 24px rgba(0,0,0,0.4)" },
  brandTagline: { fontSize: 12, fontWeight: 500, color: "rgba(255,255,255,0.55)", marginTop: 6, letterSpacing: 0.6, textTransform: "uppercase" },

  /* Main card */
  card: { background: "rgba(255,255,255,0.97)", borderRadius: 22, boxShadow: "0 32px 80px rgba(0,0,0,0.40)", overflow: "hidden" },

  /* Card header — green gradient (same as registration) */
  cardTop: { background: "linear-gradient(135deg, #064e3b 0%, #047857 100%)", padding: "24px 34px 20px", color: "#fff" },
  cardTopTitle: { fontSize: 20, fontWeight: 800, margin: "0 0 3px", letterSpacing: -0.3 },
  cardTopSub: { fontSize: 13, color: "rgba(255,255,255,0.68)", margin: 0 },
  progressWrap: { marginTop: 16, height: 4, background: "rgba(255,255,255,0.22)", borderRadius: 10, overflow: "hidden" },

  /* Stepper dots row */
  stepperRow: { display: "flex", alignItems: "center", justifyContent: "center", padding: "18px 34px 0" },
  stepLabelsRow: { display: "flex", justifyContent: "space-between", padding: "5px 24px 0", marginBottom: 2 },

  /* Body */
  body: { padding: "24px 34px 32px" },
  sectionHeading: { fontSize: 11, fontWeight: 700, color: "#64748b", letterSpacing: 1, textTransform: "uppercase", margin: "0 0 18px", borderBottom: "1px solid #f1f5f9", paddingBottom: 8 },

  /* Data grid (step 1) */
  dataGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px 20px", marginBottom: 20 },
  dataItem: { display: "flex", flexDirection: "column", gap: 2 },
  dataItemFull: { display: "flex", flexDirection: "column", gap: 2, gridColumn: "1 / -1" },
  dataLabel: { fontSize: 10, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: 0.5 },
  dataVal: { fontSize: 14, fontWeight: 600, color: "#0f172a" },

  /* Form */
  formRow: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 },
  fieldGroup: { display: "flex", flexDirection: "column", gap: 5 },
  fieldLabel: { fontSize: 10, fontWeight: 700, color: "#374151", textTransform: "uppercase", letterSpacing: 0.4 },
  inputBase: { padding: "10px 12px", fontSize: 14, color: "#111827", background: "#f8fafc", border: "1.5px solid #e2e8f0", borderRadius: 10, outline: "none", fontFamily: "inherit", width: "100%", boxSizing: "border-box" },

  /* App registered banner */
  appBanner: { background: "#f0fdf4", border: "1.5px solid #86efac", borderRadius: 10, padding: "12px 16px", marginTop: 14, fontSize: 12, color: "#15803d" },
  appBannerRow: { display: "flex", justifyContent: "space-between", marginBottom: 4 },

  /* Evidence cards (step 2) */
  evCard: { border: "1.5px solid #e2e8f0", borderRadius: 14, overflow: "hidden", marginBottom: 16 },
  evHeader: { padding: "12px 16px", background: "#f8fafc", borderBottom: "1px solid #e2e8f0", display: "flex", alignItems: "center", justifyContent: "space-between" },
  evStepLabel: { fontSize: 10, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 2 },
  evTitle: { fontSize: 13, fontWeight: 700, color: "#0f172a" },
  viewport: { height: 160, background: "#0f172a", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" },
  evActions: { padding: "12px 16px", borderTop: "1px solid #f1f5f9", display: "flex", flexDirection: "column", gap: 6 },
  evBtnRow: { display: "flex", gap: 6 },

  /* Buttons */
  btnLarge: { width: "100%", padding: "12px 20px", borderRadius: 10, border: "none", background: "linear-gradient(135deg, #059669 0%, #064e3b 100%)", color: "#fff", fontWeight: 700, fontSize: 14, cursor: "pointer", boxShadow: "0 4px 14px rgba(5,150,105,0.28)", fontFamily: "inherit" },
  btnRow: { display: "flex", gap: 11, marginTop: 20 },
  btnBack: { flex: "0 0 auto", padding: "11px 22px", borderRadius: 10, border: "1.5px solid #e2e8f0", background: "#fff", color: "#374151", fontWeight: 600, fontSize: 14, cursor: "pointer", fontFamily: "inherit" },
  btnContinue: { flex: 1, padding: "11px 20px", borderRadius: 10, border: "none", background: "linear-gradient(135deg, #059669 0%, #064e3b 100%)", color: "#fff", fontWeight: 700, fontSize: 14, cursor: "pointer", boxShadow: "0 4px 14px rgba(5,150,105,0.28)", fontFamily: "inherit" },
  btnPrimary: { flex: 1, padding: "9px 12px", borderRadius: 9, border: "none", background: "linear-gradient(135deg, #059669 0%, #064e3b 100%)", color: "#fff", fontWeight: 700, fontSize: 12, cursor: "pointer", fontFamily: "inherit" },
  btnCyan: { flex: 1, padding: "9px 12px", borderRadius: 9, border: "none", background: "#0891b2", color: "#fff", fontWeight: 700, fontSize: 12, cursor: "pointer", fontFamily: "inherit" },
  btnSecondary: { flex: 1, padding: "9px 12px", borderRadius: 9, cursor: "pointer", border: "1.5px solid #e2e8f0", background: "#fff", color: "#374151", fontWeight: 600, fontSize: 12, fontFamily: "inherit" },
  btnGhost: { flex: 1, padding: "9px 12px", borderRadius: 9, cursor: "pointer", border: "1.5px solid #cbd5e1", background: "#f8fafc", color: "#475569", fontWeight: 600, fontSize: 12, fontFamily: "inherit" },

  /* Confirmation Modal */
  modalBackdrop: {
    position: "fixed", inset: 0, zIndex: 1000,
    background: "rgba(4,20,55,0.65)",
    backdropFilter: "blur(4px)",
    display: "flex", alignItems: "center", justifyContent: "center",
    padding: "20px",
  },
  modalBox: {
    background: "#fff", borderRadius: 20,
    boxShadow: "0 32px 80px rgba(0,0,0,0.45)",
    width: "100%", maxWidth: 480,
    overflow: "hidden",
    animation: "fadeInUp 0.25s ease",
  },
  modalHeader: {
    background: "linear-gradient(135deg, #064e3b 0%, #047857 100%)",
    padding: "22px 28px 18px",
  },
  modalTitle: { fontSize: 18, fontWeight: 800, color: "#fff", margin: 0 },
  modalSub: { fontSize: 12, color: "rgba(255,255,255,0.65)", marginTop: 4 },
  modalBody: { padding: "24px 28px" },
  modalStep: {
    display: "flex", alignItems: "flex-start", gap: 14, marginBottom: 16,
  },
  modalStepNum: {
    width: 28, height: 28, borderRadius: "50%", flexShrink: 0,
    background: "linear-gradient(135deg, #059669, #064e3b)",
    color: "#fff", fontSize: 12, fontWeight: 800,
    display: "flex", alignItems: "center", justifyContent: "center",
  },
  modalStepText: { fontSize: 13, color: "#374151", lineHeight: 1.6 },
  modalStepLabel: { fontWeight: 700, color: "#0f172a", display: "block", marginBottom: 2 },
  modalNote: {
    background: "#eff6ff", border: "1px solid #bfdbfe",
    borderRadius: 10, padding: "10px 14px",
    fontSize: 12, color: "#1e40af", marginTop: 4,
  },
  modalFooter: {
    padding: "16px 28px 24px",
    display: "flex", gap: 10,
  },
  btnModalCancel: {
    flex: 1, padding: "11px 20px", borderRadius: 10,
    border: "1.5px solid #e2e8f0", background: "#fff",
    color: "#374151", fontWeight: 600, fontSize: 14, cursor: "pointer", fontFamily: "inherit",
  },
  btnModalConfirm: {
    flex: 2, padding: "11px 20px", borderRadius: 10, border: "none",
    background: "linear-gradient(135deg, #059669 0%, #064e3b 100%)",
    color: "#fff", fontWeight: 700, fontSize: 14, cursor: "pointer",
    boxShadow: "0 4px 14px rgba(5,150,105,0.30)", fontFamily: "inherit",
  },

  /* Status pill */
  verdictBanner: (status) => {
    const ok = status === "VERIFIED", no = status === "REJECTED";
    return { borderRadius: 12, padding: "16px 20px", marginBottom: 20, display: "flex", alignItems: "flex-start", gap: 14, background: ok ? "#d1fae5" : no ? "#fee2e2" : "#fefce8", border: `1.5px solid ${ok ? "#6ee7b7" : no ? "#fca5a5" : "#fde68a"}` };
  },
  verdictDot: (status) => ({ width: 10, height: 10, borderRadius: "50%", flexShrink: 0, marginTop: 5, background: status === "VERIFIED" ? "#059669" : status === "REJECTED" ? "#dc2626" : "#d97706" }),

  indicatorRow: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 20 },
  indicatorBox: { background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 10, padding: "12px 14px" },
  indLabel: { fontSize: 10, color: "#94a3b8", fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.4, marginBottom: 4 },
  indVal: { fontSize: 12, fontWeight: 800, color: "#0f172a" },

  /* DID card */
  didCard: { background: "linear-gradient(135deg, #0f172a 0%, #1e3a5f 100%)", borderRadius: 14, padding: "20px 22px", marginBottom: 20, border: "1px solid rgba(99,179,237,0.25)" },
  didCardTop: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 },
  didCardTitle: { fontSize: 14, fontWeight: 800, color: "#fff" },
  didCardSub: { fontSize: 11, color: "rgba(255,255,255,0.5)", marginTop: 2 },
  activePill: { fontSize: 10, fontWeight: 700, letterSpacing: 0.4, background: "#d1fae5", color: "#065f46", border: "1px solid #6ee7b7", borderRadius: 50, padding: "4px 12px" },
  didStringRow: { background: "rgba(0,0,0,0.3)", borderRadius: 8, padding: "10px 14px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, marginBottom: 14 },
  didString: { fontSize: 11, color: "#7dd3fc", fontFamily: "monospace", wordBreak: "break-all" },
  btnCopyDid: { flexShrink: 0, padding: "6px 12px", borderRadius: 7, border: "1px solid rgba(255,255,255,0.2)", background: "rgba(255,255,255,0.08)", color: "#fff", fontSize: 11, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" },
  didDetailRow: { display: "flex", justifyContent: "space-between", paddingBottom: 5, borderBottom: "1px solid rgba(255,255,255,0.06)", marginBottom: 5 },
  didDetailLabel: { fontSize: 11, color: "rgba(255,255,255,0.45)", fontWeight: 600 },
  didDetailVal: { fontSize: 11, color: "#fff", fontWeight: 700 },
  credRow: { display: "flex", gap: 6, flexWrap: "wrap", marginTop: 12 },
  credPill: { fontSize: 10, fontWeight: 600, padding: "4px 12px", borderRadius: 50, background: "rgba(99,179,237,0.15)", color: "#7dd3fc", border: "1px solid rgba(99,179,237,0.25)" },
};

const STEPS = ["Profile & Application", "Biometric Evidence", "Verification Status"];

const statusPill = (status) => {
  const s = (status || "").toUpperCase();
  const map = {
    VERIFIED: { bg: "#d1fae5", color: "#065f46", border: "#6ee7b7" },
    PENDING: { bg: "#fef3c7", color: "#92400e", border: "#fcd34d" },
    NOT_SUBMITTED: { bg: "#f1f5f9", color: "#64748b", border: "#e2e8f0" },
    REJECTED: { bg: "#fee2e2", color: "#991b1b", border: "#fca5a5" },
  };
  const c = map[s] || map.NOT_SUBMITTED;
  return { fontSize: 10, fontWeight: 700, letterSpacing: 0.4, textTransform: "uppercase", padding: "3px 10px", borderRadius: 50, background: c.bg, color: c.color, border: `1px solid ${c.border}` };
};

const ViewportPlaceholder = ({ icon, label }) => (
  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, color: "rgba(255,255,255,0.3)" }}>
    <div style={{ width: 44, height: 44, borderRadius: "50%", border: "1.5px dashed rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>{icon}</div>
    <span style={{ fontSize: 11, fontWeight: 600 }}>{label}</span>
  </div>
);

export const IdentityKYC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { regData, activeUserId, activeVerificationId, setActiveVerificationId,
          verificationStatus, fetchStatus, issuedDidData,
          selfiePreviewUrl, setSelfiePreviewUrl, nicPreviewUrl, setNicPreviewUrl,
          showToast, fetchQueue } = useApp();

  const [step, setStep] = useState(1);
  const [preferredLang, setPreferredLang] = useState("en");
  const [emergencyContact, setEmergencyContact] = useState("0714567890");
  const [appRegistered, setAppRegistered] = useState(false);
  const [appId, setAppId] = useState("app-prototype-001");
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [cameraError, setCameraError] = useState(null);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const selfieFileRef = useRef(null);
  const nicFileRef = useRef(null);

  useEffect(() => {
    return () => { if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop()); };
  }, []);

  const vs = verificationStatus;
  const isApproved = vs?.finalStatus === "VERIFIED";
  const isRejected = vs?.finalStatus === "REJECTED";
  const maskedNic = `SYN-NIC-*****${(regData.nicNumber || "1234").slice(-4)}`;
  const progressPct = (step / 3) * 100;

  /* ── Handlers ── */
  const handleConfirmAndSubmit = async () => {
    setShowModal(false);
    await handleApplyIdentity();
  };

  const handleApplyIdentity = async () => {
    const res = await api.applyForIdentity(activeUserId, { preferredLanguage: preferredLang, emergencyContact, gnDivision: regData.gnDivision || "Minuwangoda North" });
    if (res.ok && res.data?.data) {
      const d = res.data.data;
      setActiveVerificationId(d.verificationId); setAppId(d.applicationId); setAppRegistered(true);
      showToast(`Identity application registered (${d.applicationId}).`);
      fetchStatus(d.verificationId); fetchQueue();
    } else if (res.data?.error?.includes("already active")) {
      setAppRegistered(true); showToast("Identity active. Proceed to evidence submission."); fetchStatus();
    } else { setAppRegistered(true); showToast("Application registered. Proceed to submit evidence."); }
  };

  const handleProceedToDashboard = () => {
    localStorage.setItem("user", JSON.stringify({
      name: regData.fullName || "Aravinda Kumara", nic: regData.nicNumber || "200223003053",
      memberId: activeUserId, district: regData.district || "Gampaha",
      gnDivision: regData.gnDivision || "Minuwangoda North", address: regData.homeAddress || "45/A, Jayawickrama Road",
      phone: regData.mobile || "+94 78 145 3248", email: regData.email || "citizen@example.com",
      did: issuedDidData?.did || "did:smartgrama:prototype:001", kycStatus: vs?.finalStatus || "VERIFIED",
      photo: selfiePreviewUrl,
    }));
    showToast("Entering Resident Dashboard..."); navigate("/dashboard");
  };

  const toggleCamera = async () => {
    setCameraError(null);
    if (isCameraActive) {
      if (streamRef.current) { streamRef.current.getTracks().forEach(t => t.stop()); streamRef.current = null; }
      setIsCameraActive(false); return;
    }
    // Check if the browser supports getUserMedia
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setCameraError({ title: "Camera Not Supported", detail: "Your browser does not support camera access. Please upload a photo from your device instead." });
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user", width: 400, height: 300 } });
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
      setIsCameraActive(true);
    } catch (err) {
      const name = err.name || "";
      if (name === "NotFoundError" || name === "DevicesNotFoundError" || err.message?.toLowerCase().includes("device not found")) {
        setCameraError({ title: "No Camera Found", detail: "No camera device was detected on this device. Please upload a selfie photo from your device instead." });
      } else if (name === "NotAllowedError" || name === "PermissionDeniedError") {
        setCameraError({ title: "Camera Permission Denied", detail: "Camera access was blocked. Please allow camera permission in your browser settings, or upload a photo from your device instead." });
      } else if (name === "NotReadableError" || name === "TrackStartError") {
        setCameraError({ title: "Camera In Use", detail: "The camera is being used by another application. Please close other apps using the camera, or upload a photo from your device instead." });
      } else {
        setCameraError({ title: "Camera Unavailable", detail: `Could not open camera (${err.message}). Please upload a photo from your device instead.` });
      }
    }
  };

  const snapPhoto = async () => {
    if (!videoRef.current || !canvasRef.current) return;
    const canvas = canvasRef.current;
    canvas.width = videoRef.current.videoWidth || 400; canvas.height = videoRef.current.videoHeight || 300;
    canvas.getContext("2d").drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
    setSelfiePreviewUrl(dataUrl);
    if (streamRef.current) { streamRef.current.getTracks().forEach(t => t.stop()); streamRef.current = null; }
    setIsCameraActive(false);
    const res = await api.submitFaceEvidence(activeVerificationId, dataUrl, "LiveWebcamCapture-v1.0");
    if (res.ok) { showToast("Selfie captured and submitted."); fetchStatus(); fetchQueue(); }
  };

  const handleSelfieFileUpload = (e) => {
    const file = e.target.files?.[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = async (ev) => {
      const dataUrl = ev.target.result; setSelfiePreviewUrl(dataUrl);
      const res = await api.submitFaceEvidence(activeVerificationId, dataUrl, "CustomImageUpload-v1.0");
      if (res.ok) { showToast("Selfie uploaded."); fetchStatus(); fetchQueue(); }
    };
    reader.readAsDataURL(file);
  };

  const handleNicFileUpload = (e) => {
    const file = e.target.files?.[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = async (ev) => {
      const dataUrl = ev.target.result; setNicPreviewUrl(dataUrl);
      const masked = maskedNic;
      const res = await api.submitNicEvidence(activeVerificationId, dataUrl, "NATIONAL_IDENTITY_CARD_REAL_UPLOAD", masked);
      if (res.ok) { showToast("NIC uploaded."); fetchStatus(); fetchQueue(); }
    };
    reader.readAsDataURL(file);
  };

  const handleQuickSampleSelfie = async () => {
    setSelfiePreviewUrl("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'><rect width='200' height='200' fill='%230d9488'/><text x='50%' y='50%' font-size='80' text-anchor='middle' dominant-baseline='middle'>&#128100;</text></svg>");
    const res = await api.submitFaceEvidence(activeVerificationId, "synthetic-selfie-reference-001", "SyntheticFaceMatch-v1.0");
    if (res.ok) { showToast("Sample selfie submitted."); fetchStatus(); fetchQueue(); }
  };

  const handleQuickSampleNic = async () => {
    setNicPreviewUrl("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='300' height='160'><rect width='300' height='160' fill='%231e293b' rx='10'/><text x='50%' y='40%' fill='%2394a3b8' font-size='10' text-anchor='middle'>SRI LANKA NATIONAL IDENTITY CARD</text><text x='50%' y='65%' fill='%2338bdf8' font-size='14' font-family='monospace' text-anchor='middle'>" + maskedNic + "</text></svg>");
    const res = await api.submitNicEvidence(activeVerificationId, "synthetic-nic-reference-001", "SYNTHETIC_NATIONAL_IDENTITY_CARD", maskedNic);
    if (res.ok) { showToast("Sample NIC submitted."); fetchStatus(); fetchQueue(); }
  };

  /* ── Stepper helpers ── */
  const dotStyle = (idx) => {
    const state = idx + 1 < step ? "done" : idx + 1 === step ? "active" : "idle";
    return {
      width: 30, height: 30, borderRadius: "50%",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: 13, fontWeight: 700, cursor: "pointer", flexShrink: 0,
      ...(state === "done"   && { background: "#059669", color: "#fff" }),
      ...(state === "active" && { background: "#064e3b", color: "#fff", boxShadow: "0 0 0 3px rgba(6,78,59,0.22)" }),
      ...(state === "idle"   && { background: "#f1f5f9", color: "#94a3b8", border: "2px solid #e2e8f0" }),
    };
  };
  const labelStyle = (idx) => {
    const state = idx + 1 < step ? "done" : idx + 1 === step ? "active" : "idle";
    return {
      fontSize: 10, textAlign: "center", width: 90, lineHeight: 1.3,
      fontWeight: state === "active" ? 700 : 500,
      color: state === "done" ? "#059669" : state === "active" ? "#064e3b" : "#94a3b8",
    };
  };

  return (
    <div style={S.page}>
      <div style={S.overlay} />
      <div style={S.inner}>

        {/* Wordmark */}
        <div style={S.brand}>
          <p style={S.brandName}>SmartGrama</p>
          <p style={S.brandTagline}>Biometric Identity Verification &nbsp;&middot;&nbsp; Sri Lanka</p>
        </div>

        {/* Form card */}
        <div style={S.card}>

          {/* Green top bar */}
          <div style={S.cardTop}>
            <h1 style={S.cardTopTitle}>Identity Verification</h1>
            <p style={S.cardTopSub}>Step {step} of 3 — {STEPS[step - 1]}</p>
            <div style={S.progressWrap}>
              <div style={{ height: "100%", width: `${progressPct}%`, background: "linear-gradient(90deg, #6ee7b7, #34d399)", borderRadius: 10, transition: "width 0.5s ease" }} />
            </div>
          </div>

          {/* Stepper dots */}
          <div style={S.stepperRow}>
            {STEPS.map((_, idx) => (
              <React.Fragment key={idx}>
                <div style={dotStyle(idx)} onClick={() => setStep(idx + 1)}>
                  {idx + 1 < step ? "✓" : idx + 1}
                </div>
                {idx < 2 && <div style={{ flex: 1, height: 2, maxWidth: 80, background: idx + 1 < step ? "#059669" : "#e2e8f0", transition: "background 0.4s" }} />}
              </React.Fragment>
            ))}
          </div>
          <div style={S.stepLabelsRow}>
            {STEPS.map((label, idx) => (
              <div key={label} style={labelStyle(idx)}>{label}</div>
            ))}
          </div>

          {/* ══════════════════════════════════════════
              STEP 1 — Profile & Application
          ══════════════════════════════════════════ */}
          {step === 1 && (
            <div style={S.body}>
              <div style={S.sectionHeading}>Your Registered Profile</div>

              {/* Read-only profile data */}
              <div style={S.dataGrid}>
                <div style={S.dataItem}><span style={S.dataLabel}>Full Name</span><span style={S.dataVal}>{regData.fullName || "—"}</span></div>
                <div style={S.dataItem}><span style={S.dataLabel}>NIC Number</span><span style={S.dataVal}>{regData.nicNumber || "—"}</span></div>
                <div style={S.dataItem}><span style={S.dataLabel}>Mobile</span><span style={S.dataVal}>{regData.mobile || "—"}</span></div>
                <div style={S.dataItem}><span style={S.dataLabel}>Email</span><span style={S.dataVal}>{regData.email || "—"}</span></div>
                <div style={S.dataItemFull}><span style={S.dataLabel}>Address / GN Division</span><span style={S.dataVal}>{regData.homeAddress || "—"}, {regData.gnDivision} ({regData.district})</span></div>
              </div>

              <div style={{ height: 1, background: "#f1f5f9", margin: "4px 0 20px" }} />
              <div style={S.sectionHeading}>Application Preferences</div>

              <div style={S.formRow}>
                <div style={S.fieldGroup}>
                  <label style={S.fieldLabel}>Preferred Language</label>
                  <select style={S.inputBase} value={preferredLang} onChange={e => setPreferredLang(e.target.value)}>
                    <option value="en">English</option>
                    <option value="si">Sinhala</option>
                    <option value="ta">Tamil</option>
                  </select>
                </div>
                <div style={S.fieldGroup}>
                  <label style={S.fieldLabel}>Emergency Contact</label>
                  <input type="text" style={S.inputBase} placeholder="071-XXXXXXX" value={emergencyContact} onChange={e => setEmergencyContact(e.target.value)} />
                </div>
              </div>

              <button style={S.btnLarge} onClick={() => setShowModal(true)}>
                Submit Identity Application
              </button>

              {appRegistered && (
                <div style={S.appBanner}>
                  <div style={{ fontWeight: 700, marginBottom: 8, color: "#15803d" }}>Application Registered — Pending KYC</div>
                  <div style={S.appBannerRow}><span style={{ fontWeight: 600, color: "#374151" }}>Application ID</span><code style={{ fontFamily: "monospace", fontSize: 11 }}>{appId}</code></div>
                  <div style={S.appBannerRow}><span style={{ fontWeight: 600, color: "#374151" }}>Verification ID</span><code style={{ fontFamily: "monospace", fontSize: 11 }}>{activeVerificationId}</code></div>
                  <div style={S.appBannerRow}><span style={{ fontWeight: 600, color: "#374151" }}>DID Status</span><span style={{ color: "#d97706", fontWeight: 700, fontSize: 11 }}>Pending Officer Approval</span></div>
                </div>
              )}

              <div style={S.btnRow}>
                <button style={S.btnContinue} onClick={() => setStep(2)}>Continue to Evidence</button>
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════
              STEP 2 — Biometric Evidence
          ══════════════════════════════════════════ */}
          {step === 2 && (
            <div style={S.body}>
              {/* Instruction note */}
              <div style={{ background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 10, padding: "12px 16px", marginBottom: 20, fontSize: 13, color: "#1e40af" }}>
                <strong>How it works:</strong> First capture or upload your face photo, then upload a clear photo of your Sri Lanka National Identity Card. Both are required for officer review.
              </div>

              {/* Step A — Face ID */}
              <div style={{ ...S.sectionHeading, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span>Step A — Face ID Selfie</span>
                <span style={statusPill(vs?.facialVerificationStatus)}>{vs?.facialVerificationStatus || "Not Submitted"}</span>
              </div>

              <div style={S.evCard}>
                <div style={S.viewport}>
                  {isCameraActive && <video ref={videoRef} autoPlay playsInline style={{ width: "100%", height: "100%", objectFit: "cover" }} />}
                  {selfiePreviewUrl && !isCameraActive && <img src={selfiePreviewUrl} alt="Selfie" style={{ width: "100%", height: "100%", objectFit: "cover" }} />}
                  {cameraError && !isCameraActive && !selfiePreviewUrl && (
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10, padding: "0 20px", textAlign: "center" }}>
                      <div style={{ width: 40, height: 40, borderRadius: "50%", background: "rgba(239,68,68,0.15)", border: "1.5px solid rgba(239,68,68,0.4)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f87171" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                      </div>
                      <div style={{ color: "#f87171", fontWeight: 700, fontSize: 13 }}>{cameraError.title}</div>
                      <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 11, lineHeight: 1.5 }}>{cameraError.detail}</div>
                      <button
                        style={{ marginTop: 4, padding: "7px 18px", borderRadius: 8, border: "none", background: "linear-gradient(135deg, #059669, #064e3b)", color: "#fff", fontWeight: 700, fontSize: 12, cursor: "pointer", fontFamily: "inherit" }}
                        onClick={() => { setCameraError(null); selfieFileRef.current?.click(); }}
                      >
                        Upload Photo Instead
                      </button>
                    </div>
                  )}
                  {!isCameraActive && !selfiePreviewUrl && !cameraError && (
                    <ViewportPlaceholder
                      icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>}
                      label="No photo captured yet"
                    />
                  )}
                </div>
                <canvas ref={canvasRef} style={{ display: "none" }} width="400" height="300" />
                <input type="file" ref={selfieFileRef} accept="image/*" style={{ display: "none" }} onChange={handleSelfieFileUpload} />
                <div style={S.evActions}>
                  <div style={S.evBtnRow}>
                    <button style={S.btnPrimary} onClick={toggleCamera}>{isCameraActive ? "Stop Camera" : "Open Camera"}</button>
                    {isCameraActive && <button style={S.btnCyan} onClick={snapPhoto}>Capture Photo</button>}
                  </div>
                  <div style={S.evBtnRow}>
                    <button style={S.btnSecondary} onClick={() => selfieFileRef.current?.click()}>Upload from Device</button>
                    <button style={S.btnGhost} onClick={handleQuickSampleSelfie}>Use Sample</button>
                  </div>
                </div>
              </div>

              {/* Step B — NIC Document */}
              <div style={{ ...S.sectionHeading, display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 8 }}>
                <span>Step B — NIC Document</span>
                <span style={statusPill(vs?.documentVerificationStatus)}>{vs?.documentVerificationStatus || "Not Submitted"}</span>
              </div>

              <div style={S.evCard}>
                <div style={S.viewport}>
                  {nicPreviewUrl
                    ? <img src={nicPreviewUrl} alt="NIC" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
                    : <ViewportPlaceholder
                        icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="5" width="18" height="14" rx="2"/><line x1="7" y1="9" x2="17" y2="9"/><line x1="7" y1="13" x2="13" y2="13"/></svg>}
                        label={maskedNic}
                      />
                  }
                </div>
                <input type="file" ref={nicFileRef} accept="image/*" style={{ display: "none" }} onChange={handleNicFileUpload} />
                <div style={S.evActions}>
                  <button style={S.btnPrimary} onClick={() => nicFileRef.current?.click()}>Upload NIC Photo</button>
                  <button style={S.btnGhost} onClick={handleQuickSampleNic}>Use Sample NIC</button>
                </div>
              </div>

              {/* Evidence submission summary */}
              <div style={{ background: "#f8fafc", border: "1.5px solid #e2e8f0", borderRadius: 12, padding: "16px 18px", marginTop: 8 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 12 }}>Submission Checklist</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 14 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 22, height: 22, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, background: selfiePreviewUrl ? "#d1fae5" : "#f1f5f9", border: `1.5px solid ${selfiePreviewUrl ? "#6ee7b7" : "#e2e8f0"}` }}>
                      {selfiePreviewUrl
                        ? <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                        : <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                      }
                    </div>
                    <span style={{ fontSize: 13, color: selfiePreviewUrl ? "#059669" : "#94a3b8", fontWeight: selfiePreviewUrl ? 600 : 400 }}>
                      {selfiePreviewUrl ? "Face ID selfie — ready to submit" : "Face ID selfie — not yet captured"}
                    </span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 22, height: 22, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, background: nicPreviewUrl ? "#d1fae5" : "#f1f5f9", border: `1.5px solid ${nicPreviewUrl ? "#6ee7b7" : "#e2e8f0"}` }}>
                      {nicPreviewUrl
                        ? <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                        : <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                      }
                    </div>
                    <span style={{ fontSize: 13, color: nicPreviewUrl ? "#059669" : "#94a3b8", fontWeight: nicPreviewUrl ? 600 : 400 }}>
                      {nicPreviewUrl ? "NIC document — ready to submit" : "NIC document — not yet uploaded"}
                    </span>
                  </div>
                </div>

                {/* Submit button — active only when at least one evidence is ready */}
                <button
                  style={{
                    width: "100%", padding: "13px 20px", borderRadius: 10, border: "none",
                    fontWeight: 700, fontSize: 14, fontFamily: "inherit", cursor: (selfiePreviewUrl || nicPreviewUrl) ? "pointer" : "not-allowed",
                    background: (selfiePreviewUrl || nicPreviewUrl)
                      ? "linear-gradient(135deg, #059669 0%, #064e3b 100%)"
                      : "#e2e8f0",
                    color: (selfiePreviewUrl || nicPreviewUrl) ? "#fff" : "#94a3b8",
                    boxShadow: (selfiePreviewUrl || nicPreviewUrl) ? "0 4px 14px rgba(5,150,105,0.28)" : "none",
                    transition: "all 0.2s",
                  }}
                  disabled={!selfiePreviewUrl && !nicPreviewUrl}
                  onClick={() => { fetchStatus(); fetchQueue(); setStep(3); }}
                >
                  {(selfiePreviewUrl && nicPreviewUrl)
                    ? "Submit Evidence & View Status"
                    : (selfiePreviewUrl || nicPreviewUrl)
                    ? "Submit Partial Evidence & View Status"
                    : "Upload Evidence Above to Submit"}
                </button>

                {!selfiePreviewUrl && !nicPreviewUrl && (
                  <p style={{ textAlign: "center", fontSize: 11, color: "#94a3b8", margin: "10px 0 0" }}>
                    Upload at least one piece of evidence to enable submission.
                  </p>
                )}
              </div>

              <div style={{ marginTop: 12 }}>
                <button style={S.btnBack} onClick={() => setStep(1)}>Back to Application</button>
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════
              STEP 3 — Verification Status
          ══════════════════════════════════════════ */}
          {step === 3 && (
            <div style={S.body}>

              {/* ── Big centred status block ── */}
              <div style={{ textAlign: "center", padding: "8px 0 24px" }}>
                {/* Status icon */}
                <div style={{
                  width: 72, height: 72, borderRadius: "50%", margin: "0 auto 16px",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  background: isApproved ? "linear-gradient(135deg, #d1fae5, #a7f3d0)"
                    : isRejected ? "linear-gradient(135deg, #fee2e2, #fca5a5)"
                    : "linear-gradient(135deg, #fefce8, #fde68a)",
                  border: `2px solid ${isApproved ? "#6ee7b7" : isRejected ? "#f87171" : "#fcd34d"}`,
                  boxShadow: `0 8px 24px ${isApproved ? "rgba(5,150,105,0.2)" : isRejected ? "rgba(220,38,38,0.2)" : "rgba(217,119,6,0.15)"}`,
                }}>
                  {isApproved && (
                    <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2.5">
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                      <polyline points="9 12 11 14 15 10"/>
                    </svg>
                  )}
                  {isRejected && (
                    <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2.5">
                      <circle cx="12" cy="12" r="10"/>
                      <line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
                    </svg>
                  )}
                  {!isApproved && !isRejected && (
                    <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="2.5">
                      <circle cx="12" cy="12" r="10"/>
                      <polyline points="12 6 12 12 16 14"/>
                    </svg>
                  )}
                </div>

                {/* Headline */}
                <div style={{ fontSize: 22, fontWeight: 900, color: "#0f172a", marginBottom: 6 }}>
                  {isApproved ? "Identity Verified!" : isRejected ? "Verification Failed" : "Under Review"}
                </div>

                {/* One-liner message */}
                <div style={{ fontSize: 14, color: "#64748b", lineHeight: 1.6, maxWidth: 380, margin: "0 auto 8px" }}>
                  {isApproved
                    ? "Your Digital Identity has been issued. You now have full access to SmartGrama welfare services."
                    : isRejected
                    ? `Not approved: ${vs?.remarks || "Your documents did not meet the requirements. Please re-upload and try again."}`
                    : "Your documents have been submitted and are waiting for review by a Grama Niladhari Officer. This usually takes 1–2 working days."}
                </div>

                {/* Refresh button (only for pending) */}
                {!isApproved && !isRejected && (
                  <button
                    style={{ marginTop: 8, padding: "6px 16px", borderRadius: 8, border: "1.5px solid #e2e8f0", background: "#fff", color: "#374151", fontWeight: 600, fontSize: 12, cursor: "pointer", fontFamily: "inherit" }}
                    onClick={() => fetchStatus()}
                  >
                    Check Again
                  </button>
                )}
              </div>

              {/* ── Visual progress track ── */}
              <div style={{ border: "1.5px solid #f1f5f9", borderRadius: 14, overflow: "hidden", marginBottom: 22 }}>
                {[
                  {
                    label: "Identity Application",
                    sublabel: "Profile submitted to SmartGrama",
                    done: true,
                  },
                  {
                    label: "Biometric Evidence",
                    sublabel: selfiePreviewUrl && nicPreviewUrl
                      ? "Face photo & NIC document uploaded"
                      : selfiePreviewUrl ? "Face photo uploaded — NIC pending"
                      : nicPreviewUrl ? "NIC uploaded — face photo pending"
                      : "No evidence uploaded yet",
                    done: !!(selfiePreviewUrl || nicPreviewUrl),
                  },
                  {
                    label: "Officer Review",
                    sublabel: isApproved
                      ? "Approved — Digital Identity issued"
                      : isRejected
                      ? "Rejected — please re-submit evidence"
                      : "Waiting for Grama Niladhari Officer",
                    done: isApproved,
                    active: !isApproved && !isRejected,
                    failed: isRejected,
                  },
                ].map((row, idx) => (
                  <div key={row.label} style={{
                    display: "flex", alignItems: "center", gap: 14,
                    padding: "14px 18px",
                    borderBottom: idx < 2 ? "1px solid #f1f5f9" : "none",
                    background: row.active ? "#fffbeb" : "#fff",
                  }}>
                    {/* Dot */}
                    <div style={{
                      width: 32, height: 32, borderRadius: "50%", flexShrink: 0,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      background: row.done ? "#d1fae5" : row.failed ? "#fee2e2" : row.active ? "#fefce8" : "#f1f5f9",
                      border: `2px solid ${row.done ? "#6ee7b7" : row.failed ? "#fca5a5" : row.active ? "#fcd34d" : "#e2e8f0"}`,
                    }}>
                      {row.done && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>}
                      {row.failed && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>}
                      {row.active && <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#d97706" }} />}
                      {!row.done && !row.failed && !row.active && <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#cbd5e1" }} />}
                    </div>
                    {/* Text */}
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: row.done ? "#059669" : row.failed ? "#dc2626" : row.active ? "#92400e" : "#94a3b8" }}>
                        {row.label}
                      </div>
                      <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 2 }}>{row.sublabel}</div>
                    </div>
                    {/* Badge */}
                    <span style={{ fontSize: 10, fontWeight: 700, padding: "3px 10px", borderRadius: 50,
                      background: row.done ? "#d1fae5" : row.failed ? "#fee2e2" : row.active ? "#fef3c7" : "#f1f5f9",
                      color: row.done ? "#065f46" : row.failed ? "#991b1b" : row.active ? "#92400e" : "#94a3b8",
                      border: `1px solid ${row.done ? "#6ee7b7" : row.failed ? "#fca5a5" : row.active ? "#fcd34d" : "#e2e8f0"}`,
                    }}>
                      {row.done ? "Done" : row.failed ? "Failed" : row.active ? "In Progress" : "Pending"}
                    </span>
                  </div>
                ))}
              </div>

              {/* DID certificate — only when approved */}
              {isApproved && issuedDidData && (
                <div style={S.didCard}>
                  <div style={S.didCardTop}>
                    <div>
                      <div style={S.didCardTitle}>Your Digital Identity Certificate</div>
                      <div style={S.didCardSub}>SmartGrama &bull; Sri Lanka</div>
                    </div>
                    <span style={S.activePill}>Verified</span>
                  </div>
                  <div style={S.didStringRow}>
                    <code style={S.didString}>{issuedDidData.did}</code>
                    <button style={S.btnCopyDid} onClick={() => { navigator.clipboard.writeText(issuedDidData.did); showToast("DID copied!"); }}>Copy</button>
                  </div>
                  {[["Full Name", issuedDidData.name], ["NIC", issuedDidData.nic], ["Mobile", issuedDidData.phone], ["GN Division", issuedDidData.gnDivision]].map(([label, val]) => (
                    <div key={label} style={S.didDetailRow}><span style={S.didDetailLabel}>{label}</span><span style={S.didDetailVal}>{val || "—"}</span></div>
                  ))}
                  <div style={S.credRow}>
                    {["CitizenshipCredential", "ResidencyCredential", "BiometricCredential"].map(c => (<span key={c} style={S.credPill}>{c}</span>))}
                  </div>
                </div>
              )}

              {/* Action buttons */}
              <div style={S.btnRow}>
                <button style={S.btnBack} onClick={() => setStep(2)}>Back</button>
                <button
                  style={{ flex: 1, padding: "12px 20px", borderRadius: 10, border: "none",
                    background: isApproved
                      ? "linear-gradient(135deg, #059669 0%, #064e3b 100%)"
                      : "linear-gradient(135deg, #1d4ed8 0%, #1e40af 100%)",
                    color: "#fff", fontWeight: 700, fontSize: 14, cursor: "pointer",
                    boxShadow: "0 4px 14px rgba(29,78,216,0.28)", fontFamily: "inherit" }}
                  onClick={handleProceedToDashboard}
                >
                  {isApproved ? "Go to Dashboard" : "Continue to Dashboard"}
                </button>
              </div>

            </div>
          )}



        </div>{/* end card */}
      </div>

      {/* ── Confirmation Modal ── */}
      {showModal && (
        <div style={S.modalBackdrop} onClick={() => setShowModal(false)}>
          <div style={S.modalBox} onClick={e => e.stopPropagation()}>

            <div style={S.modalHeader}>
              <p style={S.modalTitle}>Submit Identity Application?</p>
              <p style={S.modalSub}>SmartGrama Welfare &amp; Microfinance Platform</p>
            </div>

            <div style={S.modalBody}>
              <p style={{ fontSize: 13, color: "#475569", margin: "0 0 20px", lineHeight: 1.6 }}>
                You are about to submit your identity application to the SmartGrama system. Here is what happens next:
              </p>

              <div style={S.modalStep}>
                <div style={S.modalStepNum}>1</div>
                <div style={S.modalStepText}>
                  <span style={S.modalStepLabel}>Application Registered</span>
                  Your profile data is sent securely to the SmartGrama system and an Application ID is assigned to you.
                </div>
              </div>

              <div style={S.modalStep}>
                <div style={S.modalStepNum}>2</div>
                <div style={S.modalStepText}>
                  <span style={S.modalStepLabel}>Biometric Evidence Required</span>
                  You will be asked to submit a live face photo and a clear photo of your National Identity Card (NIC).
                </div>
              </div>

              <div style={S.modalStep}>
                <div style={S.modalStepNum}>3</div>
                <div style={S.modalStepText}>
                  <span style={S.modalStepLabel}>Grama Niladhari Officer Review</span>
                  A qualified officer will verify your identity. Once approved, your Digital Identity (DID) is issued.
                </div>
              </div>

              <div style={S.modalNote}>
                Your data is submitted only for identity verification. The SmartGrama system uses blockchain-anchored records to keep your information secure and private.
              </div>
            </div>

            <div style={S.modalFooter}>
              <button style={S.btnModalCancel} onClick={() => setShowModal(false)}>Cancel</button>
              <button style={S.btnModalConfirm} onClick={handleConfirmAndSubmit}>Confirm &amp; Submit</button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
