import { useNavigate, useLocation } from "react-router-dom";
import { getCurrentUser, getInitials } from "../utils/user";

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = getCurrentUser();

  const displayName = user?.name || "Aravinda Kumara";
  const nicNumber = user?.nic || "200223003053";
  const initials = getInitials(displayName);

  const navItems = [
    { path: "/dashboard", icon: "fa-border-all", label: "Dashboard" },
    { path: "/wallet", icon: "fa-wallet", label: "My Wallet" },
    { path: "/loan-programs", icon: "fa-chart-line", label: "Apply Loan" },
    { path: "/welfare", icon: "fa-gift", label: "Apply Welfare" },
    { path: "/profile", icon: "fa-user", label: "My Profile" },
    { path: "/ai-chat", icon: "fa-comment-dots", label: "AI Assistant" },
  ];

  const isCurrent = (path) => {
    if (path === "/dashboard" && (location.pathname === "/" || location.pathname === "/dashboard")) return true;
    return location.pathname === path;
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-brand" onClick={() => navigate("/dashboard")} style={{ cursor: "pointer" }}>
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
            className={`nav-item ${isCurrent(item.path) ? "active" : ""}`}
            onClick={() => navigate(item.path)}
          >
            <i className={`fa-solid ${item.icon}`}></i>
            <span>{item.label}</span>
          </button>
        ))}

        <div style={{ marginTop: "auto", paddingBottom: "16px", display: "flex", flexDirection: "column", gap: "8px" }}>
          <div style={{ padding: '12px', display: 'flex', alignItems: 'center', gap: '12px', backgroundColor: 'var(--background)', borderRadius: '8px', cursor: 'pointer' }} onClick={() => navigate("/profile")}>
            <div style={{ width: '32px', height: '32px', backgroundColor: 'var(--primary)', color: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 'bold' }}>
              {initials}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)' }}>{displayName}</span>
              <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>NIC: {nicNumber}</span>
            </div>
          </div>
          
          <button 
            style={{ width: '100%', padding: '10px', backgroundColor: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
            onClick={() => {
              localStorage.removeItem("user");
              navigate("/login");
            }}
          >
            <i className="fa-solid fa-arrow-right-from-bracket"></i>
            Logout
          </button>
        </div>
      </nav>
    </aside>
  );
}
