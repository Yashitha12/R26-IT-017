import { Router } from 'express';
import { mockVerificationProvider } from '../providers/verification.provider';

const router = Router();

// ============================================================================
// IN-MEMORY DATA STORE (Synchronized across Citizen, Officer & Mobile portals)
// ============================================================================

interface VerificationRecord {
  verificationId: string;
  userId: string;
  applicantName: string;
  applicantNicMasked: string;
  gnDivision: string;
  finalStatus: 'PENDING' | 'VERIFIED' | 'REJECTED';
  facialVerification: {
    status: 'PASSED' | 'SUBMITTED' | 'NOT_SUBMITTED';
    matchScore: number;
    algorithm: string;
    image?: string;
  };
  documentVerification: {
    status: 'PASSED' | 'SUBMITTED' | 'NOT_SUBMITTED';
    documentType: string;
    documentNumberMasked: string;
    image?: string;
  };
  officerReviewStatus: 'PENDING' | 'APPROVED' | 'REJECTED';
  did?: string;
  remarks?: string;
  submittedAt?: string;
}

const registrations = new Map<string, any>([
  [
    'user-prototype-001',
    {
      userId: 'user-prototype-001',
      _id: 'user-prototype-001',
      name: 'Aravinda Kumara',
      nic: '200223003053',
      dateOfBirth: '01/12/2002',
      phone: '+94 78 145 3248',
      email: 'samankumara@gmail.com',
      address: '45/A, Jayawickrama Road',
      city: 'Gampaha',
      district: 'Gampaha',
      gnDivision: 'Minuwangoda North',
      familySize: 4,
      noOfDependents: 2,
      monthlyIncome: 35000,
      monthlyExpenses: 30000,
      employmentType: 'Farmer',
      bankName: 'Sampath Bank',
      accountNumber: '000123456789',
      branch: 'Gampaha',
      kycStatus: 'PENDING',
    },
  ],
  [
    'user-prototype-002',
    {
      userId: 'user-prototype-002',
      _id: 'user-prototype-002',
      name: 'Nimali Perera',
      nic: '198567123456',
      dateOfBirth: '15/04/1985',
      phone: '+94 71 234 5678',
      email: 'nimali.p@gmail.com',
      address: '12, Temple Road',
      city: 'Kandy',
      district: 'Kandy',
      gnDivision: 'Kandy Central',
      familySize: 3,
      noOfDependents: 1,
      monthlyIncome: 28000,
      monthlyExpenses: 24000,
      employmentType: 'Self-employed',
      bankName: 'Bank of Ceylon',
      accountNumber: '111222333444',
      branch: 'Kandy',
      kycStatus: 'PENDING',
    },
  ],
]);

const verifications = new Map<string, VerificationRecord>([
  [
    'ver-prototype-001',
    {
      verificationId: 'ver-prototype-001',
      userId: 'user-prototype-001',
      applicantName: 'Aravinda Kumara',
      applicantNicMasked: 'SYN-NIC-*****3053',
      gnDivision: 'Minuwangoda North',
      finalStatus: 'PENDING',
      facialVerification: {
        status: 'PASSED',
        matchScore: 0.965,
        algorithm: 'SyntheticFaceMatch-v1.0',
      },
      documentVerification: {
        status: 'PASSED',
        documentType: 'NATIONAL_IDENTITY_CARD',
        documentNumberMasked: 'SYN-NIC-*****3053',
      },
      officerReviewStatus: 'PENDING',
      submittedAt: new Date().toLocaleDateString('en-GB'),
    },
  ],
  [
    'ver-prototype-002',
    {
      verificationId: 'ver-prototype-002',
      userId: 'user-prototype-002',
      applicantName: 'Nimali Perera',
      applicantNicMasked: 'SYN-NIC-*****3456',
      gnDivision: 'Kandy Central',
      finalStatus: 'PENDING',
      facialVerification: {
        status: 'PASSED',
        matchScore: 0.958,
        algorithm: 'SyntheticFaceMatch-v1.0',
      },
      documentVerification: {
        status: 'PASSED',
        documentType: 'NATIONAL_IDENTITY_CARD',
        documentNumberMasked: 'SYN-NIC-*****3456',
      },
      officerReviewStatus: 'PENDING',
      submittedAt: new Date().toLocaleDateString('en-GB'),
    },
  ],
]);

