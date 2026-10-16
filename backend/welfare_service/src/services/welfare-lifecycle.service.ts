import { IWelfareLifecycleProvider, mockWelfareLifecycleProvider } from '../providers/welfare-lifecycle.provider';
import { IWelfareProvider, mockWelfareProvider } from '../providers/welfare.provider';
import { IWelfareEligibilityProvider, mockWelfareEligibilityProvider } from '../providers/welfare-eligibility.provider';
import { IBlockchainProvider, mockBlockchainProvider } from '../providers/blockchain';
import { WelfareEligibilityService, welfareEligibilityService } from './welfare-eligibility.service';
import { EligibilityBlockchainService, eligibilityBlockchainService } from './eligibility-blockchain.service';
import {
  BenefitLifecycleStatus,
  WelfareLifecycleEventType,
  WelfareLifecycleEvent,
  BenefitLifecycleState,
  ReassessmentRequest,
  LifecycleTransitionRequest,
  WelfareApplicationHistorySummary,
} from '../types/welfare-lifecycle';

export type LifecycleTransitionResult =
  | {
      status: 'SUCCESS';
      data: BenefitLifecycleState;
      event: WelfareLifecycleEvent;
      message: string;
    }
  | {
      status: 'NOT_FOUND';
      error: string;
    }
  | {
      status: 'INVALID_TRANSITION';
      error: string;
    }
  | {
      status: 'INELIGIBLE_FOR_ACTIVATION';
      error: string;
    };

export type ReassessmentResult =
  | {
      status: 'SUCCESS';
      data: {
        lifecycleState: BenefitLifecycleState;
        newEligibilityResult: any;
        newBlockchainRecord: any;
        reassessmentEvent: WelfareLifecycleEvent;
      };
      message: string;
    }
  | {
      status: 'NOT_FOUND';
      error: string;
    }
  | {
      status: 'CALCULATION_FAILED';
      error: string;
    }
  | {
      status: 'BLOCKCHAIN_FAILED';
      error: string;
    };

export class WelfareLifecycleService {
  private readonly lifecycleProvider: IWelfareLifecycleProvider;
  private readonly welfareProvider: IWelfareProvider;
  private readonly eligibilityProvider: IWelfareEligibilityProvider;
  private readonly blockchainProvider: IBlockchainProvider;
  private readonly eligibilityService: WelfareEligibilityService;
  private readonly blockchainService: EligibilityBlockchainService;

  constructor(
    lifecycleProvider: IWelfareLifecycleProvider = mockWelfareLifecycleProvider,
    welfareProvider: IWelfareProvider = mockWelfareProvider,
    eligibilityProvider: IWelfareEligibilityProvider = mockWelfareEligibilityProvider,
    blockchainProvider: IBlockchainProvider = mockBlockchainProvider,
    eligibilityService: WelfareEligibilityService = welfareEligibilityService,
    blockchainService: EligibilityBlockchainService = eligibilityBlockchainService
  ) {
    this.lifecycleProvider = lifecycleProvider;
    this.welfareProvider = welfareProvider;
    this.eligibilityProvider = eligibilityProvider;
    this.blockchainProvider = blockchainProvider;
    this.eligibilityService = eligibilityService;
    this.blockchainService = blockchainService;
  }

  /**
   * Retrieves or initializes the active benefit lifecycle state for an application.
   */
  public async getLifecycleState(applicationId: string): Promise<BenefitLifecycleState | null> {
    const existing = this.lifecycleProvider.getLifecycleState(applicationId);
    if (existing) return existing;

    const application = this.welfareProvider.getApplicationById(applicationId);
    if (!application) return null;

    // Initialize baseline PENDING lifecycle state
    const latestElig = this.eligibilityProvider.getLatestEligibilityResult(applicationId);
    const activeBc = await this.blockchainProvider.getEligibilityRecordByApplicationId(applicationId);

    const seq = this.lifecycleProvider.getNextLifecycleSequence();
    const year = new Date().getFullYear();
    const lifecycleId = `LC-${year}-${seq.toString().padStart(6, '0')}`;
    const now = new Date().toISOString();

    const initialState: BenefitLifecycleState = {
      lifecycleId,
      applicationId,
      did: application.did,
      scheme: 'ASWESUMA',
      currentStatus: 'PENDING',
      currentCategory: latestElig ? latestElig.category : 'NON_POOR',
      currentEligibilityStatus: latestElig ? latestElig.eligibilityStatus : 'INELIGIBLE',
      currentCalculatedScore: latestElig ? latestElig.calculatedScore : 0,
      activeBlockchainRecordId: activeBc?.recordId,
      latestEligibilityResultId: latestElig?.resultId,
      lastUpdated: now,
      history: [],
    };

    return this.lifecycleProvider.saveLifecycleState(initialState);
  }

