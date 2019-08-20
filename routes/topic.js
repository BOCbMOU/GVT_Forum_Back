import express from 'express';

import asyncMiddleware from '../middlewares/asyncMiddleware';
import { getTopicById } from '../controllers/topicController';
import {
  addComment,
  getTopCommentByTopicId,
  getCommentsByTopicId,
} from '../controllers/commentController';

const router = express.Router();

router.post('/:topicID/comments', asyncMiddleware(addComment));

router.get('/:topicID', asyncMiddleware(getTopicById));
router.get('/:topicID/top', asyncMiddleware(getTopCommentByTopicId));
router.get('/:topicID/comments', asyncMiddleware(getCommentsByTopicId));

export default router;