const identities = new Map<string, any>();

// ============================================================================
// 1. HEALTH & SYSTEM
// ============================================================================
router.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok', service: 'welfare-digital-identity-backend' });
});

// ============================================================================
// 2. CITIZEN REGISTRATION
// ============================================================================
router.post('/registration', (req, res) => {
  const data = req.body || {};
  const id = data.userId || (data.nic ? `user-${data.nic}` : `user-${Date.now().toString().slice(-4)}`);
  const record = {
    userId: id,
    _id: id,
    ...data,
    kycStatus: 'PENDING',
  };
  registrations.set(id, record);
  if (data.nic) registrations.set(data.nic, record);

  res.status(201).json({
    status: 'success',
    data: { userId: id, ...record },
    user: record,
    message: 'User registered successfully',
  });
});

router.get('/registration/:id', (req, res) => {
  const id = req.params.id;
  const reg = registrations.get(id) || registrations.get('user-prototype-001');
  const ver = verifications.get(id.replace('user-', 'ver-')) || verifications.get('ver-prototype-001');

  res.status(200).json({
    status: 'success',
    data: { ...reg, kycStatus: ver?.finalStatus || 'PENDING' },
    user: { ...reg, kycStatus: ver?.finalStatus || 'PENDING' },
    ...reg,
    kycStatus: ver?.finalStatus || 'PENDING',
  });
});

// ============================================================================
// 3. IDENTITY APPLICATION & LOOKUP
// ============================================================================
router.post(['/identity', '/identity/apply'], (req, res) => {
  const { userId, gnDivision, identifier, fullName, nic } = req.body || {};
  const uId = userId || identifier || 'user-prototype-001';
  const suffix = uId.replace('user-prototype-', '').replace('user-', '');
  const verId = `ver-prototype-${suffix}`;
  const appId = `app-${suffix}-${Date.now().toString().slice(-4)}`;

  const reg = registrations.get(uId) || registrations.get(suffix) || {};
  const name = fullName || reg.name || reg.fullName || 'Citizen Applicant';
  const rawNic = nic || reg.nic || suffix;
  const maskedNic = `SYN-NIC-*****${(rawNic || '1234').slice(-4)}`;

  let ver = verifications.get(verId);

  if (!ver) {
    ver = {
      verificationId: verId,
      userId: uId,
      applicantName: name,
      applicantNicMasked: maskedNic,
      gnDivision: gnDivision || reg.gnDivision || 'Minuwangoda North',
      finalStatus: 'PENDING',
      facialVerification: {
        status: 'SUBMITTED',
        matchScore: 0.965,
        algorithm: 'LiveWebcamCapture-v1.0',
      },
      documentVerification: {
        status: 'SUBMITTED',
        documentType: 'NATIONAL_IDENTITY_CARD',
        documentNumberMasked: maskedNic,
      },
      officerReviewStatus: 'PENDING',
      submittedAt: new Date().toLocaleDateString('en-GB'),
    };
    verifications.set(verId, ver);
  } else {
    // Re-queue to PENDING for officer review
    ver.finalStatus = 'PENDING';
    ver.officerReviewStatus = 'PENDING';
    ver.applicantName = name;
    ver.applicantNicMasked = maskedNic;
    if (gnDivision || reg.gnDivision) ver.gnDivision = gnDivision || reg.gnDivision;
    ver.submittedAt = new Date().toLocaleDateString('en-GB');
  }

  // Also sync to mockVerificationProvider for welfare eligibility check
  try {
    mockVerificationProvider.createVerificationRecord({
      verificationId: verId,
      userId: uId,
      applicantName: ver.applicantName,
      applicantNicMasked: ver.applicantNicMasked,
      gnDivision: ver.gnDivision,
      finalStatus: 'PENDING',
      officerReviewStatus: 'PENDING',
      facialVerification: {
        status: 'SUBMITTED',
        matchScore: 0.965,
        algorithm: 'LiveWebcamCapture-v1.0',
        submittedAt: new Date().toISOString(),
      },
      documentVerification: {
        status: 'SUBMITTED',
        documentType: 'NATIONAL_IDENTITY_CARD',
        documentNumberMasked: ver.applicantNicMasked,
        submittedAt: new Date().toISOString(),
      },
    });
  } catch (_) {}

  res.status(200).json({
    status: 'success',
    data: {
      applicationId: appId,
      verificationId: verId,
      userId: uId,
    },
    message: 'Identity application registered successfully and queued for officer review',
  });
});

