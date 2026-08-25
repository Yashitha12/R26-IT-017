import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";

export default function Wallet() {
  const navigate = useNavigate();
  const [activeLoans, setActiveLoans] = useState([]);

  useEffect(() => {
    fetch("http://127.0.0.1:8000/applications/all")
      .then(res => res.json())
      .then(data => {
        const approved = (data.loans || []).filter(l => l.status === 'Active');
        setActiveLoans(approved);
      })
      .catch(console.error);
  }, []);

  return (
    <>
      <Header />
      <div style={{ paddingLeft: '40px', paddingTop: '16px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-primary)', fontSize: '20px', fontWeight: 'bold' }}>
        My Wallet
      </div>

      <main className="content-container flex flex-col gap-8">
        
        {/* Purple Balance Banner */}
        <section style={{ background: 'linear-gradient(90deg, var(--primary), var(--primary-dark))', borderRadius: 'var(--radius-xl)', padding: '32px', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', boxShadow: 'var(--shadow-md)', position: 'relative' }}>
          <div>
            <div style={{ fontSize: '14px', opacity: 0.9 }}>Total Balance</div>
            <div style={{ fontSize: '36px', fontWeight: 'bold', margin: '4px 0 32px 0' }}>Rs. 12,500</div>
            
            <div style={{ display: 'flex', gap: '16px' }}>
              <div style={{ background: 'rgba(255,255,255,0.1)', padding: '16px 24px', borderRadius: '12px', minWidth: '240px' }}>
                <div style={{ fontSize: '12px', opacity: 0.9, marginBottom: '4px' }}>Savings</div>
                <div style={{ fontSize: '20px', fontWeight: 'bold' }}>Rs. 8,000</div>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.1)', padding: '16px 24px', borderRadius: '12px', minWidth: '240px' }}>
                <div style={{ fontSize: '12px', opacity: 0.9, marginBottom: '4px' }}>Welfare</div>
                <div style={{ fontSize: '20px', fontWeight: 'bold' }}>Rs. 4,500</div>
              </div>
            </div>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.2)', width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <i className="fa-solid fa-wallet" style={{ fontSize: '20px' }}></i>
          </div>
        </section>

        {/* Middle Row: Active Loans & Welfare Support */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
          
          {/* Active Loans */}
          <div className="card" style={{ padding: '32px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '24px', color: 'var(--text-primary)' }}>Active Loans</h3>
            
            {activeLoans.length === 0 ? (
              <p style={{ color: 'var(--text-secondary)' }}>No active loans.</p>
            ) : (
              activeLoans.map((loan, index) => (
                <div key={index} style={{ marginBottom: '24px', borderBottom: index < activeLoans.length - 1 ? '1px solid var(--border)' : 'none', paddingBottom: index < activeLoans.length - 1 ? '24px' : '0' }}>
                  <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
                    <div style={{ background: 'var(--primary-light)', color: 'var(--accent)', width: '40px', height: '40px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <i className="fa-solid fa-chart-line"></i>
                    </div>
                    <div>
                      <h4 style={{ fontWeight: 'bold', fontSize: '14px' }}>{loan.loan_type}</h4>
                      <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Approved via Blockchain</p>
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Loan Amount</span>
                      <span style={{ fontWeight: 'bold' }}>Rs. {Number(loan.approved_amount).toLocaleString()}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Duration</span>
                      <span style={{ fontWeight: 'bold' }}>{loan.duration_months} months</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Interest Rate</span>
                      <span style={{ fontWeight: 'bold' }}>{loan.interest_rate}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Welfare Support */}
          <div className="card" style={{ padding: '32px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '24px', color: 'var(--text-primary)' }}>Welfare Support</h3>
            
            <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
              <div style={{ background: 'var(--secondary-light)', color: 'var(--success)', width: '40px', height: '40px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <i className="fa-solid fa-gift"></i>
              </div>
              <div>
                <h4 style={{ fontWeight: 'bold', fontSize: '14px' }}>Monthly Samurdhi Support</h4>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Active since Jan 2026</p>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Monthly Amount</span>
                <span style={{ fontWeight: 'bold' }}>Rs. 4,500</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Last Payment</span>
                <span style={{ fontWeight: 'bold' }}>May 1, 2026</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Next Payment</span>
                <span style={{ fontWeight: 'bold' }}>June 1, 2026</span>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Row: Recent Transactions */}
        <div className="card" style={{ padding: '32px', marginBottom: '40px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 'bold', color: 'var(--text-primary)' }}>Recent Transactions</h3>
            <button style={{ background: 'none', border: 'none', color: 'var(--accent)', fontSize: '13px', fontWeight: 'bold', cursor: 'pointer' }}>View All</button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '16px', borderBottom: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ background: '#dcfce7', color: 'var(--success)', width: '32px', height: '32px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px' }}>
                  <i className="fa-solid fa-check"></i>
                </div>
                <div>
                  <div style={{ fontWeight: 'bold', fontSize: '14px' }}>Welfare Payment</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>May 1, 2026</div>
                </div>
              </div>
              <div style={{ fontWeight: 'bold', color: 'var(--success)' }}>+Rs. 4,500</div>
            </div>
          </div>
        </div>

      </main>
    </>
  );
}