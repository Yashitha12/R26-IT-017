import { useState, useEffect, useRef, useCallback } from "react";

// ── THEME ────────────────────────────────────────────────────────────────────
const T = {
  bg: "#07090f",
  bg2: "#0d1117",
  bg3: "#111827",
  bg4: "#1a2235",
  card: "rgba(255,255,255,0.04)",
  cardB: "rgba(255,255,255,0.08)",
  accent: "#00e5b0",
  accent2: "#3b82f6",
  accent3: "#a78bfa",
  accent4: "#fb923c",
  text: "#eef2ff",
  text2: "#94a3b8",
  text3: "#4b5563",
  danger: "#f87171",
  warning: "#fbbf24",
  success: "#00e5b0",
};

// ── GLOBAL STYLES ────────────────────────────────────────────────────────────
const globalCSS = `
  @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap');
  *, *::before, *::after { margin:0; padding:0; box-sizing:border-box; }
  body { font-family:'Outfit',sans-serif; background:${T.bg}; color:${T.text}; overflow-x:hidden; }
  ::-webkit-scrollbar { width:5px; height:5px; }
  ::-webkit-scrollbar-track { background:transparent; }
  ::-webkit-scrollbar-thumb { background:rgba(255,255,255,0.1); border-radius:3px; }
  input,select,textarea { font-family:'Outfit',sans-serif; }
  button { font-family:'Outfit',sans-serif; cursor:pointer; }

  @keyframes fadeUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
  @keyframes fadeIn { from{opacity:0} to{opacity:1} }
  @keyframes slideIn { from{opacity:0;transform:translateX(-20px)} to{opacity:1;transform:translateX(0)} }
  @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
  @keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
  @keyframes orbFloat1 { 0%,100%{transform:translate(0,0) scale(1)} 50%{transform:translate(40px,-50px) scale(1.08)} }
  @keyframes orbFloat2 { 0%,100%{transform:translate(0,0) scale(1)} 50%{transform:translate(-30px,40px) scale(0.92)} }
  @keyframes orbFloat3 { 0%,100%{transform:translate(0,0) scale(1)} 50%{transform:translate(20px,30px) scale(1.04)} }
  @keyframes splashGrow { from{transform:scale(0.8);opacity:0} to{transform:scale(1);opacity:1} }
  @keyframes loadBar { from{width:0} to{width:100%} }
  @keyframes blockSlide { from{opacity:0;transform:translateY(-8px)} to{opacity:1;transform:translateY(0)} }
  @keyframes shimmer { 0%{background-position:-200% 0} 100%{background-position:200% 0} }

  .fade-up { animation: fadeUp 0.45s cubic-bezier(0.22,1,0.36,1) both; }
  .fade-up-1 { animation: fadeUp 0.45s cubic-bezier(0.22,1,0.36,1) 0.05s both; }
  .fade-up-2 { animation: fadeUp 0.45s cubic-bezier(0.22,1,0.36,1) 0.1s both; }
  .fade-up-3 { animation: fadeUp 0.45s cubic-bezier(0.22,1,0.36,1) 0.15s both; }
  .fade-up-4 { animation: fadeUp 0.45s cubic-bezier(0.22,1,0.36,1) 0.2s both; }

  .nav-item { transition: all 0.15s ease; }
  .nav-item:hover { background: rgba(255,255,255,0.05) !important; color: ${T.text} !important; }
  .card-hover { transition: border-color 0.2s, background 0.2s, transform 0.2s; }
  .card-hover:hover { border-color: rgba(255,255,255,0.15) !important; background: rgba(255,255,255,0.06) !important; transform: translateY(-1px); }
  .btn-press:active { transform: scale(0.97); }
  .loan-card { transition: all 0.2s; }
  .loan-card:hover { border-color: ${T.accent2} !important; background: rgba(59,130,246,0.06) !important; transform: translateY(-2px); }
  .loan-card.selected { border-color: ${T.accent} !important; background: rgba(0,229,176,0.06) !important; }
  .block-item { animation: blockSlide 0.3s ease both; }

  input[type=range] { -webkit-appearance:none; appearance:none; width:100%; height:5px; border-radius:3px; background: rgba(255,255,255,0.1); outline:none; }
  input[type=range]::-webkit-slider-thumb { -webkit-appearance:none; width:18px; height:18px; border-radius:50%; background:${T.accent}; cursor:pointer; border:2px solid ${T.bg2}; }
  input[type=checkbox] { accent-color:${T.accent}; width:16px; height:16px; cursor:pointer; }
`;

// ── HELPERS ──────────────────────────────────────────────────────────────────
const fmt = (n) => "Rs. " + Math.round(n).toLocaleString("en-LK");
const calcEMI = (amt, n, rate = 0.12) => {
  const r = rate / 12;
  return amt * r * Math.pow(1 + r, n) / (Math.pow(1 + r, n) - 1);
};

// ── MICRO COMPONENTS ─────────────────────────────────────────────────────────
const Badge = ({ children, type = "green" }) => {
  const colors = {
    green: { bg: "rgba(0,229,176,0.12)", color: T.accent, border: "rgba(0,229,176,0.25)" },
    blue: { bg: "rgba(59,130,246,0.12)", color: T.accent2, border: "rgba(59,130,246,0.25)" },
    purple: { bg: "rgba(167,139,250,0.12)", color: T.accent3, border: "rgba(167,139,250,0.25)" },
    yellow: { bg: "rgba(251,191,36,0.12)", color: T.warning, border: "rgba(251,191,36,0.25)" },
    red: { bg: "rgba(248,113,113,0.12)", color: T.danger, border: "rgba(248,113,113,0.25)" },
    gray: { bg: "rgba(255,255,255,0.06)", color: T.text2, border: "rgba(255,255,255,0.12)" },
  };
  const c = colors[type] || colors.green;
  return (
    <span style={{ display:"inline-flex", alignItems:"center", gap:4, padding:"3px 10px", borderRadius:20, fontSize:11, fontWeight:700, background:c.bg, color:c.color, border:`1px solid ${c.border}` }}>
      {children}
    </span>
  );
};

const Btn = ({ children, variant = "primary", size = "md", onClick, style: s = {}, disabled }) => {
  const base = { display:"inline-flex", alignItems:"center", gap:8, border:"none", borderRadius:10, fontWeight:600, cursor:disabled?"not-allowed":"pointer", transition:"all 0.15s", opacity:disabled?0.5:1, fontFamily:"'Outfit',sans-serif" };
  const sizes = { sm: { padding:"7px 16px", fontSize:12 }, md: { padding:"10px 22px", fontSize:13 }, lg: { padding:"14px 30px", fontSize:15 } };
  const variants = {
    primary: { background:T.accent, color:"#000" },
    secondary: { background:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,255,255,0.1)", color:T.text },
    outline: { background:"transparent", border:`1px solid rgba(255,255,255,0.12)`, color:T.text2 },
    danger: { background:"rgba(248,113,113,0.12)", border:"1px solid rgba(248,113,113,0.25)", color:T.danger },
    ghost: { background:"transparent", color:T.text2 },
  };
  return (
    <button className="btn-press" disabled={disabled} onClick={onClick} style={{ ...base, ...sizes[size], ...variants[variant], ...s }}>
      {children}
    </button>
  );
};

const Card = ({ children, style: s = {}, className = "" }) => (
  <div className={`card-hover ${className}`} style={{ background:T.card, border:`1px solid ${T.cardB}`, borderRadius:16, padding:"20px 22px", ...s }}>
    {children}
  </div>
);

const InfoRow = ({ label, value, accent }) => (
  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"9px 0", borderBottom:`1px solid rgba(255,255,255,0.04)` }}>
    <span style={{ fontSize:13, color:T.text3 }}>{label}</span>
    <span style={{ fontSize:13, color:accent||T.text, fontWeight:500 }}>{value}</span>
  </div>
);

const InfoPanel = ({ children, style: s = {} }) => (
  <div style={{ background:T.bg3, border:`1px solid ${T.cardB}`, borderRadius:12, padding:"12px 16px", ...s }}>
    {children}
  </div>
);

const SectionTitle = ({ icon, children }) => (
  <div style={{ display:"flex", alignItems:"center", gap:8, fontSize:14, fontWeight:700, marginBottom:14, color:T.text }}>
    <span style={{ fontSize:16 }}>{icon}</span>{children}
  </div>
);

const Alert = ({ type = "info", children }) => {
  const styles = {
    info: { bg:"rgba(59,130,246,0.1)", border:"rgba(59,130,246,0.3)", icon:"ℹ️" },
    success: { bg:"rgba(0,229,176,0.1)", border:"rgba(0,229,176,0.3)", icon:"✅" },
    warning: { bg:"rgba(251,191,36,0.1)", border:"rgba(251,191,36,0.3)", icon:"⚠️" },
    danger: { bg:"rgba(248,113,113,0.1)", border:"rgba(248,113,113,0.3)", icon:"🚨" },
  };
  const st = styles[type];
  return (
    <div style={{ display:"flex", alignItems:"flex-start", gap:10, padding:"12px 16px", borderRadius:10, background:st.bg, borderLeft:`3px solid ${st.border}`, fontSize:13, color:T.text2, lineHeight:1.5 }}>
      <span>{st.icon}</span><span>{children}</span>
    </div>
  );
};

const ProgressBar = ({ pct, color = T.accent, height = 6 }) => (
  <div style={{ height, background:"rgba(255,255,255,0.07)", borderRadius:3, overflow:"hidden" }}>
    <div style={{ height:"100%", width:`${pct}%`, background:color, borderRadius:3, transition:"width 0.6s ease" }} />
  </div>
);

