import {
  IOfficerAuthProvider,
  mockOfficerAuthProvider,
} from '../providers/officer-auth.provider';
import { OfficerLoginRequest, OfficerAuthData } from '../types/officer';

export type OfficerLoginResult =
  | { status: 'SUCCESS'; data: OfficerAuthData }
  | { status: 'INVALID_CREDENTIALS'; error: string };

export class OfficerAuthService {
  private readonly provider: IOfficerAuthProvider;

  constructor(provider: IOfficerAuthProvider = mockOfficerAuthProvider) {
    this.provider = provider;
  }

  public login(dto: OfficerLoginRequest): OfficerLoginResult {
    const result = this.provider.authenticate(dto.officerId, dto.password);
    if (!result) {
      return {
        status: 'INVALID_CREDENTIALS',
        error: 'Invalid officer credentials',
      };
    }

    return {
      status: 'SUCCESS',
      data: result,
    };
  }
}

export const officerAuthService = new OfficerAuthService();
