import { Router } from 'express';
import { loginOfficer } from '../controllers/officer.auth.controller';

const router = Router();

router.post('/auth/login', loginOfficer);

export default router;
