import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import { useEffect, useState } from "react";
import { fetchBlockchainLedger } from "../api/loanApi";
import { getCurrentUser, getInitials } from "../utils/user";
import dashboardBg from "../assets/smartgrama_dashboard_bg.jpg";

/* ─── Inline SVG icons ─── */
const Ico = {
  loan: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="7" width="20" height="14" rx="3"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/><line x1="12" y1="12" x2="12" y2="16"/><line x1="10" y1="14" x2="14" y2="14"/></svg>,
  welfare: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
  wallet: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 12V8H6a2 2 0 0 1 0-4h14v4"/><path d="M4 6v12a2 2 0 0 0 2 2h14v-4"/><circle cx="17" cy="16" r="1" fill="currentColor"/></svg>,
  status: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="9" y1="13" x2="15" y2="13"/><line x1="9" y1="17" x2="13" y2="17"/></svg>,
  ai: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83"/></svg>,
  shield: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10"/></svg>,
  nic: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>,
  location: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>,
  arrow: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>,
  clock: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
  check: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>,
};

const services = [
  { id: "loan",    label: "Micro-Loan",       sub: "Apply for funding",       route: "/loan-programs",   color: "#4338ca", light: "#eef2ff", icon: "loan"    },
  { id: "welfare", label: "Welfare Program",  sub: "Samurdhi & benefits",     route: "/welfare-landing", color: "#047857", light: "#ecfdf5", icon: "welfare"  },
  { id: "wallet",  label: "Digital Wallet",   sub: "Balance & transfers",     route: "/wallet",          color: "#0369a1", light: "#eff6ff", icon: "wallet"   },
  { id: "status",  label: "My Applications",  sub: "Track submissions",       route: "/status",          color: "#b45309", light: "#fffbeb", icon: "status"   },
  { id: "ai",      label: "AI Assistant",     sub: "Ask in any language",     route: "/ai-chat",         color: "#7c3aed", light: "#f5f3ff", icon: "ai"       },
];

const activity = [
  { icon: "loan",    title: "Agricultural Microloan",  amount: "Rs. 150,000",  date: "Apr 10, 2026",  status: "Approved",     ok: true  },
  { icon: "welfare", title: "Samurdhi Welfare Grant",  amount: "Rs. 4,500/mo", date: "May 5, 2026",   status: "Under Review", ok: false },
];

