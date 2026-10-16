import crypto from 'crypto';
import { IBlockchainProvider, mockBlockchainProvider } from '../providers/blockchain';
import { IWelfareEligibilityProvider, mockWelfareEligibilityProvider } from '../providers/welfare-eligibility.provider';
import { IWelfareProvider, mockWelfareProvider } from '../providers/welfare.provider';
import {
  EligibilityResult,
  EligibilityBlockchainPayload,
  BlockchainVerificationResult,
} from '../types/welfare-eligibility';

export type RecordBlockchainResult =
  | {
      status: 'SUCCESS';
      data: EligibilityBlockchainPayload;
      message: string;
    }
  | {
      status: 'NOT_FOUND';
      error: string;
    }
  | {
      status: 'NO_ELIGIBILITY_RESULT';
      error: string;
    }
  | {
      status: 'ALREADY_RECORDED';
      error: string;
      existingRecord?: EligibilityBlockchainPayload;
    };

/**
 * Deterministic JSON Canonicalizer.
 * Recursively sorts all object keys to ensure consistent hashing across environments,
 * independent of insertion order or platform whitespace differences.
 */
export function canonicalizeJson(obj: any): string {
  if (obj === null || typeof obj !== 'object') {
    return JSON.stringify(obj);
  }
  if (Array.isArray(obj)) {
    return '[' + obj.map(canonicalizeJson).join(',') + ']';
  }
  const sortedKeys = Object.keys(obj).sort();
  const pairs = sortedKeys.map((key) => `${JSON.stringify(key)}:${canonicalizeJson(obj[key])}`);
  return '{' + pairs.join(',') + '}';
}

/**
 * Computes deterministic SHA-256 cryptographic digest of the off-chain EligibilityResult.
 */
export function computeEligibilityPayloadHash(result: EligibilityResult): string {
  const canonicalStructure = {
    applicationId: result.applicationId,
    did: result.did,
    scheme: result.scheme,
    ruleVersion: result.ruleVersion,
    calculatedScore: result.calculatedScore,
    category: result.category,
    eligibilityStatus: result.eligibilityStatus,
    thresholdApplied: result.thresholdApplied,
    dimensionBreakdown: result.dimensionBreakdown,
    itemizedExplanations: result.itemizedExplanations,
    engineVersion: result.engineVersion,
  };

  const canonicalString = canonicalizeJson(canonicalStructure);
  return crypto.createHash('sha256').update(canonicalString, 'utf8').digest('hex');
}

export class EligibilityBlockchainService {
  private readonly blockchainProvider: IBlockchainProvider;
  private readonly eligibilityProvider: IWelfareEligibilityProvider;
  private readonly welfareProvider: IWelfareProvider;

  constructor(
    blockchainProvider: IBlockchainProvider = mockBlockchainProvider,
    eligibilityProvider: IWelfareEligibilityProvider = mockWelfareEligibilityProvider,
    welfareProvider: IWelfareProvider = mockWelfareProvider
  ) {
    this.blockchainProvider = blockchainProvider;
    this.eligibilityProvider = eligibilityProvider;
    this.welfareProvider = welfareProvider;
  }