router.get('/identity/user/:id', (req, res) => {
  const userId = req.params.id;
  const suffix = userId.replace('user-prototype-', '').replace('user-', '');
  const verId = `ver-prototype-${suffix}`;
  const ver = verifications.get(verId) || verifications.get('ver-prototype-001');
  const did = ver?.did;
  const idData = did ? identities.get(did) : null;

  res.status(200).json({
    status: 'success',
    kycStatus: ver?.finalStatus || 'PENDING',
    data: idData,
  });
});

router.get('/identity/:did', (req, res) => {
  const did = req.params.did;
  const idData = identities.get(did) || {
    did,
    status: 'ACTIVE',
    issuedAt: new Date().toISOString(),
    controller: 'did:smartgrama:governance:gn',
  };
  res.status(200).json({ status: 'success', data: idData });
});

// Mobile evidence endpoints (supporting mobile client KYC)
router.post(['/identity/evidence/face', '/verification/evidence/face'], (req, res) => {
  const { identifier, userId, faceData, matchScore, algorithm } = req.body || {};
  const id = userId || identifier || 'user-prototype-001';
  const suffix = id.replace('user-prototype-', '').replace('user-', '');
  const verId = `ver-prototype-${suffix}`;

  let ver = verifications.get(verId);
  const reg = registrations.get(id) || registrations.get(suffix) || {};

  if (!ver) {
    ver = {
      verificationId: verId,
      userId: id,
      applicantName: reg.name || reg.fullName || 'Citizen Resident',
      applicantNicMasked: `SYN-NIC-*****${(reg.nic || suffix || '1234').slice(-4)}`,
      gnDivision: reg.gnDivision || 'Minuwangoda North',
      finalStatus: 'PENDING',
      facialVerification: {
        status: 'PASSED',
        matchScore: matchScore || 0.965,
        algorithm: algorithm || 'MobileFaceCapture-v1.0',
        image: faceData,
        evidenceReference: faceData,
      },
      documentVerification: {
        status: 'NOT_SUBMITTED',
        documentType: 'NATIONAL_IDENTITY_CARD',
        documentNumberMasked: `SYN-NIC-*****${(reg.nic || suffix || '1234').slice(-4)}`,
      },
      officerReviewStatus: 'PENDING',
      submittedAt: new Date().toLocaleDateString('en-GB'),
    };
    verifications.set(verId, ver);
  } else {
    ver.finalStatus = 'PENDING';
    ver.officerReviewStatus = 'PENDING';
    ver.facialVerification = {
      status: 'PASSED',
      matchScore: matchScore || 0.965,
      algorithm: algorithm || 'MobileFaceCapture-v1.0',
      image: faceData,
      evidenceReference: faceData,
    };
  }

  res.status(200).json({ status: 'success', data: ver, message: 'Face evidence accepted and queued for officer review' });
});

router.post(['/identity/evidence/nic', '/verification/evidence/nic'], (req, res) => {
  const { identifier, userId, nicData, documentType, documentNumberMasked } = req.body || {};
  const id = userId || identifier || 'user-prototype-001';
  const suffix = id.replace('user-prototype-', '').replace('user-', '');
  const verId = `ver-prototype-${suffix}`;

  let ver = verifications.get(verId);
  const reg = registrations.get(id) || registrations.get(suffix) || {};

  if (!ver) {
    ver = {
      verificationId: verId,
      userId: id,
      applicantName: reg.name || reg.fullName || 'Citizen Resident',
      applicantNicMasked: documentNumberMasked || `SYN-NIC-*****${(reg.nic || suffix || '1234').slice(-4)}`,
      gnDivision: reg.gnDivision || 'Minuwangoda North',
      finalStatus: 'PENDING',
      facialVerification: {
        status: 'NOT_SUBMITTED',
        matchScore: 0.95,
        algorithm: 'SyntheticFaceMatch-v1.0',
      },
      documentVerification: {
        status: 'PASSED',
        documentType: documentType || 'NATIONAL_IDENTITY_CARD',
        documentNumberMasked: documentNumberMasked || `SYN-NIC-*****${(reg.nic || suffix || '1234').slice(-4)}`,
        image: nicData,
        evidenceReference: nicData,
      },
      officerReviewStatus: 'PENDING',
      submittedAt: new Date().toLocaleDateString('en-GB'),
    };
    verifications.set(verId, ver);
  } else {
    ver.finalStatus = 'PENDING';
    ver.officerReviewStatus = 'PENDING';
    ver.documentVerification = {
      status: 'PASSED',
      documentType: documentType || 'NATIONAL_IDENTITY_CARD',
      documentNumberMasked: documentNumberMasked || ver.applicantNicMasked,
      image: nicData,
      evidenceReference: nicData,
    };
  }

  res.status(200).json({ status: 'success', data: ver, message: 'NIC evidence accepted and queued for officer review' });
});

