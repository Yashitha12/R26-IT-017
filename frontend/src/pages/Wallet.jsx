import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import { getCurrentUser } from "../utils/user";
import dashboardBg from "../assets/smartgrama_dashboard_bg.jpg";

/* ─── Custom SVG Icons ─── */
const Ico = {
  wallet: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 12V8H6a2 2 0 0 1 0-4h14v4"/><path d="M4 6v12a2 2 0 0 0 2 2h14v-4"/><circle cx="17" cy="16" r="1" fill="currentColor"/></svg>,
  send: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>,
  receive: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>,
  qr: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><circle cx="6.5" cy="6.5" r="1.5" fill="currentColor"/><circle cx="17.5" cy="6.5" r="1.5" fill="currentColor"/><circle cx="6.5" cy="17.5" r="1.5" fill="currentColor"/></svg>,
  loan: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="7" width="20" height="14" rx="3"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/><line x1="12" y1="12" x2="12" y2="16"/><line x1="10" y1="14" x2="14" y2="14"/></svg>,
  welfare: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
  shield: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10"/></svg>,
  bank: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="21" x2="21" y2="21"/><line x1="3" y1="10" x2="21" y2="10"/><polyline points="5 6 12 3 19 6"/><line x1="4" y1="10" x2="4" y2="21"/><line x1="20" y1="10" x2="20" y2="21"/><line x1="8" y1="14" x2="8" y2="17"/><line x1="12" y1="14" x2="12" y2="17"/><line x1="16" y1="14" x2="16" y2="17"/></svg>,
  check: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>,
  clock: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
  arrowUpRight: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="7" y1="17" x2="17" y2="7"/><polyline points="7 7 17 7 17 17"/></svg>,
  arrowDownLeft: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="17" y1="7" x2="7" y2="17"/><polyline points="17 17 7 17 7 7"/></svg>,
};

