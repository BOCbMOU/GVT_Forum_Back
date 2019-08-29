import * as CommentModel from '../models/CommentModel';
import { getTopicById as TMGetTopicById } from '../models/TopicModel';
import { ADD_COMMENT_AL, MODERATOR_AL, DEF_PAGE_SIZE } from '../consts';
import convertPage from '../utils/convertPage';
import AppError from '../errors/AppError';

const logger = require('../utils/logger')('logController');

const addComment = async (req, res, next) => {
  try {
    const { user, body, params } = req;
    const { topicId } = params;

    logger.log('info', 'addComment: %j', { topicId, user: user.username });

    if (user.accessLevel > ADD_COMMENT_AL) {
      res.status(403).send('Low access level!');
      return;
    }

    const { username } = user;
    const { comment } = body;
    const { message, viewAccessLevel = user.accessLevel } = comment;

    if (!(message && topicId)) {
      res.status(400).send('No data provided!');
      return;
    }

    const topic = await TMGetTopicById(topicId, user.accessLevel);
    if (!topic) {
      res.status(404).send('Unknown comment!');
      return;
    }

    const correctAccessLevel = Math.min(viewAccessLevel, topic.viewAccessLevel);
    const addedComment = await CommentModel.addComment({
      message,
      username,
      topicId,
      viewAccessLevel: correctAccessLevel,
    });

    res.status(201).send({ payload: { comment: addedComment } });
  } catch (err) {
    next(new AppError(err.message, 400));
  }
};

const updateComment = async (req, res, next) => {
  try {
    const { user, body, params } = req;
    const { commentId } = params;

    logger.log('info', 'updateComment: %j', { commentId, user: user.username });

    if (user.accessLevel > ADD_COMMENT_AL) {
      res.status(403).send('Low access level!');
      return;
    }

    const oldComment = await CommentModel.getCommentById(commentId, user.accessLevel);

    if (!oldComment) {
      res.status(404).send({ error: 'Unknown comment!' });
      return;
    }
    if (oldComment.username !== user.username && user.accessLevel > MODERATOR_AL) {
      res.status(403).send({ error: 'Low access level!' });
      return;
    }

    const { comment } = body;
    const {
      message = oldComment.message,
      viewAccessLevel = oldComment.viewAccessLevel,
      topicId = oldComment.topicId,
    } = comment;

    const topic = await TMGetTopicById(topicId, user.accessLevel);
    if (!topic) {
      res.status(404).send('Unknown comment!');
      return;
    }

    const correctAccessLevel = Math.min(viewAccessLevel, topic.viewAccessLevel);
    const updatedComment = await CommentModel.updateComment(commentId, {
      message,
      topicId: user.accessLevel > MODERATOR_AL ? oldComment.topicId : topicId,
      viewAccessLevel: correctAccessLevel,
    });

    res.status(202).send({ payload: { comment: updatedComment } });
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

    const comments = CommentModel.getCommentsByTopicId(
      topicId,
      user.accessLevel,
      convertPage(page, user),
    );
    const numberOf = await CommentModel.getNumberOfCommentsByTopicId(topicId, user.accessLevel);
    const numberOfPages = Math.ceil(numberOf / (user.settings.pageSize || DEF_PAGE_SIZE));

    res.status(200).send({ payload: { comments: await comments, numberOfPages } });
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
  updateComment,
  getCommentById,
  getTopCommentByTopicId,
  getCommentsByTopicId,
  getCommentsByUser,
};
