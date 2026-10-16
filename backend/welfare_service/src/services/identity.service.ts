import { IIdentityProvider, mockIdentityProvider } from '../providers/identity.provider';
import { IVerificationProvider, mockVerificationProvider } from '../providers/verification.provider';
import { RegistrationService, registrationService } from './registration.service';
import {
  DigitalIdentity,
  IdentityApplication,
  CreateIdentityRequest,
} from '../types/identity';
import { IdentityVerificationRecord } from '../types/verification';

export type ApplyIdentityResult =
  | {
      status: 'SUCCESS';
      data: {
        applicationId: string;
        verificationId: string;
        userId: string;
        status: string;
        message: string;
      };
    }
  | { status: 'NOT_FOUND'; error: string }
  | { status: 'ALREADY_EXISTS'; error: string };

export class IdentityService {
  private readonly identityProvider: IIdentityProvider;
  private readonly verificationProvider: IVerificationProvider;
  private readonly registrationService: RegistrationService;

  constructor(
    identityProvider: IIdentityProvider = mockIdentityProvider,
    verificationProvider: IVerificationProvider = mockVerificationProvider,
    regService: RegistrationService = registrationService
  ) {
    this.identityProvider = identityProvider;
    this.verificationProvider = verificationProvider;
    this.registrationService = regService;
  }

  public getIdentityByDid(did: string): DigitalIdentity | null {
    return this.identityProvider.getIdentityByDid(did);
  }

  public getIdentityByUserId(userId: string): DigitalIdentity | null {
    return this.identityProvider.getIdentityByUserId(userId);
  }

  public getApplicationByUserId(userId: string): IdentityApplication | null {
    return this.identityProvider.getApplicationByUserId(userId);
  }

  public getApplicationByVerificationId(verificationId: string): IdentityApplication | null {
    return this.identityProvider.getApplicationByVerificationId(verificationId);
  }

  /**
   * Citizen starts Digital Identity creation.
   * This creates an Identity Application / Pending Identity Request.
   * NO DID IS ISSUED AT THIS STAGE.
   */
  public applyForIdentity(dto: CreateIdentityRequest): ApplyIdentityResult {
    // 1. Retrieve user registration data
    const registrationUser = this.registrationService.getRegistrationByUserId(dto.userId);
    if (!registrationUser) {
      return {
        status: 'NOT_FOUND',
        error: `Registration data not found for User ID: ${dto.userId}`,
      };
    }

    // 2. Prevent re-applying if an active Digital Identity is already issued
    const existingIdentity = this.identityProvider.getIdentityByUserId(dto.userId);
    if (existingIdentity) {
      return {
        status: 'ALREADY_EXISTS',
        error: `Digital Identity is already active for User ID ${dto.userId} with DID: ${existingIdentity.did}`,
      };
    }

    const suffix = dto.userId.replace(/^user-prototype-/, '').replace(/^user-custom-/, '').padStart(3, '0');
    const applicationId = `app-prototype-${suffix}`;
    const verificationId = `ver-prototype-${suffix}`;
    const now = new Date().toISOString();

    const maskedNic = registrationUser.nic
      ? `SYN-NIC-*****${registrationUser.nic.slice(-4)}`
      : 'SYN-NIC-*****0000';

    // 3. Save pending application record
    const application: IdentityApplication = {
      applicationId,
      verificationId,
      userId: registrationUser.userId,
      name: registrationUser.name,
      nic: registrationUser.nic,
      dateOfBirth: registrationUser.dateOfBirth,
      address: registrationUser.address,
      city: registrationUser.city,
      district: registrationUser.district,
      gnDivision: dto.gnDivision || registrationUser.gnDivision,
      email: registrationUser.email,
      phone: registrationUser.phone,
      status: 'PENDING',
      additionalAttributes: dto.additionalAttributes,
      createdAt: now,
      updatedAt: now,
    };
    this.identityProvider.saveApplication(application);

    // 4. Ensure verification record exists in PENDING state (NO DID ASSIGNED)
    let verificationRecord = this.verificationProvider.getVerificationRecord(verificationId);
    if (!verificationRecord) {
      const initialRecord: IdentityVerificationRecord = {
        verificationId,
        userId: registrationUser.userId,
        did: null,
        applicantName: registrationUser.name,
        applicantNicMasked: maskedNic,
        gnDivision: dto.gnDivision || registrationUser.gnDivision,
        facialVerification: {
          status: 'NOT_SUBMITTED',
        },
        documentVerification: {
          status: 'NOT_SUBMITTED',
          documentType: 'SYNTHETIC_NATIONAL_IDENTITY_CARD',
          documentNumberMasked: maskedNic,
        },
        officerReview: {
          status: 'PENDING',
        },
        finalStatus: 'PENDING',
        createdAt: now,
        updatedAt: now,
      };
      verificationRecord = this.verificationProvider.createVerificationRecord(initialRecord);
    } else {
      // Update metadata in existing verification record
      verificationRecord.applicantName = registrationUser.name;
      verificationRecord.applicantNicMasked = maskedNic;
      verificationRecord.gnDivision = dto.gnDivision || registrationUser.gnDivision;
    }

    return {
      status: 'SUCCESS',
      data: {
        applicationId,
        verificationId,
        userId: dto.userId,
        status: 'PENDING',
        message:
          'Digital Identity Application submitted successfully. Please complete biometric selfie and NIC document submission for officer review.',
      },
    };
  }

