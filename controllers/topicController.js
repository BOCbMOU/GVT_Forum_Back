import * as TopicModel from '../models/TopicModel';
import { SUPER_AL, ADD_TOPIC_AL } from '../consts';
import convertPage from '../utils//convertPage';
import AppError from '../errors/AppError';
import { addComment } from '../models/CommentModel';

const logger = require('../utils/logger')('logController');

const addTopic = async (req, res, next) => {
  try {
    const { user, body, params } = req;
    const { categoryId } = params;

    logger.log('info', 'addTopic: %j', { categoryId, user: user.username });

    if (user.accessLevel > ADD_TOPIC_AL) {
      res.status(403).send('Low access level!');
      return;
    }

    const { username } = user;
    const { title, message, viewAccessLevel = SUPER_AL } = body;

    if (!(title && message && categoryId)) {
      res.status(400).send('No data provided!');
      return;
    }

    const topic = await TopicModel.addTopic({ title, username, categoryId, viewAccessLevel });

    const comment = await addComment({
      message,
      username,
      topicId: topic._id,
      viewAccessLevel,
    });

    res.status(201).send({ payload: { topic, comment } });
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

    const topics = await TopicModel.getTopicsByUser(
      username,
      user.accessLevel,
      convertPage(page, user),
    );

    res.status(200).send({ payload: { topics } });
  } catch (err) {
    next(new AppError(err.message, 400));
  }
};

const getTopicsByCategoryId = async (req, res, next) => {
  try {
    const { user, params } = req;
    const { categoryId, page } = params;

    logger.log('info', 'getTopicsByCategoryId: %j', { categoryId, user: user.username });

    const topics = await TopicModel.getTopicsByCategoryId(
      categoryId,
      user.accessLevel,
      convertPage(page, user),
    );

    res.status(200).send({ payload: { topics } });
  } catch (err) {
    next(new AppError(err.message, 400));
  }
};

export { addTopic, getTopicById, getTopicsByUser, getTopicsByCategoryId };