  /**
   * Executes a controlled lifecycle state transition with strict state machine validation.
   */
  public async transitionLifecycle(
    applicationId: string,
    req: LifecycleTransitionRequest
  ): Promise<LifecycleTransitionResult> {
    const currentState = await this.getLifecycleState(applicationId);
    if (!currentState) {
      return {
        status: 'NOT_FOUND',
        error: `Welfare application not found for ID: ${applicationId}`,
      };
    }

    const prevStatus = currentState.currentStatus;
    let nextStatus: BenefitLifecycleStatus = prevStatus;
    const now = new Date().toISOString();
    const officerId = req.officerId || 'OFFICER-PROTOTYPE-001';

    // State Machine Transitions
    switch (req.event) {
      case 'BENEFIT_ACTIVATED': {
        if (prevStatus === 'TERMINATED') {
          return {
            status: 'INVALID_TRANSITION',
            error: 'Cannot activate a permanently TERMINATED benefit. A new application is required.',
          };
        }

        // Must hold an ELIGIBLE assessment to be activated
        const latestElig = this.eligibilityProvider.getLatestEligibilityResult(applicationId);
        if (!latestElig || latestElig.eligibilityStatus !== 'ELIGIBLE') {
          return {
            status: 'INELIGIBLE_FOR_ACTIVATION',
            error: `Application is not certified as ELIGIBLE (Current status: ${latestElig?.eligibilityStatus || 'NOT_EVALUATED'}).`,
          };
        }

        // Must hold an active blockchain record
        const activeBc = await this.blockchainProvider.getEligibilityRecordByApplicationId(applicationId);
        if (!activeBc || activeBc.recordStatus !== 'ACTIVE') {
          return {
            status: 'INELIGIBLE_FOR_ACTIVATION',
            error: 'Benefit activation requires a verified on-chain blockchain record. Please record eligibility on blockchain first.',
          };
        }

        nextStatus = 'ACTIVE';
        currentState.activatedAt = currentState.activatedAt || now;
        break;
      }

      case 'REASSESSMENT_REQUESTED': {
        if (prevStatus === 'TERMINATED') {
          return {
            status: 'INVALID_TRANSITION',
            error: 'Cannot request reassessment on a TERMINATED welfare benefit.',
          };
        }
        nextStatus = 'UNDER_REVIEW';
        break;
      }

      case 'BENEFIT_SUSPENDED': {
        if (prevStatus === 'TERMINATED') {
          return {
            status: 'INVALID_TRANSITION',
            error: 'Benefit is already permanently TERMINATED.',
          };
        }
        nextStatus = 'SUSPENDED';
        currentState.lastSuspendedAt = now;
        break;
      }

      case 'BENEFIT_REACTIVATED': {
        if (prevStatus !== 'SUSPENDED' && prevStatus !== 'UNDER_REVIEW') {
          return {
            status: 'INVALID_TRANSITION',
            error: `Cannot reactivate benefit from status '${prevStatus}'. Only SUSPENDED or UNDER_REVIEW benefits can be reactivated.`,
          };
        }
        nextStatus = 'ACTIVE';
        break;
      }

      case 'BENEFICIARY_DEATH_RECORDED': {
        if (prevStatus === 'TERMINATED') {
          return {
            status: 'INVALID_TRANSITION',
            error: 'Benefit is already TERMINATED.',
          };
        }
        nextStatus = 'TERMINATED';
        currentState.terminatedAt = now;
        currentState.terminationReason = `Beneficiary deceased (Death Cert: ${req.deathCertificateNumber || 'Official GN Verification'}, Date: ${req.dateOfDeath || 'Recorded'}).`;
        break;
      }

      case 'BENEFIT_TERMINATED': {
        if (prevStatus === 'TERMINATED') {
          return {
            status: 'INVALID_TRANSITION',
            error: 'Benefit is already TERMINATED.',
          };
        }
        nextStatus = 'TERMINATED';
        currentState.terminatedAt = now;
        currentState.terminationReason = req.reason || 'Administrative termination by welfare authority.';
        break;
      }

      default:
        return {
          status: 'INVALID_TRANSITION',
          error: `Unrecognized lifecycle event: ${req.event}`,
        };
    }

    // Generate immutable lifecycle event log entry
    const seq = this.lifecycleProvider.getNextEventSequence();
    const year = new Date().getFullYear();
    const eventId = `EVT-LC-${year}-${seq.toString().padStart(6, '0')}`;

    const event: WelfareLifecycleEvent = {
      eventId,
      applicationId,
      did: currentState.did,
      scheme: currentState.scheme,
      eventType: req.event,
      previousStatus: prevStatus,
      newStatus: nextStatus,
      officerId,
      reason: req.reason || `Status transition via ${req.event}`,
      referenceDocNumber: req.referenceDocNumber || req.deathCertificateNumber,
      timestamp: now,
      metadata: {
        deathCertificateNumber: req.deathCertificateNumber,
        dateOfDeath: req.dateOfDeath,
      },
    };

    // Update and persist state
    currentState.currentStatus = nextStatus;
    currentState.lastUpdated = now;
    currentState.history.push(event);

    this.lifecycleProvider.recordLifecycleEvent(event);
    const updatedState = this.lifecycleProvider.saveLifecycleState(currentState);

    return {
      status: 'SUCCESS',
      data: updatedState,
      event,
      message: `Benefit lifecycle successfully transitioned: ${prevStatus} -> ${nextStatus}`,
    };
  }