  /**
   * Authorized Officer Decision Point:
   * Called strictly upon Officer APPROVED decision to issue the actual Digital Identity (DID).
   * Bundles verified face ID photo, verified NIC photo, and user registration details.
   */
  public issueIdentityOnApproval(
    verificationId: string,
    officerId: string
  ): DigitalIdentity | null {
    // 1. Retrieve application
    let application = this.identityProvider.getApplicationByVerificationId(verificationId);
    
    // Fallback: Check verification record
    const verRecord = this.verificationProvider.getVerificationRecord(verificationId);
    if (!verRecord) {
      return null;
    }

    const userId = verRecord.userId;
    const registrationUser = this.registrationService.getRegistrationByUserId(userId);
    if (!registrationUser) {
      return null;
    }

    const suffix = userId.replace(/^user-prototype-/, '').replace(/^user-custom-/, '').padStart(3, '0');
    const did = `did:smartgrama:prototype:${suffix}`;
    const now = new Date().toISOString();

    const facePhotoData = verRecord.facialVerification.evidenceReference;
    const nicPhotoData = verRecord.documentVerification.evidenceReference;

    const newIdentity: DigitalIdentity = {
      did,
      userId,
      name: registrationUser.name,
      nic: registrationUser.nic,
      dateOfBirth: registrationUser.dateOfBirth,
      address: registrationUser.address,
      city: registrationUser.city,
      district: registrationUser.district,
      gnDivision: application?.gnDivision || registrationUser.gnDivision,
      email: registrationUser.email,
      phone: registrationUser.phone,
      network: 'SmartGrama Prototype Testnet',
      status: 'ACTIVE',
      facePhotoData,
      nicPhotoData,
      issuingOfficerId: officerId,
      additionalAttributes: application?.additionalAttributes,
      issuedAt: now,
      createdAt: application?.createdAt || now,
      credentials: [
        {
          id: `vc:citizenship:${suffix}`,
          type: 'VerifiableCitizenshipCredential',
          issuer: 'did:smartgrama:authority:testnet',
          issuanceDate: now,
          claims: {
            citizenshipStatus: 'verified',
            nationalId: registrationUser.nic,
            adjudicatingOfficer: officerId,
            verificationId,
          },
        },
        {
          id: `vc:residency:${suffix}`,
          type: 'VerifiableResidencyCredential',
          issuer: 'did:smartgrama:authority:testnet',
          issuanceDate: now,
          claims: {
            gnDivision: application?.gnDivision || registrationUser.gnDivision,
            district: registrationUser.district || 'Gampaha',
            address: registrationUser.address,
          },
        },
        {
          id: `vc:biometrics:${suffix}`,
          type: 'VerifiableBiometricCredential',
          issuer: 'did:smartgrama:authority:testnet',
          issuanceDate: now,
          claims: {
            biometricStatus: 'FaceID_Approved',
            documentStatus: 'NIC_Verified',
            algorithm: verRecord.facialVerification.algorithm || 'LiveWebcamCapture-v1.0',
            matchScore: verRecord.facialVerification.matchScore || 0.982,
          },
        },
      ],
    };

    // Save issued identity
    this.identityProvider.createIdentity(newIdentity);

    // Update application status
    if (application) {
      application.status = 'APPROVED';
      application.did = did;
      application.facePhotoData = facePhotoData;
      application.nicPhotoData = nicPhotoData;
      application.updatedAt = now;
      this.identityProvider.saveApplication(application);
    }

    return newIdentity;
  }
}

export const identityService = new IdentityService();