const StatCard = ({ label, value, delta, deltaUp, color }) => (
  <Card>
    <div style={{ fontSize:12, color:T.text3, marginBottom:8, textTransform:"uppercase", letterSpacing:"0.06em", fontWeight:600 }}>{label}</div>
    <div style={{ fontSize:26, fontWeight:800, letterSpacing:"-0.5px", color:color||T.text }}>{value}</div>
    {delta && <div style={{ fontSize:12, marginTop:4, color:deltaUp?T.accent:T.text2 }}>{deltaUp?"↑ ":""}{delta}</div>}
  </Card>
);

const Divider = ({ style: s = {} }) => <div style={{ height:1, background:"rgba(255,255,255,0.06)", margin:"18px 0", ...s }} />;

const LiveDot = () => (
  <span style={{ width:7, height:7, borderRadius:"50%", background:T.accent, display:"inline-block", animation:"pulse 1.5s infinite" }} />
);

const Steps = ({ total, current }) => (
  <div style={{ display:"flex", alignItems:"center", marginBottom:28 }}>
    {Array.from({ length: total }).map((_, i) => (
      <div key={i} style={{ display:"flex", alignItems:"center", flex: i < total-1 ? 1 : 0 }}>
        <div style={{
          width:32, height:32, borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center",
          fontSize:12, fontWeight:700, flexShrink:0, zIndex:1, transition:"all 0.3s",
          background: i < current ? T.accent : i === current ? T.bg3 : T.bg3,
          border: i < current ? `2px solid ${T.accent}` : i === current ? `2px solid ${T.accent}` : `2px solid rgba(255,255,255,0.12)`,
          color: i < current ? "#000" : i === current ? T.accent : T.text3,
          boxShadow: i === current ? `0 0 0 4px rgba(0,229,176,0.12)` : "none",
        }}>
          {i < current ? "✓" : i + 1}
        </div>
        {i < total - 1 && (
          <div style={{ flex:1, height:2, background: i < current ? T.accent : "rgba(255,255,255,0.08)", margin:"0 -1px" }} />
        )}
      </div>
    ))}
  </div>
);

// ── TOAST ────────────────────────────────────────────────────────────────────
const Toast = ({ message, type, onClose }) => {
  useEffect(() => { const t = setTimeout(onClose, 4000); return () => clearTimeout(t); }, [onClose]);
  const bg = type === "success" ? "rgba(0,229,176,0.12)" : "rgba(59,130,246,0.12)";
  const border = type === "success" ? "rgba(0,229,176,0.35)" : "rgba(59,130,246,0.35)";
  return (
    <div style={{ position:"fixed", bottom:30, right:30, zIndex:9999, background:bg, border:`1px solid ${border}`, borderRadius:14, padding:"14px 20px", fontSize:13, color:T.text, maxWidth:380, backdropFilter:"blur(16px)", boxShadow:"0 8px 32px rgba(0,0,0,0.4)", animation:"fadeUp 0.3s ease" }}>
      {message}
    </div>
  );
};

// ── MODAL ────────────────────────────────────────────────────────────────────
const Modal = ({ title, children, onClose, maxWidth = 540 }) => (
  <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.75)", zIndex:1000, display:"flex", alignItems:"center", justifyContent:"center", backdropFilter:"blur(6px)", padding:20 }} onClick={(e) => e.target === e.currentTarget && onClose()}>
    <div style={{ background:T.bg2, border:`1px solid ${T.cardB}`, borderRadius:20, padding:"28px 32px", maxWidth, width:"100%", maxHeight:"88vh", overflowY:"auto", animation:"splashGrow 0.3s cubic-bezier(0.22,1,0.36,1)" }}>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:22 }}>
        <div style={{ fontSize:18, fontWeight:800 }}>{title}</div>
        <button onClick={onClose} style={{ background:"none", border:"none", color:T.text3, fontSize:24, cursor:"pointer", lineHeight:1, padding:4 }}>×</button>
      </div>
      {children}
    </div>
  </div>
);

// ── FORM COMPONENTS ──────────────────────────────────────────────────────────
const inputStyle = { width:"100%", padding:"10px 14px", background:T.bg3, border:`1px solid ${T.cardB}`, borderRadius:10, color:T.text, fontSize:13, outline:"none", transition:"border-color 0.2s" };
const labelStyle = { display:"block", fontSize:11, fontWeight:700, color:T.text3, marginBottom:6, textTransform:"uppercase", letterSpacing:"0.06em" };

const FormInput = ({ label, ...props }) => (
  <div style={{ marginBottom:16 }}>
    {label && <label style={labelStyle}>{label}</label>}
    <input style={inputStyle} {...props} onFocus={e => e.target.style.borderColor = T.accent} onBlur={e => e.target.style.borderColor = T.cardB} />
  </div>
);

const FormSelect = ({ label, children, ...props }) => (
  <div style={{ marginBottom:16 }}>
    {label && <label style={labelStyle}>{label}</label>}
    <select style={{ ...inputStyle, cursor:"pointer" }} {...props}>{children}</select>
  </div>
);

const FormTextarea = ({ label, ...props }) => (
  <div style={{ marginBottom:16 }}>
    {label && <label style={labelStyle}>{label}</label>}
    <textarea style={{ ...inputStyle, resize:"vertical", minHeight:80, lineHeight:1.5 }} {...props} onFocus={e => e.target.style.borderColor = T.accent} onBlur={e => e.target.style.borderColor = T.cardB} />
  </div>
);

const FormRow = ({ children }) => (
  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>{children}</div>
);

// ── WALLET CARD ──────────────────────────────────────────────────────────────
const WalletCard = () => (
  <div style={{ background:"linear-gradient(135deg,#0f2b4a,#0a1e35,#061525)", border:"1px solid rgba(59,130,246,0.25)", borderRadius:20, padding:"28px 30px", position:"relative", overflow:"hidden", marginBottom:20 }}>
    <div style={{ position:"absolute", top:-60, right:-60, width:220, height:220, borderRadius:"50%", background:"rgba(59,130,246,0.07)", pointerEvents:"none" }} />
    <div style={{ position:"absolute", bottom:-40, left:-40, width:160, height:160, borderRadius:"50%", background:"rgba(0,229,176,0.05)", pointerEvents:"none" }} />
    <div style={{ fontSize:11, color:"rgba(255,255,255,0.4)", textTransform:"uppercase", letterSpacing:"0.12em" }}>Total Balance</div>
    <div style={{ fontSize:40, fontWeight:800, color:"#fff", marginTop:4, letterSpacing:"-1px" }}>Rs. 47,500<span style={{ fontSize:20, opacity:0.5 }}>.00</span></div>
    <div style={{ display:"flex", gap:10, marginTop:14, flexWrap:"wrap" }}>
      <Badge type="green">✓ Verified Account</Badge>
      <Badge type="blue">Sampath Bank</Badge>
    </div>
    <div style={{ fontFamily:"'JetBrains Mono'", fontSize:11, color:"rgba(255,255,255,0.3)", marginTop:12 }}>DID: did:sg:0x7f3a9b2c...b2e1 · SG-WLT-007832</div>
  </div>
);

// ── BLOCKCHAIN LOG ────────────────────────────────────────────────────────────
const BLOCK_EVENTS_INIT = [
  { icon:"🔐", color:"rgba(0,229,176,0.15)", type:"Loan Disbursement", hash:"0x7f3a...b2e1", time:"2 min ago", amount:"Rs. 1,70,000" },
  { icon:"✅", color:"rgba(59,130,246,0.15)", type:"KYC Verification", hash:"0x4c1d...9f3a", time:"14 min ago", amount:"User: AK-007" },
  { icon:"📋", color:"rgba(167,139,250,0.15)", type:"Welfare Approved", hash:"0x2b8e...6c4f", time:"1 hr ago", amount:"Rs. 5,000/mo" },
  { icon:"💰", color:"rgba(251,191,36,0.15)", type:"EMI Payment", hash:"0x9e5f...1d7b", time:"3 hr ago", amount:"Rs. 3,382" },
  { icon:"🛡️", color:"rgba(0,229,176,0.15)", type:"Profile Updated", hash:"0x1a2b...3c4d", time:"5 hr ago", amount:"User: NP-156" },
  { icon:"⚠️", color:"rgba(248,113,113,0.15)", type:"Fraud Alert", hash:"0x5f6g...7h8i", time:"1 day ago", amount:"Duplicate NIC" },
];

// ── PAGES ────────────────────────────────────────────────────────────────────