  /**
   * Executes an authorized reassessment workflow:
   * 1. Updates application data if changed circumstances provided.
   * 2. Recalculates off-chain score producing a NEW EligibilityResult (historical result preserved).
   * 3. Anchors new result to blockchain with previousRecordId link (prior record marked SUPERSEDED).
   * 4. Logs REASSESSMENT_COMPLETED lifecycle event and updates active state.
   */
  public async reassessApplication(
    applicationId: string,
    req: ReassessmentRequest
  ): Promise<ReassessmentResult> {
    // 1. Verify application exists
    const application = this.welfareProvider.getApplicationById(applicationId);
    if (!application) {
      return {
        status: 'NOT_FOUND',
        error: `Aswesuma application not found with ID: ${applicationId}`,
      };
    }

    // 2. Apply updated household/economic/health data if provided
    if (req.updatedData) {
      if (req.updatedData.householdInformation) {
        application.householdInformation = { ...application.householdInformation, ...req.updatedData.householdInformation };
      }
      if (req.updatedData.education) {
        application.education = { ...application.education, ...req.updatedData.education };
      }
      if (req.updatedData.health) {
        application.health = { ...application.health, ...req.updatedData.health };
      }
      if (req.updatedData.economic) {
        application.economic = { ...application.economic, ...req.updatedData.economic };
      }
      if (req.updatedData.assets) {
        application.assets = { ...application.assets, ...req.updatedData.assets };
      }
      if (req.updatedData.housing) {
        application.housing = { ...application.housing, ...req.updatedData.housing };
      }
      if (req.updatedData.familyDemography) {
        application.familyDemography = { ...application.familyDemography, ...req.updatedData.familyDemography };
      }
      application.updatedAt = new Date().toISOString();
    }

    // 3. Recalculate eligibility with WE-3 scoring engine
    const calcResult = this.eligibilityService.calculateAswesumaEligibility(applicationId);
    if (calcResult.status !== 'SUCCESS') {
      return {
        status: 'CALCULATION_FAILED',
        error: `Reassessment calculation failed: ${(calcResult as any).error}`,
      };
    }
    const newEligibilityResult = calcResult.data;

    // 4. Anchor new assessment on blockchain (WE-4 service automatically links previousRecordId & supersedes prior record)
    const bcResult = await this.blockchainService.recordEligibilityResult(applicationId);
    let newBlockchainRecord = null;
    if (bcResult.status === 'SUCCESS') {
      newBlockchainRecord = bcResult.data;
    } else if (bcResult.status === 'ALREADY_RECORDED' && bcResult.existingRecord) {
      newBlockchainRecord = bcResult.existingRecord;
    } else {
      return {
        status: 'BLOCKCHAIN_FAILED',
        error: `Blockchain recording failed: ${(bcResult as any).error}`,
      };
    }

    // 5. Update Lifecycle State & Record REASSESSMENT_COMPLETED event
    const currentState = await this.getLifecycleState(applicationId);
    const now = new Date().toISOString();
    const officerId = req.officerId || 'OFFICER-PROTOTYPE-001';

    const prevStatus = currentState?.currentStatus || 'PENDING';
    const nextStatus: BenefitLifecycleStatus =
      newEligibilityResult.eligibilityStatus === 'ELIGIBLE'
        ? prevStatus === 'TERMINATED' ? 'TERMINATED' : 'ACTIVE'
        : 'SUSPENDED';

    const seq = this.lifecycleProvider.getNextEventSequence();
    const year = new Date().getFullYear();
    const eventId = `EVT-LC-${year}-${seq.toString().padStart(6, '0')}`;

    const reassessmentEvent: WelfareLifecycleEvent = {
      eventId,
      applicationId,
      did: application.did,
      scheme: 'ASWESUMA',
      eventType: 'REASSESSMENT_COMPLETED',
      previousStatus: prevStatus,
      newStatus: nextStatus,
      officerId,
      reason: req.reason || 'Periodic or circumstance-change reassessment completed.',
      timestamp: now,
      metadata: {
        newScore: newEligibilityResult.calculatedScore,
        newCategory: newEligibilityResult.category,
        newEligibilityStatus: newEligibilityResult.eligibilityStatus,
        blockchainRecordId: newBlockchainRecord.recordId,
      },
    };

    if (currentState) {
      currentState.currentStatus = nextStatus;
      currentState.currentCategory = newEligibilityResult.category;
      currentState.currentEligibilityStatus = newEligibilityResult.eligibilityStatus;
      currentState.currentCalculatedScore = newEligibilityResult.calculatedScore;
      currentState.activeBlockchainRecordId = newBlockchainRecord.recordId;
      currentState.latestEligibilityResultId = newEligibilityResult.resultId;
      currentState.lastReassessedAt = now;
      currentState.lastUpdated = now;
      currentState.history.push(reassessmentEvent);
      this.lifecycleProvider.saveLifecycleState(currentState);
    }

    this.lifecycleProvider.recordLifecycleEvent(reassessmentEvent);

    return {
      status: 'SUCCESS',
      data: {
        lifecycleState: currentState!,
        newEligibilityResult,
        newBlockchainRecord,
        reassessmentEvent,
      },
      message: 'Reassessment completed successfully. New eligibility result and blockchain record committed.',
    };
  }