// ============================================================================
// 4. BIOMETRIC EVIDENCE UPLOAD & STATUS (React Web Frontend)
// ============================================================================
router.post('/verification/:verificationId/face', (req, res) => {
  const verId = req.params.verificationId;
  const { faceImageBase64, matchScore, algorithm } = req.body || {};
  let ver = verifications.get(verId);
  const uId = `user-${verId.replace('ver-prototype-', '').replace('ver-', '')}`;
  const reg = registrations.get(uId) || {};

  if (!ver) {
    ver = {
      verificationId: verId,
      userId: uId,
      applicantName: reg.name || reg.fullName || 'Citizen Applicant',
      applicantNicMasked: `SYN-NIC-*****${(reg.nic || verId.slice(-4) || '1234').slice(-4)}`,
      gnDivision: reg.gnDivision || 'Minuwangoda North',
      finalStatus: 'PENDING',
      facialVerification: {
        status: 'PASSED',
        matchScore: matchScore || 0.965,
        algorithm: algorithm || 'LiveWebcamCapture-v1.0',
        image: faceImageBase64,
        evidenceReference: faceImageBase64,
      },
      documentVerification: {
        status: 'NOT_SUBMITTED',
        documentType: 'NATIONAL_IDENTITY_CARD',
        documentNumberMasked: `SYN-NIC-*****${(reg.nic || verId.slice(-4) || '1234').slice(-4)}`,
      },
      officerReviewStatus: 'PENDING',
      submittedAt: new Date().toLocaleDateString('en-GB'),
    };
    verifications.set(verId, ver);
  } else {
    ver.finalStatus = 'PENDING';
    ver.officerReviewStatus = 'PENDING';
    ver.facialVerification = {
      status: 'PASSED',
      matchScore: matchScore || 0.965,
      algorithm: algorithm || 'LiveWebcamCapture-v1.0',
      image: faceImageBase64,
      evidenceReference: faceImageBase64,
    };
  }

  try {
    mockVerificationProvider.submitFaceEvidence(verId, {
      status: 'PASSED',
      matchScore: matchScore || 0.965,
      algorithm: algorithm || 'LiveWebcamCapture-v1.0',
      submittedAt: new Date().toISOString(),
      evidenceReference: faceImageBase64 || 'live-webcam-face',
    });
  } catch (_) {}

  res.status(200).json({ status: 'success', data: ver });
});

router.post('/verification/:verificationId/document', (req, res) => {
  const verId = req.params.verificationId;
  const { documentImageBase64, documentType, documentNumberMasked } = req.body || {};
  let ver = verifications.get(verId);
  const uId = `user-${verId.replace('ver-prototype-', '').replace('ver-', '')}`;
  const reg = registrations.get(uId) || {};

  if (!ver) {
    ver = {
      verificationId: verId,
      userId: uId,
      applicantName: reg.name || reg.fullName || 'Citizen Applicant',
      applicantNicMasked: documentNumberMasked || `SYN-NIC-*****${(reg.nic || verId.slice(-4) || '1234').slice(-4)}`,
      gnDivision: reg.gnDivision || 'Minuwangoda North',
      finalStatus: 'PENDING',
      facialVerification: {
        status: 'NOT_SUBMITTED',
        matchScore: 0.95,
        algorithm: 'SyntheticFaceMatch-v1.0',
      },
      documentVerification: {
        status: 'PASSED',
        documentType: documentType || 'NATIONAL_IDENTITY_CARD',
        documentNumberMasked: documentNumberMasked || `SYN-NIC-*****${(reg.nic || verId.slice(-4) || '1234').slice(-4)}`,
        image: documentImageBase64,
        evidenceReference: documentImageBase64,
      },
      officerReviewStatus: 'PENDING',
      submittedAt: new Date().toLocaleDateString('en-GB'),
    };
    verifications.set(verId, ver);
  } else {
    ver.finalStatus = 'PENDING';
    ver.officerReviewStatus = 'PENDING';
    ver.documentVerification = {
      status: 'PASSED',
      documentType: documentType || 'NATIONAL_IDENTITY_CARD',
      documentNumberMasked: documentNumberMasked || ver.applicantNicMasked,
      image: documentImageBase64,
      evidenceReference: documentImageBase64,
    };
  }

  try {
    mockVerificationProvider.submitDocumentEvidence(verId, {
      status: 'VERIFIED',
      documentType: (documentType || 'SYNTHETIC_NATIONAL_IDENTITY_CARD') as any,
      documentNumberMasked: ver.documentVerification.documentNumberMasked,
      submittedAt: new Date().toISOString(),
      evidenceReference: documentImageBase64 || 'nic-document-upload',
    });
  } catch (_) {}

  res.status(200).json({ status: 'success', data: ver });
});

