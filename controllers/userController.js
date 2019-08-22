import { hash } from 'bcrypt';
import * as UserModel from '../models/UserModel';
import { ADMIN_AL, SUPER_AL, UNAUTHORIZED_USER_AL } from '../consts';
import convertPage from '../utils/convertPage';
import AppError from '../errors/AppError';

const logger = require('../utils/logger')('logController');

const updateSelfSettings = async (req, res, next) => {
  try {
    const { user, body } = req;
    const { avatar = user.avatar, settings = user.settings } = body;

    logger.log('info', 'updateSelfSettings: %j', { user: user.username });

    const updatedUser = await UserModel.updateUser(user.username, { avatar, settings });

    res.status(202).send({ payload: { user: { username: updatedUser.username } } });
  } catch (err) {
    next(new AppError(err.message, 400));
  }
};

const updateSelfPassword = async (req, res, next) => {
  try {
    const { user, body } = req;
    const { oldPassword, newPassword } = body;

    logger.log('info', 'updateSelfPassword: %j', { user: user.username });

    if (oldPassword === newPassword) {
      res.status(400).send({ error: 'New password is equal to old password!' });
      return;
    }

    if (!newPassword) {
      res.status(400).send({ error: 'Wrong new password!' });
      return;
    }

    const isPasswordsEqual = await UserModel.comparePassword({
      userPassword: oldPassword,
      rehashedPassword: user.rehashedPassword,
    });

    if (!isPasswordsEqual) {
      res.status(400).send({ error: 'Wrong password!' });
      return;
    }

    // Didn't find a way to do it in "pre" in UserModel
    const rehashedPassword = await hash(
      newPassword,
      parseInt(process.env.PASSWORD_HASHING_ROUNDS, 10),
    );

    const updatedUser = await UserModel.updateUser(user.username, { rehashedPassword });

    res.status(202).send({ payload: { user: { username: updatedUser.username } } });
  } catch (err) {
    next(new AppError(err.message, 400));
  }
};

const updateUserByName = async (req, res, next) => {
  try {
    const { user, body, params } = req;
    const { user: userUpdate } = body;
    const { username } = params;

    logger.log('info', 'updateSelfSettings: %j', { username, user: user.username });

    const userToUpdate = await UserModel.getUserByName(username);

    if (!userToUpdate) {
      res.status(404).send({ error: 'No such user!' });
      return;
    }

    const { email, accessLevel, avatar, newPassword, settings } = userUpdate;
    const correctUserUpdate = {
      email,
      accessLevel,
      avatar,
      rehashedPassword: newPassword,
      settings,
    };

    if (
      user.accessLevel > SUPER_AL ||
      user.accessLevel >= userToUpdate.accessLevel ||
      user.accessLevel > accessLevel
    ) {
      res.status(403).send({ error: 'Low access level!' });
      return;
    }

    if (email && (await UserModel.getUserByEmail(email))) {
      res.status(404).send({ error: 'Email already in use!' });
      return;
    }

    if (newPassword) {
      correctUserUpdate.rehashedPassword = await hash(
        newPassword,
        parseInt(process.env.PASSWORD_HASHING_ROUNDS, 10),
      );
    }

    Object.entries(correctUserUpdate).forEach(([key, value]) => {
      if (!value) {
        delete correctUserUpdate[key];
      }
    });

    const updatedUser = await UserModel.updateUser(username, correctUserUpdate);

    res.status(202).send({ payload: { user: { username: updatedUser.username } } });
  } catch (err) {
    next(new AppError(err.message, 400));
  }
};

const getSelf = async (req, res) => {
  const { user } = req;

  logger.log('info', 'getSelf: %j', { user: user.username });

  if (user.accessLevel === UNAUTHORIZED_USER_AL) {
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
      res.status(404).send({ error: 'No such user' });
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

    const { username, avatar, createdAt } = user;

    res.status(200).send({ payload: { user: { username, avatar, createdAt } } });
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

export {
  updateSelfSettings,
  updateSelfPassword,
  updateUserByName,
  getSelf,
  getUserByName,
  getUserByEmail,
  getFullUserInfo,
  getUsersByAccessLevel,
};
