import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Header from "../components/Header";
import { predictLoan } from "../api/loanApi";
import { loanProducts } from "../data/loanProducts";
import { getCurrentUser } from "../utils/user";

export default function LoanApplication() {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const user = getCurrentUser();

  // Read the selected product from URL params or location state
  const queryParams = new URLSearchParams(location.search);
  const selectedLoanKey = queryParams.get("product") || location.state?.loanType || "below_25000";
  const selectedProduct = loanProducts[selectedLoanKey] || loanProducts["below_25000"];

  const [isLoading, setIsLoading] = useState(false);
  const [form, setForm] = useState({
    loan_amount: selectedProduct.defaultAmount.toString(),
    repayment_months: selectedProduct.defaultMonths.toString(),
    monthly_income: "",
    other_income: "0",
    expenses: "",
    savings_balance: "",
    existing_loans: "0",
    repayment_history: "1",
    guarantor_support_count: "1",
  });

  const [emi, setEmi] = useState(0);
  
  const [selectedBank, setSelectedBank] = useState("BOC");
  const banks = [
    { id: "SAMUPAKARA", name: "SAMUPAKARA BANK" },
    { id: "SAMURDHI", name: "Samurdhi Bank" }
  ];

  // Live EMI Calculator
  useEffect(() => {
    const P = parseFloat(form.loan_amount) || 0;
    const r = (selectedProduct.interestRate) / 12 / 100;
    const n = parseInt(form.repayment_months) || 0;

    if (P > 0 && r > 0 && n > 0) {
      const calculatedEmi = (P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
      setEmi(Math.round(calculatedEmi));
    } else {
      setEmi(0);
    }
  }, [form.loan_amount, form.repayment_months, selectedProduct.interestRate]);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const submitApplication = async () => {
    if (!form.monthly_income || !form.expenses || !form.savings_balance) {
      alert("Please fill out all required financial fields.");
      return;
    }

    setIsLoading(true);
    try {
      const loanData = {
        monthly_income: Number(form.monthly_income),
        other_income: Number(form.other_income),
        expenses: Number(form.expenses),
        loan_amount: Number(form.loan_amount),
        loan_type: selectedProduct.title,
        savings_balance: Number(form.savings_balance),
        existing_loans: Number(form.existing_loans),
        repayment_history: Number(form.repayment_history),
        guarantor_support_count: Number(form.guarantor_support_count),
      };

      const prediction = await predictLoan(loanData);
      
      navigate("/loan-result", {
        state: {
          prediction,
          application: {
            ...form,
            loan_title: selectedProduct.title,
            interest_rate: selectedProduct.interestRate,
            nic: user?.nic || "200223003053",
            fullName: user?.name || "Aravinda Kumara",
            did: user?.did || "did:smartgrama:prototype:001"
          },
        },
      });
    } catch (error) {
      alert("Error processing loan. Please try again.");
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
        <span>{t("back_to_programs")}</span>
      </div>
      
      <main className="content-container flex flex-col gap-8">
        
        <div style={{ padding: '0 40px' }}>
          <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--text-primary)' }}>{t("apply_for_title", { title: selectedProduct.title })}</h2>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginTop: '4px' }}>{t("loan_form_desc")}</p>
        </div>

        <div className="dashboard-grid" style={{ gridTemplateColumns: '1fr 350px', gap: '32px' }}>
          
          {/* Left Form */}
          <div className="card" style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '32px' }}>
            
            {/* Step 1: Loan Requirements */}
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: 'bold', borderBottom: '1px solid var(--border)', paddingBottom: '8px', marginBottom: '16px' }}>{t("step1_loan_req")}</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="input-group" style={{ marginBottom: 0 }}>
                  <label>{t("loan_amount_lkr")}</label>
                  <input
                    type="number"
                    name="loan_amount"
                    className="form-input"
                    value={form.loan_amount}
                    onChange={handleChange}
                  />
                  <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px' }}>{t("limit_range", { min: selectedProduct.min, max: selectedProduct.max })}</div>
                </div>
                <div className="input-group" style={{ marginBottom: 0 }}>
                  <label>{t("duration_months")}</label>
                  <input
                    type="number"
                    name="repayment_months"
                    className="form-input"
                    value={form.repayment_months}
                    onChange={handleChange}
                  />
                  <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px' }}>{t("max_months", { max: selectedProduct.maxMonths })}</div>
                </div>
              </div>
            </div>

            {/* Step 2: Financial Profile */}
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: 'bold', borderBottom: '1px solid var(--border)', paddingBottom: '8px', marginBottom: '16px' }}>{t("step2_financial_profile")}</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="input-group" style={{ marginBottom: 0 }}>
                  <label>{t("monthly_income_req")}</label>
                  <input
                    type="number"
                    name="monthly_income"
                    className="form-input"
                    value={form.monthly_income}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="input-group" style={{ marginBottom: 0 }}>
                  <label>{t("other_income_label")}</label>
                  <input
                    type="number"
                    name="other_income"
                    className="form-input"
                    value={form.other_income}
                    onChange={handleChange}
                  />
                </div>
                <div className="input-group" style={{ marginBottom: 0 }}>
                  <label>{t("monthly_expenses_req")}</label>
                  <input
                    type="number"
                    name="expenses"
                    className="form-input"
                    value={form.expenses}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="input-group" style={{ marginBottom: 0 }}>
                  <label>{t("savings_balance_req")}</label>
                  <input
                    type="number"
                    name="savings_balance"
                    className="form-input"
                    value={form.savings_balance}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="input-group" style={{ marginBottom: 0 }}>
                  <label>{t("existing_active_loans")}</label>
                  <select name="existing_loans" className="form-input" value={form.existing_loans} onChange={handleChange}>
                    <option value="0">{t("no_active_loans")}</option>
                    <option value="1">1</option>
                    <option value="2">2+</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Step 3: Guarantor & Credit */}
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: 'bold', borderBottom: '1px solid var(--border)', paddingBottom: '8px', marginBottom: '16px' }}>{t("step3_guarantor_credit")}</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="input-group" style={{ marginBottom: 0 }}>
                  <label>{t("guarantor_support_count")}</label>
                  <select name="guarantor_support_count" className="form-input" value={form.guarantor_support_count} onChange={handleChange}>
                    <option value="0">{t("no_guarantors")}</option>
                    <option value="1">{t("one_guarantor")}</option>
                    <option value="2">{t("multiple_guarantors")}</option>
                  </select>
                </div>
                <div className="input-group" style={{ marginBottom: 0, gridColumn: 'span 2' }}>
                  <label>{t("prior_repayment_history")}</label>
                  <select name="repayment_history" className="form-input" value={form.repayment_history} onChange={handleChange}>
                    <option value="1">{t("repayment_good")}</option>
                    <option value="0">{t("repayment_poor")}</option>
                  </select>
                </div>
              </div>
            </div>

            <button 
              className={`primary-btn full-width ${isLoading ? "loading" : ""}`} 
              onClick={submitApplication}
              disabled={isLoading}
              style={{ padding: '16px', borderRadius: '8px', fontSize: '15px', marginTop: '16px' }}
            >
              {isLoading ? t("running_ai_eval") : t("submit_loan_app")}
            </button>
            
          </div>

          {/* Right EMI Card (Sticky) */}
          <div style={{ height: 'fit-content', position: 'sticky', top: '100px' }}>
            <div style={{ background: 'var(--primary-light)', borderRadius: 'var(--radius-lg)', padding: '40px 32px', border: '1px solid #d8b4fe' }}>
              <div style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--text-secondary)', letterSpacing: '0.5px', marginBottom: '8px' }}>{t("estimated_monthly_emi")}</div>
              <div style={{ fontSize: '40px', fontWeight: 'bold', color: 'var(--primary)', marginBottom: '8px' }}>Rs. {emi.toLocaleString()}</div>
              <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '40px' }}>{t("interest_rate")}: {selectedProduct.interestRate}% APR</div>
              
              <div style={{ borderTop: '1px solid #d8b4fe', paddingTop: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: 'var(--text-secondary)' }}>
                  <span>{t("principal")}</span>
                  <span style={{ fontWeight: 'bold', color: 'var(--text-primary)' }}>Rs. {Number(form.loan_amount).toLocaleString()}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: 'var(--text-secondary)' }}>
                  <span>{t("total_repayment")}</span>
                  <span style={{ fontWeight: 'bold', color: 'var(--text-primary)' }}>Rs. {(emi * Number(form.repayment_months)).toLocaleString()}</span>
                </div>
              </div>
            </div>
            
            <div style={{ background: '#dcfce7', borderRadius: 'var(--radius-lg)', padding: '24px', marginTop: '16px', border: '1px solid #bbf7d0', display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
               <i className="fa-solid fa-shield-halved text-green-600 mt-1"></i>
               <div style={{ fontSize: '12px', color: 'var(--success)' }}>
                 <strong>{t("blockchain_protected")}:</strong> {t("blockchain_protected_desc")}
               </div>
            </div>
          </div>

        </div>
      </main>
    </>
  );
}