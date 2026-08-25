import { useState, useEffect } from "react";

export default function ManagePrograms() {
  const [banks, setBanks] = useState([]);
  const [programs, setPrograms] = useState([]);
  
  const [newBankName, setNewBankName] = useState("");
  
  const [newProgram, setNewProgram] = useState({
    bank_id: "",
    title: "",
    subtitle: "",
    tag: "",
    tagColor: 0xFF4CAF50, // default green
    apr: "",
    limit: "",
    months: "",
    features: ""
  });

  const fetchData = () => {
    fetch("http://127.0.0.1:8000/banks")
      .then(res => res.json())
      .then(setBanks);
      
    fetch("http://127.0.0.1:8000/loan-programs")
      .then(res => res.json())
      .then(setPrograms);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddBank = async (e) => {
    e.preventDefault();
    if (!newBankName) return;
    
    await fetch("http://127.0.0.1:8000/banks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newBankName })
    });
    setNewBankName("");
    fetchData();
  };

  const handleDeleteBank = async (bankId) => {
    if (!window.confirm("Are you sure you want to delete this bank? All associated loan programs will also be deleted.")) return;
    
    await fetch(`http://127.0.0.1:8000/banks/${bankId}`, {
      method: "DELETE"
    });
    fetchData();
  };

  const handleAddProgram = async (e) => {
    e.preventDefault();
    if (!newProgram.bank_id || !newProgram.title) return;
    
    const payload = {
      ...newProgram,
      features: newProgram.features.split(",").map(f => f.trim()).filter(f => f),
      tagColor: parseInt(newProgram.tagColor) || 0xFF4CAF50
    };
    
    await fetch("http://127.0.0.1:8000/loan-programs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    
    setNewProgram({
      bank_id: "", title: "", subtitle: "", tag: "", tagColor: 0xFF4CAF50, apr: "", limit: "", months: "", features: ""
    });
    fetchData();
  };

  const handleDeleteProgram = async (programId) => {
    if (!window.confirm("Are you sure you want to delete this loan program?")) return;
    
    await fetch(`http://127.0.0.1:8000/loan-programs/${programId}`, {
      method: "DELETE"
    });
    fetchData();
  };

  return (
    <div style={{ padding: '40px 20px' }}>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '24px' }}>
        
        {/* BANK MANAGEMENT */}
        <div>
          <div className="card" style={{ padding: '24px', backgroundColor: 'white', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', marginBottom: '24px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '16px' }}>Add New Bank</h3>
            <form onSubmit={handleAddBank}>
              <div style={{ marginBottom: '16px' }}>
                <input 
                  type="text" 
                  value={newBankName}
                  onChange={e => setNewBankName(e.target.value)}
                  style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #d1d5db' }}
                  placeholder="e.g. BOC Bank"
                  required
                />
              </div>
              <button type="submit" style={{ width: '100%', backgroundColor: '#1e40af', color: 'white', padding: '12px', borderRadius: '8px', fontWeight: 'bold', border: 'none', cursor: 'pointer' }}>
                <i className="fa-solid fa-plus" style={{ marginRight: '8px' }}></i> Add Bank
              </button>
            </form>
          </div>

          <div className="card" style={{ padding: '24px', backgroundColor: 'white', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '16px' }}>Registered Banks</h3>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {banks.map(b => (
                <li key={b.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', backgroundColor: '#f9fafb', marginBottom: '8px', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
                  <div>
                    <strong style={{ display: 'block', fontSize: '15px' }}>{b.name}</strong> 
                    <span style={{ color: '#6b7280', fontSize: '12px', fontFamily: 'monospace' }}>ID: {b.id}</span>
                  </div>
                  <button 
                    onClick={() => handleDeleteBank(b.id)}
                    style={{ background: '#fee2e2', color: '#dc2626', border: 'none', width: '32px', height: '32px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    title="Delete Bank"
                  >
                    <i className="fa-solid fa-trash"></i>
                  </button>
                </li>
              ))}
              {banks.length === 0 && <p style={{ color: '#6b7280', fontSize: '14px' }}>No banks registered.</p>}
            </ul>
          </div>
        </div>

        {/* LOAN PROGRAM MANAGEMENT */}
        <div>
          <div className="card" style={{ padding: '24px', backgroundColor: 'white', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', marginBottom: '24px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '16px' }}>Add New Loan Program</h3>
            <form onSubmit={handleAddProgram} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ display: 'block', fontSize: '14px', color: '#4b5563', marginBottom: '8px' }}>Select Bank</label>
                <select 
                  value={newProgram.bank_id}
                  onChange={e => setNewProgram({...newProgram, bank_id: e.target.value})}
                  style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #d1d5db', backgroundColor: '#f9fafb' }}
                  required
                >
                  <option value="">-- Choose a Bank --</option>
                  {banks.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                </select>
              </div>

              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ display: 'block', fontSize: '14px', color: '#4b5563', marginBottom: '8px' }}>Loan Title</label>
                <input type="text" value={newProgram.title} onChange={e => setNewProgram({...newProgram, title: e.target.value})} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #d1d5db' }} required />
              </div>
              
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ display: 'block', fontSize: '14px', color: '#4b5563', marginBottom: '8px' }}>Subtitle / Description</label>
                <input type="text" value={newProgram.subtitle} onChange={e => setNewProgram({...newProgram, subtitle: e.target.value})} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #d1d5db' }} required />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '14px', color: '#4b5563', marginBottom: '8px' }}>Interest Rate (APR)</label>
                <input type="text" value={newProgram.apr} onChange={e => setNewProgram({...newProgram, apr: e.target.value})} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #d1d5db' }} required placeholder="e.g. 15%" />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '14px', color: '#4b5563', marginBottom: '8px' }}>Duration</label>
                <input type="text" value={newProgram.months} onChange={e => setNewProgram({...newProgram, months: e.target.value})} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #d1d5db' }} required placeholder="e.g. 36 months" />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '14px', color: '#4b5563', marginBottom: '8px' }}>Loan Limit</label>
                <input type="text" value={newProgram.limit} onChange={e => setNewProgram({...newProgram, limit: e.target.value})} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #d1d5db' }} required placeholder="e.g. Rs. 10k - 50k" />
              </div>
              
              <div>
                <label style={{ display: 'block', fontSize: '14px', color: '#4b5563', marginBottom: '8px' }}>Badge Tag</label>
                <input type="text" value={newProgram.tag} onChange={e => setNewProgram({...newProgram, tag: e.target.value})} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #d1d5db' }} required placeholder="e.g. Certified" />
              </div>

              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ display: 'block', fontSize: '14px', color: '#4b5563', marginBottom: '8px' }}>Key Features (Comma separated)</label>
                <input type="text" value={newProgram.features} onChange={e => setNewProgram({...newProgram, features: e.target.value})} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #d1d5db' }} required />
              </div>

              <div style={{ gridColumn: '1 / -1', marginTop: '8px' }}>
                <button type="submit" style={{ width: '100%', backgroundColor: '#10b981', color: 'white', padding: '14px', borderRadius: '8px', fontWeight: 'bold', border: 'none', cursor: 'pointer', fontSize: '16px' }}>
                  <i className="fa-solid fa-plus" style={{ marginRight: '8px' }}></i> Create Loan Program
                </button>
              </div>
            </form>
          </div>

          <div className="card" style={{ padding: '24px', backgroundColor: 'white', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '16px' }}>Active Loan Programs</h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {programs.map(p => (
                <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '20px', backgroundColor: '#f9fafb', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <strong style={{ fontSize: '16px', color: '#1f2937' }}>{p.title}</strong>
                      <span style={{ fontSize: '11px', backgroundColor: '#dbeafe', color: '#1e40af', padding: '2px 8px', borderRadius: '12px', fontWeight: 'bold' }}>
                        {banks.find(b => b.id === p.bank_id)?.name || 'Unknown Bank'}
                      </span>
                    </div>
                    <div style={{ fontSize: '13px', color: '#6b7280', marginBottom: '12px' }}>{p.subtitle}</div>
                    
                    <div style={{ display: 'flex', gap: '16px', fontSize: '12px', color: '#4b5563' }}>
                      <span><i className="fa-solid fa-percent" style={{ color: '#10b981' }}></i> {p.apr}</span>
                      <span><i className="fa-solid fa-money-bill" style={{ color: '#10b981' }}></i> {p.limit}</span>
                      <span><i className="fa-solid fa-calendar" style={{ color: '#10b981' }}></i> {p.months}</span>
                    </div>
                  </div>
                  
                  <button 
                    onClick={() => handleDeleteProgram(p.id)}
                    style={{ background: '#fee2e2', color: '#dc2626', border: 'none', width: '36px', height: '36px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    title="Delete Program"
                  >
                    <i className="fa-solid fa-trash"></i>
                  </button>
                </div>
              ))}
              {programs.length === 0 && <p style={{ color: '#6b7280', fontSize: '14px' }}>No loan programs found.</p>}
            </div>
          </div>
        </div>
        
      </div>
    </div>
  );
}
