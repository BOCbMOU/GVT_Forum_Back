import * as CommentModel from '../models/CommentModel';
import { SUPER_AL, ADD_COMMENT_AL } from '../consts';
import convertPage from '../utils/convertPage';
import AppError from '../errors/AppError';

const logger = require('../utils/logger')('logController');

const addComment = async (req, res, next) => {
  try {
    const { user, body } = req;
    const { topicId } = req.params;

    logger.log('info', 'addComment: %j', { topicId, user: user.username });

    if (user.accessLevel > ADD_COMMENT_AL) {
      res.status(403).send('Low access level!');
      return;
    }

    const { username } = user;
    const { message, viewAccessLevel = SUPER_AL } = body;

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
    const { topicId, page } = params;

    logger.log('info', 'getTopCommentByTopicId: %j', { body, user: user.username });

    const comments = await CommentModel.getTopCommentByTopicId(
      topicId,
      user.accessLevel,
      convertPage(page, user),
    );

    res.status(200).send({ payload: { comments } });
  } catch (err) {
    next(new AppError(err.message, 400));
  }
};

const getCommentsByTopicId = async (req, res, next) => {
  try {
    const { user, params } = req;
    const { topicId, page } = params;

    logger.log('info', 'getCommentsByTopicId: %j', { topicId, user: user.username });

    const comments = await CommentModel.getCommentsByTopicId(
      topicId,
      user.accessLevel,
      convertPage(page, user),
    );

    res.status(200).send({ payload: { comments } });
  } catch (err) {
    next(new AppError(err.message, 400));
  }
};

const getCommentsByUser = async (req, res, next) => {
  try {
    const { user, body, params } = req;
    const { username, page } = params;

    logger.log('info', 'getCommentsByUser: %j', { body, user: user.username });

    const comments = await CommentModel.getCommentsByUser(
      username,
      user.accessLevel,
      convertPage(page, user),
    );

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
