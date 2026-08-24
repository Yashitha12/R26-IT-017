// ============================================================
// admin.js – Admin panel logic
// ============================================================

const ADMIN_CREDENTIALS = { username: 'admin', password: 'admin123' };
let currentApp = null; // selected application for modal

// ─── LOGIN ───────────────────────────────────────────────────
function adminLogin() {
  const u = document.getElementById('admin_user').value.trim();
  const p = document.getElementById('admin_pass').value;
  const errEl = document.getElementById('login_err');

  if (u === ADMIN_CREDENTIALS.username && p === ADMIN_CREDENTIALS.password) {
    document.getElementById('adminLogin').style.display = 'none';
    document.getElementById('adminPanel').style.display = 'block';
    loadDashboard();
  } else {
    errEl.textContent = 'Invalid username or password.';
  }
}

// Allow Enter key on password
document.getElementById('admin_pass').addEventListener('keydown', (e) => {
  if (e.key === 'Enter') adminLogin();
});

function adminLogout() {
  document.getElementById('adminLogin').style.display = 'flex';
  document.getElementById('adminPanel').style.display = 'none';
  document.getElementById('admin_user').value = '';
  document.getElementById('admin_pass').value = '';
  document.getElementById('login_err').textContent = '';
}

// ─── TABS ────────────────────────────────────────────────────
function showTab(tabId, el) {
  document.querySelectorAll('.admin-tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.sn-item').forEach(s => s.classList.remove('active'));
  document.getElementById('tab-' + tabId).classList.add('active');
  if (el) el.classList.add('active');

  if (tabId === 'dashboard') loadDashboard();
  else if (tabId === 'applications') loadApplicationsTable();
  else if (tabId === 'members') loadMembersTable();
  else if (tabId === 'search') { document.getElementById('nicResult').style.display = 'none'; document.getElementById('nicNoResult').style.display = 'none'; }
}

// ─── DASHBOARD ───────────────────────────────────────────────
function loadDashboard() {
  const apps = DB.getApplications();
  const members = DB.getMembers();

  document.getElementById('dc-apps').textContent = apps.length;
  document.getElementById('dc-approved').textContent = apps.filter(a => a.status === 'Approved').length;
  document.getElementById('dc-pending').textContent = apps.filter(a => a.status === 'Pending').length;
  document.getElementById('dc-members').textContent = members.length;

  const tbody = document.getElementById('recentBody');
  const recent = [...apps].reverse().slice(0, 5);
  tbody.innerHTML = recent.map(a => appRow(a)).join('') || '<tr><td colspan="7" style="text-align:center;color:var(--text-muted);padding:2rem">No applications yet.</td></tr>';
}

// ─── APPLICATIONS TABLE ──────────────────────────────────────
function loadApplicationsTable() {
  const apps = DB.getApplications();
  renderApplicationsTable(apps);
}

function renderApplicationsTable(apps) {
  const tbody = document.getElementById('appTableBody');
  if (!tbody) return;
  tbody.innerHTML = [...apps].reverse().map(a => `
    <tr>
      <td><code>${a.refId}</code></td>
      <td>${a.membershipId || '—'}</td>
      <td>${a.fullName}</td>
      <td>${a.loanType}</td>
      <td>Rs. ${(parseFloat(a.loanAmount) || 0).toLocaleString('en-LK')}</td>
      <td>${a.submittedAt}</td>
      <td><span class="badge badge-${a.status.toLowerCase()}">${a.status}</span></td>
      <td><button class="btn btn-primary btn-sm" onclick="openAppModal('${a.refId}')"><i class="fa-solid fa-eye"></i> View</button></td>
    </tr>
  `).join('') || '<tr><td colspan="8" style="text-align:center;color:var(--text-muted);padding:2rem">No applications found.</td></tr>';
}

function filterApplications() {
  const query = document.getElementById('appFilter').value.toLowerCase();
  const status = document.getElementById('statusFilter').value;
  let apps = DB.getApplications();
  if (query) apps = apps.filter(a =>
    a.fullName.toLowerCase().includes(query) ||
    a.refId.toLowerCase().includes(query) ||
    a.loanType.toLowerCase().includes(query) ||
    (a.membershipId || '').toLowerCase().includes(query) ||
    (a.nic || '').toLowerCase().includes(query)
  );
  if (status) apps = apps.filter(a => a.status === status);
  renderApplicationsTable(apps);
}

function appRow(a) {
  return `
    <tr>
      <td><code>${a.refId}</code></td>
      <td>${a.fullName}</td>
      <td>${a.loanType}</td>
      <td>Rs. ${(parseFloat(a.loanAmount) || 0).toLocaleString('en-LK')}</td>
      <td>${a.submittedAt}</td>
      <td><span class="badge badge-${a.status.toLowerCase()}">${a.status}</span></td>
      <td><button class="btn btn-primary btn-sm" onclick="openAppModal('${a.refId}')"><i class="fa-solid fa-eye"></i> View</button></td>
    </tr>
  `;
}

