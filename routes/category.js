import express from 'express';

import asyncMiddleware from '../middlewares/asyncMiddleware';

const router = express.Router();

router.get('', asyncMiddleware());
router.post('', asyncMiddleware());
router.get('/:categoryId', asyncMiddleware());
router.get('/:categoryId/posts', asyncMiddleware());

export default router;
