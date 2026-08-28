import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import { useEffect, useState } from "react";
import { fetchBlockchainLedger } from "../api/loanApi";

export default function Home() {
  const navigate = useNavigate();
  const [ledger, setLedger] = useState([]);

  useEffect(() => {
    async function loadData() {
      const data = await fetchBlockchainLedger();
      setLedger(data.ledger || []);
    }
    loadData();
  }, []);

  return (
    <>
      <Header />
      <main className="content-container">
        
        {/* Purple Balance Banner */}
        <section style={{ background: 'linear-gradient(90deg, var(--primary), var(--primary-dark))', borderRadius: 'var(--radius-xl)', padding: '32px', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', boxShadow: 'var(--shadow-md)' }}>
          <div>
            <div style={{ fontSize: '14px', opacity: 0.9 }}>Total Balance</div>
            <div style={{ fontSize: '36px', fontWeight: 'bold', margin: '4px 0' }}>Rs. 12,500</div>
            <div style={{ fontSize: '12px', opacity: 0.8 }}>Updated today, Aug 23 2026</div>
          </div>
          <div style={{ display: 'flex', gap: '48px', paddingRight: '24px' }}>
            <div>
              <div style={{ fontSize: '13px', opacity: 0.9, textAlign: 'right' }}>Savings</div>
              <div style={{ fontSize: '24px', fontWeight: 'bold' }}>Rs. 8,000</div>
            </div>
            <div onClick={() => navigate("/welfare")} style={{ borderLeft: '1px solid rgba(255,255,255,0.2)', paddingLeft: '48px', cursor: 'pointer' }}>
              <div style={{ fontSize: '13px', opacity: 0.9, textAlign: 'right' }}>Welfare</div>
              <div style={{ fontSize: '24px', fontWeight: 'bold' }}>Rs. 4,500</div>
            </div>
          </div>
        </section>

        {/* Quick Actions */}
        <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '16px' }}>Quick Actions</h3>
        <section style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '32px' }}>
          <div onClick={() => navigate("/loan-programs")} style={{ background: 'white', borderRadius: '16px', padding: '24px 16px', display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer', boxShadow: 'var(--shadow-sm)' }}>
            <div style={{ background: 'var(--primary)', color: 'white', width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
              <i className="fa-solid fa-chart-line" style={{ fontSize: '20px' }}></i>
            </div>
            <div style={{ fontWeight: 'bold', fontSize: '14px' }}>Apply Loan</div>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Quick funding</div>
          </div>

          <div onClick={() => navigate("/welfare")} style={{ background: 'white', borderRadius: '16px', padding: '24px 16px', display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer', boxShadow: 'var(--shadow-sm)' }}>
            <div style={{ background: 'var(--success)', color: 'white', width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
              <i className="fa-solid fa-gift" style={{ fontSize: '20px' }}></i>
            </div>
            <div style={{ fontWeight: 'bold', fontSize: '14px' }}>Apply Welfare</div>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Government aid</div>
          </div>

          <div onClick={() => navigate("/wallet")} style={{ background: 'white', borderRadius: '16px', padding: '24px 16px', display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer', boxShadow: 'var(--shadow-sm)' }}>
            <div style={{ background: 'var(--secondary)', color: 'white', width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
              <i className="fa-solid fa-wallet" style={{ fontSize: '20px' }}></i>
            </div>
            <div style={{ fontWeight: 'bold', fontSize: '14px' }}>My Wallet</div>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>View balance</div>
          </div>

          <div onClick={() => navigate("/profile")} style={{ background: 'white', borderRadius: '16px', padding: '24px 16px', display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer', boxShadow: 'var(--shadow-sm)' }}>
            <div style={{ background: 'var(--warning)', color: 'white', width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
              <i className="fa-solid fa-user" style={{ fontSize: '20px' }}></i>
            </div>
            <div style={{ fontWeight: 'bold', fontSize: '14px' }}>My Profile</div>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Account info</div>
          </div>
        </section>

        {/* Dashboard Grid (Main & Sidebar split) */}
        <div className="dashboard-grid">
          {/* Left Column: Recent Applications */}
          <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
            <div className="card-header" style={{ margin: '0', padding: '24px', borderBottom: 'none' }}>
              <h2 className="card-title">Recent Applications</h2>
              <button style={{ color: 'var(--accent)', background: 'none', border: 'none', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px' }} onClick={() => navigate("/status")}>View All</button>
            </div>
            
            <div style={{ padding: '0 24px 24px 24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Dummy row 1 */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', border: '1px solid var(--border)', borderRadius: '12px' }}>
                <div className="flex items-center gap-4">
                  <div style={{ background: 'var(--primary-light)', color: 'var(--accent)', width: '40px', height: '40px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <i className="fa-solid fa-chart-line"></i>
                  </div>
                  <div>
                    <h4 style={{ fontWeight: 'bold', fontSize: '14px' }}>Agricultural Microloan</h4>
                    <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>Apr 10, 2026</p>
                    <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Rs. 150,000 &middot; EMI: Rs. 3,750/month</p>
                  </div>
                </div>
                <div style={{ padding: '4px 12px', background: 'var(--secondary-light)', color: 'var(--success)', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold' }}>Approved</div>
              </div>

              {/* Dummy row 2 */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', border: '1px solid var(--border)', borderRadius: '12px' }}>
                <div className="flex items-center gap-4">
                  <div style={{ background: '#f0fdf4', color: 'var(--success)', width: '40px', height: '40px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <i className="fa-solid fa-gift"></i>
                  </div>
                  <div>
                    <h4 style={{ fontWeight: 'bold', fontSize: '14px' }}>Samurdhi Welfare</h4>
                    <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>May 5, 2026</p>
                    <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Monthly support &middot; Rs. 4,500</p>
                  </div>
                </div>
                <div style={{ padding: '4px 12px', background: '#fef3c7', color: 'var(--warning)', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold' }}>Under Review</div>
              </div>
            </div>
          </div>

          {/* Right Column: AI & Stats */}
          <div className="flex flex-col gap-4">
            
            <div className="card" style={{ padding: '20px' }}>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Active Loans</div>
              <div style={{ fontSize: '24px', fontWeight: 'bold', margin: '4px 0' }}>1</div>
              <div style={{ fontSize: '12px', color: 'var(--accent)' }}>Rs. 150,000 outstanding</div>
            </div>

            <div className="card" style={{ padding: '20px' }}>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Welfare Programs</div>
              <div style={{ fontSize: '24px', fontWeight: 'bold', margin: '4px 0' }}>1</div>
              <div style={{ fontSize: '12px', color: 'var(--success)' }}>Monthly Samurdhi active</div>
            </div>

            <div onClick={() => navigate("/ai-chat")} style={{ background: 'var(--accent)', borderRadius: '16px', padding: '24px', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', marginTop: 'auto' }}>
              <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                <i className="fa-regular fa-comment-dots" style={{ fontSize: '24px' }}></i>
                <div>
                  <div style={{ fontWeight: 'bold', fontSize: '14px' }}>Ask AI Assistant</div>
                  <div style={{ fontSize: '12px', opacity: 0.9 }}>Get instant help</div>
                </div>
              </div>
              <i className="fa-solid fa-chevron-right" style={{ fontSize: '12px' }}></i>
            </div>
          </div>
        </div>

      </main>
    </>
  );
}
