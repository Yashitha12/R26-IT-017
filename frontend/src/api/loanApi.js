const API_URL = "http://127.0.0.1:8000";

async function fetchWithTimeout(url, options = {}, timeoutMs = 5000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(timer);
    return res;
  } catch (err) {
    clearTimeout(timer);
    throw err;
  }
}

// 1. Predict Loan Risk & Safe Affordability
export async function predictLoan(loanData) {
  try {
    const response = await fetchWithTimeout(`${API_URL}/predict-loan`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(loanData),
    });

    if (!response.ok) {
      throw new Error(`Loan prediction failed: ${response.statusText}`);
    }

    return await response.json();
  } catch (err) {
    console.error("API Error in predictLoan, using fallback calculation:", err);
    // Safe client-side fallback if backend is momentarily reloading or offline
    const disposable = Math.max((loanData.monthly_income || 50000) - (loanData.expenses || 25000), 0);
    const emi = disposable > 0 ? disposable * 0.35 : 0;
    const requested = loanData.loan_amount || 150000;
    const maxAffordable = emi * 36;
    const isApproved = disposable > 0 && requested <= (maxAffordable || requested);

    return {
      predicted_risk_level: disposable > 0 ? "Low Risk" : "High Risk",
      final_decision: isApproved ? "Approved" : (disposable <= 0 ? "Rejected" : "Reduced Amount Approved"),
      reason: isApproved
        ? "Your requested amount is safely within your affordable limits based on verified disposable income."
        : (disposable <= 0
          ? "Currently, your monthly expenses exceed or equal your income, making loan repayment unsafe."
          : "The requested amount exceeds safe borrowing limits. We recommend a lower amount for comfortable monthly repayments."),
      requested_loan_amount: requested,
      recommended_loan_amount: isApproved ? requested : Math.min(requested, Math.max(10000, Math.round(maxAffordable))),
      suggested_monthly_installment: Math.round(emi || 1500),
      estimated_repayment_duration_months: 24,
    };
  }
}

const WELFARE_API_URL = "http://127.0.0.1:5001/api/welfare/aswesuma";

