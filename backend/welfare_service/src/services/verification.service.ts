import { IVerificationProvider, mockVerificationProvider } from '../providers/verification.provider';
import { IdentityService, identityService } from './identity.service';
import {
  IdentityVerificationRecord,
  SubmitFaceEvidenceRequest,
  SubmitDocumentEvidenceRequest,
  OfficerDecisionRequest,
  FacialVerificationEvidence,
  DocumentVerificationEvidence,
  CitizenVerificationStatusData,
} from '../types/verification';

export type SubmitEvidenceResult =
  | { status: 'SUCCESS'; data: IdentityVerificationRecord }
  | { status: 'NOT_FOUND'; error: string };

export type GetReviewCaseResult =
  | { status: 'SUCCESS'; data: IdentityVerificationRecord }
  | { status: 'NOT_FOUND'; error: string }
  | { status: 'NOT_READY'; error: string };

export type RecordOfficerDecisionResult =
  | { status: 'SUCCESS'; data: IdentityVerificationRecord }
  | { status: 'NOT_FOUND'; error: string }
  | { status: 'NOT_READY'; error: string }
  | { status: 'INVALID_INPUT'; error: string };

export type GetCitizenVerificationStatusResult =
  | { status: 'SUCCESS'; data: CitizenVerificationStatusData }
  | { status: 'NOT_FOUND'; error: string };

export class VerificationService {
  private readonly provider: IVerificationProvider;
  private readonly idService: IdentityService;

  constructor(
    provider: IVerificationProvider = mockVerificationProvider,
    idService: IdentityService = identityService
  ) {
    this.provider = provider;
    this.idService = idService;
  }

  public getVerificationById(verificationId: string): IdentityVerificationRecord | null {
    return this.provider.getVerificationRecord(verificationId);
  }

  public getVerificationByUserId(userId: string): IdentityVerificationRecord | null {
    return this.provider.getVerificationRecordByUserId(userId);
  }

  public submitFaceEvidence(
    verificationId: string,
    dto: SubmitFaceEvidenceRequest
  ): SubmitEvidenceResult {
    const existingRecord = this.provider.getVerificationRecord(verificationId);

    if (!existingRecord) {
      return {
        status: 'NOT_FOUND',
        error: `Verification record not found for ID: ${verificationId}`,
      };
    }

    const faceEvidence: FacialVerificationEvidence = {
      status: 'SUBMITTED',
      evidenceReference: dto.evidenceReference,
      submittedAt: new Date().toISOString(),
      matchScore: dto.matchScore,
      algorithm: dto.algorithm,
    };

    const updated = this.provider.submitFaceEvidence(verificationId, faceEvidence);

    if (!updated) {
      return {
        status: 'NOT_FOUND',
        error: `Verification record not found for ID: ${verificationId}`,
      };
    }

    return {
      status: 'SUCCESS',
      data: updated,
    };
  }

  public submitDocumentEvidence(
    verificationId: string,
    dto: SubmitDocumentEvidenceRequest
  ): SubmitEvidenceResult {
    const existingRecord = this.provider.getVerificationRecord(verificationId);

    if (!existingRecord) {
      return {
        status: 'NOT_FOUND',
        error: `Verification record not found for ID: ${verificationId}`,
      };
    }

    const documentEvidence: DocumentVerificationEvidence = {
      status: 'SUBMITTED',
      documentType: dto.documentType,
      documentNumberMasked: dto.documentNumberMasked || 'SYN-NIC-*****0000',
      evidenceReference: dto.evidenceReference,
      submittedAt: new Date().toISOString(),
    };

    const updated = this.provider.submitDocumentEvidence(verificationId, documentEvidence);

    if (!updated) {
      return {
        status: 'NOT_FOUND',
        error: `Verification record not found for ID: ${verificationId}`,
      };
    }

    return {
      status: 'SUCCESS',
      data: updated,
    };
  }

