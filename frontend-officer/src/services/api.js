const BASE_URL = 'http://127.0.0.1:5001/api';

// Helper for HTTP requests
async function request(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  try {
    const res = await fetch(url, {
      ...options,
      headers,
    });
    const data = await res.json().catch(() => ({}));
    return {
      ok: res.ok,
      status: res.status,
      data,
    };
  } catch (err) {
    console.error(`API Error [${endpoint}]:`, err);
    return {
      ok: false,
      status: 0,
      data: { error: err.message || 'Network error' },
    };
  }
}

// ---------------------------------------------------------------------------
// Health
// ---------------------------------------------------------------------------
export async function checkHealth() {
  return request('/health');
}

// ---------------------------------------------------------------------------
// 1. Citizen Registration
// ---------------------------------------------------------------------------
export async function getRegistration(userId) {
  return request(`/registration/${encodeURIComponent(userId)}`);
}

export async function submitRegistration(payload) {
  return request('/registration', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

// ---------------------------------------------------------------------------
// 2. Identity Application & Verification
// ---------------------------------------------------------------------------
export async function applyForIdentity(userId, additionalAttributes = {}) {
  return request('/identity/apply', {
    method: 'POST',
    body: JSON.stringify({
      userId,
      gnDivision: additionalAttributes.gnDivision || 'Minuwangoda North',
      additionalAttributes,
    }),
  });
}

export async function submitFaceEvidence(verificationId, evidenceReference, algorithm = 'LiveWebcamCapture-v1.0') {
  return request(`/verification/${encodeURIComponent(verificationId)}/face`, {
    method: 'POST',
    body: JSON.stringify({
      faceImageBase64: evidenceReference,
      matchScore: 0.965,
      algorithm,
    }),
  });
}

export async function submitNicEvidence(
  verificationId,
  evidenceReference,
  documentType = 'NATIONAL_IDENTITY_CARD',
  documentNumberMasked = 'SYN-NIC-*****1234'
) {
  return request(`/verification/${encodeURIComponent(verificationId)}/document`, {
    method: 'POST',
    body: JSON.stringify({
      documentType,
      documentImageBase64: evidenceReference,
      documentNumberMasked,
    }),
  });
}

export async function getVerificationStatus(verificationId) {
  return request(`/verification/${encodeURIComponent(verificationId)}/status`);
}

export async function getIdentity(did) {
  return request(`/identity/${encodeURIComponent(did)}`);
}

export async function getIdentityByUserId(userId) {
  return request(`/identity/user/${encodeURIComponent(userId)}`);
}

// ---------------------------------------------------------------------------
// 3. Officer Authentication & KYC Adjudication
// ---------------------------------------------------------------------------
export async function officerLogin(officerId = 'OFFICER-PROTOTYPE-001', password = 'prototype123') {
  return request('/officer/auth/login', {
    method: 'POST',
    body: JSON.stringify({ officerId, password }),
  });
}

export async function getOfficerPendingQueue() {
  return request('/officer/verification/pending');
}

export async function getOfficerReviewCase(verificationId) {
  return request(`/officer/verification/${encodeURIComponent(verificationId)}/review`);
}

export async function adjudicateCase(verificationId, decision, remarks = '', token = null) {
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  const formattedDecision = decision === 'APPROVE' ? 'APPROVED' : decision === 'REJECT' ? 'REJECTED' : decision;
  return request(`/officer/verification/${encodeURIComponent(verificationId)}/decision`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      decision: formattedDecision,
      officerId: 'OFFICER-PROTOTYPE-001',
      remarks,
    }),
  });
}

// ---------------------------------------------------------------------------
// 4. Welfare & Aswesuma Lifecycle & PMT Scoring
// ---------------------------------------------------------------------------
export async function submitAswesumaApplication(payload) {
  return request('/welfare/aswesuma/applications', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function calculateAswesumaEligibility(applicationId) {
  return request(`/welfare/aswesuma/applications/${encodeURIComponent(applicationId)}/eligibility/calculate`, {
    method: 'POST',
  });
}

export async function recordEligibilityOnBlockchain(applicationId) {
  return request(`/welfare/aswesuma/applications/${encodeURIComponent(applicationId)}/eligibility/blockchain`, {
    method: 'POST',
  });
}

export async function verifyBlockchainRecord(applicationId) {
  return request(`/welfare/aswesuma/applications/${encodeURIComponent(applicationId)}/eligibility/blockchain/verify`);
}

export async function transitionWelfareLifecycle(applicationId, eventType, officerId = 'OFFICER-PROTOTYPE-001', reason = '') {
  return request(`/welfare/aswesuma/applications/${encodeURIComponent(applicationId)}/lifecycle`, {
    method: 'POST',
    body: JSON.stringify({
      eventType,
      officerId,
      reason,
    }),
  });
}
