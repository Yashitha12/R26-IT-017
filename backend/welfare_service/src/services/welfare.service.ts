import { IWelfareProvider, mockWelfareProvider } from '../providers/welfare.provider';
import { IIdentityProvider, mockIdentityProvider } from '../providers/identity.provider';
import { IVerificationProvider, mockVerificationProvider } from '../providers/verification.provider';
import {
  WelfareApplication,
  CreateAswesumaApplicationRequest,
  ElderlyAssistanceApplication,
  CreateElderlyApplicationRequest,
  DisabilityAssistanceApplication,
  CreateDisabilityApplicationRequest,
} from '../types/welfare';

export type SubmitAswesumaResult =
  | {
      status: 'SUCCESS';
      data: WelfareApplication;
    }
  | {
      status: 'UNAUTHORIZED';
      error: string;
    }
  | {
      status: 'INVALID_INPUT';
      error: string;
    };

export type SubmitElderlyResult =
  | {
      status: 'SUCCESS';
      data: ElderlyAssistanceApplication;
    }
  | {
      status: 'UNAUTHORIZED';
      error: string;
    }
  | {
      status: 'INVALID_INPUT';
      error: string;
    };

export type SubmitDisabilityResult =
  | {
      status: 'SUCCESS';
      data: DisabilityAssistanceApplication;
    }
  | {
      status: 'UNAUTHORIZED';
      error: string;
    }
  | {
      status: 'INVALID_INPUT';
      error: string;
    };

export class WelfareService {
  private readonly welfareProvider: IWelfareProvider;
  private readonly identityProvider: IIdentityProvider;
  private readonly verificationProvider: IVerificationProvider;

  constructor(
    welfareProvider: IWelfareProvider = mockWelfareProvider,
    identityProvider: IIdentityProvider = mockIdentityProvider,
    verificationProvider: IVerificationProvider = mockVerificationProvider
  ) {
    this.welfareProvider = welfareProvider;
    this.identityProvider = identityProvider;
    this.verificationProvider = verificationProvider;
  }

  public getApplicationById(applicationId: string): WelfareApplication | null {
    return this.welfareProvider.getApplicationById(applicationId);
  }

  public getApplicationsByDid(did: string): WelfareApplication[] {
    return this.welfareProvider.getApplicationsByDid(did);
  }

  public submitAswesumaApplication(dto: CreateAswesumaApplicationRequest): SubmitAswesumaResult {
    // 1. Verify that the DID exists in the identity provider
    if (!dto.did) {
      return {
        status: 'INVALID_INPUT',
        error: 'Digital Identity (DID) is required to submit an Aswesuma application.',
      };
    }

    const digitalIdentity = this.identityProvider.getIdentityByDid(dto.did);
    if (!digitalIdentity) {
      return {
        status: 'UNAUTHORIZED',
        error: `Digital Identity record not found for DID: ${dto.did}. Identity must be officially issued before applying.`,
      };
    }

    // 2. Verify that the citizen holds a VERIFIED IdentityVerificationRecord
    const allVerifications = this.verificationProvider.getAllRecords();
    const verificationRecord = allVerifications.find(
      (v) => v.did === dto.did || (dto.userId && v.userId === dto.userId) || v.userId === digitalIdentity.userId
    );

    if (!verificationRecord || verificationRecord.finalStatus !== 'VERIFIED') {
      return {
        status: 'UNAUTHORIZED',
        error: 'Access restricted: You must have an officially VERIFIED Digital Identity and approved KYC to submit an Aswesuma application.',
      };
    }

    // 3. Validate essential required fields
    if (!dto.applicantInformation?.fullName || !dto.applicantInformation?.nic) {
      return {
        status: 'INVALID_INPUT',
        error: 'Applicant information (Full Name and NIC) is required.',
      };
    }

    if (!dto.banking?.bankName || !dto.banking?.accountNumberMasked) {
      return {
        status: 'INVALID_INPUT',
        error: 'Banking information is required for welfare disbursement.',
      };
    }

    // 4. Generate sequential application ID (e.g. ASW-2026-000001)
    const seq = this.welfareProvider.getNextApplicationSequence();
    const year = new Date().getFullYear();
    const applicationId = `ASW-${year}-${seq.toString().padStart(6, '0')}`;
    const now = new Date().toISOString();

    // 5. Mask account number if plain digits were passed
    const rawAcc = dto.banking.accountNumberMasked;
    const maskedAcc =
      rawAcc.length > 4 && !rawAcc.includes('*')
        ? `******${rawAcc.slice(-4)}`
        : rawAcc;

    const application: WelfareApplication = {
      applicationId,
      did: dto.did,
      userId: dto.userId || digitalIdentity.userId,
      programme: 'ASWESUMA',
      applicantInformation: { ...dto.applicantInformation },
      householdInformation: { ...dto.householdInformation },
      education: { ...dto.education },
      health: { ...dto.health },
      economic: { ...dto.economic },
      assets: { ...dto.assets },
      housing: { ...dto.housing },
      familyDemography: { ...dto.familyDemography },
      banking: {
        ...dto.banking,
        accountNumberMasked: maskedAcc,
      },
      status: 'SUBMITTED',
      createdAt: now,
      updatedAt: now,
      submittedAt: now,
    };

    const saved = this.welfareProvider.createApplication(application);
    return {
      status: 'SUCCESS',
      data: saved,
    };
  }

