import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import { assessWelfare } from "../api/loanApi";

export default function WelfareApplication() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  
  const [form, setForm] = useState({
    nic: "198723456789",
    full_name: "Nimal Perera",
    gn_division: "Homagama - Division 542/A",
    family_size: "4",
    dependents_children: "2",
    elderly_count: "0",
    disabled_members: "0",
    monthly_income: "",
    monthly_expenses: "",
    house_ownership: "rented",
    electricity_units_monthly: "45",
  });

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async () => {
    if (!form.monthly_income || !form.monthly_expenses) {
      alert("Please fill in monthly income and expenses.");
      return;
    }

    setIsLoading(true);
    try {
      const payload = {
        nic: form.nic,
        full_name: form.full_name,
        gn_division: form.gn_division,
        family_size: Number(form.family_size),
        dependents_children: Number(form.dependents_children),
        elderly_count: Number(form.elderly_count),
        disabled_members: Number(form.disabled_members),
        monthly_income: Number(form.monthly_income),
        monthly_expenses: Number(form.monthly_expenses),
        house_ownership: form.house_ownership,
        electricity_units_monthly: Number(form.electricity_units_monthly),
        samurdhi_beneficiary: false,
      };

      const result = await assessWelfare(payload);
      
      navigate("/welfare-result", { state: { result } });
    } catch (error) {
      alert("Error processing welfare application.");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Header />
      <div style={{ paddingLeft: '40px', paddingTop: '16px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', fontSize: '13px', cursor: 'pointer' }} onClick={() => navigate(-1)}>
        <i className="fa-solid fa-arrow-left"></i>
        <span>Welfare Information</span>
      </div>

      <main className="content-container">
        <div className="dashboard-grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
          
          {/* Left Form */}
          <div className="card" style={{ padding: '32px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '8px' }}>Aswesuma Welfare Assessment</h2>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '24px' }}>Please fill in the demographic details to calculate your poverty score.</p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              
              <h3 style={{ fontSize: '14px', fontWeight: 'bold', color: 'var(--text-primary)', borderBottom: '1px solid var(--border)', paddingBottom: '8px' }}>Family & Dependents</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="input-group" style={{ marginBottom: 0 }}>
                  <label>Total Family Size</label>
                  <input type="number" name="family_size" className="form-input" value={form.family_size} onChange={handleChange} />
                </div>
                <div className="input-group" style={{ marginBottom: 0 }}>
                  <label>Children Dependents</label>
                  <input type="number" name="dependents_children" className="form-input" value={form.dependents_children} onChange={handleChange} />
                </div>
                <div className="input-group" style={{ marginBottom: 0 }}>
                  <label>Elderly Members (&gt;65)</label>
                  <input type="number" name="elderly_count" className="form-input" value={form.elderly_count} onChange={handleChange} />
                </div>
                <div className="input-group" style={{ marginBottom: 0 }}>
                  <label>Disabled Members</label>
                  <input type="number" name="disabled_members" className="form-input" value={form.disabled_members} onChange={handleChange} />
                </div>
              </div>

              <h3 style={{ fontSize: '14px', fontWeight: 'bold', color: 'var(--text-primary)', borderBottom: '1px solid var(--border)', paddingBottom: '8px', marginTop: '8px' }}>Financials & Assets</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="input-group" style={{ marginBottom: 0 }}>
                  <label>Monthly Income (Rs.) *</label>
                  <input type="number" name="monthly_income" className="form-input" value={form.monthly_income} onChange={handleChange} required />
                </div>
                <div className="input-group" style={{ marginBottom: 0 }}>
                  <label>Monthly Expenses (Rs.) *</label>
                  <input type="number" name="monthly_expenses" className="form-input" value={form.monthly_expenses} onChange={handleChange} required />
                </div>
                <div className="input-group" style={{ marginBottom: 0 }}>
                  <label>House Ownership</label>
                  <select name="house_ownership" className="form-input" value={form.house_ownership} onChange={handleChange}>
                    <option value="rented">Rented / Leased</option>
                    <option value="own_temporary">Owned (Temporary Structure)</option>
                    <option value="own_permanent">Owned (Permanent Structure)</option>
                  </select>
                </div>
                <div className="input-group" style={{ marginBottom: 0 }}>
                  <label>Electricity Usage (Units)</label>
                  <input type="number" name="electricity_units_monthly" className="form-input" value={form.electricity_units_monthly} onChange={handleChange} />
                </div>
              </div>
              
              <div style={{ padding: '16px', background: '#dcfce7', borderRadius: '8px', border: '1px solid #86efac', marginTop: '8px' }}>
                <div style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--success)', marginBottom: '4px' }}>Aswesuma Eligibility Note</div>
                <div style={{ fontSize: '13px', color: '#166534' }}>Your final score determines the welfare tier (Transitional, Vulnerable, Poor, Severely Impoverished).</div>
              </div>
              
              <button 
                className={`primary-btn full-width ${isLoading ? "loading" : ""}`} 
                onClick={handleSubmit}
                disabled={isLoading}
                style={{ padding: '16px', borderRadius: '8px', fontSize: '15px', background: 'var(--success)', border: 'none' }}
              >
                {isLoading ? "Running Assessment..." : "Submit Application"}
              </button>
            </div>
          </div>

          {/* Right EMI Card (Welfare Amount) */}
          <div style={{ height: 'fit-content', position: 'sticky', top: '100px' }}>
            <div style={{ background: '#dcfce7', borderRadius: 'var(--radius-lg)', padding: '48px 40px', border: '1px solid #86efac' }}>
              <div style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--success)', letterSpacing: '0.5px', marginBottom: '8px' }}>POTENTIAL SUPPORT AMOUNT</div>
              <div style={{ fontSize: '40px', fontWeight: 'bold', color: 'var(--success)', marginBottom: '8px' }}>Up to Rs. 15,000</div>
              <div style={{ fontSize: '13px', color: '#166534', marginBottom: '40px' }}>Monthly stipend based on poverty score</div>
              
              <div style={{ borderTop: '1px solid #86efac', paddingTop: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#166534' }}>
                  <span>Severely Impoverished (Tier 1)</span>
                  <span style={{ fontWeight: 'bold', color: 'var(--text-primary)' }}>Rs. 15,000</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#166534' }}>
                  <span>Poor (Tier 2)</span>
                  <span style={{ fontWeight: 'bold', color: 'var(--text-primary)' }}>Rs. 8,500</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#166534' }}>
                  <span>Vulnerable (Tier 3)</span>
                  <span style={{ fontWeight: 'bold', color: 'var(--text-primary)' }}>Rs. 4,500</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#166534' }}>
                  <span>Transitional (Tier 4)</span>
                  <span style={{ fontWeight: 'bold', color: 'var(--text-primary)' }}>Rs. 2,500</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </main>
    </>
  );
}