// RESIDENT DASHBOARD
const DashboardPage = ({ showPage }) => (
  <div className="fade-up">
    <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", flexWrap:"wrap", gap:14, marginBottom:24 }}>
      <div>
        <div style={{ fontSize:26, fontWeight:800, letterSpacing:"-0.5px" }}>Welcome back, Aravinda 👋</div>
        <div style={{ fontSize:13, color:T.text2, marginTop:4 }}>Gampaha GN Division · Digital ID: <span style={{ fontFamily:"'JetBrains Mono'", color:T.accent }}>DID-2024-007832</span></div>
      </div>
      <div style={{ display:"flex", gap:10 }}>
        <Btn variant="outline" size="sm" onClick={() => showPage("chatbot")}>🤖 Ask AI</Btn>
        <Btn size="sm" onClick={() => showPage("loan-info")}>Apply Now →</Btn>
      </div>
    </div>

    <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))", gap:14, marginBottom:20 }} className="fade-up-1">
      <StatCard label="Wallet Balance" value="Rs. 47,500" delta="Rs. 3,200 this month" deltaUp color={T.accent} />
      <StatCard label="Active Loan" value="Rs. 1,70,000" delta="Rs. 3,382/month" />
      <StatCard label="Welfare Status" value="Active" delta="Next: Rs. 5,000 on 1st" deltaUp color={T.accent3} />
      <StatCard label="Credit Score" value="742" delta="↑ 18 pts this quarter" deltaUp color={T.warning} />
    </div>

    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:18, marginBottom:18 }} className="fade-up-2">
      <Card>
        <SectionTitle icon="⚡">Quick Actions</SectionTitle>
        <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
          {[
            { label:"🏦 Apply for Loan", page:"loan-info" },
            { label:"🤝 Apply for Welfare", page:"welfare-info" },
            { label:"💼 View My Wallet", page:"wallet" },
            { label:"📋 Application Status", page:"status" },
          ].map(a => (
            <Btn key={a.page} variant="secondary" onClick={() => showPage(a.page)} style={{ justifyContent:"flex-start" }}>{a.label}</Btn>
          ))}
        </div>
      </Card>
      <Card>
        <SectionTitle icon="📌">Recent Activity</SectionTitle>
        {[
          { dot:T.accent, time:"Today, 09:14", text:"Loan installment Rs. 3,382 paid" },
          { dot:T.accent3, time:"Apr 29", text:"Welfare payment Rs. 5,000 received" },
          { dot:T.accent2, time:"Apr 15", text:"Profile KYC verification completed" },
          { dot:T.warning, time:"Apr 1", text:"Loan Rs. 1,70,000 disbursed to wallet" },
        ].map((ev, i) => (
          <div key={i} style={{ position:"relative", paddingLeft:22, marginBottom:16 }}>
            <div style={{ position:"absolute", left:0, top:5, width:10, height:10, borderRadius:"50%", background:ev.dot, border:`2px solid ${T.bg2}` }} />
            {i < 3 && <div style={{ position:"absolute", left:4, top:14, width:2, height:"calc(100% + 6px)", background:"rgba(255,255,255,0.06)" }} />}
            <div style={{ fontSize:11, color:T.text3, marginBottom:2, fontFamily:"'JetBrains Mono'" }}>{ev.time}</div>
            <div style={{ fontSize:13, color:T.text2 }}>{ev.text}</div>
          </div>
        ))}
      </Card>
    </div>

    <Card className="fade-up-3" style={{ marginBottom:18 }}>
      <SectionTitle icon="📊">Loan Repayment Progress</SectionTitle>
      <div style={{ display:"flex", justifyContent:"space-between", marginBottom:10 }}>
        <span style={{ fontSize:13, color:T.text2 }}>Rs. 40,584 repaid of Rs. 1,70,000</span>
        <span style={{ fontWeight:700, color:T.accent }}>24%</span>
      </div>
      <ProgressBar pct={24} height={10} />
      <div style={{ display:"flex", justifyContent:"space-between", marginTop:8, fontSize:12, color:T.text3 }}>
        <span>12 installments paid</span><span>38 remaining · 38 months left</span>
      </div>
    </Card>

    <Card className="fade-up-4">
      <SectionTitle icon="📈">Monthly Wallet Activity</SectionTitle>
      <div style={{ display:"flex", gap:8, alignItems:"flex-end", height:130, padding:"0 8px" }}>
        {[["Nov",50],["Dec",70],["Jan",45],["Feb",60],["Mar",80],["Apr",65,true]].map(([m,h,cur]) => (
          <div key={m} style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center" }}>
            <div style={{ width:"100%", height:`${h}%`, background:cur?T.accent:T.accent2, borderRadius:"4px 4px 0 0", opacity:cur?1:0.6, transition:"opacity 0.2s" }} />
            <div style={{ fontSize:10, color:T.text3, marginTop:4 }}>{m}</div>
          </div>
        ))}
      </div>
    </Card>
  </div>
);

// LOAN INFO PAGE
const LoanInfoPage = ({ showPage }) => {
  const [selected, setSelected] = useState("Agriculture");
  const loans = [
    { name:"Agriculture", icon:"🌾", max:"Rs. 3,00,000", badge:"Pre-approved", badgeType:"green" },
    { name:"Business", icon:"🏪", max:"Rs. 5,00,000", badge:"Verify needed", badgeType:"blue" },
    { name:"Education", icon:"🎓", max:"Rs. 2,00,000", badge:"Pre-approved", badgeType:"green" },
    { name:"Emergency", icon:"🚨", max:"Rs. 50,000", badge:"Instant", badgeType:"green" },
    { name:"Housing", icon:"🏠", max:"Rs. 10,00,000", badge:"Guarantor req.", badgeType:"yellow" },
    { name:"Microloan", icon:"💰", max:"Rs. 25,000", badge:"Instant", badgeType:"green" },
  ];
  return (
    <div className="fade-up">
      <div style={{ fontSize:26, fontWeight:800, marginBottom:6 }}>Loan Programs</div>
      <div style={{ fontSize:13, color:T.text2, marginBottom:24 }}>Select a loan type to view eligibility and apply</div>
      <Alert type="info" style={{ marginBottom:20 }}>Your profile is verified. Most loan types are pre-approved based on your income and repayment history.</Alert>
      <div style={{ marginBottom:20 }} />
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(160px,1fr))", gap:14, marginBottom:24 }}>
        {loans.map(l => (
          <div key={l.name} className={`loan-card ${selected===l.name?"selected":""}`}
            onClick={() => setSelected(l.name)}
            style={{ background:T.card, border:`2px solid ${selected===l.name?T.accent:T.cardB}`, borderRadius:16, padding:16, cursor:"pointer", textAlign:"center", background:selected===l.name?"rgba(0,229,176,0.06)":T.card }}>
            <div style={{ fontSize:28, marginBottom:8 }}>{l.icon}</div>
            <div style={{ fontSize:13, fontWeight:700 }}>{l.name} Loan</div>
            <div style={{ fontSize:11, color:T.text3, marginTop:4, marginBottom:8 }}>Up to {l.max}</div>
            <Badge type={l.badgeType}>{l.badge}</Badge>
          </div>
        ))}
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14, marginBottom:24 }}>
        <InfoPanel>
          <div style={{ fontSize:13, fontWeight:700, marginBottom:10, color:T.text }}>Income Requirements</div>
          <InfoRow label="Min. monthly income" value="Rs. 15,000" />
          <InfoRow label="Stable employment" value="6+ months" />
          <InfoRow label="Debt-to-income ratio" value="< 50%" />
        </InfoPanel>
        <InfoPanel>
          <div style={{ fontSize:13, fontWeight:700, marginBottom:10, color:T.text }}>Documents Status</div>
          <InfoRow label="NIC / Smart ID" value={<Badge type="green">✓ Verified</Badge>} />
          <InfoRow label="Income proof" value={<Badge type="green">✓ Verified</Badge>} />
          <InfoRow label="Address proof" value={<Badge type="green">✓ Verified</Badge>} />
        </InfoPanel>
      </div>
      <div style={{ textAlign:"center" }}>
        <Btn size="lg" onClick={() => showPage("loan-apply")}>Proceed to Application →</Btn>
      </div>
    </div>
  );
};

