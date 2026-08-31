import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import { assessWelfare } from "../api/loanApi";
import { getCurrentUser } from "../utils/user";
import dashboardBg from "../assets/smartgrama_dashboard_bg.jpg";

/* ─── Custom SVG Icons ─── */
const Ico = {
  shield: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10"/></svg>,
  arrowLeft: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>,
  arrowRight: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>,
  check: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>,
  edit: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
  alert: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>,
  errorDot: <svg width="12" height="12" viewBox="0 0 24 24" fill="#ef4444"><circle cx="12" cy="12" r="10"/></svg>,
};

export default function WelfareApplication() {
  const navigate = useNavigate();
  const user = getCurrentUser();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [confirmed, setConfirmed] = useState(true);

  const [form, setForm] = useState({
    // Step 1: Applicant Information
    fullName: user?.name || "Aravinda Kumara",
    nic: user?.nic || "200223003053",
    dob: user?.dob || "1990-05-15",
    gender: user?.gender || "Male",
    mobilePhone: user?.mobile || "+94 78 145 3248",
    permanentAddress: user?.address || "45/A, Jayawickrama Road",
    province: "Western",
    district: user?.district || "Gampaha",
    dsDivision: "Minuwangoda",
    gnDivision: user?.gnDivision || "Minuwangoda North",

    // Step 2: Household Information
    totalMembers: "4",
    existingWelfareProgrammes: "None",
    waitingListStatus: "No",
    applicationStatus: "New Applicant",

    // Step 3: Education
    highestEducationHead: "G.C.E. O/L",
    schoolAttendanceChildren: "All Attend Regularly",
    schoolDropoutStatus: "No Dropouts",

    // Step 4: Health & Special Needs
    hasPermanentDisabilities: "No",
    disabilityCount: "0",
    hasSevereChronicIllnesses: "No",
    chronicIllnessCount: "0",
    hasCkd: false,
    hasCancer: false,
    hasParalysis: false,
    bedriddenElderlyCount: "0",
    fullyDependentElderlyCount: "0",

    // Step 5: Economic & Livelihood
    primaryLivelihood: "Daily wage",
    estimatedMonthlyIncome: "45000",
    regularMonthlyExpenses: "25000",
    averageMonthlyElectricityKwh: "45",

    // Step 6: Assets & Land
    motorVehicles: "None",
    consumerDurables: "Television",
    hasAgriculturalLand: "No",
    hasResidentialLand: "Yes",

    // Step 7: Housing Conditions
    houseOwnership: "Rented",
    roofMaterial: "Tin",
    wallMaterial: "Brick",
    floorMaterial: "Cement",
    accessSafeDrinkingWater: "Yes",
    accessPrivateSanitaryToilet: "Yes",

    // Step 8: Family Demography
    childrenBelow15: "2",
    workingAgeMembers: "2",
    adultsOver65: "0",
    singleParentHousehold: "No",
    femaleHeadedHousehold: "No",

    // Step 9: Banking
    bankName: "Peoples Bank",
    branchCode: "045",
    accountNumber: "458932014589",
    accountHolderName: user?.name || "Aravinda Kumara",
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    if (errors[name]) {
      setErrors((prev) => {
        const copy = { ...prev };
        delete copy[name];
        return copy;
      });
    }
  };

  /* ─── Field Validation Engine ─── */
  const validateStep = (stepNumber) => {
    const newErrors = {};

    if (stepNumber === 1) {
      if (!form.fullName || form.fullName.trim().length < 3) {
        newErrors.fullName = "Please enter applicant's full legal name (min 3 characters).";
      }
      const nicRegex = /^([0-9]{9}[vVxX]|[0-9]{12})$/;
      if (!form.nic || !nicRegex.test(form.nic.trim())) {
        newErrors.nic = "Enter a valid Sri Lankan NIC (9 digits + V/X, or 12 digits).";
      }
      if (!form.dob) {
        newErrors.dob = "Please select date of birth.";
      } else {
        const birthDate = new Date(form.dob);
        const ageDiffMs = Date.now() - birthDate.getTime();
        const ageDate = new Date(ageDiffMs);
        const age = Math.abs(ageDate.getUTCFullYear() - 1970);
        if (age < 18) {
          newErrors.dob = "Applicant must be at least 18 years of age.";
        }
      }
      if (!form.gender) {
        newErrors.gender = "Please select gender.";
      }
      const phoneClean = form.mobilePhone ? form.mobilePhone.replace(/[^0-9+]/g, "") : "";
      if (!phoneClean || phoneClean.length < 9 || phoneClean.length > 15) {
        newErrors.mobilePhone = "Please enter a valid mobile contact number (e.g. 07XXXXXXXX).";
      }
      if (!form.gnDivision || form.gnDivision.trim().length < 2) {
        newErrors.gnDivision = "Please enter your Grama Niladhari (GN) division.";
      }
    }

    if (stepNumber === 2) {
      const members = parseInt(form.totalMembers);
      if (isNaN(members) || members < 1 || members > 30) {
        newErrors.totalMembers = "Family members must be at least 1.";
      }
      if (!form.existingWelfareProgrammes) {
        newErrors.existingWelfareProgrammes = "Please select an existing welfare option.";
      }
      if (!form.waitingListStatus) {
        newErrors.waitingListStatus = "Please select waiting list status.";
      }
      if (!form.applicationStatus) {
        newErrors.applicationStatus = "Please select application category.";
      }
    }

    if (stepNumber === 3) {
      if (!form.highestEducationHead) {
        newErrors.highestEducationHead = "Please select highest education level.";
      }
      if (!form.schoolAttendanceChildren) {
        newErrors.schoolAttendanceChildren = "Please select children's school attendance.";
      }
      if (!form.schoolDropoutStatus) {
        newErrors.schoolDropoutStatus = "Please select dropout status.";
      }
    }

    if (stepNumber === 4) {
      if (form.hasPermanentDisabilities === "Yes") {
        const dCount = parseInt(form.disabilityCount);
        if (isNaN(dCount) || dCount < 1) {
          newErrors.disabilityCount = "Please enter the count of disabled family members (min 1).";
        }
      }
      const elderlyCount = parseInt(form.fullyDependentElderlyCount);
      if (isNaN(elderlyCount) || elderlyCount < 0) {
        newErrors.fullyDependentElderlyCount = "Please enter a valid number (0 or more).";
      }
    }

    if (stepNumber === 5) {
      if (!form.primaryLivelihood) {
        newErrors.primaryLivelihood = "Please select primary livelihood source.";
      }
      const electricity = parseFloat(form.averageMonthlyElectricityKwh);
      if (isNaN(electricity) || electricity < 0) {
        newErrors.averageMonthlyElectricityKwh = "Please enter average monthly electricity units (0 or more).";
      }
      const income = parseFloat(form.estimatedMonthlyIncome);
      if (isNaN(income) || income < 0 || form.estimatedMonthlyIncome === "") {
        newErrors.estimatedMonthlyIncome = "Please enter valid estimated monthly household income (LKR).";
      }
      const expenses = parseFloat(form.regularMonthlyExpenses);
      if (isNaN(expenses) || expenses < 0 || form.regularMonthlyExpenses === "") {
        newErrors.regularMonthlyExpenses = "Please enter valid regular monthly household expenses (LKR).";
      }
    }

    if (stepNumber === 6) {
      if (!form.motorVehicles) newErrors.motorVehicles = "Please select motor vehicle status.";
      if (!form.consumerDurables) newErrors.consumerDurables = "Please select consumer durables owned.";
      if (!form.hasAgriculturalLand) newErrors.hasAgriculturalLand = "Please select agricultural land ownership.";
      if (!form.hasResidentialLand) newErrors.hasResidentialLand = "Please select residential land ownership.";
    }

    if (stepNumber === 7) {
      if (!form.houseOwnership) newErrors.houseOwnership = "Please select house ownership type.";
      if (!form.roofMaterial) newErrors.roofMaterial = "Please select roof material.";
      if (!form.wallMaterial) newErrors.wallMaterial = "Please select wall material.";
      if (!form.floorMaterial) newErrors.floorMaterial = "Please select floor material.";
      if (!form.accessSafeDrinkingWater) newErrors.accessSafeDrinkingWater = "Please specify drinking water access.";
      if (!form.accessPrivateSanitaryToilet) newErrors.accessPrivateSanitaryToilet = "Please specify toilet sanitation access.";
    }

    if (stepNumber === 8) {
      const c15 = parseInt(form.childrenBelow15);
      if (isNaN(c15) || c15 < 0) newErrors.childrenBelow15 = "Please enter a valid count (0 or more).";
      const wa = parseInt(form.workingAgeMembers);
      if (isNaN(wa) || wa < 0) newErrors.workingAgeMembers = "Please enter a valid count (0 or more).";
      const a65 = parseInt(form.adultsOver65);
      if (isNaN(a65) || a65 < 0) newErrors.adultsOver65 = "Please enter a valid count (0 or more).";
      if (!form.femaleHeadedHousehold) newErrors.femaleHeadedHousehold = "Please specify if female-headed household.";
    }

    if (stepNumber === 9) {
      if (!form.bankName || form.bankName.trim().length < 2) {
        newErrors.bankName = "Please enter bank name.";
      }
      if (!form.branchCode || form.branchCode.trim().length < 2) {
        newErrors.branchCode = "Please enter branch name or branch code.";
      }
      const accNumClean = form.accountNumber ? form.accountNumber.trim() : "";
      if (!accNumClean || accNumClean.length < 6 || accNumClean.length > 20) {
        newErrors.accountNumber = "Please enter a valid bank account number (6-20 digits).";
      }
      if (!form.accountHolderName || form.accountHolderName.trim().length < 3) {
        newErrors.accountHolderName = "Please enter account holder's full legal name.";
      }
    }

    if (stepNumber === 10) {
      if (!confirmed) {
        newErrors.confirmData = "Please check the confirmation box before submitting.";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => prev + 1);
      window.scrollTo({ top: 120, behavior: "smooth" });
    }
  };

  const handleStepClick = (targetStep) => {
    if (targetStep < currentStep) {
      setCurrentStep(targetStep);
    } else {
      if (validateStep(currentStep)) {
        setCurrentStep(targetStep);
      }
    }
  };

  const stepsList = [
    { num: 1, title: "Applicant Bio" },
    { num: 2, title: "Household" },
    { num: 3, title: "Education" },
    { num: 4, title: "Health" },
    { num: 5, title: "Economic" },
    { num: 6, title: "Assets" },
    { num: 7, title: "Housing" },
    { num: 8, title: "Demography" },
    { num: 9, title: "Banking" },
    { num: 10, title: "Review & Submit" },
  ];

  const handleSubmit = async () => {
    for (let s = 1; s <= 9; s++) {
      if (!validateStep(s)) {
        setCurrentStep(s);
        window.scrollTo({ top: 120, behavior: "smooth" });
        return;
      }
    }

    if (!confirmed) {
      setErrors({ confirmData: "Please check the confirmation box before submitting." });
      return;
    }

    setIsLoading(true);
    try {
      const payload = {
        did: user?.did || "did:smartgrama:prototype:001",
        userId: user?.memberId || "user-prototype-001",
        full_name: form.fullName,
        nic: form.nic,
        dob: form.dob,
        gender: form.gender,
        mobile: form.mobilePhone,
        address: form.permanentAddress,
        district: form.district,
        gn_division: form.gnDivision,
        family_size: Number(form.totalMembers) || 4,
        dependents_children: Number(form.childrenBelow15) || 2,
        elderly_count: Number(form.adultsOver65) || 0,
        disabled_members: Number(form.disabilityCount) || 0,
        monthly_income: Number(form.estimatedMonthlyIncome) || 45000,
        monthly_expenses: Number(form.regularMonthlyExpenses) || 25000,
        house_ownership: form.houseOwnership === "Owned" ? "own_permanent" : form.houseOwnership === "Temporary shelter" ? "own_temporary" : "rented",
        electricity_units_monthly: Number(form.averageMonthlyElectricityKwh) || 45,
        education: form.highestEducationHead,
        samurdhi_beneficiary: form.existingWelfareProgrammes === "Samurdhi",
      };

      const result = await assessWelfare(payload);
      navigate("/welfare-result", { state: { result } });
    } catch (error) {
      alert("Error processing welfare evaluation.");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const progressPercent = (currentStep / 10) * 100;

  const renderError = (field) => {
    if (!errors[field]) return null;
    return (
      <div style={{ display: "flex", alignItems: "center", gap: 5, color: "#dc2626", fontSize: 12, marginTop: 4, fontWeight: 600 }}>
        {Ico.errorDot} <span>{errors[field]}</span>
      </div>
    );
  };

  return (
    <div style={{
      minHeight: "100vh",
      backgroundImage: `url(${dashboardBg})`,
      backgroundSize: "cover",
      backgroundPosition: "center",
      backgroundAttachment: "fixed",
      position: "relative",
    }}>
      {/* Frosted subtle overlay */}
      <div style={{
        position: "absolute",
        inset: 0,
        background: "linear-gradient(175deg, rgba(241, 245, 249, 0.88) 0%, rgba(230, 238, 245, 0.92) 100%)",
        backdropFilter: "blur(4px)",
        pointerEvents: "none",
        zIndex: 0,
      }} />

      <div style={{ position: "relative", zIndex: 1 }}>
        <Header />

        <main className="content-container" style={{ display: "flex", flexDirection: "column", gap: 24, padding: "20px 36px 60px" }}>

          {/* Breadcrumb & Navigation Back */}
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              color: "#047857",
              fontSize: "14px",
              fontWeight: 700,
              cursor: "pointer",
              width: "fit-content",
            }}
            onClick={() => navigate("/welfare-landing")}
          >
            {Ico.arrowLeft}
            <span>Back to Welfare Portal</span>
          </div>

          {/* ═══════════════════════════════════════════════════
              TOP: HERO BANNER & STATUS BADGE
          ═══════════════════════════════════════════════════ */}
          <div style={{
            borderRadius: 22,
            overflow: "hidden",
            boxShadow: "0 16px 45px rgba(4, 20, 55, 0.16)",
            background: "linear-gradient(140deg, #0c1445 0%, #064e3b 100%)",
            color: "#fff",
            padding: "30px 36px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 20,
            position: "relative",
          }}>
            <div style={{ position: "absolute", top: -40, right: -40, width: 220, height: 220, borderRadius: "50%", background: "rgba(255,255,255,0.04)" }} />

            <div>
              <div style={{ fontSize: 11, fontWeight: 800, color: "#6ee7b7", textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 4 }}>
                Democratic Socialist Republic of Sri Lanka &bull; SmartGrama
              </div>
              <h1 style={{ fontSize: 26, fontWeight: 900, letterSpacing: -0.5, margin: "0 0 6px" }}>
                Aswesuma Welfare Benefit Application
              </h1>
              <p style={{ fontSize: 13, color: "rgba(255,255,255,0.75)", margin: 0, lineHeight: 1.5 }}>
                Official Government Welfare &amp; Direct Support Scheme &bull; Complete the 10 steps below to apply
              </p>
            </div>

            <div style={{
              background: "rgba(110, 231, 183, 0.18)",
              border: "1.5px solid rgba(110, 231, 183, 0.4)",
              borderRadius: "50px",
              padding: "8px 18px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              color: "#6ee7b7",
              fontSize: "12px",
              fontWeight: "700",
            }}>
              {Ico.shield}
              <span>DID: {user?.did || "did:smartgrama:prototype:001"}</span>
            </div>
          </div>

          {/* ═══════════════════════════════════════════════════
              10-STEP PROGRESS WIZARD BAR
          ═══════════════════════════════════════════════════ */}
          <div style={{
            background: "rgba(255, 255, 255, 0.94)",
            backdropFilter: "blur(12px)",
            borderRadius: 20,
            padding: "16px 20px",
            border: "1.5px solid rgba(255, 255, 255, 0.9)",
            boxShadow: "0 6px 20px rgba(0,0,0,0.03)",
          }}>
            <div style={{ display: "flex", overflowX: "auto", gap: "8px", paddingBottom: "10px" }}>
              {stepsList.map((s) => {
                const isCurrent = currentStep === s.num;
                const isDone = currentStep > s.num;
                return (
                  <div
                    key={s.num}
                    onClick={() => handleStepClick(s.num)}
                    style={{
                      flex: "1 0 110px",
                      padding: "10px 12px",
                      borderRadius: "14px",
                      textAlign: "center",
                      cursor: "pointer",
                      backgroundColor: isCurrent
                        ? "#064e3b"
                        : isDone
                        ? "#ecfdf5"
                        : "#f8fafc",
                      color: isCurrent
                        ? "#ffffff"
                        : isDone
                        ? "#047857"
                        : "#64748b",
                      border: isCurrent
                        ? "1.5px solid #064e3b"
                        : isDone
                        ? "1.5px solid #86efac"
                        : "1.5px solid #e2e8f0",
                      fontWeight: "700",
                      fontSize: "12px",
                      transition: "all 0.15s ease",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: 4,
                    }}
                  >
                    <div style={{
                      width: 22,
                      height: 22,
                      borderRadius: "50%",
                      background: isCurrent ? "#6ee7b7" : isDone ? "#059669" : "#e2e8f0",
                      color: isCurrent ? "#064e3b" : isDone ? "#fff" : "#64748b",
                      fontSize: "11px",
                      fontWeight: "800",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}>
                      {isDone ? Ico.check : s.num}
                    </div>
                    <div style={{ whiteSpace: "nowrap" }}>{s.title}</div>
                  </div>
                );
              })}
            </div>

            {/* Linear Progress Indicator */}
            <div style={{ width: "100%", height: 6, background: "#e2e8f0", borderRadius: 10, overflow: "hidden", marginTop: 8 }}>
              <div style={{
                height: "100%",
                width: `${progressPercent}%`,
                background: "linear-gradient(90deg, #059669, #34d399)",
                borderRadius: 10,
                transition: "width 0.3s ease",
              }} />
            </div>
          </div>

          {/* ═══════════════════════════════════════════════════
              MAIN FORM CARD + SUMMARY SIDEBAR
          ═══════════════════════════════════════════════════ */}
          <div style={{ display: "grid", gridTemplateColumns: "1.3fr 0.7fr", gap: 24, alignItems: "start" }}>

            {/* Form Wizard Card */}
            <div style={{
              background: "rgba(255, 255, 255, 0.95)",
              backdropFilter: "blur(16px)",
              borderRadius: 22,
              padding: "32px 36px",
              border: "1.5px solid rgba(255, 255, 255, 0.9)",
              boxShadow: "0 10px 30px rgba(0,0,0,0.05)",
            }}>

              {/* STEP 1: APPLICANT BIO */}
              {currentStep === 1 && (
                <div>
                  <h3 style={stepTitleStyle}>Step 1: Applicant Information</h3>
                  <div style={grid2ColStyle}>
                    <div className="input-group">
                      <label style={labelStyle}>Full Legal Name *</label>
                      <input
                        type="text"
                        name="fullName"
                        style={{ ...inputStyle, borderColor: errors.fullName ? "#ef4444" : "#e2e8f0" }}
                        value={form.fullName}
                        onChange={handleChange}
                        placeholder="e.g. Aravinda Kumara"
                      />
                      {renderError("fullName")}
                    </div>
                    <div className="input-group">
                      <label style={labelStyle}>National Identity Card (NIC) *</label>
                      <input
                        type="text"
                        name="nic"
                        style={{ ...inputStyle, borderColor: errors.nic ? "#ef4444" : "#e2e8f0" }}
                        value={form.nic}
                        onChange={handleChange}
                        placeholder="e.g. 200223003053 or 882341234V"
                      />
                      {renderError("nic")}
                    </div>
                    <div className="input-group">
                      <label style={labelStyle}>Date of Birth *</label>
                      <input
                        type="date"
                        name="dob"
                        style={{ ...inputStyle, borderColor: errors.dob ? "#ef4444" : "#e2e8f0" }}
                        value={form.dob}
                        onChange={handleChange}
                      />
                      {renderError("dob")}
                    </div>
                    <div className="input-group">
                      <label style={labelStyle}>Gender *</label>
                      <select
                        name="gender"
                        style={{ ...inputStyle, borderColor: errors.gender ? "#ef4444" : "#e2e8f0" }}
                        value={form.gender}
                        onChange={handleChange}
                      >
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                      {renderError("gender")}
                    </div>
                    <div className="input-group">
                      <label style={labelStyle}>Mobile Contact *</label>
                      <input
                        type="text"
                        name="mobilePhone"
                        style={{ ...inputStyle, borderColor: errors.mobilePhone ? "#ef4444" : "#e2e8f0" }}
                        value={form.mobilePhone}
                        onChange={handleChange}
                        placeholder="e.g. 0781453248"
                      />
                      {renderError("mobilePhone")}
                    </div>
                    <div className="input-group">
                      <label style={labelStyle}>GN Division *</label>
                      <input
                        type="text"
                        name="gnDivision"
                        style={{ ...inputStyle, borderColor: errors.gnDivision ? "#ef4444" : "#e2e8f0" }}
                        value={form.gnDivision}
                        onChange={handleChange}
                        placeholder="e.g. Minuwangoda North"
                      />
                      {renderError("gnDivision")}
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 2: HOUSEHOLD */}
              {currentStep === 2 && (
                <div>
                  <h3 style={stepTitleStyle}>Step 2: Household Structure</h3>
                  <div style={grid2ColStyle}>
                    <div className="input-group">
                      <label style={labelStyle}>Total Family Members *</label>
                      <input
                        type="number"
                        min="1"
                        name="totalMembers"
                        style={{ ...inputStyle, borderColor: errors.totalMembers ? "#ef4444" : "#e2e8f0" }}
                        value={form.totalMembers}
                        onChange={handleChange}
                      />
                      {renderError("totalMembers")}
                    </div>
                    <div className="input-group">
                      <label style={labelStyle}>Existing Welfare Programs</label>
                      <select
                        name="existingWelfareProgrammes"
                        style={inputStyle}
                        value={form.existingWelfareProgrammes}
                        onChange={handleChange}
                      >
                        <option value="None">None</option>
                        <option value="Samurdhi">Samurdhi Beneficiary</option>
                        <option value="Elderly Assistance">Elderly Allowance</option>
                      </select>
                      {renderError("existingWelfareProgrammes")}
                    </div>
                    <div className="input-group">
                      <label style={labelStyle}>Waiting List Status</label>
                      <select
                        name="waitingListStatus"
                        style={inputStyle}
                        value={form.waitingListStatus}
                        onChange={handleChange}
                      >
                        <option value="No">No</option>
                        <option value="Yes">Yes</option>
                      </select>
                      {renderError("waitingListStatus")}
                    </div>
                    <div className="input-group">
                      <label style={labelStyle}>Application Category</label>
                      <select
                        name="applicationStatus"
                        style={inputStyle}
                        value={form.applicationStatus}
                        onChange={handleChange}
                      >
                        <option value="New Applicant">New Applicant</option>
                        <option value="Existing Beneficiary">Existing Beneficiary (Reassessment)</option>
                      </select>
                      {renderError("applicationStatus")}
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 3: EDUCATION */}
              {currentStep === 3 && (
                <div>
                  <h3 style={stepTitleStyle}>Step 3: Education Level</h3>
                  <div style={grid2ColStyle}>
                    <div className="input-group" style={{ gridColumn: "1 / -1" }}>
                      <label style={labelStyle}>Highest Education Level of Household Head</label>
                      <select
                        name="highestEducationHead"
                        style={inputStyle}
                        value={form.highestEducationHead}
                        onChange={handleChange}
                      >
                        <option value="No Formal Education">No Formal Education</option>
                        <option value="Primary (Grades 1-5)">Primary (Grades 1-5)</option>
                        <option value="Secondary (Grades 6-11)">Secondary (Grades 6-11)</option>
                        <option value="G.C.E. O/L">G.C.E. Ordinary Level (O/L)</option>
                        <option value="G.C.E. A/L">G.C.E. Advanced Level (A/L)</option>
                        <option value="Higher Education / Degree">Higher Education / Degree</option>
                      </select>
                      {renderError("highestEducationHead")}
                    </div>
                    <div className="input-group">
                      <label style={labelStyle}>School Attendance of Children</label>
                      <select
                        name="schoolAttendanceChildren"
                        style={inputStyle}
                        value={form.schoolAttendanceChildren}
                        onChange={handleChange}
                      >
                        <option value="All Attend Regularly">All Attend Regularly</option>
                        <option value="Some Attend">Some Attend</option>
                        <option value="None Attend">None Attend</option>
                        <option value="No School-aged Children">No School-aged Children</option>
                      </select>
                      {renderError("schoolAttendanceChildren")}
                    </div>
                    <div className="input-group">
                      <label style={labelStyle}>School Dropout Status</label>
                      <select
                        name="schoolDropoutStatus"
                        style={inputStyle}
                        value={form.schoolDropoutStatus}
                        onChange={handleChange}
                      >
                        <option value="No Dropouts">No Dropouts</option>
                        <option value="Has Dropout Children">Has Dropout Children</option>
                      </select>
                      {renderError("schoolDropoutStatus")}
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 4: HEALTH */}
              {currentStep === 4 && (
                <div>
                  <h3 style={stepTitleStyle}>Step 4: Health &amp; Special Needs</h3>
                  <div style={grid2ColStyle}>
                    <div className="input-group">
                      <label style={labelStyle}>Permanent Disabilities in Household</label>
                      <select
                        name="hasPermanentDisabilities"
                        style={inputStyle}
                        value={form.hasPermanentDisabilities}
                        onChange={handleChange}
                      >
                        <option value="No">No</option>
                        <option value="Yes">Yes</option>
                      </select>
                    </div>
                    <div className="input-group">
                      <label style={labelStyle}>Disabled Members Count</label>
                      <input
                        type="number"
                        min="0"
                        name="disabilityCount"
                        style={{ ...inputStyle, borderColor: errors.disabilityCount ? "#ef4444" : "#e2e8f0" }}
                        value={form.disabilityCount}
                        onChange={handleChange}
                      />
                      {renderError("disabilityCount")}
                    </div>
                    <div className="input-group">
                      <label style={labelStyle}>Severe Chronic Illnesses</label>
                      <select
                        name="hasSevereChronicIllnesses"
                        style={inputStyle}
                        value={form.hasSevereChronicIllnesses}
                        onChange={handleChange}
                      >
                        <option value="No">No</option>
                        <option value="Yes">Yes</option>
                      </select>
                    </div>
                    <div className="input-group">
                      <label style={labelStyle}>Fully Dependent Elderly Count</label>
                      <input
                        type="number"
                        min="0"
                        name="fullyDependentElderlyCount"
                        style={{ ...inputStyle, borderColor: errors.fullyDependentElderlyCount ? "#ef4444" : "#e2e8f0" }}
                        value={form.fullyDependentElderlyCount}
                        onChange={handleChange}
                      />
                      {renderError("fullyDependentElderlyCount")}
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 5: ECONOMIC */}
              {currentStep === 5 && (
                <div>
                  <h3 style={stepTitleStyle}>Step 5: Economic &amp; Income Level</h3>
                  <div style={grid2ColStyle}>
                    <div className="input-group">
                      <label style={labelStyle}>Primary Livelihood Source *</label>
                      <select
                        name="primaryLivelihood"
                        style={{ ...inputStyle, borderColor: errors.primaryLivelihood ? "#ef4444" : "#e2e8f0" }}
                        value={form.primaryLivelihood}
                        onChange={handleChange}
                      >
                        <option value="Daily wage">Daily wage (Casual Labor)</option>
                        <option value="Agriculture">Agriculture / Farming</option>
                        <option value="Self-employment">Self-employment / Micro-enterprise</option>
                        <option value="Formal employment">Formal Private / Govt Employment</option>
                        <option value="Other">Other</option>
                      </select>
                      {renderError("primaryLivelihood")}
                    </div>
                    <div className="input-group">
                      <label style={labelStyle}>Average Monthly Electricity (kWh Units) *</label>
                      <input
                        type="number"
                        min="0"
                        name="averageMonthlyElectricityKwh"
                        style={{ ...inputStyle, borderColor: errors.averageMonthlyElectricityKwh ? "#ef4444" : "#e2e8f0" }}
                        value={form.averageMonthlyElectricityKwh}
                        onChange={handleChange}
                      />
                      {renderError("averageMonthlyElectricityKwh")}
                    </div>
                    <div className="input-group">
                      <label style={labelStyle}>Estimated Monthly Income (LKR) *</label>
                      <input
                        type="number"
                        min="0"
                        name="estimatedMonthlyIncome"
                        style={{ ...inputStyle, borderColor: errors.estimatedMonthlyIncome ? "#ef4444" : "#e2e8f0" }}
                        value={form.estimatedMonthlyIncome}
                        onChange={handleChange}
                        required
                      />
                      {renderError("estimatedMonthlyIncome")}
                    </div>
                    <div className="input-group">
                      <label style={labelStyle}>Regular Monthly Expenses (LKR) *</label>
                      <input
                        type="number"
                        min="0"
                        name="regularMonthlyExpenses"
                        style={{ ...inputStyle, borderColor: errors.regularMonthlyExpenses ? "#ef4444" : "#e2e8f0" }}
                        value={form.regularMonthlyExpenses}
                        onChange={handleChange}
                        required
                      />
                      {renderError("regularMonthlyExpenses")}
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 6: ASSETS */}
              {currentStep === 6 && (
                <div>
                  <h3 style={stepTitleStyle}>Step 6: Assets &amp; Land Ownership</h3>
                  <div style={grid2ColStyle}>
                    <div className="input-group">
                      <label style={labelStyle}>Motor Vehicle Ownership</label>
                      <select
                        name="motorVehicles"
                        style={inputStyle}
                        value={form.motorVehicles}
                        onChange={handleChange}
                      >
                        <option value="None">None</option>
                        <option value="Motorcycle">Motorcycle</option>
                        <option value="Three-wheeler">Three-wheeler</option>
                        <option value="Car / Van">Car / Van</option>
                        <option value="Tractor">Tractor</option>
                      </select>
                      {renderError("motorVehicles")}
                    </div>
                    <div className="input-group">
                      <label style={labelStyle}>Consumer Durables Owned</label>
                      <select
                        name="consumerDurables"
                        style={inputStyle}
                        value={form.consumerDurables}
                        onChange={handleChange}
                      >
                        <option value="None">None</option>
                        <option value="Television">Television</option>
                        <option value="Refrigerator">Refrigerator</option>
                        <option value="Washing Machine">Washing Machine</option>
                      </select>
                      {renderError("consumerDurables")}
                    </div>
                    <div className="input-group">
                      <label style={labelStyle}>Agricultural Land Ownership</label>
                      <select
                        name="hasAgriculturalLand"
                        style={inputStyle}
                        value={form.hasAgriculturalLand}
                        onChange={handleChange}
                      >
                        <option value="No">No</option>
                        <option value="Yes">Yes</option>
                      </select>
                      {renderError("hasAgriculturalLand")}
                    </div>
                    <div className="input-group">
                      <label style={labelStyle}>Residential Land Ownership</label>
                      <select
                        name="hasResidentialLand"
                        style={inputStyle}
                        value={form.hasResidentialLand}
                        onChange={handleChange}
                      >
                        <option value="Yes">Yes (Owned / Co-owned)</option>
                        <option value="No">No (Rented / Encroached)</option>
                      </select>
                      {renderError("hasResidentialLand")}
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 7: HOUSING */}
              {currentStep === 7 && (
                <div>
                  <h3 style={stepTitleStyle}>Step 7: Housing Conditions &amp; Sanitation</h3>
                  <div style={grid2ColStyle}>
                    <div className="input-group">
                      <label style={labelStyle}>House Ownership Type</label>
                      <select
                        name="houseOwnership"
                        style={inputStyle}
                        value={form.houseOwnership}
                        onChange={handleChange}
                      >
                        <option value="Rented">Rented / Leased</option>
                        <option value="Temporary shelter">Temporary / Improvised Structure</option>
                        <option value="Owned">Permanent Owned Structure</option>
                      </select>
                      {renderError("houseOwnership")}
                    </div>
                    <div className="input-group">
                      <label style={labelStyle}>Roof Material</label>
                      <select
                        name="roofMaterial"
                        style={inputStyle}
                        value={form.roofMaterial}
                        onChange={handleChange}
                      >
                        <option value="Tin">Tin / Zinc Sheets</option>
                        <option value="Asbestos">Asbestos Sheets</option>
                        <option value="Tile">Clay Tiles</option>
                        <option value="Thatched">Thatched / Coconut Leaves</option>
                      </select>
                      {renderError("roofMaterial")}
                    </div>
                    <div className="input-group">
                      <label style={labelStyle}>Wall Material</label>
                      <select
                        name="wallMaterial"
                        style={inputStyle}
                        value={form.wallMaterial}
                        onChange={handleChange}
                      >
                        <option value="Brick">Brick / Cement Blocks</option>
                        <option value="Clay">Clay / Mud</option>
                        <option value="Plank">Wood / Planks</option>
                      </select>
                      {renderError("wallMaterial")}
                    </div>
                    <div className="input-group">
                      <label style={labelStyle}>Floor Material</label>
                      <select
                        name="floorMaterial"
                        style={inputStyle}
                        value={form.floorMaterial}
                        onChange={handleChange}
                      >
                        <option value="Cement">Cement</option>
                        <option value="Tile">Tile</option>
                        <option value="Mud / Clay">Mud / Clay</option>
                      </select>
                      {renderError("floorMaterial")}
                    </div>
                    <div className="input-group">
                      <label style={labelStyle}>Access to Safe Drinking Water</label>
                      <select
                        name="accessSafeDrinkingWater"
                        style={inputStyle}
                        value={form.accessSafeDrinkingWater}
                        onChange={handleChange}
                      >
                        <option value="Yes">Yes (Pipe-borne / Protected Well)</option>
                        <option value="No">No</option>
                      </select>
                      {renderError("accessSafeDrinkingWater")}
                    </div>
                    <div className="input-group">
                      <label style={labelStyle}>Private Sanitary Toilet</label>
                      <select
                        name="accessPrivateSanitaryToilet"
                        style={inputStyle}
                        value={form.accessPrivateSanitaryToilet}
                        onChange={handleChange}
                      >
                        <option value="Yes">Yes</option>
                        <option value="No">No (Shared / None)</option>
                      </select>
                      {renderError("accessPrivateSanitaryToilet")}
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 8: DEMOGRAPHY */}
              {currentStep === 8 && (
                <div>
                  <h3 style={stepTitleStyle}>Step 8: Family Demography</h3>
                  <div style={grid2ColStyle}>
                    <div className="input-group">
                      <label style={labelStyle}>Children Below Age 15</label>
                      <input
                        type="number"
                        min="0"
                        name="childrenBelow15"
                        style={{ ...inputStyle, borderColor: errors.childrenBelow15 ? "#ef4444" : "#e2e8f0" }}
                        value={form.childrenBelow15}
                        onChange={handleChange}
                      />
                      {renderError("childrenBelow15")}
                    </div>
                    <div className="input-group">
                      <label style={labelStyle}>Working Age Members (15-64)</label>
                      <input
                        type="number"
                        min="0"
                        name="workingAgeMembers"
                        style={{ ...inputStyle, borderColor: errors.workingAgeMembers ? "#ef4444" : "#e2e8f0" }}
                        value={form.workingAgeMembers}
                        onChange={handleChange}
                      />
                      {renderError("workingAgeMembers")}
                    </div>
                    <div className="input-group">
                      <label style={labelStyle}>Adults Over Age 65</label>
                      <input
                        type="number"
                        min="0"
                        name="adultsOver65"
                        style={{ ...inputStyle, borderColor: errors.adultsOver65 ? "#ef4444" : "#e2e8f0" }}
                        value={form.adultsOver65}
                        onChange={handleChange}
                      />
                      {renderError("adultsOver65")}
                    </div>
                    <div className="input-group">
                      <label style={labelStyle}>Female-Headed Household</label>
                      <select
                        name="femaleHeadedHousehold"
                        style={inputStyle}
                        value={form.femaleHeadedHousehold}
                        onChange={handleChange}
                      >
                        <option value="No">No</option>
                        <option value="Yes">Yes</option>
                      </select>
                      {renderError("femaleHeadedHousehold")}
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 9: BANKING */}
              {currentStep === 9 && (
                <div>
                  <h3 style={stepTitleStyle}>Step 9: Banking Information for Welfare Disbursement</h3>
                  <div style={{ fontSize: "13px", color: "#64748b", marginBottom: "18px" }}>
                    Direct transfer destination for your monthly Aswesuma stipend.
                  </div>

                  <div style={{
                    background: "#fffbeb",
                    border: "1.5px solid #fde68a",
                    padding: "16px 18px",
                    borderRadius: "14px",
                    display: "flex",
                    gap: "12px",
                    marginBottom: "24px",
                    color: "#92400e",
                    fontSize: "13px",
                    fontWeight: "600",
                    lineHeight: 1.5,
                  }}>
                    <div style={{ color: "#d97706", flexShrink: 0, marginTop: 1 }}>{Ico.alert}</div>
                    <div>
                      <strong>Important:</strong> Please ensure the bank account holder's name matches the applicant's NIC information for automated Direct Benefit Transfer verification.
                    </div>
                  </div>

                  <div style={grid2ColStyle}>
                    <div className="input-group">
                      <label style={labelStyle}>Bank Name *</label>
                      <select name="bankName" value={form.bankName} onChange={handleChange} required className="w-full bg-white border border-slate-200 rounded-lg px-4 py-3 text-slate-700 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-colors">
              <option value="" disabled>Select Bank</option>
              <option value="Samurdhi Bank">Samurdhi Bank</option>
              <option value="Samupakara Bank">Samupakara Bank</option>
              <option value="Sanasa Bank">Sanasa Bank</option>
            </select>
                      {renderError("bankName")}
                    </div>
                    <div className="input-group">
                      <label style={labelStyle}>Branch Name / Code *</label>
                      <input
                        type="text"
                        name="branchCode"
                        style={{ ...inputStyle, borderColor: errors.branchCode ? "#ef4444" : "#e2e8f0" }}
                        value={form.branchCode}
                        onChange={handleChange}
                        placeholder="e.g. Minuwangoda (045)"
                      />
                      {renderError("branchCode")}
                    </div>
                    <div className="input-group">
                      <label style={labelStyle}>Account Number *</label>
                      <input
                        type="text"
                        name="accountNumber"
                        style={{ ...inputStyle, borderColor: errors.accountNumber ? "#ef4444" : "#e2e8f0" }}
                        value={form.accountNumber}
                        onChange={handleChange}
                        placeholder="e.g. 458932014589"
                      />
                      {renderError("accountNumber")}
                    </div>
                    <div className="input-group">
                      <label style={labelStyle}>Account Holder Name *</label>
                      <input
                        type="text"
                        name="accountHolderName"
                        style={{ ...inputStyle, borderColor: errors.accountHolderName ? "#ef4444" : "#e2e8f0" }}
                        value={form.accountHolderName}
                        onChange={handleChange}
                        placeholder="e.g. Aravinda Kumara"
                      />
                      {renderError("accountHolderName")}
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 10: REVIEW & SUBMIT */}
              {currentStep === 10 && (
                <div>
                  <div style={{ marginBottom: "24px" }}>
                    <div style={{ fontSize: "12px", fontWeight: "800", color: "#059669", textTransform: "uppercase", letterSpacing: "1.2px", marginBottom: "6px" }}>
                      Final Verification Step
                    </div>
                    <h3 style={{ fontSize: "22px", fontWeight: "900", color: "#0f172a", margin: "0 0 6px" }}>
                      Review Application &amp; Confirm Submission
                    </h3>
                    <p style={{ color: "#64748b", fontSize: "14px", margin: 0 }}>
                      Please review all details before submitting your application for welfare benefit evaluation.
                    </p>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "28px" }}>
                    {/* Card 1 */}
                    <div style={reviewCardStyle}>
                      <div style={reviewCardHeaderStyle}>
                        <h4 style={reviewCardTitleStyle}>1. Applicant Information</h4>
                        <button type="button" onClick={() => setCurrentStep(1)} style={editBtnStyle}>{Ico.edit}</button>
                      </div>
                      <div style={reviewListStyle}>
                        <div style={reviewItemStyle}><span style={reviewLabelStyle}>Full Name:</span> <strong style={reviewValStyle}>{form.fullName}</strong></div>
                        <div style={reviewItemStyle}><span style={reviewLabelStyle}>NIC:</span> <strong style={reviewValStyle}>{form.nic}</strong></div>
                        <div style={reviewItemStyle}><span style={reviewLabelStyle}>Gender:</span> <strong style={reviewValStyle}>{form.gender}</strong></div>
                        <div style={reviewItemStyle}><span style={reviewLabelStyle}>Mobile:</span> <strong style={reviewValStyle}>{form.mobilePhone}</strong></div>
                        <div style={reviewItemStyle}><span style={reviewLabelStyle}>District:</span> <strong style={reviewValStyle}>{form.district}</strong></div>
                        <div style={reviewItemStyle}><span style={reviewLabelStyle}>GN Division:</span> <strong style={reviewValStyle}>{form.gnDivision}</strong></div>
                      </div>
                    </div>

                    {/* Card 2 */}
                    <div style={reviewCardStyle}>
                      <div style={reviewCardHeaderStyle}>
                        <h4 style={reviewCardTitleStyle}>2. Household &amp; Programme</h4>
                        <button type="button" onClick={() => setCurrentStep(2)} style={editBtnStyle}>{Ico.edit}</button>
                      </div>
                      <div style={reviewListStyle}>
                        <div style={reviewItemStyle}><span style={reviewLabelStyle}>Total Members:</span> <strong style={reviewValStyle}>{form.totalMembers}</strong></div>
                        <div style={reviewItemStyle}><span style={reviewLabelStyle}>Application Status:</span> <strong style={reviewValStyle}>{form.applicationStatus}</strong></div>
                        <div style={reviewItemStyle}><span style={reviewLabelStyle}>Existing Welfare:</span> <strong style={reviewValStyle}>{form.existingWelfareProgrammes}</strong></div>
                        <div style={reviewItemStyle}><span style={reviewLabelStyle}>Waiting List:</span> <strong style={reviewValStyle}>{form.waitingListStatus}</strong></div>
                      </div>
                    </div>

                    {/* Card 3 */}
                    <div style={reviewCardStyle}>
                      <div style={reviewCardHeaderStyle}>
                        <h4 style={reviewCardTitleStyle}>3 &amp; 4. Education &amp; Health</h4>
                        <button type="button" onClick={() => setCurrentStep(3)} style={editBtnStyle}>{Ico.edit}</button>
                      </div>
                      <div style={reviewListStyle}>
                        <div style={reviewItemStyle}><span style={reviewLabelStyle}>Head Education:</span> <strong style={reviewValStyle}>{form.highestEducationHead}</strong></div>
                        <div style={reviewItemStyle}><span style={reviewLabelStyle}>School Attendance:</span> <strong style={reviewValStyle}>{form.schoolAttendanceChildren}</strong></div>
                        <div style={reviewItemStyle}><span style={reviewLabelStyle}>Disabilities Count:</span> <strong style={reviewValStyle}>{form.disabilityCount}</strong></div>
                        <div style={reviewItemStyle}><span style={reviewLabelStyle}>Dependent Elderly:</span> <strong style={reviewValStyle}>{form.fullyDependentElderlyCount}</strong></div>
                      </div>
                    </div>

                    {/* Card 4 */}
                    <div style={reviewCardStyle}>
                      <div style={reviewCardHeaderStyle}>
                        <h4 style={reviewCardTitleStyle}>5 &amp; 6. Economic Level &amp; Assets</h4>
                        <button type="button" onClick={() => setCurrentStep(5)} style={editBtnStyle}>{Ico.edit}</button>
                      </div>
                      <div style={reviewListStyle}>
                        <div style={reviewItemStyle}><span style={reviewLabelStyle}>Primary Livelihood:</span> <strong style={reviewValStyle}>{form.primaryLivelihood}</strong></div>
                        <div style={reviewItemStyle}><span style={reviewLabelStyle}>Monthly Income:</span> <strong style={reviewValStyle}>Rs. {Number(form.estimatedMonthlyIncome || 0).toLocaleString()}</strong></div>
                        <div style={reviewItemStyle}><span style={reviewLabelStyle}>Monthly Expenses:</span> <strong style={reviewValStyle}>Rs. {Number(form.regularMonthlyExpenses || 0).toLocaleString()}</strong></div>
                        <div style={reviewItemStyle}><span style={reviewLabelStyle}>Electricity (kWh):</span> <strong style={reviewValStyle}>{form.averageMonthlyElectricityKwh} units</strong></div>
                        <div style={reviewItemStyle}><span style={reviewLabelStyle}>Vehicles Owned:</span> <strong style={reviewValStyle}>{form.motorVehicles}</strong></div>
                      </div>
                    </div>

                    {/* Card 5 */}
                    <div style={reviewCardStyle}>
                      <div style={reviewCardHeaderStyle}>
                        <h4 style={reviewCardTitleStyle}>7 &amp; 8. Housing &amp; Family</h4>
                        <button type="button" onClick={() => setCurrentStep(7)} style={editBtnStyle}>{Ico.edit}</button>
                      </div>
                      <div style={reviewListStyle}>
                        <div style={reviewItemStyle}><span style={reviewLabelStyle}>House Ownership:</span> <strong style={reviewValStyle}>{form.houseOwnership}</strong></div>
                        <div style={reviewItemStyle}><span style={reviewLabelStyle}>Materials:</span> <strong style={reviewValStyle}>{form.roofMaterial} / {form.wallMaterial} / {form.floorMaterial}</strong></div>
                        <div style={reviewItemStyle}><span style={reviewLabelStyle}>Safe Water / Toilet:</span> <strong style={reviewValStyle}>{form.accessSafeDrinkingWater} / {form.accessPrivateSanitaryToilet}</strong></div>
                        <div style={reviewItemStyle}><span style={reviewLabelStyle}>Children &lt; 15:</span> <strong style={reviewValStyle}>{form.childrenBelow15}</strong></div>
                      </div>
                    </div>

                    {/* Card 6 */}
                    <div style={reviewCardStyle}>
                      <div style={reviewCardHeaderStyle}>
                        <h4 style={reviewCardTitleStyle}>9. Banking Disbursement</h4>
                        <button type="button" onClick={() => setCurrentStep(9)} style={editBtnStyle}>{Ico.edit}</button>
                      </div>
                      <div style={reviewListStyle}>
                        <div style={reviewItemStyle}><span style={reviewLabelStyle}>Bank Name:</span> <strong style={reviewValStyle}>{form.bankName}</strong></div>
                        <div style={reviewItemStyle}><span style={reviewLabelStyle}>Branch:</span> <strong style={reviewValStyle}>{form.branchCode}</strong></div>
                        <div style={reviewItemStyle}><span style={reviewLabelStyle}>Account Number:</span> <strong style={reviewValStyle}>{form.accountNumber ? `******${form.accountNumber.slice(-4)}` : "******6789"}</strong></div>
                        <div style={reviewItemStyle}><span style={reviewLabelStyle}>Account Holder:</span> <strong style={reviewValStyle}>{form.accountHolderName}</strong></div>
                      </div>
                    </div>
                  </div>

                  <div style={{
                    background: errors.confirmData ? "#fef2f2" : "#f0fdf4",
                    padding: "16px 20px",
                    borderRadius: "14px",
                    border: errors.confirmData ? "1.5px solid #f87171" : "1.5px solid #bbf7d0",
                    display: "flex",
                    flexDirection: "column",
                    gap: "8px",
                    marginBottom: "24px",
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <input
                        type="checkbox"
                        id="confirmData"
                        checked={confirmed}
                        onChange={(e) => {
                          setConfirmed(e.target.checked);
                          if (e.target.checked && errors.confirmData) {
                            setErrors((prev) => {
                              const copy = { ...prev };
                              delete copy.confirmData;
                              return copy;
                            });
                          }
                        }}
                        style={{ width: "20px", height: "20px", accentColor: "#059669", cursor: "pointer" }}
                      />
                      <label htmlFor="confirmData" style={{ fontSize: "14px", color: errors.confirmData ? "#991b1b" : "#166534", fontWeight: "700", cursor: "pointer" }}>
                        I confirm that the information provided is accurate and authentic to the best of my knowledge under the SmartGrama Welfare Framework.
                      </label>
                    </div>
                    {renderError("confirmData")}
                  </div>
                </div>
              )}

              {/* Navigation Buttons */}
              <div style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginTop: "32px",
                borderTop: "1px solid #e2e8f0",
                paddingTop: "24px",
              }}>
                {currentStep > 1 ? (
                  <button
                    type="button"
                    onClick={() => {
                      setCurrentStep(currentStep - 1);
                      window.scrollTo({ top: 120, behavior: "smooth" });
                    }}
                    style={{
                      background: "#f8fafc",
                      color: "#334151",
                      border: "1.5px solid #e2e8f0",
                      padding: "12px 24px",
                      borderRadius: "12px",
                      fontWeight: "700",
                      fontSize: "14px",
                      cursor: "pointer",
                      fontFamily: "inherit",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      transition: "all 0.15s ease",
                    }}
                  >
                    {Ico.arrowLeft} Previous Step
                  </button>
                ) : <div />}

                {currentStep < 10 ? (
                  <button
                    type="button"
                    onClick={handleNext}
                    style={{
                      background: "linear-gradient(135deg, #059669 0%, #064e3b 100%)",
                      color: "white",
                      border: "none",
                      padding: "13px 30px",
                      borderRadius: "12px",
                      fontWeight: "800",
                      fontSize: "14px",
                      cursor: "pointer",
                      fontFamily: "inherit",
                      boxShadow: "0 4px 16px rgba(5, 150, 105, 0.3)",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      transition: "transform 0.15s ease",
                    }}
                    onMouseEnter={e => e.currentTarget.style.transform = "translateY(-2px)"}
                    onMouseLeave={e => e.currentTarget.style.transform = ""}
                  >
                    Next Step ({currentStep + 1}/10) {Ico.arrowRight}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={isLoading}
                    style={{
                      background: "linear-gradient(135deg, #059669 0%, #064e3b 100%)",
                      color: "white",
                      border: "none",
                      padding: "15px 36px",
                      borderRadius: "14px",
                      fontWeight: "900",
                      cursor: isLoading ? "not-allowed" : "pointer",
                      fontSize: "16px",
                      fontFamily: "inherit",
                      boxShadow: "0 6px 22px rgba(5, 150, 105, 0.35)",
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      transition: "transform 0.15s ease",
                    }}
                    onMouseEnter={e => !isLoading && (e.currentTarget.style.transform = "translateY(-2px)")}
                    onMouseLeave={e => (e.currentTarget.style.transform = "")}
                  >
                    {isLoading ? "Evaluating Eligibility & Submitting..." : "Submit Aswesuma Application"}
                    {!isLoading && Ico.arrowRight}
                  </button>
                )}
              </div>

            </div>

            {/* Right Summary Sidebar Card */}
            <div style={{ height: "fit-content", position: "sticky", top: "20px", display: "flex", flexDirection: "column", gap: 16 }}>
              {/* Bracket card */}
              <div style={{
                background: "rgba(255, 255, 255, 0.95)",
                backdropFilter: "blur(14px)",
                borderRadius: 22,
                padding: "28px 26px",
                border: "1.5px solid #86efac",
                boxShadow: "0 10px 30px rgba(6, 78, 59, 0.08)",
              }}>
                <div style={{ fontSize: "11px", fontWeight: "800", color: "#059669", letterSpacing: "1px", textTransform: "uppercase", marginBottom: "6px" }}>
                  Aswesuma Benefit Brackets
                </div>
                <div style={{ fontSize: "32px", fontWeight: "900", color: "#064e3b", marginBottom: "2px", letterSpacing: "-1px" }}>
                  Up to Rs. 15,000
                </div>
                <div style={{ fontSize: "12px", color: "#64748b", marginBottom: "20px" }}>
                  PMT score determines monthly stipend tier
                </div>

                <div style={{ borderTop: "1px solid #e2e8f0", paddingTop: "16px", display: "flex", flexDirection: "column", gap: "10px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px" }}>
                    <span style={{ color: "#475569", fontWeight: "600" }}>Severely Impoverished</span>
                    <strong style={{ color: "#064e3b" }}>Rs. 15,000 / mo</strong>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px" }}>
                    <span style={{ color: "#475569", fontWeight: "600" }}>Poor Bracket</span>
                    <strong style={{ color: "#064e3b" }}>Rs. 8,500 / mo</strong>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px" }}>
                    <span style={{ color: "#475569", fontWeight: "600" }}>Vulnerable Bracket</span>
                    <strong style={{ color: "#064e3b" }}>Rs. 4,500 / mo</strong>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px" }}>
                    <span style={{ color: "#475569", fontWeight: "600" }}>Transitional Bracket</span>
                    <strong style={{ color: "#064e3b" }}>Rs. 2,500 / mo</strong>
                  </div>
                </div>
              </div>

              {/* Assistance Box */}
              <div style={{
                background: "#ffffff",
                borderRadius: 18,
                padding: "20px 22px",
                border: "1.5px solid #f1f5f9",
                boxShadow: "0 4px 14px rgba(0,0,0,0.03)",
              }}>
                <div style={{ fontSize: 13, fontWeight: 800, color: "#0f172a", marginBottom: 4 }}>Need Help with Your Intake?</div>
                <div style={{ fontSize: 12, color: "#64748b", lineHeight: 1.5 }}>
                  Ask SmartGrama AI for immediate assistance in Sinhala, Tamil, or English.
                </div>
                <button
                  type="button"
                  onClick={() => navigate("/ai-chat")}
                  style={{
                    marginTop: 12,
                    width: "100%",
                    padding: "10px 14px",
                    borderRadius: 10,
                    border: "1.5px solid #e2e8f0",
                    background: "#f8fafc",
                    color: "#0f172a",
                    fontWeight: 700,
                    fontSize: 13,
                    cursor: "pointer",
                    fontFamily: "inherit",
                  }}
                >
                  Ask AI Assistant &rarr;
                </button>
              </div>
            </div>

          </div>
        </main>
      </div>
    </div>
  );
}

/* ─── Reusable Clean Styles ─── */
const stepTitleStyle = {
  fontSize: "19px",
  fontWeight: "800",
  color: "#0f172a",
  borderBottom: "1px solid #f1f5f9",
  paddingBottom: "14px",
  marginBottom: "24px",
  letterSpacing: "-0.3px",
};

const grid2ColStyle = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: "18px 20px",
};

const labelStyle = {
  fontSize: "13px",
  fontWeight: "700",
  color: "#334151",
  marginBottom: "6px",
  display: "block",
};

const inputStyle = {
  width: "100%",
  padding: "12px 14px",
  fontSize: "14px",
  color: "#0f172a",
  background: "#f8fafc",
  border: "1.5px solid #e2e8f0",
  borderRadius: "12px",
  outline: "none",
  fontFamily: "inherit",
  boxSizing: "border-box",
  transition: "border-color 0.15s ease",
};

const reviewCardStyle = {
  border: "1.5px solid #e2e8f0",
  borderRadius: "16px",
  padding: "18px 20px",
  background: "#ffffff",
  boxShadow: "0 2px 8px rgba(0,0,0,0.02)",
};

const reviewCardHeaderStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: "12px",
  borderBottom: "1px solid #f1f5f9",
  paddingBottom: "10px",
};

const reviewCardTitleStyle = {
  fontSize: "14px",
  fontWeight: "800",
  color: "#0f172a",
  margin: 0,
};

const editBtnStyle = {
  background: "#ecfdf5",
  color: "#059669",
  border: "1px solid #a7f3d0",
  borderRadius: "8px",
  padding: "4px 8px",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const reviewListStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "6px",
  fontSize: "13px",
};

const reviewItemStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
};

const reviewLabelStyle = {
  color: "#64748b",
  fontWeight: "500",
};

const reviewValStyle = {
  color: "#0f172a",
  fontWeight: "700",
  textAlign: "right",
};