// ─── MEMBERS TABLE ───────────────────────────────────────────
function loadMembersTable() {
  const members = DB.getMembers();
  renderMembersTable(members);
}

function renderMembersTable(members) {
  const tbody = document.getElementById('memberTableBody');
  if (!tbody) return;
  tbody.innerHTML = [...members].reverse().map(m => `
    <tr>
      <td><strong>${m.memberId}</strong></td>
      <td>${m.name}</td>
      <td><code>${m.nic}</code></td>
      <td>${m.mobile}</td>
      <td>${m.occupation || '—'}</td>
      <td>${m.registeredAt}</td>
      <td><button class="btn btn-outline btn-sm" onclick="viewMember('${m.nic}')"><i class="fa-solid fa-eye"></i> View</button></td>
    </tr>
  `).join('') || '<tr><td colspan="7" style="text-align:center;color:var(--text-muted);padding:2rem">No members registered.</td></tr>';
}

function filterMembers() {
  const query = document.getElementById('memberFilter').value.toLowerCase();
  let members = DB.getMembers();
  if (query) members = members.filter(m =>
    m.name.toLowerCase().includes(query) ||
    m.nic.toLowerCase().includes(query) ||
    (m.username || '').toLowerCase().includes(query) ||
    (m.memberId || '').toLowerCase().includes(query) ||
    (m.mobile || '').includes(query)
  );
  renderMembersTable(members);
}

function viewMember(nic) {
  document.querySelector('[onclick="showTab(\'search\',this)"]').click();
  setTimeout(() => {
    document.getElementById('nicSearchInput').value = nic;
    searchByNIC();
  }, 100);
}

// ─── NIC SEARCH ──────────────────────────────────────────────
function searchByNIC() {
  const nic = document.getElementById('nicSearchInput').value.trim();
  const resultDiv = document.getElementById('nicResult');
  const noResult = document.getElementById('nicNoResult');
  const content = document.getElementById('nicResultContent');

  if (!nic) { alert('Please enter a NIC number to search.'); return; }

  const members = DB.getMembers().filter(m => m.nic === nic);
  const apps = DB.getApplications().filter(a => a.nic === nic || a.guarantorNic === nic);

  if (members.length === 0 && apps.length === 0) {
    resultDiv.style.display = 'none';
    noResult.style.display = 'block';
    return;
  }

  noResult.style.display = 'none';
  resultDiv.style.display = 'block';

  let html = '';

  if (members.length > 0) {
    const m = members[0];
    html += `
      <div class="nic-section">
        <h3><i class="fa-solid fa-user"></i> Member Profile</h3>
        ${detailRow('Member ID', m.memberId)}
        ${detailRow('Full Name', m.name)}
        ${detailRow('NIC', m.nic)}
        ${detailRow('Date of Birth', m.dob || '—')}
        ${detailRow('Gender', m.gender || '—')}
        ${detailRow('Mobile', m.mobile)}
        ${detailRow('Email', m.email || '—')}
        ${detailRow('Address', m.address)}
        ${detailRow('District', m.district || '—')}
        ${detailRow('Occupation', m.occupation || '—')}
        ${detailRow('Username', m.username)}
        ${detailRow('Registered', m.registeredAt)}
      </div>
    `;
  }

  if (apps.length > 0) {
    apps.forEach(a => {
      const isGuarantor = a.guarantorNic === nic && a.nic !== nic;
      html += `
        <div class="nic-section">
          <h3><i class="fa-solid fa-file-lines"></i> ${isGuarantor ? 'As Guarantor' : 'Loan Application'} – ${a.refId}</h3>
          ${isGuarantor ? `<p style="font-size:0.82rem;color:var(--warning);margin-bottom:0.75rem"><i class="fa-solid fa-triangle-exclamation"></i> This person is a guarantor for ${a.fullName}</p>` : ''}
          ${detailRow('Reference ID', a.refId)}
          ${detailRow('Applicant', a.fullName)}
          ${detailRow('Loan Type', a.loanType)}
          ${detailRow('Loan Amount', 'Rs. ' + (parseFloat(a.loanAmount) || 0).toLocaleString('en-LK'))}
          ${detailRow('Interest Rate', a.interestRate + '% p.a.')}
          ${detailRow('Loan Date', a.loanDate)}
          ${detailRow('Repayment', a.repaymentMonths + ' months')}
          ${detailRow('Reason', a.reason)}
          ${detailRow('Status', `<span class="badge badge-${a.status.toLowerCase()}">${a.status}</span>`)}
          ${detailRow('Submitted', a.submittedAt)}
          <button class="btn btn-primary btn-sm" style="margin-top:0.75rem" onclick="openAppModal('${a.refId}')">
            <i class="fa-solid fa-eye"></i> View Full Application
          </button>
        </div>
      `;
    });
  }

  content.innerHTML = html;
}

