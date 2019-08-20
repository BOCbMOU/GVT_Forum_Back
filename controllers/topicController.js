import * as TopicModel from '../models/TopicModel';
import { SUPER_AL, ADD_TOPIC_AL } from '../consts';
import AppError from '../errors/AppError';

const logger = require('../utils/logger')('logController');

const addTopic = async (req, res, next) => {
  try {
    const { user, body, params } = req;
    const { categoryId } = params;

    logger.log('info', 'addTopic: %j', { body, categoryId, user });

    if (user.accessLevel > ADD_TOPIC_AL) {
      res.status(403).send('Low access level!');
      return;
    }

    const { username } = user;
    const { title, viewAccessLevel = SUPER_AL } = body;

    if (!(title && categoryId)) {
      res.status(400).send('No data provided!');
      return;
    }

    const topic = await TopicModel.addTopic({ title, username, categoryId, viewAccessLevel });

    // TODO: add topic top comment

    res.status(200).send({ payload: { topic } });
  } catch (err) {
    next(new AppError(err.message, 400));
  }
};

const getTopicById = async (req, res, next) => {
  try {
    const { user, body } = req;

    logger.log('info', 'getTopicById: %j', { body, user });

    const { _id } = body;
    const topic = await TopicModel.getTopicById(_id, user.accessLevel);

    res.status(200).send({ payload: { topic } });
  } catch (err) {
    next(new AppError(err.message, 400));
  }
};

const getTopicsByUser = async (req, res, next) => {
  try {
    const { user, body, params } = req;
    const { username } = params;

    logger.log('info', 'getTopicsByUser: %j', { body, user });

    const { accessLevel } = user;
    const { page } = body;
    const { skip = 0, limit = 20 } = page;
    const topics = await TopicModel.getTopicsByUser(username, accessLevel, { skip, limit });

    res.status(200).send({ payload: { topics } });
  } catch (err) {
    next(new AppError(err.message, 400));
  }
};

const getTopicsByCategoryId = async (req, res, next) => {
  try {
    const { user, body, params } = req;
    const { categoryId } = params;

    logger.log('info', 'getTopicsByCategoryId: %j', { categoryId, user });

    const { page } = body;
    const { skip = 0, limit = 20 } = page;
    const topics = await TopicModel.getTopicsByCategoryId(categoryId, user.accessLevel, {
      skip,
      limit,
    });

    res.status(200).send({ payload: { topics } });
  } catch (err) {
    next(new AppError(err.message, 400));
  }
};

export { addTopic, getTopicById, getTopicsByUser, getTopicsByCategoryId };
