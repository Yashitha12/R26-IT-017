import { useNavigate } from "react-router-dom";
import { getCurrentUser, getInitials } from "../utils/user";

export default function Header() {
  const navigate = useNavigate();
  const user = getCurrentUser();

  const displayName = user?.name || "Member";
  const division = user?.district || user?.address || "GN Resident";

  return (
    <header className="top-header">
      <div className="flex" style={{ flexDirection: "column" }}>
        <h2 className="font-bold text-xl" style={{ color: "var(--text-primary)" }}>
          Welcome back, {displayName}
        </h2>
        <div style={{ color: "var(--text-secondary)", fontSize: "13px", marginTop: "4px" }}>
          {division} &nbsp;&middot;&nbsp; GN Resident
        </div>
      </div>

      <div className="header-actions">
        <button
          style={{
            position: "relative",
            background: "none",
            border: "none",
            cursor: "pointer",
            marginRight: "16px",
          }}
        >
          <i className="fa-regular fa-bell" style={{ fontSize: "20px", color: "var(--text-secondary)" }}></i>
          <span
            style={{
              position: "absolute",
              top: 0,
              right: 0,
              width: "8px",
              height: "8px",
              backgroundColor: "var(--danger)",
              borderRadius: "50%",
            }}
          ></span>
        </button>
        <button className="user-profile-btn" onClick={() => navigate("/profile")}>
          <div className="avatar-sm">{getInitials(displayName)}</div>
        </button>
      </div>
    </header>
  );
}