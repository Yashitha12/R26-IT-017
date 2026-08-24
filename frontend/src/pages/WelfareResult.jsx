import { useNavigate } from "react-router-dom";
import Header from "../components/Header";

export default function WelfareResult() {
  const navigate = useNavigate();

  return (
    <>
      <Header />
      <div style={{ paddingLeft: '40px', paddingTop: '16px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', fontSize: '13px', cursor: 'pointer' }} onClick={() => navigate(-1)}>
        <i className="fa-solid fa-arrow-left"></i>
        <span>Welfare Application</span>
      </div>

      <main className="content-container flex justify-center items-center" style={{ minHeight: 'calc(100vh - 120px)' }}>
        <div className="card" style={{ maxWidth: 480, width: '100%', padding: '40px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', boxShadow: 'var(--shadow-md)' }}>
          
          <div style={{ background: '#dcfce7', width: '64px', height: '64px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px' }}>
            <i className="fa-solid fa-check" style={{ color: 'var(--success)', fontSize: '32px' }}></i>
          </div>

          <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: 'var(--success)', marginBottom: '8px' }}>
            Application Submitted!
          </h2>

          <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginBottom: '32px', maxWidth: '300px' }}>
            Your welfare application is under review. You will be notified within 3-5 working days.
          </p>

          <div style={{ background: 'var(--background)', width: '100%', borderRadius: '12px', padding: '24px', marginBottom: '16px' }}>
            <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Family Size</div>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--text-primary)' }}>4 Members</div>
          </div>

          <div style={{ padding: '16px', background: '#dcfce7', borderRadius: '8px', border: 'none', color: '#166534', fontSize: '12px', width: '100%', textAlign: 'left', marginBottom: '32px' }}>
            Your family qualifies for additional support as a household of 4+ members.
          </div>

          <div style={{ width: '100%' }}>
            <button 
              onClick={() => navigate("/welfare")}
              style={{ background: 'var(--success)', color: 'white', border: 'none', padding: '16px', borderRadius: '8px', width: '100%', fontSize: '15px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              Back to Welfare
            </button>
          </div>
          
        </div>
      </main>
    </>
  );
}
