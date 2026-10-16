import { EligibilityBlockchainPayload } from '../../types/welfare-eligibility';

/**
 * Clean abstraction interface for Blockchain Recording and Verification.
 * Enables off-chain services to interact with a pluggable ledger provider:
 * - MockBlockchainProvider (current prototype simulation)
 * - HyperledgerFabricProvider (future production network integration)
 */
export interface IBlockchainProvider {
  /**
   * Records an immutable eligibility payload on the blockchain ledger.
   */
  recordEligibility(payload: EligibilityBlockchainPayload): Promise<EligibilityBlockchainPayload>;

  /**
   * Retrieves a specific blockchain record by recordId.
   */
  getEligibilityRecord(recordId: string): Promise<EligibilityBlockchainPayload | null>;

  /**
   * Retrieves the active/latest blockchain eligibility record for an application.
   */
  getEligibilityRecordByApplicationId(applicationId: string): Promise<EligibilityBlockchainPayload | null>;

  /**
   * Retrieves full immutable history/audit trail of records for an application.
   */
  getAllEligibilityRecordsByApplicationId(applicationId: string): Promise<EligibilityBlockchainPayload[]>;

  /**
   * Checks if a blockchain record exists and is active.
   */
  verifyEligibilityRecord(recordId: string): Promise<boolean>;

  /**
   * Generates sequential sequence counter for unique record IDs.
   */
  getNextBlockchainRecordSequence(): number;
}
