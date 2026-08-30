import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import { getCurrentUser } from "../utils/user";
import dashboardBg from "../assets/smartgrama_dashboard_bg.jpg";

/* ─── Custom SVG Icons ─── */
const Ico = {
  arrowLeft: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>,
  arrowRight: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>,
  shield: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10"/></svg>,
  nic: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="4" width="20" height="16" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/><circle cx="7" cy="15" r="1.5" fill="currentColor"/><line x1="12" y1="14" x2="18" y2="14"/><line x1="12" y1="17" x2="16" y2="17"/></svg>,
  users: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  income: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>,
  house: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
  bank: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="21" x2="21" y2="21"/><line x1="3" y1="10" x2="21" y2="10"/><polyline points="5 6 12 3 19 6"/><line x1="4" y1="10" x2="4" y2="21"/><line x1="20" y1="10" x2="20" y2="21"/><line x1="8" y1="14" x2="8" y2="17"/><line x1="12" y1="14" x2="12" y2="17"/><line x1="16" y1="14" x2="16" y2="17"/></svg>,
  alert: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>,
  ai: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83"/></svg>,
  check: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>,
  clock: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
  sparkle: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
};

const prepItems = [
  {
    icon: Ico.nic,
    color: "#2563eb",
    bg: "#eff6ff",
    title: "1. National Identity Cards",
    titleSi: "ජාතික හැඳුනුම්පත් තොරතුරු",
    desc: "Valid NIC numbers of yourself and all adult family members residing in the household.",
  },
  {
    icon: Ico.users,
    color: "#d97706",
    bg: "#fffbeb",
    title: "2. Household Structure",
    titleSi: "පවුලේ සාමාජිකයන්ගේ විස්තර",
    desc: "Count of family members, dependent school-going children, and elderly dependents.",
  },
  {
    icon: Ico.income,
    color: "#059669",
    bg: "#f0fdf4",
    title: "3. Income & Electricity",
    titleSi: "ආදායම් සහ විදුලි බිල්පත්",
    desc: "Monthly household earnings, regular living expenses, and average electricity units (kWh).",
  },
  {
    icon: Ico.house,
    color: "#7c3aed",
    bg: "#f5f3ff",
    title: "4. Housing & Land Assets",
    titleSi: "නිවාස සහ දේපළ තොරතුරු",
    desc: "House construction materials (roof, wall, floor), land ownership, and vehicles owned.",
  },
  {
    icon: Ico.bank,
    color: "#0284c7",
    bg: "#f0f9ff",
    title: "5. Bank Passbook Details",
    titleSi: "බැංකු ගිණුම් විස්තර",
    desc: "Active bank account number and branch matching your registered NIC name.",
  },
];

const flowSteps = [
  {
    num: "01",
    title: "10-Step Intake",
    titleSi: "තොරතුරු ඇතුළත් කිරීම",
    desc: "Fill in bio, household structure, education, income, and banking details.",
  },
  {
    num: "02",
    title: "PMT Welfare Scoring",
    titleSi: "සුදුසුකම් ඇගයීම",
    desc: "Automated poverty & vulnerability scoring under the Welfare Benefits Board.",
  },
  {
    num: "03",
    title: "Direct Benefit Transfer",
    titleSi: "මුදල් ප්‍රතිලාභ ලබා ගැනීම",
    desc: "Monthly grant credited directly to your bank account & SmartGrama passbook.",
  },
];