function detailRow(label, val) {
  return `<div class="review-row"><span class="rv-label">${label}</span><span class="rv-val">${val || '—'}</span></div>`;
}

// Allow Enter key on NIC search
document.getElementById('nicSearchInput').addEventListener('keydown', (e) => {
  if (e.key === 'Enter') searchByNIC();
});

// ─── APPLICATION MODAL ───────────────────────────────────────
function openAppModal(refId) {
  const app = DB.getApplications().find(a => a.refId === refId);
  if (!app) return;
  currentApp = app;

  document.getElementById('modalTitle').textContent = `Application – ${refId}`;

  const fmt = (n) => 'Rs. ' + (parseFloat(n) || 0).toLocaleString('en-LK');

  document.getElementById('modalBody').innerHTML = `
    <div class="mdl-section-title"><i class="fa-solid fa-user"></i> Personal Details</div>
    ${mRow('Membership ID', app.membershipId)} ${mRow('Full Name', app.fullName)}
    ${mRow('NIC', app.nic)} ${mRow('Date of Birth', app.dob || '—')}
    ${mRow('Mobile', app.mobile)} ${mRow('Email', app.email || '—')}
    ${mRow('Address', app.address)}

    <div class="mdl-section-title"><i class="fa-solid fa-sack-dollar"></i> Loan Details</div>
    ${mRow('Share Amount', fmt(app.shareAmount))} ${mRow('Loan Type', app.loanType)}
    ${mRow('Loan Amount', fmt(app.loanAmount))} ${mRow('Interest Rate', app.interestRate + '% p.a.')}
    ${mRow('Loan Date', app.loanDate)} ${mRow('Repayment', app.repaymentMonths + ' months')}
    ${mRow('Reason', app.reason)}

    <div class="mdl-section-title"><i class="fa-solid fa-chart-pie"></i> Financial Info</div>
    ${mRow('Job', app.job)} ${mRow('Main Income', fmt(app.mainIncome))}
    ${mRow('Other Income', fmt(app.otherIncome))} ${mRow('Annual Expenses', fmt(app.annualExpenses))}
    ${mRow('Savings Account', app.savingAcc)} ${mRow('Account Date', app.savingDate)}
    ${mRow('Assets', app.assets || '—')}

    <div class="mdl-section-title"><i class="fa-solid fa-people-arrows"></i> Guarantor Details</div>
    ${mRow('Guarantor Account', app.guarantorAcc)} ${mRow('Guarantor Name', app.guarantorName)}
    ${mRow('Guarantor NIC', app.guarantorNic)} ${mRow('Guarantor Job', app.guarantorJob)}
    ${mRow('Annual Income', fmt(app.guarantorIncome))} ${mRow('Annual Expenses', fmt(app.guarantorExpenses))}
    ${mRow('Existing Loans', app.guarantorExistingLoans)} ${mRow('Loan Amount', fmt(app.guarantorLoanAmount))}
    ${mRow('Loan Balance', fmt(app.guarantorLoanBalance))} ${mRow('Account Date', app.guarantorAccDate)}
    ${mRow('Account Balance', fmt(app.guarantorAccBalance))}

    <div class="mdl-section-title"><i class="fa-solid fa-info-circle"></i> Status</div>
    ${mRow('Submitted', app.submittedAt)}
    ${mRow('Current Status', `<span class="badge badge-${app.status.toLowerCase()}">${app.status}</span>`)}
  `;

  // Show/hide action buttons
  const btnA = document.getElementById('btnApprove');
  const btnR = document.getElementById('btnReject');
  if (app.status === 'Pending') { btnA.style.display = ''; btnR.style.display = ''; }
  else { btnA.style.display = 'none'; btnR.style.display = 'none'; }

  document.getElementById('appModal').style.display = 'flex';
}

function mRow(label, val) {
  return `<div class="modal-detail-row"><span class="mdl-label">${label}</span><span class="mdl-val">${val || '—'}</span></div>`;
}

function updateStatus(status) {
  if (!currentApp) return;
  if (!confirm(`Are you sure you want to mark this application as "${status}"?`)) return;
  DB.updateApplication(currentApp.refId, { status });
  closeModal('appModal');
  loadDashboard();
  loadApplicationsTable();
  alert(`Application ${currentApp.refId} has been ${status}.`);
  currentApp = null;
}

function closeModal(id) {
  document.getElementById(id).style.display = 'none';
}
