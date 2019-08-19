import express from 'express';

import asyncMiddleware from '../middlewares/asyncMiddleware';
import { getSelf } from '../controllers/userController';

const router = express.Router();

router.get('/self', asyncMiddleware(getSelf));

export default router;