  // -------------------------------------------------------------
  // Phase W4: Elderly Assistance Service Methods
  // -------------------------------------------------------------

  public getElderlyApplicationById(applicationId: string): ElderlyAssistanceApplication | null {
    return this.welfareProvider.getElderlyApplicationById(applicationId);
  }

  public getElderlyApplicationsByDid(did: string): ElderlyAssistanceApplication[] {
    return this.welfareProvider.getElderlyApplicationsByDid(did);
  }

  public submitElderlyApplication(dto: CreateElderlyApplicationRequest): SubmitElderlyResult {
    // 1. Verify DID parameter
    if (!dto.did) {
      return {
        status: 'INVALID_INPUT',
        error: 'Digital Identity (DID) is required to submit an Elderly Assistance application.',
      };
    }

    const digitalIdentity = this.identityProvider.getIdentityByDid(dto.did);
    if (!digitalIdentity) {
      return {
        status: 'UNAUTHORIZED',
        error: `Digital Identity record not found for DID: ${dto.did}. Identity must be officially issued before applying.`,
      };
    }

    // 2. Verify that the citizen holds a VERIFIED IdentityVerificationRecord
    const allVerifications = this.verificationProvider.getAllRecords();
    const verificationRecord = allVerifications.find(
      (v) => v.did === dto.did || (dto.userId && v.userId === dto.userId) || v.userId === digitalIdentity.userId
    );

    if (!verificationRecord || verificationRecord.finalStatus !== 'VERIFIED') {
      return {
        status: 'UNAUTHORIZED',
        error: 'Access restricted: You must have an officially VERIFIED Digital Identity and approved KYC to submit an Elderly Assistance application.',
      };
    }

    // 3. Validate essential required fields
    if (!dto.applicant?.fullName || !dto.applicant?.nic) {
      return {
        status: 'INVALID_INPUT',
        error: 'Applicant information (Full Name and NIC) is required.',
      };
    }

    if (!dto.address?.address || !dto.address?.district) {
      return {
        status: 'INVALID_INPUT',
        error: 'Address and District details are required.',
      };
    }

    if (!dto.bank?.bankName || !dto.bank?.accountNumber) {
      return {
        status: 'INVALID_INPUT',
        error: 'Bank Name and Account Number are required for allowance disbursement.',
      };
    }

    // 4. Generate sequential application ID (e.g. ELD-2026-000001)
    const seq = this.welfareProvider.getNextElderlySequence();
    const year = new Date().getFullYear();
    const applicationId = `ELD-${year}-${seq.toString().padStart(6, '0')}`;
    const now = new Date().toISOString();

    // 5. Mask account number
    const rawAcc = dto.bank.accountNumber;
    const maskedAcc =
      rawAcc.length > 4 && !rawAcc.includes('*')
        ? `******${rawAcc.slice(-4)}`
        : rawAcc;

    const application: ElderlyAssistanceApplication = {
      applicationId,
      category: 'ELDERLY_ASSISTANCE',
      did: dto.did,
      userId: dto.userId || digitalIdentity.userId,
      applicant: { ...dto.applicant },
      address: { ...dto.address },
      household: { ...dto.household },
      bank: {
        ...dto.bank,
        accountNumber: maskedAcc,
      },
      documents: {
        nic: {
          status: dto.documents?.nic?.status || 'Submitted',
          ref: dto.documents?.nic?.ref || `DOC-NIC-${dto.applicant.nic}`,
          submittedAt: now,
        },
        birthCertificate: {
          status: dto.documents?.birthCertificate?.status || 'Submitted',
          ref: dto.documents?.birthCertificate?.ref || `DOC-BC-${dto.applicant.nic}`,
          submittedAt: now,
        },
        bankDetails: {
          status: dto.documents?.bankDetails?.status || 'Submitted',
          ref: dto.documents?.bankDetails?.ref || `DOC-BANK-${dto.bank.bankName.replace(/\s+/g, '')}`,
          submittedAt: now,
        },
      },
      status: 'PENDING_REVIEW',
      submittedAt: now,
      createdAt: now,
      updatedAt: now,
    };

    const saved = this.welfareProvider.createElderlyApplication(application);
    return {
      status: 'SUCCESS',
      data: saved,
    };
  }

