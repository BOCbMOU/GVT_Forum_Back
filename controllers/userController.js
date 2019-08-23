import * as UserModel from '../models/UserModel';
import { ADMIN_AL, SUPER_AL, UNAUTHORIZED_USER_AL } from '../consts';
import convertPage from '../utils/convertPage';
import { hashPassword, comparePasswords } from '../utils/cryptPassword';
import AppError from '../errors/AppError';

const logger = require('../utils/logger')('logController');

const updateSelfSettings = async (req, res, next) => {
  try {
    const { user, body } = req;
    const { user: userUpdate } = body;
    const { settings = user.settings } = userUpdate;

    logger.log('info', 'updateSelfSettings: %j', { user: user.username });

    if (user.accessLevel >= UNAUTHORIZED_USER_AL) {
      res.status(403).send({ error: 'Low access level!' });
      return;
    }

    const updatedUser = await UserModel.updateUser(user.username, { settings });

    res.status(202).send({ payload: { user: { username: updatedUser.username, settings } } });
  } catch (err) {
    next(new AppError(err.message, 400));
  }
};

const updateSelfAvatar = async (req, res, next) => {
  try {
    const { user, avatar = user.avatar } = req;

    logger.log('info', 'updateSelfAvatar: %j', { user: user.username });

    const updatedUser = await UserModel.updateUser(user.username, { avatar });

    res.status(202).send({ payload: { user: { username: updatedUser.username, avatar } } });
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

    const isPasswordsEqual = await comparePasswords(oldPassword, user.rehashedPassword);

    if (!isPasswordsEqual) {
      res.status(400).send({ error: 'Wrong password!' });
      return;
    }

    const rehashedPassword = await hashPassword(newPassword);

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
      correctUserUpdate.rehashedPassword = await hashPassword(newPassword);
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

    const { avatar, accessLevel, createdAt } = user;

    res.status(200).send({ payload: { user: { username, avatar, accessLevel, createdAt } } });
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

    const { username, avatar, accessLevel, createdAt } = user;

    res.status(200).send({ payload: { user: { username, avatar, accessLevel, createdAt } } });
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
      return { username, avatar, accessLevel, createdAt };
    });

    res.status(200).send({ payload: { users: usersRes } });
  } catch (err) {
    next(new AppError(err.message, 400));
  }
};

export {
  updateSelfSettings,
  updateSelfAvatar,
  updateSelfPassword,
  updateUserByName,
  getSelf,
  getUserByName,
  getUserByEmail,
  getFullUserInfo,
  getUsersByAccessLevel,
};