// LOAN APPLY PAGE
const LoanApplyPage = ({ showPage, showToast }) => {
  const [amount, setAmount] = useState(200000);
  const [period, setPeriod] = useState(60);
  const [showModal, setShowModal] = useState(false);

  const emi = calcEMI(amount, period);
  const total = emi * period;
  const interest = total - amount;

  const recAmt = amount > 170000 ? 170000 : amount;
  const recEmi = calcEMI(recAmt, period);
  const isReduced = amount > 170000;

  return (
    <div className="fade-up">
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:24, flexWrap:"wrap", gap:12 }}>
        <div>
          <div style={{ fontSize:26, fontWeight:800 }}>Loan Application</div>
          <div style={{ fontSize:13, color:T.text2, marginTop:4 }}>Agriculture Loan · Quick Application</div>
        </div>
        <Btn variant="secondary" size="sm" onClick={() => showPage("loan-info")}>← Back</Btn>
      </div>
      <Steps total={5} current={1} />

      <Card style={{ marginBottom:18 }}>
        <SectionTitle icon="💰">Loan Details</SectionTitle>
        <FormRow>
          <div>
            <label style={labelStyle}>Requested Amount (Rs.)</label>
            <input style={inputStyle} type="number" value={amount} onChange={e => setAmount(Number(e.target.value))} onFocus={e => e.target.style.borderColor = T.accent} onBlur={e => e.target.style.borderColor = T.cardB} />
            <input type="range" min="10000" max="500000" step="5000" value={amount} onChange={e => setAmount(Number(e.target.value))} style={{ marginTop:8, width:"100%" }} />
          </div>
          <FormSelect label="Repayment Period (months)" value={period} onChange={e => setPeriod(Number(e.target.value))}>
            {[12,24,36,48,60].map(n => <option key={n} value={n}>{n} months</option>)}
          </FormSelect>
        </FormRow>
        <FormSelect label="Loan Purpose">
          <option>Purchase seeds and fertilizer</option>
          <option>Irrigation infrastructure</option>
          <option>Farm equipment</option>
          <option>Crop storage facility</option>
        </FormSelect>
        <FormTextarea label="Additional Notes" placeholder="Describe how you will use the funds..." />
      </Card>

      <Card style={{ marginBottom:18 }}>
        <SectionTitle icon="🤝">Guarantor Details (Optional)</SectionTitle>
        <FormRow>
          <FormInput label="Guarantor Full Name" placeholder="Leave blank if not needed" />
          <FormInput label="Guarantor NIC" placeholder="e.g. 912345678V" />
        </FormRow>
      </Card>

      <Card style={{ background:"rgba(0,229,176,0.04)", borderColor:"rgba(0,229,176,0.18)", marginBottom:24 }}>
        <SectionTitle icon="📊">Estimated Repayment Preview</SectionTitle>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:14, textAlign:"center" }}>
          <div><div style={{ fontSize:11, color:T.text3, textTransform:"uppercase", letterSpacing:"0.06em" }}>Monthly EMI</div><div style={{ fontSize:26, fontWeight:800, color:T.accent, marginTop:4 }}>{fmt(emi)}</div></div>
          <div><div style={{ fontSize:11, color:T.text3, textTransform:"uppercase", letterSpacing:"0.06em" }}>Total Interest</div><div style={{ fontSize:26, fontWeight:800, color:T.warning, marginTop:4 }}>{fmt(interest)}</div></div>
          <div><div style={{ fontSize:11, color:T.text3, textTransform:"uppercase", letterSpacing:"0.06em" }}>Total Payable</div><div style={{ fontSize:26, fontWeight:800, marginTop:4 }}>{fmt(total)}</div></div>
        </div>
      </Card>

      <div style={{ display:"flex", gap:12 }}>
        <Btn variant="secondary" onClick={() => showPage("loan-info")}>← Back</Btn>
        <Btn style={{ flex:1, justifyContent:"center" }} onClick={() => setShowModal(true)}>Submit & Evaluate →</Btn>
      </div>

      {showModal && (
        <Modal title="Loan Evaluation Result" onClose={() => setShowModal(false)}>
          <div style={{ background:isReduced?"rgba(251,191,36,0.08)":"rgba(0,229,176,0.08)", border:`1px solid ${isReduced?"rgba(251,191,36,0.3)":"rgba(0,229,176,0.3)"}`, borderRadius:14, padding:20, marginBottom:16 }}>
            <div style={{ display:"flex", alignItems:"center", gap:14, marginBottom:16 }}>
              <span style={{ fontSize:40 }}>{isReduced?"⚠️":"✅"}</span>
              <div>
                <div style={{ fontSize:20, fontWeight:800, color:isReduced?T.warning:T.accent }}>{isReduced?"Reduced Amount Approved":"Loan Approved!"}</div>
                <div style={{ fontSize:12, color:T.text2, marginTop:2 }}>AI Evaluation Complete · Blockchain Logged</div>
              </div>
            </div>
            <InfoPanel>
              <InfoRow label="Requested Amount" value={<span style={isReduced?{textDecoration:"line-through",color:T.text3}:{}}>{fmt(amount)}</span>} />
              {isReduced && <InfoRow label="Recommended Amount" value={fmt(recAmt)} accent={T.accent} />}
              <InfoRow label="Monthly Installment" value={fmt(isReduced?recEmi:emi)} />
              <InfoRow label="Duration" value={`${period} months`} />
              <InfoRow label="Risk Level" value={<Badge type="yellow">Medium (28%)</Badge>} />
            </InfoPanel>
          </div>
          <Alert type={isReduced?"warning":"success"}>
            {isReduced?"Existing loan balance and monthly expenses are high. Reduced amount recommended for manageable repayment.":"Your income, savings, and repayment history support this loan amount."}
          </Alert>
          <div style={{ marginTop:10 }}>
            <Alert type="info">💡 Tip: Reduce monthly expenses by Rs. 2,000 to improve your credit score by 20+ points within 3 months.</Alert>
          </div>
          <div style={{ display:"flex", gap:10, marginTop:20, justifyContent:"flex-end" }}>
            <Btn variant="secondary" onClick={() => setShowModal(false)}>Review Later</Btn>
            <Btn onClick={() => { setShowModal(false); showToast("✓ Loan accepted! Funds transferred to your wallet. Blockchain record created.", "success"); showPage("wallet"); }}>✓ Accept Offer</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
};

// WALLET PAGE
const WalletPage = () => (
  <div className="fade-up">
    <div style={{ fontSize:26, fontWeight:800, marginBottom:4 }}>My Wallet</div>
    <div style={{ fontSize:13, color:T.text2, marginBottom:22 }}>Digital wallet linked to your DID</div>
    <WalletCard />
    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:18 }}>
      <Card className="fade-up-1">
        <SectionTitle icon="🏦">Active Loan</SectionTitle>
        <InfoPanel style={{ marginBottom:12 }}>
          <InfoRow label="Loan Type" value="Agriculture" />
          <InfoRow label="Original Amount" value="Rs. 1,70,000" />
          <InfoRow label="Remaining Balance" value="Rs. 1,29,416" accent={T.accent} />
          <InfoRow label="Monthly Installment" value="Rs. 3,382" />
          <InfoRow label="Next Payment" value="May 15, 2025" accent={T.warning} />
          <InfoRow label="Installments Paid" value="12 / 50" />
        </InfoPanel>
        <ProgressBar pct={24} />
        <div style={{ textAlign:"right", fontSize:12, color:T.text3, marginTop:6 }}>24% repaid</div>
      </Card>

      <Card className="fade-up-1">
        <SectionTitle icon="🤝">Welfare Benefits</SectionTitle>
        <InfoPanel style={{ marginBottom:12 }}>
          <InfoRow label="Program" value="Samurdhi" />
          <InfoRow label="Category" value="Low-Income Family" />
          <InfoRow label="Monthly Amount" value="Rs. 5,000" accent={T.accent} />
          <InfoRow label="Status" value={<Badge type="green">Active</Badge>} />
          <InfoRow label="Next Payment" value="June 1, 2025" />
          <InfoRow label="Total Received" value="Rs. 60,000" />
        </InfoPanel>
      </Card>

      <Card className="fade-up-2">
        <SectionTitle icon="👥">Village Savings Group</SectionTitle>
        <InfoPanel style={{ marginBottom:12 }}>
          <InfoRow label="Group Name" value="Gampaha Group 04" />
          <InfoRow label="Members" value="18 residents" />
          <InfoRow label="Monthly Contribution" value="Rs. 1,000" />
          <InfoRow label="Group Fund Total" value="Rs. 2,16,000" accent={T.accent} />
          <InfoRow label="Your Contribution" value="Rs. 12,000" />
          <InfoRow label="Group Loan Eligible" value={<Badge type="green">Yes</Badge>} />
        </InfoPanel>
      </Card>

      <Card className="fade-up-2">
        <SectionTitle icon="📜">Payment History</SectionTitle>
        <table style={{ width:"100%", borderCollapse:"collapse", fontSize:13 }}>
          <thead>
            <tr>{["Date","Type","Amount","Status"].map(h => <th key={h} style={{ textAlign:"left", padding:"8px 10px", fontSize:11, color:T.text3, textTransform:"uppercase", letterSpacing:"0.05em", borderBottom:`1px solid ${T.cardB}` }}>{h}</th>)}</tr>
          </thead>
          <tbody>
            {[["May 1","Loan EMI","Rs. 3,382","Paid","green"],["May 1","Welfare","Rs. 5,000","Received","green"],["Apr 30","Group","Rs. 1,000","Paid","green"],["Apr 1","Loan EMI","Rs. 3,382","Paid","green"],["Apr 1","Welfare","Rs. 5,000","Received","green"]].map(([d,t,a,s,bt],i) => (
              <tr key={i}>
                <td style={{ padding:"10px 10px", color:T.text3, borderBottom:`1px solid rgba(255,255,255,0.03)` }}>{d}</td>
                <td style={{ padding:"10px 10px", fontWeight:600, borderBottom:`1px solid rgba(255,255,255,0.03)` }}>{t}</td>
                <td style={{ padding:"10px 10px", borderBottom:`1px solid rgba(255,255,255,0.03)` }}>{a}</td>
                <td style={{ padding:"10px 10px", borderBottom:`1px solid rgba(255,255,255,0.03)` }}><Badge type={bt}>{s}</Badge></td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  </div>
);

// WELFARE PAGES
const WelfareInfoPage = ({ showPage }) => (
  <div className="fade-up">
    <div style={{ fontSize:26, fontWeight:800, marginBottom:4 }}>Welfare Programs</div>
    <div style={{ fontSize:13, color:T.text2, marginBottom:22 }}>Government-backed social assistance programs</div>
    <div style={{ display:"flex", flexDirection:"column", gap:14, marginBottom:28 }}>
      {[
        { icon:"🌿", name:"Samurdhi Welfare Program", amt:"Rs. 3,500 – Rs. 5,500 / month", desc:"For low-income families with dependents. Includes food, health, and education support.", badge:"Eligible", bt:"green" },
        { icon:"👴", name:"Senior Citizen Allowance", amt:"Rs. 2,000 / month", desc:"For citizens above 70 years. Must have no other income source.", badge:"Partial", bt:"yellow" },
        { icon:"♿", name:"Disability Support Allowance", amt:"Rs. 2,500 / month", desc:"For persons with disabilities. Requires medical certificate.", badge:"Review", bt:"blue" },
      ].map((w, i) => (
        <Card key={i} style={{ display:"flex", alignItems:"flex-start", gap:16 }}>
          <span style={{ fontSize:32, flexShrink:0 }}>{w.icon}</span>
          <div style={{ flex:1 }}>
            <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:6 }}>
              <span style={{ fontSize:15, fontWeight:700 }}>{w.name}</span>
              <Badge type={w.bt}>{w.badge}</Badge>
            </div>
            <div style={{ fontSize:20, fontWeight:800, color:T.accent, marginBottom:4 }}>{w.amt}</div>
            <div style={{ fontSize:12, color:T.text3 }}>{w.desc}</div>
          </div>
        </Card>
      ))}
    </div>
    <div style={{ textAlign:"center" }}>
      <Btn size="lg" onClick={() => showPage("welfare-apply")}>Apply for Welfare →</Btn>
    </div>
  </div>
);

