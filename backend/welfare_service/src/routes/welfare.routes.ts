import { Router } from 'express';
import { welfareController } from '../controllers/welfare.controller';
import { welfareEligibilityController } from '../controllers/welfare-eligibility.controller';
import { eligibilityBlockchainController } from '../controllers/eligibility-blockchain.controller';
import { welfareLifecycleController } from '../controllers/welfare-lifecycle.controller';

const router = Router();

// Submit new Aswesuma Application
router.post('/aswesuma/applications', welfareController.createAswesumaApplication);

// Query specific application by Application ID (e.g. ASW-2026-000001)
router.get('/aswesuma/applications/:applicationId', welfareController.getAswesumaApplicationById);

// Query applications submitted by a verified DID
router.get('/aswesuma/applications/did/:did', welfareController.getAswesumaApplicationsByDid);

// -------------------------------------------------------------
// Phase WE-2 & WE-3: Aswesuma Eligibility Calculation Routes
// -------------------------------------------------------------

// Calculate eligibility score for an existing application
router.post(
  '/aswesuma/applications/:applicationId/eligibility/calculate',
  welfareEligibilityController.calculateAswesumaEligibility
);

// Query latest calculated eligibility score for an application
router.get(
  '/aswesuma/applications/:applicationId/eligibility',
  welfareEligibilityController.getLatestEligibilityResult
);

// -------------------------------------------------------------
// Phase WE-4: Blockchain Eligibility Recording & Verification Routes
// -------------------------------------------------------------

// Record latest calculated eligibility result on blockchain
router.post(
  '/aswesuma/applications/:applicationId/eligibility/blockchain',
  eligibilityBlockchainController.recordEligibilityOnBlockchain
);

// Query blockchain eligibility record for an application
router.get(
  '/aswesuma/applications/:applicationId/eligibility/blockchain',
  eligibilityBlockchainController.getBlockchainRecordByApplicationId
);

// Query specific blockchain record by record ID (e.g. REC-BC-2026-000001)
router.get(
  '/eligibility/blockchain/:recordId',
  eligibilityBlockchainController.getBlockchainRecordById
);

// Cryptographically verify on-chain hash vs off-chain eligibility result
router.get(
  '/aswesuma/applications/:applicationId/eligibility/blockchain/verify',
  eligibilityBlockchainController.verifyBlockchainRecord
);

// -------------------------------------------------------------
// Phase WE-5: Welfare Benefit Lifecycle & Reassessment Routes
// -------------------------------------------------------------

// Reassess existing welfare application
router.post(
  '/aswesuma/applications/:applicationId/reassessment',
  welfareLifecycleController.reassessApplication
);

// Transition benefit lifecycle status (activate, suspend, reactivate, death, terminate)
router.post(
  '/aswesuma/applications/:applicationId/lifecycle',
  welfareLifecycleController.transitionLifecycle
);

// Query active benefit lifecycle state
router.get(
  '/aswesuma/applications/:applicationId/lifecycle',
  welfareLifecycleController.getLifecycleState
);

// Query comprehensive chronological application history & audit trail
router.get(
  '/aswesuma/applications/:applicationId/history',
  welfareLifecycleController.getApplicationHistory
);

// -------------------------------------------------------------
// Phase W4: Elderly Assistance Routes
// -------------------------------------------------------------

// Submit new Elderly Assistance Application
router.post('/elderly/applications', welfareController.createElderlyApplication);

// Query specific Elderly application by Application ID (e.g. ELD-2026-000001)
router.get('/elderly/applications/:applicationId', welfareController.getElderlyApplicationById);

// Query Elderly applications submitted by a verified DID
router.get('/elderly/applications/by-did/:did', welfareController.getElderlyApplicationsByDid);
router.get('/elderly/applications/did/:did', welfareController.getElderlyApplicationsByDid);

// -------------------------------------------------------------
// Phase W5: Disability Assistance Routes
// -------------------------------------------------------------

// Submit new Disability Assistance Application
router.post('/disability/applications', welfareController.createDisabilityApplication);

// Query specific Disability application by Application ID (e.g. DIS-2026-000001)
router.get('/disability/applications/:applicationId', welfareController.getDisabilityApplicationById);

// Query Disability applications submitted by a verified DID
router.get('/disability/applications/by-did/:did', welfareController.getDisabilityApplicationsByDid);
router.get('/disability/applications/did/:did', welfareController.getDisabilityApplicationsByDid);

export default router;
