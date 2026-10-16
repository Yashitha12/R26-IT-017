import { Router } from 'express';
import {
  getIdentityByDid,
  getIdentityByUserId,
  applyForIdentity,
  getApplicationByUserId,
} from '../controllers/identity.controller';

const router = Router();

// Citizen starts Digital Identity application (Pending KYC state - NO DID issued yet)
router.post('/', applyForIdentity);
router.post('/apply', applyForIdentity);

// Query issued identity (only returns 200 after officer approval, else 404)
router.get('/user/:userId', getIdentityByUserId);
router.get('/application/:userId', getApplicationByUserId);
router.get('/:did', getIdentityByDid);

export default router;
