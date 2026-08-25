import { NavLink } from "react-router-dom";

export default function Sidebar() {
  const linkStyle = ({ isActive }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 16px',
    borderRadius: '8px',
    textDecoration: 'none',
    fontWeight: '600',
    fontSize: '15px',
    color: isActive ? 'white' : '#4b5563',
    backgroundColor: isActive ? '#1e40af' : 'transparent',
    transition: 'all 0.2s',
    marginBottom: '8px'
  });

  return (
    <aside style={{ 
      width: '280px', 
      backgroundColor: 'white', 
      borderRight: '1px solid #e5e7eb', 
      height: '100vh', 
      position: 'fixed', 
      top: 0, 
      left: 0, 
      display: 'flex', 
      flexDirection: 'column' 
    }}>
      {/* Brand Header */}
      <div style={{ padding: '24px', borderBottom: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{ width: '40px', height: '40px', backgroundColor: '#1e40af', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '20px' }}>
          <i className="fa-solid fa-building-columns"></i>
        </div>
        <div>
          <h1 style={{ fontSize: '18px', fontWeight: 'bold', color: '#111827', margin: 0 }}>SmartGrama</h1>
          <p style={{ fontSize: '12px', color: '#6b7280', margin: 0 }}>Officer Portal</p>
        </div>
      </div>

      {/* Navigation */}
      <nav style={{ padding: '24px 16px', flex: 1 }}>
        <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#9ca3af', textTransform: 'uppercase', marginBottom: '16px', paddingLeft: '16px' }}>Main Menu</div>
        
        <NavLink to="/" style={linkStyle}>
          <i className="fa-solid fa-clipboard-list" style={{ width: '20px', textAlign: 'center' }}></i>
          Loan Approvals
        </NavLink>
        
        <NavLink to="/manage" style={linkStyle}>
          <i className="fa-solid fa-money-check-dollar" style={{ width: '20px', textAlign: 'center' }}></i>
          Bank & Loan Setup
        </NavLink>

        <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#9ca3af', textTransform: 'uppercase', marginBottom: '16px', marginTop: '32px', paddingLeft: '16px' }}>Operations</div>

        <NavLink to="/welfare" style={linkStyle}>
          <i className="fa-solid fa-hand-holding-heart" style={{ width: '20px', textAlign: 'center' }}></i>
          Welfare Management
        </NavLink>
        
        <NavLink to="/kyc" style={linkStyle}>
          <i className="fa-solid fa-id-card-clip" style={{ width: '20px', textAlign: 'center' }}></i>
          KYC Checking
        </NavLink>
      </nav>

      {/* User Profile Footer */}
      <div style={{ padding: '24px', borderTop: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{ width: '40px', height: '40px', backgroundColor: '#f3f4f6', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4b5563', fontWeight: 'bold' }}>
          OFF
        </div>
        <div>
          <p style={{ fontSize: '14px', fontWeight: 'bold', color: '#111827', margin: 0 }}>Officer Admin</p>
          <p style={{ fontSize: '12px', color: '#6b7280', margin: 0 }}>ID: 10452</p>
        </div>
      </div>
    </aside>
  );
}