const WelfareApplyPage = ({ showPage, showToast }) => (
  <div className="fade-up">
    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:24, flexWrap:"wrap", gap:12 }}>
      <div>
        <div style={{ fontSize:26, fontWeight:800 }}>Welfare Application</div>
        <div style={{ fontSize:13, color:T.text2, marginTop:4 }}>Samurdhi Program · Smart Contract Evaluation</div>
      </div>
      <Btn variant="secondary" size="sm" onClick={() => showPage("welfare-info")}>← Back</Btn>
    </div>
    <Steps total={4} current={1} />
    <Card style={{ marginBottom:18 }}>
      <SectionTitle icon="📋">Additional Details</SectionTitle>
      <FormSelect label="Current Hardship Reason">
        <option>Low family income</option><option>Job loss / unemployment</option>
        <option>Medical emergency</option><option>Natural disaster impact</option>
      </FormSelect>
      <FormRow>
        <FormInput label="Current Monthly Income (Rs.)" type="number" defaultValue="22000" />
        <FormInput label="Household Size" type="number" defaultValue="4" />
      </FormRow>
      <FormSelect label="Required Support Type">
        <option>Monthly cash allowance</option><option>Food assistance</option>
        <option>Healthcare support</option><option>Education support</option>
      </FormSelect>
      <FormTextarea label="Household Condition Update" placeholder="Describe any recent changes in your household situation..." />
    </Card>
    <Alert type="success">✓ Your profile data is pre-filled from registration. Only additional details are needed here.</Alert>
    <div style={{ display:"flex", gap:12, marginTop:20 }}>
      <Btn variant="secondary" onClick={() => showPage("welfare-info")}>← Back</Btn>
      <Btn style={{ flex:1, justifyContent:"center" }} onClick={() => { showToast("✓ Smart contract evaluation complete. You are eligible for Rs. 5,000/month Samurdhi benefit!", "success"); showPage("status"); }}>
        Submit for Smart Contract Evaluation →
      </Btn>
    </div>
  </div>
);

// PROFILE PAGE
const ProfilePage = () => (
  <div className="fade-up">
    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:24, flexWrap:"wrap", gap:12 }}>
      <div style={{ fontSize:26, fontWeight:800 }}>My Profile</div>
      <Btn variant="outline" size="sm">✏️ Edit Profile</Btn>
    </div>
    <div style={{ display:"flex", alignItems:"center", gap:20, marginBottom:26 }}>
      <div style={{ width:72, height:72, borderRadius:"50%", background:"linear-gradient(135deg,#a78bfa,#3b82f6)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:26, fontWeight:800, color:"#fff", flexShrink:0 }}>AK</div>
      <div>
        <div style={{ fontSize:22, fontWeight:800 }}>Aravinda Kumara</div>
        <div style={{ fontSize:13, color:T.text2, marginTop:4 }}>Gampaha GN Division · Registered May 2024</div>
        <div style={{ display:"flex", gap:8, marginTop:8, flexWrap:"wrap" }}>
          <Badge type="green">✓ KYC Verified</Badge>
          <Badge type="blue">Digital ID Active</Badge>
          <Badge type="purple">DID Holder</Badge>
        </div>
      </div>
    </div>
    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
      {[
        { title:"👤 Personal Details", rows:[["Full Name","Aravinda Kumara"],["NIC","912345678V",true],["Date of Birth","March 14, 1991"],["Gender","Male"],["Phone","+94 71 234 5678"]] },
        { title:"📍 Address & GN Division", rows:[["Address","45/A, Jayawickrama Rd"],["City","Gampaha"],["District","Gampaha"],["GN Division","Minuwangoda North"],["Postal Code","11000"]] },
        { title:"💼 Employment & Income", rows:[["Occupation","Farmer"],["Monthly Income","Rs. 32,000"],["Monthly Expenses","Rs. 18,000"],["Net Savings","Rs. 14,000",false,T.accent]] },
        { title:"👨‍👩‍👧 Family Details", rows:[["Family Size","4 members"],["Dependents","2 children"],["Spouse Income","Rs. 0 (homemaker)"],["Welfare History","Samurdhi (2019-)"]] },
      ].map((sec, si) => (
        <Card key={si}>
          <div style={{ fontSize:14, fontWeight:700, marginBottom:14 }}>{sec.title}</div>
          <InfoPanel>
            {sec.rows.map(([l,v,mono,accent]) => (
              <InfoRow key={l} label={l} value={<span style={mono?{fontFamily:"'JetBrains Mono'",fontSize:12}:{}}>{v}</span>} accent={accent} />
            ))}
          </InfoPanel>
        </Card>
      ))}
    </div>
  </div>
);

// STATUS PAGE
const StatusPage = () => (
  <div className="fade-up">
    <div style={{ fontSize:26, fontWeight:800, marginBottom:4 }}>Application Status</div>
    <div style={{ fontSize:13, color:T.text2, marginBottom:22 }}>Track your loan and welfare applications</div>
    <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
      {[
        { title:"Agriculture Loan — Rs. 1,70,000", ref:"LN-2025-00112", date:"April 1, 2025", badge:"Approved & Active", bt:"green", step:5, labels:["Applied","Evaluated","KYC Done","Approved","Disbursed"] },
        { title:"Samurdhi Welfare", ref:"WF-2025-00044", date:"Feb 10, 2025", badge:"Active", bt:"green", step:3, labels:["Applied","Evaluated","Verified","Active"] },
      ].map((app, i) => (
        <Card key={i} style={{ borderColor:i===0?"rgba(0,229,176,0.2)":"rgba(167,139,250,0.2)" }}>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:16, flexWrap:"wrap", gap:8 }}>
            <div>
              <div style={{ fontWeight:700, fontSize:15 }}>{app.title}</div>
              <div style={{ fontSize:12, color:T.text3, marginTop:2 }}>Applied: {app.date} · REF: {app.ref}</div>
            </div>
            <Badge type={app.bt}>{app.badge}</Badge>
          </div>
          <Steps total={app.labels.length} current={app.step} />
          <div style={{ display:"flex", justifyContent:"space-between", fontSize:10, color:T.text3, marginTop:-16 }}>
            {app.labels.map(l => <span key={l}>{l}</span>)}
          </div>
        </Card>
      ))}
    </div>
  </div>
);

// CHATBOT PAGE
const CHAT_RESPONSES = {
  loan: "Based on your profile, you're eligible for loans up to Rs. 3,00,000. Your income-to-expense ratio is healthy at 56%. Would you like to start an application?",
  credit: "Your SmartGrama credit score is 742/900 (Good). It improved by 18 points this quarter thanks to consistent loan repayments. Keep it up!",
  payment: "Your next loan payment of Rs. 3,382 is due on May 15, 2025. Your welfare payment of Rs. 5,000 will arrive on June 1, 2025.",
  welfare: "You're enrolled in the Samurdhi Welfare Program receiving Rs. 5,000/month. You may also be eligible for the Education Support Scheme.",
  default: "Based on your SmartGrama profile, I can help with loan applications, welfare programs, wallet management, and credit improvement tips. Could you be more specific?",
};

const ChatbotPage = () => {
  const [messages, setMessages] = useState([{ text:"👋 Hello Aravinda! I'm your SmartGrama AI assistant. I can help you with:\n\n• Loan eligibility and applications\n• Welfare program information\n• Your wallet and payment history\n• Understanding your credit score\n\nWhat would you like to know?", type:"bot" }]);
  const [input, setInput] = useState("");
  const endRef = useRef(null);

  const sendMsg = useCallback((msg) => {
    if (!msg.trim()) return;
    const newMsgs = [...messages, { text:msg, type:"user" }];
    setMessages(newMsgs);
    setInput("");
    const lower = msg.toLowerCase();
    let resp = CHAT_RESPONSES.default;
    if (lower.includes("loan")||lower.includes("eligible")||lower.includes("borrow")) resp = CHAT_RESPONSES.loan;
    else if (lower.includes("credit")||lower.includes("score")) resp = CHAT_RESPONSES.credit;
    else if (lower.includes("payment")||lower.includes("next")||lower.includes("due")) resp = CHAT_RESPONSES.payment;
    else if (lower.includes("welfare")||lower.includes("samurdhi")) resp = CHAT_RESPONSES.welfare;
    setTimeout(() => setMessages(m => [...m, { text:resp, type:"bot" }]), 700);
  }, [messages]);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior:"smooth" }); }, [messages]);

  return (
    <div className="fade-up">
      <div style={{ fontSize:26, fontWeight:800, marginBottom:4 }}>SmartGrama AI Assistant</div>
      <div style={{ fontSize:13, color:T.text2, marginBottom:22 }}>Ask anything about loans, welfare, or your account</div>
      <div style={{ display:"flex", flexDirection:"column", height:480 }}>
        <div style={{ flex:1, overflowY:"auto", background:T.bg3, borderRadius:14, border:`1px solid ${T.cardB}`, padding:16, display:"flex", flexDirection:"column", gap:8, marginBottom:14 }}>
          {messages.map((m, i) => (
            <div key={i} style={{ maxWidth:"80%", padding:"12px 16px", borderRadius:14, fontSize:13, lineHeight:1.6, alignSelf:m.type==="user"?"flex-end":"flex-start", background:m.type==="user"?T.accent:T.bg4, color:m.type==="user"?"#000":T.text2, borderRadius:m.type==="user"?"14px 4px 14px 14px":"4px 14px 14px 14px", border:m.type==="bot"?`1px solid ${T.cardB}`:"none", whiteSpace:"pre-wrap", animation:"splashGrow 0.2s ease" }}>
              {m.text}
            </div>
          ))}
          <div ref={endRef} />
        </div>
        <div style={{ display:"flex", gap:10 }}>
          <input style={{ ...inputStyle, flex:1 }} value={input} onChange={e => setInput(e.target.value)} placeholder="Ask me anything..." onKeyDown={e => e.key==="Enter" && sendMsg(input)} onFocus={e => e.target.style.borderColor=T.accent} onBlur={e => e.target.style.borderColor=T.cardB} />
          <Btn onClick={() => sendMsg(input)}>Send →</Btn>
        </div>
        <div style={{ display:"flex", gap:8, flexWrap:"wrap", marginTop:10 }}>
          {["Am I eligible for a loan?","What is my credit score?","Next payment date?","Show welfare programs"].map(q => (
            <Btn key={q} variant="outline" size="sm" onClick={() => sendMsg(q)}>{q}</Btn>
          ))}
        </div>
      </div>
    </div>
  );
};

