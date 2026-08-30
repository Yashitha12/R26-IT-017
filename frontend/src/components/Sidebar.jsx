import { useNavigate, useLocation } from "react-router-dom";
import { getCurrentUser, getInitials } from "../utils/user";
import { useTranslation } from "react-i18next";

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = getCurrentUser();
  const { t } = useTranslation();

  const displayName = user?.name || "Aravinda Kumara";
  const nicNumber = user?.nic || "200223003053";
  const initials = getInitials(displayName);

  const navItems = [
    { path: "/dashboard", icon: "fa-border-all", label: t("dashboard") },
    { path: "/wallet", icon: "fa-wallet", label: t("my_wallet") },
    { path: "/loan-programs", icon: "fa-chart-line", label: t("apply_loan") },
    { path: "/welfare", icon: "fa-gift", label: t("apply_welfare") },
    { path: "/profile", icon: "fa-user", label: t("my_profile") },
    { path: "/ai-chat", icon: "fa-comment-dots", label: t("ai_assistant") },
  ];

  const isCurrent = (path) => {
    if (path === "/dashboard" && (location.pathname === "/" || location.pathname === "/dashboard")) return true;
    return location.pathname === path;
  };

  return (
    <aside className="sidebar theme-sidebar">
      <div className="sidebar-brand" onClick={() => navigate("/dashboard")} style={{ cursor: "pointer" }}>
        <div style={{ backgroundColor: 'var(--primary)', width: '32px', height: '32px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <i className="fa-solid fa-house" style={{ color: 'white', fontSize: '14px' }}></i>
        </div>
        <div>
          <h1 className="brand-title" style={{ fontSize: "16px", fontWeight: "700", color: "var(--text-primary)" }}>{t("smartgrama")}</h1>
          <span className="brand-subtitle" style={{ fontSize: "10px", color: "var(--text-secondary)", fontWeight: "600", letterSpacing: "0.5px" }}>{t("resident_portal")}</span>
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
          <div className="profile-widget" style={{ padding: '12px', display: 'flex', alignItems: 'center', gap: '12px', borderRadius: '8px', cursor: 'pointer' }} onClick={() => navigate("/profile")}>
            <div style={{ width: '32px', height: '32px', backgroundColor: 'var(--primary)', color: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 'bold', overflow: 'hidden' }}>
              {user?.photo ? <img src={user.photo} alt="Profile" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : initials}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '13px', fontWeight: '600' }}>{displayName}</span>
              <span style={{ fontSize: '11px', opacity: 0.7 }}>{t("nic")}: {nicNumber}</span>
            </div>
          </div>
          
          <button 
            style={{ width: '100%', padding: '10px', backgroundColor: 'rgba(220, 38, 38, 0.1)', color: '#ef4444', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
            onClick={() => {
              localStorage.removeItem("user");
              navigate("/login");
            }}
          >
            <i className="fa-solid fa-arrow-right-from-bracket"></i>
            {t("logout")}
          </button>
        </div>
      </nav>
    </aside>
  );
}
