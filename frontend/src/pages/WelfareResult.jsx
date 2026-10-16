import { useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Header from "../components/Header";
import { getCurrentUser } from "../utils/user";
import dashboardBg from "../assets/smartgrama_dashboard_bg.jpg";

/* ─── Custom SVG Icons ─── */
const Ico = {
  arrowLeft: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>,
  arrowRight: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>,
  check: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>,
  shieldCheck: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10"/></svg>,
  wallet: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 12V8H6a2 2 0 0 1 0-4h14v4"/><path d="M4 6v12a2 2 0 0 0 2 2h14v-4"/><circle cx="17" cy="16" r="1" fill="currentColor"/></svg>,
  clock: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
  print: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>,
  ai: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83"/></svg>,
  certificate: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/></svg>,
};

export default function WelfareResult() {
  const navigate = useNavigate();
  const location = useLocation();
  const { t, i18n } = useTranslation();
  const isSi = i18n.language === "si";
  const user = getCurrentUser();

  const result = location.state?.result || {
    applicationId: "ASW-2026-000001",
    welfare_score: 565.0,
    tier: "POOR",
    category: "POOR",
    monthly_stipend: 8500,
    status: "ELIGIBLE",
    applicant_name: user?.name || "Aravinda Kumara",
    gn_division: user?.gnDivision || "Minuwangoda North",
    did: user?.did || "did:smartgrama:prototype:001",
  };

  const getTierInfo = (cat = "POOR") => {
    switch (cat.toUpperCase()) {
      case "SEVERELY_POOR":
      case "SEVERELY IMPOVERISHED":
        return {
          title: isSi ? "අතිශය දුප්පත් කාණ්ඩය" : "Severely Impoverished",
          titleSi: "අතිශය දුප්පත් කාණ්ඩය",
          color: "#991b1b",
          bg: "#fee2e2",
          border: "#fca5a5",
          stipend: isSi ? "රු. 15,000 / මසකට" : "Rs. 15,000 / month",
        };
      case "POOR":
        return {
          title: isSi ? "දුප්පත් පවුල් කාණ්ඩය" : "Poor Household Tier",
          titleSi: "දුප්පත් පවුල් කාණ්ඩය",
          color: "#92400e",
          bg: "#fef3c7",
          border: "#fde68a",
          stipend: isSi ? "රු. 8,500 / මසකට" : "Rs. 8,500 / month",
        };
      case "VULNERABLE":
        return {
          title: isSi ? "අවදානමට ලක්විය හැකි කාණ්ඩය" : "Vulnerable Household Tier",
          titleSi: "අවදානමට ලක්විය හැකි කාණ්ඩය",
          color: "#3730a3",
          bg: "#e0e7ff",
          border: "#c7d2fe",
          stipend: isSi ? "රු. 4,500 / මසකට" : "Rs. 4,500 / month",
        };
      case "TRANSITIONAL":
        return {
          title: isSi ? "සංක්‍රාන්තික කාණ්ඩය" : "Transitional Welfare Tier",
          titleSi: "සංක්‍රාන්තික කාණ්ඩය",
          color: "#6b21a8",
          bg: "#f3e8ff",
          border: "#e9d5ff",
          stipend: isSi ? "රු. 2,500 / මසකට" : "Rs. 2,500 / month",
        };
      default:
        return {
          title: isSi ? "සුදුසුකම් ලත් කාණ්ඩය" : "Aswesuma Eligible Tier",
          titleSi: "සුදුසුකම් ලත් කාණ්ඩය",
          color: "#166534",
          bg: "#dcfce7",
          border: "#86efac",
          stipend: isSi ? `රු. ${Number(result.monthly_stipend || 8500).toLocaleString()} / මසකට` : `Rs. ${Number(result.monthly_stipend || 8500).toLocaleString()} / month`,
        };
    }
  };

  const tier = getTierInfo(result.category || result.tier);
  const monthlyAmount = Number(result.monthly_stipend || 8500).toLocaleString();

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

          {/* Breadcrumb Navigation */}
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
            <span>{t("back_to_welfare_portal")}</span>
          </div>

          {/* ═══════════════════════════════════════════════════
              TOP: HERO BANNER (Full Width)
          ═══════════════════════════════════════════════════ */}
          <div style={{
            borderRadius: 22,
            overflow: "hidden",
            boxShadow: "0 16px 45px rgba(4, 20, 55, 0.16)",
            background: "linear-gradient(140deg, #0c1445 0%, #064e3b 100%)",
            color: "#fff",
            padding: "32px 38px",
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
                {t("welfare_board_gov_title")}
              </div>
              <h1 style={{ fontSize: 28, fontWeight: 900, letterSpacing: -0.5, margin: "0 0 6px" }}>
                {t("aswesuma_certified")}
              </h1>
              <p style={{ fontSize: 13, color: "rgba(255,255,255,0.75)", margin: 0, maxWidth: 640, lineHeight: 1.5 }}>
                {t("welfare_certified_sub")}
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
              {Ico.shieldCheck}
              <span>{isSi ? `DID සත්‍යාපිතයි • ${result.did}` : `DID Verified • ${result.did}`}</span>
            </div>
          </div>

          {/* ═══════════════════════════════════════════════════
              MAIN 2-COLUMN RESULTS GRID
          ═══════════════════════════════════════════════════ */}
          <div style={{ display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: 24, alignItems: "start" }}>

            {/* ── LEFT COLUMN: OFFICIAL ASSESSMENT CERTIFICATE ── */}
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

              {/* Master Certificate Card */}
              <div style={{
                background: "rgba(255, 255, 255, 0.95)",
                backdropFilter: "blur(16px)",
                borderRadius: 22,
                padding: "32px 36px",
                border: "1.5px solid rgba(255, 255, 255, 0.9)",
                boxShadow: "0 10px 30px rgba(0, 0, 0, 0.04)",
                position: "relative",
              }}>
                {/* Top Success Badge */}
                <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 24 }}>
                  <div style={{
                    width: 60,
                    height: 60,
                    borderRadius: 18,
                    background: "linear-gradient(135deg, #059669 0%, #064e3b 100%)",
                    color: "#fff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: "0 8px 20px rgba(5, 150, 105, 0.35)",
                    flexShrink: 0,
                  }}>
                    {Ico.check}
                  </div>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 800, color: "#059669", textTransform: "uppercase", letterSpacing: 1 }}>
                      {t("welfare_eligibility_status_certified")}
                    </div>
                    <div style={{ fontSize: 24, fontWeight: 900, color: "#0f172a", marginTop: 2 }}>
                      {t("welfare_certified_title")}
                    </div>
                  </div>
                </div>

                {/* Awarded Tier & Monthly Grant Highlight Box */}
                <div style={{
                  background: "linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)",
                  border: "1.5px solid #86efac",
                  borderRadius: 20,
                  padding: "24px 28px",
                  marginBottom: 24,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: 16,
                }}>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: "#064e3b", textTransform: "uppercase", letterSpacing: 0.8 }}>
                      {t("assigned_welfare_cat")}
                    </div>
                    <div style={{ fontSize: 22, fontWeight: 900, color: "#064e3b", marginTop: 3 }}>
                      {tier.title}
                    </div>
                    {!isSi && (
                      <div style={{ fontSize: 13, color: "#166534", fontWeight: 700, marginTop: 2 }}>
                        {tier.titleSi}
                      </div>
                    )}
                  </div>

                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: "#064e3b", textTransform: "uppercase" }}>
                      {t("approved_monthly_grant")}
                    </div>
                    <div style={{ fontSize: 32, fontWeight: 900, color: "#047857", letterSpacing: -1, marginTop: 2 }}>
                      {isSi ? `රු. ${monthlyAmount}` : `Rs. ${monthlyAmount}`}
                    </div>
                    <div style={{ fontSize: 11, color: "#166534", fontWeight: 600 }}>
                      {t("credited_first_month")}
                    </div>
                  </div>
                </div>

                {/* Application & Beneficiary Metadata Table */}
                <div style={{
                  background: "#f8fafc",
                  borderRadius: 16,
                  padding: "20px 24px",
                  border: "1.5px solid #e2e8f0",
                  display: "flex",
                  flexDirection: "column",
                  gap: 12,
                  marginBottom: 24,
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 13 }}>
                    <span style={{ color: "#64748b", fontWeight: 600 }}>{t("app_ref_id")}</span>
                    <span style={{ fontFamily: "monospace", fontWeight: 800, color: "#0f172a", fontSize: 14 }}>
                      {result.applicationId || result.assessment_id || "ASW-2026-000001"}
                    </span>
                  </div>

                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 13 }}>
                    <span style={{ color: "#64748b", fontWeight: 600 }}>{t("beneficiary_legal_name")}</span>
                    <strong style={{ color: "#0f172a" }}>{result.applicant_name || user?.name || "Aravinda Kumara"}</strong>
                  </div>

                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 13 }}>
                    <span style={{ color: "#64748b", fontWeight: 600 }}>{t("gn_division")}:</span>
                    <strong style={{ color: "#0f172a" }}>{result.gn_division || user?.gnDivision || "Minuwangoda North"}</strong>
                  </div>

                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 13 }}>
                    <span style={{ color: "#64748b", fontWeight: 600 }}>{t("pmt_calculated_score")}</span>
                    <span style={{ fontSize: 15, fontWeight: 900, color: "#ea580c" }}>
                      {result.welfare_score || 565.0} {isSi ? "ලකුණු" : "pts"}
                    </span>
                  </div>

                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 13 }}>
                    <span style={{ color: "#64748b", fontWeight: 600 }}>{t("did_anchor_label")}</span>
                    <span style={{ fontFamily: "monospace", fontSize: 11, color: "#059669", background: "#ecfdf5", padding: "3px 8px", borderRadius: 6, border: "1px solid #a7f3d0" }}>
                      {result.did}
                    </span>
                  </div>
                </div>

                {/* Zero-PII Blockchain Proof Assurance */}
                <div style={{
                  background: "#eff6ff",
                  borderRadius: 14,
                  padding: "16px 18px",
                  border: "1.5px solid #bfdbfe",
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  color: "#1e40af",
                  fontSize: 13,
                  lineHeight: 1.5,
                }}>
                  <div style={{ flexShrink: 0 }}>{Ico.shieldCheck}</div>
                  <div>
                    <strong>{t("ledger_record_title")}</strong> {t("zero_pii_ledger_notice")}
                  </div>
                </div>

              </div>

              {/* ── 6-DIMENSION PMT MULTI-DIMENSIONAL BREAKDOWN CARD ── */}
              <div style={{
                background: "rgba(255, 255, 255, 0.95)",
                backdropFilter: "blur(16px)",
                borderRadius: 22,
                padding: "28px 32px",
                border: "1.5px solid rgba(255, 255, 255, 0.9)",
                boxShadow: "0 10px 30px rgba(0, 0, 0, 0.04)",
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 18, flexWrap: "wrap", gap: 8 }}>
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 800, color: "#059669", textTransform: "uppercase", letterSpacing: 1 }}>
                      {t("pmt_6_dimensions_title")}
                    </div>
                    <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>
                      {t("pmt_6_dimensions_sub")}
                    </div>
                  </div>
                  <div style={{ background: "#ecfdf5", border: "1px solid #a7f3d0", padding: "4px 10px", borderRadius: 8, fontSize: 11, fontWeight: 700, color: "#047857" }}>
                    PMT v1.0 • {result.welfare_score || 565.0} {t("pmt_pts")}
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                  {(result.dimension_breakdown || [
                    { key: "EDUCATION", name_en: "Education Level", name_si: "අධ්‍යාපන මට්ටම", score: 18.0, max_score: 30.0 },
                    { key: "HEALTH_AND_SPECIAL_NEEDS", name_en: "Health & Special Needs", name_si: "සෞඛ්‍ය සහ විශේෂ අවශ්‍යතා", score: 20.0, max_score: 30.0 },
                    { key: "ECONOMIC_LEVEL_AND_INCOME", name_en: "Economic Level & Income", name_si: "ආර්ථික මට්ටම සහ ආදායම", score: 45.0, max_score: 50.0 },
                    { key: "ASSETS_AND_OWNERSHIP", name_en: "Assets & Land Holdings", name_si: "වත්කම් සහ ඉඩම් හිමිකාරිත්වය", score: 12.0, max_score: 20.0 },
                    { key: "HOUSING_CONDITIONS", name_en: "Housing Conditions", name_si: "නිවාස සහ ජීවන තත්ත්වය", score: 22.0, max_score: 30.0 },
                    { key: "FAMILY_DEMOGRAPHY", name_en: "Family Demography", name_si: "පවුල් ජනගහන විස්තර", score: 28.0, max_score: 35.0 },
                  ]).map((dim, idx) => {
                    const pct = Math.min(100, Math.round(((dim.score || 0) / (dim.max_score || 30)) * 100));
                    return (
                      <div key={idx} style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 12, padding: "12px 14px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                          <span style={{ fontSize: 12, fontWeight: 700, color: "#1e293b" }}>
                            {isSi ? dim.name_si : dim.name_en}
                          </span>
                          <span style={{ fontSize: 11, fontWeight: 800, color: "#059669" }}>
                            {dim.score} / {dim.max_score} {t("pmt_pts")}
                          </span>
                        </div>
                        <div style={{ width: "100%", height: 6, background: "#e2e8f0", borderRadius: 10, overflow: "hidden" }}>
                          <div style={{ width: `${pct}%`, height: "100%", background: "linear-gradient(90deg, #10b981 0%, #059669 100%)", borderRadius: 10 }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 3-Stage Disbursement Pipeline */}
              <div style={{
                background: "rgba(255, 255, 255, 0.95)",
                backdropFilter: "blur(16px)",
                borderRadius: 22,
                padding: "26px 30px",
                border: "1.5px solid rgba(255, 255, 255, 0.9)",
                boxShadow: "0 10px 30px rgba(0, 0, 0, 0.04)",
              }}>
                <div style={{ fontSize: 11, fontWeight: 800, color: "#059669", textTransform: "uppercase", letterSpacing: 1, marginBottom: 12 }}>
                  {t("disbursement_stages")}
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
                  <div style={{ background: "#f0fdf4", border: "1.5px solid #86efac", borderRadius: 14, padding: "16px 14px" }}>
                    <div style={{ fontSize: 11, fontWeight: 800, color: "#059669" }}>{t("stage_1_done")}</div>
                    <div style={{ fontSize: 13, fontWeight: 800, color: "#0f172a", marginTop: 4 }}>{t("stage_1_label")}</div>
                    <div style={{ fontSize: 11, color: "#166534", marginTop: 3 }}>{t("stage_1_desc")}</div>
                  </div>

                  <div style={{ background: "#fffbeb", border: "1.5px solid #fde68a", borderRadius: 14, padding: "16px 14px" }}>
                    <div style={{ fontSize: 11, fontWeight: 800, color: "#d97706" }}>{t("stage_2_active")}</div>
                    <div style={{ fontSize: 13, fontWeight: 800, color: "#0f172a", marginTop: 4 }}>{t("stage_2_label")}</div>
                    <div style={{ fontSize: 11, color: "#92400e", marginTop: 3 }}>{t("stage_2_desc")}</div>
                  </div>

                  <div style={{ background: "#f8fafc", border: "1.5px solid #e2e8f0", borderRadius: 14, padding: "16px 14px" }}>
                    <div style={{ fontSize: 11, fontWeight: 800, color: "#64748b" }}>{t("stage_3_scheduled")}</div>
                    <div style={{ fontSize: 13, fontWeight: 800, color: "#0f172a", marginTop: 4 }}>{t("stage_3_label")}</div>
                    <div style={{ fontSize: 11, color: "#64748b", marginTop: 3 }}>{t("stage_3_desc")}</div>
                  </div>
                </div>
              </div>

            </div>

            {/* ── RIGHT COLUMN: SIDEBAR ACTIONS & NEXT STEPS ── */}
            <div style={{ display: "flex", flexDirection: "column", gap: 18, position: "sticky", top: "20px" }}>

              {/* Primary Action Card: Go to Digital Wallet */}
              <div style={{
                background: "linear-gradient(140deg, #064e3b 0%, #0c1445 100%)",
                borderRadius: 22,
                padding: "28px 28px",
                color: "#fff",
                boxShadow: "0 14px 40px rgba(6, 78, 59, 0.3)",
                display: "flex",
                flexDirection: "column",
                gap: 16,
              }}>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 800, color: "#6ee7b7", textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>
                    {t("disbursement_channel_title")}
                  </div>
                  <h3 style={{ fontSize: 22, fontWeight: 900, margin: "0 0 6px", letterSpacing: -0.4 }}>
                    {t("smartgrama_passbook_title")}
                  </h3>
                  <div style={{ fontSize: 12, color: "rgba(255,255,255,0.75)", lineHeight: 1.5 }}>
                    {t("passbook_disburse_desc", { amount: isSi ? `රු. ${monthlyAmount}` : `Rs. ${monthlyAmount}` })}
                  </div>
                </div>

                <button
                  onClick={() => navigate("/wallet")}
                  style={{
                    width: "100%",
                    padding: "15px 20px",
                    borderRadius: "14px",
                    border: "none",
                    background: "#059669",
                    color: "#ffffff",
                    fontSize: "15px",
                    fontWeight: "900",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "10px",
                    boxShadow: "0 6px 20px rgba(5, 150, 105, 0.4)",
                    fontFamily: "inherit",
                    transition: "transform 0.15s ease, background 0.15s ease",
                  }}
                  onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.background = "#047857"; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.background = "#059669"; }}
                >
                  <span style={{ display: "flex", alignItems: "center", gap: 8 }}>{Ico.wallet} {t("view_digital_wallet")}</span>
                  {Ico.arrowRight}
                </button>

                <button
                  onClick={() => navigate("/status")}
                  style={{
                    width: "100%",
                    padding: "12px 18px",
                    borderRadius: "12px",
                    border: "1.5px solid rgba(255,255,255,0.25)",
                    background: "rgba(255,255,255,0.12)",
                    color: "#ffffff",
                    fontSize: "13px",
                    fontWeight: "700",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                    fontFamily: "inherit",
                    transition: "background 0.15s ease",
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.2)"}
                  onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.12)"}
                >
                  {Ico.clock} {t("track_app_status")}
                </button>
              </div>


              {/* SmartGrama AI Assistant Card */}
              <div style={{
                background: "linear-gradient(140deg, #1e1b4b 0%, #312e81 50%, #4c1d95 100%)",
                color: "#fff",
                borderRadius: 22,
                padding: "24px 26px",
                boxShadow: "0 10px 30px rgba(76, 29, 149, 0.28)",
                display: "flex",
                flexDirection: "column",
                gap: 14,
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 12, background: "rgba(255,255,255,0.12)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    {Ico.ai}
                  </div>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: 15 }}>SmartGrama AI</div>
                    <div style={{ fontSize: 11, color: "rgba(255,255,255,0.6)" }}>{t("ai_welfare_assistant_title")}</div>
                  </div>
                </div>

                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.75)", lineHeight: 1.5 }}>
                  {t("ai_welfare_help_desc")}
                </div>

                <button
                  onClick={() => navigate("/ai-chat")}
                  style={{
                    width: "100%",
                    padding: "11px",
                    borderRadius: "12px",
                    border: "1px solid rgba(255,255,255,0.2)",
                    background: "rgba(255,255,255,0.12)",
                    color: "#fff",
                    fontWeight: 700,
                    fontSize: 13,
                    cursor: "pointer",
                    fontFamily: "inherit",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                  }}
                >
                  <span>{t("ask_ai_assistant")}</span>
                  {Ico.arrowRight}
                </button>
              </div>

            </div>

          </div>

        </main>
      </div>
    </div>
  );
}
