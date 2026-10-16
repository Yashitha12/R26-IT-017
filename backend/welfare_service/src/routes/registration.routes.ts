import { Router } from 'express';
import {
  getRegistrationByUserId,
  createRegistration,
} from '../controllers/registration.controller';

const router = Router();

router.post('/', createRegistration);
router.get('/:userId', getRegistrationByUserId);

export default router;
