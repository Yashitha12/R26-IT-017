import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useApp } from "../context/AppContext";
import * as api from "../services/api";
import welfareBg from "../assets/sri_lanka_welfare_bg.jpg";

const S = {
  page: {
    minHeight: "100vh",
    position: "relative",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    backgroundImage: `url(${welfareBg})`,
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundAttachment: "fixed",
    fontFamily: "'Inter', 'Segoe UI', sans-serif",
    padding: "40px 20px",
  },
  overlay: {
    position: "absolute",
    inset: 0,
    background: "linear-gradient(160deg, rgba(4,20,55,0.78) 0%, rgba(6,60,35,0.75) 100%)",
  },
  brand: {
    position: "relative",
    zIndex: 2,
    textAlign: "center",
    marginBottom: 28,
  },
  brandName: {
    fontSize: 52,
    fontWeight: 900,
    color: "#ffffff",
    letterSpacing: -1.5,
    lineHeight: 1,
    margin: 0,
    textShadow: "0 2px 24px rgba(0,0,0,0.4)",
  },
  brandTagline: {
    fontSize: 13,
    fontWeight: 500,
    color: "rgba(255,255,255,0.60)",
    marginTop: 8,
    letterSpacing: 0.6,
    textTransform: "uppercase",
  },
  formCard: {
    position: "relative",
    zIndex: 2,
    width: "100%",
    maxWidth: 520,
    background: "rgba(255,255,255,0.97)",
    borderRadius: 22,
    boxShadow: "0 32px 80px rgba(0,0,0,0.40)",
    overflow: "hidden",
  },
  cardTop: {
    background: "linear-gradient(135deg, #064e3b 0%, #047857 100%)",
    padding: "24px 34px 20px",
    color: "#fff",
  },
  cardTopTitle: { fontSize: 20, fontWeight: 800, margin: "0 0 3px", letterSpacing: -0.3 },
  cardTopSub:   { fontSize: 13, color: "rgba(255,255,255,0.68)", margin: 0 },
  progressWrap: { marginTop: 16, height: 4, background: "rgba(255,255,255,0.22)", borderRadius: 10, overflow: "hidden" },
  stepperRow: {
    display: "flex", alignItems: "center", justifyContent: "center",
    padding: "18px 34px 0",
  },
  stepLabelsRow: {
    display: "flex", justifyContent: "space-between",
    padding: "5px 28px 0", marginBottom: 2,
  },
  formBody: { padding: "20px 34px 32px" },
  sectionHeading: {
    fontSize: 11, fontWeight: 700, color: "#64748b",
    letterSpacing: 1, textTransform: "uppercase",
    margin: "0 0 18px", borderBottom: "1px solid #f1f5f9", paddingBottom: 8,
  },
  fieldGroup: { marginBottom: 14 },
  fieldLabel: {
    display: "block", fontSize: 11, fontWeight: 700, color: "#374151",
    marginBottom: 5, letterSpacing: 0.4, textTransform: "uppercase",
  },
  inputBase: {
    width: "100%", padding: "10px 13px",
    fontSize: 14, color: "#111827",
    background: "#f8fafc", border: "1.5px solid #e2e8f0",
    borderRadius: 10, outline: "none",
    boxSizing: "border-box", fontFamily: "inherit",
    transition: "border-color 0.2s, box-shadow 0.2s",
  },
  inputRow: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 11 },
  walletAlert: {
    background: "linear-gradient(135deg, #ecfdf5, #d1fae5)",
    border: "1.5px solid #6ee7b7", borderRadius: 11,
    padding: "13px 16px", marginTop: 6, marginBottom: 16,
    fontSize: 13, color: "#065f46", lineHeight: 1.55,
  },
  btnRow:     { display: "flex", gap: 11, marginTop: 20 },
  btnBack:    {
    flex: "0 0 auto", padding: "11px 22px", borderRadius: 10,
    border: "1.5px solid #e2e8f0", background: "#fff",
    color: "#374151", fontWeight: 600, fontSize: 14,
    cursor: "pointer", fontFamily: "inherit",
  },
  btnContinue: {
    flex: 1, padding: "11px 20px", borderRadius: 10,
    border: "none", background: "linear-gradient(135deg, #059669 0%, #064e3b 100%)",
    color: "#fff", fontWeight: 700, fontSize: 14, cursor: "pointer",
    boxShadow: "0 4px 14px rgba(5,150,105,0.30)", fontFamily: "inherit",
  },
};

