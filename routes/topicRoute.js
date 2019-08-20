import express from 'express';

import asyncMiddleware from '../middlewares/asyncMiddleware';
import { getTopicById } from '../controllers/topicController';
import {
  addComment,
  getTopCommentByTopicId,
  getCommentsByTopicId,
} from '../controllers/commentController';

const router = express.Router();

router.post('/:topicId/comments', asyncMiddleware(addComment));

router.get('/:topicId', asyncMiddleware(getTopicById));
router.get('/:topicId/top', asyncMiddleware(getTopCommentByTopicId));
router.get('/:topicId/comments', asyncMiddleware(getCommentsByTopicId));

export default router;