router.get('/verification/:verificationId/status', (req, res) => {
  const verId = req.params.verificationId;
  const ver = verifications.get(verId) || verifications.get('ver-prototype-001');

  if (!ver) {
    return res.status(200).json({
      status: 'success',
      data: {
        verificationId: verId,
        finalStatus: 'PENDING',
        facialVerificationStatus: 'NOT_SUBMITTED',
        documentVerificationStatus: 'NOT_SUBMITTED',
        officerReviewStatus: 'PENDING',
      },
    });
  }

  res.status(200).json({
    status: 'success',
    data: {
      verificationId: ver.verificationId,
      userId: ver.userId,
      finalStatus: ver.finalStatus,
      facialVerificationStatus: ver.facialVerification.status,
      documentVerificationStatus: ver.documentVerification.status,
      officerReviewStatus: ver.officerReviewStatus,
      did: ver.did,
      remarks: ver.remarks || '',
    },
  });
});

router.get('/verification/:verificationId', (req, res) => {
  const verId = req.params.verificationId;
  const ver = verifications.get(verId) || verifications.get('ver-prototype-001');
  res.status(200).json({ status: 'success', data: ver });
});

// ============================================================================
// 5. OFFICER QUEUE & ADJUDICATION (Officer Portal http://localhost:5174/kyc)
// ============================================================================
router.post('/officer/auth/login', (_req, res) => {
  res.status(200).json({
    status: 'success',
    data: {
      token: 'jwt-officer-prototype-token-xyz',
      officer: {
        id: 'OFFICER-PROTOTYPE-001',
        name: 'Grama Niladhari Lead (Officer)',
        role: 'OFFICER_REVIEWER',
      },
    },
  });
});

router.get('/officer/verification/pending', (_req, res) => {
  const list = Array.from(verifications.values()).filter((v) => v.finalStatus === 'PENDING');
  res.status(200).json({ status: 'success', data: list });
});

router.get('/officer/verification/:verificationId/review', (req, res) => {
  const verId = req.params.verificationId;
  const ver = verifications.get(verId) || verifications.get('ver-prototype-001');
  res.status(200).json({ status: 'success', data: ver });
});

