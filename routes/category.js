import express from 'express';

import asyncMiddleware from '../middlewares/asyncMiddleware';
import {
  addCategory,
  getCategoryById,
  getTopCategories,
  getCategoryChildren,
} from '../controllers/categoryController';
import { addTopic, getTopicsByCategoryId } from '../controllers/topicController';

const router = express.Router();

router.post('', asyncMiddleware(addCategory));
router.post('/:categoryId', asyncMiddleware(addTopic));

router.get('', asyncMiddleware(getTopCategories));
router.get('/:categoryId', asyncMiddleware(getCategoryById));
router.get('/:categoryId/children', asyncMiddleware(getCategoryChildren));
router.get('/:categoryId/topics', asyncMiddleware(getTopicsByCategoryId));

export default router;