export default function Wallet() {
  const navigate = useNavigate();
  const user = getCurrentUser();
  const [loans, setLoans] = useState([]);
  const [activeTab, setActiveTab] = useState("all");
  const [showToastMsg, setShowToastMsg] = useState("");

  const notify = (msg) => {
    setShowToastMsg(msg);
    setTimeout(() => setShowToastMsg(""), 3500);
  };

  useEffect(() => {
    fetch("http://127.0.0.1:8000/applications/all")
      .then(res => res.json())
      .then(data => {
        setLoans(data.loans || []);
      })
      .catch(console.error);
  }, []);

  const name = user?.name || "Aravinda Kumara";
  const nic = user?.nic || "200223003053";
  const division = user?.gnDivision || user?.district || "Minuwangoda North";
  const did = user?.did || "did:smartgrama:200223003053";

  const transactions = [
    { id: "TX-9941", title: "Monthly Samurdhi Payout", type: "welfare", date: "May 01, 2026", amount: "+ Rs. 4,500", channel: "Direct Welfare Grant", isCredit: true },
    { id: "TX-9903", title: "Seed Capital Microloan Disbursal", type: "loan", date: "Apr 15, 2026", amount: "+ Rs. 150,000", channel: "Rural Bank Transfer", isCredit: true },
    { id: "TX-9872", title: "Fertilizer Subsidy Voucher Redeemed", type: "welfare", date: "Apr 02, 2026", amount: "- Rs. 3,200", channel: "Agrarian Center QR", isCredit: false },
    { id: "TX-9750", title: "Monthly Samurdhi Payout", type: "welfare", date: "Apr 01, 2026", amount: "+ Rs. 4,500", channel: "Direct Welfare Grant", isCredit: true },
  ];

  const filteredTx = activeTab === "all" ? transactions : transactions.filter(t => t.type === activeTab);

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

        {/* Floating Toast Notification */}
        {showToastMsg && (
          <div style={{
            position: "fixed",
            bottom: 30,
            right: 30,
            background: "#064e3b",
            color: "#fff",
            padding: "14px 24px",
            borderRadius: 14,
            fontWeight: 700,
            fontSize: 14,
            boxShadow: "0 10px 30px rgba(0,0,0,0.25)",
            zIndex: 1000,
            display: "flex",
            alignItems: "center",
            gap: 10,
            animation: "fadeInUp 0.3s ease",
          }}>
            {Ico.check} {showToastMsg}
          </div>
        )}

        <main className="content-container" style={{ display: "flex", flexDirection: "column", gap: 24, padding: "24px 36px 60px" }}>

          {/* ═══════════════════════════════════════════════════
              TOP: SMARTGRAMA DIGITAL PASSBOOK & WALLET CARD
          ═══════════════════════════════════════════════════ */}
          <div style={{
            borderRadius: 20,
            overflow: "hidden",
            boxShadow: "0 14px 40px rgba(4, 20, 55, 0.14)",
            display: "grid",
            gridTemplateColumns: "1.25fr 0.75fr",
            border: "1px solid rgba(255, 255, 255, 0.5)",
          }}>
            {/* Left Card: Account Balance & Identity */}
            <div style={{
              background: "linear-gradient(140deg, #0a1128 0%, #064e3b 100%)",
              padding: "26px 30px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              position: "relative",
              overflow: "hidden",
              color: "#fff",
            }}>
              <div style={{ position: "absolute", top: -30, right: -30, width: 160, height: 160, borderRadius: "50%", background: "rgba(255,255,255,0.04)" }} />

              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
                  <div>
                    <div style={{ fontSize: 10, fontWeight: 800, color: "#6ee7b7", textTransform: "uppercase", letterSpacing: 1.2, marginBottom: 3 }}>
                      Democratic Socialist Republic of Sri Lanka
                    </div>
                    <h1 style={{ fontSize: 20, fontWeight: 900, letterSpacing: -0.4, margin: 0 }}>
                      SmartGrama Digital Passbook
                    </h1>
                  </div>
                  <span style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 5,
                    padding: "4px 11px",
                    borderRadius: 50,
                    background: "rgba(110, 231, 183, 0.18)",
                    border: "1px solid rgba(110, 231, 183, 0.35)",
                    color: "#6ee7b7",
                    fontSize: 11,
                    fontWeight: 700,
                  }}>
                    {Ico.shield} DID Verified
                  </span>
                </div>

                <div style={{ margin: "14px 0 18px" }}>
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,0.6)", fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.8 }}>
                    Total Available Balance
                  </div>
                  <div style={{ fontSize: 34, fontWeight: 900, letterSpacing: -1, lineHeight: 1.1, marginTop: 2 }}>
                    Rs. 12,500
                  </div>
                  <div style={{ fontSize: 12, color: "rgba(255,255,255,0.65)", marginTop: 4 }}>
                    Beneficiary: <strong style={{ color: "#fff" }}>{name}</strong> &nbsp;&middot;&nbsp; NIC: <code style={{ fontFamily: "monospace", color: "#6ee7b7", fontSize: 12 }}>{nic}</code>
                  </div>
                </div>

                {/* Sub-balances breakdown */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <div style={{
                    background: "rgba(255, 255, 255, 0.08)",
                    backdropFilter: "blur(8px)",
                    borderRadius: 14,
                    padding: "12px 16px",
                    border: "1px solid rgba(255, 255, 255, 0.12)",
                  }}>
                    <div style={{ fontSize: 10, color: "rgba(255,255,255,0.6)", fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 3 }}>
                      LKR Savings Account
                    </div>
                    <div style={{ fontSize: 18, fontWeight: 900, color: "#fff" }}>Rs. 8,000</div>
                    <div style={{ fontSize: 10, color: "#6ee7b7", marginTop: 2 }}>Personal Savings Balance</div>
                  </div>

                  <div style={{
                    background: "rgba(255, 255, 255, 0.08)",
                    backdropFilter: "blur(8px)",
                    borderRadius: 14,
                    padding: "12px 16px",
                    border: "1px solid rgba(255, 255, 255, 0.12)",
                  }}>
                    <div style={{ fontSize: 10, color: "rgba(255,255,255,0.6)", fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 3 }}>
                      Welfare Grant Balance
                    </div>
                    <div style={{ fontSize: 18, fontWeight: 900, color: "#6ee7b7" }}>Rs. 4,500</div>
                    <div style={{ fontSize: 10, color: "rgba(255,255,255,0.7)", marginTop: 2 }}>Samurdhi Disbursement</div>
                  </div>
                </div>
              </div>

              <div style={{ marginTop: 14, fontSize: 10, color: "rgba(255,255,255,0.45)", fontFamily: "monospace" }}>
                Anchored to DID: {did}
              </div>
            </div>

            {/* Right Card: Quick Operations & Banking Channel */}
            <div style={{
              background: "rgba(255, 255, 255, 0.94)",
              backdropFilter: "blur(16px)",
              padding: "24px 26px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
            }}>
              <div>
                <div style={{ fontSize: 11, fontWeight: 800, color: "#64748b", textTransform: "uppercase", letterSpacing: 1, marginBottom: 10 }}>
                  Direct Wallet Operations
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  <button
                    onClick={() => notify("Withdrawal request sent to Grama Niladhari linked bank account.")}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      padding: "12px 15px",
                      borderRadius: 14,
                      background: "linear-gradient(135deg, #059669 0%, #064e3b 100%)",
                      color: "#fff",
                      border: "none",
                      fontWeight: 700,
                      fontSize: 13,
                      cursor: "pointer",
                      fontFamily: "inherit",
                      boxShadow: "0 4px 14px rgba(5, 150, 105, 0.25)",
                      transition: "transform 0.15s ease",
                    }}
                    onMouseEnter={e => e.currentTarget.style.transform = "translateY(-2px)"}
                    onMouseLeave={e => e.currentTarget.style.transform = ""}
                  >
                    <div style={{ width: 30, height: 30, borderRadius: 8, background: "rgba(255,255,255,0.18)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      {Ico.bank}
                    </div>
                    <div style={{ textAlign: "left", flex: 1 }}>
                      <div>Transfer to Bank Account</div>
                      <div style={{ fontSize: 10, color: "rgba(255,255,255,0.75)", fontWeight: 500 }}>People's Bank / RDB Linked</div>
                    </div>
                    {Ico.arrowUpRight}
                  </button>

                  <button
                    onClick={() => notify("QR voucher generated for Grama Niladhari merchant redemption.")}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      padding: "12px 15px",
                      borderRadius: 14,
                      background: "#fff",
                      color: "#1e293b",
                      border: "1.5px solid #cbd5e1",
                      fontWeight: 700,
                      fontSize: 13,
                      cursor: "pointer",
                      fontFamily: "inherit",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
                      transition: "all 0.15s ease",
                    }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = "#059669"; e.currentTarget.style.transform = "translateY(-2px)"; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = "#cbd5e1"; e.currentTarget.style.transform = ""; }}
                  >
                    <div style={{ width: 30, height: 30, borderRadius: 8, background: "#f0fdf4", color: "#059669", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      {Ico.qr}
                    </div>
                    <div style={{ textAlign: "left", flex: 1 }}>
                      <div>Show QR Voucher</div>
                      <div style={{ fontSize: 10, color: "#64748b", fontWeight: 500 }}>Redeem at Village Cooperative</div>
                    </div>
                    {Ico.arrowUpRight}
                  </button>
                </div>
              </div>

              <div style={{
                background: "#f8fafc",
                border: "1.5px solid #e2e8f0",
                borderRadius: 14,
                padding: "12px 14px",
                marginTop: 12,
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 3 }}>
                  <span style={{ fontSize: 10, fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>Linked GN Division</span>
                  <span style={{ fontSize: 10, fontWeight: 800, color: "#059669" }}>Active</span>
                </div>
                <div style={{ fontSize: 13, fontWeight: 800, color: "#0f172a" }}>{division}</div>
                <div style={{ fontSize: 11, color: "#64748b", marginTop: 1 }}>Authorized for Government DBT</div>
              </div>
            </div>
          </div>

          {/* ═══════════════════════════════════════════════════
              MIDDLE ROW: ACTIVE LOANS & WELFARE SUPPORT CARDS
          ═══════════════════════════════════════════════════ */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>

            {/* Column 1: Microfinance & Loans */}
            <div style={{
              background: "rgba(255, 255, 255, 0.94)",
              backdropFilter: "blur(12px)",
              borderRadius: 22,
              padding: "28px 32px",
              border: "1.5px solid rgba(255, 255, 255, 0.9)",
              boxShadow: "0 8px 24px rgba(0,0,0,0.04)",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
            }}>
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 42, height: 42, borderRadius: 13, background: "#eef2ff", color: "#4338ca", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      {Ico.loan}
                    </div>
                    <div>
                      <h2 style={{ fontSize: 18, fontWeight: 800, color: "#0f172a", margin: 0 }}>Active Microfinance Loans</h2>
                      <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>Empowerment &amp; Small Business Credit</div>
                    </div>
                  </div>
                  <button
                    onClick={() => navigate("/loan-programs")}
                    style={{
                      background: "#eef2ff",
                      color: "#4338ca",
                      border: "none",
                      padding: "8px 14px",
                      borderRadius: 10,
                      fontWeight: 700,
                      fontSize: 12,
                      cursor: "pointer",
                      fontFamily: "inherit",
                    }}
                  >
                    Apply New +
                  </button>
                </div>

                {loans.length === 0 ? (
                  <div style={{ padding: "28px 0", textAlign: "center" }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: "#334151" }}>Agricultural Microloan (Standard Active)</div>
                    <div style={{ fontSize: 12, color: "#64748b", marginTop: 4 }}>Principal: Rs. 150,000 &nbsp;&middot;&nbsp; 36 Months &nbsp;&middot;&nbsp; 4.5% Subsidized</div>
                    <div style={{ display: "inline-flex", marginTop: 14, padding: "5px 14px", borderRadius: 50, background: "#dcfce7", color: "#166534", fontSize: 12, fontWeight: 700, border: "1px solid #86efac" }}>
                      ✓ Active &amp; Disbursed
                    </div>
                  </div>
                ) : (
                  loans.map((loan, index) => {
                    const isApproved = loan.status === "Active" || loan.status === "Approved";
                    const isPending = loan.status === "Pending";
                    return (
                      <div key={index} style={{
                        background: "#f8fafc",
                        border: "1.5px solid #e2e8f0",
                        borderRadius: 18,
                        padding: "20px 22px",
                        marginBottom: index < loans.length - 1 ? 14 : 0,
                      }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
                          <div>
                            <div style={{ fontSize: 16, fontWeight: 800, color: "#0f172a" }}>{loan.loan_type}</div>
                            <div style={{ fontSize: 12, color: "#64748b", marginTop: 3 }}>
                              {loan.consensus_status || "Approved via Village Consensus"}
                            </div>
                          </div>
                          <span style={{
                            fontSize: 12,
                            fontWeight: 700,
                            padding: "5px 14px",
                            borderRadius: 50,
                            background: isApproved ? "#dcfce7" : isPending ? "#fef3c7" : "#fee2e2",
                            color: isApproved ? "#166534" : isPending ? "#92400e" : "#991b1b",
                            border: `1px solid ${isApproved ? "#86efac" : isPending ? "#fde68a" : "#fca5a5"}`,
                          }}>
                            {isApproved ? "Approved & Disbursed" : loan.status}
                          </span>
                        </div>

                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, borderTop: "1px solid #e2e8f0", paddingTop: 12 }}>
                          <div>
                            <div style={{ fontSize: 11, color: "#94a3b8", fontWeight: 700, textTransform: "uppercase" }}>Amount</div>
                            <div style={{ fontSize: 15, fontWeight: 800, color: "#0f172a", marginTop: 2 }}>
                              Rs. {Number(loan.approved_amount || 150000).toLocaleString()}
                            </div>
                          </div>
                          <div>
                            <div style={{ fontSize: 11, color: "#94a3b8", fontWeight: 700, textTransform: "uppercase" }}>Duration</div>
                            <div style={{ fontSize: 15, fontWeight: 800, color: "#0f172a", marginTop: 2 }}>
                              {loan.duration_months || 36} Months
                            </div>
                          </div>
                          <div>
                            <div style={{ fontSize: 11, color: "#94a3b8", fontWeight: 700, textTransform: "uppercase" }}>Interest</div>
                            <div style={{ fontSize: 15, fontWeight: 800, color: "#059669", marginTop: 2 }}>
                              {loan.interest_rate || "4.5% p.a."}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Column 2: Government Welfare Grants */}
            <div style={{
              background: "rgba(255, 255, 255, 0.94)",
              backdropFilter: "blur(12px)",
              borderRadius: 22,
              padding: "28px 32px",
              border: "1.5px solid rgba(255, 255, 255, 0.9)",
              boxShadow: "0 8px 24px rgba(0,0,0,0.04)",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
            }}>
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 42, height: 42, borderRadius: 13, background: "#ecfdf5", color: "#047857", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      {Ico.welfare}
                    </div>
                    <div>
                      <h2 style={{ fontSize: 18, fontWeight: 800, color: "#0f172a", margin: 0 }}>Government Welfare Grants</h2>
                      <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>Samurdhi &amp; Aswesuma Social Security</div>
                    </div>
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 700, padding: "5px 12px", borderRadius: 50, background: "#dcfce7", color: "#166534", border: "1px solid #86efac" }}>
                    Active
                  </span>
                </div>

                <div style={{
                  background: "#f0fdf4",
                  border: "1.5px solid #bbf7d0",
                  borderRadius: 18,
                  padding: "20px 22px",
                  marginBottom: 16,
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                    <div style={{ fontSize: 16, fontWeight: 800, color: "#064e3b" }}>Monthly Samurdhi Benefit</div>
                    <div style={{ fontSize: 20, fontWeight: 900, color: "#047857" }}>Rs. 4,500 / mo</div>
                  </div>
                  <div style={{ fontSize: 13, color: "#166534", lineHeight: 1.6 }}>
                    Direct government subsidy credited on the 1st of every month into your SmartGrama passbook.
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <div style={{ background: "#f8fafc", padding: "14px 18px", borderRadius: 14, border: "1px solid #e2e8f0" }}>
                    <div style={{ fontSize: 11, color: "#94a3b8", fontWeight: 700, textTransform: "uppercase" }}>Last Disbursed</div>
                    <div style={{ fontSize: 15, fontWeight: 800, color: "#0f172a", marginTop: 3 }}>May 01, 2026</div>
                  </div>
                  <div style={{ background: "#f8fafc", padding: "14px 18px", borderRadius: 14, border: "1px solid #e2e8f0" }}>
                    <div style={{ fontSize: 11, color: "#94a3b8", fontWeight: 700, textTransform: "uppercase" }}>Next Scheduled</div>
                    <div style={{ fontSize: 15, fontWeight: 800, color: "#059669", marginTop: 3 }}>June 01, 2026</div>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* ═══════════════════════════════════════════════════
              BOTTOM ROW: RECENT BLOCKCHAIN TRANSACTION LEDGER
          ═══════════════════════════════════════════════════ */}
          <div style={{
            background: "rgba(255, 255, 255, 0.94)",
            backdropFilter: "blur(12px)",
            borderRadius: 22,
            border: "1.5px solid rgba(255, 255, 255, 0.9)",
            overflow: "hidden",
            boxShadow: "0 8px 24px rgba(0,0,0,0.04)",
          }}>
            <div style={{
              padding: "24px 32px 18px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              borderBottom: "1px solid rgba(241, 245, 249, 0.8)",
              flexWrap: "wrap",
              gap: 14,
            }}>
              <div>
                <h2 style={{ fontSize: 18, fontWeight: 800, color: "#0f172a", margin: 0 }}>
                  Wallet &amp; Disbursement History
                </h2>
                <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>
                  Immutable transactions recorded on the SmartGrama blockchain ledger
                </div>
              </div>

              {/* Filter Tabs */}
              <div style={{ display: "flex", background: "#f1f5f9", borderRadius: 12, padding: 4, gap: 4 }}>
                {[
                  { id: "all", label: "All Records" },
                  { id: "welfare", label: "Welfare Grants" },
                  { id: "loan", label: "Loan Payouts" },
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    style={{
                      padding: "7px 16px",
                      borderRadius: 9,
                      border: "none",
                      fontSize: 13,
                      fontWeight: activeTab === tab.id ? 700 : 600,
                      background: activeTab === tab.id ? "#fff" : "transparent",
                      color: activeTab === tab.id ? "#0f172a" : "#64748b",
                      boxShadow: activeTab === tab.id ? "0 2px 6px rgba(0,0,0,0.06)" : "none",
                      cursor: "pointer",
                      fontFamily: "inherit",
                      transition: "all 0.15s ease",
                    }}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ padding: "18px 32px 28px", display: "flex", flexDirection: "column", gap: 12 }}>
              {filteredTx.map((tx, idx) => (
                <div key={tx.id} style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "16px 20px",
                  borderRadius: 16,
                  background: "#ffffff",
                  border: "1.5px solid #f1f5f9",
                  boxShadow: "0 2px 6px rgba(0,0,0,0.02)",
                  transition: "transform 0.15s ease",
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                    <div style={{
                      width: 44,
                      height: 44,
                      borderRadius: 14,
                      background: tx.isCredit ? "#ecfdf5" : "#fff1f2",
                      color: tx.isCredit ? "#047857" : "#e11d48",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}>
                      {tx.isCredit ? Ico.arrowDownLeft : Ico.arrowUpRight}
                    </div>
                    <div>
                      <div style={{ fontSize: 15, fontWeight: 800, color: "#0f172a" }}>{tx.title}</div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4, fontSize: 12, color: "#64748b" }}>
                        <span style={{ fontFamily: "monospace", color: "#7c3aed", fontWeight: 700 }}>{tx.id}</span>
                        <span>&middot;</span>
                        <span>{tx.channel}</span>
                        <span>&middot;</span>
                        <span>{tx.date}</span>
                      </div>
                    </div>
                  </div>

                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: 17, fontWeight: 900, color: tx.isCredit ? "#059669" : "#e11d48" }}>
                      {tx.amount}
                    </div>
                    <div style={{ fontSize: 11, color: "#059669", fontWeight: 700, marginTop: 3 }}>
                      ✓ Confirmed on Ledger
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </main>
      </div>
    </div>
  );
}