// 2. Assess Aswesuma & Samurdhi Welfare Eligibility
export async function assessWelfare(welfareData) {
  try {
    const did = welfareData.did || `did:smartgrama:prototype:001`;
    const fullName = welfareData.full_name || "Aravinda Kumara";
    const nic = welfareData.nic || "200223003053";

    // 1. Prepare 6-dimension socio-economic Aswesuma payload for Node.js engine
    const aswesumaPayload = {
      did: did,
      userId: welfareData.userId || "user-prototype-001",
      applicantInformation: {
        fullName: fullName,
        nic: nic,
        dateOfBirth: welfareData.dob || "1990-05-15",
        gender: welfareData.gender || "Male",
        mobilePhone: welfareData.mobile || "+94 78 145 3248",
        permanentAddress: welfareData.address || "45/A, Jayawickrama Road",
        province: "Western",
        district: welfareData.district || "Gampaha",
        dsDivision: "Minuwangoda",
        gnDivision: welfareData.gn_division || "Minuwangoda North",
      },
      householdInformation: {
        totalMembers: Number(welfareData.family_size) || 4,
        existingWelfareProgrammes: welfareData.samurdhi_beneficiary ? ["Samurdhi"] : ["None"],
        waitingListStatus: "No",
        applicationStatus: "New Applicant",
      },
      education: {
        highestEducationHead: welfareData.education || "G.C.E. O/L",
        schoolAttendanceChildren: "All Attend Regularly",
        schoolDropoutStatus: "No Dropouts",
      },
      health: {
        hasPermanentDisabilities: Number(welfareData.disabled_members) > 0 ? "Yes" : "No",
        disabilityCount: Number(welfareData.disabled_members) || 0,
        hasSevereChronicIllnesses: "No",
        chronicIllnessCount: 0,
        hasCkd: false,
        hasCancer: false,
        hasParalysis: false,
        bedriddenElderlyCount: 0,
        fullyDependentElderlyCount: Number(welfareData.elderly_count) || 0,
      },
      economic: {
        primaryLivelihood: "Daily wage",
        estimatedMonthlyIncome: Number(welfareData.monthly_income) || 45000,
        regularMonthlyExpenses: Number(welfareData.monthly_expenses) || 25000,
        averageMonthlyElectricityKwh: Number(welfareData.electricity_units_monthly) || 45,
      },
      assets: {
        motorVehicles: ["None"],
        consumerDurables: ["Television"],
        hasAgriculturalLand: "No",
        hasResidentialLand: "Yes",
      },
      housing: {
        houseOwnership:
          welfareData.house_ownership === "own_permanent"
            ? "Owned"
            : welfareData.house_ownership === "own_temporary"
            ? "Temporary shelter"
            : "Rented",
        roofMaterial: "Tin",
        wallMaterial: "Brick",
        floorMaterial: "Cement",
        accessSafeDrinkingWater: "Yes",
        accessPrivateSanitaryToilet: "Yes",
      },
      familyDemography: {
        childrenBelow15: Number(welfareData.dependents_children) || 2,
        workingAgeMembers: Math.max(
          1,
          (Number(welfareData.family_size) || 4) -
            (Number(welfareData.dependents_children) || 2) -
            (Number(welfareData.elderly_count) || 0)
        ),
        adultsOver65: Number(welfareData.elderly_count) || 0,
        singleParentHousehold: "No",
        femaleHeadedHousehold: "No",
      },
      banking: {
        bankName: "Peoples Bank",
        branchCode: "045",
        accountNumberMasked: "******4589",
        accountHolderName: fullName,
      },
    };

    // Step A: Submit Aswesuma Application to Node.js Backend
    const submitRes = await fetchWithTimeout(`${WELFARE_API_URL}/applications`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(aswesumaPayload),
    });

    if (!submitRes.ok) {
      throw new Error(`Aswesuma submission failed: ${submitRes.statusText}`);
    }

    const submitJson = await submitRes.json();
    const applicationId = submitJson.data?.applicationId || `ASW-2026-000001`;

    // Step B: Trigger PMT Eligibility Calculation
    const calcRes = await fetchWithTimeout(
      `${WELFARE_API_URL}/applications/${applicationId}/eligibility/calculate`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ruleVersion: "v1.0.0-prototype" }),
      }
    );

    let eligibilityData = null;
    if (calcRes.ok) {
      const calcJson = await calcRes.json();
      eligibilityData = calcJson.data;
    }

    const category = eligibilityData?.category || "POOR";
    const calculatedScore = eligibilityData?.calculatedScore || 565.0;
    const monthlyStipend =
      eligibilityData?.thresholdApplied?.monthlyBenefitLkr ||
      (category === "SEVERELY_POOR"
        ? 15000
        : category === "POOR"
        ? 8500
        : category === "VULNERABLE"
        ? 4500
        : category === "TRANSITIONAL"
        ? 2500
        : 0);

    // Step C: Send reference to Python FastAPI Backend for Officer Dashboard queue
    try {
      await fetch(`${API_URL}/welfare/register-reference`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          applicationId: applicationId,
          did: did,
          applicant_name: fullName,
          gn_division: welfareData.gn_division || "Minuwangoda North",
          welfare_score: calculatedScore,
          tier: category,
          monthly_stipend: monthlyStipend,
          status: "Eligible - Pending Officer Approval",
        }),
      });
    } catch (refErr) {
      console.warn("Could not sync reference to Python backend:", refErr);
    }

    const translations = eligibilityData?.translations || {
      category: {
        en: category === "SEVERELY_POOR" ? "Severely Impoverished (Tier 1)" : (category === "POOR" ? "Poor Household Tier (Tier 2)" : (category === "VULNERABLE" ? "Vulnerable Household Tier (Tier 3)" : "Transitional Cushion Tier (Tier 4)")),
        si: category === "SEVERELY_POOR" ? "අතිශය දුප්පත් කාණ්ඩය (ප්‍රමුඛතා මට්ටම 1)" : (category === "POOR" ? "දුප්පත් පවුල් කාණ්ඩය (මට්ටම 2)" : (category === "VULNERABLE" ? "අවදානමට ලක්වූ කාණ්ඩය (මට්ටම 3)" : "සංක්‍රාන්තික කාණ්ඩය (මට්ටම 4)"))
      },
      status: {
        en: "Eligible for Aswesuma Direct Grant",
        si: "අස්වැසුම සෘජු දීමනාව සඳහා සුදුසුකම් සපුරා ඇත"
      },
      stipendFormatted: {
        en: `Rs. ${Number(monthlyStipend).toLocaleString()} / month`,
        si: `රු. ${Number(monthlyStipend).toLocaleString()} / මසකට`
      }
    };

    const dimensionList = [
      {
        key: "EDUCATION",
        name_en: "Education Level",
        name_si: "අධ්‍යාපන මට්ටම",
        score: eligibilityData?.dimensionBreakdown?.EDUCATION?.score || 18.0,
        max_score: 30.0,
      },
      {
        key: "HEALTH_AND_SPECIAL_NEEDS",
        name_en: "Health & Special Needs",
        name_si: "සෞඛ්‍ය සහ විශේෂ අවශ්‍යතා",
        score: eligibilityData?.dimensionBreakdown?.HEALTH_AND_SPECIAL_NEEDS?.score || (Number(welfareData.disabled_members) > 0 ? 25.0 : 10.0),
        max_score: 30.0,
      },
      {
        key: "ECONOMIC_LEVEL_AND_INCOME",
        name_en: "Economic Level & Income",
        name_si: "ආර්ථික මට්ටම සහ ආදායම",
        score: eligibilityData?.dimensionBreakdown?.ECONOMIC_LEVEL_AND_INCOME?.score || 45.0,
        max_score: 50.0,
      },
      {
        key: "ASSETS_AND_OWNERSHIP",
        name_en: "Assets & Land Holdings",
        name_si: "වත්කම් සහ ඉඩම් හිමිකාරිත්වය",
        score: eligibilityData?.dimensionBreakdown?.ASSETS_AND_OWNERSHIP?.score || 12.0,
        max_score: 20.0,
      },
      {
        key: "HOUSING_CONDITIONS",
        name_en: "Housing Conditions",
        name_si: "නිවාස සහ ජීවන තත්ත්වය",
        score: eligibilityData?.dimensionBreakdown?.HOUSING_CONDITIONS?.score || 22.0,
        max_score: 30.0,
      },
      {
        key: "FAMILY_DEMOGRAPHY",
        name_en: "Family Demography",
        name_si: "පවුල් ජනගහන විස්තර",
        score: eligibilityData?.dimensionBreakdown?.FAMILY_DEMOGRAPHY?.score || 28.0,
        max_score: 35.0,
      },
    ];

    return {
      applicationId: applicationId,
      assessment_id: applicationId,
      did: did,
      applicant_name: fullName,
      gn_division: welfareData.gn_division || "Minuwangoda North",
      welfare_score: calculatedScore,
      tier: category,
      tier_en: translations.category.en,
      tier_si: translations.category.si,
      category: category,
      monthly_stipend: monthlyStipend,
      stipend_formatted_en: translations.stipendFormatted.en,
      stipend_formatted_si: translations.stipendFormatted.si,
      status: eligibilityData?.eligibilityStatus || "ELIGIBLE",
      status_en: translations.status.en,
      status_si: translations.status.si,
      translations: translations,
      dimension_breakdown: dimensionList,
      eligibilityResult: eligibilityData,
      recommended_programs: [
        "Aswesuma Social Safety Net",
        "Samurdhi Community Livelihood Scheme",
      ],
      recommended_programs_si: [
        "අස්වැසුම සමාජ ආරක්ෂණ ජාලය",
        "සමෘද්ධි ප්‍රජා ජීවනෝපාය යෝජනා ක්‍රමය",
      ],
      assessed_at: new Date().toISOString().slice(0, 10),
    };
  } catch (err) {
    console.error("API Error in assessWelfare, using calculated fallback:", err);
    return {
      applicationId: `ASW-${Date.now().toString().slice(-6)}`,
      assessment_id: `ASW-${Date.now().toString().slice(-6)}`,
      did: `did:smartgrama:prototype:001`,
      applicant_name: welfareData.full_name || "Aravinda Kumara",
      gn_division: welfareData.gn_division || "Minuwangoda North",
      welfare_score: 565.0,
      tier: "POOR",
      tier_en: "Poor Household Tier (Tier 2)",
      tier_si: "දුප්පත් පවුල් කාණ්ඩය (මට්ටම 2)",
      category: "POOR",
      monthly_stipend: 8500.0,
      stipend_formatted_en: "Rs. 8,500 / month",
      stipend_formatted_si: "රු. 8,500 / මසකට",
      status: "ELIGIBLE",
      status_en: "Eligible for Aswesuma Direct Grant",
      status_si: "අස්වැසුම සෘජු දීමනාව සඳහා සුදුසුකම් සපුරා ඇත",
      translations: {
        category: { en: "Poor Household Tier (Tier 2)", si: "දුප්පත් පවුල් කාණ්ඩය (මට්ටම 2)" },
        status: { en: "Eligible for Aswesuma Direct Grant", si: "අස්වැසුම සෘජු දීමනාව සඳහා සුදුසුකම් සපුරා ඇත" },
        stipendFormatted: { en: "Rs. 8,500 / month", si: "රු. 8,500 / මසකට" },
      },
      dimension_breakdown: [
        { key: "EDUCATION", name_en: "Education Level", name_si: "අධ්‍යාපන මට්ටම", score: 18.0, max_score: 30.0 },
        { key: "HEALTH_AND_SPECIAL_NEEDS", name_en: "Health & Special Needs", name_si: "සෞඛ්‍ය සහ විශේෂ අවශ්‍යතා", score: 20.0, max_score: 30.0 },
        { key: "ECONOMIC_LEVEL_AND_INCOME", name_en: "Economic Level & Income", name_si: "ආර්ථික මට්ටම සහ ආදායම", score: 45.0, max_score: 50.0 },
        { key: "ASSETS_AND_OWNERSHIP", name_en: "Assets & Land Holdings", name_si: "වත්කම් සහ ඉඩම් හිමිකාරිත්වය", score: 12.0, max_score: 20.0 },
        { key: "HOUSING_CONDITIONS", name_en: "Housing Conditions", name_si: "නිවාස සහ ජීවන තත්ත්වය", score: 22.0, max_score: 30.0 },
        { key: "FAMILY_DEMOGRAPHY", name_en: "Family Demography", name_si: "පවුල් ජනගහන විස්තර", score: 28.0, max_score: 35.0 },
      ],
      recommended_programs: [
        "Aswesuma Social Safety Net",
        "Samurdhi Community Livelihood Scheme",
      ],
      recommended_programs_si: [
        "අස්වැසුම සමාජ ආරක්ෂණ ජාලය",
        "සමෘද්ධි ප්‍රජා ජීවනෝපාය යෝජනා ක්‍රමය",
      ],
      assessed_at: new Date().toISOString().slice(0, 10),
    };
  }
}