  /**
   * Commits the finalized off-chain EligibilityResult to the blockchain ledger.
   * Produces a sanitized, privacy-preserving payload containing ZERO personal data.
   */
  public async recordEligibilityResult(applicationId: string): Promise<RecordBlockchainResult> {
    // 1. Verify application existence
    const application = this.welfareProvider.getApplicationById(applicationId);
    if (!application) {
      return {
        status: 'NOT_FOUND',
        error: `Aswesuma application not found with ID: ${applicationId}`,
      };
    }

    // 2. Verify latest WE-3 off-chain calculation result exists
    const latestEligibility = this.eligibilityProvider.getLatestEligibilityResult(applicationId);
    if (!latestEligibility) {
      return {
        status: 'NO_ELIGIBILITY_RESULT',
        error: `No calculated eligibility assessment found for application: ${applicationId}. Please evaluate eligibility first.`,
      };
    }

    // 3. Generate deterministic cryptographic proof (SHA-256 hash of complete off-chain evaluation)
    const payloadHash = computeEligibilityPayloadHash(latestEligibility);

    // 4. Prevent duplicate ACTIVE records with identical hash
    const existingActiveRecord = await this.blockchainProvider.getEligibilityRecordByApplicationId(applicationId);
    if (existingActiveRecord && existingActiveRecord.recordStatus === 'ACTIVE') {
      if (existingActiveRecord.payloadHash === payloadHash) {
        return {
          status: 'ALREADY_RECORDED',
          error: `Eligibility result for application ${applicationId} is already recorded on the blockchain (Record ID: ${existingActiveRecord.recordId}).`,
          existingRecord: existingActiveRecord,
        };
      }
    }

    // 5. Generate unique blockchain record ID (REC-BC-YYYY-XXXXXX)
    const seq = this.blockchainProvider.getNextBlockchainRecordSequence();
    const year = new Date().getFullYear();
    const recordId = `REC-BC-${year}-${seq.toString().padStart(6, '0')}`;
    const timestamp = new Date().toISOString();

    // 6. Build threshold reference identifier
    const thresholdReference = `${latestEligibility.category}-THRESHOLD-${latestEligibility.thresholdApplied.minScore}-${latestEligibility.thresholdApplied.maxScore}`;

    // 7. Assemble sanitized blockchain payload (STRICT PRIVACY: NO PII, NO NIC, NO RAW INCOME, NO HEALTH DATA)
    const blockchainPayload: EligibilityBlockchainPayload = {
      recordId,
      applicationId: latestEligibility.applicationId,
      didReference: latestEligibility.did,
      scheme: latestEligibility.scheme,
      ruleVersion: latestEligibility.ruleVersion,
      calculatedScore: latestEligibility.calculatedScore,
      category: latestEligibility.category,
      eligibilityStatus: latestEligibility.eligibilityStatus,
      thresholdReference,
      recordStatus: 'ACTIVE',
      previousRecordId: existingActiveRecord ? existingActiveRecord.recordId : undefined,
      timestamp,
      payloadHash,
    };

    // 8. Commit to blockchain provider
    const recorded = await this.blockchainProvider.recordEligibility(blockchainPayload);

    return {
      status: 'SUCCESS',
      data: recorded,
      message: 'Eligibility result successfully anchored to blockchain ledger.',
    };
  }

  /**
   * Retrieves the active blockchain eligibility record for an application.
   */
  public async getEligibilityRecordByApplicationId(
    applicationId: string
  ): Promise<EligibilityBlockchainPayload | null> {
    return this.blockchainProvider.getEligibilityRecordByApplicationId(applicationId);
  }

  /**
   * Retrieves a specific blockchain record by its unique record ID.
   */
  public async getEligibilityRecord(recordId: string): Promise<EligibilityBlockchainPayload | null> {
    return this.blockchainProvider.getEligibilityRecord(recordId);
  }

  /**
   * Cryptographically verifies the integrity between on-chain blockchain record and off-chain data.
   */
  public async verifyEligibilityRecord(applicationId: string): Promise<BlockchainVerificationResult> {
    const verifiedAt = new Date().toISOString();

    // 1. Retrieve on-chain record
    const blockchainRecord = await this.blockchainProvider.getEligibilityRecordByApplicationId(applicationId);
    if (!blockchainRecord) {
      return {
        applicationId,
        recordId: 'N/A',
        verificationStatus: 'RECORD_NOT_FOUND',
        verifiedAt,
        ruleVersion: 'N/A',
        recordStatus: 'TERMINATED',
        isIntegrityVerified: false,
        message: `No active blockchain record found for application ID: ${applicationId}`,
      };
    }

    // 2. Retrieve corresponding off-chain evaluation
    const offchainResult = this.eligibilityProvider.getLatestEligibilityResult(applicationId);
    if (!offchainResult) {
      return {
        applicationId,
        recordId: blockchainRecord.recordId,
        verificationStatus: 'OFFCHAIN_RESULT_NOT_FOUND',
        verifiedAt,
        ruleVersion: blockchainRecord.ruleVersion,
        recordStatus: blockchainRecord.recordStatus,
        storedHash: blockchainRecord.payloadHash,
        isIntegrityVerified: false,
        message: `Off-chain eligibility result missing for application ID: ${applicationId}`,
      };
    }

    // 3. Recalculate hash using the identical canonicalization algorithm
    const calculatedHash = computeEligibilityPayloadHash(offchainResult);
    const isMatch = calculatedHash === blockchainRecord.payloadHash;

    return {
      applicationId,
      recordId: blockchainRecord.recordId,
      verificationStatus: isMatch ? 'VALID' : 'INVALID',
      verifiedAt,
      ruleVersion: blockchainRecord.ruleVersion,
      recordStatus: blockchainRecord.recordStatus,
      calculatedHash,
      storedHash: blockchainRecord.payloadHash,
      isIntegrityVerified: isMatch,
      message: isMatch
        ? 'Blockchain cryptographic verification PASSED. Off-chain assessment matches on-chain digest.'
        : 'INTEGRITY MISMATCH: Off-chain eligibility assessment has been altered or tampered with.',
    };
  }
}

export const eligibilityBlockchainService = new EligibilityBlockchainService();
