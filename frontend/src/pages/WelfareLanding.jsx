import { useNavigate } from "react-router-dom";
import Header from "../components/Header";

export default function WelfareLanding() {
  const navigate = useNavigate();

  return (
    <>
      <Header />
      <main className="content-container">
        <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '24px', color: 'var(--text-primary)' }}>Apply Welfare</h2>
        
        {/* Green Hero Banner */}
        <section style={{ background: 'var(--success)', borderRadius: 'var(--radius-xl)', padding: '40px', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', boxShadow: 'var(--shadow-md)' }}>
          <div>
            <div style={{ background: 'rgba(255,255,255,0.2)', width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
              <i className="fa-solid fa-gift" style={{ fontSize: '24px' }}></i>
            </div>
            <h1 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '8px' }}>Welfare Support Program</h1>
            <p style={{ fontSize: '14px', opacity: 0.9 }}>Government assistance for eligible families</p>
          </div>
          <button 
            onClick={() => navigate("/welfare-apply")} 
            style={{ background: 'white', color: 'var(--success)', padding: '12px 32px', borderRadius: '8px', fontSize: '15px', fontWeight: 'bold', border: 'none', cursor: 'pointer', boxShadow: 'var(--shadow-sm)' }}
          >
            Apply for Welfare
          </button>
        </section>

        {/* Program Benefits */}
        <section className="card" style={{ padding: '32px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '24px' }}>Program Benefits</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
            <div style={{ display: 'flex', gap: '16px' }}>
              <div style={{ background: 'var(--success)', color: 'white', width: '32px', height: '32px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', flexShrink: 0 }}>1</div>
              <div>
                <div style={{ fontWeight: 'bold', fontSize: '14px', marginBottom: '4px' }}>Monthly Support</div>
                <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Up to Rs. 5,000 per month</div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '16px' }}>
              <div style={{ background: 'var(--success)', color: 'white', width: '32px', height: '32px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', flexShrink: 0 }}>2</div>
              <div>
                <div style={{ fontWeight: 'bold', fontSize: '14px', marginBottom: '4px' }}>Quick Verification</div>
                <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Fast eligibility check</div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '16px' }}>
              <div style={{ background: 'var(--success)', color: 'white', width: '32px', height: '32px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', flexShrink: 0 }}>3</div>
              <div>
                <div style={{ fontWeight: 'bold', fontSize: '14px', marginBottom: '4px' }}>Direct Transfer</div>
                <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Bank transfer disbursement</div>
              </div>
            </div>
          </div>
        </section>

        {/* Who Can Apply */}
        <section className="card" style={{ padding: '32px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '24px' }}>Who Can Apply?</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ background: 'var(--secondary-light)', color: 'var(--success)', width: '20px', height: '20px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px' }}>
                <i className="fa-solid fa-check"></i>
              </div>
              <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Low-income households registered in GN Division</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ background: 'var(--secondary-light)', color: 'var(--success)', width: '20px', height: '20px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px' }}>
                <i className="fa-solid fa-check"></i>
              </div>
              <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Families with 2 or more dependents</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ background: 'var(--secondary-light)', color: 'var(--success)', width: '20px', height: '20px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px' }}>
                <i className="fa-solid fa-check"></i>
              </div>
              <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Senior citizens and persons with disabilities</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ background: 'var(--secondary-light)', color: 'var(--success)', width: '20px', height: '20px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px' }}>
                <i className="fa-solid fa-check"></i>
              </div>
              <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>No active income above Rs. 25,000/month</span>
            </div>
          </div>
        </section>

      </main>
    </>
  );
}