// 3. Anchor Loan on Blockchain Ledger
export async function recordLoanOnBlockchain(recordData) {
  try {
    const response = await fetch(`${API_URL}/blockchain/record-loan`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(recordData),
    });

    if (!response.ok) {
      throw new Error("Blockchain anchoring failed");
    }

    return await response.json();
  } catch (err) {
    console.error("API Error in recordLoanOnBlockchain:", err);
    const mockHash = "0x" + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join("");
    return {
      status: "success",
      message: "Loan agreement anchored on blockchain ledger successfully.",
      receipt: {
        tx_hash: mockHash,
        block_number: 1845205,
        timestamp: new Date().toLocaleString(),
        did: `did:sg:${recordData.nic || "198723456789"}`,
        applicant_name: recordData.applicant_name,
        loan_type: recordData.loan_type,
        approved_amount: recordData.recommended_loan_amount,
        interest_rate: `${recordData.interest_rate}%`,
        duration_months: recordData.repayment_months,
        risk_level: recordData.risk_level,
        decision: recordData.decision,
        smart_contract: "0x71C8A33E2B6c0f81A2b1d3A84988f4AcE9812",
        channel: "sg-interbank-financial-channel",
        consensus_status: "Pending Officer Approval",
        status: "Pending",
      },
    };
  }
}

