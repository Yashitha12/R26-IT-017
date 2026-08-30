import { useNavigate } from "react-router-dom";
import { getCurrentUser, getInitials } from "../utils/user";
import { useTranslation } from "react-i18next";

export default function Header() {
  const navigate = useNavigate();
  const user = getCurrentUser();
  const { t, i18n } = useTranslation();

  const displayName = user?.name || "Member";
  const division = user?.district || user?.address || t("gn_resident");

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };

  return (
    <header className="top-header">
      <div className="flex" style={{ flexDirection: "column" }}>
        <h2 className="font-bold text-xl" style={{ color: "var(--text-primary)" }}>
          {t("welcome_back", { name: displayName })}
        </h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px', flexWrap: 'wrap' }}>
          <span style={{ color: "var(--text-secondary)", fontSize: "13px" }}>
            {division} &nbsp;&middot;&nbsp; {t("gn_resident")}
          </span>
          {user?.did && (
            <span style={{ background: '#dcfce7', color: '#166534', border: '1px solid #86efac', borderRadius: '12px', padding: '2px 8px', fontSize: '11px', fontWeight: 'bold', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              <i className="fa-solid fa-shield-check"></i>
              {user.did}
            </span>
          )}
        </div>
      </div>

      <div className="header-actions" style={{ display: "flex", alignItems: "center", gap: "16px" }}>
        {/* Language Switcher */}
        <div style={{ display: "flex", background: "#f1f5f9", borderRadius: "8px", overflow: "hidden", border: "1px solid #cbd5e1" }}>
          <button
            onClick={() => changeLanguage("en")}
            style={{ padding: "6px 12px", border: "none", fontSize: "13px", fontWeight: i18n.language === "en" ? "bold" : "normal", background: i18n.language === "en" ? "var(--primary)" : "transparent", color: i18n.language === "en" ? "white" : "var(--text-secondary)", cursor: "pointer" }}
          >
            EN
          </button>
          <button
            onClick={() => changeLanguage("si")}
            style={{ padding: "6px 12px", border: "none", fontSize: "13px", fontWeight: i18n.language === "si" ? "bold" : "normal", background: i18n.language === "si" ? "var(--primary)" : "transparent", color: i18n.language === "si" ? "white" : "var(--text-secondary)", cursor: "pointer" }}
          >
            සිං
          </button>
        </div>

        <button
          style={{
            position: "relative",
            background: "none",
            border: "none",
            cursor: "pointer",
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
          <div className="avatar-sm" style={{ overflow: "hidden" }}>
            {user?.photo ? <img src={user.photo} alt="Profile" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : getInitials(displayName)}
          </div>
        </button>
      </div>
    </header>
  );
}