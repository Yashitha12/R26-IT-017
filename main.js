// ============================================================
// main.js – Shared utilities
// ============================================================

// Navbar scroll effect
const navbar = document.getElementById('navbar');
if (navbar) {
  window.addEventListener('scroll', () => {
    navbar.style.boxShadow = window.scrollY > 10 ? '0 4px 24px rgba(0,0,0,0.22)' : '';
  });
}

// Hamburger menu
const hamburger = document.getElementById('hamburger');
const navLinks = document.getElementById('navLinks');
if (hamburger && navLinks) {
  hamburger.addEventListener('click', () => {
    navLinks.classList.toggle('open');
    hamburger.classList.toggle('open');
  });
  document.addEventListener('click', (e) => {
    if (!hamburger.contains(e.target) && !navLinks.contains(e.target)) {
      navLinks.classList.remove('open');
    }
  });
}

// Password toggle
function togglePw(id, btn) {
  const inp = document.getElementById(id);
  const icon = btn.querySelector('i');
  if (!inp) return;
  if (inp.type === 'password') {
    inp.type = 'text';
    icon.classList.replace('fa-eye', 'fa-eye-slash');
  } else {
    inp.type = 'password';
    icon.classList.replace('fa-eye-slash', 'fa-eye');
  }
}

// LocalStorage helpers
const DB = {
  getMembers() { return JSON.parse(localStorage.getItem('fe_members') || '[]'); },
  saveMembers(m) { localStorage.setItem('fe_members', JSON.stringify(m)); },
  getApplications() { return JSON.parse(localStorage.getItem('fe_applications') || '[]'); },
  saveApplications(a) { localStorage.setItem('fe_applications', JSON.stringify(a)); },
  addMember(m) { const arr = DB.getMembers(); arr.push(m); DB.saveMembers(arr); },
  addApplication(a) { const arr = DB.getApplications(); arr.push(a); DB.saveApplications(arr); },
  updateApplication(refId, updates) {
    const arr = DB.getApplications();
    const idx = arr.findIndex(a => a.refId === refId);
    if (idx !== -1) { arr[idx] = { ...arr[idx], ...updates }; DB.saveApplications(arr); return true; }
    return false;
  }
};

// Seed some demo data if empty
(function seedDemo() {
  if (DB.getMembers().length === 0) {
    DB.addMember({
      memberId: 'MEM-00001',
      name: 'Kamal Perera',
      nic: '199012345678',
      mobile: '0771234567',
      email: 'kamal@example.com',
      address: '12, Galle Road, Colombo 06',
      district: 'Colombo',
      occupation: 'Government Teacher',
      username: 'kamal',
      registeredAt: '2025-01-15'
    });
    DB.addMember({
      memberId: 'MEM-00002',
      name: 'Nimal Silva',
      nic: '198756789012',
      mobile: '0779876543',
      email: 'nimal@example.com',
      address: '45, Main Street, Gampaha',
      district: 'Gampaha',
      occupation: 'Farmer',
      username: 'nimal',
      registeredAt: '2025-03-20'
    });
  }
  if (DB.getApplications().length === 0) {
    DB.addApplication({
      refId: 'LOAN-20250001',
      membershipId: 'MEM-00001',
      fullName: 'Kamal Perera',
      nic: '199012345678',
      mobile: '0771234567',
      loanType: 'Housing Loan',
      loanAmount: '500000',
      shareAmount: '75000',
      interestRate: '8.5',
      loanDate: '2025-06-01',
      repaymentMonths: '60',
      reason: 'Home renovation',
      job: 'Government Teacher',
      mainIncome: '720000',
      otherIncome: '120000',
      annualExpenses: '400000',
      savingAcc: 'SAV-00123',
      savingDate: '2020-05-10',
      assets: 'Land in Colombo (Rs. 6M)',
      guarantorAcc: 'MEM-00002',
      guarantorName: 'Nimal Silva',
      guarantorNic: '198756789012',
      guarantorJob: 'Farmer',
      guarantorIncome: '480000',
      guarantorExpenses: '280000',
      guarantorExistingLoans: '1',
      guarantorLoanAmount: '100000',
      guarantorLoanBalance: '60000',
      guarantorAccDate: '2019-08-22',
      guarantorAccBalance: '95000',
      submittedAt: '2025-06-02',
      status: 'Pending'
    });
    DB.addApplication({
      refId: 'LOAN-20250002',
      membershipId: 'MEM-00002',
      fullName: 'Nimal Silva',
      nic: '198756789012',
      mobile: '0779876543',
      loanType: 'Agricultural Loan',
      loanAmount: '150000',
      shareAmount: '25000',
      interestRate: '6.5',
      loanDate: '2025-07-15',
      repaymentMonths: '24',
      reason: 'Purchase fertilizer and seeds for paddy season',
      job: 'Farmer',
      mainIncome: '480000',
      otherIncome: '0',
      annualExpenses: '280000',
      savingAcc: 'SAV-00456',
      savingDate: '2018-03-05',
      assets: 'Agricultural land (Rs. 2M)',
      guarantorAcc: 'MEM-00001',
      guarantorName: 'Kamal Perera',
      guarantorNic: '199012345678',
      guarantorJob: 'Government Teacher',
      guarantorIncome: '720000',
      guarantorExpenses: '400000',
      guarantorExistingLoans: '1',
      guarantorLoanAmount: '500000',
      guarantorLoanBalance: '480000',
      guarantorAccDate: '2020-05-10',
      guarantorAccBalance: '110000',
      submittedAt: '2025-07-16',
      status: 'Approved'
    });
  }
})();
