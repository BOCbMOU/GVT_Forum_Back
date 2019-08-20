import * as CommentModel from '../models/CommentModel';
import { SUPER_AL, ADD_COMMENT_AL } from '../consts';
import AppError from '../errors/AppError';

const logger = require('../utils/logger')('logController');

const addComment = async (req, res, next) => {
  try {
    const { user, body } = req;

    logger.log('info', 'addComment: %j', { body, user });

    if (user.accessLevel > ADD_COMMENT_AL) {
      res.status(403).send('Low access level!');
      return;
    }

    const { username } = user;
    const { message, topicId, viewAccessLevel = SUPER_AL } = body;

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

    res.status(200).send({ payload: { comment } });
  } catch (err) {
    next(new AppError(err.message, 400));
  }
};

const getCommentById = async (req, res, next) => {
  try {
    const { user, body } = req;

    logger.log('info', 'getCommentById: %j', { body, user });

    const { _id } = body;
    const comment = await CommentModel.getCommentById(_id, user.accessLevel);

    res.status(200).send({ payload: { comment } });
  } catch (err) {
    next(new AppError(err.message, 400));
  }
};

const getTopCommentByTopic = async (req, res, next) => {
  try {
    const { user, body } = req;

    logger.log('info', 'getTopCommentByTopic: %j', { body, user });

    const { topicId, page } = body;
    const { skip, limit } = page;
    const comments = await CommentModel.getTopCommentByTopic(topicId, user.accessLevel, {
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
    const { user, body } = req;

    logger.log('info', 'getCommentsByTopicId: %j', { body, user });

    const { topicId, page } = body;
    const { skip, limit } = page;
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
    const { user, body } = req;

    logger.log('info', 'getCommentsByUser: %j', { body, user });

    const { username, accessLevel } = user;
    const { page } = body;
    const { skip, limit } = page;
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
  getTopCommentByTopic,
  getCommentsByTopicId,
  getCommentsByUser,
};
