import express from 'express';

import asyncMiddleware from '../middlewares/asyncMiddleware';
import {
  getSelf,
  getUserByName,
  getFullUserInfo,
  getUsersByAccessLevel,
} from '../controllers/userController';
import { getTopicsByUser } from '../controllers/topicController';
import { getCommentsByUser } from '../controllers/commentController';

const router = express.Router();

router.get('/me', asyncMiddleware(getSelf));
router.get('/:username', asyncMiddleware(getUserByName));
router.get('/:username/full-info', asyncMiddleware(getFullUserInfo));
router.get('/:username/topics/page_:page', asyncMiddleware(getTopicsByUser));
router.get('/:username/comments/page_:page', asyncMiddleware(getCommentsByUser));
router.get('/:accessLevel/page_:page', asyncMiddleware(getUsersByAccessLevel));

export default router;
