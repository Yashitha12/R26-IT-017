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
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px', flexWrap: 'wrap' }}>
          <span style={{ color: "var(--text-secondary)", fontSize: "13px" }}>
            {division} &nbsp;&middot;&nbsp; GN Resident
          </span>
          {user?.did && (
            <span style={{ background: '#dcfce7', color: '#166534', border: '1px solid #86efac', borderRadius: '12px', padding: '2px 8px', fontSize: '11px', fontWeight: 'bold', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              <i className="fa-solid fa-shield-check"></i>
              {user.did}
            </span>
          )}
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