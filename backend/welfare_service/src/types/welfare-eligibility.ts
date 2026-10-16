import {
  EducationInformation,
  HealthInformation,
  EconomicInformation,
  AssetsInformation,
  HousingInformation,
  FamilyDemographyInformation,
} from './welfare';

// ============================================================================
// WE-1: Welfare Scheme & Policy Category Enums
// ============================================================================

export type WelfareScheme = 'ASWESUMA' | 'ELDERLY_ASSISTANCE' | 'DISABILITY_ASSISTANCE' | 'CKDU_RELIEF';

/**
 * Prototype Welfare Beneficiary Categories.
 * NOTE: These are prototype categories designed for the evaluation engine
 * and are not official gazetted Aswesuma / WBB policy classifications.
 */
export type WelfareCategory =
  | 'SEVERELY_POOR'
  | 'POOR'
  | 'VULNERABLE'
  | 'TRANSITIONAL'
  | 'NON_POOR';

export type WelfareEligibilityStatus =
  | 'ELIGIBLE'
  | 'INELIGIBLE'
  | 'REVIEW_REQUIRED';

export type EligibilityDimensionName =
  | 'EDUCATION'
  | 'HEALTH_AND_SPECIAL_NEEDS'
  | 'ECONOMIC_LEVEL_AND_INCOME'
  | 'ASSETS_AND_OWNERSHIP'
  | 'HOUSING_CONDITIONS'
  | 'FAMILY_DEMOGRAPHY';

// ============================================================================
// B. Eligibility Input Model
// ============================================================================

/**
 * Structured input provided to the eligibility calculation engine.
 * Reuses the existing Aswesuma Application six dimensions without data duplication.
 */
export interface EligibilityInput {
  applicationId: string;
  did: string;
  userId?: string;
  scheme: WelfareScheme;
  ruleVersion: string; // e.g. 'v1.0.0-prototype'

  // Six Eligibility Dimensions mapped from Aswesuma Application
  education: EducationInformation;
  health: HealthInformation;
  economic: EconomicInformation;
  assets: AssetsInformation;
  housing: HousingInformation;
  familyDemography: FamilyDemographyInformation;

  // Optional derived metrics to assist scoring
  householdSummary?: {
    totalMembers: number;
    dependencyRatio?: number;
    perCapitaIncome?: number;
  };

  assessmentTimestamp: string;
}

// ============================================================================
// D. Explanation & Itemized Breakdown Model
// ============================================================================

/**
 * Itemized indicator score contribution for citizen, officer, and researcher auditability.
 */
export interface DimensionScoreExplanation {
  dimension: EligibilityDimensionName;
  indicator: string;
  indicatorKey: string;
  inputValue: string | number | boolean | string[] | null | undefined;
  weight: number;
  contribution: number;
  reason: string;
}

export interface DimensionScoreSummary {
  dimension: EligibilityDimensionName;
  score: number;
  maxPossibleScore?: number;
  weightPercentage?: number;
  explanationList: DimensionScoreExplanation[];
}

// ============================================================================
// C. Eligibility Result Model
// ============================================================================

export interface CategoryThresholdApplied {
  category: WelfareCategory;
  minScore: number;
  maxScore: number;
  eligibilityStatus: WelfareEligibilityStatus;
  monthlyBenefitLkr?: number;
}

/**
 * Comprehensive result produced by the off-chain eligibility evaluation engine.
 */
export interface EligibilityResult {
  resultId: string; // e.g. ELG-2026-000001
  applicationId: string;
  did: string;
  scheme: WelfareScheme;
  ruleVersion: string;

  // Final Output
  calculatedScore: number;
  category: WelfareCategory;
  eligibilityStatus: WelfareEligibilityStatus;
  thresholdApplied: CategoryThresholdApplied;

  // Detailed Dimension Breakdowns & Explanations
  dimensionBreakdown: Record<EligibilityDimensionName, DimensionScoreSummary>;
  itemizedExplanations: DimensionScoreExplanation[];

