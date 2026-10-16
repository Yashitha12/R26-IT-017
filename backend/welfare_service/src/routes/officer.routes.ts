import { Router } from 'express';
import { loginOfficer } from '../controllers/officer.auth.controller';
import {
  getPendingKycCases,
  getReviewCaseById,
  recordOfficerDecision,
} from '../controllers/officer.verification.controller';

const router = Router();

// Officer Authentication Routes
router.post('/auth/login', loginOfficer);

// Officer KYC Verification Routes
router.get('/verification/pending', getPendingKycCases);
router.get('/verification/:verificationId/review', getReviewCaseById);
router.post('/verification/:verificationId/decision', recordOfficerDecision);

export default router;