  public getPendingKycCases(): IdentityVerificationRecord[] {
    return this.provider.getPendingKycCases();
  }

  public getReviewCaseById(verificationId: string): GetReviewCaseResult {
    const record = this.provider.getVerificationRecord(verificationId);

    if (!record) {
      return {
        status: 'NOT_FOUND',
        error: `Verification record not found for ID: ${verificationId}`,
      };
    }

    const isReadyForReview =
      record.facialVerification.status === 'SUBMITTED' &&
      record.documentVerification.status === 'SUBMITTED' &&
      record.officerReview.status === 'PENDING' &&
      record.finalStatus === 'PENDING';

    if (!isReadyForReview) {
      return {
        status: 'NOT_READY',
        error: `Verification case ${verificationId} is not ready for officer review (requires both selfie and NIC document evidence submitted with pending review)`,
      };
    }

    return {
      status: 'SUCCESS',
      data: record,
    };
  }

  /**
   * Human-in-the-loop Officer Adjudication Decision:
   * ONLY issues a DID if the decision is APPROVED.
   * If REJECTED, no DID is minted.
   */
  public recordOfficerDecision(
    verificationId: string,
    dto: OfficerDecisionRequest
  ): RecordOfficerDecisionResult {
    const record = this.provider.getVerificationRecord(verificationId);

    if (!record) {
      return {
        status: 'NOT_FOUND',
        error: `Verification record not found for ID: ${verificationId}`,
      };
    }

    // Strict human-in-the-loop check: Both pieces of evidence must be SUBMITTED, and review must be PENDING
    const isReadyForDecision =
      record.facialVerification.status === 'SUBMITTED' &&
      record.documentVerification.status === 'SUBMITTED' &&
      record.officerReview.status === 'PENDING' &&
      record.finalStatus === 'PENDING';

    if (!isReadyForDecision) {
      return {
        status: 'NOT_READY',
        error: `Verification case ${verificationId} is not eligible for officer decision (either evidence is incomplete or case has already been decided)`,
      };
    }

    if (dto.decision !== 'APPROVED' && dto.decision !== 'REJECTED') {
      return {
        status: 'INVALID_INPUT',
        error: 'Decision must be either "APPROVED" or "REJECTED"',
      };
    }

    let issuedDid: string | undefined = undefined;

    // BUSINESS RULE: A Digital Identity (DID) must ONLY be issued after an authorized officer APPROVES
    if (dto.decision === 'APPROVED') {
      const issuedIdentity = this.idService.issueIdentityOnApproval(
        verificationId,
        dto.officerId
      );
      if (issuedIdentity) {
        issuedDid = issuedIdentity.did;
      }
    }

    const updated = this.provider.recordOfficerDecision(
      verificationId,
      dto.decision,
      dto.officerId,
      dto.remarks,
      issuedDid
    );

    if (!updated) {
      return {
        status: 'NOT_FOUND',
        error: `Verification record not found for ID: ${verificationId}`,
      };
    }

    return {
      status: 'SUCCESS',
      data: updated,
    };
  }

  public getCitizenVerificationStatus(
    verificationId: string
  ): GetCitizenVerificationStatusResult {
    const record = this.provider.getVerificationRecord(verificationId);

    if (!record) {
      return {
        status: 'NOT_FOUND',
        error: `Verification record not found for ID: ${verificationId}`,
      };
    }

    const statusData: CitizenVerificationStatusData = {
      verificationId: record.verificationId,
      userId: record.userId,
      did: record.did || null,
      applicantName: record.applicantName,
      facialVerificationStatus: record.facialVerification.status,
      documentVerificationStatus: record.documentVerification.status,
      officerReviewStatus: record.officerReview.status,
      finalStatus: record.finalStatus,
      reviewedAt: record.officerReview.reviewedAt,
      remarks: record.officerReview.notes,
      updatedAt: record.updatedAt,
    };

    return {
      status: 'SUCCESS',
      data: statusData,
    };
  }
}

export const verificationService = new VerificationService();
