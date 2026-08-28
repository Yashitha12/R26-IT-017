import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import { assessWelfare } from "../api/loanApi";
import { getCurrentUser } from "../utils/user";

export default function WelfareApplication() {
  const navigate = useNavigate();
  const user = getCurrentUser();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  // KYC Verification Gatekeeping Check
  const hasVerifiedDid = Boolean(user?.did || user?.kycStatus === "VERIFIED");

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
    existingWelfareProgrammes: "None", // 'Samurdhi' | 'None'
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
    houseOwnership: "Rented", // 'Owned' | 'Rented' | 'Temporary shelter'
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
    setForm({
      ...form,
      [name]: type === "checkbox" ? checked : value,
    });
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
      // Route to dashboard so user can view their submitted welfare programs
      navigate("/welfare");
    } catch (error) {
      alert("Error processing welfare evaluation.");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

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
        <span>Welfare Portal</span>
      </div>

      <main className="content-container" style={{ paddingBottom: "60px" }}>

        {/* Title & Gated Identity Badge */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "24px" }}>
          <div>
            <h2 style={{ fontSize: "22px", fontWeight: "bold", color: "var(--text-primary)" }}>
              Aswesuma 10-Step Welfare Intake & PMT Evaluation
            </h2>
            <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginTop: "4px" }}>
              Decentralized Identity Gated • Off-Chain PMT Scoring Engine • Zero-PII Blockchain Anchor
            </p>
          </div>
          <div style={{ background: "#dcfce7", border: "1px solid #86efac", borderRadius: "10px", padding: "8px 16px", display: "flex", alignItems: "center", gap: "8px" }}>
            <i className="fa-solid fa-shield-check" style={{ color: "#16a34a" }}></i>
            <span style={{ fontSize: "12px", fontWeight: "bold", color: "#166534" }}>
              DID: {user?.did || "did:smartgrama:prototype:001"}
            </span>
          </div>
        </div>

        {/* Step Progress Wizard Bar */}
        <div style={{ display: "flex", overflowX: "auto", gap: "6px", marginBottom: "32px", paddingBottom: "8px" }}>
          {stepsList.map((s) => (
            <div
              key={s.num}
              onClick={() => setCurrentStep(s.num)}
              style={{
                flex: "1 0 100px",
                padding: "10px 8px",
                borderRadius: "8px",
                textAlign: "center",
                cursor: "pointer",
                backgroundColor: currentStep === s.num ? "#2563eb" : currentStep > s.num ? "#dbeafe" : "#f1f5f9",
                color: currentStep === s.num ? "white" : currentStep > s.num ? "#1e40af" : "#64748b",
                fontWeight: "600",
                fontSize: "12px",
                transition: "all 0.2s",
              }}
            >
              <div>{s.num}. {s.title}</div>
            </div>
          ))}
        </div>

        <div className="dashboard-grid" style={{ gridTemplateColumns: "2fr 1fr", gap: "32px" }}>
          {/* Main Wizard Form Card */}
          <div className="card" style={{ padding: "32px" }}>

            {/* STEP 1: APPLICANT BIO */}
            {currentStep === 1 && (
              <div>
                <h3 style={stepTitleStyle}>Step 1: Applicant Information</h3>
                <div style={grid2ColStyle}>
                  <div className="input-group">
                    <label>Full Legal Name</label>
                    <input type="text" name="fullName" className="form-input" value={form.fullName} onChange={handleChange} />
                  </div>
                  <div className="input-group">
                    <label>National Identity Card (NIC)</label>
                    <input type="text" name="nic" className="form-input" value={form.nic} onChange={handleChange} />
                  </div>
                  <div className="input-group">
                    <label>Date of Birth</label>
                    <input type="date" name="dob" className="form-input" value={form.dob} onChange={handleChange} />
                  </div>
                  <div className="input-group">
                    <label>Gender</label>
                    <select name="gender" className="form-input" value={form.gender} onChange={handleChange}>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div className="input-group">
                    <label>Mobile Contact</label>
                    <input type="text" name="mobilePhone" className="form-input" value={form.mobilePhone} onChange={handleChange} />
                  </div>
                  <div className="input-group">
                    <label>GN Division</label>
                    <input type="text" name="gnDivision" className="form-input" value={form.gnDivision} onChange={handleChange} />
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
                    <label>Total Family Members</label>
                    <input type="number" name="totalMembers" className="form-input" value={form.totalMembers} onChange={handleChange} />
                  </div>
                  <div className="input-group">
                    <label>Existing Welfare Programs</label>
                    <select name="existingWelfareProgrammes" className="form-input" value={form.existingWelfareProgrammes} onChange={handleChange}>
                      <option value="None">None</option>
                      <option value="Samurdhi">Samurdhi Beneficiary</option>
                      <option value="Elderly Assistance">Elderly Allowance</option>
                    </select>
                  </div>
                  <div className="input-group">
                    <label>Waiting List Status</label>
                    <select name="waitingListStatus" className="form-input" value={form.waitingListStatus} onChange={handleChange}>
                      <option value="No">No</option>
                      <option value="Yes">Yes</option>
                    </select>
                  </div>
                  <div className="input-group">
                    <label>Application Category</label>
                    <select name="applicationStatus" className="form-input" value={form.applicationStatus} onChange={handleChange}>
                      <option value="New Applicant">New Applicant</option>
                      <option value="Existing Beneficiary">Existing Beneficiary (Reassessment)</option>
                    </select>
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
                    <label>Highest Education Level of Household Head</label>
                    <select name="highestEducationHead" className="form-input" value={form.highestEducationHead} onChange={handleChange}>
                      <option value="No Formal Education">No Formal Education</option>
                      <option value="Primary (Grades 1-5)">Primary (Grades 1-5)</option>
                      <option value="Secondary (Grades 6-11)">Secondary (Grades 6-11)</option>
                      <option value="G.C.E. O/L">G.C.E. Ordinary Level (O/L)</option>
                      <option value="G.C.E. A/L">G.C.E. Advanced Level (A/L)</option>
                      <option value="Higher Education / Degree">Higher Education / Degree</option>
                    </select>
                  </div>
                  <div className="input-group">
                    <label>School Attendance of Children</label>
                    <select name="schoolAttendanceChildren" className="form-input" value={form.schoolAttendanceChildren} onChange={handleChange}>
                      <option value="All Attend Regularly">All Attend Regularly</option>
                      <option value="Some Attend">Some Attend</option>
                      <option value="None Attend">None Attend</option>
                      <option value="No School-aged Children">No School-aged Children</option>
                    </select>
                  </div>
                  <div className="input-group">
                    <label>School Dropout Status</label>
                    <select name="schoolDropoutStatus" className="form-input" value={form.schoolDropoutStatus} onChange={handleChange}>
                      <option value="No Dropouts">No Dropouts</option>
                      <option value="Has Dropout Children">Has Dropout Children</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 4: HEALTH */}
            {currentStep === 4 && (
              <div>
                <h3 style={stepTitleStyle}>Step 4: Health & Special Needs</h3>
                <div style={grid2ColStyle}>
                  <div className="input-group">
                    <label>Permanent Disabilities in Household</label>
                    <select name="hasPermanentDisabilities" className="form-input" value={form.hasPermanentDisabilities} onChange={handleChange}>
                      <option value="No">No</option>
                      <option value="Yes">Yes</option>
                    </select>
                  </div>
                  <div className="input-group">
                    <label>Disabled Members Count</label>
                    <input type="number" name="disabilityCount" className="form-input" value={form.disabilityCount} onChange={handleChange} />
                  </div>
                  <div className="input-group">
                    <label>Severe Chronic Illnesses</label>
                    <select name="hasSevereChronicIllnesses" className="form-input" value={form.hasSevereChronicIllnesses} onChange={handleChange}>
                      <option value="No">No</option>
                      <option value="Yes">Yes</option>
                    </select>
                  </div>
                  <div className="input-group">
                    <label>Fully Dependent Elderly Count</label>
                    <input type="number" name="fullyDependentElderlyCount" className="form-input" value={form.fullyDependentElderlyCount} onChange={handleChange} />
                  </div>
                </div>
              </div>
            )}

            {/* STEP 5: ECONOMIC */}
            {currentStep === 5 && (
              <div>
                <h3 style={stepTitleStyle}>Step 5: Economic & Income Level</h3>
                <div style={grid2ColStyle}>
                  <div className="input-group">
                    <label>Primary Livelihood Source</label>
                    <select name="primaryLivelihood" className="form-input" value={form.primaryLivelihood} onChange={handleChange}>
                      <option value="Daily wage">Daily wage (Casual Labor)</option>
                      <option value="Agriculture">Agriculture / Farming</option>
                      <option value="Self-employment">Self-employment / Micro-enterprise</option>
                      <option value="Formal employment">Formal Private / Govt Employment</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div className="input-group">
                    <label>Average Monthly Electricity (kWh Units)</label>
                    <input type="number" name="averageMonthlyElectricityKwh" className="form-input" value={form.averageMonthlyElectricityKwh} onChange={handleChange} />
                  </div>
                  <div className="input-group">
                    <label>Estimated Monthly Income (LKR) *</label>
                    <input type="number" name="estimatedMonthlyIncome" className="form-input" value={form.estimatedMonthlyIncome} onChange={handleChange} required />
                  </div>
                  <div className="input-group">
                    <label>Regular Monthly Expenses (LKR) *</label>
                    <input type="number" name="regularMonthlyExpenses" className="form-input" value={form.regularMonthlyExpenses} onChange={handleChange} required />
                  </div>
                </div>
              </div>
            )}

            {/* STEP 6: ASSETS */}
            {currentStep === 6 && (
              <div>
                <h3 style={stepTitleStyle}>Step 6: Assets & Land Ownership</h3>
                <div style={grid2ColStyle}>
                  <div className="input-group">
                    <label>Motor Vehicle Ownership</label>
                    <select name="motorVehicles" className="form-input" value={form.motorVehicles} onChange={handleChange}>
                      <option value="None">None</option>
                      <option value="Motorcycle">Motorcycle</option>
                      <option value="Three-wheeler">Three-wheeler</option>
                      <option value="Car / Van">Car / Van</option>
                      <option value="Tractor">Tractor</option>
                    </select>
                  </div>
                  <div className="input-group">
                    <label>Consumer Durables Owned</label>
                    <select name="consumerDurables" className="form-input" value={form.consumerDurables} onChange={handleChange}>
                      <option value="None">None</option>
                      <option value="Television">Television</option>
                      <option value="Refrigerator">Refrigerator</option>
                      <option value="Washing Machine">Washing Machine</option>
                    </select>
                  </div>
                  <div className="input-group">
                    <label>Agricultural Land Ownership</label>
                    <select name="hasAgriculturalLand" className="form-input" value={form.hasAgriculturalLand} onChange={handleChange}>
                      <option value="No">No</option>
                      <option value="Yes">Yes</option>
                    </select>
                  </div>
                  <div className="input-group">
                    <label>Residential Land Ownership</label>
                    <select name="hasResidentialLand" className="form-input" value={form.hasResidentialLand} onChange={handleChange}>
                      <option value="Yes">Yes (Owned / Co-owned)</option>
                      <option value="No">No (Rented / Encroached)</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 7: HOUSING */}
            {currentStep === 7 && (
              <div>
                <h3 style={stepTitleStyle}>Step 7: Housing Conditions & Sanitation</h3>
                <div style={grid2ColStyle}>
                  <div className="input-group">
                    <label>House Ownership Type</label>
                    <select name="houseOwnership" className="form-input" value={form.houseOwnership} onChange={handleChange}>
                      <option value="Rented">Rented / Leased</option>
                      <option value="Temporary shelter">Temporary / Improvised Structure</option>
                      <option value="Owned">Permanent Owned Structure</option>
                    </select>
                  </div>
                  <div className="input-group">
                    <label>Roof Material</label>
                    <select name="roofMaterial" className="form-input" value={form.roofMaterial} onChange={handleChange}>
                      <option value="Tin">Tin / Zinc Sheets</option>
                      <option value="Asbestos">Asbestos Sheets</option>
                      <option value="Tile">Clay Tiles</option>
                      <option value="Thatched">Thatched / Coconut Leaves</option>
                    </select>
                  </div>
                  <div className="input-group">
                    <label>Wall Material</label>
                    <select name="wallMaterial" className="form-input" value={form.wallMaterial} onChange={handleChange}>
                      <option value="Brick">Brick / Cement Blocks</option>
                      <option value="Clay">Clay / Mud</option>
                      <option value="Plank">Wood / Planks</option>
                    </select>
                  </div>
                  <div className="input-group">
                    <label>Floor Material</label>
                    <select name="floorMaterial" className="form-input" value={form.floorMaterial} onChange={handleChange}>
                      <option value="Cement">Cement</option>
                      <option value="Tile">Tile</option>
                      <option value="Mud / Clay">Mud / Clay</option>
                    </select>
                  </div>
                  <div className="input-group">
                    <label>Access to Safe Drinking Water</label>
                    <select name="accessSafeDrinkingWater" className="form-input" value={form.accessSafeDrinkingWater} onChange={handleChange}>
                      <option value="Yes">Yes (Pipe-borne / Protected Well)</option>
                      <option value="No">No</option>
                    </select>
                  </div>
                  <div className="input-group">
                    <label>Private Sanitary Toilet</label>
                    <select name="accessPrivateSanitaryToilet" className="form-input" value={form.accessPrivateSanitaryToilet} onChange={handleChange}>
                      <option value="Yes">Yes</option>
                      <option value="No">No (Shared / None)</option>
                    </select>
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
                    <label>Children Below Age 15</label>
                    <input type="number" name="childrenBelow15" className="form-input" value={form.childrenBelow15} onChange={handleChange} />
                  </div>
                  <div className="input-group">
                    <label>Working Age Members (15-64)</label>
                    <input type="number" name="workingAgeMembers" className="form-input" value={form.workingAgeMembers} onChange={handleChange} />
                  </div>
                  <div className="input-group">
                    <label>Adults Over Age 65</label>
                    <input type="number" name="adultsOver65" className="form-input" value={form.adultsOver65} onChange={handleChange} />
                  </div>
                  <div className="input-group">
                    <label>Female-Headed Household</label>
                    <select name="femaleHeadedHousehold" className="form-input" value={form.femaleHeadedHousehold} onChange={handleChange}>
                      <option value="No">No</option>
                      <option value="Yes">Yes</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 9: BANKING */}
            {currentStep === 9 && (
              <div>
                <h3 style={stepTitleStyle}>Step 9: Banking Information for Welfare Disbursement</h3>
                <div style={{ fontSize: "13px", color: "#64748b", marginBottom: "20px" }}>Bank account linked for direct welfare cash transfers.</div>
                
                <div style={{ background: "#fffbeb", border: "1px solid #fde68a", padding: "16px", borderRadius: "8px", display: "flex", gap: "12px", marginBottom: "24px", color: "#92400e", fontSize: "14px", fontWeight: "600" }}>
                  <i className="fa-solid fa-triangle-exclamation" style={{ marginTop: "3px" }}></i>
                  Important: Please make sure the bank account holder's name matches the applicant's NIC information.
                </div>

                <div style={grid2ColStyle}>
                  <div className="input-group">
                    <label>Bank Name *</label>
                    <input type="text" name="bankName" className="form-input" value={form.bankName} onChange={handleChange} />
                  </div>
                  <div className="input-group">
                    <label>Branch Name / Code *</label>
                    <input type="text" name="branchCode" className="form-input" value={form.branchCode} onChange={handleChange} />
                  </div>
                  <div className="input-group">
                    <label>Account Number *</label>
                    <input type="text" name="accountNumber" className="form-input" value={form.accountNumber} onChange={handleChange} />
                  </div>
                  <div className="input-group">
                    <label>Account Holder Name *</label>
                    <input type="text" name="accountHolderName" className="form-input" value={form.accountHolderName} onChange={handleChange} />
                  </div>
                </div>
              </div>
            )}

            {/* STEP 10: REVIEW & SUBMIT */}
            {currentStep === 10 && (
              <div>
                <div style={{ marginBottom: "24px" }}>
                  <div style={{ fontSize: "14px", fontWeight: "700", color: "#0d9488", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "8px" }}>Step 10</div>
                  <h3 style={{ fontSize: "24px", fontWeight: "800", color: "#0f172a", marginBottom: "8px" }}>Review Application & Confirm Submission</h3>
                  <p style={{ color: "#64748b", fontSize: "15px" }}>Please review your information carefully before submitting your Aswesuma application.</p>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "32px" }}>
                  {/* Card 1 */}
                  <div style={{ border: "1px solid #e2e8f0", borderRadius: "12px", padding: "20px", background: "white" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", borderBottom: "1px solid #f1f5f9", paddingBottom: "12px" }}>
                      <h4 style={{ fontSize: "15px", fontWeight: "700", color: "#0f172a", margin: 0 }}>1. Applicant Information</h4>
                      <button type="button" onClick={() => setCurrentStep(1)} style={{ background: "none", border: "none", color: "#0d9488", cursor: "pointer" }}><i className="fa-solid fa-pen"></i></button>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "8px", fontSize: "13px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between" }}><span style={{ color: "#64748b" }}>Full Name:</span> <strong>{form.fullName || "THARUSHIKA JAYASUNDARA"}</strong></div>
                      <div style={{ display: "flex", justifyContent: "space-between" }}><span style={{ color: "#64748b" }}>NIC Number:</span> <strong>{form.nic || "200223003053"}</strong></div>
                      <div style={{ display: "flex", justifyContent: "space-between" }}><span style={{ color: "#64748b" }}>Gender:</span> <strong>{form.gender || "Female"}</strong></div>
                      <div style={{ display: "flex", justifyContent: "space-between" }}><span style={{ color: "#64748b" }}>Mobile Phone:</span> <strong>{form.mobile || "+94786220131"}</strong></div>
                      <div style={{ display: "flex", justifyContent: "space-between" }}><span style={{ color: "#64748b" }}>Province & District:</span> <strong>{form.province}, {form.district}</strong></div>
                      <div style={{ display: "flex", justifyContent: "space-between" }}><span style={{ color: "#64748b" }}>DS & GN Division:</span> <strong>{form.dsDivision} / {form.gnDivision}</strong></div>
                      <div style={{ display: "flex", justifyContent: "space-between" }}><span style={{ color: "#64748b" }}>Permanent Address:</span> <strong style={{ textAlign: "right" }}>{form.address}</strong></div>
                    </div>
                  </div>

                  {/* Card 2 */}
                  <div style={{ border: "1px solid #e2e8f0", borderRadius: "12px", padding: "20px", background: "white" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", borderBottom: "1px solid #f1f5f9", paddingBottom: "12px" }}>
                      <h4 style={{ fontSize: "15px", fontWeight: "700", color: "#0f172a", margin: 0 }}>2. Household & Programme</h4>
                      <button type="button" onClick={() => setCurrentStep(2)} style={{ background: "none", border: "none", color: "#0d9488", cursor: "pointer" }}><i className="fa-solid fa-pen"></i></button>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "8px", fontSize: "13px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between" }}><span style={{ color: "#64748b" }}>Total Members:</span> <strong>{form.totalMembers || 4}</strong></div>
                      <div style={{ display: "flex", justifyContent: "space-between" }}><span style={{ color: "#64748b" }}>Application Status:</span> <strong>{form.isNewApplicant === "Yes" ? "New Applicant" : "Existing"}</strong></div>
                      <div style={{ display: "flex", justifyContent: "space-between" }}><span style={{ color: "#64748b" }}>Existing Welfare:</span> <strong>{form.currentlyReceivingWelfare === "Yes" ? "Samurdhi" : "No"}</strong></div>
                      <div style={{ display: "flex", justifyContent: "space-between" }}><span style={{ color: "#64748b" }}>Waiting List:</span> <strong>{form.onWaitingList === "Yes" ? "Yes" : "No"}</strong></div>
                    </div>
                  </div>

                  {/* Card 3 */}
                  <div style={{ border: "1px solid #e2e8f0", borderRadius: "12px", padding: "20px", background: "white" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", borderBottom: "1px solid #f1f5f9", paddingBottom: "12px" }}>
                      <h4 style={{ fontSize: "15px", fontWeight: "700", color: "#0f172a", margin: 0 }}>3 & 4. Education & Health</h4>
                      <button type="button" onClick={() => setCurrentStep(3)} style={{ background: "none", border: "none", color: "#0d9488", cursor: "pointer" }}><i className="fa-solid fa-pen"></i></button>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "8px", fontSize: "13px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between" }}><span style={{ color: "#64748b" }}>Head Education:</span> <strong>{form.headEducation || "G.C.E. A/L"}</strong></div>
                      <div style={{ display: "flex", justifyContent: "space-between" }}><span style={{ color: "#64748b" }}>School Attendance:</span> <strong>{form.childrenSchoolAttendance || "All Attend Regularly"}</strong></div>
                      <div style={{ display: "flex", justifyContent: "space-between" }}><span style={{ color: "#64748b" }}>Disabilities Count:</span> <strong>{form.disabilitiesCount || 0}</strong></div>
                      <div style={{ display: "flex", justifyContent: "space-between" }}><span style={{ color: "#64748b" }}>Chronic Illness Count:</span> <strong>{form.chronicIllnessCount || 0}</strong></div>
                      <div style={{ display: "flex", justifyContent: "space-between" }}><span style={{ color: "#64748b" }}>Bedridden Elderly:</span> <strong>{form.bedriddenCount || 0}</strong></div>
                      <div style={{ display: "flex", justifyContent: "space-between" }}><span style={{ color: "#64748b" }}>Dependent Elderly:</span> <strong>{form.dependentElderlyCount || 0}</strong></div>
                    </div>
                  </div>

                  {/* Card 4 */}
                  <div style={{ border: "1px solid #e2e8f0", borderRadius: "12px", padding: "20px", background: "white" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", borderBottom: "1px solid #f1f5f9", paddingBottom: "12px" }}>
                      <h4 style={{ fontSize: "15px", fontWeight: "700", color: "#0f172a", margin: 0 }}>5 & 6. Economic Level & Assets</h4>
                      <button type="button" onClick={() => setCurrentStep(5)} style={{ background: "none", border: "none", color: "#0d9488", cursor: "pointer" }}><i className="fa-solid fa-pen"></i></button>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "8px", fontSize: "13px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between" }}><span style={{ color: "#64748b" }}>Primary Livelihood:</span> <strong>{form.primaryLivelihood || "Agriculture"}</strong></div>
                      <div style={{ display: "flex", justifyContent: "space-between" }}><span style={{ color: "#64748b" }}>Monthly Income:</span> <strong>Rs. {Number(form.estimatedMonthlyIncome || 35000).toLocaleString()}</strong></div>
                      <div style={{ display: "flex", justifyContent: "space-between" }}><span style={{ color: "#64748b" }}>Monthly Expenses:</span> <strong>Rs. {Number(form.regularMonthlyExpenses || 30000).toLocaleString()}</strong></div>
                      <div style={{ display: "flex", justifyContent: "space-between" }}><span style={{ color: "#64748b" }}>Electricity Consumption:</span> <strong>{form.averageMonthlyElectricityKwh || 45} kWh</strong></div>
                      <div style={{ display: "flex", justifyContent: "space-between" }}><span style={{ color: "#64748b" }}>Vehicles Owned:</span> <strong>{form.motorVehicles || "Motorcycle"}</strong></div>
                      <div style={{ display: "flex", justifyContent: "space-between" }}><span style={{ color: "#64748b" }}>Durables Owned:</span> <strong>{form.consumerDurables || "Refrigerator, Television"}</strong></div>
                      <div style={{ display: "flex", justifyContent: "space-between" }}><span style={{ color: "#64748b" }}>Land Ownership:</span> <strong>Agri: {form.hasAgriculturalLand || "Yes"}, Res: {form.hasResidentialLand || "Yes"}</strong></div>
                    </div>
                  </div>

                  {/* Card 5 */}
                  <div style={{ border: "1px solid #e2e8f0", borderRadius: "12px", padding: "20px", background: "white" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", borderBottom: "1px solid #f1f5f9", paddingBottom: "12px" }}>
                      <h4 style={{ fontSize: "15px", fontWeight: "700", color: "#0f172a", margin: 0 }}>7 & 8. Housing & Family Demography</h4>
                      <button type="button" onClick={() => setCurrentStep(7)} style={{ background: "none", border: "none", color: "#0d9488", cursor: "pointer" }}><i className="fa-solid fa-pen"></i></button>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "8px", fontSize: "13px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between" }}><span style={{ color: "#64748b" }}>House Ownership:</span> <strong>{form.houseOwnership || "Owned"}</strong></div>
                      <div style={{ display: "flex", justifyContent: "space-between" }}><span style={{ color: "#64748b" }}>Roof / Wall / Floor:</span> <strong>{form.roofMaterial || "Tile"} / {form.wallMaterial || "Brick"} / {form.floorMaterial || "Cement"}</strong></div>
                      <div style={{ display: "flex", justifyContent: "space-between" }}><span style={{ color: "#64748b" }}>Safe Water & Toilet:</span> <strong>Water: {form.accessSafeDrinkingWater || "Yes"}, Toilet: {form.accessPrivateSanitaryToilet || "Yes"}</strong></div>
                      <div style={{ display: "flex", justifyContent: "space-between" }}><span style={{ color: "#64748b" }}>Children {'<'} 15:</span> <strong>{form.childrenBelow15 || 1}</strong></div>
                      <div style={{ display: "flex", justifyContent: "space-between" }}><span style={{ color: "#64748b" }}>Working-Age (15-64):</span> <strong>{form.workingAgeMembers || 2}</strong></div>
                      <div style={{ display: "flex", justifyContent: "space-between" }}><span style={{ color: "#64748b" }}>Adults {'>'} 65:</span> <strong>{form.adultsOver65 || 1}</strong></div>
                      <div style={{ display: "flex", justifyContent: "space-between" }}><span style={{ color: "#64748b" }}>Female Head:</span> <strong>{form.femaleHeadedHousehold || "No"}</strong></div>
                    </div>
                  </div>

                  {/* Card 6 */}
                  <div style={{ border: "1px solid #e2e8f0", borderRadius: "12px", padding: "20px", background: "white" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", borderBottom: "1px solid #f1f5f9", paddingBottom: "12px" }}>
                      <h4 style={{ fontSize: "15px", fontWeight: "700", color: "#0f172a", margin: 0 }}>9. Banking Information</h4>
                      <button type="button" onClick={() => setCurrentStep(9)} style={{ background: "none", border: "none", color: "#0d9488", cursor: "pointer" }}><i className="fa-solid fa-pen"></i></button>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "8px", fontSize: "13px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between" }}><span style={{ color: "#64748b" }}>Bank Name:</span> <strong>{form.bankName || "Sampath Bank"}</strong></div>
                      <div style={{ display: "flex", justifyContent: "space-between" }}><span style={{ color: "#64748b" }}>Branch:</span> <strong>{form.branchCode || "Gampaha (042)"}</strong></div>
                      <div style={{ display: "flex", justifyContent: "space-between" }}><span style={{ color: "#64748b" }}>Account Number:</span> <strong>{form.accountNumber ? `******${form.accountNumber.slice(-4)}` : "******6789"}</strong></div>
                      <div style={{ display: "flex", justifyContent: "space-between" }}><span style={{ color: "#64748b" }}>Account Holder:</span> <strong>{form.accountHolderName || "THARUSHIKA JAYASUNDARA"}</strong></div>
                    </div>
                  </div>
                </div>

                <div style={{ background: "#f8fafc", padding: "16px", borderRadius: "8px", border: "1px solid #e2e8f0", display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px" }}>
                  <input type="checkbox" id="confirmData" style={{ width: "20px", height: "20px", cursor: "pointer" }} />
                  <label htmlFor="confirmData" style={{ fontSize: "14px", color: "#475569", fontWeight: "600", cursor: "pointer" }}>
                    I confirm that the information provided is accurate to the best of my knowledge.
                  </label>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: "32px", borderTop: "1px solid var(--border)", paddingTop: "20px" }}>
              {currentStep > 1 ? (
                <button
                  type="button"
                  onClick={() => setCurrentStep(currentStep - 1)}
                  style={{ background: "#f1f5f9", color: "#475569", border: "none", padding: "12px 24px", borderRadius: "8px", fontWeight: "bold", cursor: "pointer" }}
                >
                  ← Previous Step
                </button>
              ) : <div></div>}

              {currentStep < 10 ? (
                <button
                  type="button"
                  onClick={() => setCurrentStep(currentStep + 1)}
                  style={{ background: "var(--success)", color: "white", border: "none", padding: "12px 28px", borderRadius: "8px", fontWeight: "bold", cursor: "pointer" }}
                >
                  Next Step →
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isLoading}
                  style={{ background: "#0d9488", color: "white", border: "none", padding: "14px 32px", borderRadius: "8px", fontWeight: "bold", cursor: isLoading ? "not-allowed" : "pointer", fontSize: "15px" }}
                >
                  {isLoading ? "Submitting..." : "Submit Aswesuma Application →"}
                </button>
              )}
            </div>

          </div>

          {/* Right Summary Sidebar Card */}
          <div style={{ height: "fit-content", position: "sticky", top: "100px" }}>
            <div style={{ background: "#dcfce7", borderRadius: "var(--radius-lg)", padding: "32px 24px", border: "1px solid #86efac" }}>
              <div style={{ fontSize: "11px", fontWeight: "bold", color: "var(--success)", letterSpacing: "0.5px", marginBottom: "8px" }}>
                ASWESUMA BENEFIT BRACKETS
              </div>
              <div style={{ fontSize: "32px", fontWeight: "bold", color: "var(--success)", marginBottom: "4px" }}>
                Up to Rs. 15,000
              </div>
              <div style={{ fontSize: "12px", color: "#166534", marginBottom: "24px" }}>
                PMT score determines monthly stipend tier
              </div>

              <div style={{ borderTop: "1px solid #86efac", paddingTop: "16px", display: "flex", flexDirection: "column", gap: "10px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", color: "#166534" }}>
                  <span>Severely Impoverished</span>
                  <strong style={{ color: "#0f172a" }}>Rs. 15,000</strong>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", color: "#166534" }}>
                  <span>Poor Bracket</span>
                  <strong style={{ color: "#0f172a" }}>Rs. 8,500</strong>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", color: "#166534" }}>
                  <span>Vulnerable Bracket</span>
                  <strong style={{ color: "#0f172a" }}>Rs. 4,500</strong>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", color: "#166534" }}>
                  <span>Transitional Bracket</span>
                  <strong style={{ color: "#0f172a" }}>Rs. 2,500</strong>
                </div>
              </div>
            </div>
          </div>

        </div>
      </main>
    </>
  );
}

const stepTitleStyle = {
  fontSize: "16px",
  fontWeight: "bold",
  color: "var(--text-primary)",
  borderBottom: "1px solid var(--border)",
  paddingBottom: "12px",
  marginBottom: "20px",
};

const grid2ColStyle = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: "16px",
};
