import express from 'express';

import asyncMiddleware from '../middlewares/asyncMiddleware';
import {
  addCategory,
  updateCategory,
  getCategoryById,
  getTopCategories,
  getCategoryChildren,
} from '../controllers/categoryController';
import { addTopic, getTopicsByCategoryId } from '../controllers/topicController';

const router = express.Router();

router.post('/', asyncMiddleware(addCategory));
router.post('/:categoryId', asyncMiddleware(addTopic));

router.put('/:categoryId', asyncMiddleware(updateCategory));

router.get('/page_:page', asyncMiddleware(getTopCategories));
router.get('/:categoryId', asyncMiddleware(getCategoryById));
router.get('/:categoryId/children/page_:page', asyncMiddleware(getCategoryChildren));
router.get('/:categoryId/topics/page_:page', asyncMiddleware(getTopicsByCategoryId));

export default router;
