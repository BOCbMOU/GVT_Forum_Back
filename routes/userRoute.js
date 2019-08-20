import express from 'express';

import asyncMiddleware from '../middlewares/asyncMiddleware';
import { getSelf, getUserByName, getUsersByAccessLevel } from '../controllers/userController';
import { getTopicsByUser } from '../controllers/topicController';
import { getCommentsByUser } from '../controllers/commentController';

const router = express.Router();

router.get('/me', asyncMiddleware(getSelf));
router.get('/:username', asyncMiddleware(getUserByName));
router.get('/:username/topics', asyncMiddleware(getTopicsByUser));
router.get('/:username/comments', asyncMiddleware(getCommentsByUser));
router.get('/:accessLevel', asyncMiddleware(getUsersByAccessLevel));

export default router;
