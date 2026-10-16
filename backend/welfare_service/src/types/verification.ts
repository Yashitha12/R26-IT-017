export type VerificationStatus =
  | 'NOT_SUBMITTED'
  | 'SUBMITTED'
  | 'PENDING'
  | 'PASSED'
  | 'FAILED'
  | 'VERIFIED'
  | 'REJECTED'
  | 'APPROVED';

export interface FacialVerificationEvidence {
  status: 'NOT_SUBMITTED' | 'SUBMITTED' | 'PASSED' | 'FAILED' | 'PENDING';
  evidenceReference?: string;
  submittedAt?: string;
  matchScore?: number;
  algorithm?: string;
}

export interface DocumentVerificationEvidence {
  status: 'NOT_SUBMITTED' | 'SUBMITTED' | 'VERIFIED' | 'FAILED' | 'PENDING';
  documentType: string;
  documentNumberMasked?: string;
  evidenceReference?: string;
  submittedAt?: string;
}

export interface OfficerReviewEvidence {
  status: 'APPROVED' | 'REJECTED' | 'PENDING';
  officerId?: string;
  reviewedAt?: string;
  notes?: string;
}

export type IdentityVerificationOverallStatus = 'VERIFIED' | 'REJECTED' | 'PENDING' | 'UNDER_REVIEW';

export interface IdentityVerificationRecord {
  verificationId: string;
  userId: string;
  did?: string | null;
  applicantName?: string;
  applicantNicMasked?: string;
  gnDivision?: string;
  facialVerification: FacialVerificationEvidence;
  documentVerification: DocumentVerificationEvidence;
  officerReview: OfficerReviewEvidence;
  finalStatus: IdentityVerificationOverallStatus;
  createdAt: string;
  updatedAt: string;
}

export interface SubmitFaceEvidenceRequest {
  evidenceReference: string;
  matchScore?: number;
  algorithm?: string;
}

export interface SubmitDocumentEvidenceRequest {
  evidenceReference: string;
  documentType: string;
  documentNumberMasked?: string;
}

export type OfficerDecisionType = 'APPROVED' | 'REJECTED';

export interface OfficerDecisionRequest {
  decision: OfficerDecisionType;
  officerId: string;
  remarks?: string;
}

export interface VerificationResponse {
  success: boolean;
  data?: IdentityVerificationRecord;
  error?: string;
}

export interface PendingKycCasesResponse {
  success: boolean;
  count: number;
  data: IdentityVerificationRecord[];
  error?: string;
}

export interface CitizenVerificationStatusData {
  verificationId: string;
  userId?: string;
  did?: string | null;
  applicantName?: string;
  facialVerificationStatus: string;
  documentVerificationStatus: string;
  officerReviewStatus: string;
  finalStatus: IdentityVerificationOverallStatus;
  reviewedAt?: string;
  remarks?: string;
  updatedAt: string;
}

export interface CitizenVerificationStatusResponse {
  success: boolean;
  data?: CitizenVerificationStatusData;
  error?: string;
}
