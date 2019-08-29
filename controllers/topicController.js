import * as TopicModel from '../models/TopicModel';
import { getCategoryById as CCGetCategoryById } from '../models/CategoryModel';
import {
  getTopCommentByTopicId as CMGetTopCommentByTopicId,
  addComment as CMAddComment,
  updateComment as CMUpdateComment,
} from '../models/CommentModel';
import { ADD_TOPIC_AL, MODERATOR_AL, DEF_PAGE_SIZE } from '../consts';
import convertPage from '../utils//convertPage';
import AppError from '../errors/AppError';

const logger = require('../utils/logger')('logController');

const addTopic = async (req, res, next) => {
  try {
    const { user, body, params } = req;
    const { username } = user;
    const { categoryId } = params;

    logger.log('info', 'addTopic: %j', { categoryId, user: username });

    if (user.accessLevel > ADD_TOPIC_AL) {
      res.status(403).send({ error: 'Low access level!' });
      return;
    }

    const { topic } = body;
    const { title, message, viewAccessLevel = user.accessLevel } = topic;

    if (!(title && message && categoryId)) {
      res.status(400).send({ error: 'No data provided!' });
      return;
    }

    const category = await CCGetCategoryById(categoryId, user.accessLevel);
    if (!category) {
      res.status(404).send({ error: 'Unknown category!' });
      return;
    }

    const correctAccessLevel = Math.max(viewAccessLevel, user.accessLevel);
    const addedTopic = await TopicModel.addTopic({
      title,
      username,
      categoryId,
      viewAccessLevel: correctAccessLevel,
    });

    const addedComment = await CMAddComment({
      message,
      username,
      // eslint-disable-next-line no-underscore-dangle
      topicId: addedTopic._id,
      viewAccessLevel: correctAccessLevel,
    });

    res.status(201).send({ payload: { topic: addedTopic, comment: addedComment } });
  } catch (err) {
    next(new AppError(err.message, 400));
  }
};

const updateTopic = async (req, res, next) => {
  try {
    const { user, body, params } = req;
    const { topicId } = params;

    logger.log('info', 'updateTopic: %j', { topicId, user: user.username });

    if (user.accessLevel > ADD_TOPIC_AL) {
      res.status(403).send({ error: 'Low access level!' });
      return;
    }

    const oldTopic = await TopicModel.getTopicById(topicId, user.accessLevel);

    if (!oldTopic) {
      res.status(404).send({ error: 'Unknown topic!' });
      return;
    }
    if (oldTopic.username !== user.username && user.accessLevel > MODERATOR_AL) {
      res.status(403).send({ error: 'Low access level!' });
      return;
    }

    const oldComment = await CMGetTopCommentByTopicId(topicId, user.accessLevel);

    const { topic } = body;
    const {
      title = oldTopic.title,
      message = oldComment.message,
      categoryId = oldTopic.categoryId,
      viewAccessLevel = oldTopic.viewAccessLevel,
    } = topic;

    const category = await CCGetCategoryById(categoryId, user.accessLevel);
    if (!category) {
      res.status(404).send({ error: 'Unknown category!' });
      return;
    }

    const correctAccessLevel = Math.min(viewAccessLevel, category.viewAccessLevel);
    const updatedTopic = await TopicModel.updateTopic(topicId, {
      title,
      categoryId: user.accessLevel > MODERATOR_AL ? oldTopic.categoryId : categoryId,
      viewAccessLevel: correctAccessLevel,
    });

    // eslint-disable-next-line no-underscore-dangle
    const updatedComment = await CMUpdateComment(oldComment._id, {
      message,
      viewAccessLevel: correctAccessLevel,
    });

    res.status(202).send({ payload: { topic: updatedTopic, comment: updatedComment } });
  } catch (err) {
    next(new AppError(err.message, 400));
  }
};

const getTopicById = async (req, res, next) => {
  try {
    const { user, params } = req;
    const { topicId } = params;

    logger.log('info', 'getTopicById: %j', { topicId, user: user.username });

    const topic = await TopicModel.getTopicById(topicId, user.accessLevel);

    res.status(200).send({ payload: { topic } });
  } catch (err) {
    next(new AppError(err.message, 400));
  }
};

const getTopicsByUser = async (req, res, next) => {
  try {
    const { user, params } = req;
    const { username, page } = params;

    logger.log('info', 'getTopicsByUser: %j', { usernameTopics: username, user: user.username });

    const topics = TopicModel.getTopicsByUser(username, user.accessLevel, convertPage(page, user));
    const numberOf = TopicModel.getNumberOfTopicsByUser(username, user.accessLevel);

    res.status(200).send({ payload: { topics: await topics, numberOf: await numberOf } });
  } catch (err) {
    next(new AppError(err.message, 400));
  }
};

const getTopicsByCategoryId = async (req, res, next) => {
  try {
    const { user, params } = req;
    const { categoryId, page } = params;

    logger.log('info', 'getTopicsByCategoryId: %j', { categoryId, user: user.username });

    const topics = TopicModel.getTopicsByCategoryId(
      categoryId,
      user.accessLevel,
      convertPage(page, user),
    );
    const numberOf = await TopicModel.getNumberOfTopicsByCategoryId(categoryId, user.accessLevel);
    const numberOfPages = Math.ceil(numberOf / (user.settings.pageSize || DEF_PAGE_SIZE));

    res.status(200).send({ payload: { topics: await topics, numberOfPages } });
  } catch (err) {
    next(new AppError(err.message, 400));
  }
};

export { addTopic, updateTopic, getTopicById, getTopicsByUser, getTopicsByCategoryId };
