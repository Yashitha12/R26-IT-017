import { NavLink } from "react-router-dom";

export default function Sidebar({ officerData }) {
  const responsibilities = officerData?.responsibilities || [];
  const isSuperadmin = officerData?.username === "superadmin";

  const hasAccess = (resId) => isSuperadmin || responsibilities.includes(resId);

  const navClass = ({ isActive }) => `nav-item ${isActive ? "active" : ""}`;

  return (
    <aside className="theme-sidebar" style={{ 
      width: '280px', 
      height: '100vh', 
      position: 'fixed', 
      top: 0, 
      left: 0, 
      display: 'flex', 
      flexDirection: 'column' 
    }}>
      {/* Brand Header */}
      <div style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{ width: '40px', height: '40px', backgroundColor: 'rgba(255, 255, 255, 0.1)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '20px' }}>
          <i className="fa-solid fa-building-columns"></i>
        </div>
        <div>
          <h1 className="brand-title" style={{ fontSize: '18px', fontWeight: 'bold', margin: 0 }}>SmartGrama</h1>
          <p className="brand-subtitle" style={{ fontSize: '12px', margin: 0, opacity: 0.8 }}>Officer Portal</p>
        </div>
      </div>

      {/* Navigation */}
      <nav style={{ padding: '24px 16px', flex: 1, overflowY: 'auto' }}>
        
        {isSuperadmin && (
          <>
            <div style={{ fontSize: '12px', fontWeight: 'bold', color: 'rgba(255, 255, 255, 0.5)', textTransform: 'uppercase', marginBottom: '16px', paddingLeft: '16px' }}>System Admin</div>
            <NavLink to="/officers" className={navClass}>
              <i className="fa-solid fa-users-gear" style={{ width: '20px', textAlign: 'center' }}></i>
              Manage Officers
            </NavLink>
            <div style={{ height: '24px' }}></div>
          </>
        )}

        {/* We only show Main Menu header if they have at least one loan responsibility */}
        {(hasAccess("samupakara_loans") || hasAccess("samurdhi_loans")) && (
          <div style={{ fontSize: '12px', fontWeight: 'bold', color: 'rgba(255, 255, 255, 0.5)', textTransform: 'uppercase', marginBottom: '16px', paddingLeft: '16px' }}>Main Menu</div>
        )}
        
        {(hasAccess("samupakara_loans") || hasAccess("samurdhi_loans")) && (
          <NavLink to="/" className={navClass}>
            <i className="fa-solid fa-clipboard-list" style={{ width: '20px', textAlign: 'center' }}></i>
            Loan Approvals
          </NavLink>
        )}
        
        {isSuperadmin && (
          <NavLink to="/manage" className={navClass}>
            <i className="fa-solid fa-money-check-dollar" style={{ width: '20px', textAlign: 'center' }}></i>
            Bank & Loan Setup
          </NavLink>
        )}

        {(hasAccess("welfare_checking") || hasAccess("kyc_checking")) && (
          <div style={{ fontSize: '12px', fontWeight: 'bold', color: 'rgba(255, 255, 255, 0.5)', textTransform: 'uppercase', marginBottom: '16px', marginTop: '32px', paddingLeft: '16px' }}>Operations</div>
        )}

        {hasAccess("welfare_checking") && (
          <NavLink to="/welfare" className={navClass}>
            <i className="fa-solid fa-hand-holding-heart" style={{ width: '20px', textAlign: 'center' }}></i>
            Welfare Management
          </NavLink>
        )}
        
        {hasAccess("kyc_checking") && (
          <NavLink to="/kyc" className={navClass}>
            <i className="fa-solid fa-id-card-clip" style={{ width: '20px', textAlign: 'center' }}></i>
            KYC Checking
          </NavLink>
        )}
      </nav>

      {/* User Profile Footer */}
      <div className="profile-widget" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '12px', marginTop: 'auto' }}>
        <div style={{ width: '40px', height: '40px', backgroundColor: '#f3f4f6', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4b5563', fontWeight: 'bold' }}>
          {officerData?.name?.charAt(0) || 'O'}
        </div>
        <div>
          <span style={{ display: 'block', fontSize: '14px', fontWeight: 'bold', margin: 0 }}>{officerData?.name || 'Officer'}</span>
          <span style={{ display: 'block', fontSize: '12px', opacity: 0.7, margin: 0 }}>@{officerData?.username || 'user'}</span>
        </div>
      </div>
    </aside>
  );
}
