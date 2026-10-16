import { Router } from 'express';
import {
  getVerificationById,
  submitFaceEvidence,
  submitDocumentEvidence,
  getCitizenVerificationStatus,
} from '../controllers/verification.controller';

const router = Router();

router.post('/:verificationId/face', submitFaceEvidence);
router.post('/:verificationId/document', submitDocumentEvidence);
router.get('/:verificationId/status', getCitizenVerificationStatus);
router.get('/:verificationId', getVerificationById);

export default router;
