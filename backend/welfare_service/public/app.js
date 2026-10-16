// SmartGrama Digital Identity, KYC Verification & Welfare Services Frontend Logic

const API_BASE = '/api';

// Application State
const state = {
  currentRegStep: 1,
  activeUserId: 'user-prototype-001',
  activeVerificationId: 'ver-prototype-001',
  officerToken: null,
  activeReviewCaseId: null,
  webcamStream: null,
  capturedSelfieDataUrl: null,
  uploadedNicDataUrl: null,
  currentAswesumaStep: 1,
  activeVerifiedDid: 'did:smartgrama:prototype:001',
};

// Utility: Toast Notifications
function showToast(message, isSuccess = true) {
  const container = document.getElementById('toastWrapper');
  const toast = document.createElement('div');
  toast.className = 'app-toast';
  toast.style.borderLeftColor = isSuccess ? '#0d9488' : '#e11d48';
  toast.innerHTML = `<span>${isSuccess ? '✅' : '❌'}</span> <span>${message}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

// Utility: API Fetch
async function apiFetch(endpoint, options = {}) {
  let opts = {};
  if (typeof options === 'string') {
    const method = options;
    const body = arguments[2];
    opts = {
      method,
      ...(body !== undefined ? { body: typeof body === 'string' ? body : JSON.stringify(body) } : {}),
    };
  } else {
    opts = { ...options };
  }

  try {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      headers: { 'Content-Type': 'application/json', ...(opts.headers || {}) },
      ...opts,
    });
    const data = await res.json();
    return { status: res.status, ok: res.ok, data };
  } catch (err) {
    showToast(`Network error: ${err.message}`, false);
    return { status: 500, ok: false, data: { success: false, error: err.message } };
  }
}

// -------------------------------------------------------------
// Section 1: 4-Step Registration Navigation (Figma Design)
// -------------------------------------------------------------
window.jumpToRegStep = function(targetStep) {
  if (targetStep < 1 || targetStep > 4) return;
  state.currentRegStep = targetStep;
  renderRegStepState();
};

window.nextRegStep = function(fromStep) {
  if (fromStep < 4) {
    state.currentRegStep = fromStep + 1;
    renderRegStepState();
  }
};

window.prevRegStep = function(fromStep) {
  if (fromStep > 1) {
    state.currentRegStep = fromStep - 1;
    renderRegStepState();
  }
};

function renderRegStepState() {
  const step = state.currentRegStep;

  document.getElementById('stepCounterText').textContent = `Step ${step} of 4`;

  for (let i = 1; i <= 4; i++) {
    const section = document.getElementById(`regStepSection${i}`);
    if (section) {
      if (i === step) section.classList.add('active');
      else section.classList.remove('active');
    }

    const node = document.getElementById(`stepNode${i}`);
    const circle = node.querySelector('.step-circle');
    const conn = document.getElementById(`conn${i}`);

    if (i < step) {
      node.className = 'step-item completed';
      circle.textContent = '✓';
      if (conn) conn.classList.add('completed');
    } else if (i === step) {
      node.className = 'step-item current';
      circle.textContent = `${i}`;
      if (conn) conn.classList.remove('completed');
    } else {
      node.className = 'step-item';
      circle.textContent = `${i}`;
      if (conn) conn.classList.remove('completed');
    }
  }
}

// Transition from Step 4 Registration -> Dedicated Digital Identity Application Stage
window.proceedToDidStage = async function() {
  const name = document.getElementById('inpFullName').value.trim();
  const nic = document.getElementById('inpNicNumber').value.trim();
  const dob = document.getElementById('inpDob').value.trim();
  const phone = document.getElementById('inpMobile').value.trim();
  const email = document.getElementById('inpEmail').value.trim();
  const address = document.getElementById('inpHomeAddress').value.trim();
  const gn = document.getElementById('inpGnDivision').value.trim();
  const city = document.getElementById('inpCity').value.trim();
  const district = document.getElementById('inpDistrict').value.trim();

  const presetValue = document.getElementById('presetUserSelect').value;
  if (presetValue === 'custom' || !state.activeUserId.startsWith('user-prototype-')) {
    const regRes = await apiFetch('/registration', {
      method: 'POST',
      body: JSON.stringify({
        name: name || 'Custom Citizen',
        nic: nic || '200012345678',
        dateOfBirth: dob || '01/01/2000',
        phone: phone || '+94 77 000 0000',
        email: email || 'citizen@example.test',
        address: address || 'Main Street',
        city: city || 'Colombo',
        district: district || 'Colombo',
        gnDivision: gn || 'Central',
      }),
    });

    if (regRes.ok && regRes.data?.data) {
      state.activeUserId = regRes.data.data.userId;
      const suffix = state.activeUserId.replace('user-prototype-', '');
      state.activeVerificationId = `ver-prototype-${suffix}`;
      showToast(`Registered citizen: ${name} (ID: ${state.activeUserId})`);
    }
  }

  syncRegistrationToDidStage();
  switchPortalTab('identity');
  showToast('Registration saved! Proceeding to Digital Identity Application.');
};

function syncRegistrationToDidStage() {
  const name = document.getElementById('inpFullName').value.trim() || 'Aravinda Kumara';
  const nic = document.getElementById('inpNicNumber').value.trim() || '200223003053';
  const phone = document.getElementById('inpMobile').value.trim() || '+94 78 145 3248';
  const email = document.getElementById('inpEmail').value.trim() || 'samankumara@gmail.com';
  const address = document.getElementById('inpHomeAddress').value.trim() || '45/A, Jayawickrama Road';
  const gn = document.getElementById('inpGnDivision').value.trim() || 'Minuwangoda North';
  const district = document.getElementById('inpDistrict').value.trim() || 'Gampaha';

  document.getElementById('didPreName').textContent = name;
  document.getElementById('didPreNic').textContent = nic;
  document.getElementById('didPrePhone').textContent = phone;
  document.getElementById('didPreEmail').textContent = email;
  document.getElementById('didPreAddress').textContent = `${address}, ${gn} (${district})`;
  document.getElementById('displayMaskedNic').textContent = `SYN-NIC-*****${nic.slice(-4)}`;
}

// -------------------------------------------------------------
// Upstream Registration Presets & Custom Form Clearing
// -------------------------------------------------------------
function clearRegistrationForm() {
  document.getElementById('inpFullName').value = '';
  document.getElementById('inpNicNumber').value = '';
  document.getElementById('inpDob').value = '';
  document.getElementById('inpMobile').value = '';
  document.getElementById('inpEmail').value = '';
  document.getElementById('inpHomeAddress').value = '';
  document.getElementById('inpCity').value = '';
  document.getElementById('inpDistrict').value = '';
  document.getElementById('inpGnDivision').value = '';
  document.getElementById('presetUserSelect').value = 'custom';
  state.activeUserId = `user-custom-${Date.now().toString().slice(-4)}`;
  state.activeVerificationId = `ver-custom-${Date.now().toString().slice(-4)}`;
  showToast('Form cleared. Please type your real citizen information.');
  jumpToRegStep(1);
}

async function loadSelectedPreset() {
  const selectVal = document.getElementById('presetUserSelect').value;
  if (selectVal === 'custom') {
    clearRegistrationForm();
    return;
  }

  const userId = selectVal;
  state.activeUserId = userId;

  const res = await apiFetch(`/registration/${userId}`);
  if (res.ok && res.data?.data) {
    const r = res.data.data;
    
    // Step 1: Personal Details
    document.getElementById('inpFullName').value = r.name || '';
    document.getElementById('inpNicNumber').value = r.nic || '';
    document.getElementById('inpDob').value = r.dateOfBirth || '01/12/2002';
    document.getElementById('inpMobile').value = r.phone || '';
    document.getElementById('inpEmail').value = r.email || '';

    // Step 2: Address & GN Division
    document.getElementById('inpHomeAddress').value = r.address || '';
    document.getElementById('inpCity').value = r.city || 'Gampaha';
    document.getElementById('inpDistrict').value = r.district || 'Gampaha';
    document.getElementById('inpGnDivision').value = r.gnDivision || '';

    // Step 3: Family & Income
    document.getElementById('inpFamilySize').value = r.familySize || 4;
    document.getElementById('inpNoOfDependents').value = r.noOfDependents || 2;
    document.getElementById('inpMonthlyIncome').value = r.monthlyIncome || 35000;
    document.getElementById('inpMonthlyExpenses').value = r.monthlyExpenses || 30000;
    document.getElementById('inpEmploymentType').value = r.employmentType || 'Farmer';

    // Step 4: Bank & Wallet
    document.getElementById('inpBankName').value = r.bankName || 'Sampath Bank';
    document.getElementById('inpAccountNumber').value = r.accountNumber || '000123456789';
    document.getElementById('inpBranch').value = r.branch || 'Gampaha';

    const suffix = userId.replace('user-prototype-', '');
    state.activeVerificationId = `ver-prototype-${suffix}`;

    showToast(`Loaded preset for ${r.name}`);
    syncRegistrationToDidStage();
    fetchCitizenStatus();
    fetchOfficerPendingQueue();
  }
}

// -------------------------------------------------------------
// Section 2: Digital Identity (DID) Application & Live Evidence
// -------------------------------------------------------------
async function handleApplyIdentity() {
  const userId = state.activeUserId;
  const preferredLang = document.getElementById('didPreferredLang').value;
  const emergencyContact = document.getElementById('didEmergencyContact').value.trim();

  const res = await apiFetch('/identity/apply', {
    method: 'POST',
    body: JSON.stringify({
      userId,
      additionalAttributes: { preferredLanguage: preferredLang, emergencyContact },
    }),
  });

  if (res.ok && res.data?.data) {
    const appData = res.data.data;
    state.activeVerificationId = appData.verificationId;

    document.getElementById('displayAssignedApp').textContent = appData.applicationId;
    document.getElementById('displayAssignedVer').textContent = appData.verificationId;
    document.getElementById('appBannerTitle').textContent = '📝 IDENTITY APPLICATION REGISTERED (PENDING KYC)';
    document.getElementById('displayDidIssueNotice').textContent = 'Pending Officer Approval (No DID issued yet)';
    document.getElementById('displayDidIssueNotice').style.color = '#d97706';
    document.getElementById('appSuccessBanner').classList.remove('hidden');

    showToast(`Identity Application Registered (${appData.applicationId}). Please submit selfie and NIC.`);
    fetchCitizenStatus();
    fetchOfficerPendingQueue();
  } else {
    showToast(res.data?.error || 'Identity Application error', false);
  }
}

// 📷 Live Webcam Handling
async function toggleLiveWebcam() {
  const video = document.getElementById('selfieVideo');
  const preview = document.getElementById('selfieImgPreview');
  const placeholder = document.getElementById('selfieMockPlaceholder');
  const snapBtn = document.getElementById('btnSnapPhoto');
  const toggleBtn = document.getElementById('btnToggleCamera');

  if (state.webcamStream) {
    state.webcamStream.getTracks().forEach(t => t.stop());
    state.webcamStream = null;
    video.classList.add('hidden');
    snapBtn.classList.add('hidden');
    toggleBtn.textContent = '📷 Start Live Camera';
    if (!state.capturedSelfieDataUrl) {
      placeholder.classList.remove('hidden');
    }
    return;
  }

  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user', width: 400, height: 300 } });
    state.webcamStream = stream;
    video.srcObject = stream;
    video.classList.remove('hidden');
    preview.classList.add('hidden');
    placeholder.classList.add('hidden');
    snapBtn.classList.remove('hidden');
    toggleBtn.textContent = '⏹️ Stop Camera';
    showToast('Live Camera Activated! Smile and click Snap.');
  } catch (err) {
    showToast(`Camera permission or access denied: ${err.message}`, false);
  }
}

function snapLivePhoto() {
  const video = document.getElementById('selfieVideo');
  const canvas = document.getElementById('selfieCanvas');
  const preview = document.getElementById('selfieImgPreview');
  const context = canvas.getContext('2d');

  canvas.width = video.videoWidth || 400;
  canvas.height = video.videoHeight || 300;
  context.drawImage(video, 0, 0, canvas.width, canvas.height);

  const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
  state.capturedSelfieDataUrl = dataUrl;

  if (state.webcamStream) {
    state.webcamStream.getTracks().forEach(t => t.stop());
    state.webcamStream = null;
  }

  video.classList.add('hidden');
  document.getElementById('btnSnapPhoto').classList.add('hidden');
  document.getElementById('btnToggleCamera').textContent = '📷 Retake Camera Selfie';

  preview.src = dataUrl;
  preview.classList.remove('hidden');

  submitSelfieEvidence(dataUrl, 'LiveWebcamCapture-v1.0');
}

function handleUploadSelfieFile(e) {
  const file = e.target.files?.[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (event) => {
    const dataUrl = event.target.result;
    state.capturedSelfieDataUrl = dataUrl;

    const preview = document.getElementById('selfieImgPreview');
    const placeholder = document.getElementById('selfieMockPlaceholder');
    preview.src = dataUrl;
    preview.classList.remove('hidden');
    placeholder.classList.add('hidden');

    submitSelfieEvidence(dataUrl, 'CustomImageUpload-v1.0');
  };
  reader.readAsDataURL(file);
}

function handleUploadNicFile(e) {
  const file = e.target.files?.[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (event) => {
    const dataUrl = event.target.result;
    state.uploadedNicDataUrl = dataUrl;

    const preview = document.getElementById('nicImgPreview');
    const placeholder = document.getElementById('nicMockPlaceholder');
    preview.src = dataUrl;
    preview.classList.remove('hidden');
    placeholder.classList.add('hidden');

    submitNicEvidence(dataUrl, 'NATIONAL_IDENTITY_CARD_REAL_UPLOAD');
  };
  reader.readAsDataURL(file);
}

async function submitSelfieEvidence(evidenceRef, algorithm = 'SyntheticFaceMatch-v1.0') {
  const verId = state.activeVerificationId;
  const payload = {
    evidenceReference: evidenceRef,
    matchScore: 0.982,
    algorithm,
  };

  const res = await apiFetch(`/verification/${verId}/face`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });

  if (res.ok && res.data?.data) {
    document.getElementById('badgeSelfieStatus').textContent = 'SUBMITTED';
    document.getElementById('badgeSelfieStatus').className = 'status-pill submitted';
    document.getElementById('indFaceVal').textContent = 'SUBMITTED';
    showToast(`📷 Live selfie evidence recorded for ${verId} (Pending Review)`);
    fetchCitizenStatus();
    fetchOfficerPendingQueue();
  } else {
    showToast(res.data?.error || 'Selfie submission error', false);
  }
}

async function submitNicEvidence(evidenceRef, documentType = 'SYNTHETIC_NATIONAL_IDENTITY_CARD') {
  const verId = state.activeVerificationId;
  const masked = document.getElementById('displayMaskedNic').textContent;

  const payload = {
    evidenceReference: evidenceRef,
    documentType,
    documentNumberMasked: masked,
  };

  const res = await apiFetch(`/verification/${verId}/document`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });

  if (res.ok && res.data?.data) {
    document.getElementById('badgeNicStatus').textContent = 'SUBMITTED';
    document.getElementById('badgeNicStatus').className = 'status-pill submitted';
    document.getElementById('indDocVal').textContent = 'SUBMITTED';
    showToast(`🪪 NIC document evidence recorded for ${verId} (Pending Review)`);
    fetchCitizenStatus();
    fetchOfficerPendingQueue();
  } else {
    showToast(res.data?.error || 'NIC submission error', false);
  }
}

async function fetchCitizenStatus() {
  const verId = state.activeVerificationId;
  const res = await apiFetch(`/verification/${verId}/status`);

  const banner = document.getElementById('citizenVerdictBanner');
  const text = document.getElementById('citizenVerdictText');
  const detail = document.getElementById('citizenVerdictDetail');
  const remarksBox = document.getElementById('citizenRejectionBox');
  const remarksText = document.getElementById('citizenRejectionNotes');
  const issuedDidCard = document.getElementById('issuedDidCard');

  if (res.ok && res.data?.data) {
    const st = res.data.data;

    text.textContent = st.finalStatus;
    document.getElementById('indFaceVal').textContent = st.facialVerificationStatus;
    document.getElementById('indDocVal').textContent = st.documentVerificationStatus;
    document.getElementById('indOfficerVal').textContent = st.officerReviewStatus;

    const selfiePill = document.getElementById('badgeSelfieStatus');
    const nicPill = document.getElementById('badgeNicStatus');

    selfiePill.textContent = st.facialVerificationStatus;
    selfiePill.className = `status-pill ${st.facialVerificationStatus.toLowerCase()}`;

    nicPill.textContent = st.documentVerificationStatus;
    nicPill.className = `status-pill ${st.documentVerificationStatus.toLowerCase()}`;

    if (st.finalStatus === 'VERIFIED' && st.did) {
      state.activeVerifiedDid = st.did;
      banner.className = 'verdict-banner verdict-verified';
      detail.textContent = `Approved by Grama Niladhari Officer at ${new Date(st.reviewedAt || st.updatedAt).toLocaleTimeString()} — Digital Identity Issued`;
      
      const idRes = await apiFetch(`/identity/${st.did}`);
      if (idRes.ok && idRes.data?.data) {
        const idData = idRes.data.data;

        issuedDidCard.classList.remove('hidden');
        document.getElementById('activeDidString').textContent = idData.did;
        document.getElementById('didCardFullName').textContent = idData.name;
        document.getElementById('didCardNic').textContent = idData.nic;
        document.getElementById('didCardDob').textContent = idData.dateOfBirth || '01/12/2002';
        document.getElementById('didCardPhone').textContent = idData.phone;
        document.getElementById('didCardEmail').textContent = idData.email;
        document.getElementById('didCardAddress').textContent = idData.address;
        document.getElementById('didCardGn').textContent = idData.gnDivision;
        document.getElementById('didCardDistrict').textContent = idData.district || 'Gampaha';
        document.getElementById('didIssuerOfficer').textContent = idData.issuingOfficerId || 'OFFICER-PROTOTYPE-001 (GN Lead)';
        document.getElementById('didIssuedTime').textContent = new Date(idData.issuedAt || st.reviewedAt || st.updatedAt).toLocaleString();

        const faceImg = document.getElementById('verifiedFaceImg');
        const faceFallback = document.getElementById('verifiedFaceFallback');
        if (idData.facePhotoData && (idData.facePhotoData.startsWith('data:image/') || idData.facePhotoData.startsWith('http'))) {
          faceImg.src = idData.facePhotoData;
          faceImg.classList.remove('hidden');
          faceFallback.classList.add('hidden');
        } else {
          faceImg.classList.add('hidden');
          faceFallback.classList.remove('hidden');
        }

        const nicImg = document.getElementById('verifiedNicImg');
        const nicFallback = document.getElementById('verifiedNicFallback');
        const nicNumText = document.getElementById('verifiedNicNumText');
        if (idData.nicPhotoData && (idData.nicPhotoData.startsWith('data:image/') || idData.nicPhotoData.startsWith('http'))) {
          nicImg.src = idData.nicPhotoData;
          nicImg.classList.remove('hidden');
          nicFallback.classList.add('hidden');
        } else {
          nicImg.classList.add('hidden');
          nicFallback.classList.remove('hidden');
          nicNumText.textContent = `SYN-NIC-*****${idData.nic.slice(-4)}`;
        }
      }

      remarksBox.classList.add('hidden');
    } else if (st.finalStatus === 'REJECTED') {
      banner.className = 'verdict-banner verdict-rejected';
      detail.textContent = `Rejected by Grama Niladhari Officer at ${new Date(st.reviewedAt || st.updatedAt).toLocaleTimeString()} — No DID Issued`;
      
      issuedDidCard.classList.add('hidden');
      remarksBox.classList.remove('hidden');
      remarksText.textContent = `Reason: ${st.remarks || 'Documentation or selfie match was unsatisfactory.'}`;
    } else {
      banner.className = 'verdict-banner verdict-pending';
      detail.textContent = 'Awaiting officer side-by-side KYC review (No DID issued yet)';
      
      issuedDidCard.classList.add('hidden');
      remarksBox.classList.add('hidden');
    }
  }
}

// -------------------------------------------------------------
// Section 3: Officer KYC Review Dashboard
// -------------------------------------------------------------
async function officerLogin() {
  const res = await apiFetch('/officer/auth/login', {
    method: 'POST',
    body: JSON.stringify({ officerId: 'OFFICER-PROTOTYPE-001', password: 'prototype123' }),
  });

  if (res.ok && res.data?.data) {
    state.officerToken = res.data.data.token;
    showToast(`Officer authenticated: ${res.data.data.officer.name}`);
    fetchOfficerPendingQueue();
  }
}

async function fetchOfficerPendingQueue() {
  const res = await apiFetch('/officer/verification/pending');
  const container = document.getElementById('officerQueueList');
  const badge = document.getElementById('headerPendingCount');

  if (res.ok && Array.isArray(res.data?.data)) {
    const list = res.data.data;
    badge.textContent = list.length;

    if (list.length === 0) {
      container.innerHTML = `<div class="empty-msg">No pending KYC cases ready for review.<br><span style="font-size:0.75rem;color:#64748b;">(Requires both selfie and NIC submitted by citizen)</span></div>`;
      return;
    }

    container.innerHTML = list.map(c => `
      <div class="queue-card-item ${state.activeReviewCaseId === c.verificationId ? 'selected' : ''}" onclick="selectOfficerCase('${c.verificationId}')">
        <div>
          <div class="q-case-id">${c.verificationId}</div>
          <div style="font-size:0.85rem;font-weight:700;color:var(--text-primary);">${c.applicantName || c.userId}</div>
          <div style="font-size:0.725rem;color:var(--text-muted);">${c.applicantNicMasked || 'SYN-NIC-*****'} &bull; ${c.gnDivision || 'Grama Niladhari'}</div>
        </div>
        <button type="button" class="btn-review-mini" onclick="event.stopPropagation(); selectOfficerCase('${c.verificationId}')">
          Review Case
        </button>
      </div>
    `).join('');
  }
}

window.selectOfficerCase = async function(verificationId) {
  state.activeReviewCaseId = verificationId;
  const res = await apiFetch(`/officer/verification/${verificationId}/review`);

  const noBox = document.getElementById('noCaseBox');
  const activeBox = document.getElementById('activeAdjudicationBox');

  if (res.ok && res.data?.data) {
    const c = res.data.data;
    noBox.classList.add('hidden');
    activeBox.classList.remove('hidden');

    document.getElementById('adjudicationSubtitle').textContent = `Adjudicating: ${c.verificationId} — Applicant: ${c.applicantName || c.userId}`;
    document.getElementById('adjudicationPill').textContent = `STATUS: ${c.finalStatus}`;

    // Face selfie evidence
    const faceRef = c.facialVerification.evidenceReference || '';
    const faceImg = document.getElementById('officerFaceImg');
    const faceDefault = document.getElementById('officerFaceDefault');

    if (faceRef.startsWith('data:image/') || faceRef.startsWith('http')) {
      faceImg.src = faceRef;
      faceImg.classList.remove('hidden');
      faceDefault.classList.add('hidden');
    } else {
      faceImg.classList.add('hidden');
      faceDefault.classList.remove('hidden');
    }

    document.getElementById('officerFaceScore').textContent = `Score: ${(c.facialVerification.matchScore * 100).toFixed(1)}%`;
    document.getElementById('officerAlgorithm').textContent = c.facialVerification.algorithm || 'SyntheticFaceMatch-v1.0';
    document.getElementById('officerFaceStatus').textContent = c.facialVerification.status;
    document.getElementById('officerFaceRef').textContent = faceRef.startsWith('data:image/') ? '[Real Webcam / Upload Photo]' : faceRef;
    document.getElementById('officerFaceTime').textContent = c.facialVerification.submittedAt ? new Date(c.facialVerification.submittedAt).toLocaleTimeString() : '--';

    // NIC document evidence
    const docRef = c.documentVerification.evidenceReference || '';
    const docImg = document.getElementById('officerDocImg');
    const docDefault = document.getElementById('officerDocDefault');

    if (docRef.startsWith('data:image/') || docRef.startsWith('http')) {
      docImg.src = docRef;
      docImg.classList.remove('hidden');
      docDefault.classList.add('hidden');
    } else {
      docImg.classList.add('hidden');
      docDefault.classList.remove('hidden');
    }

    document.getElementById('officerDocType').textContent = c.documentVerification.documentType;
    document.getElementById('officerNicMasked').textContent = c.documentVerification.documentNumberMasked || 'SYN-NIC-*****';
    document.getElementById('officerDocStatus').textContent = c.documentVerification.status;
    document.getElementById('officerDocRef').textContent = docRef.startsWith('data:image/') ? '[Real Uploaded NIC Document]' : docRef;
    document.getElementById('officerDocTime').textContent = c.documentVerification.submittedAt ? new Date(c.documentVerification.submittedAt).toLocaleTimeString() : '--';

    document.getElementById('officerRemarks').value = 'Live selfie facial biometric and NIC document details verified satisfactory.';
    fetchOfficerPendingQueue();
  }
};

async function submitOfficerVerdict(decision) {
  if (!state.activeReviewCaseId) return;

  const remarks = document.getElementById('officerRemarks').value.trim();
  const payload = {
    decision,
    officerId: 'OFFICER-PROTOTYPE-001',
    remarks: remarks || (decision === 'APPROVED' ? 'Biometrics and NIC match verified.' : 'Verification rejected.'),
  };

  const res = await apiFetch(`/officer/verification/${state.activeReviewCaseId}/decision`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });

  if (res.ok && res.data?.data) {
    const updated = res.data.data;
    if (decision === 'APPROVED') {
      showToast(`✅ Approved! Digital Identity (DID) issued: ${updated.did}`);
    } else {
      showToast(`❌ Verification Rejected. No DID issued.`, false);
    }

    state.activeReviewCaseId = null;
    document.getElementById('noCaseBox').classList.remove('hidden');
    document.getElementById('activeAdjudicationBox').classList.add('hidden');
    document.getElementById('adjudicationSubtitle').textContent = 'Select a case from the queue to verify selfie vs. NIC';
    document.getElementById('adjudicationPill').textContent = 'NO CASE SELECTED';

    fetchOfficerPendingQueue();
    fetchCitizenStatus();
  } else {
    showToast(res.data?.error || 'Adjudication decision error', false);
  }
}

// -------------------------------------------------------------
// Section 4: Welfare Services Home Page & Application Management
// -------------------------------------------------------------
async function renderWelfareHomePage() {
  stopGuidanceAudio();
  stopTargetedAudio();
  stopSamurdhiAudio();
  stopElderlyAudio();
  stopDisabilityAudio();
  const verId = state.activeVerificationId;
  const res = await apiFetch(`/verification/${verId}/status`);

  const lockedBox = document.getElementById('welfareLockedBox');
  const homeView = document.getElementById('welfareHomeView');
  const guidanceView = document.getElementById('aswesumaGuidanceView');
  const targetedView = document.getElementById('targetedAllowancesView');
  const samurdhiView = document.getElementById('samurdhiView');
  const elderlyAppView = document.getElementById('elderlyAppView');
  const disabilityAppView = document.getElementById('disabilityAppView');
  const wizardContainer = document.getElementById('aswesumaWizardContainer');
  const successView = document.getElementById('aswesumaSuccessView');
  const infoModal = document.getElementById('allowanceInfoModal');
  const applyModal = document.getElementById('allowanceApplyModal');
  const samurdhiModal = document.getElementById('samurdhiModal');
  const lockStatusText = document.getElementById('welfareLockStatusText');
  const didStringVal = document.getElementById('welfareDidString');

  if (guidanceView) guidanceView.classList.add('hidden');
  if (targetedView) targetedView.classList.add('hidden');
  if (samurdhiView) samurdhiView.classList.add('hidden');
  if (elderlyAppView) elderlyAppView.classList.add('hidden');
  if (disabilityAppView) disabilityAppView.classList.add('hidden');
  if (wizardContainer) wizardContainer.classList.add('hidden');
  if (successView) successView.classList.add('hidden');
  if (infoModal) infoModal.classList.add('hidden');
  if (applyModal) applyModal.classList.add('hidden');
  if (samurdhiModal) samurdhiModal.classList.add('hidden');

  if (res.ok && res.data?.data?.finalStatus === 'VERIFIED') {
    state.activeVerifiedDid = res.data.data.did || 'did:smartgrama:prototype:001';
    lockedBox.classList.add('hidden');
    homeView.classList.remove('hidden');
    didStringVal.textContent = state.activeVerifiedDid;
    fetchMyWelfareApplications(state.activeVerifiedDid);
  } else {
    const currentStatus = res.data?.data?.finalStatus || 'PENDING VERIFICATION';
    lockStatusText.textContent = currentStatus;
    lockedBox.classList.remove('hidden');
    homeView.classList.add('hidden');
  }
}

async function fetchMyWelfareApplications(did) {
  const emptyState = document.getElementById('myAppsEmptyState');
  const listGrid = document.getElementById('myAppsListGrid');

  const aswRes = await apiFetch(`/welfare/aswesuma/applications/did/${did}`);
  const eldRes = await apiFetch(`/welfare/elderly/applications/by-did/${did}`);
  const disRes = await apiFetch(`/welfare/disability/applications/by-did/${did}`);

  const aswApps = aswRes.ok && Array.isArray(aswRes.data?.data) ? aswRes.data.data : [];
  const eldApps = eldRes.ok && Array.isArray(eldRes.data?.data) ? eldRes.data.data : [];
  const disApps = disRes.ok && Array.isArray(disRes.data?.data) ? disRes.data.data : [];
  const allApps = [...aswApps, ...eldApps, ...disApps];

  if (allApps.length > 0) {
    emptyState.classList.add('hidden');
    listGrid.classList.remove('hidden');

    listGrid.innerHTML = allApps.map(a => {
      const isElderly = a.category === 'ELDERLY_ASSISTANCE';
      const isDisability = a.category === 'DISABILITY_ASSISTANCE';
      let progTitle = '🏛️ Aswesuma';
      if (isElderly) progTitle = '🧓 Elderly Assistance';
      if (isDisability) progTitle = '♿ Disability Assistance';

      const name = isElderly || isDisability ? a.applicant?.fullName : a.applicantInformation?.fullName;
      const gn = isElderly || isDisability ? `${a.address?.gnDivision}, ${a.address?.district}` : `${a.applicantInformation?.gnDivision}, ${a.applicantInformation?.district}`;

      return `
        <div class="my-app-card">
          <div class="my-app-top">
            <span class="my-app-prog">${progTitle}</span>
            <span class="status-pill submitted">${a.status}</span>
          </div>
          <div class="my-app-id">App ID: ${a.applicationId}</div>
          <div style="font-size:0.8rem;color:var(--text-secondary);">Applicant: <strong>${name}</strong></div>
          <div style="font-size:0.75rem;color:var(--text-muted);">${gn}</div>
          <div class="my-app-meta">
            <span>Submitted: ${new Date(a.submittedAt || a.createdAt).toLocaleDateString()}</span>
            <span style="color:var(--primary);font-weight:600;">Pending Review</span>
          </div>
        </div>
      `;
    }).join('');
  } else {
    emptyState.classList.remove('hidden');
    listGrid.classList.add('hidden');
  }
}

// -------------------------------------------------------------
// Section 4B: Bilingual User Guidance ("Before You Apply") Logic
// -------------------------------------------------------------
let ttsUtterance = null;
let isGuidanceSpeaking = false;

window.openAswesumaGuidance = async function() {
  const verId = state.activeVerificationId;
  const res = await apiFetch(`/verification/${verId}/status`);

  if (!res.ok || res.data?.data?.finalStatus !== 'VERIFIED') {
    showToast('Access restricted: You must have an officially verified DID to apply for Aswesuma.', false);
    renderWelfareHomePage();
    return;
  }

  state.activeVerifiedDid = res.data.data.did;
  stopGuidanceAudio();
  stopTargetedAudio();
  stopSamurdhiAudio();
  stopElderlyAudio();

  document.getElementById('welfareHomeView').classList.add('hidden');
  document.getElementById('welfareLockedBox').classList.add('hidden');
  document.getElementById('targetedAllowancesView').classList.add('hidden');
  document.getElementById('samurdhiView').classList.add('hidden');
  document.getElementById('elderlyAppView').classList.add('hidden');
  document.getElementById('aswesumaWizardContainer').classList.add('hidden');
  document.getElementById('aswesumaSuccessView').classList.add('hidden');
  document.getElementById('guidanceHelpDrawer').classList.add('hidden');
  document.getElementById('allowanceApplyModal').classList.add('hidden');
  document.getElementById('samurdhiModal').classList.add('hidden');
  document.getElementById('aswesumaGuidanceView').classList.remove('hidden');

  window.scrollTo({ top: 0, behavior: 'smooth' });
};

function setGuidanceLanguage(lang) {
  const view = document.getElementById('aswesumaGuidanceView');
  const btnBoth = document.getElementById('btnLangBoth');
  const btnEn = document.getElementById('btnLangEn');
  const btnSi = document.getElementById('btnLangSi');

  btnBoth.classList.remove('active');
  btnEn.classList.remove('active');
  btnSi.classList.remove('active');

  view.classList.remove('lang-mode-en', 'lang-mode-si');

  if (lang === 'en') {
    btnEn.classList.add('active');
    view.classList.add('lang-mode-en');
  } else if (lang === 'si') {
    btnSi.classList.add('active');
    view.classList.add('lang-mode-si');
  } else {
    btnBoth.classList.add('active');
  }
}

function toggleGuidanceHelp() {
  const drawer = document.getElementById('guidanceHelpDrawer');
  drawer.classList.toggle('hidden');
}

function toggleGuidanceAudio() {
  if (!('speechSynthesis' in window)) {
    showToast('Voice read-aloud is not supported in this browser.', false);
    return;
  }

  if (window.speechSynthesis.speaking) {
    stopGuidanceAudio();
    return;
  }

  const textToRead = `Apply for Aswesuma. Before you begin your application, please have the following 5 items ready:
  Item 1: National Identity Card numbers of yourself and family members.
  Item 2: Household information and school attendance of children.
  Item 3: Monthly household income, regular expenses, and electricity units.
  Item 4: Housing conditions including roof, walls, floor, and property assets.
  Item 5: Active bank account number matching your National Identity Card name.
  Important notice: Please provide accurate information about your household. Do not guess or intentionally provide incorrect information.
  When ready, click Start Application.`;

  ttsUtterance = new SpeechSynthesisUtterance(textToRead);
  ttsUtterance.rate = 0.92;
  ttsUtterance.pitch = 1.0;

  ttsUtterance.onstart = () => {
    isGuidanceSpeaking = true;
    document.getElementById('ttsIcon').textContent = '⏹️';
    document.getElementById('ttsBtnText').textContent = 'Stop / නවත්වන්න';
  };

  ttsUtterance.onend = () => {
    stopGuidanceAudio();
  };

  ttsUtterance.onerror = () => {
    stopGuidanceAudio();
  };

  window.speechSynthesis.speak(ttsUtterance);
}

function stopGuidanceAudio() {
  if ('speechSynthesis' in window && window.speechSynthesis.speaking) {
    window.speechSynthesis.cancel();
  }
  isGuidanceSpeaking = false;
  const icon = document.getElementById('ttsIcon');
  const text = document.getElementById('ttsBtnText');
  if (icon) icon.textContent = '🔊';
  if (text) text.textContent = 'Listen / අහන්න';
}

// -------------------------------------------------------------
// Section 4C: Targeted Allowances & Top-ups Landing Page Logic
// -------------------------------------------------------------
let ttsTargetedUtterance = null;
let isTargetedSpeaking = false;

window.openTargetedAllowances = async function() {
  const verId = state.activeVerificationId;
  const res = await apiFetch(`/verification/${verId}/status`);

  if (!res.ok || res.data?.data?.finalStatus !== 'VERIFIED') {
    showToast('Access restricted: You must have an officially verified DID to access Targeted Allowances.', false);
    renderWelfareHomePage();
    return;
  }

  state.activeVerifiedDid = res.data.data.did;
  stopGuidanceAudio();
  stopTargetedAudio();
  stopSamurdhiAudio();
  stopElderlyAudio();

  document.getElementById('welfareHomeView').classList.add('hidden');
  document.getElementById('welfareLockedBox').classList.add('hidden');
  document.getElementById('aswesumaGuidanceView').classList.add('hidden');
  document.getElementById('samurdhiView').classList.add('hidden');
  document.getElementById('elderlyAppView').classList.add('hidden');
  document.getElementById('aswesumaWizardContainer').classList.add('hidden');
  document.getElementById('aswesumaSuccessView').classList.add('hidden');
  document.getElementById('targetedHelpDrawer').classList.add('hidden');
  document.getElementById('allowanceInfoModal').classList.add('hidden');
  document.getElementById('allowanceApplyModal').classList.add('hidden');
  document.getElementById('samurdhiModal').classList.add('hidden');
  document.getElementById('targetedAllowancesView').classList.remove('hidden');

  window.scrollTo({ top: 0, behavior: 'smooth' });
};

function setTargetedLanguage(lang) {
  const view = document.getElementById('targetedAllowancesView');
  const btnBoth = document.getElementById('btnTargetedLangBoth');
  const btnEn = document.getElementById('btnTargetedLangEn');
  const btnSi = document.getElementById('btnTargetedLangSi');

  btnBoth.classList.remove('active');
  btnEn.classList.remove('active');
  btnSi.classList.remove('active');

  view.classList.remove('lang-mode-en', 'lang-mode-si');

  if (lang === 'en') {
    btnEn.classList.add('active');
    view.classList.add('lang-mode-en');
  } else if (lang === 'si') {
    btnSi.classList.add('active');
    view.classList.add('lang-mode-si');
  } else {
    btnBoth.classList.add('active');
  }
}

function toggleTargetedHelp() {
  const drawer = document.getElementById('targetedHelpDrawer');
  drawer.classList.toggle('hidden');
}

function toggleTargetedAudio() {
  if (!('speechSynthesis' in window)) {
    showToast('Voice read-aloud is not supported in this browser.', false);
    return;
  }

  if (window.speechSynthesis.speaking) {
    stopTargetedAudio();
    return;
  }

  const textToRead = `Targeted Allowances and Top-ups. Additional financial support may be available for elderly people, people with disabilities, and people affected by CKDu.
  Category 1: Elderly Assistance Allowance for eligible senior citizens aged 70 or above.
  Category 2: Disability Assistance Allowance for certified physical, sensory, or mental disabilities.
  Category 3: CKDu Relief Allowance for low-income individuals diagnosed with Chronic Kidney Disease.
  Before you apply, please keep your identity document, medical certificates, and bank account details ready.`;

  ttsTargetedUtterance = new SpeechSynthesisUtterance(textToRead);
  ttsTargetedUtterance.rate = 0.92;
  ttsTargetedUtterance.pitch = 1.0;

  ttsTargetedUtterance.onstart = () => {
    isTargetedSpeaking = true;
    document.getElementById('ttsTargetedIcon').textContent = '⏹️';
    document.getElementById('ttsTargetedBtnText').textContent = 'Stop / නවත්වන්න';
  };

  ttsTargetedUtterance.onend = () => {
    stopTargetedAudio();
  };

  ttsTargetedUtterance.onerror = () => {
    stopTargetedAudio();
  };

  window.speechSynthesis.speak(ttsTargetedUtterance);
}

function stopTargetedAudio() {
  if ('speechSynthesis' in window && window.speechSynthesis.speaking) {
    window.speechSynthesis.cancel();
  }
  isTargetedSpeaking = false;
  const icon = document.getElementById('ttsTargetedIcon');
  const text = document.getElementById('ttsTargetedBtnText');
  if (icon) icon.textContent = '🔊';
  if (text) text.textContent = 'Listen / අහන්න';
}

window.showAllowanceInfoModal = function(type) {
  const modal = document.getElementById('allowanceInfoModal');
  const titleEl = document.getElementById('modalAllowanceTitle');
  const bodyEl = document.getElementById('modalAllowanceBody');

  const contentMap = {
    elderly: {
      title: '🧓 Elderly Assistance Allowance / වැඩිහිටි දීමනාව',
      body: `
        <div style="margin-bottom: 1rem;">
          <div style="font-weight: 800; font-size: 0.875rem; color: var(--primary); margin-bottom: 4px;">
            👤 Who May Apply / අයදුම් කළ හැක්කේ කාටද:
          </div>
          <p style="font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 2px;">
            Senior citizens aged 70 or above who belong to low-income households in Sri Lanka.
          </p>
          <p style="font-size: 0.825rem; color: var(--text-muted); margin: 0;">
            ශ්‍රී ලංකාවේ අඩු ආදායම්ලාභී පවුල්වල වෙසෙන වයස අවුරුදු 70 හෝ ඊට වැඩි ජ්‍යෙෂ්ඨ පුරවැසියන්.
          </p>
        </div>

        <div style="margin-bottom: 1rem;">
          <div style="font-weight: 800; font-size: 0.875rem; color: var(--primary); margin-bottom: 4px;">
            ✅ Main Eligibility Requirements / ප්‍රධාන සුදුසුකම්:
          </div>
          <ul style="padding-left: 1.25rem; font-size: 0.825rem; color: var(--text-secondary); line-height: 1.5; margin: 0;">
            <li>Must be a permanent citizen aged 70 years or older (වයස අවුරුදු 70 හෝ ඊට වැඩි විය යුතුය)</li>
            <li>Verified low household income criteria (සත්‍යාපිත අඩු ගෘහ ආදායම් මට්ටම)</li>
            <li>Not receiving an active government pension (රජයේ විශ්‍රාම වැටුපක් නොලබන්නෙකු විය යුතුය)</li>
          </ul>
        </div>

        <div style="margin-bottom: 1rem;">
          <div style="font-weight: 800; font-size: 0.875rem; color: var(--primary); margin-bottom: 4px;">
            📄 Documents Generally Required / සාමාන්‍යයෙන් අවශ්‍ය ලේඛන:
          </div>
          <ul style="padding-left: 1.25rem; font-size: 0.825rem; color: var(--text-secondary); line-height: 1.5; margin: 0;">
            <li>National Identity Card (NIC) / ජාතික හැඳුනුම්පත</li>
            <li>Official Birth Certificate / උප්පැන්න සහතිකය</li>
            <li>Active Bank Account Details (Passbook copy) / සක්‍රීය බැංකු ගිණුම් තොරතුරු</li>
          </ul>
        </div>

        <div style="margin-bottom: 1rem;">
          <div style="font-weight: 800; font-size: 0.875rem; color: var(--primary); margin-bottom: 4px;">
            🔄 What Happens After Submission / ඉදිරිපත් කිරීමෙන් පසු සිදුවන දේ:
          </div>
          <p style="font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 2px;">
            Your details are routed to your divisional Social Services &amp; Grama Niladhari officers for verification. Approved monthly allowances are transferred directly to your bank account.
          </p>
          <p style="font-size: 0.825rem; color: var(--text-muted); margin: 0;">
            ඔබගේ තොරතුරු සත්‍යාපනය සඳහා ප්‍රාදේශීය සමාජ සේවා සහ ග්‍රාම නිලධාරී වෙත යොමු කෙරේ. අනුමත මාසික දීමනා ඔබගේ බැංකු ගිණුමට සෘජුවම බැර කෙරේ.
          </p>
        </div>

        <div style="background: #f0fdfa; border-left: 3px solid var(--primary); padding: 0.75rem 1rem; border-radius: 4px; font-size: 0.8rem; color: #0f766e;">
          ℹ️ <strong>Important Notice:</strong> Your application will be reviewed after submission. Final eligibility is subject to official verification.
          <br><em>(ඔබගේ අයදුම්පත ඉදිරිපත් කිරීමෙන් පසු නිලධාරීන් විසින් සමාලෝචනය කරනු ලැබේ. අවසාන සුදුසුකම නිල සත්‍යාපනයට යටත් වේ.)</em>
        </div>
      `,
    },
    disability: {
      title: '♿ Disability Assistance Allowance / ආබාධිත දීමනාව',
      body: `
        <div style="margin-bottom: 1rem;">
          <div style="font-weight: 800; font-size: 0.875rem; color: var(--primary); margin-bottom: 4px;">
            👤 Who May Apply / අයදුම් කළ හැක්කේ කාටද:
          </div>
          <p style="font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 2px;">
            Individuals with certified physical, mental, sensory, or intellectual disabilities from low-income families.
          </p>
          <p style="font-size: 0.825rem; color: var(--text-muted); margin: 0;">
            අඩු ආදායම්ලාභී පවුල්වල වෙසෙන තහවුරු කරන ලද ශාරීරික, මානසික, සංවේදන හෝ බුද්ධිමය ආබාධ සහිත පුද්ගලයන්.
          </p>
        </div>

        <div style="margin-bottom: 1rem;">
          <div style="font-weight: 800; font-size: 0.875rem; color: var(--primary); margin-bottom: 4px;">
            ✅ Main Eligibility Requirements / ප්‍රධාන සුදුසුකම්:
          </div>
          <ul style="padding-left: 1.25rem; font-size: 0.825rem; color: var(--text-secondary); line-height: 1.5; margin: 0;">
            <li>Certified disability documented by a government medical officer / specialist (රජයේ විශේෂඥ වෛද්‍ය සහතිකය)</li>
            <li>Low household income threshold (අඩු ගෘහ ආදායම් මට්ටම)</li>
            <li>Permanent residency in the administrative division (ප්‍රදේශයේ ස්ථිර පදිංචිය)</li>
          </ul>
        </div>

        <div style="margin-bottom: 1rem;">
          <div style="font-weight: 800; font-size: 0.875rem; color: var(--primary); margin-bottom: 4px;">
            📄 Documents Generally Required / සාමාන්‍යයෙන් අවශ්‍ය ලේඛන:
          </div>
          <ul style="padding-left: 1.25rem; font-size: 0.825rem; color: var(--text-secondary); line-height: 1.5; margin: 0;">
            <li>National Identity Card or Birth Certificate / ජාතික හැඳුනුම්පත හෝ උප්පැන්න සහතිකය</li>
            <li>Government Medical Specialist Diagnosis Certificate / රජයේ විශේෂඥ වෛද්‍ය සහතිකය</li>
            <li>Active Bank Account Details / සක්‍රීය බැංකු ගිණුම් තොරතුරු</li>
          </ul>
        </div>

        <div style="margin-bottom: 1rem;">
          <div style="font-weight: 800; font-size: 0.875rem; color: var(--primary); margin-bottom: 4px;">
            🔄 What Happens After Submission / ඉදිරිපත් කිරීමෙන් පසු සිදුවන දේ:
          </div>
          <p style="font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 2px;">
            Medical records and social assessment are evaluated by the Divisional Medical &amp; Social Services committee.
          </p>
          <p style="font-size: 0.825rem; color: var(--text-muted); margin: 0;">
            වෛද්‍ය වාර්තා සහ සමාජ තක්සේරුව ප්‍රාදේශීය වෛද්‍ය හා සමාජ සේවා කමිටුව විසින් ඇගයීමට ලක් කෙරේ.
          </p>
        </div>

        <div style="background: #f0fdfa; border-left: 3px solid var(--primary); padding: 0.75rem 1rem; border-radius: 4px; font-size: 0.8rem; color: #0f766e;">
          ℹ️ <strong>Important Notice:</strong> Your application will be reviewed after submission. Final eligibility is subject to official verification.
          <br><em>(ඔබගේ අයදුම්පත ඉදිරිපත් කිරීමෙන් පසු නිලධාරීන් විසින් සමාලෝචනය කරනු ලැබේ. අවසාන සුදුසුකම නිල සත්‍යාපනයට යටත් වේ.)</em>
        </div>
      `,
    },
    ckdu: {
      title: '🩺 CKDu Relief Allowance / CKDu සහන දීමනාව',
      body: `
        <div style="margin-bottom: 1rem;">
          <div style="font-weight: 800; font-size: 0.875rem; color: var(--primary); margin-bottom: 4px;">
            👤 Who May Apply / අයදුම් කළ හැක්කේ කාටද:
          </div>
          <p style="font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 2px;">
            Low-income patients clinically diagnosed with Chronic Kidney Disease of unknown etiology (CKDu).
          </p>
          <p style="font-size: 0.825rem; color: var(--text-muted); margin: 0;">
            හඳුනා නොගත් හේතු මත හටගන්නා නිදන්ගත වකුගඩු රෝගය (CKDu) වැළඳී ඇති අඩු ආදායම්ලාභී රෝගීන්.
          </p>
        </div>

        <div style="margin-bottom: 1rem;">
          <div style="font-weight: 800; font-size: 0.875rem; color: var(--primary); margin-bottom: 4px;">
            ✅ Main Eligibility Requirements / ප්‍රධාන සුදුසුකම්:
          </div>
          <ul style="padding-left: 1.25rem; font-size: 0.825rem; color: var(--text-secondary); line-height: 1.5; margin: 0;">
            <li>Official clinical diagnosis report from a recognized government hospital (රජයේ රෝහල් වෛද්‍ය වාර්තාව)</li>
            <li>Regular hospital renal clinic attendance records (රෝහල් වකුගඩු සායන සහභාගීත්ව වාර්තා)</li>
            <li>Low household income qualification (අඩු ආදායම්ලාභී සුදුසුකම)</li>
          </ul>
        </div>

        <div style="margin-bottom: 1rem;">
          <div style="font-weight: 800; font-size: 0.875rem; color: var(--primary); margin-bottom: 4px;">
            📄 Documents Generally Required / සාමාන්‍යයෙන් අවශ්‍ය ලේඛන:
          </div>
          <ul style="padding-left: 1.25rem; font-size: 0.825rem; color: var(--text-secondary); line-height: 1.5; margin: 0;">
            <li>National Identity Card / ජාතික හැඳුනුම්පත</li>
            <li>Government Hospital CKDu Diagnosis Report / රෝහලේ වෛද්‍ය වාර්තාව</li>
            <li>Hospital Renal Clinic Card / සායනික කාඩ්පත</li>
            <li>Active Bank Account Details / සක්‍රීය බැංකු ගිණුම් තොරතුරු</li>
          </ul>
        </div>

        <div style="margin-bottom: 1rem;">
          <div style="font-weight: 800; font-size: 0.875rem; color: var(--primary); margin-bottom: 4px;">
            🔄 What Happens After Submission / ඉදිරිපත් කිරීමෙන් පසු සිදුවන දේ:
          </div>
          <p style="font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 2px;">
            The clinical registry confirms patient verification with the regional health department for continuous monthly relief assistance.
          </p>
          <p style="font-size: 0.825rem; color: var(--text-muted); margin: 0;">
            මාසික සහන ආධාර ලබා දීම සඳහා සෞඛ්‍ය දෙපාර්තමේන්තුව සමඟ සායනික වාර්තා සත්‍යාපනය කෙරේ.
          </p>
        </div>

        <div style="background: #f0fdfa; border-left: 3px solid var(--primary); padding: 0.75rem 1rem; border-radius: 4px; font-size: 0.8rem; color: #0f766e;">
          ℹ️ <strong>Important Notice:</strong> Your application will be reviewed after submission. Final eligibility is subject to official verification.
          <br><em>(ඔබගේ අයදුම්පත ඉදිරිපත් කිරීමෙන් පසු නිලධාරීන් විසින් සමාලෝචනය කරනු ලැබේ. අවසාන සුදුසුකම නිල සත්‍යාපනයට යටත් වේ.)</em>
        </div>
      `,
    },
  };

  const selected = contentMap[type] || contentMap.elderly;
  titleEl.innerHTML = selected.title;
  bodyEl.innerHTML = selected.body;
  modal.classList.remove('hidden');
};

function closeAllowanceInfoModal() {
  document.getElementById('allowanceInfoModal').classList.add('hidden');
}

// -------------------------------------------------------------
// Section 4D: Targeted Allowances Application Initiation Logic
// -------------------------------------------------------------
let activeAllowanceType = 'elderly';

window.initiateAllowanceApplication = function(type) {
  activeAllowanceType = type;
  const modal = document.getElementById('allowanceApplyModal');
  const titleEl = document.getElementById('modalApplyAllowanceTitle');
  const bodyEl = document.getElementById('modalApplyAllowanceBody');

  const names = {
    elderly: {
      en: 'Elderly Assistance Allowance',
      si: 'වැඩිහිටි දීමනාව',
      icon: '🧓',
      summary: 'Senior Citizens (70+) Monthly Support Pathway',
      docs: ['NIC / ජාතික හැඳුනුම්පත', 'Birth Certificate / උප්පැන්න සහතිකය', 'Bank Account / බැංකු ගිණුම'],
    },
    disability: {
      en: 'Disability Assistance Allowance',
      si: 'ආබාධිත දීමනාව',
      icon: '♿',
      summary: 'Disability Financial Assistance Pathway',
          docs: ['NIC or Birth Cert / හැඳුනුම්පත හෝ උප්පැන්න සහතිකය', 'Government Medical Certificate / රජයේ වෛද්‍ය සහතිකය', 'Bank Account / බැංකු ගිණුම'],
    },
    ckdu: {
      en: 'CKDu Relief Allowance',
      si: 'CKDu සහන දීමනාව',
      icon: '🩺',
      summary: 'CKDu Patient Financial Relief Pathway',
      docs: ['NIC / ජාතික හැඳුනුම්පත', 'Hospital Diagnosis Report / රෝහල් වෛද්‍ය වාර්තාව', 'Clinic Card / සායනික කාඩ්පත', 'Bank Account / බැංකු ගිණුම'],
    },
  };

  const selected = names[type] || names.elderly;
  titleEl.innerHTML = `${selected.icon} Apply: ${selected.en} / ${selected.si}`;

  bodyEl.innerHTML = `
    <div style="background: var(--bg-subtle); border: 1px solid var(--border-light); border-radius: var(--radius-md); padding: 1rem; margin-bottom: 1.25rem;">
      <div style="font-size: 0.75rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase; margin-bottom: 4px;">
        Verified Digital Identity Linked:
      </div>
      <div style="font-family: monospace; font-size: 0.9rem; font-weight: 700; color: var(--primary);">
        🔑 ${state.activeVerifiedDid || 'did:smartgrama:prototype:001'}
      </div>
    </div>

    <div style="margin-bottom: 1rem;">
      <h4 style="font-size: 0.95rem; font-weight: 800; color: var(--text-primary); margin-bottom: 4px;">
        ${selected.en} (${selected.si})
      </h4>
      <p style="font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 8px;">
        ${selected.summary}
      </p>
    </div>

    <div style="background: #f8fafc; border: 1px solid var(--border-light); border-radius: var(--radius-md); padding: 0.85rem 1rem; margin-bottom: 1rem;">
      <div style="font-weight: 700; font-size: 0.8rem; color: var(--text-primary); margin-bottom: 6px;">
        📑 Documents &amp; Information Ready:
      </div>
      <ul style="list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 4px; font-size: 0.8rem; color: var(--text-secondary);">
        ${selected.docs.map(d => `<li>✓ ${d}</li>`).join('')}
      </ul>
    </div>

    <div style="background: #fffbeb; border: 1px solid #fef3c7; border-left: 3px solid #f59e0b; padding: 0.75rem 1rem; border-radius: 4px; font-size: 0.8rem; color: #92400e;">
      ℹ️ <strong>Review Notice:</strong> Your application will be reviewed after submission. Final decisions are made by authorized officers through official verification. No automated eligibility decisions are made.
      <br><em>(ඔබගේ අයදුම්පත ඉදිරිපත් කිරීමෙන් පසු නිලධාරීන් විසින් සමාලෝචනය කරනු ලැබේ. ස්වයංක්‍රීය තීරණ ගනු නොලැබේ.)</em>
    </div>
  `;

  modal.classList.remove('hidden');
};

window.closeAllowanceApplyModal = function() {
  const modal = document.getElementById('allowanceApplyModal');
  if (modal) modal.classList.add('hidden');
};

window.handleConfirmAllowanceApply = function() {
  const names = {
    elderly: 'Elderly Assistance Allowance (වැඩිහිටි දීමනාව)',
    disability: 'Disability Assistance Allowance (ආබාධිත දීමනාව)',
    ckdu: 'CKDu Relief Allowance (CKDu සහන දීමනාව)',
  };
  const progName = names[activeAllowanceType] || 'Targeted Allowance';
  closeAllowanceApplyModal();
  if (activeAllowanceType === 'elderly') {
    openElderlyApplication();
  } else if (activeAllowanceType === 'disability') {
    openDisabilityApplication();
  } else {
    showToast(`Application pathway initiated for ${progName}. Verified DID linked: ${state.activeVerifiedDid}. Ready for review.`);
  }
};

// -------------------------------------------------------------
// Section 4F: Phase W4 — Elderly Assistance Application Logic
// -------------------------------------------------------------
let ttsElderlyUtterance = null;
let isElderlySpeaking = false;
let currentElderlyStep = 1;

window.openElderlyApplication = async function() {
  const verId = state.activeVerificationId;
  const res = await apiFetch(`/verification/${verId}/status`);

  if (!res.ok || res.data?.data?.finalStatus !== 'VERIFIED') {
    showToast('Access restricted: You must have an officially verified DID to apply for Elderly Assistance.', false);
    renderWelfareHomePage();
    return;
  }

  state.activeVerifiedDid = res.data.data.did;
  stopGuidanceAudio();
  stopTargetedAudio();
  stopSamurdhiAudio();
  stopElderlyAudio();
  stopDisabilityAudio();

  document.getElementById('welfareHomeView').classList.add('hidden');
  document.getElementById('welfareLockedBox').classList.add('hidden');
  document.getElementById('aswesumaGuidanceView').classList.add('hidden');
  document.getElementById('targetedAllowancesView').classList.add('hidden');
  document.getElementById('samurdhiView').classList.add('hidden');
  document.getElementById('disabilityAppView')?.classList.add('hidden');
  document.getElementById('aswesumaWizardContainer').classList.add('hidden');
  document.getElementById('aswesumaSuccessView').classList.add('hidden');
  document.getElementById('allowanceInfoModal').classList.add('hidden');
  document.getElementById('allowanceApplyModal').classList.add('hidden');
  document.getElementById('samurdhiModal').classList.add('hidden');

  // Reset boxes
  document.getElementById('elderlyGuidanceBox').classList.remove('hidden');
  document.getElementById('elderlyWizardBox').classList.add('hidden');
  document.getElementById('elderlySuccessBox').classList.add('hidden');
  document.getElementById('elderlyHelpDrawer').classList.add('hidden');

  document.getElementById('elderlyAppView').classList.remove('hidden');
  document.getElementById('eldWizardDidDisplay').textContent = state.activeVerifiedDid;

  // Pre-fill profile data from registration/DID if form is fresh
  prefillElderlyFormFromProfile();

  window.scrollTo({ top: 0, behavior: 'smooth' });
};

window.prefillElderlyFormFromProfile = function(profileData) {
  // If external registration REST API data is provided in future, use it; otherwise fallback to citizen state
  const data = profileData || {
    fullName: document.getElementById('didCardFullName')?.textContent || document.getElementById('inpFullName')?.value || 'Gunadasa Perera',
    nic: document.getElementById('didCardNic')?.textContent || document.getElementById('inpNicNumber')?.value || '195123400567',
    dob: document.getElementById('didCardDob')?.textContent ? '1951-08-20' : (document.getElementById('inpDob')?.value || '1951-08-20'),
    mobile: document.getElementById('didCardPhone')?.textContent || document.getElementById('inpMobile')?.value || '+94 71 889 9123',
    address: document.getElementById('didCardAddress')?.textContent || document.getElementById('inpHomeAddress')?.value || '88, Temple Road, Yakkala',
    province: 'Western',
    district: document.getElementById('didCardDistrict')?.textContent || document.getElementById('inpDistrict')?.value || 'Gampaha',
    dsDivision: 'Gampaha',
    gnDivision: document.getElementById('didCardGn')?.textContent || document.getElementById('inpGnDivision')?.value || 'Yakkala West',
  };

  const setVal = (id, v) => {
    const el = document.getElementById(id);
    if (el && (!el.value || el.value === '')) el.value = v;
  };

  setVal('eldFullName', data.fullName);
  setVal('eldNic', data.nic);
  setVal('eldDob', data.dob);
  setVal('eldMobile', data.mobile);
  setVal('eldAddress', data.address);
  setVal('eldProvince', data.province || 'Western');
  setVal('eldDistrict', data.district);
  setVal('eldDsDivision', data.dsDivision);
  setVal('eldGnDivision', data.gnDivision);
  setVal('eldAccountHolderName', data.fullName);

  computeElderlyAgeFromDob();
};

function computeElderlyAgeFromDob() {
  const dobVal = document.getElementById('eldDob')?.value;
  const ageEl = document.getElementById('eldAge');
  if (!dobVal || !ageEl) return;

  const dob = new Date(dobVal);
  if (isNaN(dob.getTime())) return;

  const diffMs = Date.now() - dob.getTime();
  const ageDate = new Date(diffMs);
  const calculatedAge = Math.abs(ageDate.getUTCFullYear() - 1970);
  if (calculatedAge > 0 && calculatedAge < 130) {
    ageEl.value = calculatedAge;
  }
}

window.startElderlyWizard = function() {
  document.getElementById('elderlyGuidanceBox').classList.add('hidden');
  document.getElementById('elderlyWizardBox').classList.remove('hidden');
  jumpToElderlyStep(1);
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

window.jumpToElderlyStep = function(step) {
  if (step < 1) step = 1;
  if (step > 6) step = 6;

  // Validate when jumping forward
  if (step > currentElderlyStep && !validateElderlyStep(currentElderlyStep)) {
    return;
  }

  currentElderlyStep = step;

  // Hide all step panes, show active
  for (let i = 1; i <= 6; i++) {
    const pane = document.getElementById(`eldStepPane${i}`);
    const dot = document.getElementById(`eldDot${i}`);
    if (pane) pane.classList.toggle('hidden', i !== step);
    if (dot) {
      dot.classList.toggle('active', i === step);
      dot.classList.toggle('completed', i < step);
    }
  }

  // Update progress fill & tag
  const fill = document.getElementById('eldStepperProgressFill');
  const tag = document.getElementById('eldStepIndicator');
  const pct = Math.round(((step - 1) / 5) * 100);
  if (fill) fill.style.width = `${Math.max(16, pct)}%`;
  if (tag) tag.textContent = `Step ${step} of 6`;

  // Navigation buttons
  const btnPrev = document.getElementById('btnElderlyPrev');
  const btnNext = document.getElementById('btnElderlyNext');
  const btnSubmit = document.getElementById('btnSubmitElderlyFinal');

  if (btnPrev) btnPrev.style.visibility = step === 1 ? 'hidden' : 'visible';

  if (step === 6) {
    if (btnNext) btnNext.classList.add('hidden');
    if (btnSubmit) btnSubmit.classList.remove('hidden');
    updateElderlyReviewSummary();
  } else {
    if (btnNext) btnNext.classList.remove('hidden');
    if (btnSubmit) btnSubmit.classList.add('hidden');
  }

  window.scrollTo({ top: 0, behavior: 'smooth' });
};

window.navigateElderlyStep = function(direction) {
  if (direction > 0 && !validateElderlyStep(currentElderlyStep)) {
    return;
  }
  jumpToElderlyStep(currentElderlyStep + direction);
};

function validateElderlyStep(step) {
  if (step === 1) {
    const name = document.getElementById('eldFullName')?.value?.trim();
    const nic = document.getElementById('eldNic')?.value?.trim();
    const dob = document.getElementById('eldDob')?.value;
    const age = document.getElementById('eldAge')?.value;
    const mobile = document.getElementById('eldMobile')?.value?.trim();

    if (!name) {
      showToast('Please enter your Full Name. (කරුණාකර සම්පූර්ණ නම ඇතුළත් කරන්න.)', false);
      return false;
    }
    if (!nic) {
      showToast('Please enter your NIC number. (කරුණාකර ජාතික හැඳුනුම්පත් අංකය ඇතුළත් කරන්න.)', false);
      return false;
    }
    if (!dob) {
      showToast('Please enter your Date of Birth. (කරුණාකර උපන් දිනය ඇතුළත් කරන්න.)', false);
      return false;
    }
    if (!age || Number(age) <= 0) {
      showToast('Please enter a valid age. (කරුණාකර නිවැරදි වයස ඇතුළත් කරන්න.)', false);
      return false;
    }
    if (!mobile) {
      showToast('Please enter your mobile phone number. (කරුණාකර ජංගම දුරකථන අංකය ඇතුළත් කරන්න.)', false);
      return false;
    }
  } else if (step === 2) {
    const addr = document.getElementById('eldAddress')?.value?.trim();
    const dist = document.getElementById('eldDistrict')?.value?.trim();
    const ds = document.getElementById('eldDsDivision')?.value?.trim();
    const gn = document.getElementById('eldGnDivision')?.value?.trim();

    if (!addr) {
      showToast('Please enter your permanent address. (කරුණාකර ලිපිනය ඇතුළත් කරන්න.)', false);
      return false;
    }
    if (!dist) {
      showToast('Please enter your district. (කරුණාකර දිස්ත්‍රික්කය ඇතුළත් කරන්න.)', false);
      return false;
    }
    if (!ds) {
      showToast('Please enter your DS Division. (කරුණාකර ප්‍රාදේශීය ලේකම් කොට්ඨාසය ඇතුළත් කරන්න.)', false);
      return false;
    }
    if (!gn) {
      showToast('Please enter your Grama Niladhari Division. (කරුණාකර ග්‍රාම නිලධාරී වසම ඇතුළත් කරන්න.)', false);
      return false;
    }
  } else if (step === 3) {
    const members = document.getElementById('eldHouseholdMembers')?.value;
    const income = document.getElementById('eldMonthlyIncome')?.value;
    const source = document.getElementById('eldMainIncomeSource')?.value?.trim();

    if (!members || Number(members) < 1) {
      showToast('Please specify number of household members.', false);
      return false;
    }
    if (income === '' || Number(income) < 0) {
      showToast('Please enter your estimated monthly household income.', false);
      return false;
    }
    if (!source) {
      showToast('Please specify your main source of income.', false);
      return false;
    }
  } else if (step === 4) {
    const bank = document.getElementById('eldBankName')?.value?.trim();
    const branch = document.getElementById('eldBranch')?.value?.trim();
    const acc = document.getElementById('eldAccountNumber')?.value?.trim();
    const holder = document.getElementById('eldAccountHolderName')?.value?.trim();

    if (!bank) {
      showToast('Please select your bank name.', false);
      return false;
    }
    if (!branch) {
      showToast('Please enter your branch name.', false);
      return false;
    }
    if (!acc) {
      showToast('Please enter your account number.', false);
      return false;
    }
    if (!holder) {
      showToast('Please enter account holder name.', false);
      return false;
    }
  }
  return true;
}

window.toggleElderlyWelfareOther = function(val) {
  const wrap = document.getElementById('eldExistingWelfareOtherWrap');
  if (wrap) wrap.classList.toggle('hidden', val !== 'Other');
};

window.simulateElderlyDocUpload = function(type) {
  const nicVal = document.getElementById('eldNic')?.value || '195123400567';
  if (type === 'nic') {
    const ref = `DOC-NIC-${nicVal}`;
    document.getElementById('eldDocNicRef').value = ref;
    document.getElementById('badgeEldNicStatus').textContent = 'Submitted';
    document.getElementById('badgeEldNicStatus').className = 'badge-status-submitted';
    showToast(`NIC reference recorded: ${ref}`);
  } else if (type === 'bc') {
    const ref = `DOC-BC-${nicVal}`;
    document.getElementById('eldDocBcRef').value = ref;
    document.getElementById('badgeEldBcStatus').textContent = 'Submitted';
    document.getElementById('badgeEldBcStatus').className = 'badge-status-submitted';
    showToast(`Birth Certificate reference recorded: ${ref}`);
  } else if (type === 'bank') {
    const bank = (document.getElementById('eldBankName')?.value || 'BOC').replace(/\s+/g, '');
    const ref = `DOC-BANK-${bank}-${Math.floor(100000 + Math.random() * 900000)}`;
    document.getElementById('eldDocBankRef').value = ref;
    document.getElementById('badgeEldBankStatus').textContent = 'Submitted';
    document.getElementById('badgeEldBankStatus').className = 'badge-status-submitted';
    showToast(`Bank details reference recorded: ${ref}`);
  }
};

function updateElderlyReviewSummary() {
  const get = (id) => document.getElementById(id)?.value || '';

  // 1. Applicant
  const appEl = document.getElementById('eldSummaryApplicant');
  if (appEl) {
    appEl.innerHTML = `
      <div class="summary-item-row"><span class="summary-item-label">Full Name / සම්පූර්ණ නම:</span><span class="summary-item-val">${get('eldFullName')}</span></div>
      <div class="summary-item-row"><span class="summary-item-label">NIC / හැඳුනුම්පත:</span><span class="summary-item-val">${get('eldNic')}</span></div>
      <div class="summary-item-row"><span class="summary-item-label">Date of Birth / උපන් දිනය:</span><span class="summary-item-val">${get('eldDob')} (${get('eldAge')} yrs)</span></div>
      <div class="summary-item-row"><span class="summary-item-label">Gender / ස්ත්‍රී-පුරුෂ:</span><span class="summary-item-val">${get('eldGender')}</span></div>
      <div class="summary-item-row"><span class="summary-item-label">Mobile / දුරකථනය:</span><span class="summary-item-val">${get('eldMobile')}</span></div>
    `;
  }

  // 2. Address
  const addrEl = document.getElementById('eldSummaryAddress');
  if (addrEl) {
    addrEl.innerHTML = `
      <div class="summary-item-row"><span class="summary-item-label">Address / ලිපිනය:</span><span class="summary-item-val">${get('eldAddress')}</span></div>
      <div class="summary-item-row"><span class="summary-item-label">Province / පළාත:</span><span class="summary-item-val">${get('eldProvince')}</span></div>
      <div class="summary-item-row"><span class="summary-item-label">District / දිස්ත්‍රික්කය:</span><span class="summary-item-val">${get('eldDistrict')}</span></div>
      <div class="summary-item-row"><span class="summary-item-label">DS Division / ප්‍රා.ලේ. කොට්ඨාසය:</span><span class="summary-item-val">${get('eldDsDivision')}</span></div>
      <div class="summary-item-row"><span class="summary-item-label">GN Division / ග්‍රාම නිලධාරී වසම:</span><span class="summary-item-val">${get('eldGnDivision')}</span></div>
    `;
  }

  // 3. Household
  const houseEl = document.getElementById('eldSummaryHousehold');
  if (houseEl) {
    const welfare = get('eldExistingWelfare') === 'Other' ? `Other (${get('eldExistingWelfareOther')})` : get('eldExistingWelfare');
    houseEl.innerHTML = `
      <div class="summary-item-row"><span class="summary-item-label">Household Members / පවුලේ සාමාජිකයන්:</span><span class="summary-item-val">${get('eldHouseholdMembers')}</span></div>
      <div class="summary-item-row"><span class="summary-item-label">Monthly Income / මාසික ආදායම:</span><span class="summary-item-val">Rs. ${Number(get('eldMonthlyIncome')).toLocaleString()}</span></div>
      <div class="summary-item-row"><span class="summary-item-label">Main Income Source / ප්‍රධාන ආදායම් මාර්ගය:</span><span class="summary-item-val">${get('eldMainIncomeSource')}</span></div>
      <div class="summary-item-row"><span class="summary-item-label">Existing Welfare / ලබන සුබසාධන:</span><span class="summary-item-val">${welfare}</span></div>
      <div class="summary-item-row"><span class="summary-item-label">Aswesuma Beneficiary / අස්වැසුම ප්‍රතිලාභී:</span><span class="summary-item-val">${get('eldAswesumaBeneficiary')}</span></div>
      <div class="summary-item-row"><span class="summary-item-label">Government Pension / රජයේ විශ්‍රාම වැටුප්:</span><span class="summary-item-val">${get('eldPensionReceived')}</span></div>
      <div class="summary-item-row"><span class="summary-item-label">Other Support / වෙනත් ආධාර:</span><span class="summary-item-val">${get('eldOtherIncomeSupport')}</span></div>
    `;
  }

  // 4. Bank
  const bankEl = document.getElementById('eldSummaryBank');
  if (bankEl) {
    const rawAcc = get('eldAccountNumber');
    const masked = rawAcc.length > 4 ? `******${rawAcc.slice(-4)}` : rawAcc;
    bankEl.innerHTML = `
      <div class="summary-item-row"><span class="summary-item-label">Bank / බැංකුව:</span><span class="summary-item-val">${get('eldBankName')}</span></div>
      <div class="summary-item-row"><span class="summary-item-label">Branch / ශාඛාව:</span><span class="summary-item-val">${get('eldBranch')}</span></div>
      <div class="summary-item-row"><span class="summary-item-label">Account No / ගිණුම් අංකය:</span><span class="summary-item-val">${masked}</span></div>
      <div class="summary-item-row"><span class="summary-item-label">Account Holder / ගිණුම් හිමියා:</span><span class="summary-item-val">${get('eldAccountHolderName')}</span></div>
    `;
  }

  // 5. Docs
  const docsEl = document.getElementById('eldSummaryDocs');
  if (docsEl) {
    docsEl.innerHTML = `
      <div class="summary-item-row"><span class="summary-item-label">NIC Reference / හැඳුනුම්පත් යොමුව:</span><span class="summary-item-val">✓ ${get('eldDocNicRef')}</span></div>
      <div class="summary-item-row"><span class="summary-item-label">Birth Certificate / උප්පැන්න සහතික යොමුව:</span><span class="summary-item-val">✓ ${get('eldDocBcRef')}</span></div>
      <div class="summary-item-row"><span class="summary-item-label">Bank Details / බැංකු තොරතුරු යොමුව:</span><span class="summary-item-val">✓ ${get('eldDocBankRef')}</span></div>
    `;
  }
}

window.toggleElderlySubmitBtn = function() {
  const chk = document.getElementById('chkElderlyDeclaration');
  const btn = document.getElementById('btnSubmitElderlyFinal');
  if (btn) btn.disabled = !chk?.checked;
};

window.handleElderlySubmit = async function() {
  const get = (id) => document.getElementById(id)?.value?.trim() || '';

  const payload = {
    did: state.activeVerifiedDid || 'did:smartgrama:prototype:001',
    applicant: {
      fullName: get('eldFullName'),
      nic: get('eldNic'),
      dateOfBirth: get('eldDob'),
      age: Number(get('eldAge')) || 70,
      gender: get('eldGender'),
      mobile: get('eldMobile'),
    },
    address: {
      address: get('eldAddress'),
      province: get('eldProvince'),
      district: get('eldDistrict'),
      dsDivision: get('eldDsDivision'),
      gnDivision: get('eldGnDivision'),
    },
    household: {
      householdMembers: Number(get('eldHouseholdMembers')) || 1,
      monthlyIncome: Number(get('eldMonthlyIncome')) || 0,
      mainIncomeSource: get('eldMainIncomeSource'),
      existingWelfare: get('eldExistingWelfare'),
      existingWelfareOther: get('eldExistingWelfareOther'),
      aswesumaBeneficiary: get('eldAswesumaBeneficiary'),
      pensionReceived: get('eldPensionReceived'),
      otherIncomeSupport: get('eldOtherIncomeSupport'),
    },
    bank: {
      bankName: get('eldBankName'),
      branch: get('eldBranch'),
      accountNumber: get('eldAccountNumber'),
      accountHolderName: get('eldAccountHolderName'),
    },
    documents: {
      nic: { status: 'Submitted', ref: get('eldDocNicRef') },
      birthCertificate: { status: 'Submitted', ref: get('eldDocBcRef') },
      bankDetails: { status: 'Submitted', ref: get('eldDocBankRef') },
    },
  };

  try {
    const res = await apiFetch('/welfare/elderly/applications', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    if (res.ok && res.data?.success) {
      const app = res.data.data;
      document.getElementById('eldSuccessAppId').textContent = app.applicationId;
      document.getElementById('eldSuccessDate').textContent = new Date(app.submittedAt).toLocaleString();
      document.getElementById('eldSuccessDid').textContent = app.did;

      document.getElementById('elderlyWizardBox').classList.add('hidden');
      document.getElementById('elderlySuccessBox').classList.remove('hidden');

      showToast(`Elderly Assistance Application ${app.applicationId} submitted successfully! Status: PENDING REVIEW.`);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      showToast(res.data?.error || 'Failed to submit application. Please check your information.', false);
    }
  } catch (err) {
    showToast('Failed to connect to server. Please try again.', false);
  }
};

function setElderlyLanguage(lang) {
  const view = document.getElementById('elderlyAppView');
  const btnBoth = document.getElementById('btnElderlyLangBoth');
  const btnEn = document.getElementById('btnElderlyLangEn');
  const btnSi = document.getElementById('btnElderlyLangSi');

  btnBoth.classList.remove('active');
  btnEn.classList.remove('active');
  btnSi.classList.remove('active');

  view.classList.remove('lang-mode-en', 'lang-mode-si');

  if (lang === 'en') {
    btnEn.classList.add('active');
    view.classList.add('lang-mode-en');
  } else if (lang === 'si') {
    btnSi.classList.add('active');
    view.classList.add('lang-mode-si');
  } else {
    btnBoth.classList.add('active');
  }
}

function toggleElderlyHelp() {
  const drawer = document.getElementById('elderlyHelpDrawer');
  drawer.classList.toggle('hidden');
}

function toggleElderlyAudio() {
  if (!('speechSynthesis' in window)) {
    showToast('Voice read-aloud is not supported in this browser.', false);
    return;
  }

  if (window.speechSynthesis.speaking) {
    stopElderlyAudio();
    return;
  }

  const textToRead = `Elderly Assistance Allowance application. This support is intended for senior citizens aged 70 or above from low-income households.
  Before starting, please keep your National Identity Card, Birth Certificate, and Bank Account details ready.
  Your application will be reviewed by authorized officers before a final decision is made.`;

  ttsElderlyUtterance = new SpeechSynthesisUtterance(textToRead);
  ttsElderlyUtterance.rate = 0.92;
  ttsElderlyUtterance.pitch = 1.0;

  ttsElderlyUtterance.onstart = () => {
    isElderlySpeaking = true;
    document.getElementById('ttsElderlyIcon').textContent = '⏹️';
    document.getElementById('ttsElderlyBtnText').textContent = 'Stop / නවත්වන්න';
  };

  ttsElderlyUtterance.onend = () => {
    stopElderlyAudio();
  };

  ttsElderlyUtterance.onerror = () => {
    stopElderlyAudio();
  };

  window.speechSynthesis.speak(ttsElderlyUtterance);
}

function stopElderlyAudio() {
  if ('speechSynthesis' in window && window.speechSynthesis.speaking) {
    window.speechSynthesis.cancel();
  }
  isElderlySpeaking = false;
  const icon = document.getElementById('ttsElderlyIcon');
  const text = document.getElementById('ttsElderlyBtnText');
  if (icon) icon.textContent = '🔊';
  if (text) text.textContent = 'Listen / අහන්න';
}

// -------------------------------------------------------------
// Section 4G: Phase W5 — Disability Assistance Application Logic
// -------------------------------------------------------------
let ttsDisabilityUtterance = null;
let isDisabilitySpeaking = false;
let currentDisabilityStep = 1;

window.openDisabilityApplication = async function() {
  const verId = state.activeVerificationId;
  const res = await apiFetch(`/verification/${verId}/status`);

  if (!res.ok || res.data?.data?.finalStatus !== 'VERIFIED') {
    showToast('Access restricted: You must have an officially verified DID to apply for Disability Assistance.', false);
    renderWelfareHomePage();
    return;
  }

  state.activeVerifiedDid = res.data.data.did;
  stopGuidanceAudio();
  stopTargetedAudio();
  stopSamurdhiAudio();
  stopElderlyAudio();
  stopDisabilityAudio();

  document.getElementById('welfareHomeView').classList.add('hidden');
  document.getElementById('welfareLockedBox').classList.add('hidden');
  document.getElementById('aswesumaGuidanceView').classList.add('hidden');
  document.getElementById('targetedAllowancesView').classList.add('hidden');
  document.getElementById('samurdhiView').classList.add('hidden');
  document.getElementById('elderlyAppView')?.classList.add('hidden');
  document.getElementById('aswesumaWizardContainer').classList.add('hidden');
  document.getElementById('aswesumaSuccessView').classList.add('hidden');
  document.getElementById('allowanceInfoModal').classList.add('hidden');
  document.getElementById('allowanceApplyModal').classList.add('hidden');
  document.getElementById('samurdhiModal').classList.add('hidden');

  // Reset boxes
  document.getElementById('disabilityGuidanceBox').classList.remove('hidden');
  document.getElementById('disabilityWizardBox').classList.add('hidden');
  document.getElementById('disabilitySuccessBox').classList.add('hidden');
  document.getElementById('disabilityHelpDrawer').classList.add('hidden');

  document.getElementById('disabilityAppView').classList.remove('hidden');
  document.getElementById('disWizardDidDisplay').textContent = state.activeVerifiedDid;

  // Pre-fill profile data
  prefillDisabilityFormFromProfile();

  window.scrollTo({ top: 0, behavior: 'smooth' });
};

window.prefillDisabilityFormFromProfile = function(profileData) {
  const data = profileData || {
    fullName: document.getElementById('didCardFullName')?.textContent || document.getElementById('inpFullName')?.value || 'Nimal Jayasinghe',
    nic: document.getElementById('didCardNic')?.textContent || document.getElementById('inpNicNumber')?.value || '198421500432',
    dob: document.getElementById('didCardDob')?.textContent ? '1984-03-12' : (document.getElementById('inpDob')?.value || '1984-03-12'),
    mobile: document.getElementById('didCardPhone')?.textContent || document.getElementById('inpMobile')?.value || '+94 77 334 5566',
    address: document.getElementById('didCardAddress')?.textContent || document.getElementById('inpHomeAddress')?.value || '42, Samagi Mawatha, Yakkala',
    province: 'Western',
    district: document.getElementById('didCardDistrict')?.textContent || document.getElementById('inpDistrict')?.value || 'Gampaha',
    dsDivision: 'Gampaha',
    gnDivision: document.getElementById('didCardGn')?.textContent || document.getElementById('inpGnDivision')?.value || 'Yakkala West',
  };

  const setVal = (id, v) => {
    const el = document.getElementById(id);
    if (el && (!el.value || el.value === '')) el.value = v;
  };

  setVal('disFullName', data.fullName);
  setVal('disNic', data.nic);
  setVal('disDob', data.dob);
  setVal('disMobile', data.mobile);
  setVal('disAddress', data.address);
  setVal('disProvince', data.province || 'Western');
  setVal('disDistrict', data.district);
  setVal('disDsDivision', data.dsDivision);
  setVal('disGnDivision', data.gnDivision);
  setVal('disAccountHolderName', data.fullName);

  computeDisabilityAgeFromDob();
};

function computeDisabilityAgeFromDob() {
  const dobVal = document.getElementById('disDob')?.value;
  const ageEl = document.getElementById('disAge');
  if (!dobVal || !ageEl) return;

  const dob = new Date(dobVal);
  if (isNaN(dob.getTime())) return;

  const diffMs = Date.now() - dob.getTime();
  const ageDate = new Date(diffMs);
  const calculatedAge = Math.abs(ageDate.getUTCFullYear() - 1970);
  if (calculatedAge > 0 && calculatedAge < 130) {
    ageEl.value = calculatedAge;
  }
}

window.startDisabilityWizard = function() {
  document.getElementById('disabilityGuidanceBox').classList.add('hidden');
  document.getElementById('disabilityWizardBox').classList.remove('hidden');
  jumpToDisabilityStep(1);
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

window.jumpToDisabilityStep = function(step) {
  if (step < 1) step = 1;
  if (step > 6) step = 6;

  // Validate when jumping forward
  if (step > currentDisabilityStep && !validateDisabilityStep(currentDisabilityStep)) {
    return;
  }

  currentDisabilityStep = step;

  // Hide all step panes, show active
  for (let i = 1; i <= 6; i++) {
    const pane = document.getElementById(`disStepPane${i}`);
    const dot = document.getElementById(`disDot${i}`);
    if (pane) pane.classList.toggle('hidden', i !== step);
    if (dot) {
      dot.classList.toggle('active', i === step);
      dot.classList.toggle('completed', i < step);
    }
  }

  // Update progress fill & tag
  const fill = document.getElementById('disStepperProgressFill');
  const tag = document.getElementById('disStepIndicator');
  const pct = Math.round(((step - 1) / 5) * 100);
  if (fill) fill.style.width = `${Math.max(16, pct)}%`;
  if (tag) tag.textContent = `Step ${step} of 6`;

  // Navigation buttons
  const btnPrev = document.getElementById('btnDisabilityPrev');
  const btnNext = document.getElementById('btnDisabilityNext');
  const btnSubmit = document.getElementById('btnSubmitDisabilityFinal');

  if (btnPrev) btnPrev.style.visibility = step === 1 ? 'hidden' : 'visible';

  if (step === 6) {
    if (btnNext) btnNext.classList.add('hidden');
    if (btnSubmit) btnSubmit.classList.remove('hidden');
    updateDisabilityReviewSummary();
  } else {
    if (btnNext) btnNext.classList.remove('hidden');
    if (btnSubmit) btnSubmit.classList.add('hidden');
  }

  window.scrollTo({ top: 0, behavior: 'smooth' });
};

window.navigateDisabilityStep = function(direction) {
  if (direction > 0 && !validateDisabilityStep(currentDisabilityStep)) {
    return;
  }
  jumpToDisabilityStep(currentDisabilityStep + direction);
};

function validateDisabilityStep(step) {
  if (step === 1) {
    const name = document.getElementById('disFullName')?.value?.trim();
    const nic = document.getElementById('disNic')?.value?.trim();
    const dob = document.getElementById('disDob')?.value;
    const age = document.getElementById('disAge')?.value;
    const mobile = document.getElementById('disMobile')?.value?.trim();
    const type = document.getElementById('disType')?.value?.trim();

    if (!name) {
      showToast('Please enter your Full Name. (කරුණාකර සම්පූර්ණ නම ඇතුළත් කරන්න.)', false);
      return false;
    }
    if (!nic) {
      showToast('Please enter your NIC number. (කරුණාකර ජාතික හැඳුනුම්පත් අංකය ඇතුළත් කරන්න.)', false);
      return false;
    }
    if (!dob) {
      showToast('Please enter your Date of Birth. (කරුණාකර උපන් දිනය ඇතුළත් කරන්න.)', false);
      return false;
    }
    if (!age || Number(age) <= 0) {
      showToast('Please enter a valid age. (කරුණාකර නිවැරදි වයස ඇතුළත් කරන්න.)', false);
      return false;
    }
    if (!mobile) {
      showToast('Please enter your mobile phone number. (කරුණාකර ජංගම දුරකථන අංකය ඇතුළත් කරන්න.)', false);
      return false;
    }
    if (!type) {
      showToast('Please select disability category.', false);
      return false;
    }
  } else if (step === 2) {
    const addr = document.getElementById('disAddress')?.value?.trim();
    const dist = document.getElementById('disDistrict')?.value?.trim();
    const ds = document.getElementById('disDsDivision')?.value?.trim();
    const gn = document.getElementById('disGnDivision')?.value?.trim();

    if (!addr) {
      showToast('Please enter your permanent address. (කරුණාකර ලිපිනය ඇතුළත් කරන්න.)', false);
      return false;
    }
    if (!dist) {
      showToast('Please enter your district. (කරුණාකර දිස්ත්‍රික්කය ඇතුළත් කරන්න.)', false);
      return false;
    }
    if (!ds) {
      showToast('Please enter your DS Division. (කරුණාකර ප්‍රාදේශීය ලේකම් කොට්ඨාසය ඇතුළත් කරන්න.)', false);
      return false;
    }
    if (!gn) {
      showToast('Please enter your Grama Niladhari Division. (කරුණාකර ග්‍රාම නිලධාරී වසම ඇතුළත් කරන්න.)', false);
      return false;
    }
  } else if (step === 3) {
    const members = document.getElementById('disHouseholdMembers')?.value;
    const income = document.getElementById('disMonthlyIncome')?.value;
    const source = document.getElementById('disMainIncomeSource')?.value?.trim();

    if (!members || Number(members) < 1) {
      showToast('Please specify number of household members.', false);
      return false;
    }
    if (income === '' || Number(income) < 0) {
      showToast('Please enter your estimated monthly household income.', false);
      return false;
    }
    if (!source) {
      showToast('Please specify your main source of income.', false);
      return false;
    }
  } else if (step === 4) {
    const bank = document.getElementById('disBankName')?.value?.trim();
    const branch = document.getElementById('disBranch')?.value?.trim();
    const acc = document.getElementById('disAccountNumber')?.value?.trim();
    const holder = document.getElementById('disAccountHolderName')?.value?.trim();

    if (!bank) {
      showToast('Please select your bank name.', false);
      return false;
    }
    if (!branch) {
      showToast('Please enter your branch name.', false);
      return false;
    }
    if (!acc) {
      showToast('Please enter your account number.', false);
      return false;
    }
    if (!holder) {
      showToast('Please enter account holder name.', false);
      return false;
    }
  }
  return true;
}

window.toggleDisabilityWelfareOther = function(val) {
  const wrap = document.getElementById('disExistingWelfareOtherWrap');
  if (wrap) wrap.classList.toggle('hidden', val !== 'Other');
};

window.simulateDisabilityDocUpload = function(type) {
  const nicVal = document.getElementById('disNic')?.value || '198421500432';
  if (type === 'nic') {
    const ref = `DOC-NIC-${nicVal}`;
    document.getElementById('disDocNicRef').value = ref;
    document.getElementById('badgeDisNicStatus').textContent = 'Submitted';
    document.getElementById('badgeDisNicStatus').className = 'badge-status-submitted';
    showToast(`NIC reference recorded: ${ref}`);
  } else if (type === 'med') {
    const ref = `DOC-MED-HOSP-${nicVal.slice(-6)}`;
    document.getElementById('disDocMedRef').value = ref;
    document.getElementById('badgeDisMedStatus').textContent = 'Submitted';
    document.getElementById('badgeDisMedStatus').className = 'badge-status-submitted';
    showToast(`Medical Certificate reference recorded: ${ref}`);
  } else if (type === 'bank') {
    const bank = (document.getElementById('disBankName')?.value || 'BOC').replace(/\s+/g, '');
    const ref = `DOC-BANK-${bank}-${Math.floor(100000 + Math.random() * 900000)}`;
    document.getElementById('disDocBankRef').value = ref;
    document.getElementById('badgeDisBankStatus').textContent = 'Submitted';
    document.getElementById('badgeDisBankStatus').className = 'badge-status-submitted';
    showToast(`Bank details reference recorded: ${ref}`);
  }
};

function updateDisabilityReviewSummary() {
  const get = (id) => document.getElementById(id)?.value || '';

  // 1. Applicant
  const appEl = document.getElementById('disSummaryApplicant');
  if (appEl) {
    const cardInfo = get('disCardNo') ? `<div class="summary-item-row"><span class="summary-item-label">Disability Card No / හැඳුනුම්පත් අංකය:</span><span class="summary-item-val">${get('disCardNo')}</span></div>` : '';
    appEl.innerHTML = `
      <div class="summary-item-row"><span class="summary-item-label">Full Name / සම්පූර්ණ නම:</span><span class="summary-item-val">${get('disFullName')}</span></div>
      <div class="summary-item-row"><span class="summary-item-label">NIC / හැඳුනුම්පත:</span><span class="summary-item-val">${get('disNic')}</span></div>
      <div class="summary-item-row"><span class="summary-item-label">Date of Birth / උපන් දිනය:</span><span class="summary-item-val">${get('disDob')} (${get('disAge')} yrs)</span></div>
      <div class="summary-item-row"><span class="summary-item-label">Gender / ස්ත්‍රී-පුරුෂ:</span><span class="summary-item-val">${get('disGender')}</span></div>
      <div class="summary-item-row"><span class="summary-item-label">Mobile / දුරකථනය:</span><span class="summary-item-val">${get('disMobile')}</span></div>
      <div class="summary-item-row"><span class="summary-item-label">Disability Type / ආබාධිත කාණ්ඩය:</span><span class="summary-item-val">${get('disType')}</span></div>
      <div class="summary-item-row"><span class="summary-item-label">Description / විස්තරය:</span><span class="summary-item-val">${get('disDesc') || 'N/A'}</span></div>
      ${cardInfo}
    `;
  }

  // 2. Address
  const addrEl = document.getElementById('disSummaryAddress');
  if (addrEl) {
    addrEl.innerHTML = `
      <div class="summary-item-row"><span class="summary-item-label">Address / ලිපිනය:</span><span class="summary-item-val">${get('disAddress')}</span></div>
      <div class="summary-item-row"><span class="summary-item-label">Province / පළාත:</span><span class="summary-item-val">${get('disProvince')}</span></div>
      <div class="summary-item-row"><span class="summary-item-label">District / දිස්ත්‍රික්කය:</span><span class="summary-item-val">${get('disDistrict')}</span></div>
      <div class="summary-item-row"><span class="summary-item-label">DS Division / ප්‍රා.ලේ. කොට්ඨාසය:</span><span class="summary-item-val">${get('disDsDivision')}</span></div>
      <div class="summary-item-row"><span class="summary-item-label">GN Division / ග්‍රාම නිලධාරී වසම:</span><span class="summary-item-val">${get('disGnDivision')}</span></div>
    `;
  }

  // 3. Household
  const houseEl = document.getElementById('disSummaryHousehold');
  if (houseEl) {
    const welfare = get('disExistingWelfare') === 'Other' ? `Other (${get('disExistingWelfareOther')})` : get('disExistingWelfare');
    houseEl.innerHTML = `
      <div class="summary-item-row"><span class="summary-item-label">Household Members / පවුලේ සාමාජිකයන්:</span><span class="summary-item-val">${get('disHouseholdMembers')}</span></div>
      <div class="summary-item-row"><span class="summary-item-label">Monthly Income / මාසික ආදායම:</span><span class="summary-item-val">Rs. ${Number(get('disMonthlyIncome')).toLocaleString()}</span></div>
      <div class="summary-item-row"><span class="summary-item-label">Main Income Source / ප්‍රධාන ආදායම් මාර්ගය:</span><span class="summary-item-val">${get('disMainIncomeSource')}</span></div>
      <div class="summary-item-row"><span class="summary-item-label">Existing Welfare / ලබන සුබසාධන:</span><span class="summary-item-val">${welfare}</span></div>
      <div class="summary-item-row"><span class="summary-item-label">Aswesuma Beneficiary / අස්වැසුම ප්‍රතිලාභී:</span><span class="summary-item-val">${get('disAswesumaBeneficiary')}</span></div>
      <div class="summary-item-row"><span class="summary-item-label">Caregiver Available / රැකබලා ගන්නා අයෙකු:</span><span class="summary-item-val">${get('disCaregiverAvailable')}</span></div>
      <div class="summary-item-row"><span class="summary-item-label">Other Support / වෙනත් ආධාර:</span><span class="summary-item-val">${get('disOtherIncomeSupport')}</span></div>
    `;
  }

  // 4. Bank
  const bankEl = document.getElementById('disSummaryBank');
  if (bankEl) {
    const rawAcc = get('disAccountNumber');
    const masked = rawAcc.length > 4 ? `******${rawAcc.slice(-4)}` : rawAcc;
    bankEl.innerHTML = `
      <div class="summary-item-row"><span class="summary-item-label">Bank / බැංකුව:</span><span class="summary-item-val">${get('disBankName')}</span></div>
      <div class="summary-item-row"><span class="summary-item-label">Branch / ශාඛාව:</span><span class="summary-item-val">${get('disBranch')}</span></div>
      <div class="summary-item-row"><span class="summary-item-label">Account No / ගිණුම් අංකය:</span><span class="summary-item-val">${masked}</span></div>
      <div class="summary-item-row"><span class="summary-item-label">Account Holder / ගිණුම් හිමියා:</span><span class="summary-item-val">${get('disAccountHolderName')}</span></div>
    `;
  }

  // 5. Docs
  const docsEl = document.getElementById('disSummaryDocs');
  if (docsEl) {
    docsEl.innerHTML = `
      <div class="summary-item-row"><span class="summary-item-label">NIC Reference / හැඳුනුම්පත් යොමුව:</span><span class="summary-item-val">✓ ${get('disDocNicRef')}</span></div>
      <div class="summary-item-row"><span class="summary-item-label">Medical Certificate / වෛද්‍ය සහතික යොමුව:</span><span class="summary-item-val">✓ ${get('disDocMedRef')}</span></div>
      <div class="summary-item-row"><span class="summary-item-label">Bank Details / බැංකු තොරතුරු යොමුව:</span><span class="summary-item-val">✓ ${get('disDocBankRef')}</span></div>
    `;
  }
}

window.toggleDisabilitySubmitBtn = function() {
  const chk = document.getElementById('chkDisabilityDeclaration');
  const btn = document.getElementById('btnSubmitDisabilityFinal');
  if (btn) btn.disabled = !chk?.checked;
};

window.handleDisabilitySubmit = async function() {
  const get = (id) => document.getElementById(id)?.value?.trim() || '';

  const payload = {
    did: state.activeVerifiedDid || 'did:smartgrama:prototype:001',
    applicant: {
      fullName: get('disFullName'),
      nic: get('disNic'),
      dateOfBirth: get('disDob'),
      age: Number(get('disAge')) || 40,
      gender: get('disGender'),
      mobile: get('disMobile'),
      disabilityType: get('disType'),
      disabilityDescription: get('disDesc'),
      disabilityCardNumber: get('disCardNo'),
    },
    address: {
      address: get('disAddress'),
      province: get('disProvince'),
      district: get('disDistrict'),
      dsDivision: get('disDsDivision'),
      gnDivision: get('disGnDivision'),
    },
    household: {
      householdMembers: Number(get('disHouseholdMembers')) || 1,
      monthlyIncome: Number(get('disMonthlyIncome')) || 0,
      mainIncomeSource: get('disMainIncomeSource'),
      existingWelfare: get('disExistingWelfare'),
      existingWelfareOther: get('disExistingWelfareOther'),
      aswesumaBeneficiary: get('disAswesumaBeneficiary'),
      caregiverAvailable: get('disCaregiverAvailable'),
      otherIncomeSupport: get('disOtherIncomeSupport'),
    },
    bank: {
      bankName: get('disBankName'),
      branch: get('disBranch'),
      accountNumber: get('disAccountNumber'),
      accountHolderName: get('disAccountHolderName'),
    },
    documents: {
      nic: { status: 'Submitted', ref: get('disDocNicRef') },
      medicalCertificate: { status: 'Submitted', ref: get('disDocMedRef') },
      bankDetails: { status: 'Submitted', ref: get('disDocBankRef') },
    },
  };

  try {
    const res = await apiFetch('/welfare/disability/applications', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    if (res.ok && res.data?.success) {
      const app = res.data.data;
      document.getElementById('disSuccessAppId').textContent = app.applicationId;
      document.getElementById('disSuccessDate').textContent = new Date(app.submittedAt).toLocaleString();
      document.getElementById('disSuccessDid').textContent = app.did;

      document.getElementById('disabilityWizardBox').classList.add('hidden');
      document.getElementById('disabilitySuccessBox').classList.remove('hidden');

      showToast(`Disability Assistance Application ${app.applicationId} submitted successfully! Status: PENDING REVIEW.`);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      showToast(res.data?.error || 'Failed to submit application. Please check your information.', false);
    }
  } catch (err) {
    showToast('Failed to connect to server. Please try again.', false);
  }
};

function setDisabilityLanguage(lang) {
  const view = document.getElementById('disabilityAppView');
  const btnBoth = document.getElementById('btnDisabilityLangBoth');
  const btnEn = document.getElementById('btnDisabilityLangEn');
  const btnSi = document.getElementById('btnDisabilityLangSi');

  btnBoth.classList.remove('active');
  btnEn.classList.remove('active');
  btnSi.classList.remove('active');

  view.classList.remove('lang-mode-en', 'lang-mode-si');

  if (lang === 'en') {
    btnEn.classList.add('active');
    view.classList.add('lang-mode-en');
  } else if (lang === 'si') {
    btnSi.classList.add('active');
    view.classList.add('lang-mode-si');
  } else {
    btnBoth.classList.add('active');
  }
}

function toggleDisabilityHelp() {
  const drawer = document.getElementById('disabilityHelpDrawer');
  drawer.classList.toggle('hidden');
}

function toggleDisabilityAudio() {
  if (!('speechSynthesis' in window)) {
    showToast('Voice read-aloud is not supported in this browser.', false);
    return;
  }

  if (window.speechSynthesis.speaking) {
    stopDisabilityAudio();
    return;
  }

  const textToRead = `Disability Assistance Allowance application. This financial support is intended for eligible individuals with certified disabilities from low-income households.
  Before starting, please keep your National Identity Card or Birth Certificate, Government Medical Certificate, and Bank Account details ready.
  Your application will be reviewed by authorized social service officers before a final decision is made.`;

  ttsDisabilityUtterance = new SpeechSynthesisUtterance(textToRead);
  ttsDisabilityUtterance.rate = 0.92;
  ttsDisabilityUtterance.pitch = 1.0;

  ttsDisabilityUtterance.onstart = () => {
    isDisabilitySpeaking = true;
    document.getElementById('ttsDisabilityIcon').textContent = '⏹️';
    document.getElementById('ttsDisabilityBtnText').textContent = 'Stop / නවත්වන්න';
  };

  ttsDisabilityUtterance.onend = () => {
    stopDisabilityAudio();
  };

  ttsDisabilityUtterance.onerror = () => {
    stopDisabilityAudio();
  };

  window.speechSynthesis.speak(ttsDisabilityUtterance);
}

function stopDisabilityAudio() {
  if ('speechSynthesis' in window && window.speechSynthesis.speaking) {
    window.speechSynthesis.cancel();
  }
  isDisabilitySpeaking = false;
  const icon = document.getElementById('ttsDisabilityIcon');
  const text = document.getElementById('ttsDisabilityBtnText');
  if (icon) icon.textContent = '🔊';
  if (text) text.textContent = 'Listen / අහන්න';
}

// -------------------------------------------------------------
// Section 4E: Phase W2 — Samurdhi Community & Livelihood Logic
// -------------------------------------------------------------
let ttsSamurdhiUtterance = null;
let isSamurdhiSpeaking = false;
let selectedLivelihoodOptions = new Set();

window.openSamurdhiView = async function() {
  const verId = state.activeVerificationId;
  const res = await apiFetch(`/verification/${verId}/status`);

  if (!res.ok || res.data?.data?.finalStatus !== 'VERIFIED') {
    showToast('Access restricted: You must have an officially verified DID to access Samurdhi Services.', false);
    renderWelfareHomePage();
    return;
  }

  state.activeVerifiedDid = res.data.data.did;
  stopGuidanceAudio();
  stopTargetedAudio();
  stopSamurdhiAudio();
  stopElderlyAudio();

  document.getElementById('welfareHomeView').classList.add('hidden');
  document.getElementById('welfareLockedBox').classList.add('hidden');
  document.getElementById('aswesumaGuidanceView').classList.add('hidden');
  document.getElementById('targetedAllowancesView').classList.add('hidden');
  document.getElementById('elderlyAppView').classList.add('hidden');
  document.getElementById('aswesumaWizardContainer').classList.add('hidden');
  document.getElementById('aswesumaSuccessView').classList.add('hidden');
  document.getElementById('samurdhiHelpDrawer').classList.add('hidden');
  document.getElementById('allowanceInfoModal').classList.add('hidden');
  document.getElementById('allowanceApplyModal').classList.add('hidden');
  document.getElementById('samurdhiModal').classList.add('hidden');
  document.getElementById('samurdhiView').classList.remove('hidden');

  window.scrollTo({ top: 0, behavior: 'smooth' });
};

function setSamurdhiLanguage(lang) {
  const view = document.getElementById('samurdhiView');
  const btnBoth = document.getElementById('btnSamurdhiLangBoth');
  const btnEn = document.getElementById('btnSamurdhiLangEn');
  const btnSi = document.getElementById('btnSamurdhiLangSi');

  btnBoth.classList.remove('active');
  btnEn.classList.remove('active');
  btnSi.classList.remove('active');

  view.classList.remove('lang-mode-en', 'lang-mode-si');

  if (lang === 'en') {
    btnEn.classList.add('active');
    view.classList.add('lang-mode-en');
  } else if (lang === 'si') {
    btnSi.classList.add('active');
    view.classList.add('lang-mode-si');
  } else {
    btnBoth.classList.add('active');
  }
}

function toggleSamurdhiHelp() {
  const drawer = document.getElementById('samurdhiHelpDrawer');
  drawer.classList.toggle('hidden');
}

function toggleSamurdhiAudio() {
  if (!('speechSynthesis' in window)) {
    showToast('Voice read-aloud is not supported in this browser.', false);
    return;
  }

  if (window.speechSynthesis.speaking) {
    stopSamurdhiAudio();
    return;
  }

  const textToRead = `Samurdhi Community and Livelihood Programs. Build stronger communities, save together, access financial support, and develop your livelihood through Samurdhi community programs.
  Option 1: Small Groups. Join a local group where members work together and save money.
  Option 2: Savings and Microcredit. Learn about community banking and microfinance pathways.
  Option 3: Livelihood Support. Explore opportunities for self employment, agriculture, and small business.
  Option 4: Community Activities. Participate in mutual support and development activities.`;

  ttsSamurdhiUtterance = new SpeechSynthesisUtterance(textToRead);
  ttsSamurdhiUtterance.rate = 0.92;
  ttsSamurdhiUtterance.pitch = 1.0;

  ttsSamurdhiUtterance.onstart = () => {
    isSamurdhiSpeaking = true;
    document.getElementById('ttsSamurdhiIcon').textContent = '⏹️';
    document.getElementById('ttsSamurdhiBtnText').textContent = 'Stop / නවත්වන්න';
  };

  ttsSamurdhiUtterance.onend = () => {
    stopSamurdhiAudio();
  };

  ttsSamurdhiUtterance.onerror = () => {
    stopSamurdhiAudio();
  };

  window.speechSynthesis.speak(ttsSamurdhiUtterance);
}

function stopSamurdhiAudio() {
  if ('speechSynthesis' in window && window.speechSynthesis.speaking) {
    window.speechSynthesis.cancel();
  }
  isSamurdhiSpeaking = false;
  const icon = document.getElementById('ttsSamurdhiIcon');
  const text = document.getElementById('ttsSamurdhiBtnText');
  if (icon) icon.textContent = '🔊';
  if (text) text.textContent = 'Listen / අහන්න';
}

window.showSamurdhiModal = function(type) {
  const modal = document.getElementById('samurdhiModal');
  const titleEl = document.getElementById('modalSamurdhiTitle');
  const bodyEl = document.getElementById('modalSamurdhiBody');
  const footerEl = document.getElementById('modalSamurdhiFooter');

  if (type === 'smallGroups') {
    titleEl.innerHTML = '👥 Small Groups / කුඩා කණ්ඩායම්';
    bodyEl.innerHTML = `
      <div style="margin-bottom: 1rem;">
        <p style="font-size: 0.9rem; color: var(--text-primary); line-height: 1.5; margin-bottom: 4px;">
          Small groups consist of 5 to 6 members from your neighborhood who meet regularly to build solidarity, manage collective savings, and plan community development initiatives.
        </p>
        <p style="font-size: 0.85rem; color: var(--text-muted); line-height: 1.5;">
          කුඩා කණ්ඩායම් යනු එකට එකතු වී ඉතිරි කිරීම් සිදු කරන සහ එකිනෙකාට සහාය වන සාමාජිකයන් 5-6 දෙනෙකුගෙන් යුත් ප්‍රජා කණ්ඩායම් වේ.
        </p>
      </div>

      <div style="background: #f8fafc; border: 1px solid var(--border-light); border-radius: var(--radius-md); padding: 0.85rem 1rem; margin-bottom: 1rem;">
        <div style="font-weight: 700; font-size: 0.825rem; color: var(--text-primary); margin-bottom: 6px;">
          🌟 5 Key Benefits of Small Groups / කුඩා කණ්ඩායම්වල ප්‍රධාන ප්‍රතිලාභ 5:
        </div>
        <ul style="list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 4px; font-size: 0.8rem; color: var(--text-secondary);">
          <li>1. 💰 <strong>Save Regularly:</strong> Build weekly/monthly collective savings habits.</li>
          <li>2. 🤝 <strong>Support Each Other:</strong> Mutual assistance during emergencies and family milestones.</li>
          <li>3. 💵 <strong>Access Microcredit:</strong> Group guarantee enables community bank loan facilities.</li>
          <li>4. 🌱 <strong>Develop Livelihoods:</strong> Access training, tools, and agricultural inputs together.</li>
          <li>5. 🏘️ <strong>Community Activities:</strong> Participate in village development and Shramadana projects.</li>
        </ul>
      </div>

      <div style="background: var(--bg-subtle); border-left: 3px solid var(--primary); padding: 0.75rem; border-radius: 4px; font-size: 0.8rem; color: var(--text-muted);">
        ℹ️ <em>Contact your local Samurdhi Development Officer (SDO) or Grama Niladhari to join or register a small group in your area.</em>
      </div>
    `;
    footerEl.innerHTML = `
      <button type="button" class="btn-return-home" onclick="closeSamurdhiModal()" style="margin-right: auto;">
        &larr; Back / ආපසු
      </button>
      <button type="button" class="btn-continue" onclick="closeSamurdhiModal()">
        Understood / තේරුම් ගතිමි
      </button>
    `;
  } else if (type === 'microcredit') {
    titleEl.innerHTML = '💰 Savings &amp; Microcredit / ඉතිරි කිරීම් සහ ණය පහසුකම්';
    bodyEl.innerHTML = `
      <div style="margin-bottom: 1rem;">
        <p style="font-size: 0.9rem; color: var(--text-primary); line-height: 1.5; margin-bottom: 4px;">
          Samurdhi Community Banks offer affordable microcredit, enterprise loans, and group savings accounts to strengthen household economic resilience.
        </p>
        <p style="font-size: 0.85rem; color: var(--text-muted); line-height: 1.5;">
          සමෘද්ධි ප්‍රජා බැංකු හරහා අඩු පොලී ණය, ව්‍යවසායකත්ව ණය සහ ඉතිරි කිරීමේ ගිණුම් පහසුකම් ලබා ගත හැකිය.
        </p>
      </div>

      <div style="background: #fffbeb; border: 1px solid #fef3c7; border-left: 3px solid #f59e0b; padding: 0.85rem 1rem; border-radius: var(--radius-md); margin-bottom: 1rem;">
        <div style="font-weight: 700; font-size: 0.825rem; color: #92400e; margin-bottom: 4px;">
          📢 Notice on Financial Facilities &amp; Microcredit / මූල්‍ය පහසුකම් පිළිබඳ වැදගත් නිවේදනය:
        </div>
        <p style="font-size: 0.8rem; color: #92400e; line-height: 1.45; margin-bottom: 4px;">
          Financial assistance and microcredit are <strong>NOT automatically guaranteed</strong>. All loan requests require discussion and recommendation within your registered Small Group, followed by review and verification by the Samurdhi Development Officer and Community Bank approval committee.
        </p>
        <p style="font-size: 0.775rem; color: #b45309; line-height: 1.45; margin: 0;">
          මූල්‍ය සහ ණය පහසුකම් ස්වයංක්‍රීයව හිමි නොවන අතර, කුඩා කණ්ඩායම් නිර්දේශය සහ සමෘද්ධි සංවර්ධන නිලධාරී / බැංකු කමිටු අනුමැතිය මත පමණක් නිකුත් කෙරේ.
        </p>
      </div>
    `;
    footerEl.innerHTML = `
      <button type="button" class="btn-return-home" onclick="closeSamurdhiModal()" style="margin-right: auto;">
        &larr; Back / ආපසු
      </button>
      <button type="button" class="btn-continue" onclick="handleSamurdhiRequestSupport()">
        Request Support / සහාය ඉල්ලන්න &rarr;
      </button>
    `;
  } else if (type === 'livelihood') {
    selectedLivelihoodOptions.clear();
    titleEl.innerHTML = '🌱 Livelihood Support / ජීවනෝපාය සහාය';
    bodyEl.innerHTML = `
      <div style="margin-bottom: 1rem;">
        <p style="font-weight: 700; font-size: 0.9rem; color: var(--text-primary); margin-bottom: 4px;">
          Find support that matches your livelihood goal. / ඔබගේ ජීවනෝපාය ඉලක්කයට ගැළපෙන සහාය සොයා ගන්න.
        </p>
        <p style="font-size: 0.825rem; color: var(--text-muted); margin-bottom: 1rem;">
          Select your area of interest to explore available government equipment subsidies, technical guidance, and market linkages.
        </p>
      </div>

      <div class="livelihood-chips-grid">
        <div class="livelihood-chip" id="chipAgri" onclick="toggleLivelihoodChip('chipAgri', 'Agriculture')">
          <span class="chip-icon">🌾</span>
          <div class="chip-text">
            <span class="chip-title-en">Agriculture</span>
            <span class="chip-title-si">කෘෂිකර්මාන්තය</span>
          </div>
        </div>
        <div class="livelihood-chip" id="chipBiz" onclick="toggleLivelihoodChip('chipBiz', 'Small Business')">
          <span class="chip-icon">🏪</span>
          <div class="chip-text">
            <span class="chip-title-en">Small Business</span>
            <span class="chip-title-si">කුඩා ව්‍යාපාර</span>
          </div>
        </div>
        <div class="livelihood-chip" id="chipSelf" onclick="toggleLivelihoodChip('chipSelf', 'Self Employment')">
          <span class="chip-icon">🛠️</span>
          <div class="chip-text">
            <span class="chip-title-en">Self Employment</span>
            <span class="chip-title-si">ස්වයං රැකියා</span>
          </div>
        </div>
        <div class="livelihood-chip" id="chipTrain" onclick="toggleLivelihoodChip('chipTrain', 'Training')">
          <span class="chip-icon">🎓</span>
          <div class="chip-text">
            <span class="chip-title-en">Training</span>
            <span class="chip-title-si">පුහුණු අවස්ථා</span>
          </div>
        </div>
      </div>

      <div style="background: var(--bg-subtle); border-left: 3px solid var(--primary); padding: 0.75rem; border-radius: 4px; font-size: 0.8rem; color: var(--text-muted);">
        ℹ️ <em>Select one or more categories above that match your goals.</em>
      </div>
    `;
    footerEl.innerHTML = `
      <button type="button" class="btn-return-home" onclick="closeSamurdhiModal()" style="margin-right: auto;">
        &larr; Back / ආපසු
      </button>
      <button type="button" class="btn-continue" onclick="handleFindLivelihoodSupport()">
        Find Support / සහාය සොයන්න &rarr;
      </button>
    `;
  } else if (type === 'activities') {
    titleEl.innerHTML = '🏘️ Community Activities / ප්‍රජා ක්‍රියාකාරකම්';
    bodyEl.innerHTML = `
      <div style="margin-bottom: 1rem;">
        <p style="font-size: 0.9rem; color: var(--text-primary); line-height: 1.5; margin-bottom: 4px;">
          Work together with your community through mutual support, community development and Shramadana activities.
        </p>
        <p style="font-size: 0.85rem; color: var(--text-muted); line-height: 1.5;">
          අන්‍යෝන්‍ය සහාය, ප්‍රජා සංවර්ධන සහ ශ්‍රමදාන ක්‍රියාකාරකම් හරහා ඔබගේ ප්‍රජාව සමඟ එක්ව කටයුතු කරන්න.
        </p>
      </div>

      <div style="background: var(--bg-subtle); border: 1px solid var(--border-light); border-radius: var(--radius-md); padding: 1rem; margin-bottom: 1rem;">
        <div style="font-weight: 800; font-size: 0.85rem; color: var(--primary); margin-bottom: 8px;">
          🌟 Examples of Community Action / ප්‍රජා ක්‍රියාකාරකම් උදාහරණ:
        </div>
        <ul style="list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 8px; font-size: 0.825rem; color: var(--text-secondary);">
          <li>🤝 <strong>Mutual Support</strong> / අන්‍යෝන්‍ය සහාය</li>
          <li>🏘️ <strong>Community Development</strong> / ප්‍රජා සංවර්ධනය</li>
          <li>🌱 <strong>Shramadana</strong> / ශ්‍රමදාන</li>
        </ul>
      </div>

      <div style="background: #f8fafc; border-left: 3px solid var(--primary); padding: 0.75rem; border-radius: 4px; font-size: 0.8rem; color: var(--text-muted);">
        ℹ️ <em>Community development activities are coordinated regularly at the village level through Samurdhi Balakaya and Grama Niladhari committees.</em>
      </div>
    `;
    footerEl.innerHTML = `
      <button type="button" class="btn-return-home" onclick="closeSamurdhiModal()">
        &larr; Back / ආපසු
      </button>
    `;
  }

  modal.classList.remove('hidden');
};

window.toggleLivelihoodChip = function(id, name) {
  const chip = document.getElementById(id);
  if (!chip) return;
  if (selectedLivelihoodOptions.has(name)) {
    selectedLivelihoodOptions.delete(name);
    chip.classList.remove('selected');
  } else {
    selectedLivelihoodOptions.add(name);
    chip.classList.add('selected');
  }
};

window.handleSamurdhiRequestSupport = function() {
  closeSamurdhiModal();
  showToast('Support pathway initiated: Please discuss your request at your next small group meeting for officer coordination.');
};

window.handleFindLivelihoodSupport = function() {
  const selected = Array.from(selectedLivelihoodOptions);
  closeSamurdhiModal();
  if (selected.length > 0) {
    showToast(`Livelihood interest recorded for: ${selected.join(', ')}. Connect with your local SDO for available development schemes.`);
  } else {
    showToast('Explore all livelihood programs with your divisional Samurdhi Development Officer.');
  }
};

function closeSamurdhiModal() {
  document.getElementById('samurdhiModal').classList.add('hidden');
}

// -------------------------------------------------------------
// Section 5: 10-Step Aswesuma Application Wizard Logic
// -------------------------------------------------------------
window.openAswesumaWizard = async function() {
  stopGuidanceAudio();
  stopTargetedAudio();
  stopSamurdhiAudio();
  const verId = state.activeVerificationId;
  const res = await apiFetch(`/verification/${verId}/status`);

  if (!res.ok || res.data?.data?.finalStatus !== 'VERIFIED') {
    showToast('Access restricted: You must have an officially verified DID to apply for Aswesuma.', false);
    renderWelfareHomePage();
    return;
  }

  state.activeVerifiedDid = res.data.data.did;
  document.getElementById('aswWizardDidDisplay').textContent = state.activeVerifiedDid;

  // Pre-fill Step 1 from verified identity
  populateAswesumaApplicantData();

  document.getElementById('welfareHomeView').classList.add('hidden');
  document.getElementById('welfareLockedBox').classList.add('hidden');
  document.getElementById('aswesumaGuidanceView').classList.add('hidden');
  document.getElementById('targetedAllowancesView').classList.add('hidden');
  document.getElementById('samurdhiView').classList.add('hidden');
  document.getElementById('aswesumaSuccessView').classList.add('hidden');
  document.getElementById('allowanceInfoModal').classList.add('hidden');
  document.getElementById('allowanceApplyModal').classList.add('hidden');
  document.getElementById('samurdhiModal').classList.add('hidden');
  document.getElementById('aswesumaWizardContainer').classList.remove('hidden');

  jumpToAswesumaStep(1);
};

function populateAswesumaApplicantData() {
  const fullName = document.getElementById('didCardFullName')?.textContent || document.getElementById('inpFullName')?.value || 'Aravinda Kumara';
  const nic = document.getElementById('didCardNic')?.textContent || document.getElementById('inpNicNumber')?.value || '200223003053';
  const dob = document.getElementById('didCardDob')?.textContent || document.getElementById('inpDob')?.value || '01/12/2002';
  const phone = document.getElementById('didCardPhone')?.textContent || document.getElementById('inpMobile')?.value || '+94 78 145 3248';
  const address = document.getElementById('didCardAddress')?.textContent || document.getElementById('inpHomeAddress')?.value || '45/A, Jayawickrama Road';
  const district = document.getElementById('didCardDistrict')?.textContent || document.getElementById('inpDistrict')?.value || 'Gampaha';
  const gn = document.getElementById('didCardGn')?.textContent || document.getElementById('inpGnDivision')?.value || 'Minuwangoda North';

  document.getElementById('aswFullName').value = fullName;
  document.getElementById('aswNic').value = nic;
  document.getElementById('aswDob').value = dob;
  document.getElementById('aswPhone').value = phone;
  document.getElementById('aswAddress').value = address;
  document.getElementById('aswDistrict').value = district;
  document.getElementById('aswGnDivision').value = gn;
  document.getElementById('aswAccountHolder').value = fullName;
}

window.jumpToAswesumaStep = function(stepNum) {
  if (stepNum < 1 || stepNum > 10) return;
  state.currentAswesumaStep = stepNum;
  renderAswesumaStepState();
};

window.nextAswesumaStep = function(fromStep) {
  if (fromStep < 10) {
    state.currentAswesumaStep = fromStep + 1;
    renderAswesumaStepState();
  }
};

window.prevAswesumaStep = function(fromStep) {
  if (fromStep > 1) {
    state.currentAswesumaStep = fromStep - 1;
    renderAswesumaStepState();
  }
};

function renderAswesumaStepState() {
  const step = state.currentAswesumaStep;
  const stepTitles = [
    'Applicant Information',
    'Household & Programme Information',
    'Education Information',
    'Health & Special Needs',
    'Economic Level & Income',
    'Assets & Property Ownership',
    'Housing Status & Sanitation',
    'Family Demography',
    'Banking Information',
    'Review Application & Submit',
  ];

  document.getElementById('aswStepSubtitle').textContent = `Step ${step} of 10 \u2022 ${stepTitles[step - 1]}`;

  for (let i = 1; i <= 10; i++) {
    const section = document.getElementById(`aswStep${i}`);
    if (section) {
      if (i === step) section.classList.add('active');
      else section.classList.remove('active');
    }

    const node = document.getElementById(`aswNode${i}`);
    if (node) {
      if (i < step) {
        node.className = 'asw-step-node completed';
      } else if (i === step) {
        node.className = 'asw-step-node active';
      } else {
        node.className = 'asw-step-node';
      }
    }
  }

  if (step === 10) {
    buildAswesumaReviewSummary();
  }

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function buildAswesumaReviewSummary() {
  const container = document.getElementById('aswReviewSummaryBox');
  const d = collectAswesumaFormData();

  container.innerHTML = `
    <!-- Step 1 Summary -->
    <div class="summary-step-card">
      <div class="summary-header">
        <h4>1. Applicant Information</h4>
        <button type="button" class="btn-edit-step" onclick="jumpToAswesumaStep(1)">✏️ Edit</button>
      </div>
      <div class="summary-grid">
        <div><span>Full Name:</span> <strong>${d.applicantInformation.fullName}</strong></div>
        <div><span>NIC Number:</span> <strong>${d.applicantInformation.nic}</strong></div>
        <div><span>Gender:</span> <strong>${d.applicantInformation.gender}</strong></div>
        <div><span>Mobile Phone:</span> <strong>${d.applicantInformation.mobilePhone}</strong></div>
        <div><span>Province & District:</span> <strong>${d.applicantInformation.province}, ${d.applicantInformation.district}</strong></div>
        <div><span>DS & GN Division:</span> <strong>${d.applicantInformation.dsDivision} / ${d.applicantInformation.gnDivision}</strong></div>
        <div style="grid-column: span 2;"><span>Permanent Address:</span> <strong>${d.applicantInformation.permanentAddress}</strong></div>
      </div>
    </div>

    <!-- Step 2 Summary -->
    <div class="summary-step-card">
      <div class="summary-header">
        <h4>2. Household & Programme</h4>
        <button type="button" class="btn-edit-step" onclick="jumpToAswesumaStep(2)">✏️ Edit</button>
      </div>
      <div class="summary-grid">
        <div><span>Total Members:</span> <strong>${d.householdInformation.totalMembers}</strong></div>
        <div><span>Application Status:</span> <strong>${d.householdInformation.applicationStatus}</strong></div>
        <div><span>Existing Welfare:</span> <strong>${d.householdInformation.existingWelfareProgrammes.join(', ') || 'None'}</strong></div>
        <div><span>Waiting List:</span> <strong>${d.householdInformation.waitingListStatus}</strong></div>
      </div>
    </div>

    <!-- Step 3 & 4 Summary -->
    <div class="summary-step-card">
      <div class="summary-header">
        <h4>3 & 4. Education & Health</h4>
        <button type="button" class="btn-edit-step" onclick="jumpToAswesumaStep(3)">✏️ Edit</button>
      </div>
      <div class="summary-grid">
        <div><span>Head Education:</span> <strong>${d.education.highestEducationHead}</strong></div>
        <div><span>School Attendance:</span> <strong>${d.education.schoolAttendanceChildren}</strong></div>
        <div><span>Disabilities Count:</span> <strong>${d.health.disabilityCount}</strong></div>
        <div><span>Chronic Illness Count:</span> <strong>${d.health.chronicIllnessCount}</strong></div>
        <div><span>Bedridden Elderly:</span> <strong>${d.health.bedriddenElderlyCount}</strong></div>
        <div><span>Dependent Elderly:</span> <strong>${d.health.fullyDependentElderlyCount}</strong></div>
      </div>
    </div>

    <!-- Step 5 & 6 Summary -->
    <div class="summary-step-card">
      <div class="summary-header">
        <h4>5 & 6. Economic Level & Assets</h4>
        <button type="button" class="btn-edit-step" onclick="jumpToAswesumaStep(5)">✏️ Edit</button>
      </div>
      <div class="summary-grid">
        <div><span>Primary Livelihood:</span> <strong>${d.economic.primaryLivelihood}</strong></div>
        <div><span>Monthly Income:</span> <strong>Rs. ${d.economic.estimatedMonthlyIncome.toLocaleString()}</strong></div>
        <div><span>Monthly Expenses:</span> <strong>Rs. ${d.economic.regularMonthlyExpenses.toLocaleString()}</strong></div>
        <div><span>Electricity Consumption:</span> <strong>${d.economic.averageMonthlyElectricityKwh} kWh</strong></div>
        <div><span>Vehicles Owned:</span> <strong>${d.assets.motorVehicles.join(', ') || 'None'}</strong></div>
        <div><span>Durables Owned:</span> <strong>${d.assets.consumerDurables.join(', ') || 'None'}</strong></div>
        <div><span>Land Ownership:</span> <strong>Agri: ${d.assets.hasAgriculturalLand}, Res: ${d.assets.hasResidentialLand} (${d.assets.totalLandExtentPerches || 0}P)</strong></div>
      </div>
    </div>

    <!-- Step 7 & 8 Summary -->
    <div class="summary-step-card">
      <div class="summary-header">
        <h4>7 & 8. Housing & Family Demography</h4>
        <button type="button" class="btn-edit-step" onclick="jumpToAswesumaStep(7)">✏️ Edit</button>
      </div>
      <div class="summary-grid">
        <div><span>House Ownership:</span> <strong>${d.housing.houseOwnership}</strong></div>
        <div><span>Roof / Wall / Floor:</span> <strong>${d.housing.roofMaterial} / ${d.housing.wallMaterial} / ${d.housing.floorMaterial}</strong></div>
        <div><span>Safe Water & Toilet:</span> <strong>Water: ${d.housing.accessSafeDrinkingWater}, Toilet: ${d.housing.accessPrivateSanitaryToilet}</strong></div>
        <div><span>Children &lt; 15:</span> <strong>${d.familyDemography.childrenBelow15}</strong></div>
        <div><span>Working-Age (15-64):</span> <strong>${d.familyDemography.workingAgeMembers}</strong></div>
        <div><span>Adults &gt; 65:</span> <strong>${d.familyDemography.adultsOver65}</strong></div>
        <div><span>Single Parent / Female Head:</span> <strong>${d.familyDemography.singleParentHousehold} / ${d.familyDemography.femaleHeadedHousehold}</strong></div>
      </div>
    </div>

    <!-- Step 9 Summary -->
    <div class="summary-step-card">
      <div class="summary-header">
        <h4>9. Banking Information</h4>
        <button type="button" class="btn-edit-step" onclick="jumpToAswesumaStep(9)">✏️ Edit</button>
      </div>
      <div class="summary-grid">
        <div><span>Bank Name:</span> <strong>${d.banking.bankName}</strong></div>
        <div><span>Branch:</span> <strong>${d.banking.branchCode}</strong></div>
        <div><span>Account Number:</span> <strong>******${d.banking.accountNumberMasked.slice(-4)}</strong></div>
        <div><span>Account Holder:</span> <strong>${d.banking.accountHolderName}</strong></div>
      </div>
    </div>
  `;
}

function collectAswesumaFormData() {
  const existingWelfare = Array.from(document.querySelectorAll('input[name="aswExistingWelfare"]:checked')).map(el => el.value);
  const vehicles = Array.from(document.querySelectorAll('input[name="aswVehicle"]:checked')).map(el => el.value);
  const durables = Array.from(document.querySelectorAll('input[name="aswDurable"]:checked')).map(el => el.value);

  return {
    did: state.activeVerifiedDid,
    userId: state.activeUserId,
    applicantInformation: {
      fullName: document.getElementById('aswFullName').value.trim(),
      nic: document.getElementById('aswNic').value.trim(),
      dateOfBirth: document.getElementById('aswDob').value.trim() || '01/12/2002',
      gender: document.getElementById('aswGender').value,
      mobilePhone: document.getElementById('aswPhone').value.trim(),
      permanentAddress: document.getElementById('aswAddress').value.trim(),
      province: document.getElementById('aswProvince').value,
      district: document.getElementById('aswDistrict').value.trim(),
      dsDivision: document.getElementById('aswDsDivision').value.trim(),
      gnDivision: document.getElementById('aswGnDivision').value.trim(),
    },
    householdInformation: {
      totalMembers: parseInt(document.getElementById('aswTotalMembers').value) || 4,
      existingWelfareProgrammes: existingWelfare.length > 0 ? existingWelfare : ['None'],
      waitingListStatus: document.getElementById('aswWaitingList').value,
      applicationStatus: document.getElementById('aswApplicationStatus').value,
    },
    education: {
      highestEducationHead: document.getElementById('aswHighestEduHead').value,
      schoolAttendanceChildren: document.getElementById('aswSchoolAttendance').value,
      schoolDropoutStatus: document.getElementById('aswDropoutStatus').value,
    },
    health: {
      hasPermanentDisabilities: document.getElementById('aswHasDisability').value,
      disabilityCount: parseInt(document.getElementById('aswDisabilityCount').value) || 0,
      hasSevereChronicIllnesses: document.getElementById('aswHasIllness').value,
      chronicIllnessCount: parseInt(document.getElementById('aswIllnessCount').value) || 0,
      hasCkd: document.getElementById('aswCondCkd')?.checked || false,
      hasCancer: document.getElementById('aswCondCancer')?.checked || false,
      hasParalysis: document.getElementById('aswCondParalysis')?.checked || false,
      bedriddenElderlyCount: parseInt(document.getElementById('aswBedriddenCount').value) || 0,
      fullyDependentElderlyCount: parseInt(document.getElementById('aswDependentElderlyCount').value) || 0,
    },
    economic: {
      primaryLivelihood: document.getElementById('aswPrimaryLivelihood').value,
      secondaryLivelihood: document.getElementById('aswSecondaryLivelihood').value,
      estimatedMonthlyIncome: parseFloat(document.getElementById('aswMonthlyIncome').value) || 0,
      regularMonthlyExpenses: parseFloat(document.getElementById('aswMonthlyExpenses').value) || 0,
      averageMonthlyElectricityKwh: parseFloat(document.getElementById('aswElectricity').value) || 0,
    },
    assets: {
      motorVehicles: vehicles.length > 0 ? vehicles : ['None'],
      consumerDurables: durables.length > 0 ? durables : ['None'],
      hasAgriculturalLand: document.getElementById('aswAgriLand').value,
      hasResidentialLand: document.getElementById('aswResLand').value,
      totalLandExtentPerches: parseFloat(document.getElementById('aswLandExtent').value) || 0,
    },
    housing: {
      houseOwnership: document.getElementById('aswHouseOwnership').value,
      roofMaterial: document.getElementById('aswRoofMaterial').value,
      wallMaterial: document.getElementById('aswWallMaterial').value,
      floorMaterial: document.getElementById('aswFloorMaterial').value,
      accessSafeDrinkingWater: document.getElementById('aswWaterAccess').value,
      accessPrivateSanitaryToilet: document.getElementById('aswToiletAccess').value,
    },
    familyDemography: {
      childrenBelow15: parseInt(document.getElementById('aswChildrenCount').value) || 0,
      workingAgeMembers: parseInt(document.getElementById('aswWorkingAgeCount').value) || 0,
      adultsOver65: parseInt(document.getElementById('aswElderlyCount').value) || 0,
      singleParentHousehold: document.getElementById('aswSingleParent').value,
      femaleHeadedHousehold: document.getElementById('aswFemaleHeaded').value,
    },
    banking: {
      bankName: document.getElementById('aswBankName').value.trim(),
      branchCode: document.getElementById('aswBranchCode').value.trim(),
      accountNumberMasked: document.getElementById('aswAccountNumber').value.trim(),
      accountHolderName: document.getElementById('aswAccountHolder').value.trim(),
    },
  };
}

async function handleAswesumaSubmit() {
  const decCheck = document.getElementById('aswDeclarationCheck');
  if (!decCheck || !decCheck.checked) {
    showToast('Please confirm the declaration checkbox before submitting.', false);
    return;
  }

  const payload = collectAswesumaFormData();

  const res = await apiFetch('/welfare/aswesuma/applications', {
    method: 'POST',
    body: JSON.stringify(payload),
  });

  if (res.ok && res.data?.data) {
    const app = res.data.data;
    showToast(`✅ Aswesuma application submitted: ${app.applicationId}`);

    // Transition to submission success view
    document.getElementById('aswesumaWizardContainer').classList.add('hidden');
    document.getElementById('aswesumaSuccessView').classList.remove('hidden');

    document.getElementById('aswSuccessAppId').textContent = app.applicationId;
    document.getElementById('aswSuccessDidDisplay').textContent = app.did;
    document.getElementById('aswSuccessTimestamp').textContent = new Date(app.submittedAt || app.createdAt).toLocaleString();
  } else {
    showToast(res.data?.error || 'Failed to submit Aswesuma application', false);
  }
}

// -------------------------------------------------------------
// Top Navigation Tab Switching
// -------------------------------------------------------------
window.switchPortalTab = function(tabName) {
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
  document.querySelectorAll('.portal-pane').forEach(p => p.classList.remove('active'));

  if (tabName === 'registration') {
    document.getElementById('tabRegistration').classList.add('active');
    document.getElementById('paneRegistration').classList.add('active');
  } else if (tabName === 'identity') {
    document.getElementById('tabIdentity').classList.add('active');
    document.getElementById('paneIdentity').classList.add('active');
    syncRegistrationToDidStage();
    fetchCitizenStatus();
  } else if (tabName === 'officer') {
    document.getElementById('tabOfficer').classList.add('active');
    document.getElementById('paneOfficer').classList.add('active');
    fetchOfficerPendingQueue();
  } else if (tabName === 'welfare') {
    document.getElementById('tabWelfare').classList.add('active');
    document.getElementById('paneWelfare').classList.add('active');
    renderWelfareHomePage();
  } else if (tabName === 'inspector') {
    document.getElementById('tabInspector').classList.add('active');
    document.getElementById('paneInspector').classList.add('active');
  }
};

// -------------------------------------------------------------
// Section 6: Inspector Queries
// -------------------------------------------------------------
async function queryDidInspector() {
  const did = document.getElementById('inpInspectDid').value.trim();
  const res = await apiFetch(`/identity/${did}`);
  document.getElementById('jsonDidOutput').textContent = JSON.stringify(res.data, null, 2);
}

async function queryVerInspector() {
  const ver = document.getElementById('inpInspectVer').value.trim();
  const res = await apiFetch(`/verification/${ver}`);
  document.getElementById('jsonVerOutput').textContent = JSON.stringify(res.data, null, 2);
}

// Copy DID to clipboard
function copyDidToClipboard() {
  const did = document.getElementById('activeDidString').textContent;
  if (!did) return;
  navigator.clipboard.writeText(did).then(() => {
    showToast(`DID copied: ${did}`);
  }).catch(() => {
    showToast('Failed to copy to clipboard', false);
  });
}

// -------------------------------------------------------------
// Initialization & Event Listeners
// -------------------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
  renderRegStepState();
  loadSelectedPreset();
  fetchOfficerPendingQueue();

  // Navigation tabs
  document.getElementById('tabRegistration').addEventListener('click', () => switchPortalTab('registration'));
  document.getElementById('tabIdentity').addEventListener('click', () => switchPortalTab('identity'));
  document.getElementById('tabOfficer').addEventListener('click', () => switchPortalTab('officer'));
  document.getElementById('tabWelfare').addEventListener('click', () => switchPortalTab('welfare'));
  document.getElementById('tabInspector').addEventListener('click', () => switchPortalTab('inspector'));

  // Preset & Form Reset
  document.getElementById('btnLoadPreset').addEventListener('click', loadSelectedPreset);
  document.getElementById('presetUserSelect').addEventListener('change', loadSelectedPreset);
  document.getElementById('btnClearForm').addEventListener('click', clearRegistrationForm);

  // DID Application & Evidence Actions
  document.getElementById('btnTriggerApplyIdentity').addEventListener('click', handleApplyIdentity);
  document.getElementById('btnRefreshCitizenStatus').addEventListener('click', fetchCitizenStatus);

  // Live Camera & Photo Uploads
  document.getElementById('btnToggleCamera').addEventListener('click', toggleLiveWebcam);
  document.getElementById('btnSnapPhoto').addEventListener('click', snapLivePhoto);
  document.getElementById('btnUploadSelfie').addEventListener('click', () => document.getElementById('inpSelfieFile').click());
  document.getElementById('inpSelfieFile').addEventListener('change', handleUploadSelfieFile);
  document.getElementById('btnSimulateSelfie').addEventListener('click', () => submitSelfieEvidence('synthetic-selfie-quick-sample'));

  // Real NIC Upload
  document.getElementById('btnUploadNic').addEventListener('click', () => document.getElementById('inpNicFile').click());
  document.getElementById('inpNicFile').addEventListener('change', handleUploadNicFile);
  document.getElementById('btnSimulateNic').addEventListener('click', () => submitNicEvidence('synthetic-nic-quick-sample'));

  // Copy DID Button
  document.getElementById('btnCopyDid')?.addEventListener('click', copyDidToClipboard);

  // Officer Actions
  document.getElementById('btnOfficerLogin').addEventListener('click', officerLogin);
  document.getElementById('btnRefreshOfficerQueue').addEventListener('click', fetchOfficerPendingQueue);
  document.getElementById('btnApproveCase').addEventListener('click', () => submitOfficerVerdict('APPROVED'));
  document.getElementById('btnRejectCase').addEventListener('click', () => submitOfficerVerdict('REJECTED'));

  // Welfare Service Entry Points
  document.getElementById('btnApplyAswesuma')?.addEventListener('click', openAswesumaGuidance);
  document.getElementById('btnStartAswesumaWizard')?.addEventListener('click', openAswesumaWizard);
  document.getElementById('btnGuidanceBack')?.addEventListener('click', renderWelfareHomePage);
  document.getElementById('btnGuidanceBackToHome')?.addEventListener('click', renderWelfareHomePage);

  // Guidance Language Selector
  document.getElementById('btnLangBoth')?.addEventListener('click', () => setGuidanceLanguage('both'));
  document.getElementById('btnLangEn')?.addEventListener('click', () => setGuidanceLanguage('en'));
  document.getElementById('btnLangSi')?.addEventListener('click', () => setGuidanceLanguage('si'));

  // Guidance Accessibility Audio & Help Drawer
  document.getElementById('btnGuidanceListen')?.addEventListener('click', toggleGuidanceAudio);
  document.getElementById('btnGuidanceHelp')?.addEventListener('click', toggleGuidanceHelp);
  document.getElementById('btnCloseHelp')?.addEventListener('click', toggleGuidanceHelp);

  // Aswesuma Wizard Actions
  document.getElementById('btnCancelAswesuma')?.addEventListener('click', openAswesumaGuidance);
  document.getElementById('btnReturnToWelfareHome')?.addEventListener('click', renderWelfareHomePage);
  document.getElementById('btnSubmitAswesumaFinal')?.addEventListener('click', handleAswesumaSubmit);

  // Targeted Allowances Entry Points & Navigation
  document.getElementById('btnViewAssistance')?.addEventListener('click', openTargetedAllowances);
  document.getElementById('btnTargetedBack')?.addEventListener('click', renderWelfareHomePage);
  document.getElementById('btnTargetedBackToHome')?.addEventListener('click', renderWelfareHomePage);

  // Targeted Language Selector
  document.getElementById('btnTargetedLangBoth')?.addEventListener('click', () => setTargetedLanguage('both'));
  document.getElementById('btnTargetedLangEn')?.addEventListener('click', () => setTargetedLanguage('en'));
  document.getElementById('btnTargetedLangSi')?.addEventListener('click', () => setTargetedLanguage('si'));

  // Targeted Accessibility Audio & Help Drawer
  document.getElementById('btnTargetedListen')?.addEventListener('click', toggleTargetedAudio);
  document.getElementById('btnTargetedHelp')?.addEventListener('click', toggleTargetedHelp);
  document.getElementById('btnCloseTargetedHelp')?.addEventListener('click', toggleTargetedHelp);

  // Allowance Info Modal
  document.getElementById('btnCloseAllowanceModal')?.addEventListener('click', closeAllowanceInfoModal);
  document.getElementById('btnOkAllowanceModal')?.addEventListener('click', closeAllowanceInfoModal);

  // Allowance Apply Modal
  document.getElementById('btnCloseApplyModal')?.addEventListener('click', closeAllowanceApplyModal);

  // Samurdhi Entry Points & Navigation
  document.getElementById('btnViewSamurdhi')?.addEventListener('click', openSamurdhiView);
  document.getElementById('btnSamurdhiBack')?.addEventListener('click', renderWelfareHomePage);
  document.getElementById('btnSamurdhiBackToHome')?.addEventListener('click', renderWelfareHomePage);

  // Samurdhi Language Selector
  document.getElementById('btnSamurdhiLangBoth')?.addEventListener('click', () => setSamurdhiLanguage('both'));
  document.getElementById('btnSamurdhiLangEn')?.addEventListener('click', () => setSamurdhiLanguage('en'));
  document.getElementById('btnSamurdhiLangSi')?.addEventListener('click', () => setSamurdhiLanguage('si'));

  // Samurdhi Accessibility Audio & Help Drawer
  document.getElementById('btnSamurdhiListen')?.addEventListener('click', toggleSamurdhiAudio);
  document.getElementById('btnSamurdhiHelp')?.addEventListener('click', toggleSamurdhiHelp);
  document.getElementById('btnCloseSamurdhiHelp')?.addEventListener('click', toggleSamurdhiHelp);

  // Samurdhi Detail Modal
  document.getElementById('btnCloseSamurdhiModal')?.addEventListener('click', closeSamurdhiModal);
  document.getElementById('btnOkSamurdhiModal')?.addEventListener('click', closeSamurdhiModal);

  // Elderly Assistance Entry Points & Navigation
  document.getElementById('btnStartElderlyWizard')?.addEventListener('click', startElderlyWizard);
  document.getElementById('btnElderlyBackToTargeted')?.addEventListener('click', openTargetedAllowances);

  // Elderly Language Selector
  document.getElementById('btnElderlyLangBoth')?.addEventListener('click', () => setElderlyLanguage('both'));
  document.getElementById('btnElderlyLangEn')?.addEventListener('click', () => setElderlyLanguage('en'));
  document.getElementById('btnElderlyLangSi')?.addEventListener('click', () => setElderlyLanguage('si'));

  // Elderly Accessibility Audio & Help Drawer
  document.getElementById('btnElderlyListen')?.addEventListener('click', toggleElderlyAudio);
  document.getElementById('btnElderlyHelp')?.addEventListener('click', toggleElderlyHelp);
  document.getElementById('btnCloseElderlyHelp')?.addEventListener('click', toggleElderlyHelp);

  // DOB Age calculation listener
  document.getElementById('eldDob')?.addEventListener('change', computeElderlyAgeFromDob);

  // Disability Assistance Entry Points & Navigation
  document.getElementById('btnStartDisabilityWizard')?.addEventListener('click', startDisabilityWizard);
  document.getElementById('btnDisabilityBackToTargeted')?.addEventListener('click', openTargetedAllowances);

  // Disability Language Selector
  document.getElementById('btnDisabilityLangBoth')?.addEventListener('click', () => setDisabilityLanguage('both'));
  document.getElementById('btnDisabilityLangEn')?.addEventListener('click', () => setDisabilityLanguage('en'));
  document.getElementById('btnDisabilityLangSi')?.addEventListener('click', () => setDisabilityLanguage('si'));

  // Disability Accessibility Audio & Help Drawer
  document.getElementById('btnDisabilityListen')?.addEventListener('click', toggleDisabilityAudio);
  document.getElementById('btnDisabilityHelp')?.addEventListener('click', toggleDisabilityHelp);
  document.getElementById('btnCloseDisabilityHelp')?.addEventListener('click', toggleDisabilityHelp);

  // Disability DOB Age calculation listener
  document.getElementById('disDob')?.addEventListener('change', computeDisabilityAgeFromDob);

  document.getElementById('btnExploreWelfare')?.addEventListener('click', () => {
    const cardGrid = document.querySelector('.welfare-services-grid');
    if (cardGrid) {
      cardGrid.scrollIntoView({ behavior: 'smooth', block: 'start' });
      showToast('Explore the 3 welfare service categories above.');
    }
  });
  document.getElementById('btnGoToKyc')?.addEventListener('click', () => {
    switchPortalTab('identity');
  });

  // Inspector Actions
  document.getElementById('btnQueryDid').addEventListener('click', queryDidInspector);
  document.getElementById('btnQueryVer').addEventListener('click', queryVerInspector);

  // Phase WE-5: Officer Welfare Lifecycle & Reassessment Event Listeners
  document.getElementById('btnLoadOfficerWelfareCase')?.addEventListener('click', loadOfficerWelfareCase);
  document.getElementById('btnOfficerCalculateElig')?.addEventListener('click', handleOfficerCalculateElig);
  document.getElementById('btnOfficerAnchorBc')?.addEventListener('click', handleOfficerAnchorBc);
  document.getElementById('btnOfficerVerifyBc')?.addEventListener('click', handleOfficerVerifyBc);
  document.getElementById('btnOfficerActivateBenefit')?.addEventListener('click', handleOfficerActivateBenefit);
  document.getElementById('btnOfficerReassess')?.addEventListener('click', handleOfficerReassess);
  document.getElementById('btnOfficerSuspendBenefit')?.addEventListener('click', handleOfficerSuspendBenefit);
  document.getElementById('btnOfficerReactivateBenefit')?.addEventListener('click', handleOfficerReactivateBenefit);
  document.getElementById('btnOfficerTerminateBenefit')?.addEventListener('click', handleOfficerTerminateBenefit);
});

// -------------------------------------------------------------
// Phase WE-5: Officer Welfare Lifecycle & Reassessment Handlers
// -------------------------------------------------------------

async function loadOfficerWelfareCase() {
  const appId = document.getElementById('inpOfficerAswAppId')?.value.trim();
  if (!appId) {
    showToast('Please enter a valid Aswesuma Application ID (e.g. ASW-2026-000001)', false);
    return;
  }

  // 1. Fetch Lifecycle State
  const lcRes = await apiFetch(`/welfare/aswesuma/applications/${appId}/lifecycle`);
  if (lcRes.ok && lcRes.data?.data) {
    const lc = lcRes.data.data;
    document.getElementById('dispOfficerEligScore').textContent = `${lc.currentCalculatedScore || '--'} pts`;
    document.getElementById('badgeOfficerEligCat').textContent = lc.currentCategory || 'NON_POOR';
    document.getElementById('badgeOfficerEligStatus').textContent = lc.currentEligibilityStatus || 'INELIGIBLE';
    
    document.getElementById('dispOfficerLifecycleStatus').textContent = lc.currentStatus;
    const pill = document.getElementById('badgeOfficerLifecyclePill');
    pill.textContent = `● ${lc.currentStatus}`;
    pill.style.background = lc.currentStatus === 'ACTIVE' ? '#16a34a' : lc.currentStatus === 'SUSPENDED' ? '#ea580c' : lc.currentStatus === 'TERMINATED' ? '#dc2626' : '#eab308';
    pill.style.color = '#fff';

    document.getElementById('dispOfficerBcRecordId').textContent = lc.activeBlockchainRecordId || 'Not Anchored';
    document.getElementById('badgeOfficerBcStatus').textContent = lc.activeBlockchainRecordId ? 'ACTIVE' : 'NONE';
    document.getElementById('badgeOfficerBcStatus').style.background = lc.activeBlockchainRecordId ? '#7c3aed' : '#334155';
    document.getElementById('badgeOfficerBcStatus').style.color = '#fff';
    document.getElementById('badgeOfficerBcIntegrity').style.display = 'none';
  }

  // 2. Fetch Full History Timeline
  const histRes = await apiFetch(`/welfare/aswesuma/applications/${appId}/history`);
  if (histRes.ok && histRes.data?.data) {
    renderOfficerHistoryTimeline(histRes.data.data);
    showToast(`Loaded case and audit history for ${appId}`);
  } else {
    showToast(`Could not find Aswesuma application ${appId}`, false);
  }
}

function renderOfficerHistoryTimeline(historyData) {
  const container = document.getElementById('officerHistoryTimeline');
  if (!container) return;

  const events = [];

  // Add Eligibility Calculations
  (historyData.eligibilityHistory || []).forEach(e => {
    events.push({
      type: 'ELIGIBILITY_EVALUATION',
      title: `Off-Chain Score Evaluated: ${e.calculatedScore} pts (${e.category})`,
      subtitle: `Status: ${e.eligibilityStatus} | Rule: ${e.ruleVersion} | ID: ${e.resultId}`,
      timestamp: e.calculatedAt || new Date().toISOString(),
      icon: '📊',
      badge: e.eligibilityStatus,
      color: e.eligibilityStatus === 'ELIGIBLE' ? '#10b981' : '#f59e0b',
    });
  });

  // Add Blockchain Anchors
  (historyData.blockchainHistory || []).forEach(b => {
    events.push({
      type: 'BLOCKCHAIN_RECORD',
      title: `Blockchain Ledger Record: ${b.recordId}`,
      subtitle: `Status: ${b.recordStatus} | Hash: ${b.payloadHash ? b.payloadHash.substring(0, 16) + '...' : 'N/A'}${b.previousRecordId ? ` | Previous Link: ${b.previousRecordId}` : ''}`,
      timestamp: b.timestamp,
      icon: '⛓️',
      badge: b.recordStatus,
      color: b.recordStatus === 'ACTIVE' ? '#a855f7' : '#64748b',
    });
  });

  // Add Lifecycle Events
  (historyData.lifecycleEvents || []).forEach(l => {
    events.push({
      type: 'LIFECYCLE_EVENT',
      title: `Lifecycle Event: ${l.eventType}`,
      subtitle: `Transition: ${l.previousStatus} ➔ ${l.newStatus} | Officer: ${l.officerId} | Reason: ${l.reason}`,
      timestamp: l.timestamp,
      icon: '🏛️',
      badge: l.newStatus,
      color: l.newStatus === 'ACTIVE' ? '#22c55e' : l.newStatus === 'SUSPENDED' ? '#f97316' : l.newStatus === 'TERMINATED' ? '#ef4444' : '#3b82f6',
    });
  });

  // Sort Chronologically (newest first)
  events.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  if (events.length === 0) {
    container.innerHTML = '<div style="color:#94a3b8;font-size:0.875rem;">No history records found for this application.</div>';
    return;
  }

  container.innerHTML = events.map(ev => `
    <div style="display:flex;gap:12px;align-items:flex-start;background:#0f172a;border-left:4px solid ${ev.color};padding:12px 16px;border-radius:8px;border-top:1px solid #1e293b;border-right:1px solid #1e293b;border-bottom:1px solid #1e293b;">
      <span style="font-size:1.25rem;">${ev.icon}</span>
      <div style="flex:1;">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px;flex-wrap:wrap;gap:6px;">
          <strong style="font-size:0.9rem;color:#f8fafc;">${ev.title}</strong>
          <span style="font-size:0.75rem;padding:2px 8px;border-radius:999px;background:${ev.color}22;color:${ev.color};border:1px solid ${ev.color}44;font-weight:600;">${ev.badge}</span>
        </div>
        <div style="color:#94a3b8;font-size:0.8rem;margin-bottom:4px;">${ev.subtitle}</div>
        <div style="color:#64748b;font-size:0.75rem;font-family:'JetBrains Mono',monospace;">⏱️ ${new Date(ev.timestamp).toLocaleString()}</div>
      </div>
    </div>
  `).join('');
}

async function handleOfficerCalculateElig() {
  const appId = document.getElementById('inpOfficerAswAppId')?.value.trim();
  if (!appId) return;
  const res = await apiFetch(`/welfare/aswesuma/applications/${appId}/eligibility/calculate`, { method: 'POST' });
  if (res.ok) {
    showToast(`Eligibility score calculated: ${res.data.data.calculatedScore} pts (${res.data.data.category})`);
    loadOfficerWelfareCase();
  } else {
    showToast(`Calculation failed: ${res.data?.error || 'Unknown error'}`, false);
  }
}

async function handleOfficerAnchorBc() {
  const appId = document.getElementById('inpOfficerAswAppId')?.value.trim();
  if (!appId) return;
  const res = await apiFetch(`/welfare/aswesuma/applications/${appId}/eligibility/blockchain`, { method: 'POST' });
  if (res.ok) {
    showToast(`Eligibility anchored on blockchain: ${res.data.data.recordId}`);
    loadOfficerWelfareCase();
  } else {
    showToast(`Blockchain recording failed: ${res.data?.error || 'Unknown error'}`, false);
  }
}

async function handleOfficerVerifyBc() {
  const appId = document.getElementById('inpOfficerAswAppId')?.value.trim();
  if (!appId) return;
  const res = await apiFetch(`/welfare/aswesuma/applications/${appId}/eligibility/blockchain/verify`);
  if (res.ok && res.data?.data) {
    const v = res.data.data;
    const badge = document.getElementById('badgeOfficerBcIntegrity');
    if (v.isIntegrityVerified) {
      badge.style.display = 'inline-block';
      badge.style.background = '#10b981';
      badge.textContent = '✓ Hash Verified (VALID)';
      showToast('Cryptographic Verification PASSED: On-chain digest matches off-chain assessment.');
    } else {
      badge.style.display = 'inline-block';
      badge.style.background = '#ef4444';
      badge.textContent = '❌ Hash Mismatch (INVALID)';
      showToast('INTEGRITY MISMATCH: Off-chain assessment differs from on-chain hash!', false);
    }
  }
}

async function handleOfficerActivateBenefit() {
  const appId = document.getElementById('inpOfficerAswAppId')?.value.trim();
  if (!appId) return;
  const res = await apiFetch(`/welfare/aswesuma/applications/${appId}/lifecycle`, {
    method: 'POST',
    body: {
      event: 'BENEFIT_ACTIVATED',
      reason: 'Approved for monthly disbursement by Divisional Secretary.',
      officerId: 'OFFICER-PROTOTYPE-001',
    }
  });
  if (res.ok) {
    showToast('Welfare benefit officially ACTIVATED.');
    loadOfficerWelfareCase();
  } else {
    showToast(`Activation failed: ${res.data?.error || 'Unknown error'}`, false);
  }
}

async function handleOfficerReassess() {
  const appId = document.getElementById('inpOfficerAswAppId')?.value.trim();
  if (!appId) return;
  const reason = prompt('Enter reassessment rationale / updated circumstance reference:', 'Periodic annual welfare reassessment');
  if (!reason) return;

  const res = await apiFetch(`/welfare/aswesuma/applications/${appId}/reassessment`, {
    method: 'POST',
    body: {
      reason,
      officerId: 'OFFICER-PROTOTYPE-001',
    }
  });
  if (res.ok) {
    showToast('Reassessment completed: New score evaluated and anchored to blockchain.');
    loadOfficerWelfareCase();
  } else {
    showToast(`Reassessment failed: ${res.data?.error || 'Unknown error'}`, false);
  }
}

async function handleOfficerSuspendBenefit() {
  const appId = document.getElementById('inpOfficerAswAppId')?.value.trim();
  if (!appId) return;
  const reason = prompt('Enter reason for suspending benefit disbursement:', 'Residency / Income dispute under administrative inquiry');
  if (!reason) return;

  const res = await apiFetch(`/welfare/aswesuma/applications/${appId}/lifecycle`, {
    method: 'POST',
    body: {
      event: 'BENEFIT_SUSPENDED',
      reason,
      officerId: 'OFFICER-PROTOTYPE-001',
    }
  });
  if (res.ok) {
    showToast('Benefit disbursement SUSPENDED.');
    loadOfficerWelfareCase();
  } else {
    showToast(`Suspension failed: ${res.data?.error || 'Unknown error'}`, false);
  }
}

async function handleOfficerReactivateBenefit() {
  const appId = document.getElementById('inpOfficerAswAppId')?.value.trim();
  if (!appId) return;
  const reason = prompt('Enter reactivation justification:', 'Inquiry resolved satisfactorily. Reinstating monthly benefit.');
  if (!reason) return;

  const res = await apiFetch(`/welfare/aswesuma/applications/${appId}/lifecycle`, {
    method: 'POST',
    body: {
      event: 'BENEFIT_REACTIVATED',
      reason,
      officerId: 'OFFICER-PROTOTYPE-001',
    }
  });
  if (res.ok) {
    showToast('Benefit successfully REACTIVATED.');
    loadOfficerWelfareCase();
  } else {
    showToast(`Reactivation failed: ${res.data?.error || 'Unknown error'}`, false);
  }
}

async function handleOfficerTerminateBenefit() {
  const appId = document.getElementById('inpOfficerAswAppId')?.value.trim();
  if (!appId) return;
  const isDeath = confirm('Click OK if recording BENEFICIARY DEATH, or CANCEL for standard administrative termination.');
  
  let event = 'BENEFIT_TERMINATED';
  let body = {
    officerId: 'OFFICER-PROTOTYPE-001',
  };

  if (isDeath) {
    event = 'BENEFICIARY_DEATH_RECORDED';
    const certNum = prompt('Enter Official Death Certificate Number:', 'D-CERT-2026-00192');
    if (!certNum) return;
    body.event = event;
    body.deathCertificateNumber = certNum;
    body.dateOfDeath = new Date().toISOString().split('T')[0];
    body.reason = `Official registrar death certificate verified (${certNum}).`;
  } else {
    const reason = prompt('Enter termination reason:', 'Permanent ineligibility / Disqualification');
    if (!reason) return;
    body.event = event;
    body.reason = reason;
  }

  const res = await apiFetch(`/welfare/aswesuma/applications/${appId}/lifecycle`, {
    method: 'POST',
    body,
  });
  if (res.ok) {
    showToast('Benefit permanently TERMINATED. History preserved on ledger.');
    loadOfficerWelfareCase();
  } else {
    showToast(`Termination failed: ${res.data?.error || 'Unknown error'}`, false);
  }
}