  /**
   * Retrieves comprehensive chronological audit history of an application:
   * - All off-chain eligibility evaluations
   * - All on-chain blockchain records (ACTIVE + SUPERSEDED)
   * - All lifecycle transitions & officer events
   */
  public async getApplicationHistory(applicationId: string): Promise<WelfareApplicationHistorySummary | null> {
    const application = this.welfareProvider.getApplicationById(applicationId);
    if (!application) return null;

    const lifecycleState = await this.getLifecycleState(applicationId);
    const latestElig = this.eligibilityProvider.getLatestEligibilityResult(applicationId);
    const activeBc = await this.blockchainProvider.getEligibilityRecordByApplicationId(applicationId);

    const eligibilityHistory = this.eligibilityProvider.getAllEligibilityResultsByApplicationId(applicationId);
    const blockchainHistory = await this.blockchainProvider.getAllEligibilityRecordsByApplicationId(applicationId);
    const lifecycleEvents = this.lifecycleProvider.getEventsByApplicationId(applicationId);

    return {
      applicationId,
      did: application.did,
      scheme: 'ASWESUMA',
      currentLifecycleStatus: lifecycleState?.currentStatus || 'PENDING',
      currentEligibility: latestElig
        ? {
            calculatedScore: latestElig.calculatedScore,
            category: latestElig.category,
            status: latestElig.eligibilityStatus,
            resultId: latestElig.resultId,
            ruleVersion: latestElig.ruleVersion,
            calculatedAt: latestElig.calculatedAt,
          }
        : null,
      currentBlockchainRecord: activeBc
        ? {
            recordId: activeBc.recordId,
            recordStatus: activeBc.recordStatus,
            payloadHash: activeBc.payloadHash || '',
            timestamp: activeBc.timestamp,
          }
        : null,
      eligibilityHistory,
      blockchainHistory,
      lifecycleEvents,
    };
  }
}

export const welfareLifecycleService = new WelfareLifecycleService();
