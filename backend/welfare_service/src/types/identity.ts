export interface Credential {
  id: string;
  type: string;
  issuer: string;
  issuanceDate: string;
  claims: Record<string, unknown>;
}

export interface DigitalIdentity {
  did: string;
  userId: string;
  name: string;
  nic: string;
  dateOfBirth?: string;
  address: string;
  city?: string;
  district?: string;
  gnDivision: string;
  email: string;
  phone: string;
  network: string;
  status: 'ACTIVE' | 'REVOKED';
  facePhotoData?: string;
  nicPhotoData?: string;
  issuingOfficerId?: string;
  additionalAttributes?: Record<string, unknown>;
  credentials: Credential[];
  issuedAt: string;
  createdAt: string;
}

export interface IdentityApplication {
  applicationId: string;
  verificationId: string;
  userId: string;
  name: string;
  nic: string;
  dateOfBirth?: string;
  address: string;
  city?: string;
  district?: string;
  gnDivision: string;
  email: string;
  phone: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  did?: string;
  facePhotoData?: string;
  nicPhotoData?: string;
  additionalAttributes?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface CreateIdentityRequest {
  userId: string;
  gnDivision?: string;
  additionalAttributes?: Record<string, unknown>;
}

export interface ApplyIdentityResponse {
  success: boolean;
  message?: string;
  data?: {
    applicationId: string;
    verificationId: string;
    userId: string;
    status: string;
    message: string;
  };
  error?: string;
}

export interface IdentityResponse {
  success: boolean;
  data?: DigitalIdentity;
  error?: string;
}
