export interface ApplicantInformation {
  fullName: string;
  nic: string;
  dateOfBirth: string;
  gender: 'Male' | 'Female' | 'Other';
  mobilePhone: string;
  permanentAddress: string;
  province: string;
  district: string;
  dsDivision: string;
  gnDivision: string;
}

export interface HouseholdInformation {
  totalMembers: number;
  existingWelfareProgrammes: string[]; // 'Samurdhi' | 'Elderly Assistance' | 'Disability Assistance' | 'Chronic Illness / CKD' | 'None'
  waitingListStatus: 'Yes' | 'No';
  applicationStatus: 'New Applicant' | 'Existing Beneficiary';
}

export interface EducationInformation {
  highestEducationHead: string; // 'No Formal Education' | 'Primary (Grades 1-5)' | 'Secondary (Grades 6-11)' | 'G.C.E. O/L' | 'G.C.E. A/L' | 'Higher Education / Degree'
  educationMembersSummary?: string;
  schoolAttendanceChildren: 'All Attend Regularly' | 'Some Attend' | 'None Attend' | 'No School-aged Children';
  schoolDropoutStatus: 'No Dropouts' | 'Has Dropout Children';
}

export interface HealthInformation {
  hasPermanentDisabilities: 'Yes' | 'No';
  disabilityCount: number;
  hasSevereChronicIllnesses: 'Yes' | 'No';
  chronicIllnessCount: number;
  hasCkd: boolean;
  hasCancer: boolean;
  hasParalysis: boolean;
  otherSeriousConditions?: string;
  bedriddenElderlyCount: number;
  fullyDependentElderlyCount: number;
}

export interface EconomicInformation {
  primaryLivelihood: 'Daily wage' | 'Agriculture' | 'Formal employment' | 'Self-employment' | 'Business' | 'Other';
  secondaryLivelihood?: 'Daily wage' | 'Agriculture' | 'Formal employment' | 'Self-employment' | 'Business' | 'None' | 'Other';
  estimatedMonthlyIncome: number;
  regularMonthlyExpenses: number;
  averageMonthlyElectricityKwh: number;
}

export interface AssetsInformation {
  motorVehicles: string[]; // 'Motorcycle' | 'Three-wheeler' | 'Car / Van' | 'Tractor' | 'None'
  consumerDurables: string[]; // 'Refrigerator' | 'Washing Machine' | 'Television' | 'None'
  hasAgriculturalLand: 'Yes' | 'No';
  hasResidentialLand: 'Yes' | 'No';
  totalLandExtentPerches?: number;
}

export interface HousingInformation {
  houseOwnership: 'Owned' | 'Rented' | 'Encroached' | 'Temporary shelter';
  roofMaterial: 'Asbestos' | 'Tile' | 'Tin' | 'Thatched' | 'Other';
  wallMaterial: 'Brick' | 'Cement' | 'Clay' | 'Plank' | 'Other';
  floorMaterial: 'Cement' | 'Tile' | 'Mud / Clay' | 'Wood' | 'Other';
  accessSafeDrinkingWater: 'Yes' | 'No';
  accessPrivateSanitaryToilet: 'Yes' | 'No';
}

export interface FamilyDemographyInformation {
  childrenBelow15: number;
  workingAgeMembers: number; // 15 to 64
  adultsOver65: number;
  singleParentHousehold: 'Yes' | 'No';
  femaleHeadedHousehold: 'Yes' | 'No';
}

export interface BankingInformation {
  bankName: string;
  branchCode: string;
  accountNumberMasked: string;
  accountHolderName: string;
}

export interface WelfareApplication {
  applicationId: string; // e.g. ASW-2026-000001
  did: string;
  userId?: string;
  programme: 'ASWESUMA';
  applicantInformation: ApplicantInformation;
  householdInformation: HouseholdInformation;
  education: EducationInformation;
  health: HealthInformation;
  economic: EconomicInformation;
  assets: AssetsInformation;
  housing: HousingInformation;
  familyDemography: FamilyDemographyInformation;
  banking: BankingInformation;
  status: 'DRAFT' | 'SUBMITTED';
  createdAt: string;
  updatedAt: string;
  submittedAt?: string;
}

export interface CreateAswesumaApplicationRequest {
  did: string;
  userId?: string;
  applicantInformation: ApplicantInformation;
  householdInformation: HouseholdInformation;
  education: EducationInformation;
  health: HealthInformation;
  economic: EconomicInformation;
  assets: AssetsInformation;
  housing: HousingInformation;
  familyDemography: FamilyDemographyInformation;
  banking: BankingInformation;
}

export interface WelfareApplicationResponse {
  success: boolean;
  message?: string;
  data?: WelfareApplication;
  error?: string;
}