// OFFICER DASHBOARD
const OfficerDashPage = ({ showPage }) => {
  const apps = [
    { name:"Nimal Perera", nic:"851234567V", type:"Loan", amount:"Rs. 1,50,000", risk:"32%", riskType:"yellow", status:"Pending KYC", st:"yellow" },
    { name:"Kamani Silva", nic:"930987654X", type:"Welfare", amount:"Rs. 5,000/mo", risk:"Low", riskType:"green", status:"Pending Review", st:"blue" },
    { name:"Sunil Bandara", nic:"780456123V", type:"Loan", amount:"Rs. 3,00,000", risk:"68%", riskType:"red", status:"Pending KYC", st:"yellow" },
    { name:"Dilani Fernando", nic:"921876543W", type:"Welfare", amount:"Rs. 3,500/mo", risk:"Low", riskType:"green", status:"Pending Review", st:"blue" },
  ];
  return (
    <div className="fade-up">
      <div style={{ fontSize:26, fontWeight:800, marginBottom:4 }}>Officer Dashboard</div>
      <div style={{ fontSize:13, color:T.text2, marginBottom:22 }}>GN / Samurdhi / Bank Officer Portal</div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(160px,1fr))", gap:14, marginBottom:22 }}>
        <StatCard label="Pending KYC" value="14" delta="3 urgent today" color={T.warning} />
        <StatCard label="Loan Reviews" value="27" delta="8 need decision" color={T.accent2} />
        <StatCard label="Welfare Verif." value="19" delta="5 site visits due" color={T.accent3} />
        <StatCard label="Completed Today" value="11" delta="↑ 3 vs yesterday" deltaUp color={T.accent} />
      </div>
      <Card>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:16, flexWrap:"wrap", gap:10 }}>
          <SectionTitle icon="📋" style={{ margin:0 }}>Pending Applications</SectionTitle>
          <div style={{ display:"flex", gap:8 }}>
            <select style={{ ...inputStyle, width:"auto", padding:"6px 12px", fontSize:12 }}><option>All Types</option><option>Loan</option><option>Welfare</option></select>
            <select style={{ ...inputStyle, width:"auto", padding:"6px 12px", fontSize:12 }}><option>All Status</option><option>Pending KYC</option></select>
          </div>
        </div>
        <div style={{ overflowX:"auto" }}>
          <table style={{ width:"100%", borderCollapse:"collapse", fontSize:13 }}>
            <thead>
              <tr>{["Applicant","Type","Amount","AI Risk","Status","Action"].map(h => <th key={h} style={{ textAlign:"left", padding:"10px 14px", fontSize:11, color:T.text3, textTransform:"uppercase", letterSpacing:"0.05em", borderBottom:`1px solid ${T.cardB}` }}>{h}</th>)}</tr>
            </thead>
            <tbody>
              {apps.map((a, i) => (
                <tr key={i} style={{ borderBottom:`1px solid rgba(255,255,255,0.03)` }}>
                  <td style={{ padding:"12px 14px" }}>
                    <div style={{ fontWeight:600 }}>{a.name}</div>
                    <div style={{ fontSize:11, color:T.text3, fontFamily:"'JetBrains Mono'" }}>{a.nic}</div>
                  </td>
                  <td style={{ padding:"12px 14px" }}><Badge type={a.type==="Loan"?"blue":"purple"}>{a.type}</Badge></td>
                  <td style={{ padding:"12px 14px", fontWeight:600 }}>{a.amount}</td>
                  <td style={{ padding:"12px 14px" }}><Badge type={a.riskType}>{a.risk} risk</Badge></td>
                  <td style={{ padding:"12px 14px" }}><Badge type={a.st}>{a.status}</Badge></td>
                  <td style={{ padding:"12px 14px" }}><Btn size="sm" onClick={() => showPage("officer-review")}>Review</Btn></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

// OFFICER REVIEW PAGE
const OfficerReviewPage = ({ showPage, showToast }) => (
  <div className="fade-up">
    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:24, flexWrap:"wrap", gap:12 }}>
      <div>
        <div style={{ fontSize:26, fontWeight:800 }}>Applicant Review</div>
        <div style={{ fontSize:13, color:T.text2, marginTop:4 }}>Nimal Perera · Loan Application · REF: LN-2025-00156</div>
      </div>
      <Btn variant="secondary" size="sm" onClick={() => showPage("officer-dash")}>← Back to List</Btn>
    </div>
    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:18 }}>
      <div>
        <Card style={{ marginBottom:16 }}>
          <SectionTitle icon="🧑">Applicant Profile</SectionTitle>
          <InfoPanel>
            <InfoRow label="Name" value="Nimal Perera" />
            <InfoRow label="NIC" value={<span style={{ fontFamily:"'JetBrains Mono'", fontSize:12 }}>851234567V</span>} />
            <InfoRow label="GN Division" value="Minuwangoda East" />
            <InfoRow label="KYC Status" value={<Badge type="yellow">Pending</Badge>} />
          </InfoPanel>
        </Card>
        <Card>
          <SectionTitle icon="💰">Financial Summary</SectionTitle>
          <InfoPanel>
            <InfoRow label="Monthly Income" value="Rs. 28,000" />
            <InfoRow label="Monthly Expenses" value="Rs. 21,000" />
            <InfoRow label="Net Savings" value="Rs. 7,000" accent={T.accent} />
            <InfoRow label="Existing Loans" value="Rs. 45,000" />
            <InfoRow label="Assets Value" value="Rs. 2,40,000" />
          </InfoPanel>
        </Card>
      </div>
      <div>
        <Card style={{ marginBottom:16 }}>
          <SectionTitle icon="🤖">AI Evaluation Result</SectionTitle>
          <div style={{ marginBottom:16 }}>
            <div style={{ display:"flex", justifyContent:"space-between", marginBottom:8 }}>
              <span style={{ fontSize:13, color:T.text2 }}>Default Risk Score</span>
              <span style={{ fontWeight:800, color:T.warning }}>32%</span>
            </div>
            <div style={{ height:12, borderRadius:6, background:`linear-gradient(90deg,${T.accent},${T.warning},${T.danger})`, position:"relative" }}>
              <div style={{ position:"absolute", left:"32%", top:-4, width:4, height:20, background:"#fff", borderRadius:2, transform:"translateX(-2px)", boxShadow:"0 2px 8px rgba(0,0,0,0.5)" }} />
            </div>
            <div style={{ display:"flex", justifyContent:"space-between", fontSize:10, color:T.text3, marginTop:4 }}>
              <span>Low Risk</span><span>Medium</span><span>High Risk</span>
            </div>
          </div>
          <InfoPanel>
            <InfoRow label="Requested Amount" value="Rs. 1,50,000" />
            <InfoRow label="AI Recommended" value="Rs. 1,20,000" accent={T.accent} />
            <InfoRow label="Suggested EMI" value="Rs. 2,868" />
            <InfoRow label="Duration" value="42 months" />
          </InfoPanel>
          <div style={{ marginTop:12 }}>
            <Alert type="warning">High existing loan burden. Recommend reducing amount by Rs. 30,000.</Alert>
          </div>
        </Card>
        <Card>
          <SectionTitle icon="✅">Officer Decision</SectionTitle>
          <FormSelect label="Decision">
            <option>Approve — Full Amount</option>
            <option>Approve — Reduced Amount (Rs. 1,20,000)</option>
            <option>Request Guarantor</option>
            <option>Reject</option>
          </FormSelect>
          <FormTextarea label="Officer Notes" placeholder="Add verification notes..." />
          <div style={{ display:"flex", gap:10 }}>
            <Btn variant="danger" style={{ flex:1, justifyContent:"center" }}>✗ Reject</Btn>
            <Btn style={{ flex:2, justifyContent:"center" }} onClick={() => { showToast("✓ Decision submitted. Blockchain audit log updated. Applicant notified.", "success"); showPage("officer-dash"); }}>
              ✓ Submit Decision
            </Btn>
          </div>
        </Card>
      </div>
    </div>
  </div>
);

