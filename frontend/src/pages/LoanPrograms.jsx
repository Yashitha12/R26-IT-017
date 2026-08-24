import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import { loanProducts } from "../data/loanProducts";

export default function LoanPrograms() {
  const navigate = useNavigate();
  const [selectedBank, setSelectedBank] = useState("Samupakara (Cooperative Rural Bank)");
  const [selectedProduct, setSelectedProduct] = useState("below_25000");

  const products = Object.values(loanProducts).filter((p) => p.bank === selectedBank);
  const selectedProductData = loanProducts[selectedProduct];

  return (
    <>
      <Header />
      <div style={{ paddingLeft: '40px', paddingTop: '16px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-primary)', fontSize: '20px', fontWeight: 'bold' }}>
        Apply Loan
      </div>

      <main className="content-container flex flex-col gap-8">
        
        {/* Blue Hero Banner */}
        <section style={{ background: 'var(--accent)', borderRadius: 'var(--radius-xl)', padding: '40px', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: 'var(--shadow-md)' }}>
          <div>
            <div style={{ background: 'rgba(255,255,255,0.2)', width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
              <i className="fa-solid fa-chart-line" style={{ fontSize: '24px' }}></i>
            </div>
            <h1 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '8px' }}>Microloan Program</h1>
            <p style={{ fontSize: '14px', opacity: 0.9 }}>Get quick access to funds for your agricultural and business needs.</p>
          </div>
        </section>

        {/* Bank Selection */}
        <div style={{ display: 'flex', gap: '16px', borderBottom: '2px solid var(--border)', paddingBottom: '16px' }}>
          <button 
            onClick={() => { setSelectedBank("Samupakara (Cooperative Rural Bank)"); setSelectedProduct("below_25000"); }}
            style={{ padding: '12px 24px', borderRadius: '30px', fontWeight: 'bold', fontSize: '14px', border: 'none', cursor: 'pointer', background: selectedBank === "Samupakara (Cooperative Rural Bank)" ? 'var(--accent)' : 'transparent', color: selectedBank === "Samupakara (Cooperative Rural Bank)" ? 'white' : 'var(--text-secondary)' }}
          >
            Samupakara (Sanasa)
          </button>
          <button 
            onClick={() => { setSelectedBank("Samurdhi Banking Society"); setSelectedProduct("lakjaya"); }}
            style={{ padding: '12px 24px', borderRadius: '30px', fontWeight: 'bold', fontSize: '14px', border: 'none', cursor: 'pointer', background: selectedBank === "Samurdhi Banking Society" ? 'var(--accent)' : 'transparent', color: selectedBank === "Samurdhi Banking Society" ? 'white' : 'var(--text-secondary)' }}
          >
            Samurdhi Bank
          </button>
        </div>

        {/* Products Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '32px' }}>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 'bold', color: 'var(--text-primary)', marginBottom: '8px' }}>Available Loan Types</h3>
            {products.map((product) => (
              <div 
                key={product.id}
                onClick={() => setSelectedProduct(product.id)}
                style={{ 
                  background: 'white', 
                  borderRadius: '16px', 
                  padding: '24px', 
                  border: selectedProduct === product.id ? '2px solid var(--accent)' : '1px solid var(--border)', 
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  boxShadow: selectedProduct === product.id ? 'var(--shadow-sm)' : 'none',
                  transition: 'all 0.2s'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ background: selectedProduct === product.id ? 'var(--accent)' : 'var(--background)', color: selectedProduct === product.id ? 'white' : 'var(--text-secondary)', width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', transition: 'all 0.2s' }}>
                    <i className={`fa-solid ${product.icon}`}></i>
                  </div>
                  <div>
                    <div style={{ fontWeight: 'bold', fontSize: '15px', color: 'var(--text-primary)', marginBottom: '4px' }}>{product.title}</div>
                    <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{product.subtitle}</div>
                  </div>
                </div>
                <div style={{ background: 'var(--secondary-light)', color: 'var(--success)', padding: '6px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: 'bold' }}>
                  {product.badge}
                </div>
              </div>
            ))}
          </div>

          {/* Selected Product Details */}
          {selectedProductData && (
            <div className="card" style={{ padding: '32px', height: 'fit-content', position: 'sticky', top: '100px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: 'var(--text-primary)', marginBottom: '8px' }}>{selectedProductData.title}</h3>
              <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '24px' }}>{selectedProductData.subtitle}</div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '32px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '16px', borderBottom: '1px solid var(--border)' }}>
                  <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Interest Rate</span>
                  <span style={{ fontSize: '14px', fontWeight: 'bold', color: 'var(--accent)' }}>{selectedProductData.interestRate}% APR</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '16px', borderBottom: '1px solid var(--border)' }}>
                  <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Loan Limit</span>
                  <span style={{ fontSize: '14px', fontWeight: 'bold', color: 'var(--text-primary)' }}>Rs. {selectedProductData.min.toLocaleString()} - Rs. {selectedProductData.max.toLocaleString()}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '16px', borderBottom: '1px solid var(--border)' }}>
                  <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Max Repayment</span>
                  <span style={{ fontSize: '14px', fontWeight: 'bold', color: 'var(--text-primary)' }}>{selectedProductData.maxMonths} months</span>
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
                Apply for {selectedProductData.title}
              </button>
            </div>
          )}
        </div>

        {/* Why Choose Us */}
        <section className="card" style={{ padding: '32px', marginTop: '16px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '24px' }}>Why Choose Us?</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
            <div style={{ display: 'flex', gap: '16px' }}>
              <div style={{ background: 'var(--accent)', color: 'white', width: '32px', height: '32px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', flexShrink: 0 }}>1</div>
              <div>
                <div style={{ fontWeight: 'bold', fontSize: '14px', marginBottom: '4px' }}>Quick Approval</div>
                <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Get approved within 24-48 hours</div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '16px' }}>
              <div style={{ background: 'var(--accent)', color: 'white', width: '32px', height: '32px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', flexShrink: 0 }}>2</div>
              <div>
                <div style={{ fontWeight: 'bold', fontSize: '14px', marginBottom: '4px' }}>Low Interest Rates</div>
                <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Starting from 8% APR on select products</div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '16px' }}>
              <div style={{ background: 'var(--accent)', color: 'white', width: '32px', height: '32px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', flexShrink: 0 }}>3</div>
              <div>
                <div style={{ fontWeight: 'bold', fontSize: '14px', marginBottom: '4px' }}>Flexible Terms</div>
                <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Repayment up to 60 months on capital loans</div>
              </div>
            </div>
          </div>
        </section>

      </main>
    </>
  );
}