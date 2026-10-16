export interface RegistrationUser {
  userId: string;
  name: string;
  nic: string;
  dateOfBirth?: string;
  phone: string;
  email: string;
  address: string;
  city?: string;
  district?: string;
  gnDivision: string;
  familySize?: number;
  noOfDependents?: number;
  monthlyIncome?: number;
  monthlyExpenses?: number;
  employmentType?: string;
  bankName?: string;
  accountNumber?: string;
  branch?: string;
  registeredAt: string;
}

export interface CreateRegistrationRequest {
  name: string;
  nic: string;
  dateOfBirth?: string;
  phone: string;
  email: string;
  address: string;
  city?: string;
  district?: string;
  gnDivision: string;
  familySize?: number;
  noOfDependents?: number;
  monthlyIncome?: number;
  monthlyExpenses?: number;
  employmentType?: string;
  bankName?: string;
  accountNumber?: string;
  branch?: string;
}

export interface RegistrationResponse {
  success: boolean;
  data?: RegistrationUser;
  error?: string;
}
