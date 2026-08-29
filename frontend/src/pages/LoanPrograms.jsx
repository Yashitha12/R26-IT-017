import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";

export default function LoanPrograms() {
  const navigate = useNavigate();
  
  const [banks, setBanks] = useState([]);
  const [allPrograms, setAllPrograms] = useState([]);
  
  const [selectedBankId, setSelectedBankId] = useState("");
  const [selectedProductId, setSelectedProductId] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("http://127.0.0.1:8000/banks").then(res => res.json()),
      fetch("http://127.0.0.1:8000/loan-programs").then(res => res.json())
    ]).then(([banksData, programsData]) => {
      setBanks(banksData);
      setAllPrograms(programsData);
      
      if (banksData.length > 0) {
        setSelectedBankId(banksData[0].id);
        const firstBankPrograms = programsData.filter(p => p.bank_id === banksData[0].id);
        if (firstBankPrograms.length > 0) {
          setSelectedProductId(firstBankPrograms[0].id);
        }
      }
      setLoading(false);
    }).catch(err => {
      console.error(err);
      setLoading(false);
    });
  }, []);

  const filteredProducts = allPrograms.filter(p => p.bank_id === selectedBankId);
  const selectedProductData = allPrograms.find(p => p.id === selectedProductId);

  return (
    <>
      <Header />
      <div style={{ paddingLeft: '40px', paddingTop: '16px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-primary)', fontSize: '20px', fontWeight: 'bold' }}>
        Apply Loan
      </div>

      <main className="content-container flex flex-col gap-8">
        
        {/* Blue Hero Banner */}
        <section className="theme-card-gradient" style={{ borderRadius: 'var(--radius-xl)', padding: '40px', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: 'var(--shadow-md)' }}>
          <div>
            <div style={{ background: 'rgba(255,255,255,0.2)', width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
              <i className="fa-solid fa-chart-line" style={{ fontSize: '24px' }}></i>
            </div>
            <h1 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '8px' }}>Microloan Program</h1>
            <p style={{ fontSize: '14px', opacity: 0.9 }}>Get quick access to funds for your agricultural and business needs.</p>
          </div>
        </section>

        {loading ? (
          <p style={{ textAlign: 'center', padding: '40px' }}>Loading dynamically from API...</p>
        ) : (
          <>
            {/* Bank Selection */}
            <div style={{ marginBottom: '16px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 'bold', color: 'var(--text-primary)', marginBottom: '16px' }}>Select Financial Institution</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '16px' }}>
                {banks.map(bank => (
                  <div 
                    key={bank.id}
                    className={`bank-card ${selectedBankId === bank.id ? 'selected' : ''}`}
                    onClick={() => { 
                      setSelectedBankId(bank.id); 
                      const progs = allPrograms.filter(p => p.bank_id === bank.id);
                      if(progs.length > 0) setSelectedProductId(progs[0].id);
                    }}
                  >
                    <div className="bank-icon-placeholder">
                      <i className="fa-solid fa-building-columns"></i>
                    </div>
                    <span style={{ fontWeight: 'bold', fontSize: '14px', color: selectedBankId === bank.id ? 'var(--primary)' : 'var(--text-primary)' }}>
                      {bank.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Products Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '32px' }}>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 'bold', color: 'var(--text-primary)', marginBottom: '8px' }}>Available Loan Types</h3>
                {filteredProducts.map((product) => (
                  <div 
                    key={product.id}
                    onClick={() => setSelectedProductId(product.id)}
                    style={{ 
                      background: 'white', 
                      borderRadius: '16px', 
                      padding: '24px', 
                      border: selectedProductId === product.id ? '2px solid var(--accent)' : '1px solid var(--border)', 
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      boxShadow: selectedProductId === product.id ? 'var(--shadow-sm)' : 'none',
                      transition: 'all 0.2s'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <div style={{ background: selectedProductId === product.id ? 'var(--accent)' : 'var(--background)', color: selectedProductId === product.id ? 'white' : 'var(--text-secondary)', width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', transition: 'all 0.2s' }}>
                        <i className="fa-solid fa-briefcase"></i>
                      </div>
                      <div>
                        <div style={{ fontWeight: 'bold', fontSize: '15px', color: 'var(--text-primary)', marginBottom: '4px' }}>{product.title}</div>
                        <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{product.subtitle}</div>
                      </div>
                    </div>
                    <div style={{ background: 'var(--secondary-light)', color: 'var(--success)', padding: '6px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: 'bold' }}>
                      {product.tag}
                    </div>
                  </div>
                ))}
                {filteredProducts.length === 0 && (
                  <p>No loan programs found for this bank.</p>
                )}
              </div>

              {/* Selected Product Details */}
              {selectedProductData && (
                <div className="card" style={{ padding: '32px', height: 'fit-content', position: 'sticky', top: '100px' }}>
                  <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: 'var(--text-primary)', marginBottom: '8px' }}>{selectedProductData.title}</h3>
                  <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '24px' }}>{selectedProductData.subtitle}</div>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '32px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '16px', borderBottom: '1px solid var(--border)' }}>
                      <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Interest Rate</span>
                      <span style={{ fontSize: '14px', fontWeight: 'bold', color: 'var(--accent)' }}>{selectedProductData.apr}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '16px', borderBottom: '1px solid var(--border)' }}>
                      <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Loan Limit</span>
                      <span style={{ fontSize: '14px', fontWeight: 'bold', color: 'var(--text-primary)' }}>{selectedProductData.limit}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '16px', borderBottom: '1px solid var(--border)' }}>
                      <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Max Repayment</span>
                      <span style={{ fontSize: '14px', fontWeight: 'bold', color: 'var(--text-primary)' }}>{selectedProductData.months}</span>
                    </div>
                  </div>

                  <div style={{ marginBottom: '32px' }}>
                    <h4 style={{ fontSize: '13px', fontWeight: 'bold', marginBottom: '12px', color: 'var(--text-primary)' }}>Key Features</h4>
                    <ul style={{ display: 'flex', flexDirection: 'column', gap: '8px', paddingLeft: '0', listStyle: 'none' }}>
                      {selectedProductData.features.map((feature, idx) => (
                        <li key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                          <i className="fa-solid fa-check" style={{ color: 'var(--success)', fontSize: '12px' }}></i> {feature}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <button 
                    onClick={() => navigate(`/apply?product=${selectedProductData.id}`)} 
                    style={{ width: '100%', background: 'var(--accent)', color: 'white', padding: '16px', borderRadius: '12px', fontSize: '15px', fontWeight: 'bold', border: 'none', cursor: 'pointer', boxShadow: 'var(--shadow-sm)' }}
                  >
                    Apply for {selectedProductData.title.split('(')[0].trim()}
                  </button>
                </div>
              )}
            </div>
          </>
        )}

      </main>
    </>
  );
}