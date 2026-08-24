import { useNavigate, useLocation } from "react-router-dom";

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { path: "/", icon: "fa-border-all", label: "Dashboard" },
    { path: "/wallet", icon: "fa-wallet", label: "My Wallet" },
    { path: "/loan-programs", icon: "fa-chart-line", label: "Apply Loan" },
    { path: "/welfare", icon: "fa-gift", label: "Apply Welfare" },
    { path: "/profile", icon: "fa-user", label: "My Profile" },
    { path: "/ai-chat", icon: "fa-comment-dots", label: "AI Assistant" },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-brand" onClick={() => navigate("/")} style={{ cursor: "pointer" }}>
        <div style={{ backgroundColor: 'var(--primary)', width: '32px', height: '32px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <i className="fa-solid fa-house" style={{ color: 'white', fontSize: '14px' }}></i>
        </div>
        <div>
          <h1 className="brand-title" style={{ fontSize: "16px", fontWeight: "700", color: "var(--text-primary)" }}>SmartGrama</h1>
          <span className="brand-subtitle" style={{ fontSize: "10px", color: "var(--text-secondary)", fontWeight: "600", letterSpacing: "0.5px" }}>RESIDENT PORTAL</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        {navItems.map((item) => (
          <button
            key={item.path}
            className={`nav-item ${location.pathname === item.path ? "active" : ""}`}
            onClick={() => navigate(item.path)}
          >
            <i className={`fa-solid ${item.icon}`}></i>
            <span>{item.label}</span>
          </button>
        ))}

        <div style={{ marginTop: "auto", paddingBottom: "16px" }}>
          <div style={{ padding: '12px', display: 'flex', alignItems: 'center', gap: '12px', backgroundColor: 'var(--background)', borderRadius: '8px', cursor: 'pointer' }} onClick={() => navigate("/profile")}>
            <div style={{ width: '32px', height: '32px', backgroundColor: 'var(--accent)', color: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 'bold' }}>
              NP
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)' }}>Nimal Perera</span>
              <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>NIC: 198723456789</span>
            </div>
          </div>
        </div>
      </nav>
    </aside>
  );
}
