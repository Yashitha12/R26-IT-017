import { WelfareScheme, WelfareCategory, WelfareEligibilityStatus, EligibilityResult, EligibilityBlockchainPayload } from './welfare-eligibility';
import { WelfareApplication } from './welfare';

/**
 * Standardized Welfare Benefit Lifecycle Statuses.
 */
export type BenefitLifecycleStatus =
  | 'PENDING'
  | 'ACTIVE'
  | 'UNDER_REVIEW'
  | 'SUSPENDED'
  | 'TERMINATED';

/**
 * Controlled Welfare Lifecycle Event Types.
 */
export type WelfareLifecycleEventType =
  | 'BENEFIT_ACTIVATED'
  | 'REASSESSMENT_REQUESTED'
  | 'REASSESSMENT_COMPLETED'
  | 'BENEFIT_SUSPENDED'
  | 'BENEFIT_TERMINATED'
  | 'BENEFIT_REACTIVATED'
  | 'BENEFICIARY_DEATH_RECORDED';

/**
 * Immutable Welfare Lifecycle Event Log Entry.
 */
export interface WelfareLifecycleEvent {
  eventId: string; // e.g. EVT-LC-2026-000001
  applicationId: string;
  did: string;
  scheme: WelfareScheme;
  eventType: WelfareLifecycleEventType;
  previousStatus: BenefitLifecycleStatus;
  newStatus: BenefitLifecycleStatus;
  officerId: string;
  reason: string;
  referenceDocNumber?: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

/**
 * Active State Summary for an Approved Welfare Benefit.
 */
export interface BenefitLifecycleState {
  lifecycleId: string; // e.g. LC-2026-000001
  applicationId: string;
  did: string;
  scheme: WelfareScheme;
  currentStatus: BenefitLifecycleStatus;
  currentCategory: WelfareCategory;
  currentEligibilityStatus: WelfareEligibilityStatus;
  currentCalculatedScore: number;
  activeBlockchainRecordId?: string;
  latestEligibilityResultId?: string;
  activatedAt?: string;
  lastReassessedAt?: string;
  lastSuspendedAt?: string;
  terminatedAt?: string;
  terminationReason?: string;
  lastUpdated: string;
  history: WelfareLifecycleEvent[];
}

export interface ReassessmentRequest {
  reason: string;
  officerId?: string;
  updatedData?: {
    householdInformation?: Partial<WelfareApplication['householdInformation']>;
    education?: Partial<WelfareApplication['education']>;
    health?: Partial<WelfareApplication['health']>;
    economic?: Partial<WelfareApplication['economic']>;
    assets?: Partial<WelfareApplication['assets']>;
    housing?: Partial<WelfareApplication['housing']>;
    familyDemography?: Partial<WelfareApplication['familyDemography']>;
  };
}

export interface LifecycleTransitionRequest {
  event: WelfareLifecycleEventType;
  reason: string;
  officerId?: string;
  referenceDocNumber?: string;
  deathCertificateNumber?: string;
  dateOfDeath?: string;
}

export interface WelfareApplicationHistorySummary {
  applicationId: string;
  did: string;
  scheme: WelfareScheme;
  currentLifecycleStatus: BenefitLifecycleStatus;
  currentEligibility: {
    calculatedScore: number;
    category: WelfareCategory;
    status: WelfareEligibilityStatus;
    resultId: string;
    ruleVersion: string;
    calculatedAt: string;
  } | null;
  currentBlockchainRecord: {
    recordId: string;
    recordStatus: string;
    payloadHash: string;
    timestamp: string;
  } | null;
  eligibilityHistory: EligibilityResult[];
  blockchainHistory: EligibilityBlockchainPayload[];
  lifecycleEvents: WelfareLifecycleEvent[];
}