const STEPS = ["Personal", "Address", "Income", "Bank"];

const Field = ({ id, label, type = "text", placeholder, value, onChange }) => (
  <div style={S.fieldGroup}>
    <label style={S.fieldLabel} htmlFor={id}>{label}</label>
    <input
      id={id} type={type} style={S.inputBase}
      placeholder={placeholder} value={value} onChange={onChange}
      onFocus={e => { e.target.style.borderColor = "#059669"; e.target.style.boxShadow = "0 0 0 3px rgba(5,150,105,0.12)"; e.target.style.background = "#fff"; }}
      onBlur={e  => { e.target.style.borderColor = "#e2e8f0"; e.target.style.boxShadow = "none"; e.target.style.background = "#f8fafc"; }}
    />
  </div>
);

export const UserRegistration = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { currentRegStep, setCurrentRegStep, regData, updateRegField,
          activeUserId, setActiveUserId, setActiveVerificationId,
          showToast, fetchStatus, fetchQueue } = useApp();
  const [submitting, setSubmitting] = useState(false);

  const handleNext = (from) => { if (from < 4) setCurrentRegStep(from + 1); };
  const handlePrev = (from) => { if (from > 1) setCurrentRegStep(from - 1); };

  const handleCompleteRegistration = async () => {
    setSubmitting(true);
    try {
      const res = await api.submitRegistration({
        name: regData.fullName || "Custom Citizen",
        nic: regData.nicNumber || "200012345678",
        dateOfBirth: regData.dob || "01/01/2000",
        phone: regData.mobile || "+94 77 000 0000",
        email: regData.email || "citizen@example.test",
        address: regData.homeAddress || "Main Street",
        city: regData.city || "Colombo",
        district: regData.district || "Colombo",
        gnDivision: regData.gnDivision || "Minuwangoda North",
        familySize: Number(regData.familySize) || 4,
        noOfDependents: Number(regData.noOfDependents) || 2,
        monthlyIncome: Number(regData.monthlyIncome) || 35000,
        monthlyExpenses: Number(regData.monthlyExpenses) || 30000,
        employmentType: regData.employmentType || "Farmer",
        bankName: regData.bankName || "Sampath Bank",
        accountNumber: regData.accountNumber || "000123456789",
        branch: regData.branch || "Colombo",
      });
      let uId = activeUserId;
      if (res.ok && res.data?.data) {
        uId = res.data.data.userId;
        setActiveUserId(uId);
        const suffix = uId.replace("user-prototype-", "").replace("user-", "");
        setActiveVerificationId(`ver-prototype-${suffix}`);
      }
      const idRes = await api.applyForIdentity(uId, {
        preferredLanguage: "en",
        emergencyContact: regData.mobile || "0714567890",
        gnDivision: regData.gnDivision || "Minuwangoda North",
      });
      if (idRes.ok && idRes.data?.data) setActiveVerificationId(idRes.data.data.verificationId);
      localStorage.setItem("user", JSON.stringify({
        name: regData.fullName || "Citizen Resident",
        nic: regData.nicNumber || "200223003053",
        memberId: uId,
        district: regData.district || "Gampaha",
        gnDivision: regData.gnDivision || "Minuwangoda North",
        address: regData.homeAddress || "45/A, Jayawickrama Road",
        phone: regData.mobile || "+94 78 145 3248",
        email: regData.email || "citizen@example.com",
        kycStatus: "PENDING",
      }));
      showToast(`Registration saved for ${regData.fullName}! Complete Biometric KYC.`);
      fetchStatus(); fetchQueue();
      navigate("/identity");
    } catch (err) { console.error(err); navigate("/identity"); }
    finally { setSubmitting(false); }
  };

  const progressPct = (currentRegStep / 4) * 100;

  const dotStyle = (idx) => {
    const state = idx + 1 < currentRegStep ? "done" : idx + 1 === currentRegStep ? "active" : "idle";
    return {
      width: 28, height: 28, borderRadius: "50%",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: 12, fontWeight: 700, cursor: "pointer", flexShrink: 0,
      ...(state === "done"   && { background: "#059669", color: "#fff" }),
      ...(state === "active" && { background: "#064e3b", color: "#fff", boxShadow: "0 0 0 3px rgba(6,78,59,0.22)" }),
      ...(state === "idle"   && { background: "#f1f5f9", color: "#94a3b8", border: "2px solid #e2e8f0" }),
    };
  };

  const labelStyle = (idx) => {
    const state = idx + 1 < currentRegStep ? "done" : idx + 1 === currentRegStep ? "active" : "idle";
    return {
      fontSize: 10, textAlign: "center", width: 68, lineHeight: 1.3,
      fontWeight: state === "active" ? 700 : 500,
      color: state === "done" ? "#059669" : state === "active" ? "#064e3b" : "#94a3b8",
    };
  };

  return (
    <div style={S.page}>
      <div style={S.overlay} />

      <div style={S.brand}>
        <p style={S.brandName}>SmartGrama</p>
        <p style={S.brandTagline}>Welfare &amp; Microfinance Platform &nbsp;&middot;&nbsp; Sri Lanka</p>
      </div>

      <div style={S.formCard}>
        <div style={S.cardTop}>
          <h1 style={S.cardTopTitle}>Create Your Account</h1>
          <p style={S.cardTopSub}>Step {currentRegStep} of 4 — {STEPS[currentRegStep - 1]}</p>
          <div style={S.progressWrap}>
            <div style={{ height: "100%", width: `${progressPct}%`, background: "linear-gradient(90deg, #6ee7b7, #34d399)", borderRadius: 10, transition: "width 0.5s ease" }} />
          </div>
        </div>

        <div style={S.stepperRow}>
          {STEPS.map((_, idx) => (
            <React.Fragment key={idx}>
              <div style={dotStyle(idx)} onClick={() => setCurrentRegStep(idx + 1)}>
                {idx + 1 < currentRegStep ? "v" : idx + 1}
              </div>
              {idx < 3 && (
                <div style={{ flex: 1, height: 2, maxWidth: 56, background: idx + 1 < currentRegStep ? "#059669" : "#e2e8f0", transition: "background 0.4s" }} />
              )}
            </React.Fragment>
          ))}
        </div>
        <div style={S.stepLabelsRow}>
          {STEPS.map((label, idx) => (
            <div key={label} style={labelStyle(idx)}>{label}</div>
          ))}
        </div>

        <div style={S.formBody}>

          {currentRegStep === 1 && (
            <div>
              <div style={S.sectionHeading}>Personal Information</div>
              <Field id="inpFullName"  label="Full Name"     placeholder="e.g. Kasun Dananjaya"        value={regData.fullName}  onChange={e => updateRegField("fullName", e.target.value)} />
              <Field id="inpNicNumber" label="NIC Number"    placeholder="199512345678 or 951234567V"   value={regData.nicNumber} onChange={e => updateRegField("nicNumber", e.target.value)} />
              <Field id="inpDob"       label="Date of Birth" placeholder="DD / MM / YYYY"               value={regData.dob}       onChange={e => updateRegField("dob", e.target.value)} />
              <div style={S.inputRow}>
                <Field id="inpMobile" label="Mobile"        placeholder="+94 7X XXX XXXX"   value={regData.mobile} onChange={e => updateRegField("mobile", e.target.value)} />
                <Field id="inpEmail"  label="Email Address" type="email" placeholder="name@example.com" value={regData.email} onChange={e => updateRegField("email", e.target.value)} />
              </div>
              <div style={S.btnRow}>
                <button style={S.btnContinue} onClick={() => handleNext(1)}>Continue</button>
              </div>
            </div>
          )}

          {currentRegStep === 2 && (
            <div>
              <div style={S.sectionHeading}>Address &amp; GN Division</div>
              <Field id="inpHomeAddress" label="Home Address" placeholder="House No, Street Name" value={regData.homeAddress} onChange={e => updateRegField("homeAddress", e.target.value)} />
              <div style={S.inputRow}>
                <Field id="inpCity"     label="City"     placeholder="e.g. Gampaha"  value={regData.city}     onChange={e => updateRegField("city", e.target.value)} />
                <Field id="inpDistrict" label="District" placeholder="e.g. Gampaha"  value={regData.district} onChange={e => updateRegField("district", e.target.value)} />
              </div>
              <Field id="inpGnDivision" label="GN Division" placeholder="e.g. Minuwangoda North" value={regData.gnDivision} onChange={e => updateRegField("gnDivision", e.target.value)} />
              <div style={S.btnRow}>
                <button style={S.btnBack} onClick={() => handlePrev(2)}>Back</button>
                <button style={S.btnContinue} onClick={() => handleNext(2)}>Continue</button>
              </div>
            </div>
          )}

          {currentRegStep === 3 && (
            <div>
              <div style={S.sectionHeading}>Family &amp; Income Details</div>
              <div style={S.inputRow}>
                <Field id="inpFamilySize"     label="Family Size"       type="number" placeholder="4" value={regData.familySize}     onChange={e => updateRegField("familySize", e.target.value)} />
                <Field id="inpNoOfDependents" label="No. of Dependents"  type="number" placeholder="2" value={regData.noOfDependents} onChange={e => updateRegField("noOfDependents", e.target.value)} />
              </div>
              <div style={S.inputRow}>
                <Field id="inpMonthlyIncome"   label="Monthly Income (LKR)"   type="number" placeholder="35000" value={regData.monthlyIncome}   onChange={e => updateRegField("monthlyIncome", e.target.value)} />
                <Field id="inpMonthlyExpenses" label="Monthly Expenses (LKR)"  type="number" placeholder="30000" value={regData.monthlyExpenses} onChange={e => updateRegField("monthlyExpenses", e.target.value)} />
              </div>
              <Field id="inpEmploymentType" label="Employment Type" placeholder="Farmer / Self-Employed / Government" value={regData.employmentType} onChange={e => updateRegField("employmentType", e.target.value)} />
              <div style={S.btnRow}>
                <button style={S.btnBack} onClick={() => handlePrev(3)}>Back</button>
                <button style={S.btnContinue} onClick={() => handleNext(3)}>Continue</button>
              </div>
            </div>
          )}

          {currentRegStep === 4 && (
            <div>
              <div style={S.sectionHeading}>Bank &amp; Wallet Details</div>
              <Field id="inpBankName" label="Bank Name" placeholder="e.g. Sampath Bank, BOC, People's Bank" value={regData.bankName} onChange={e => updateRegField("bankName", e.target.value)} />
              <div style={S.inputRow}>
                <Field id="inpAccountNumber" label="Account Number" placeholder="000123456789" value={regData.accountNumber} onChange={e => updateRegField("accountNumber", e.target.value)} />
                <Field id="inpBranch"        label="Branch"         placeholder="Branch Name"   value={regData.branch}        onChange={e => updateRegField("branch", e.target.value)} />
              </div>
              <div style={S.walletAlert}>
                <strong>Digital Wallet Auto-Created</strong><br />
                A SmartGrama Digital Wallet linked to your bank account will be set up automatically after identity verification for seamless welfare disbursements.
              </div>
              <div style={S.btnRow}>
                <button style={S.btnBack} onClick={() => handlePrev(4)}>Back</button>
                <button
                  style={{
                    flex: 1, padding: "12px 20px", borderRadius: 10, border: "none",
                    background: submitting ? "#6b7280" : "linear-gradient(135deg, #1d4ed8 0%, #1e40af 100%)",
                    color: "#fff", fontWeight: 700, fontSize: 14,
                    cursor: submitting ? "not-allowed" : "pointer",
                    boxShadow: "0 4px 14px rgba(29,78,216,0.32)", fontFamily: "inherit",
                  }}
                  onClick={handleCompleteRegistration}
                  disabled={submitting}
                >
                  {submitting ? "Saving..." : "Complete Registration"}
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