router.post('/officer/verification/:verificationId/decision', (req, res) => {
  const verId = req.params.verificationId;
  const { decision, remarks } = req.body || {};
  let ver = verifications.get(verId) || verifications.get('ver-prototype-001');

  if (!ver) {
    return res.status(404).json({ status: 'error', error: 'Verification case not found' });
  }

  const isApproved = decision === 'APPROVE' || decision === 'APPROVED';
  if (isApproved) {
    const rawSuffix = ver.applicantNicMasked.replace(/[^0-9]/g, '') || Date.now().toString().slice(-4);
    const did = `did:smartgrama:prototype:${rawSuffix}`;
    ver.finalStatus = 'VERIFIED';
    ver.officerReviewStatus = 'APPROVED';
    ver.did = did;
    ver.remarks = remarks || 'Biometric live selfie and NIC document details verified satisfactory.';
    
    // 1. Store in active identities
    identities.set(did, {
      did,
      userId: ver.userId,
      status: 'ACTIVE',
      issuedAt: new Date().toISOString(),
      controller: 'did:smartgrama:governance:gn',
    });

    // 2. Update registrations store
    const reg = registrations.get(ver.userId) || registrations.get(ver.userId.replace('user-', ''));
    if (reg) {
      reg.kycStatus = 'VERIFIED';
      reg.did = did;
    }

    // 3. Synchronize with mockVerificationProvider (so welfare service PMT validation succeeds)
    try {
      mockVerificationProvider.recordOfficerDecision(
        verId,
        'APPROVE',
        'OFFICER-PROTOTYPE-001',
        ver.remarks,
        did
      );
    } catch (_) {}
  } else {
    ver.finalStatus = 'REJECTED';
    ver.officerReviewStatus = 'REJECTED';
    ver.remarks = remarks || 'Verification rejected by Grama Niladhari Officer.';

    const reg = registrations.get(ver.userId) || registrations.get(ver.userId.replace('user-', ''));
    if (reg) {
      reg.kycStatus = 'REJECTED';
    }

    try {
      mockVerificationProvider.recordOfficerDecision(
        verId,
        'REJECT',
        'OFFICER-PROTOTYPE-001',
        ver.remarks
      );
    } catch (_) {}
  }

  res.status(200).json({
    status: 'success',
    data: ver,
    message: isApproved ? 'KYC approved and DID issued' : 'KYC rejected',
  });
});

// Helper endpoint to reset/requeue a prototype verification for live testing
router.post('/officer/verification/:verificationId/requeue', (req, res) => {
  const verId = req.params.verificationId;
  let ver = verifications.get(verId);
  if (!ver) {
    ver = {
      verificationId: verId,
      userId: `user-${verId.replace('ver-prototype-', '').replace('ver-', '')}`,
      applicantName: 'Aravinda Kumara',
      applicantNicMasked: 'SYN-NIC-*****3053',
      gnDivision: 'Minuwangoda North',
      finalStatus: 'PENDING',
      facialVerification: {
        status: 'PASSED',
        matchScore: 0.965,
        algorithm: 'SyntheticFaceMatch-v1.0',
      },
      documentVerification: {
        status: 'PASSED',
        documentType: 'NATIONAL_IDENTITY_CARD',
        documentNumberMasked: 'SYN-NIC-*****3053',
      },
      officerReviewStatus: 'PENDING',
      submittedAt: new Date().toLocaleDateString('en-GB'),
    };
    verifications.set(verId, ver);
  } else {
    ver.finalStatus = 'PENDING';
    ver.officerReviewStatus = 'PENDING';
    ver.submittedAt = new Date().toLocaleDateString('en-GB');
  }
  res.status(200).json({ status: 'success', data: ver, message: 'Case returned to pending queue' });
});

// ============================================================================
// 6. WELFARE & ASWESUMA LIFECYCLE
// ============================================================================
router.post('/welfare/aswesuma/applications', (_req, res) => {
  res.status(201).json({
    status: 'success',
    data: { applicationId: `ASW-${Date.now().toString().slice(-6)}` },
  });
});

router.post('/welfare/aswesuma/applications/:id/eligibility/calculate', (_req, res) => {
  res.status(200).json({
    status: 'success',
    data: {
      calculatedScore: 565.0,
      category: 'POOR',
      thresholdApplied: { monthlyBenefitLkr: 8500 },
    },
  });
});

router.get('/welfare/aswesuma/applications/:id/eligibility', (_req, res) => {
  res.status(200).json({
    status: 'success',
    data: {
      calculatedScore: 565.0,
      category: 'POOR',
      thresholdApplied: { monthlyBenefitLkr: 8500 },
    },
  });
});

router.post('/welfare/aswesuma/applications/:id/eligibility/blockchain', (_req, res) => {
  res.status(200).json({
    status: 'success',
    data: {
      txHash: `0x${Math.random().toString(16).slice(2)}${Math.random().toString(16).slice(2)}`,
      status: 'COMMITTED',
    },
  });
});

router.get('/welfare/aswesuma/applications/:id/eligibility/blockchain/verify', (_req, res) => {
  res.status(200).json({
    status: 'success',
    data: { verified: true, consensus: 'COMMITTED_ON_CHAIN' },
  });
});

router.post('/welfare/aswesuma/applications/:id/lifecycle', (_req, res) => {
  res.status(200).json({ status: 'success', data: { status: 'UPDATED' } });
});

export default router;
