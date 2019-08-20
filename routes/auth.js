import express from 'express';

import asyncMiddleware from '../middlewares/asyncMiddleware';
import { signUp, signIn } from '../controllers/authController';

const router = express.Router();

router.post('/sign-up', asyncMiddleware(signUp));
router.post('/sign-in', asyncMiddleware(signIn));

export default router;