export default function Home() {
  const navigate = useNavigate();
  const user = getCurrentUser();
  const [ledger, setLedger] = useState([]);

  useEffect(() => {
    fetchBlockchainLedger().then(d => setLedger(d.ledger || []));
  }, []);

  const name      = user?.name     || "Resident";
  const nic       = user?.nic      || "—";
  const division  = user?.gnDivision || user?.district || "GN Division";
  const district  = user?.district || "Sri Lanka";
  const did       = user?.did      || null;
  const verified  = user?.kycStatus === "VERIFIED";
  const initials  = getInitials(name);

  return (
    <div style={{
      minHeight: "100vh",
      backgroundImage: `url(${dashboardBg})`,
      backgroundSize: "cover",
      backgroundPosition: "center",
      backgroundAttachment: "fixed",
      position: "relative",
    }}>
      {/* Frosted subtle overlay to ensure great contrast and readability */}
      <div style={{
        position: "absolute",
        inset: 0,
        background: "linear-gradient(175deg, rgba(241, 245, 249, 0.86) 0%, rgba(230, 238, 245, 0.90) 100%)",
        backdropFilter: "blur(4px)",
        pointerEvents: "none",
        zIndex: 0,
      }} />

      <div style={{ position: "relative", zIndex: 1 }}>
        <Header />
        
        <main className="content-container" style={{ display: "flex", flexDirection: "column", gap: 24, padding: "28px 36px 60px" }}>

          {/* ═══════════════════════════════════════════════════
              CITIZEN IDENTITY CARD  — centrepiece of the page
          ═══════════════════════════════════════════════════ */}
          <div style={{
            borderRadius: 24,
            overflow: "hidden",
            boxShadow: "0 20px 50px rgba(4, 20, 55, 0.18)",
            display: "grid",
            gridTemplateColumns: "1.1fr 0.9fr",
            border: "1px solid rgba(255, 255, 255, 0.4)",
          }}>
            {/* Left half — citizen info */}
            <div style={{
              background: "linear-gradient(140deg, #0c1445 0%, #064e3b 100%)",
              padding: "36px 40px",
              display: "flex",
              flexDirection: "column",
              gap: 0,
              position: "relative",
              overflow: "hidden",
            }}>
              {/* decorative circles */}
              <div style={{ position:"absolute", top:-50, left:-50, width:220, height:220, borderRadius:"50%", background:"rgba(255,255,255,0.04)" }} />
              <div style={{ position:"absolute", bottom:-30, right:20, width:140, height:140, borderRadius:"50%", background:"rgba(110,231,183,0.07)" }} />

              <div style={{ position:"relative", display:"flex", alignItems:"center", gap:18, marginBottom:28 }}>
                {/* Avatar */}
                <div style={{
                  width: 72, height: 72, borderRadius: 20,
                  background: "linear-gradient(135deg, #6ee7b7 0%, #059669 100%)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 28, fontWeight: 900, color: "#fff",
                  flexShrink: 0, boxShadow: "0 8px 20px rgba(5,150,105,0.35)",
                  overflow: "hidden"
                }}>
                  {user?.photo ? (
                    <img src={user.photo} alt="Profile" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  ) : (
                    initials
                  )}
                </div>
                <div>
                  <div style={{ fontSize: 24, fontWeight: 900, color: "#fff", lineHeight: 1.1, letterSpacing: -0.5 }}>{name}</div>
                  <div style={{ display:"flex", alignItems:"center", gap:5, marginTop:6, color:"rgba(255,255,255,0.65)", fontSize:13 }}>
                    {Ico.location} {division} &nbsp;&middot;&nbsp; {district}
                  </div>
                </div>
              </div>

              {/* NIC + DID rows */}
              <div style={{ position:"relative", display:"flex", flexDirection:"column", gap:10 }}>
                <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:6, color:"rgba(255,255,255,0.55)", fontSize:12, minWidth:70 }}>{Ico.nic} NIC</div>
                  <div style={{ fontFamily:"monospace", fontSize:15, fontWeight:700, color:"#fff", letterSpacing:1 }}>{nic}</div>
                </div>
                {did && (
                  <div style={{ display:"flex", alignItems:"flex-start", gap:10 }}>
                    <div style={{ display:"flex", alignItems:"center", gap:6, color:"rgba(255,255,255,0.55)", fontSize:12, minWidth:70, marginTop:2 }}>{Ico.shield} DID</div>
                    <div style={{ fontFamily:"monospace", fontSize:11, color:"#6ee7b7", wordBreak:"break-all", lineHeight:1.5 }}>{did}</div>
                  </div>
                )}
              </div>

              {/* Verification badge */}
              <div style={{ marginTop:22 }}>
                {verified ? (
                  <div style={{ display:"inline-flex", alignItems:"center", gap:7, padding:"8px 18px", borderRadius:50, background:"rgba(110,231,183,0.18)", border:"1.5px solid rgba(110,231,183,0.4)", color:"#6ee7b7", fontSize:13, fontWeight:700 }}>
                    {Ico.check} Identity Verified &nbsp;&middot;&nbsp; SmartGrama DID Active
                  </div>
                ) : (
                  <button
                    onClick={() => navigate("/identity")}
                    style={{ display:"inline-flex", alignItems:"center", gap:7, padding:"9px 20px", borderRadius:50, background:"#d97706", border:"none", color:"#fff", fontSize:13, fontWeight:700, cursor:"pointer", fontFamily:"inherit", boxShadow:"0 4px 14px rgba(217,119,6,0.35)" }}
                  >
                    Complete Identity Verification
                  </button>
                )}
              </div>

              {/* Watermark text */}
              <div style={{ position:"absolute", bottom:16, right:20, fontSize:10, fontWeight:700, color:"rgba(255,255,255,0.15)", textTransform:"uppercase", letterSpacing:2 }}>
                SmartGrama · Democratic Socialist Republic of Sri Lanka
              </div>
            </div>

            {/* Right half — balance & quick stats */}
            <div style={{
              background: "rgba(255, 255, 255, 0.92)",
              backdropFilter: "blur(14px)",
              padding: "36px 40px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
            }}>
              <div>
                <div style={{ fontSize:13, fontWeight:700, color:"#64748b", textTransform:"uppercase", letterSpacing:1, marginBottom:6 }}>Welfare Account Balance</div>
                <div style={{ fontSize:48, fontWeight:900, color:"#064e3b", letterSpacing:-2, lineHeight:1 }}>Rs. 12,500</div>
                <div style={{ fontSize:13, color:"#64748b", marginTop:8 }}>SmartGrama Digital Wallet · Updated today</div>
              </div>

              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:12, marginTop:22 }}>
                {[
                  { label:"Savings",      val:"Rs. 8,000", color:"#059669" },
                  { label:"Welfare",      val:"Rs. 4,500", color:"#0369a1" },
                  { label:"Active Loans", val:"1",         color:"#7c3aed" },
                ].map(s => (
                  <div key={s.label} style={{ background:"#ffffff", borderRadius:16, padding:"16px", boxShadow:"0 4px 12px rgba(0,0,0,0.04)", border:"1px solid rgba(226,232,240,0.8)" }}>
                    <div style={{ fontSize:11, color:"#94a3b8", fontWeight:700, textTransform:"uppercase", letterSpacing:0.5, marginBottom:6 }}>{s.label}</div>
                    <div style={{ fontSize:20, fontWeight:900, color:s.color }}>{s.val}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ═══════════════════════════════════════════════════
              BOTTOM ROW — Services  |  Activity  |  AI Panel
          ═══════════════════════════════════════════════════ */}
          <div style={{ display:"grid", gridTemplateColumns:"260px 1fr 290px", gap:22 }}>

            {/* ── SERVICE PORTAL column ── */}
            <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
              <div style={{ fontSize:14, fontWeight:800, color:"#1e293b", textTransform:"uppercase", letterSpacing:0.8, marginBottom:4 }}>Services</div>
              {services.map(s => (
                <div
                  key={s.id}
                  onClick={() => navigate(s.route)}
                  style={{
                    display:"flex", alignItems:"center", gap:14,
                    padding:"15px 18px", borderRadius:18,
                    background:"rgba(255, 255, 255, 0.90)",
                    backdropFilter:"blur(10px)",
                    border:"1.5px solid rgba(255, 255, 255, 0.9)",
                    boxShadow:"0 4px 14px rgba(0,0,0,0.03)",
                    cursor:"pointer", transition:"all 0.18s ease",
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = s.light; e.currentTarget.style.borderColor = s.color+"44"; e.currentTarget.style.transform = "translateX(4px)"; e.currentTarget.style.boxShadow = "0 6px 18px rgba(0,0,0,0.07)"; }}
                  onMouseLeave={e => { e.currentTarget.style.background = "rgba(255, 255, 255, 0.90)"; e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.9)"; e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = "0 4px 14px rgba(0,0,0,0.03)"; }}
                >
                  <div style={{ width:46, height:46, borderRadius:14, background:s.light, color:s.color, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                    {Ico[s.icon]}
                  </div>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:15, fontWeight:700, color:"#0f172a" }}>{s.label}</div>
                    <div style={{ fontSize:12, color:"#64748b", marginTop:2 }}>{s.sub}</div>
                  </div>
                  <div style={{ color:"#94a3b8" }}>{Ico.arrow}</div>
                </div>
              ))}
            </div>

            {/* ── ACTIVITY FEED column ── */}
            <div style={{
              background:"rgba(255, 255, 255, 0.92)",
              backdropFilter:"blur(12px)",
              borderRadius:22,
              border:"1.5px solid rgba(255, 255, 255, 0.9)",
              overflow:"hidden",
              boxShadow:"0 8px 24px rgba(0,0,0,0.04)",
            }}>
              <div style={{ padding:"22px 28px 16px", display:"flex", alignItems:"center", justifyContent:"space-between", borderBottom:"1px solid rgba(241, 245, 249, 0.8)" }}>
                <div style={{ fontSize:17, fontWeight:800, color:"#0f172a" }}>Recent Activity</div>
                <button onClick={() => navigate("/status")} style={{ fontSize:13, fontWeight:700, color:"#059669", background:"none", border:"none", cursor:"pointer", display:"flex", alignItems:"center", gap:4 }}>
                  View All {Ico.arrow}
                </button>
              </div>

              <div style={{ padding:"16px 28px 24px", display:"flex", flexDirection:"column", gap:12 }}>
                {activity.map((a, i) => (
                  <div key={i} style={{ display:"flex", alignItems:"center", gap:16, padding:"16px 18px", borderRadius:16, background:"#ffffff", border:"1.5px solid #f1f5f9", boxShadow:"0 2px 8px rgba(0,0,0,0.02)" }}>
                    <div style={{ width:48, height:48, borderRadius:14, flexShrink:0, display:"flex", alignItems:"center", justifyContent:"center",
                      background: a.icon === "loan" ? "#eef2ff" : "#ecfdf5",
                      color:       a.icon === "loan" ? "#4338ca" : "#047857",
                    }}>
                      {Ico[a.icon]}
                    </div>
                    <div style={{ flex:1 }}>
                      <div style={{ fontSize:15, fontWeight:700, color:"#0f172a" }}>{a.title}</div>
                      <div style={{ display:"flex", alignItems:"center", gap:6, marginTop:4, fontSize:12, color:"#64748b" }}>
                        {Ico.clock} {a.date} &nbsp;&middot;&nbsp; {a.amount}
                      </div>
                    </div>
                    <span style={{ fontSize:12, fontWeight:700, padding:"6px 14px", borderRadius:50, whiteSpace:"nowrap",
                      background: a.ok ? "#f0fdf4" : "#fffbeb",
                      color:       a.ok ? "#047857" : "#b45309",
                      border: `1px solid ${a.ok ? "#86efac" : "#fcd34d"}`,
                    }}>
                      {a.status}
                    </span>
                  </div>
                ))}

                {/* Blockchain ledger entries */}
                {ledger.slice(0, 2).map((tx, i) => (
                  <div key={"tx" + i} style={{ display:"flex", alignItems:"center", gap:16, padding:"14px 18px", borderRadius:16, background:"#ffffff", border:"1.5px dashed #cbd5e1" }}>
                    <div style={{ width:44, height:44, borderRadius:13, background:"#f5f3ff", color:"#7c3aed", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, fontSize:11, fontWeight:800, fontFamily:"monospace" }}>
                      TX
                    </div>
                    <div style={{ flex:1, overflow:"hidden" }}>
                      <div style={{ fontSize:14, fontWeight:700, color:"#334155", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{tx.type || "Blockchain Transaction"}</div>
                      <div style={{ fontSize:11, color:"#64748b", marginTop:3 }}>{tx.timestamp || "—"}</div>
                    </div>
                    <span style={{ fontSize:11, fontWeight:700, padding:"4px 12px", borderRadius:50, background:"#f5f3ff", color:"#7c3aed", border:"1px solid #ddd6fe" }}>Ledger</span>
                  </div>
                ))}

                {ledger.length === 0 && activity.length > 0 && (
                  <div style={{ textAlign:"center", padding:"16px 0", fontSize:12, color:"#94a3b8" }}>
                    No blockchain transactions yet
                  </div>
                )}
              </div>
            </div>

            {/* ── RIGHT PANEL ── */}
            <div style={{ display:"flex", flexDirection:"column", gap:18 }}>

              {/* GN Division card */}
              <div style={{
                background:"rgba(255, 255, 255, 0.92)",
                backdropFilter:"blur(12px)",
                border:"1.5px solid #86efac",
                borderRadius:22,
                padding:"22px 24px",
                boxShadow:"0 8px 24px rgba(6, 78, 59, 0.06)",
              }}>
                <div style={{ fontSize:11, fontWeight:700, color:"#64748b", textTransform:"uppercase", letterSpacing:1, marginBottom:8 }}>GN Division</div>
                <div style={{ fontSize:22, fontWeight:900, color:"#064e3b", marginBottom:4 }}>{division}</div>
                <div style={{ fontSize:13, color:"#64748b", marginBottom:16 }}>{district} District &nbsp;&middot;&nbsp; Sri Lanka</div>
                <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                  {[
                    { label:"KYC Status",     val: verified ? "Verified" : "Pending" },
                    { label:"Welfare Active", val: "Yes"        },
                    { label:"Loan Eligible",  val: "Eligible"   },
                  ].map(r => (
                    <div key={r.label} style={{ display:"flex", justifyContent:"space-between", fontSize:13, paddingBottom: 4, borderBottom:"1px solid #f1f5f9" }}>
                      <span style={{ color:"#64748b", fontWeight:500 }}>{r.label}</span>
                      <span style={{ fontWeight:700, color: r.val === "Pending" ? "#d97706" : "#059669" }}>{r.val}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* SmartGrama AI card */}
              <div style={{
                borderRadius:22, padding:"24px",
                background:"linear-gradient(140deg, #1e1b4b 0%, #312e81 50%, #4c1d95 100%)",
                color:"#fff",
                boxShadow:"0 12px 32px rgba(76,29,149,0.32)",
                display:"flex", flexDirection:"column", gap:16,
              }}>
                <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                  <div style={{ width:48, height:48, borderRadius:15, background:"rgba(255,255,255,0.14)", display:"flex", alignItems:"center", justifyContent:"center" }}>
                    {Ico.ai}
                  </div>
                  <div>
                    <div style={{ fontWeight:900, fontSize:17, letterSpacing:-0.3 }}>SmartGrama AI</div>
                    <div style={{ fontSize:12, color:"rgba(255,255,255,0.65)", marginTop:2 }}>Your welfare assistant</div>
                  </div>
                </div>

                <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                  {["Am I eligible for Samurdhi?", "How do I apply for a loan?", "Check my application status"].map(q => (
                    <div
                      key={q}
                      onClick={() => navigate("/ai-chat")}
                      style={{ padding:"10px 14px", borderRadius:12, background:"rgba(255,255,255,0.09)", border:"1px solid rgba(255,255,255,0.14)", fontSize:12, color:"rgba(255,255,255,0.85)", cursor:"pointer", transition:"background 0.15s" }}
                      onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.18)"}
                      onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.09)"}
                    >
                      "{q}"
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => navigate("/ai-chat")}
                  style={{ padding:"13px", borderRadius:14, border:"1px solid rgba(255,255,255,0.28)", background:"rgba(255,255,255,0.16)", color:"#fff", fontWeight:700, fontSize:14, cursor:"pointer", fontFamily:"inherit", display:"flex", alignItems:"center", justifyContent:"center", gap:8, transition:"background 0.15s" }}
                  onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.24)"}
                  onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.16)"}
                >
                  Open AI Chat {Ico.arrow}
                </button>
              </div>

            </div>
          </div>

        </main>
      </div>
    </div>
  );
}
