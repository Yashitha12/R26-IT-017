import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import dashboardBg from "../assets/smartgrama_dashboard_bg.jpg";

/* ─── Custom SVG Icons ─── */
const Ico = {
  bank: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="21" x2="21" y2="21"/><line x1="3" y1="10" x2="21" y2="10"/><polyline points="5 6 12 3 19 6"/><line x1="4" y1="10" x2="4" y2="21"/><line x1="20" y1="10" x2="20" y2="21"/><line x1="8" y1="14" x2="8" y2="17"/><line x1="12" y1="14" x2="12" y2="17"/><line x1="16" y1="14" x2="16" y2="17"/></svg>,
  briefcase: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="7" width="20" height="14" rx="3"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/><line x1="12" y1="12" x2="12" y2="16"/><line x1="10" y1="14" x2="14" y2="14"/></svg>,
  sprout: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M7 20h10"/><path d="M10 20c0-4.4 3.6-8 8-8"/><path d="M4 12c4.4 0 8 3.6 8 8"/><path d="M12 4c0 4.4-3.6 8-8 8"/><path d="M12 4c0 4.4 3.6 8 8 8"/></svg>,
  percent: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="19" y1="5" x2="5" y2="19"/><circle cx="6.5" cy="6.5" r="2.5"/><circle cx="17.5" cy="17.5" r="2.5"/></svg>,
  calendar: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
  check: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>,
  shield: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10"/></svg>,
  arrowRight: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>,
  calculator: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="4" y="2" width="16" height="20" rx="2"/><line x1="8" y1="6" x2="16" y2="6"/><line x1="16" y1="14" x2="16" y2="18"/><path d="M8 10h.01M12 10h.01M16 10h.01M8 14h.01M12 14h.01M8 18h.01M12 18h.01"/></svg>,
};

