import * as UserModel from '../models/UserModel';
import { ADMIN_AL } from '../consts';
import convertPage from '../utils/convertPage';
import AppError from '../errors/AppError';

const logger = require('../utils/logger')('logController');

const updateUserSettings = async (req, res, next) => {
  try {
    const { user, body } = req;
    const { avatar = user.avatar, settings } = body;

    // TODO: finish update
  } catch (err) {
    next(new AppError(err.message, 400));
  }
};

const getSelf = async (req, res) => {
  const { user } = req;

  logger.log('debug', 'getSelf: %j', { user: user.username });

  if (user.username === 'UNAUTHORIZED') {
    res.status(403).send({ payload: { user: null } });
    return;
  }

  res.status(200).send({ payload: { user } });
};

const getUserByName = async (req, res, next) => {
  try {
    const { username } = req.params;

    logger.log('info', 'getUserByName: %j', { user: req.user.username });

    const user = await UserModel.getUserByName(username);

    if (!user) {
      res.status(404).send({ payload: { user } });
      return;
    }

    const { avatar, createdAt } = user;

    res.status(200).send({ payload: { user: { username, avatar, createdAt } } });
  } catch (err) {
    next(new AppError(err.message, 400));
  }
};

const getUserByEmail = async (req, res, next) => {
  try {
    const { body } = req;
    const { email } = body;

    logger.log('info', 'getUserByEmail: %j', { email });

    const user = await UserModel.getUserByEmail(email);

    if (!user) {
      res.status(404).send({ payload: { user } });
      return;
    }

    const { username, rehashedPassword } = user;

    res.status(200).send({ payload: { user: { username, rehashedPassword } } });
  } catch (err) {
    next(new AppError(err.message, 400));
  }
};

const getFullUserInfo = async (req, res, next) => {
  try {
    const { user, params } = req;
    const { username } = params;

    logger.log('info', 'getFullUserInfo: %j', { user: user.username });

    if (!user.accessLevel || user.accessLevel > ADMIN_AL) {
      res.status(403).send({ payload: { user: null } });
      return;
    }

    const userInfo = await UserModel.getUserByName(username);

    if (!userInfo) {
      res.status(404).send({ payload: { user: null } });
      return;
    }

    res.status(200).send({ payload: { user: userInfo } });
  } catch (err) {
    next(new AppError(err.message, 400));
  }
};

const getUsersByAccessLevel = async (req, res, next) => {
  try {
    const { user: userReq, params } = req;
    const { accessLevel, page } = params;

    logger.log('info', 'getUsersByAccessLevel: %j', { accessLevel, user: userReq.username });

    const users = await UserModel.getUsersByAccessLevel(accessLevel, convertPage(page, userReq));

    const usersRes = users.map(user => {
      const { username, avatar, createdAt } = user;
      return { username, avatar, createdAt };
    });

    res.status(200).send({ payload: { users: usersRes } });
  } catch (err) {
    next(new AppError(err.message, 400));
  }
};

export { getSelf, getUserByName, getUserByEmail, getFullUserInfo, getUsersByAccessLevel };
