import { useNavigate } from "react-router-dom";
import Header from "../components/Header";

export default function Profile() {
  const navigate = useNavigate();

  return (
    <>
      <Header />
      <div style={{ paddingLeft: '40px', paddingTop: '16px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-primary)', fontSize: '20px', fontWeight: 'bold' }}>
        My Profile
      </div>

      <main className="content-container">
        <div className="dashboard-grid" style={{ gridTemplateColumns: '320px 1fr', gap: '32px' }}>
          
          {/* Left Column: Identity Card */}
          <div style={{ background: 'var(--primary)', borderRadius: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '48px 24px 32px 24px', color: 'white', position: 'relative' }}>
            <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px' }}>
              <i className="fa-solid fa-user" style={{ fontSize: '32px' }}></i>
            </div>
            
            <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '4px' }}>Nimal Perera</h2>
            <div style={{ fontSize: '13px', opacity: 0.8, marginBottom: '48px' }}>NIC: 198723456789</div>

            <div style={{ background: 'rgba(255,255,255,0.1)', width: '100%', borderRadius: '12px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                <span style={{ opacity: 0.8 }}>Division</span>
                <span style={{ fontWeight: 'bold' }}>Homagama 542/A</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                <span style={{ opacity: 0.8 }}>Status</span>
                <span style={{ fontWeight: 'bold', color: '#4ade80' }}>Active Resident</span>
              </div>
            </div>
          </div>

          {/* Right Column: Information Cards */}
          <div className="flex flex-col gap-6">
            
            {/* Personal Info */}
            <div className="card" style={{ padding: '24px' }}>
              <h3 style={{ fontSize: '14px', fontWeight: 'bold', color: 'var(--text-primary)', marginBottom: '16px' }}>Personal Information</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                
                <div style={{ background: 'var(--background)', borderRadius: '12px', padding: '16px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <i className="fa-solid fa-phone"></i>
                  </div>
                  <div>
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Phone Number</div>
                    <div style={{ fontSize: '14px', fontWeight: 'bold' }}>+94 77 123 4567</div>
                  </div>
                </div>

                <div style={{ background: 'var(--background)', borderRadius: '12px', padding: '16px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#ffedd5', color: '#ea580c', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <i className="fa-solid fa-envelope"></i>
                  </div>
                  <div>
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Email Address</div>
                    <div style={{ fontSize: '14px', fontWeight: 'bold' }}>nimal.perera@gmail.com</div>
                  </div>
                </div>

                <div style={{ background: 'var(--background)', borderRadius: '12px', padding: '16px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'var(--secondary-light)', color: 'var(--success)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <i className="fa-solid fa-location-dot"></i>
                  </div>
                  <div>
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>GN Division</div>
                    <div style={{ fontSize: '14px', fontWeight: 'bold' }}>Homagama - Division 542/A</div>
                  </div>
                </div>

              </div>
            </div>

            {/* Bottom Row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
              
              <div className="card" style={{ padding: '24px' }}>
                <h3 style={{ fontSize: '14px', fontWeight: 'bold', color: 'var(--text-primary)', marginBottom: '16px' }}>Family Details</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div style={{ background: 'var(--background)', borderRadius: '12px', padding: '12px' }}>
                    <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Family Size</div>
                    <div style={{ fontSize: '14px', fontWeight: 'bold' }}>4 Members</div>
                  </div>
                  <div style={{ background: 'var(--background)', borderRadius: '12px', padding: '12px' }}>
                    <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Dependents</div>
                    <div style={{ fontSize: '14px', fontWeight: 'bold' }}>2 Children</div>
                  </div>
                  <div style={{ background: 'var(--background)', borderRadius: '12px', padding: '12px' }}>
                    <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Spouse</div>
                    <div style={{ fontSize: '14px', fontWeight: 'bold' }}>Married</div>
                  </div>
                  <div style={{ background: 'var(--background)', borderRadius: '12px', padding: '12px' }}>
                    <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Elderly</div>
                    <div style={{ fontSize: '14px', fontWeight: 'bold' }}>None</div>
                  </div>
                </div>
              </div>

              <div className="card" style={{ padding: '24px' }}>
                <h3 style={{ fontSize: '14px', fontWeight: 'bold', color: 'var(--text-primary)', marginBottom: '16px' }}>Employment & Income</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ background: 'var(--background)', borderRadius: '12px', padding: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '24px', height: '24px', borderRadius: '6px', background: '#fef3c7', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px' }}>
                      <i className="fa-solid fa-briefcase"></i>
                    </div>
                    <div>
                      <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Occupation</div>
                      <div style={{ fontSize: '14px', fontWeight: 'bold' }}>Farmer</div>
                    </div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div style={{ background: 'var(--background)', borderRadius: '12px', padding: '12px' }}>
                      <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Monthly Income</div>
                      <div style={{ fontSize: '14px', fontWeight: 'bold' }}>Rs. 18,500</div>
                    </div>
                    <div style={{ background: 'var(--background)', borderRadius: '12px', padding: '12px' }}>
                      <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Monthly Expenses</div>
                      <div style={{ fontSize: '14px', fontWeight: 'bold' }}>Rs. 12,000</div>
                    </div>
                  </div>
                </div>
              </div>

            </div>

          </div>
        </div>
      </main>
    </>
  );
}
