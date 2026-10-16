import { IRegistrationProvider, mockRegistrationProvider } from '../providers/registration.provider';
import { RegistrationUser, CreateRegistrationRequest } from '../types/registration';

export class RegistrationService {
  private readonly provider: IRegistrationProvider;

  constructor(provider: IRegistrationProvider = mockRegistrationProvider) {
    this.provider = provider;
  }

  public getRegistrationByUserId(userId: string): RegistrationUser | null {
    return this.provider.getRegistrationByUserId(userId);
  }

  public registerUser(dto: CreateRegistrationRequest): RegistrationUser {
    // Generate sequential or random prototype user id
    const randomSuffix = Math.floor(100 + Math.random() * 900);
    const userId = `user-prototype-${randomSuffix}`;

    const newUser: RegistrationUser = {
      userId,
      name: dto.name,
      nic: dto.nic,
      dateOfBirth: dto.dateOfBirth,
      phone: dto.phone,
      email: dto.email,
      address: dto.address,
      city: dto.city,
      district: dto.district,
      gnDivision: dto.gnDivision,
      familySize: dto.familySize,
      noOfDependents: dto.noOfDependents,
      monthlyIncome: dto.monthlyIncome,
      monthlyExpenses: dto.monthlyExpenses,
      employmentType: dto.employmentType,
      bankName: dto.bankName,
      accountNumber: dto.accountNumber,
      branch: dto.branch,
      registeredAt: new Date().toISOString(),
    };

    return this.provider.createRegistration(newUser);
  }
}

export const registrationService = new RegistrationService();
