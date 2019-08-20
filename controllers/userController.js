import * as UserModel from '../models/UserModel';
import AppError from '../errors/AppError';

const logger = require('../utils/logger')('logController');

const getSelf = async (req, res) => {
  logger.log('debug', 'logIn: %j', req.body);
  const { user } = req;
  const { _id, username, email, createdAt } = user;

  res.status(200).send({ payload: { _id, email, username, createdAt } });
};

const getUserByName = async (req, res, next) => {
  try {
    const { username } = req.params;

    logger.log('info', 'getUserByName: %j', { username });

    const user = await UserModel.getUserByName(username);

    res.status(200).send({ payload: { user } });
  } catch (err) {
    next(new AppError(err.message, 400));
  }
};

const getUserByEmail = async (req, res, next) => {
  try {
    const { body } = req;

    logger.log('info', 'getUserByEmail: %j', { body });

    const { email } = body;
    const user = await UserModel.getUserByEmail(email);

    res.status(200).send({ payload: { user } });
  } catch (err) {
    next(new AppError(err.message, 400));
  }
};

const getUsersByAccessLevel = async (req, res, next) => {
  try {
    const { body, params } = req;
    const { accessLevel } = params;

    logger.log('info', 'getUsersByAccessLevel: %j', { body });

    const { page } = body;
    const { skip = 0, limit = 20 } = page;
    const user = await UserModel.getUsersByAccessLevel(accessLevel, {
      skip,
      limit,
    });

    res.status(200).send({ payload: { user } });
  } catch (err) {
    next(new AppError(err.message, 400));
  }
};

export { getSelf, getUserByName, getUserByEmail, getUsersByAccessLevel };