// ADMIN DASHBOARD
const AdminDashPage = () => {
  const [blocks, setBlocks] = useState(BLOCK_EVENTS_INIT);
  const BLOCK_TYPES = ["EMI Payment","Smart Contract Exec","Profile Verified","Group Contribution","KYC Approved"];
  const BLOCK_AMTS = ["Rs. 2,500","Rs. 3,000","User: SG-"+Math.floor(Math.random()*9000+1000),"Rs. 1,000","User verified"];

  useEffect(() => {
    const t = setInterval(() => {
      const i = Math.floor(Math.random() * BLOCK_TYPES.length);
      setBlocks(b => [
        { icon:"⛓️", color:"rgba(59,130,246,0.15)", type:BLOCK_TYPES[i], hash:"0x"+Math.random().toString(16).substr(2,8)+"..."+Math.random().toString(16).substr(2,4), time:"just now", amount:BLOCK_AMTS[i] },
        ...b.slice(0,5)
      ]);
    }, 12000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="fade-up">
      <div style={{ fontSize:26, fontWeight:800, marginBottom:4 }}>Admin Control Center</div>
      <div style={{ fontSize:13, color:T.text2, marginBottom:22 }}>Full system monitoring and audit</div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(160px,1fr))", gap:14, marginBottom:22 }}>
        <StatCard label="Total Users" value="2,847" delta="124 this month" deltaUp />
        <StatCard label="Loan Applications" value="1,243" delta="Rs. 12.4 Cr disbursed" color={T.accent} />
        <StatCard label="Welfare Recipients" value="893" delta="34 new this month" deltaUp color={T.accent3} />
        <StatCard label="Fraud Alerts" value="3" delta="2 under investigation" color={T.danger} />
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:18, marginBottom:18 }}>
        <Card>
          <SectionTitle icon="📊">Application Overview</SectionTitle>
          {[["Loans Approved","78%",T.accent,78],["Welfare Approved","84%",T.accent3,84],["Repayment Rate","91%",T.warning,91]].map(([l,v,c,pct]) => (
            <div key={l} style={{ marginBottom:16 }}>
              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
                <span style={{ fontSize:13, color:T.text2 }}>{l}</span>
                <span style={{ fontWeight:700, color:c }}>{v}</span>
              </div>
              <ProgressBar pct={pct} color={c} height={8} />
            </div>
          ))}
        </Card>
        <Card>
          <SectionTitle icon="🔴">Fraud Alerts</SectionTitle>
          <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
            {[
              { type:"danger", title:"Duplicate NIC Detected", desc:"User ID #1847 — NIC appears in 2 registrations" },
              { type:"warning", title:"Multiple Loan Applications", desc:"User ID #2234 — 3 loan apps in 7 days" },
              { type:"warning", title:"Income Inconsistency", desc:"User ID #956 — Stated income ≠ bank statements" },
            ].map((a, i) => (
              <Alert key={i} type={a.type}>
                <div style={{ flex:1 }}>
                  <div style={{ fontWeight:700, fontSize:12 }}>{a.title}</div>
                  <div style={{ fontSize:12, marginTop:2 }}>{a.desc}</div>
                </div>
              </Alert>
            ))}
          </div>
        </Card>
      </div>
      <Card>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:16 }}>
          <SectionTitle icon="⛓️" style={{ margin:0 }}>Blockchain Audit Log</SectionTitle>
          <span style={{ display:"flex", alignItems:"center", gap:6 }}><LiveDot /><span style={{ fontSize:12, color:T.text3 }}>Live</span></span>
        </div>
        <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
          {blocks.map((b, i) => (
            <div key={i} className="block-item" style={{ background:T.bg3, border:`1px solid ${T.cardB}`, borderRadius:10, padding:"12px 16px", display:"flex", alignItems:"center", gap:12, animationDelay:`${i*0.04}s` }}>
              <div style={{ width:34, height:34, borderRadius:9, background:b.color, display:"flex", alignItems:"center", justifyContent:"center", fontSize:16, flexShrink:0 }}>{b.icon}</div>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:13, fontWeight:600 }}>{b.type}</div>
                <div style={{ fontFamily:"'JetBrains Mono'", fontSize:11, color:T.text3 }}>{b.hash}</div>
              </div>
              <div style={{ textAlign:"right" }}>
                <div style={{ fontSize:13, fontWeight:600 }}>{b.amount}</div>
                <div style={{ fontSize:11, color:T.text3 }}>{b.time}</div>
              </div>
              <div style={{ width:7, height:7, borderRadius:"50%", background:T.accent }} />
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

// ADMIN REPORTS
const AdminReportsPage = () => (
  <div className="fade-up">
    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:22, flexWrap:"wrap", gap:12 }}>
      <div>
        <div style={{ fontSize:26, fontWeight:800 }}>Reports & Analytics</div>
        <div style={{ fontSize:13, color:T.text2, marginTop:4 }}>System performance and financial reports</div>
      </div>
      <Btn size="sm">📥 Export PDF</Btn>
    </div>
    <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:14, marginBottom:20 }}>
      <StatCard label="Total Disbursed" value="Rs. 12.4 Cr" delta="↑ 18% vs last quarter" deltaUp color={T.accent} />
      <StatCard label="Avg. Loan Amount" value="Rs. 1,24,000" delta="↑ Rs. 8,400 increase" deltaUp />
      <StatCard label="Default Rate" value="9.2%" delta="↓ 1.8% improvement" deltaUp color={T.success} />
    </div>
    <Card>
      <SectionTitle icon="📈">Monthly Loan Disbursements</SectionTitle>
      <div style={{ display:"flex", gap:10, alignItems:"flex-end", height:160, padding:"0 8px" }}>
        {[["Jul",55],["Aug",63],["Sep",71],["Oct",68],["Nov",75],["Dec",82],["Jan",70,true],["Feb",79,true],["Mar",88,true],["Apr",95,true]].map(([m,h,cur]) => (
          <div key={m} style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center" }}>
            <div style={{ width:"100%", height:`${h}%`, background:cur?T.accent:T.accent2, borderRadius:"4px 4px 0 0", opacity:cur?1:0.55 }} />
            <div style={{ fontSize:10, color:T.text3, marginTop:4 }}>{m}</div>
          </div>
        ))}
      </div>
    </Card>
  </div>
);

// ── REGISTRATION MODAL ────────────────────────────────────────────────────────
const REG_STEPS = [
  { title:"Personal Details", content: () => (
    <div><FormRow><FormInput label="Full Name" placeholder="Aravinda Kumara" /><FormInput label="Date of Birth" type="date" /></FormRow>
    <FormRow><FormInput label="NIC Number" placeholder="912345678V" /><FormInput label="Mobile Number" placeholder="+94 71 234 5678" /></FormRow>
    <FormInput label="Email Address" type="email" placeholder="aravinda@email.com" /></div>
  )},
  { title:"Address & GN Division", content: () => (
    <div><FormInput label="Home Address" placeholder="45/A, Jayawickrama Road" />
    <FormRow><FormInput label="City" placeholder="Gampaha" /><FormSelect label="District"><option>Gampaha</option><option>Colombo</option><option>Kandy</option></FormSelect></FormRow>
    <FormInput label="GN Division" placeholder="Minuwangoda North" /></div>
  )},
  { title:"Family & Income", content: () => (
    <div><FormRow><FormInput label="Family Size" type="number" placeholder="4" /><FormInput label="No. of Dependents" type="number" placeholder="2" /></FormRow>
    <FormRow><FormInput label="Monthly Income (Rs.)" type="number" placeholder="32000" /><FormInput label="Monthly Expenses (Rs.)" type="number" placeholder="18000" /></FormRow>
    <FormSelect label="Employment Type"><option>Farmer</option><option>Employed (private)</option><option>Self-employed</option><option>Government employee</option></FormSelect></div>
  )},
  { title:"Bank & Wallet", content: () => (
    <div><FormSelect label="Bank Name"><option>Sampath Bank</option><option>Bank of Ceylon</option><option>HNB</option><option>People's Bank</option></FormSelect>
    <FormRow><FormInput label="Account Number" placeholder="000123456789" /><FormInput label="Branch" placeholder="Gampaha" /></FormRow>
    <Alert type="info">A SmartGrama digital wallet will be created automatically and linked to your bank account.</Alert></div>
  )},
  { title:"Review & Submit", content: () => (
    <div>
      <Alert type="success">All required information collected. Your Digital ID and Wallet will be created immediately upon registration.</Alert>
      <InfoPanel style={{ marginTop:14 }}>
        <InfoRow label="Digital ID" value={<span style={{ fontFamily:"'JetBrains Mono'", color:T.accent }}>DID-2025-XXXXXX</span>} />
        <InfoRow label="Wallet ID" value={<span style={{ fontFamily:"'JetBrains Mono'" }}>SG-WLT-XXXXXX</span>} />
        <InfoRow label="Blockchain Entry" value={<Badge type="green">Will be created</Badge>} />
      </InfoPanel>
      <div style={{ display:"flex", alignItems:"flex-start", gap:10, marginTop:16 }}>
        <input type="checkbox" style={{ marginTop:3, accentColor:T.accent }} />
        <span style={{ fontSize:13, color:T.text2 }}>I confirm all information is accurate and consent to SmartGrama processing my data as per the Data Protection Act.</span>
      </div>
    </div>
  )},
];

const RegModal = ({ onClose, showToast }) => {
  const [step, setStep] = useState(0);
  const StepContent = REG_STEPS[step].content;
  return (
    <Modal title="Create Your SmartGrama Account" onClose={onClose} maxWidth={600}>
      <Steps total={REG_STEPS.length} current={step} />
      <div style={{ fontSize:15, fontWeight:700, marginBottom:18 }}>{REG_STEPS[step].title}</div>
      <StepContent />
      <div style={{ display:"flex", gap:10, justifyContent:"flex-end", marginTop:22 }}>
        {step > 0 && <Btn variant="secondary" onClick={() => setStep(s => s-1)}>← Back</Btn>}
        <Btn onClick={() => {
          if (step < REG_STEPS.length-1) { setStep(s => s+1); }
          else { onClose(); showToast("✓ Account created! Digital ID & Wallet activated on blockchain.", "success"); }
        }}>
          {step === REG_STEPS.length-1 ? "✓ Register Now" : "Continue →"}
        </Btn>
      </div>
    </Modal>
  );
};

// ── NAV CONFIG ────────────────────────────────────────────────────────────────
const NAV = {
  resident: [
    { section:"Main" },
    { id:"dashboard", label:"Dashboard", icon:"🏠" },
    { id:"wallet", label:"My Wallet", icon:"💼" },
    { id:"profile", label:"My Profile", icon:"👤" },
    { section:"Applications" },
    { id:"loan-info", label:"Apply for Loan", icon:"🏦" },
    { id:"welfare-info", label:"Apply for Welfare", icon:"🤝" },
    { id:"status", label:"App. Status", icon:"📋", badge:2 },
    { section:"Support" },
    { id:"chatbot", label:"AI Assistant", icon:"🤖" },
  ],
  officer: [
    { section:"Officer Portal" },
    { id:"officer-dash", label:"Dashboard", icon:"📊" },
    { id:"officer-review", label:"Review Application", icon:"🔍" },
    { section:"Tools" },
    { id:"profile", label:"User Lookup", icon:"👤" },
    { id:"status", label:"Application Tracker", icon:"📋" },
  ],
  admin: [
    { section:"Admin Portal" },
    { id:"admin-dash", label:"Control Center", icon:"🖥️" },
    { id:"admin-reports", label:"Reports & Analytics", icon:"📈" },
    { section:"Oversight" },
    { id:"officer-dash", label:"Officer Panel", icon:"👮" },
    { id:"status", label:"Audit Log", icon:"⛓️" },
  ],
};

