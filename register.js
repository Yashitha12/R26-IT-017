// ============================================================
// register.js – Member registration logic
// ============================================================

document.getElementById('registerForm').addEventListener('submit', function (e) {
  e.preventDefault();
  if (!validateRegisterForm()) return;

  const members = DB.getMembers();
  const nextNum = String(members.length + 1).padStart(5, '0');
  const memberId = 'MEM-' + nextNum;

  const newMember = {
    memberId,
    name: val('reg_name'),
    nic: val('reg_nic'),
    dob: val('reg_dob'),
    gender: val('reg_gender'),
    mobile: val('reg_mobile'),
    email: val('reg_email'),
    address: val('reg_address'),
    district: val('reg_district'),
    occupation: val('reg_occupation'),
    username: val('reg_username'),
    password: val('reg_password'),
    securityQuestion: val('reg_sq'),
    securityAnswer: val('reg_sa'),
    registeredAt: new Date().toISOString().slice(0, 10)
  };

  DB.addMember(newMember);

  document.getElementById('registerForm').style.display = 'none';
  document.getElementById('newMemberId').textContent = memberId;
  document.getElementById('successMsg').style.display = 'block';
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

function val(id) {
  const el = document.getElementById(id);
  return el ? el.value.trim() : '';
}

function showErr(id, msg) {
  const el = document.getElementById('err_' + id);
  if (el) el.textContent = msg;
}

function clearErr(id) {
  const el = document.getElementById('err_' + id);
  if (el) el.textContent = '';
}

function validateRegisterForm() {
  let valid = true;

  // Name
  clearErr('reg_name');
  if (!val('reg_name')) { showErr('reg_name', 'Full name is required.'); valid = false; }

  // NIC
  clearErr('reg_nic');
  const nicVal = val('reg_nic');
  if (!nicVal) {
    showErr('reg_nic', 'NIC is required.'); valid = false;
  } else if (!/^(\d{9}[VXvx]|\d{12})$/.test(nicVal)) {
    showErr('reg_nic', 'Enter a valid NIC (9+V or 12 digits).'); valid = false;
  } else {
    const exists = DB.getMembers().some(m => m.nic === nicVal);
    if (exists) { showErr('reg_nic', 'A member with this NIC already exists.'); valid = false; }
  }

  // Mobile
  clearErr('reg_mobile');
  const mob = val('reg_mobile');
  if (!mob) {
    showErr('reg_mobile', 'Mobile number is required.'); valid = false;
  } else if (!/^0\d{9}$/.test(mob.replace(/\s/g, ''))) {
    showErr('reg_mobile', 'Enter a valid 10-digit mobile number.'); valid = false;
  }

  // Username
  clearErr('reg_username');
  const uname = val('reg_username');
  if (!uname) {
    showErr('reg_username', 'Username is required.'); valid = false;
  } else if (uname.length < 4) {
    showErr('reg_username', 'Username must be at least 4 characters.'); valid = false;
  } else {
    const exists = DB.getMembers().some(m => m.username === uname);
    if (exists) { showErr('reg_username', 'This username is already taken.'); valid = false; }
  }

  // Password
  clearErr('reg_password');
  const pw = val('reg_password');
  if (!pw) {
    showErr('reg_password', 'Password is required.'); valid = false;
  } else if (pw.length < 8) {
    showErr('reg_password', 'Password must be at least 8 characters.'); valid = false;
  }

  // Confirm password
  clearErr('reg_confirm');
  if (val('reg_confirm') !== pw) {
    showErr('reg_confirm', 'Passwords do not match.'); valid = false;
  }

  // Terms
  const termsErr = document.getElementById('err_reg_terms');
  if (!document.getElementById('reg_terms').checked) {
    if (termsErr) termsErr.textContent = 'You must accept the terms to register.';
    valid = false;
  } else {
    if (termsErr) termsErr.textContent = '';
  }

  return valid;
}