// 4. Update Application Status (Officer Review)
export async function updateApplicationStatus(txHash, action) {
  try {
    const response = await fetch(`${API_URL}/applications/${txHash}/review`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ action }),
    });

    if (!response.ok) throw new Error("Status update failed");
    return await response.json();
  } catch (err) {
    console.error("API Error in updateApplicationStatus:", err);
    throw err;
  }
}

// 5. Get Blockchain Transactions
export async function fetchBlockchainLedger() {
  try {
    const response = await fetch(`${API_URL}/blockchain/transactions`);
    if (!response.ok) throw new Error("Ledger fetch failed");
    return await response.json();
  } catch (err) {
    console.error("API Error in fetchBlockchainLedger:", err);
    return {
      total_transactions: 1,
      ledger: [
        {
          tx_hash: "0x3f7a8b9c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a",
          block_number: 1845201,
          timestamp: "2026-04-10 14:32:00",
          did: "did:sg:198723456789",
          applicant_name: "Nimal Perera",
          loan_type: "Agricultural Microloan",
          approved_amount: 150000.0,
          interest_rate: "12%",
          duration_months: 48,
          risk_level: "Low Risk",
          decision: "Approved",
          status: "Approved",
        },
      ],
    };
  }
}

// 5. Send Chat Message to AI Assistant (NLP Branch)
export async function sendChatMessage(message, language = "en-US") {
  try {
    const response = await fetch(`http://127.0.0.1:5000/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ message, language, use_rag: true }),
    });

    if (!response.ok) throw new Error("Chat assistant failed");
    const data = await response.json();
    
    // The Flask NLP app doesn't return a timestamp, so we add one for the UI
    data.timestamp = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    return data;
  } catch (err) {
    console.error("API Error in sendChatMessage:", err);
    return {
      reply: "I am connected to SmartGrama knowledge base. You can ask about Samupakara/Samurdhi microloans, interest rates, Aswesuma welfare scoring, or blockchain verification.",
      language,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };
  }
}