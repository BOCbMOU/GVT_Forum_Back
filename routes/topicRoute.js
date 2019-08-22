import express from 'express';

import asyncMiddleware from '../middlewares/asyncMiddleware';
import { getTopicById, updateTopic } from '../controllers/topicController';
import {
  addComment,
  updateComment,
  getTopCommentByTopicId,
  getCommentsByTopicId,
} from '../controllers/commentController';

const router = express.Router();

router.post('/:topicId/comments', asyncMiddleware(addComment));

router.put('/:topicId', asyncMiddleware(updateTopic));
router.put('/comment/:commentId', asyncMiddleware(updateComment));

router.get('/:topicId', asyncMiddleware(getTopicById));
router.get('/:topicId/top', asyncMiddleware(getTopCommentByTopicId));
router.get('/:topicId/comments/page_:page', asyncMiddleware(getCommentsByTopicId));

export default router;
