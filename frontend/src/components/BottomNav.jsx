import { useNavigate, useLocation } from "react-router-dom";

export default function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const path = location.pathname;

  const navItems = [
    {
      id: "home",
      label: "Home",
      path: "/",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
          <polyline points="9 22 9 12 15 12 15 22"></polyline>
        </svg>
      ),
    },
    {
      id: "wallet",
      label: "Wallet",
      path: "/wallet",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M20 12V8H6a2 2 0 0 1-2-2c0-1.1.9-2 2-2h12v4"></path>
          <path d="M4 6v12c0 1.1.9 2 2 2h14v-4"></path>
          <path d="M18 12a2 2 0 0 0-2 2c0 1.1.9 2 2 2h4v-4h-4z"></path>
        </svg>
      ),
    },
    {
      id: "status",
      label: "Status",
      path: "/status",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10"></circle>
          <polyline points="12 6 12 12 16 14"></polyline>
        </svg>
      ),
    },
    {
      id: "profile",
      label: "Profile",
      path: "/profile",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
          <circle cx="12" cy="7" r="4"></circle>
        </svg>
      ),
    },
    {
      id: "chat",
      label: "AI Chat",
      path: "/ai-chat",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="11" width="18" height="10" rx="2"></rect>
          <circle cx="12" cy="5" r="2"></circle>
          <path d="M12 7v4"></path>
          <line x1="8" y1="16" x2="8.01" y2="16"></line>
          <line x1="16" y1="16" x2="16.01" y2="16"></line>
        </svg>
      ),
    },
  ];

  return (
    <nav className="smartgrama-bottom-nav">
      {navItems.map((item) => {
        const isActive =
          path === item.path ||
          (item.path === "/" &&
            (path === "/" ||
              path === "/loan-programs" ||
              path === "/loan-application" ||
              path === "/loan-result" ||
              path === "/apply-welfare"));

        return (
          <button
            key={item.id}
            className={`nav-tab ${isActive ? "active" : ""}`}
            onClick={() => navigate(item.path)}
          >
            <div className="nav-icon">{item.icon}</div>
            <span className="nav-label">{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