export default function WelfareLanding() {
  const navigate = useNavigate();
  const user = getCurrentUser();

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
            onClick={() => navigate("/dashboard")}
          >
            {Ico.arrowLeft}
            <span>Back to Dashboard / ප්‍රධාන පාලක පුවරුවට</span>
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
                Democratic Socialist Republic of Sri Lanka &bull; SmartGrama
              </div>
              <h1 style={{ fontSize: 28, fontWeight: 900, letterSpacing: -0.5, margin: "0 0 6px" }}>
                Aswesuma National Welfare Scheme / අස්වැසුම සුභසාධන වැඩසටහන
              </h1>
              <p style={{ fontSize: 13, color: "rgba(255,255,255,0.75)", margin: 0, maxWidth: 640, lineHeight: 1.5 }}>
                Official government financial support initiative for low-income and vulnerable households. Evaluated securely using Decentralized Identity (DID) and Proxy Means Testing (PMT).
              </p>
            </div>

            <div style={{ display: "flex", gap: 12, position: "relative" }}>
              <div style={{
                background: "rgba(255, 255, 255, 0.10)",
                backdropFilter: "blur(10px)",
                borderRadius: 16,
                padding: "14px 20px",
                border: "1px solid rgba(255, 255, 255, 0.16)",
                textAlign: "center",
              }}>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.6)", fontWeight: 700, textTransform: "uppercase" }}>Monthly Grant</div>
                <div style={{ fontSize: 24, fontWeight: 900, color: "#6ee7b7", marginTop: 2 }}>Up to Rs. 15k</div>
              </div>
              <div style={{
                background: "rgba(255, 255, 255, 0.10)",
                backdropFilter: "blur(10px)",
                borderRadius: 16,
                padding: "14px 20px",
                border: "1px solid rgba(255, 255, 255, 0.16)",
                textAlign: "center",
              }}>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.6)", fontWeight: 700, textTransform: "uppercase" }}>Intake Steps</div>
                <div style={{ fontSize: 24, fontWeight: 900, color: "#fff", marginTop: 2 }}>10 Simple Steps</div>
              </div>
            </div>
          </div>

          {/* ═══════════════════════════════════════════════════
              MAIN 2-COLUMN PORTAL GRID
          ═══════════════════════════════════════════════════ */}
          <div style={{ display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: 24, alignItems: "start" }}>

            {/* ── LEFT COLUMN: CHECKLIST & FLOW ── */}
            <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>

              {/* 5 Preparation Items Card */}
              <div style={{
                background: "rgba(255, 255, 255, 0.95)",
                backdropFilter: "blur(16px)",
                borderRadius: 22,
                padding: "30px 32px",
                border: "1.5px solid rgba(255, 255, 255, 0.9)",
                boxShadow: "0 10px 30px rgba(0,0,0,0.04)",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                  <span style={{ fontSize: 11, fontWeight: 800, color: "#059669", textTransform: "uppercase", letterSpacing: 1 }}>
                    Preparation Checklist
                  </span>
                </div>
                <h2 style={{ fontSize: 20, fontWeight: 900, color: "#0f172a", margin: "0 0 6px", letterSpacing: -0.3 }}>
                  What You Need Ready Before You Begin (අවශ්‍ය ලියකියවිලි 5)
                </h2>
                <p style={{ fontSize: 13, color: "#64748b", margin: "0 0 22px", lineHeight: 1.5 }}>
                  Having these 5 items on hand ensures you can complete the 10-step intake smoothly in under 8 minutes:
                </p>

                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {prepItems.map((item, idx) => (
                    <div
                      key={idx}
                      style={{
                        background: "#ffffff",
                        border: "1.5px solid #f1f5f9",
                        borderRadius: "16px",
                        padding: "16px 18px",
                        boxShadow: "0 2px 6px rgba(0, 0, 0, 0.02)",
                        display: "flex",
                        gap: "14px",
                        alignItems: "flex-start",
                        transition: "all 0.15s ease",
                      }}
                      onMouseEnter={e => { e.currentTarget.style.transform = "translateX(4px)"; e.currentTarget.style.borderColor = "#cbd5e1"; }}
                      onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.borderColor = "#f1f5f9"; }}
                    >
                      <div style={{
                        width: "44px",
                        height: "44px",
                        borderRadius: "13px",
                        background: item.bg,
                        color: item.color,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}>
                        {item.icon}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                          <span style={{ fontSize: "14px", fontWeight: "800", color: "#0f172a" }}>{item.title}</span>
                          <span style={{ fontSize: "12px", fontWeight: "700", color: "#059669" }}>&bull; {item.titleSi}</span>
                        </div>
                        <div style={{ fontSize: "12px", color: "#64748b", lineHeight: 1.4, marginTop: 4 }}>
                          {item.desc}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 3-Step Milestone Workflow */}
              <div style={{
                background: "rgba(255, 255, 255, 0.95)",
                backdropFilter: "blur(16px)",
                borderRadius: 22,
                padding: "28px 32px",
                border: "1.5px solid rgba(255, 255, 255, 0.9)",
                boxShadow: "0 10px 30px rgba(0,0,0,0.04)",
              }}>
                <div style={{ fontSize: 11, fontWeight: 800, color: "#4338ca", textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>
                  Evaluation Process
                </div>
                <h3 style={{ fontSize: 18, fontWeight: 900, color: "#0f172a", margin: "0 0 18px" }}>
                  How Your Aswesuma Application is Processed
                </h3>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 }}>
                  {flowSteps.map((s, idx) => (
                    <div key={idx} style={{ background: "#f8fafc", padding: "18px 16px", borderRadius: 16, border: "1.5px solid #e2e8f0" }}>
                      <div style={{ fontSize: 12, fontWeight: 900, color: "#059669", marginBottom: 6 }}>
                        STEP {s.num}
                      </div>
                      <div style={{ fontSize: 14, fontWeight: 800, color: "#0f172a" }}>{s.title}</div>
                      <div style={{ fontSize: 11, color: "#059669", fontWeight: 700, margin: "2px 0 6px" }}>{s.titleSi}</div>
                      <div style={{ fontSize: 11, color: "#64748b", lineHeight: 1.4 }}>{s.desc}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Declaration of Accuracy Card */}
              <div style={{
                background: "#fffbeb",
                border: "1.5px solid #fde68a",
                borderRadius: "18px",
                padding: "20px 22px",
                display: "flex",
                gap: "14px",
                alignItems: "flex-start",
              }}>
                <div style={{ color: "#d97706", marginTop: 2, flexShrink: 0 }}>
                  {Ico.alert}
                </div>
                <div>
                  <div style={{ fontSize: "14px", color: "#92400e", fontWeight: "800", marginBottom: "4px" }}>
                    Declaration of Accuracy &bull; නිරවද්‍යතාවය පිළිබඳ සහතිකය:
                  </div>
                  <div style={{ fontSize: "12px", color: "#92400e", lineHeight: 1.5 }}>
                    Please ensure all submitted details accurately reflect your household living conditions. The SmartGrama system verifies inputs against the Decentralized Identity (DID) and Grama Niladhari records.
                  </div>
                </div>
              </div>

            </div>

            {/* ── RIGHT COLUMN: SIDEBAR (Benefit Brackets + Apply CTA + AI) ── */}
            <div style={{ display: "flex", flexDirection: "column", gap: 18, position: "sticky", top: "20px" }}>

              {/* Primary Call to Action Card */}
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
                    Ready to Apply?
                  </div>
                  <h3 style={{ fontSize: 22, fontWeight: 900, margin: "0 0 6px", letterSpacing: -0.4 }}>
                    Start Your Application
                  </h3>
                  <div style={{ fontSize: 12, color: "rgba(255,255,255,0.75)", lineHeight: 1.5 }}>
                    Complete the 10-step intake form now. Your progress is saved automatically to your Decentralized Identity (DID).
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "#6ee7b7", fontWeight: 700 }}>
                  {Ico.clock} <span>Estimated time: 5 - 8 minutes</span>
                </div>

                <button
                  onClick={() => navigate("/welfare-apply")}
                  style={{
                    width: "100%",
                    padding: "16px 20px",
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
                  <span>Start 10-Step Application</span>
                  {Ico.arrowRight}
                </button>
              </div>

              {/* Benefit Tiers Bracket Card */}
              <div style={{
                background: "rgba(255, 255, 255, 0.95)",
                backdropFilter: "blur(14px)",
                borderRadius: 22,
                padding: "26px 26px",
                border: "1.5px solid #86efac",
                boxShadow: "0 10px 30px rgba(6, 78, 59, 0.06)",
              }}>
                <div style={{ fontSize: "11px", fontWeight: "800", color: "#059669", letterSpacing: "1px", textTransform: "uppercase", marginBottom: "4px" }}>
                  Aswesuma Benefit Brackets
                </div>
                <div style={{ fontSize: "30px", fontWeight: "900", color: "#064e3b", marginBottom: "2px", letterSpacing: "-1px" }}>
                  Up to Rs. 15,000
                </div>
                <div style={{ fontSize: "12px", color: "#64748b", marginBottom: "18px" }}>
                  PMT score determines monthly stipend tier
                </div>

                <div style={{ borderTop: "1px solid #e2e8f0", paddingTop: "14px", display: "flex", flexDirection: "column", gap: "10px" }}>
                  {[
                    { tier: "Severely Impoverished", amount: "Rs. 15,000 / mo", color: "#064e3b" },
                    { tier: "Poor Bracket", amount: "Rs. 8,500 / mo", color: "#064e3b" },
                    { tier: "Vulnerable Bracket", amount: "Rs. 4,500 / mo", color: "#064e3b" },
                    { tier: "Transitional Bracket", amount: "Rs. 2,500 / mo", color: "#064e3b" },
                  ].map((item, i) => (
                    <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "13px" }}>
                      <span style={{ color: "#475569", fontWeight: "600" }}>{item.tier}</span>
                      <strong style={{ color: item.color, fontWeight: "800" }}>{item.amount}</strong>
                    </div>
                  ))}
                </div>
              </div>

              {/* SmartGrama AI Assistant Box */}
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
                    <div style={{ fontSize: 11, color: "rgba(255,255,255,0.6)" }}>Multilingual Welfare Assistant</div>
                  </div>
                </div>

                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.75)", lineHeight: 1.5 }}>
                  Need help understanding your eligibility or required documents? Ask AI in Sinhala, Tamil, or English.
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
                  <span>Ask AI Assistant</span>
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
