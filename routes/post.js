import express from 'express';

import asyncMiddleware from '../middlewares/asyncMiddleware';
import { addPost, getPostById, getPosts } from '../controllers/postController';
import { addPostComments, getPostComments } from '../controllers/commentController';

const router = express.Router();

router.post('', asyncMiddleware(addPost));
router.get('/:postID', asyncMiddleware(getPostById));
router.get('/:postID/comments', asyncMiddleware(getPostComments));
router.post('/:postID/comments', asyncMiddleware(addPostComments));

export default router;
