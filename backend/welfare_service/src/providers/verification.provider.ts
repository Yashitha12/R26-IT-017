import {
  IdentityVerificationRecord,
  FacialVerificationEvidence,
  DocumentVerificationEvidence,
  OfficerDecisionType,
} from '../types/verification';

export interface IVerificationProvider {
  getVerificationRecord(verificationId: string): IdentityVerificationRecord | null;
  getVerificationRecordByUserId(userId: string): IdentityVerificationRecord | null;
  createVerificationRecord(record: IdentityVerificationRecord): IdentityVerificationRecord;
  submitFaceEvidence(
    verificationId: string,
    evidence: FacialVerificationEvidence
  ): IdentityVerificationRecord | null;
  submitDocumentEvidence(
    verificationId: string,
    evidence: DocumentVerificationEvidence
  ): IdentityVerificationRecord | null;
  getPendingKycCases(): IdentityVerificationRecord[];
  getAllRecords(): IdentityVerificationRecord[];
  recordOfficerDecision(
    verificationId: string,
    decision: OfficerDecisionType,
    officerId: string,
    remarks?: string,
    issuedDid?: string
  ): IdentityVerificationRecord | null;
}

export class MockVerificationProvider implements IVerificationProvider {
  private readonly records: Map<string, IdentityVerificationRecord> = new Map();
  private readonly recordsByUserId: Map<string, string> = new Map();

  constructor() {
    this.seedMockRecords();
  }

  private seedMockRecords(): void {
    // Record 1: Pre-seeded APPROVED & VERIFIED case (DID was issued upon officer approval)
    const syntheticRecord1: IdentityVerificationRecord = {
      verificationId: 'ver-prototype-001',
      userId: 'user-prototype-001',
      did: 'did:smartgrama:prototype:001',
      applicantName: 'Aravinda Kumara',
      applicantNicMasked: 'SYN-NIC-*****3053',
      gnDivision: 'Minuwangoda North',
      facialVerification: {
        status: 'PASSED',
        evidenceReference: 'synthetic-selfie-reference-001',
        submittedAt: '2026-01-02T10:16:00Z',
        matchScore: 0.965,
        algorithm: 'SyntheticFaceMatch-v1.0',
      },
      documentVerification: {
        status: 'VERIFIED',
        documentType: 'SYNTHETIC_NATIONAL_IDENTITY_CARD',
        documentNumberMasked: 'SYN-NIC-*****3053',
        evidenceReference: 'synthetic-nic-reference-001',
        submittedAt: '2026-01-02T10:18:00Z',
      },
      officerReview: {
        status: 'APPROVED',
        officerId: 'OFFICER-PROTOTYPE-001',
        reviewedAt: '2026-01-02T10:30:00Z',
        notes: 'Prototype documentation and live facial check confirmed satisfactory by officer.',
      },
      finalStatus: 'VERIFIED',
      createdAt: '2026-01-02T10:15:00Z',
      updatedAt: '2026-01-02T10:30:00Z',
    };

    // Record 2: Starts with NOT_SUBMITTED (NO DID ISSUED YET)
    const syntheticRecord2: IdentityVerificationRecord = {
      verificationId: 'ver-prototype-002',
      userId: 'user-prototype-002',
      did: null,
      applicantName: 'Nimali Perera',
      applicantNicMasked: 'SYN-NIC-*****0124',
      gnDivision: 'Kandy Central',
      facialVerification: {
        status: 'NOT_SUBMITTED',
      },
      documentVerification: {
        status: 'NOT_SUBMITTED',
        documentType: 'SYNTHETIC_NATIONAL_IDENTITY_CARD',
        documentNumberMasked: 'SYN-NIC-*****0124',
      },
      officerReview: {
        status: 'PENDING',
      },
      finalStatus: 'PENDING',
      createdAt: '2026-01-03T08:00:00Z',
      updatedAt: '2026-01-03T08:00:00Z',
    };

    // Record 3: Pre-seeded evidence SUBMITTED, PENDING officer review (NO DID ISSUED YET)
    const syntheticRecord3: IdentityVerificationRecord = {
      verificationId: 'ver-prototype-003',
      userId: 'user-prototype-003',
      did: null,
      applicantName: 'Kasun Jayawardena',
      applicantNicMasked: 'SYN-NIC-*****0456',
      gnDivision: 'Matara South',
      facialVerification: {
        status: 'SUBMITTED',
        evidenceReference: 'synthetic-selfie-reference-003',
        submittedAt: '2026-01-04T09:00:00Z',
        matchScore: 0.958,
        algorithm: 'SyntheticFaceMatch-v1.0',
      },
      documentVerification: {
        status: 'SUBMITTED',
        documentType: 'SYNTHETIC_NATIONAL_IDENTITY_CARD',
        documentNumberMasked: 'SYN-NIC-*****0456',
        evidenceReference: 'synthetic-nic-reference-003',
        submittedAt: '2026-01-04T09:05:00Z',
      },
      officerReview: {
        status: 'PENDING',
      },
      finalStatus: 'PENDING',
      createdAt: '2026-01-04T08:50:00Z',
      updatedAt: '2026-01-04T09:05:00Z',
    };

    this.createVerificationRecord(syntheticRecord1);
    this.createVerificationRecord(syntheticRecord2);
    this.createVerificationRecord(syntheticRecord3);
  }

