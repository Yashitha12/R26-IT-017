import { DigitalIdentity, IdentityApplication } from '../types/identity';

export interface IIdentityProvider {
  createIdentity(identity: DigitalIdentity): DigitalIdentity;
  getIdentityByDid(did: string): DigitalIdentity | null;
  getIdentityByUserId(userId: string): DigitalIdentity | null;
  saveApplication(application: IdentityApplication): IdentityApplication;
  getApplicationByUserId(userId: string): IdentityApplication | null;
  getApplicationByVerificationId(verificationId: string): IdentityApplication | null;
}

export class MockIdentityProvider implements IIdentityProvider {
  private readonly identitiesByDid: Map<string, DigitalIdentity> = new Map();
  private readonly didByUserId: Map<string, string> = new Map();
  private readonly applicationsByUserId: Map<string, IdentityApplication> = new Map();
  private readonly applicationsByVerificationId: Map<string, IdentityApplication> = new Map();

  constructor() {
    this.seedMockIdentities();
  }

  private seedMockIdentities(): void {
    // 1. Synthetic Approved Identity (Pre-seeded as already approved by officer)
    const approvedIdentity1: DigitalIdentity = {
      did: 'did:smartgrama:prototype:001',
      userId: 'user-prototype-001',
      name: 'Aravinda Kumara',
      nic: '200223003053',
      address: '45/A, Jayawickrama Road',
      gnDivision: 'Minuwangoda North',
      email: 'samankumara@gmail.com',
      phone: '+94 78 145 3248',
      network: 'SmartGrama Prototype Testnet',
      status: 'ACTIVE',
      issuingOfficerId: 'OFFICER-PROTOTYPE-001',
      issuedAt: '2026-01-02T10:30:00Z',
      createdAt: '2026-01-02T10:15:00Z',
      credentials: [
        {
          id: 'vc:prototype:citizenship:001',
          type: 'VerifiableCitizenshipCredential',
          issuer: 'did:smartgrama:authority:testnet',
          issuanceDate: '2026-01-02T10:30:00Z',
          claims: {
            citizenshipStatus: 'prototype-verified',
            region: 'Gampaha',
          },
        },
        {
          id: 'vc:prototype:residency:001',
          type: 'VerifiableResidencyCredential',
          issuer: 'did:smartgrama:authority:testnet',
          issuanceDate: '2026-01-02T10:30:00Z',
          claims: {
            gnDivisionCode: 'Minuwangoda North',
            district: 'Gampaha',
          },
        },
      ],
    };

    this.createIdentity(approvedIdentity1);

    // Seed Applications for prototype users
    const app1: IdentityApplication = {
      applicationId: 'app-prototype-001',
      verificationId: 'ver-prototype-001',
      userId: 'user-prototype-001',
      name: 'Aravinda Kumara',
      nic: '200223003053',
      address: '45/A, Jayawickrama Road',
      gnDivision: 'Minuwangoda North',
      email: 'samankumara@gmail.com',
      phone: '+94 78 145 3248',
      status: 'APPROVED',
      did: 'did:smartgrama:prototype:001',
      createdAt: '2026-01-02T10:15:00Z',
      updatedAt: '2026-01-02T10:30:00Z',
    };

    const app2: IdentityApplication = {
      applicationId: 'app-prototype-002',
      verificationId: 'ver-prototype-002',
      userId: 'user-prototype-002',
      name: 'Nimali Perera',
      nic: '199854200124',
      address: '12, Temple Road',
      gnDivision: 'Kandy Central',
      email: 'nimali.perera@example.test',
      phone: '+94 77 234 5678',
      status: 'PENDING',
      createdAt: '2026-01-03T08:00:00Z',
      updatedAt: '2026-01-03T08:00:00Z',
    };

    const app3: IdentityApplication = {
      applicationId: 'app-prototype-003',
      verificationId: 'ver-prototype-003',
      userId: 'user-prototype-003',
      name: 'Kasun Jayawardena',
      nic: '199212300456',
      address: '78, Beach Road',
      gnDivision: 'Matara South',
      email: 'kasun.j@example.test',
      phone: '+94 71 345 6789',
      status: 'PENDING',
      createdAt: '2026-01-04T08:50:00Z',
      updatedAt: '2026-01-04T09:05:00Z',
    };

    this.saveApplication(app1);
    this.saveApplication(app2);
    this.saveApplication(app3);
  }

  public createIdentity(identity: DigitalIdentity): DigitalIdentity {
    this.identitiesByDid.set(identity.did, identity);
    this.didByUserId.set(identity.userId, identity.did);
    return identity;
  }

  public getIdentityByDid(did: string): DigitalIdentity | null {
    return this.identitiesByDid.get(did) || null;
  }

  public getIdentityByUserId(userId: string): DigitalIdentity | null {
    const did = this.didByUserId.get(userId);
    if (!did) return null;
    return this.identitiesByDid.get(did) || null;
  }

  public saveApplication(application: IdentityApplication): IdentityApplication {
    this.applicationsByUserId.set(application.userId, application);
    this.applicationsByVerificationId.set(application.verificationId, application);
    return application;
  }

  public getApplicationByUserId(userId: string): IdentityApplication | null {
    return this.applicationsByUserId.get(userId) || null;
  }

  public getApplicationByVerificationId(verificationId: string): IdentityApplication | null {
    return this.applicationsByVerificationId.get(verificationId) || null;
  }
}

export const mockIdentityProvider = new MockIdentityProvider();