export interface WelfareApplicationListResponse {
  success: boolean;
  data?: WelfareApplication[];
  error?: string;
}

// -------------------------------------------------------------
// Phase W4: Elderly Assistance Application Data Models
// -------------------------------------------------------------

export interface ElderlyApplicant {
  fullName: string;
  nic: string;
  dateOfBirth: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  mobile: string;
}

export interface ElderlyAddress {
  address: string;
  province: string;
  district: string;
  dsDivision: string;
  gnDivision: string;
}

export interface ElderlyHousehold {
  householdMembers: number;
  monthlyIncome: number;
  mainIncomeSource: string;
  existingWelfare: 'Aswesuma' | 'Samurdhi' | 'Other' | 'None';
  existingWelfareOther?: string;
  aswesumaBeneficiary: 'Yes' | 'No';
  pensionReceived: 'Yes' | 'No';
  otherIncomeSupport: 'Yes' | 'No';
}

export interface ElderlyBank {
  bankName: string;
  branch: string;
  accountNumber: string;
  accountHolderName: string;
}

export interface ElderlyDocumentRef {
  status: 'Not Submitted' | 'Submitted';
  ref?: string;
  submittedAt?: string;
}

export interface ElderlyDocuments {
  nic: ElderlyDocumentRef;
  birthCertificate: ElderlyDocumentRef;
  bankDetails: ElderlyDocumentRef;
}

export interface ElderlyAssistanceApplication {
  applicationId: string; // e.g. ELD-2026-000001
  category: 'ELDERLY_ASSISTANCE';
  did: string;
  userId?: string;
  applicant: ElderlyApplicant;
  address: ElderlyAddress;
  household: ElderlyHousehold;
  bank: ElderlyBank;
  documents: ElderlyDocuments;
  status: 'PENDING_REVIEW';
  submittedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateElderlyApplicationRequest {
  did: string;
  userId?: string;
  applicant: ElderlyApplicant;
  address: ElderlyAddress;
  household: ElderlyHousehold;
  bank: ElderlyBank;
  documents: ElderlyDocuments;
}

export interface ElderlyApplicationResponse {
  success: boolean;
  message?: string;
  data?: ElderlyAssistanceApplication;
  error?: string;
}

export interface ElderlyApplicationListResponse {
  success: boolean;
  data?: ElderlyAssistanceApplication[];
  error?: string;
}

// -------------------------------------------------------------
// Phase W5: Disability Assistance Application Data Models
// -------------------------------------------------------------

export interface DisabilityApplicant {
  fullName: string;
  nic: string;
  dateOfBirth: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  mobile: string;
  disabilityType: string; // e.g. 'Physical', 'Visual', 'Hearing', 'Intellectual', 'Multiple', 'Other'
  disabilityDescription?: string;
  disabilityCardNumber?: string;
}

export interface DisabilityAddress {
  address: string;
  province: string;
  district: string;
  dsDivision: string;
  gnDivision: string;
}

export interface DisabilityHousehold {
  householdMembers: number;
  monthlyIncome: number;
  mainIncomeSource: string;
  existingWelfare: 'Aswesuma' | 'Samurdhi' | 'Other' | 'None';
  existingWelfareOther?: string;
  aswesumaBeneficiary: 'Yes' | 'No';
  caregiverAvailable: 'Yes' | 'No';
  otherIncomeSupport: 'Yes' | 'No';
}

export interface DisabilityBank {
  bankName: string;
  branch: string;
  accountNumber: string;
  accountHolderName: string;
}

export interface DisabilityDocumentRef {
  status: 'Not Submitted' | 'Submitted';
  ref?: string;
  submittedAt?: string;
}

export interface DisabilityDocuments {
  nic: DisabilityDocumentRef;
  medicalCertificate: DisabilityDocumentRef;
  bankDetails: DisabilityDocumentRef;
}

export interface DisabilityAssistanceApplication {
  applicationId: string; // e.g. DIS-2026-000001
  category: 'DISABILITY_ASSISTANCE';
  did: string;
  userId?: string;
  applicant: DisabilityApplicant;
  address: DisabilityAddress;
  household: DisabilityHousehold;
  bank: DisabilityBank;
  documents: DisabilityDocuments;
  status: 'PENDING_REVIEW';
  submittedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateDisabilityApplicationRequest {
  did: string;
  userId?: string;
  applicant: DisabilityApplicant;
  address: DisabilityAddress;
  household: DisabilityHousehold;
  bank: DisabilityBank;
  documents: DisabilityDocuments;
}

export interface DisabilityApplicationResponse {
  success: boolean;
  message?: string;
  data?: DisabilityAssistanceApplication;
  error?: string;
}

export interface DisabilityApplicationListResponse {
  success: boolean;
  data?: DisabilityAssistanceApplication[];
  error?: string;
}