  public createVerificationRecord(record: IdentityVerificationRecord): IdentityVerificationRecord {
    this.records.set(record.verificationId, record);
    this.recordsByUserId.set(record.userId, record.verificationId);
    return record;
  }

  public getVerificationRecord(verificationId: string): IdentityVerificationRecord | null {
    return this.records.get(verificationId) || null;
  }

  public getVerificationRecordByUserId(userId: string): IdentityVerificationRecord | null {
    const verId = this.recordsByUserId.get(userId);
    if (!verId) return null;
    return this.records.get(verId) || null;
  }

  public submitFaceEvidence(
    verificationId: string,
    evidence: FacialVerificationEvidence
  ): IdentityVerificationRecord | null {
    const record = this.records.get(verificationId);
    if (!record) {
      return null;
    }

    record.facialVerification = evidence;
    // Final status strictly remains PENDING until an officer review decision is recorded
    record.finalStatus = 'PENDING';
    record.updatedAt = new Date().toISOString();

    this.records.set(verificationId, record);
    return record;
  }

  public submitDocumentEvidence(
    verificationId: string,
    evidence: DocumentVerificationEvidence
  ): IdentityVerificationRecord | null {
    const record = this.records.get(verificationId);
    if (!record) {
      return null;
    }

    record.documentVerification = evidence;
    // Final status strictly remains PENDING until an officer review decision is recorded
    record.finalStatus = 'PENDING';
    record.updatedAt = new Date().toISOString();

    this.records.set(verificationId, record);
    return record;
  }

  public getPendingKycCases(): IdentityVerificationRecord[] {
    const pendingCases: IdentityVerificationRecord[] = [];
    for (const record of this.records.values()) {
      if (
        record.facialVerification.status === 'SUBMITTED' &&
        record.documentVerification.status === 'SUBMITTED' &&
        record.officerReview.status === 'PENDING' &&
        record.finalStatus === 'PENDING'
      ) {
        pendingCases.push({ ...record });
      }
    }
    return pendingCases;
  }

  public getAllRecords(): IdentityVerificationRecord[] {
    return Array.from(this.records.values());
  }

  public recordOfficerDecision(
    verificationId: string,
    decision: OfficerDecisionType,
    officerId: string,
    remarks?: string,
    issuedDid?: string
  ): IdentityVerificationRecord | null {
    const record = this.records.get(verificationId);
    if (!record) {
      return null;
    }

    const now = new Date().toISOString();
    record.officerReview = {
      status: decision,
      officerId,
      reviewedAt: now,
      notes: remarks,
    };

    if (decision === 'APPROVED') {
      record.finalStatus = 'VERIFIED';
      record.did = issuedDid || null;
      record.facialVerification.status = 'PASSED';
      record.documentVerification.status = 'VERIFIED';
    } else {
      record.finalStatus = 'REJECTED';
      record.did = null;
    }

    record.updatedAt = now;
    this.records.set(verificationId, record);
    return record;
  }
}

export const mockVerificationProvider = new MockVerificationProvider();
