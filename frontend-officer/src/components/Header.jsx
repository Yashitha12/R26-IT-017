import { useNavigate } from "react-router-dom";

export default function Header({ title = "Officer Dashboard" }) {
  const navigate = useNavigate();

  return (
    <header className="top-header" style={{ padding: '24px 32px', background: 'white', borderBottom: '1px solid var(--border)' }}>
      <div className="flex" style={{ flexDirection: 'column' }}>
        <h2 className="font-bold text-xl" style={{ color: 'var(--text-primary)' }}>{title}</h2>
        <div style={{ color: 'var(--text-secondary)', fontSize: '13px', marginTop: '4px' }}>
          SmartGrama Administration &middot; Microfinance Officer
        </div>
      </div>

      <div className="header-actions" style={{ display: 'flex', alignItems: 'center' }}>
        <button style={{ position: 'relative', background: 'none', border: 'none', cursor: 'pointer', marginRight: '16px' }}>
          <i className="fa-regular fa-bell" style={{ fontSize: '20px', color: 'var(--text-secondary)' }}></i>
          <span style={{ position: 'absolute', top: 0, right: 0, width: '8px', height: '8px', backgroundColor: 'var(--danger)', borderRadius: '50%' }}></span>
        </button>
        <button className="user-profile-btn">
          <div className="avatar-sm" style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#1e40af', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>OFF</div>
        </button>
      </div>
    </header>
  );
}