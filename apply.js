// ============================================================
// apply.js – Multi-step loan application logic
// ============================================================

let currentStep = 1;
const TOTAL_STEPS = 5;

// ─── EMI live calculator ─────────────────────────────────────
['loan_amount', 'interest_rate', 'repayment_months'].forEach(id => {
  const el = document.getElementById(id);
  if (el) el.addEventListener('input', calcEMI);
});

function calcEMI() {
  const P = parseFloat(document.getElementById('loan_amount').value) || 0;
  const r = (parseFloat(document.getElementById('interest_rate').value) || 0) / 12 / 100;
  const n = parseInt(document.getElementById('repayment_months').value) || 0;
  const preview = document.getElementById('emiPreview');
  if (!preview) return;
  if (P > 0 && r > 0 && n > 0) {
    const emi = (P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    preview.innerHTML = `<i class="fa-solid fa-calculator"></i> Estimated Monthly EMI: <strong>Rs. ${fmt(emi)}</strong> &nbsp;|&nbsp; Total Payable: <strong>Rs. ${fmt(emi * n)}</strong>`;
  } else {
    preview.innerHTML = `<i class="fa-solid fa-calculator"></i> Fill in the loan amount, rate and period to see your estimated monthly EMI.`;
  }
}

function fmt(n) {
  return Math.round(n).toLocaleString('en-LK');
}

// ─── Navigation ──────────────────────────────────────────────
function nextStep(from) {
  if (!validateStep(from)) return;
  goToStep(from + 1);
}

function prevStep(from) {
  goToStep(from - 1);
}

function goToStep(num) {
  document.getElementById(`step${currentStep}`).classList.remove('active');
  document.getElementById(`si${currentStep}`).classList.remove('active');
  document.getElementById(`si${currentStep}`).classList.add('done');
  if (num < currentStep) {
    // going back: remove done from future steps
    for (let i = num; i <= currentStep; i++) {
      document.getElementById(`si${i}`).classList.remove('done', 'active');
    }
  }
  // Update lines
  updateLines();
  currentStep = num;
  const stepEl = document.getElementById(`step${currentStep}`);
  const siEl = document.getElementById(`si${currentStep}`);
  if (stepEl) stepEl.classList.add('active');
  if (siEl) { siEl.classList.add('active'); siEl.classList.remove('done'); }

  if (currentStep === 5) buildReview();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function updateLines() {
  const lines = document.querySelectorAll('.si-line');
  lines.forEach((line, i) => {
    if (i < currentStep - 1) line.classList.add('done');
    else line.classList.remove('done');
  });
}

// ─── Validation ──────────────────────────────────────────────
function validateStep(step) {
  let valid = true;
  if (step === 1) {
    valid = requireField('membership_id', 'Membership ID is required') &&
            requireField('full_name', 'Full name is required') &&
            requireNIC('nic') &&
            requireField('dob', 'Date of birth is required') &&
            requireField('mobile', 'Mobile number is required') &&
            requireField('address', 'Address is required');
  } else if (step === 2) {
    valid = requireField('share_amount', 'Share amount is required') &&
            requireField('loan_type', 'Loan type is required') &&
            requireField('loan_amount', 'Loan amount is required') &&
            requireField('interest_rate', 'Interest rate is required') &&
            requireField('loan_date', 'Loan date is required') &&
            requireField('repayment_months', 'Repayment period is required') &&
            requireField('loan_reason', 'Reason for loan is required');
  } else if (step === 3) {
    valid = requireField('job', 'Job/Occupation is required') &&
            requireField('main_income', 'Main income is required') &&
            requireField('annual_expenses', 'Annual expenses is required') &&
            requireField('saving_acc', 'Savings account number is required') &&
            requireField('saving_date', 'Savings account date is required');
  } else if (step === 4) {
    valid = requireField('guar_acc', 'Guarantor account is required') &&
            requireField('guar_name', 'Guarantor name is required') &&
            requireNIC('guar_nic') &&
            requireField('guar_job', 'Guarantor job is required') &&
            requireField('guar_income', 'Guarantor income is required');
  }
  return valid;
}

function requireField(id, msg) {
  const el = document.getElementById(id);
  if (!el) return true;
  const errEl = document.getElementById('err_' + id);
  if (!el.value.trim()) {
    el.style.borderColor = 'var(--danger)';
    if (errEl) errEl.textContent = msg;
    return false;
  }
  el.style.borderColor = '';
  if (errEl) errEl.textContent = '';
  return true;
}

function requireNIC(id) {
  const el = document.getElementById(id);
  if (!el) return true;
  const val = el.value.trim();
  const errEl = document.getElementById('err_' + id);
  if (!val) {
    el.style.borderColor = 'var(--danger)';
    if (errEl) errEl.textContent = 'NIC is required.';
    return false;
  }
  if (!/^(\d{9}[VXvx]|\d{12})$/.test(val)) {
    el.style.borderColor = 'var(--danger)';
    if (errEl) errEl.textContent = 'Enter a valid NIC (e.g. 199012345678 or 901234567V).';
    return false;
  }
  el.style.borderColor = '';
  if (errEl) errEl.textContent = '';
  return true;
}

function gv(id) {
  const el = document.getElementById(id);
  return el ? el.value.trim() : '—';
}

// ─── Build Review ────────────────────────────────────────────
function buildReview() {
  const grid = document.getElementById('reviewGrid');
  if (!grid) return;

  const sections = [
    {
      title: '👤 Personal Details', icon: 'fa-user',
      rows: [
        ['Membership ID', gv('membership_id')],
        ['Full Name', gv('full_name')],
        ['NIC', gv('nic')],
        ['Date of Birth', gv('dob')],
        ['Mobile', gv('mobile')],
        ['Email', gv('email')],
        ['Address', gv('address')]
      ]
    },
    {
      title: '💰 Loan Details', icon: 'fa-sack-dollar',
      rows: [
        ['Share Amount', 'Rs. ' + (parseFloat(gv('share_amount')) || 0).toLocaleString('en-LK')],
        ['Loan Type', gv('loan_type')],
        ['Loan Amount', 'Rs. ' + (parseFloat(gv('loan_amount')) || 0).toLocaleString('en-LK')],
        ['Interest Rate', gv('interest_rate') + '% p.a.'],
        ['Loan Date', gv('loan_date')],
        ['Repayment Period', gv('repayment_months') + ' months'],
        ['Reason', gv('loan_reason')]
      ]
    },
    {
      title: '📊 Financial Info', icon: 'fa-chart-pie',
      rows: [
        ['Job', gv('job')],
        ['Main Annual Income', 'Rs. ' + (parseFloat(gv('main_income')) || 0).toLocaleString('en-LK')],
        ['Other Income', 'Rs. ' + (parseFloat(gv('other_income')) || 0).toLocaleString('en-LK')],
        ['Annual Expenses', 'Rs. ' + (parseFloat(gv('annual_expenses')) || 0).toLocaleString('en-LK')],
        ['Savings Account', gv('saving_acc')],
        ['Account Opened', gv('saving_date')],
        ['Assets', gv('assets') || '—']
      ]
    },
    {
      title: '🤝 Guarantor Details', icon: 'fa-people-arrows',
      rows: [
        ['Guarantor Account', gv('guar_acc')],
        ['Guarantor Name', gv('guar_name')],
        ['Guarantor NIC', gv('guar_nic')],
        ['Guarantor Job', gv('guar_job')],
        ['Annual Income', 'Rs. ' + (parseFloat(gv('guar_income')) || 0).toLocaleString('en-LK')],
        ['Annual Expenses', 'Rs. ' + (parseFloat(gv('guar_expenses')) || 0).toLocaleString('en-LK')],
        ['Existing Loans', gv('guar_existing_loans')],
        ['Loan Amount', 'Rs. ' + (parseFloat(gv('guar_loan_amount')) || 0).toLocaleString('en-LK')],
        ['Loan Balance', 'Rs. ' + (parseFloat(gv('guar_loan_balance')) || 0).toLocaleString('en-LK')],
        ['Account Opened', gv('guar_acc_date')],
        ['Account Balance', 'Rs. ' + (parseFloat(gv('guar_acc_balance')) || 0).toLocaleString('en-LK')]
      ]
    }
  ];

  grid.innerHTML = sections.map((s, idx) => `
    <div class="review-section">
      <h4><i class="fa-solid ${s.icon}"></i> ${s.title}</h4>
      ${s.rows.map(([label, val]) => `
        <div class="review-row">
          <span class="rv-label">${label}</span>
          <span class="rv-val">${val || '—'}</span>
        </div>
      `).join('')}
    </div>
  `).join('');
}

// ─── Submit ──────────────────────────────────────────────────
document.getElementById('loanForm').addEventListener('submit', function (e) {
  e.preventDefault();
  if (!document.getElementById('declare').checked) {
    alert('Please confirm the declaration to submit.');
    return;
  }

  const apps = DB.getApplications();
  const refId = 'LOAN-' + Date.now().toString().slice(-8);

  const newApp = {
    refId,
    membershipId: gv('membership_id'),
    fullName: gv('full_name'),
    nic: gv('nic'),
    dob: gv('dob'),
    mobile: gv('mobile'),
    email: gv('email'),
    address: gv('address'),
    shareAmount: gv('share_amount'),
    loanType: gv('loan_type'),
    loanAmount: gv('loan_amount'),
    interestRate: gv('interest_rate'),
    loanDate: gv('loan_date'),
    repaymentMonths: gv('repayment_months'),
    reason: gv('loan_reason'),
    job: gv('job'),
    mainIncome: gv('main_income'),
    otherIncome: gv('other_income'),
    annualExpenses: gv('annual_expenses'),
    savingAcc: gv('saving_acc'),
    savingDate: gv('saving_date'),
    assets: gv('assets'),
    guarantorAcc: gv('guar_acc'),
    guarantorName: gv('guar_name'),
    guarantorNic: gv('guar_nic'),
    guarantorJob: gv('guar_job'),
    guarantorIncome: gv('guar_income'),
    guarantorExpenses: gv('guar_expenses'),
    guarantorExistingLoans: gv('guar_existing_loans'),
    guarantorLoanAmount: gv('guar_loan_amount'),
    guarantorLoanBalance: gv('guar_loan_balance'),
    guarantorAccDate: gv('guar_acc_date'),
    guarantorAccBalance: gv('guar_acc_balance'),
    submittedAt: new Date().toISOString().slice(0, 10),
    status: 'Pending'
  };

  DB.addApplication(newApp);
  document.getElementById('loanForm').style.display = 'none';
  document.querySelector('.step-indicator').style.display = 'none';
  document.getElementById('loanRefId').textContent = refId;
  document.getElementById('loanSuccess').style.display = 'block';
  window.scrollTo({ top: 0, behavior: 'smooth' });
});