  // -------------------------------------------------------------
  // Phase W5: Disability Assistance Service Methods
  // -------------------------------------------------------------

  public getDisabilityApplicationById(applicationId: string): DisabilityAssistanceApplication | null {
    return this.welfareProvider.getDisabilityApplicationById(applicationId);
  }

  public getDisabilityApplicationsByDid(did: string): DisabilityAssistanceApplication[] {
    return this.welfareProvider.getDisabilityApplicationsByDid(did);
  }

  public submitDisabilityApplication(dto: CreateDisabilityApplicationRequest): SubmitDisabilityResult {
    // 1. Verify DID parameter
    if (!dto.did) {
      return {
        status: 'INVALID_INPUT',
        error: 'Digital Identity (DID) is required to submit a Disability Assistance application.',
      };
    }

    const digitalIdentity = this.identityProvider.getIdentityByDid(dto.did);
    if (!digitalIdentity) {
      return {
        status: 'UNAUTHORIZED',
        error: `Digital Identity record not found for DID: ${dto.did}. Identity must be officially issued before applying.`,
      };
    }

    // 2. Verify that the citizen holds a VERIFIED IdentityVerificationRecord
    const allVerifications = this.verificationProvider.getAllRecords();
    const verificationRecord = allVerifications.find(
      (v) => v.did === dto.did || (dto.userId && v.userId === dto.userId) || v.userId === digitalIdentity.userId
    );

    if (!verificationRecord || verificationRecord.finalStatus !== 'VERIFIED') {
      return {
        status: 'UNAUTHORIZED',
        error: 'Access restricted: You must have an officially VERIFIED Digital Identity and approved KYC to submit a Disability Assistance application.',
      };
    }

    // 3. Validate essential required fields
    if (!dto.applicant?.fullName || !dto.applicant?.nic) {
      return {
        status: 'INVALID_INPUT',
        error: 'Applicant information (Full Name and NIC) is required.',
      };
    }

    if (!dto.address?.address || !dto.address?.district) {
      return {
        status: 'INVALID_INPUT',
        error: 'Address and District details are required.',
      };
    }

    if (!dto.bank?.bankName || !dto.bank?.accountNumber) {
      return {
        status: 'INVALID_INPUT',
        error: 'Bank Name and Account Number are required for allowance disbursement.',
      };
    }

    // 4. Generate sequential application ID (e.g. DIS-2026-000001)
    const seq = this.welfareProvider.getNextDisabilitySequence();
    const year = new Date().getFullYear();
    const applicationId = `DIS-${year}-${seq.toString().padStart(6, '0')}`;
    const now = new Date().toISOString();

    // 5. Mask account number
    const rawAcc = dto.bank.accountNumber;
    const maskedAcc =
      rawAcc.length > 4 && !rawAcc.includes('*')
        ? `******${rawAcc.slice(-4)}`
        : rawAcc;

    const application: DisabilityAssistanceApplication = {
      applicationId,
      category: 'DISABILITY_ASSISTANCE',
      did: dto.did,
      userId: dto.userId || digitalIdentity.userId,
      applicant: { ...dto.applicant },
      address: { ...dto.address },
      household: { ...dto.household },
      bank: {
        ...dto.bank,
        accountNumber: maskedAcc,
      },
      documents: {
        nic: {
          status: dto.documents?.nic?.status || 'Submitted',
          ref: dto.documents?.nic?.ref || `DOC-NIC-${dto.applicant.nic}`,
          submittedAt: now,
        },
        medicalCertificate: {
          status: dto.documents?.medicalCertificate?.status || 'Submitted',
          ref: dto.documents?.medicalCertificate?.ref || `DOC-MED-${dto.applicant.nic}`,
          submittedAt: now,
        },
        bankDetails: {
          status: dto.documents?.bankDetails?.status || 'Submitted',
          ref: dto.documents?.bankDetails?.ref || `DOC-BANK-${dto.bank.bankName.replace(/\s+/g, '')}`,
          submittedAt: now,
        },
      },
      status: 'PENDING_REVIEW',
      submittedAt: now,
      createdAt: now,
      updatedAt: now,
    };

    const saved = this.welfareProvider.createDisabilityApplication(application);
    return {
      status: 'SUCCESS',
      data: saved,
    };
  }
}

export const welfareService = new WelfareService();
