import { Officer } from '../types/officer';

interface OfficerAccount {
  officer: Officer;
  passwordPlain: string;
}

export interface IOfficerAuthProvider {
  authenticate(officerId: string, password: string): { officer: Officer; token: string } | null;
  getOfficerById(officerId: string): Officer | null;
}

export class MockOfficerAuthProvider implements IOfficerAuthProvider {
  private readonly accounts: Map<string, OfficerAccount> = new Map();

  constructor() {
    this.seedMockOfficers();
  }

  private seedMockOfficers(): void {
    const officer1: OfficerAccount = {
      officer: {
        officerId: 'OFFICER-PROTOTYPE-ALPHA',
        name: 'Officer Alpha',
        role: 'KYC_VERIFICATION_OFFICER',
        status: 'ACTIVE',
      },
      passwordPlain: 'prototype-officer-pass',
    };

    this.accounts.set(officer1.officer.officerId, officer1);
  }

  public authenticate(
    officerId: string,
    password: string
  ): { officer: Officer; token: string } | null {
    const account = this.accounts.get(officerId);
    if (!account) return null;
    if (account.passwordPlain !== password) return null;
    if (account.officer.status !== 'ACTIVE') return null;

    const mockToken = `mock-officer-session-${officerId.toLowerCase()}-${Date.now()}`;
    return {
      officer: account.officer,
      token: mockToken,
    };
  }

  public getOfficerById(officerId: string): Officer | null {
    const account = this.accounts.get(officerId);
    return account ? account.officer : null;
  }
}

export const mockOfficerAuthProvider = new MockOfficerAuthProvider();