export default function LoanPrograms() {
  const navigate = useNavigate();
  
  const [banks, setBanks] = useState([]);
  const [allPrograms, setAllPrograms] = useState([]);
  
  const [selectedBankId, setSelectedBankId] = useState("");
  const [selectedProductId, setSelectedProductId] = useState("");
  const [loading, setLoading] = useState(true);

  // Quick estimator state
  const [estAmount, setEstAmount] = useState(50000);
  const [estMonths, setEstMonths] = useState(24);

  useEffect(() => {
    Promise.all([
      fetch("http://127.0.0.1:8000/banks").then(res => res.json()),
      fetch("http://127.0.0.1:8000/loan-programs").then(res => res.json())
    ]).then(([banksData, programsData]) => {
      setBanks(banksData || []);
      setAllPrograms(programsData || []);
      
      if (banksData && banksData.length > 0) {
        setSelectedBankId(banksData[0].id);
        const firstBankPrograms = (programsData || []).filter(p => p.bank_id === banksData[0].id);
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
  const selectedProductData = allPrograms.find(p => p.id === selectedProductId) || filteredProducts[0];

  // Helper to parse numeric APR
  const getRateNum = (aprStr = "10%") => {
    const num = parseFloat(aprStr.replace(/[^0-9.]/g, ""));
    return isNaN(num) || num === 0 ? 10 : num;
  };

  // Live EMI calculation for the estimator
  const currentRate = selectedProductData ? getRateNum(selectedProductData.apr) : 10;
  const monthlyRate = currentRate / 12 / 100;
  const estimatedEmi = estMonths > 0 && estAmount > 0
    ? Math.round((estAmount * monthlyRate * Math.pow(1 + monthlyRate, estMonths)) / (Math.pow(1 + monthlyRate, estMonths) - 1))
    : 0;

  return (
    <div style={{
      minHeight: "100vh",
      backgroundImage: `url(${dashboardBg})`,
      backgroundSize: "cover",
      backgroundPosition: "center",
      backgroundAttachment: "fixed",
      position: "relative",
    }}>
      {/* Frosted subtle overlay */}
      <div style={{
        position: "absolute",
        inset: 0,
        background: "linear-gradient(175deg, rgba(241, 245, 249, 0.88) 0%, rgba(230, 238, 245, 0.92) 100%)",
        backdropFilter: "blur(4px)",
        pointerEvents: "none",
        zIndex: 0,
      }} />

      <div style={{ position: "relative", zIndex: 1 }}>
        <Header />

        <main className="content-container" style={{ display: "flex", flexDirection: "column", gap: 24, padding: "24px 36px 60px" }}>

          {/* ═══════════════════════════════════════════════════
              TOP: HERO BANNER & PORTAL OVERVIEW
          ═══════════════════════════════════════════════════ */}
          <div style={{
            borderRadius: 22,
            overflow: "hidden",
            boxShadow: "0 16px 45px rgba(4, 20, 55, 0.16)",
            background: "linear-gradient(140deg, #0c1445 0%, #064e3b 100%)",
            color: "#fff",
            padding: "32px 36px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 20,
            position: "relative",
          }}>
            <div style={{ position: "absolute", top: -40, right: -40, width: 220, height: 220, borderRadius: "50%", background: "rgba(255,255,255,0.04)" }} />
            
            <div style={{ position: "relative" }}>
              <div style={{ fontSize: 11, fontWeight: 800, color: "#6ee7b7", textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 4 }}>
                SmartGrama Decentralized Rural Credit Portal
              </div>
              <h1 style={{ fontSize: 28, fontWeight: 900, letterSpacing: -0.5, margin: "0 0 6px" }}>
                Microfinance &amp; Community Loan Programs
              </h1>
              <p style={{ fontSize: 13, color: "rgba(255,255,255,0.7)", margin: 0, maxWidth: 600, lineHeight: 1.5 }}>
                Subsidized micro-credit designed for Sri Lankan agriculturalists, self-employed women, and village small businesses with decentralized consensus approval.
              </p>
            </div>

            <div style={{ display: "flex", gap: 12, position: "relative" }}>
              <div style={{
                background: "rgba(255, 255, 255, 0.10)",
                backdropFilter: "blur(10px)",
                borderRadius: 16,
                padding: "14px 20px",
                border: "1px solid rgba(255, 255, 255, 0.16)",
                textAlign: "center",
              }}>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.6)", fontWeight: 700, textTransform: "uppercase" }}>Interest from</div>
                <div style={{ fontSize: 24, fontWeight: 900, color: "#6ee7b7", marginTop: 2 }}>8.0% APR</div>
              </div>
              <div style={{
                background: "rgba(255, 255, 255, 0.10)",
                backdropFilter: "blur(10px)",
                borderRadius: 16,
                padding: "14px 20px",
                border: "1px solid rgba(255, 255, 255, 0.16)",
                textAlign: "center",
              }}>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.6)", fontWeight: 700, textTransform: "uppercase" }}>Approval Time</div>
                <div style={{ fontSize: 24, fontWeight: 900, color: "#fff", marginTop: 2 }}>&lt; 24 Hours</div>
              </div>
            </div>
          </div>

          {loading ? (
            <div style={{
              background: "rgba(255, 255, 255, 0.90)",
              backdropFilter: "blur(12px)",
              borderRadius: 20,
              padding: "60px 20px",
              textAlign: "center",
              fontSize: 16,
              fontWeight: 700,
              color: "#64748b",
            }}>
              Loading available microfinance programs...
            </div>
          ) : (
            <>
              {/* ═══════════════════════════════════════════════════
                  INSTITUTION SELECTOR TABS
              ═══════════════════════════════════════════════════ */}
              <div>
                <div style={{ fontSize: 13, fontWeight: 800, color: "#1e293b", textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 12 }}>
                  1. Select Financial Institution
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16 }}>
                  {banks.map(bank => {
                    const isSelected = selectedBankId === bank.id;
                    const count = allPrograms.filter(p => p.bank_id === bank.id).length;
                    return (
                      <div
                        key={bank.id}
                        onClick={() => {
                          setSelectedBankId(bank.id);
                          const progs = allPrograms.filter(p => p.bank_id === bank.id);
                          if (progs.length > 0) setSelectedProductId(progs[0].id);
                        }}
                        style={{
                          background: isSelected ? "linear-gradient(135deg, #ffffff 0%, #f0fdf4 100%)" : "rgba(255, 255, 255, 0.88)",
                          backdropFilter: "blur(12px)",
                          borderRadius: 18,
                          padding: "18px 22px",
                          border: isSelected ? "2px solid #059669" : "1.5px solid rgba(255, 255, 255, 0.9)",
                          boxShadow: isSelected ? "0 8px 25px rgba(5, 150, 105, 0.15)" : "0 4px 12px rgba(0,0,0,0.02)",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          gap: 16,
                          transition: "all 0.15s ease",
                        }}
                      >
                        <div style={{
                          width: 48,
                          height: 48,
                          borderRadius: 14,
                          background: isSelected ? "#059669" : "#e2e8f0",
                          color: isSelected ? "#fff" : "#475569",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                        }}>
                          {Ico.bank}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 16, fontWeight: 800, color: isSelected ? "#064e3b" : "#0f172a" }}>
                            {bank.name}
                          </div>
                          <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>
                            {count} Subsidized Credit Programs
                          </div>
                        </div>
                        {isSelected && (
                          <div style={{ width: 24, height: 24, borderRadius: "50%", background: "#059669", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            {Ico.check}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* ═══════════════════════════════════════════════════
                  PROGRAMS LIST & INTERACTIVE INSPECTOR / CALCULATOR
              ═══════════════════════════════════════════════════ */}
              <div style={{ display: "grid", gridTemplateColumns: "1.15fr 0.85fr", gap: 24, alignItems: "start" }}>

                {/* Left Column: Programs Grid */}
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  <div style={{ fontSize: 13, fontWeight: 800, color: "#1e293b", textTransform: "uppercase", letterSpacing: 0.8 }}>
                    2. Select Loan Type ({filteredProducts.length} Available)
                  </div>

                  {filteredProducts.map((product) => {
                    const isSelected = (selectedProductData?.id === product.id);
                    return (
                      <div
                        key={product.id}
                        onClick={() => setSelectedProductId(product.id)}
                        style={{
                          background: isSelected ? "#ffffff" : "rgba(255, 255, 255, 0.90)",
                          backdropFilter: "blur(12px)",
                          borderRadius: 20,
                          padding: "20px 24px",
                          border: isSelected ? "2.5px solid #059669" : "1.5px solid rgba(255, 255, 255, 0.9)",
                          boxShadow: isSelected ? "0 10px 30px rgba(5, 150, 105, 0.12)" : "0 4px 14px rgba(0,0,0,0.02)",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          gap: 18,
                          transition: "all 0.18s ease",
                        }}
                        onMouseEnter={e => {
                          if (!isSelected) {
                            e.currentTarget.style.transform = "translateX(4px)";
                            e.currentTarget.style.borderColor = "#86efac";
                          }
                        }}
                        onMouseLeave={e => {
                          if (!isSelected) {
                            e.currentTarget.style.transform = "";
                            e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.9)";
                          }
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: 16, flex: 1 }}>
                          <div style={{
                            width: 50,
                            height: 50,
                            borderRadius: 15,
                            background: isSelected ? "#dcfce7" : "#eef2ff",
                            color: isSelected ? "#059669" : "#4338ca",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                          }}>
                            {Ico.briefcase}
                          </div>
                          <div>
                            <div style={{ fontSize: 16, fontWeight: 800, color: "#0f172a", marginBottom: 3 }}>
                              {product.title}
                            </div>
                            <div style={{ fontSize: 12, color: "#64748b", lineHeight: 1.4 }}>
                              {product.subtitle}
                            </div>
                            <div style={{ display: "flex", gap: 8, marginTop: 8, flexWrap: "wrap" }}>
                              <span style={{ fontSize: 11, fontWeight: 700, color: "#047857", background: "#ecfdf5", padding: "3px 10px", borderRadius: 50 }}>
                                {product.apr} APR
                              </span>
                              <span style={{ fontSize: 11, fontWeight: 600, color: "#334151", background: "#f1f5f9", padding: "3px 10px", borderRadius: 50 }}>
                                Up to {product.limit}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div style={{ textAlign: "right", flexShrink: 0 }}>
                          <div style={{
                            background: isSelected ? "#059669" : "#f1f5f9",
                            color: isSelected ? "#fff" : "#475569",
                            padding: "6px 14px",
                            borderRadius: 50,
                            fontSize: 11,
                            fontWeight: 800,
                            letterSpacing: 0.5,
                            textTransform: "uppercase",
                          }}>
                            {product.tag}
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {filteredProducts.length === 0 && (
                    <div style={{ padding: "40px", textAlign: "center", background: "#fff", borderRadius: 18, color: "#64748b" }}>
                      No loan programs available for this institution.
                    </div>
                  )}
                </div>

                {/* Right Column: Selected Product Inspector & Quick EMI Calculator */}
                {selectedProductData && (
                  <div style={{
                    background: "rgba(255, 255, 255, 0.95)",
                    backdropFilter: "blur(16px)",
                    borderRadius: 22,
                    padding: "28px 30px",
                    border: "1.5px solid rgba(255, 255, 255, 0.9)",
                    boxShadow: "0 12px 35px rgba(0,0,0,0.06)",
                    position: "sticky",
                    top: "20px",
                    display: "flex",
                    flexDirection: "column",
                    gap: 20,
                  }}>
                    {/* Header */}
                    <div>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                        <span style={{ fontSize: 11, fontWeight: 800, color: "#059669", textTransform: "uppercase", letterSpacing: 1 }}>
                          {selectedProductData.tag}
                        </span>
                        <span style={{ fontSize: 12, fontWeight: 700, color: "#4338ca", background: "#eef2ff", padding: "3px 10px", borderRadius: 50 }}>
                          {Ico.shield} Fast Consensus
                        </span>
                      </div>
                      <h2 style={{ fontSize: 20, fontWeight: 900, color: "#0f172a", margin: "0 0 4px", letterSpacing: -0.4 }}>
                        {selectedProductData.title}
                      </h2>
                      <div style={{ fontSize: 12, color: "#64748b", lineHeight: 1.5 }}>
                        {selectedProductData.subtitle}
                      </div>
                    </div>

                    {/* Key Specs Matrix */}
                    <div style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: 10,
                      background: "#f8fafc",
                      padding: "16px",
                      borderRadius: 16,
                      border: "1px solid #e2e8f0",
                    }}>
                      <div>
                        <div style={{ fontSize: 10, color: "#94a3b8", fontWeight: 700, textTransform: "uppercase" }}>Interest Rate</div>
                        <div style={{ fontSize: 18, fontWeight: 900, color: "#059669", marginTop: 2 }}>{selectedProductData.apr}</div>
                        <div style={{ fontSize: 10, color: "#64748b" }}>Subsidized APR</div>
                      </div>
                      <div>
                        <div style={{ fontSize: 10, color: "#94a3b8", fontWeight: 700, textTransform: "uppercase" }}>Max Term</div>
                        <div style={{ fontSize: 18, fontWeight: 900, color: "#0f172a", marginTop: 2 }}>{selectedProductData.months}</div>
                        <div style={{ fontSize: 10, color: "#64748b" }}>Flexible Repayment</div>
                      </div>
                      <div style={{ gridColumn: "1 / -1", borderTop: "1px solid #e2e8f0", paddingTop: 10 }}>
                        <div style={{ fontSize: 10, color: "#94a3b8", fontWeight: 700, textTransform: "uppercase" }}>Loan Limit Bracket</div>
                        <div style={{ fontSize: 15, fontWeight: 800, color: "#0f172a", marginTop: 2 }}>{selectedProductData.limit}</div>
                      </div>
                    </div>

                    {/* Interactive Estimator Slider */}
                    <div style={{
                      background: "#f0fdf4",
                      border: "1.5px solid #bbf7d0",
                      borderRadius: 16,
                      padding: "16px 18px",
                    }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                        <span style={{ fontSize: 12, fontWeight: 800, color: "#064e3b" }}>Quick EMI Estimator</span>
                        <span style={{ fontSize: 14, fontWeight: 900, color: "#047857" }}>
                          Rs. {estimatedEmi.toLocaleString()} / mo
                        </span>
                      </div>

                      <div style={{ marginBottom: 10 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#166534", marginBottom: 4 }}>
                          <span>Sample Amount: Rs. {estAmount.toLocaleString()}</span>
                        </div>
                        <input
                          type="range"
                          min="10000"
                          max="200000"
                          step="5000"
                          value={estAmount}
                          onChange={e => setEstAmount(Number(e.target.value))}
                          style={{ width: "100%", accentColor: "#059669", cursor: "pointer" }}
                        />
                      </div>

                      <div style={{ display: "flex", gap: 6 }}>
                        {[12, 24, 36].map(m => (
                          <button
                            key={m}
                            onClick={() => setEstMonths(m)}
                            style={{
                              flex: 1,
                              padding: "5px 8px",
                              borderRadius: 8,
                              border: "1px solid",
                              borderColor: estMonths === m ? "#059669" : "#bbf7d0",
                              background: estMonths === m ? "#059669" : "#fff",
                              color: estMonths === m ? "#fff" : "#064e3b",
                              fontSize: 11,
                              fontWeight: 700,
                              cursor: "pointer",
                              fontFamily: "inherit",
                            }}
                          >
                            {m}M
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Features List */}
                    <div>
                      <div style={{ fontSize: 11, fontWeight: 800, color: "#64748b", textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 10 }}>
                        SmartGrama Benefits
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                        {(selectedProductData.features || ["No traditional collateral required", "Instant DID blockchain verification"]).map((f, i) => (
                          <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "#334151" }}>
                            <div style={{ width: 20, height: 20, borderRadius: "50%", background: "#dcfce7", color: "#059669", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                              {Ico.check}
                            </div>
                            <span>{f}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Apply Button */}
                    <button
                      onClick={() => navigate(`/apply?product=${selectedProductData.id}`)}
                      style={{
                        width: "100%",
                        padding: "15px 20px",
                        borderRadius: 14,
                        border: "none",
                        background: "linear-gradient(135deg, #059669 0%, #064e3b 100%)",
                        color: "#fff",
                        fontSize: 15,
                        fontWeight: 800,
                        cursor: "pointer",
                        fontFamily: "inherit",
                        boxShadow: "0 6px 20px rgba(5, 150, 105, 0.32)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 10,
                        transition: "transform 0.15s ease",
                      }}
                      onMouseEnter={e => e.currentTarget.style.transform = "translateY(-2px)"}
                      onMouseLeave={e => e.currentTarget.style.transform = ""}
                    >
                      Apply for {selectedProductData.title.split("(")[0].trim()}
                      {Ico.arrowRight}
                    </button>
                  </div>
                )}

              </div>
            </>
          )}

        </main>
      </div>
    </div>
  );
}