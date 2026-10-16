import { RegistrationUser } from '../types/registration';

export interface IRegistrationProvider {
  getRegistrationByUserId(userId: string): RegistrationUser | null;
  createRegistration(user: RegistrationUser): RegistrationUser;
}

export class MockRegistrationProvider implements IRegistrationProvider {
  private readonly registrations: Map<string, RegistrationUser> = new Map();

  constructor() {
    this.seedMockRegistrations();
  }

  private seedMockRegistrations(): void {
    // Primary prototype citizen matching Figma design exactly
    const aravinda: RegistrationUser = {
      userId: 'user-prototype-001',
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
      registeredAt: '2026-01-01T08:00:00Z',
    };

    const user2: RegistrationUser = {
      userId: 'user-prototype-002',
      name: 'Nimali Perera',
      nic: '199854200124',
      dateOfBirth: '15/05/1998',
      phone: '+94 71 234 5678',
      email: 'nimali.perera@example.test',
      address: '12/B, Temple Road',
      city: 'Kandy',
      district: 'Kandy',
      gnDivision: 'Kandy Central',
      familySize: 3,
      noOfDependents: 1,
      monthlyIncome: 42000,
      monthlyExpenses: 38000,
      employmentType: 'Tea Factory Worker',
      bankName: 'Bank of Ceylon',
      accountNumber: '007891234567',
      branch: 'Kandy Main',
      registeredAt: '2026-01-01T09:00:00Z',
    };

    const user3: RegistrationUser = {
      userId: 'user-prototype-003',
      name: 'Kasun Jayawardena',
      nic: '199212300456',
      dateOfBirth: '20/08/1992',
      phone: '+94 77 987 6543',
      email: 'kasun.j@example.test',
      address: '88, Galle Road',
      city: 'Matara',
      district: 'Matara',
      gnDivision: 'Matara Fort',
      familySize: 5,
      noOfDependents: 3,
      monthlyIncome: 28000,
      monthlyExpenses: 26000,
      employmentType: 'Fisherman',
      bankName: 'People\'s Bank',
      accountNumber: '012345678901',
      branch: 'Matara',
      registeredAt: '2026-01-01T10:00:00Z',
    };

    const user4: RegistrationUser = {
      userId: 'user-prototype-004',
      name: 'Chamari Silva',
      nic: '200165400987',
      dateOfBirth: '05/11/2001',
      phone: '+94 76 543 2109',
      email: 'chamari.silva@example.test',
      address: '24/1, Kurunegala Road',
      city: 'Kurunegala',
      district: 'Kurunegala',
      gnDivision: 'Kurunegala Town',
      familySize: 4,
      noOfDependents: 2,
      monthlyIncome: 32000,
      monthlyExpenses: 29000,
      employmentType: 'Handicraft Artisan',
      bankName: 'Commercial Bank',
      accountNumber: '009876543210',
      branch: 'Kurunegala',
      registeredAt: '2026-01-01T11:00:00Z',
    };

    this.registrations.set(aravinda.userId, aravinda);
    this.registrations.set(user2.userId, user2);
    this.registrations.set(user3.userId, user3);
    this.registrations.set(user4.userId, user4);
  }

  public getRegistrationByUserId(userId: string): RegistrationUser | null {
    const record = this.registrations.get(userId);
    return record || null;
  }

  public createRegistration(user: RegistrationUser): RegistrationUser {
    this.registrations.set(user.userId, user);
    return user;
  }
}

export const mockRegistrationProvider = new MockRegistrationProvider();
