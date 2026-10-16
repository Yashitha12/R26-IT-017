import { IBlockchainProvider } from './blockchain.provider.interface';
import { EligibilityBlockchainPayload } from '../../types/welfare-eligibility';

/**
 * Prototype Mock Blockchain Provider.
 *
 * SIMULATION NOTICE:
 * This is an in-memory simulation of a permissioned blockchain ledger for research
 * and demonstration purposes. It simulates immutable ledger commits, hash integrity,
 * and state transitions without requiring a live Hyperledger Fabric peer network.
 * The production Hyperledger Fabric adapter will implement the identical IBlockchainProvider interface.
 */
export class MockBlockchainProvider implements IBlockchainProvider {
  // Append-only simulated ledger storage
  private readonly ledger: EligibilityBlockchainPayload[] = [];
  private readonly recordsById = new Map<string, EligibilityBlockchainPayload>();
  private readonly recordsByAppId = new Map<string, EligibilityBlockchainPayload[]>();
  private recordSequence = 1;

  public async recordEligibility(payload: EligibilityBlockchainPayload): Promise<EligibilityBlockchainPayload> {
    // Immutable append-only copy to prevent reference tampering
    const immutableRecord: EligibilityBlockchainPayload = {
      ...payload,
    };

    this.ledger.push(immutableRecord);
    this.recordsById.set(immutableRecord.recordId, immutableRecord);

    const appRecords = this.recordsByAppId.get(immutableRecord.applicationId) || [];
    // If there was a previous active record and this is a supersede/update, mark prior as SUPERSEDED in history
    if (immutableRecord.previousRecordId) {
      const priorIdx = appRecords.findIndex((r) => r.recordId === immutableRecord.previousRecordId);
      if (priorIdx >= 0) {
        appRecords[priorIdx] = {
          ...appRecords[priorIdx],
          recordStatus: 'SUPERSEDED',
        };
        this.recordsById.set(appRecords[priorIdx].recordId, appRecords[priorIdx]);
      }
    }

    appRecords.push(immutableRecord);
    this.recordsByAppId.set(immutableRecord.applicationId, appRecords);

    return { ...immutableRecord };
  }

  public async getEligibilityRecord(recordId: string): Promise<EligibilityBlockchainPayload | null> {
    const record = this.recordsById.get(recordId);
    return record ? { ...record } : null;
  }

  public async getEligibilityRecordByApplicationId(applicationId: string): Promise<EligibilityBlockchainPayload | null> {
    const appRecords = this.recordsByAppId.get(applicationId) || [];
    // Return active record (most recent active)
    for (let i = appRecords.length - 1; i >= 0; i--) {
      if (appRecords[i].recordStatus === 'ACTIVE') {
        return { ...appRecords[i] };
      }
    }
    // If no active, return latest
    return appRecords.length > 0 ? { ...appRecords[appRecords.length - 1] } : null;
  }

  public async getAllEligibilityRecordsByApplicationId(applicationId: string): Promise<EligibilityBlockchainPayload[]> {
    const appRecords = this.recordsByAppId.get(applicationId) || [];
    return appRecords.map((r) => ({ ...r }));
  }

  public async verifyEligibilityRecord(recordId: string): Promise<boolean> {
    const record = this.recordsById.get(recordId);
    return Boolean(record && record.recordStatus === 'ACTIVE');
  }

  public getNextBlockchainRecordSequence(): number {
    return this.recordSequence++;
  }

  /**
   * Helper for tests to inspect raw simulated ledger count.
   */
  public getLedgerLength(): number {
    return this.ledger.length;
  }
}

export const mockBlockchainProvider = new MockBlockchainProvider();
