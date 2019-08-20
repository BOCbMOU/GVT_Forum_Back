import * as CommentModel from '../models/CommentModel';
import { SUPER_AL, ADD_COMMENT_AL } from '../consts';
import AppError from '../errors/AppError';

const logger = require('../utils/logger')('logController');

const addComment = async (req, res, next) => {
  try {
    const { user, body } = req;

    logger.log('info', 'addComment: %j', { body, user: user.username });

    if (user.accessLevel > ADD_COMMENT_AL) {
      res.status(403).send('Low access level!');
      return;
    }

    const { username } = user;
    const { message, viewAccessLevel = SUPER_AL } = body;
    const topicId = body.topicId || req.params.topicId;

    if (!(message && topicId)) {
      res.status(400).send('No data provided!');
      return;
    }

    const comment = await CommentModel.addComment({
      message,
      username,
      topicId,
      viewAccessLevel,
    });

    res.status(201).send({ payload: { comment } });
  } catch (err) {
    next(new AppError(err.message, 400));
  }
};

const getCommentById = async (req, res, next) => {
  try {
    const { user, body } = req;

    logger.log('info', 'getCommentById: %j', { body, user: user.username });

    const { _id } = body;
    const comment = await CommentModel.getCommentById(_id, user.accessLevel);

    res.status(200).send({ payload: { comment } });
  } catch (err) {
    next(new AppError(err.message, 400));
  }
};

const getTopCommentByTopicId = async (req, res, next) => {
  try {
    const { user, body, params } = req;
    const { topicId } = params;

    logger.log('info', 'getTopCommentByTopicId: %j', { body, user: user.username });

    const { page = {} } = body;
    const { skip = 0, limit = 20 } = page;
    const comments = await CommentModel.getTopCommentByTopicId(topicId, user.accessLevel, {
      skip,
      limit,
    });

    res.status(200).send({ payload: { comments } });
  } catch (err) {
    next(new AppError(err.message, 400));
  }
};

const getCommentsByTopicId = async (req, res, next) => {
  try {
    const { user, body, params } = req;
    const { topicId } = params;

    logger.log('info', 'getCommentsByTopicId: %j', { topicId, user: user.username });

    const { page = {} } = body;
    const { skip = 0, limit = 20 } = page;
    const comments = await CommentModel.getCommentsByTopicId(topicId, user.accessLevel, {
      skip,
      limit,
    });

    res.status(200).send({ payload: { comments } });
  } catch (err) {
    next(new AppError(err.message, 400));
  }
};

const getCommentsByUser = async (req, res, next) => {
  try {
    const { user, body, params } = req;
    const { username } = params;

    logger.log('info', 'getCommentsByUser: %j', { body, user: user.username });

    const { accessLevel } = user;
    const { page = {} } = body;
    const { skip = 0, limit = 20 } = page;
    const comments = await CommentModel.getCommentsByUser(username, accessLevel, {
      skip,
      limit,
    });

    res.status(200).send({ payload: { comments } });
  } catch (err) {
    next(new AppError(err.message, 400));
  }
};

export {
  addComment,
  getCommentById,
  getTopCommentByTopicId,
  getCommentsByTopicId,
  getCommentsByUser,
};