const ROLE_DEFAULTS = { resident:"dashboard", officer:"officer-dash", admin:"admin-dash" };

// ── SPLASH ────────────────────────────────────────────────────────────────────
const Splash = () => (
  <div style={{ position:"fixed", inset:0, background:T.bg, zIndex:9999, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:22, textAlign:"center", animation:"fadeIn 0.3s ease" }}>
    <div style={{ width:80, height:80, borderRadius:22, background:`linear-gradient(135deg,${T.accent},${T.accent2})`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:30, fontWeight:900, color:"#000", animation:"splashGrow 0.8s cubic-bezier(0.22,1,0.36,1)" }}>SG</div>
    <div>
      <div style={{ fontSize:40, fontWeight:900, letterSpacing:"-1.5px", background:`linear-gradient(90deg,${T.accent},${T.accent2})`, WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>SmartGrama</div>
      <div style={{ fontSize:14, color:T.text3, marginTop:8, maxWidth:320, lineHeight:1.6 }}>Decentralized Village Financial Platform — AI-powered microfinance & welfare management</div>
    </div>
    <div style={{ width:220, height:3, background:"rgba(255,255,255,0.07)", borderRadius:2, overflow:"hidden" }}>
      <div style={{ height:"100%", background:`linear-gradient(90deg,${T.accent},${T.accent2})`, animation:"loadBar 1.8s ease-in-out forwards", borderRadius:2 }} />
    </div>
    <div style={{ fontSize:12, color:T.text3, fontFamily:"'JetBrains Mono'" }}>Connecting to dApp network...</div>
  </div>
);

// ── MAIN APP ──────────────────────────────────────────────────────────────────
export default function SmartGrama() {
  const [splash, setSplash] = useState(true);
  const [role, setRole] = useState("resident");
  const [page, setPage] = useState("dashboard");
  const [showReg, setShowReg] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => { const t = setTimeout(() => setSplash(false), 2000); return () => clearTimeout(t); }, []);

  const showToast = useCallback((msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4200);
  }, []);

  const switchRole = (r) => { setRole(r); setPage(ROLE_DEFAULTS[r]); };
  const showPage = (p) => setPage(p);

  const pageLabel = (p) => {
    const allItems = [...NAV.resident, ...NAV.officer, ...NAV.admin].filter(i => i.id);
    return allItems.find(i => i.id === p)?.label || p.replace(/-/g," ").replace(/\b\w/g,c=>c.toUpperCase());
  };

  const renderPage = () => {
    const props = { showPage, showToast };
    const pages = {
      "dashboard": <DashboardPage {...props} />,
      "loan-info": <LoanInfoPage {...props} />,
      "loan-apply": <LoanApplyPage {...props} />,
      "wallet": <WalletPage />,
      "welfare-info": <WelfareInfoPage {...props} />,
      "welfare-apply": <WelfareApplyPage {...props} />,
      "profile": <ProfilePage />,
      "status": <StatusPage />,
      "chatbot": <ChatbotPage />,
      "officer-dash": <OfficerDashPage {...props} />,
      "officer-review": <OfficerReviewPage {...props} />,
      "admin-dash": <AdminDashPage />,
      "admin-reports": <AdminReportsPage />,
    };
    return pages[page] || <DashboardPage {...props} />;
  };

  return (
    <>
      <style>{globalCSS}</style>
      {splash && <Splash />}
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
      {showReg && <RegModal onClose={() => setShowReg(false)} showToast={showToast} />}

      {/* Background orbs */}
      <div style={{ position:"fixed", inset:0, zIndex:0, overflow:"hidden", pointerEvents:"none" }}>
        <div style={{ position:"absolute", width:500, height:500, borderRadius:"50%", background:T.accent2, filter:"blur(90px)", opacity:0.07, top:-120, left:-120, animation:"orbFloat1 14s ease-in-out infinite" }} />
        <div style={{ position:"absolute", width:400, height:400, borderRadius:"50%", background:T.accent, filter:"blur(90px)", opacity:0.06, bottom:80, right:40, animation:"orbFloat2 18s ease-in-out infinite" }} />
        <div style={{ position:"absolute", width:300, height:300, borderRadius:"50%", background:T.accent3, filter:"blur(80px)", opacity:0.07, top:"45%", left:"45%", animation:"orbFloat3 22s ease-in-out infinite" }} />
      </div>

      <div style={{ display:"flex", minHeight:"100vh", position:"relative", zIndex:1 }}>
        {/* SIDEBAR */}
        <aside style={{ width:240, minHeight:"100vh", background:"rgba(7,9,15,0.92)", borderRight:`1px solid ${T.cardB}`, backdropFilter:"blur(24px)", display:"flex", flexDirection:"column", position:"fixed", left:0, top:0, bottom:0, zIndex:100 }}>
          {/* Logo */}
          <div style={{ padding:"22px 20px 16px", display:"flex", alignItems:"center", gap:10, borderBottom:`1px solid ${T.cardB}` }}>
            <div style={{ width:36, height:36, borderRadius:10, background:`linear-gradient(135deg,${T.accent},${T.accent2})`, display:"flex", alignItems:"center", justifyContent:"center", fontWeight:900, fontSize:14, color:"#000", flexShrink:0 }}>SG</div>
            <div>
              <div style={{ fontSize:16, fontWeight:800 }}>SmartGrama</div>
              <div style={{ fontSize:10, color:T.text3, fontFamily:"'JetBrains Mono'", letterSpacing:"0.04em" }}>dApp v1.0</div>
            </div>
          </div>

          {/* Role switcher */}
          <div style={{ margin:"14px 12px", background:T.bg3, borderRadius:10, padding:4, display:"flex", gap:2 }}>
            {["resident","officer","admin"].map(r => (
              <button key={r} onClick={() => switchRole(r)} style={{ flex:1, padding:"7px 4px", border:"none", borderRadius:8, fontSize:11, fontFamily:"'Outfit'", fontWeight:700, cursor:"pointer", transition:"all 0.2s", background:role===r?T.accent:"transparent", color:role===r?"#000":T.text3, textTransform:"capitalize" }}>
                {r}
              </button>
            ))}
          </div>

          {/* Nav */}
          <nav style={{ flex:1, overflowY:"auto", padding:"6px 0" }}>
            {NAV[role].map((item, i) => item.section ? (
              <div key={i} style={{ padding:"10px 16px 5px", fontSize:10, color:T.text3, letterSpacing:"0.09em", textTransform:"uppercase", fontWeight:700 }}>{item.section}</div>
            ) : (
              <div key={item.id} className="nav-item" onClick={() => showPage(item.id)} style={{ display:"flex", alignItems:"center", gap:10, padding:"9px 16px", cursor:"pointer", fontSize:13, color:page===item.id?T.accent:T.text2, background:page===item.id?"rgba(0,229,176,0.07)":"transparent", borderLeft:`2px solid ${page===item.id?T.accent:"transparent"}`, transition:"all 0.15s" }}>
                <span style={{ fontSize:15, width:18, textAlign:"center" }}>{item.icon}</span>
                <span style={{ flex:1 }}>{item.label}</span>
                {item.badge && <span style={{ background:T.accent, color:"#000", fontSize:10, fontWeight:700, padding:"2px 6px", borderRadius:10 }}>{item.badge}</span>}
              </div>
            ))}
          </nav>

          {/* User */}
          <div style={{ padding:"14px 16px", borderTop:`1px solid ${T.cardB}`, display:"flex", alignItems:"center", gap:10 }}>
            <div style={{ width:34, height:34, borderRadius:"50%", background:"linear-gradient(135deg,#a78bfa,#3b82f6)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:12, fontWeight:700, color:"#fff", flexShrink:0 }}>AK</div>
            <div>
              <div style={{ fontSize:13, fontWeight:600 }}>Aravinda K.</div>
              <div style={{ fontSize:10, color:T.text3, fontFamily:"'JetBrains Mono'" }}>did:sg:0x7f3a...b2e1</div>
            </div>
          </div>
        </aside>

        {/* MAIN */}
        <main style={{ marginLeft:240, flex:1, minHeight:"100vh" }}>
          {/* Topbar */}
          <div style={{ padding:"14px 36px", display:"flex", alignItems:"center", gap:14, borderBottom:`1px solid ${T.cardB}`, background:"rgba(7,9,15,0.7)", backdropFilter:"blur(12px)", position:"sticky", top:0, zIndex:50, flexWrap:"wrap" }}>
            <div style={{ fontSize:15, fontWeight:700 }}>{pageLabel(page)}</div>
            <div style={{ flex:1 }} />
            <div style={{ display:"flex", alignItems:"center", gap:6, padding:"6px 14px", background:T.bg3, border:`1px solid ${T.cardB}`, borderRadius:20, fontSize:12, color:T.text2 }}>
              <LiveDot /><span>Blockchain: Connected</span>
            </div>
            <Btn variant="secondary" size="sm" onClick={() => setShowReg(true)}>+ Register</Btn>
          </div>

          {/* Page content */}
          <div style={{ padding:"30px 36px 60px" }} key={page}>
            {renderPage()}
          </div>
        </main>
      </div>
    </>
  );
}
