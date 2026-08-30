import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import { getCurrentUser, getInitials } from "../utils/user";
import dashboardBg from "../assets/smartgrama_dashboard_bg.jpg";

/* ─── Inline SVG icons consistent with Home.jsx ─── */
const Ico = {
  shield: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10"/></svg>,
  nic: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>,
  location: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>,
  check: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>,
  user: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  calendar: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
  phone: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>,
  mail: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>,
  gender: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="9"/><path d="M12 3v18"/></svg>,
  job: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>,
};

export default function Profile() {
  const navigate = useNavigate();
  const user = getCurrentUser();

  if (!user) {
    navigate("/login");
    return null;
  }

  const name      = user?.name     || "Member";
  const nic       = user?.nic      || "—";
  const memberId  = user?.memberId || "—";
  const mobile    = user?.mobile   || "—";
  const email     = user?.email    || "—";
  const address   = user?.address  || "—";
  const division  = user?.gnDivision || user?.district || "GN Division";
  const district  = user?.district || "Sri Lanka";
  const occupation= user?.occupation || "—";
  const dob       = user?.dob      || "—";
  const gender    = user?.gender   || "—";
  const did       = user?.did      || "did:sg:proto:001";
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
      {/* Frosted subtle overlay */}
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
          
          <div style={{
            display: "grid",
            gridTemplateColumns: "1.1fr 0.9fr",
            gap: 22,
          }}>
            {/* ═══════════════════════════════════════════════════
                CITIZEN IDENTITY CARD (Left)
            ═══════════════════════════════════════════════════ */}
            <div style={{
              borderRadius: 24,
              overflow: "hidden",
              boxShadow: "0 20px 50px rgba(4, 20, 55, 0.18)",
              border: "1px solid rgba(255, 255, 255, 0.4)",
              background: "linear-gradient(140deg, #0c1445 0%, #064e3b 100%)",
              padding: "36px 40px",
              display: "flex",
              flexDirection: "column",
              gap: 0,
              position: "relative",
              height: "100%",
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
                <div style={{ display:"flex", alignItems:"flex-start", gap:10 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:6, color:"rgba(255,255,255,0.55)", fontSize:12, minWidth:70, marginTop:2 }}>{Ico.user} MEM ID</div>
                  <div style={{ fontFamily:"monospace", fontSize:13, color:"#fff", fontWeight: 700 }}>{memberId}</div>
                </div>
              </div>

              {/* Verification badge */}
              <div style={{ marginTop:28 }}>
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
              
              <div style={{ flex: 1 }}></div>

              {/* Logout Button */}
              <button
                onClick={() => {
                  localStorage.removeItem("user");
                  navigate("/login");
                }}
                style={{
                  marginTop: "32px",
                  padding: "10px 20px",
                  borderRadius: 50,
                  background: "rgba(255,255,255,0.1)",
                  border: "1px solid rgba(255,255,255,0.2)",
                  color: "#fff",
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  alignSelf: "flex-start",
                  transition: "background 0.2s"
                }}
                onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.15)"}
                onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.1)"}
              >
                Sign Out
              </button>

              {/* Watermark text */}
              <div style={{ position:"absolute", bottom:16, right:20, fontSize:10, fontWeight:700, color:"rgba(255,255,255,0.15)", textTransform:"uppercase", letterSpacing:2 }}>
                SmartGrama · Profile
              </div>
            </div>

            {/* ═══════════════════════════════════════════════════
                PERSONAL INFO CARDS (Right)
            ═══════════════════════════════════════════════════ */}
            <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
              
              {/* Details Card */}
              <div style={{
                background:"rgba(255, 255, 255, 0.92)",
                backdropFilter:"blur(12px)",
                borderRadius:22,
                border:"1.5px solid rgba(255, 255, 255, 0.9)",
                overflow:"hidden",
                boxShadow:"0 8px 24px rgba(0,0,0,0.04)",
                padding: "24px 28px",
              }}>
                <div style={{ fontSize:15, fontWeight:800, color:"#0f172a", marginBottom:20 }}>Personal Details</div>
                
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                  <InfoItem icon={Ico.calendar} label="Date of Birth" value={dob} />
                  <InfoItem icon={Ico.gender} label="Gender" value={gender} />
                  <InfoItem icon={Ico.phone} label="Mobile Number" value={mobile} />
                  <InfoItem icon={Ico.mail} label="Email Address" value={email} />
                  <InfoItem icon={Ico.location} label="Address" value={address} full />
                </div>
              </div>

              {/* Employment Card */}
              <div style={{
                background:"rgba(255, 255, 255, 0.92)",
                backdropFilter:"blur(12px)",
                borderRadius:22,
                border:"1.5px solid rgba(255, 255, 255, 0.9)",
                overflow:"hidden",
                boxShadow:"0 8px 24px rgba(0,0,0,0.04)",
                padding: "24px 28px",
              }}>
                <div style={{ fontSize:15, fontWeight:800, color:"#0f172a", marginBottom:20 }}>Employment & Socio-Economic</div>
                
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                  <InfoItem icon={Ico.job} label="Primary Occupation" value={occupation} />
                  <InfoItem icon={Ico.shield} label="Banking Status" value={"Active (Samurdhi/Samupakara)"} />
                </div>
              </div>

            </div>

          </div>
        </main>
      </div>
    </div>
  );
}

function InfoItem({ icon, label, value, full }) {
  return (
    <div style={{
      gridColumn: full ? "1 / -1" : undefined,
      display: "flex",
      alignItems: "flex-start",
      gap: 12,
      background: "#ffffff",
      padding: "12px 14px",
      borderRadius: 16,
      border: "1px solid rgba(226,232,240,0.8)",
      boxShadow: "0 2px 8px rgba(0,0,0,0.02)"
    }}>
      <div style={{ color: "#64748b", marginTop: 2 }}>
        {icon}
      </div>
      <div>
        <div style={{ fontSize: 11, color: "#94a3b8", fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 2 }}>{label}</div>
        <div style={{ fontSize: 14, fontWeight: 700, color: "#0f172a" }}>{value}</div>
      </div>
    </div>
  );
}