  // Boundary & Administrative Review Flags
  reviewRequired?: boolean;
  reviewReason?: string;
  boundaryZone?: boolean;

  // Metadata
  calculatedAt: string;
  engineVersion: string;
  isSimulated?: boolean;
  translations?: {
    category: { en: string; si: string };
    status: { en: string; si: string };
    stipendFormatted: { en: string; si: string };
    dimensions: Record<string, { en: string; si: string }>;
  };
}

// ============================================================================
// E. Rule Configuration Model
// ============================================================================

export interface IndicatorRuleWeight {
  dimension: EligibilityDimensionName;
  indicatorKey: string;
  operator: 'EQUALS' | 'GREATER_THAN' | 'LESS_THAN' | 'CONTAINS' | 'CUSTOM';
  targetValue?: string | number | boolean;
  weight: number;
  reasonTemplate: string;
}

export interface CategoryThresholdConfig {
  category: WelfareCategory;
  minScore: number;
  maxScore: number;
  eligibilityStatus: WelfareEligibilityStatus;
  monthlyBenefitLkr?: number;
  description: string;
}

/**
 * Versioned Eligibility Scoring Configuration.
 * Fully configurable to avoid hardcoded or proprietary coefficients.
 */
export interface EligibilityRuleConfig {
  scheme: WelfareScheme;
  ruleVersion: string; // e.g. 'v1.0.0-prototype'
  description: string;
  interceptScore: number; // Base score constant

  // Indicator Rules & Weights
  indicatorWeights: IndicatorRuleWeight[];

  // Category Score Brackets
  categoryThresholds: CategoryThresholdConfig[];

  // Boundary & Tolerance Configuration for Administrative Review
  boundaryTolerancePoints?: number; // Score band (e.g. ±10.0 pts) triggering REVIEW_REQUIRED
  boundaryReviewEnabled?: boolean;

  // Validity period & Lifecycle
  effectiveFrom: string;
  effectiveTo?: string;
  status: 'ACTIVE' | 'SUPERSEDED' | 'DRAFT';
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// F. Blockchain Payload Model (Zero-Knowledge / Minimum Surface)
// ============================================================================

export type BlockchainRecordStatus = 'ACTIVE' | 'SUPERSEDED' | 'TERMINATED' | 'UPDATED';

/**
 * Sanitized, privacy-preserving payload for on-chain recording.
 * STRICT PRIVACY: Omits all sensitive PII, full address, NIC, bank account,
 * detailed diseases, and household health data.
 */
export interface EligibilityBlockchainPayload {
  recordId: string; // e.g. REC-BC-2026-000001
  applicationId: string; // e.g. ASW-2026-000001
  didReference: string; // e.g. did:smartgrama:prototype:001
  scheme: WelfareScheme;
  ruleVersion: string; // e.g. v1.0.0-prototype

  // Certified Eligibility Verdict
  calculatedScore: number;
  category: WelfareCategory;
  eligibilityStatus: WelfareEligibilityStatus;
  thresholdReference: string; // e.g. THRESHOLD-POOR-2026

  // Audit Chaining & Version Lifecycle
  recordStatus: BlockchainRecordStatus;
  previousRecordId?: string; // Links to prior record if updated/superseded
  timestamp: string;

  // Cryptographic Proof (Optional hash of full off-chain explanation)
  payloadHash?: string;
}

export interface BlockchainVerificationResult {
  applicationId: string;
  recordId: string;
  verificationStatus: 'VALID' | 'INVALID' | 'RECORD_NOT_FOUND' | 'OFFCHAIN_RESULT_NOT_FOUND';
  verifiedAt: string;
  ruleVersion: string;
  recordStatus: BlockchainRecordStatus;
  calculatedHash?: string;
  storedHash?: string;
  isIntegrityVerified: boolean;
  message: string;
}
