import jwt from 'jsonwebtoken';
import AppError from '../errors/AppError';
import { BASE_USER_AL, TOKEN_EXPIRES_IN } from '../consts';
import * as UserModel from '../models/UserModel';
import { hashPassword, comparePasswords } from '../utils/cryptPassword';

const logger = require('../utils/logger')('logController');

const signUp = async (req, res, next) => {
  try {
    const { user } = req.body;
    logger.log('debug', 'signUp: %j', user.username);

    const { username, email, password } = user;
    if (
      !(username && email && password) ||
      username.length < 4 ||
      email.indexOf('@') === -1 ||
      password.length < 8
    ) {
      res.status(400).send({ error: 'Not valid data!' });
      return;
    }

    await UserModel.addUser({
      username,
      email,
      accessLevel: BASE_USER_AL,
      rehashedPassword: await hashPassword(password),
    });

    logger.log('info', `Successfully registered: ${username}`);

    res.status(201).send({ payload: { user: username } });
  } catch (err) {
    next(new AppError(err.message, 400));
  }
};

const signIn = async (req, res, next) => {
  try {
    logger.log('debug', 'signIn: %j', req.body);

    const { email, password } = req.body;
    const user = await UserModel.getUserByEmail(email);

    if (user) {
      const isPasswordsEqual = await comparePasswords(password, user.rehashedPassword);

      if (isPasswordsEqual) {
        const token = jwt.sign({ data: { username: user.username } }, process.env.JWT_SECRET, {
          expiresIn: TOKEN_EXPIRES_IN,
        });

        logger.log('info', `Successfully logged in: ${user.username}`);

        res.status(200).send({ payload: { user: { token, settings: user.settings } } });
        return;
      }

      logger.log('debug', 'Login failed: wrong password');
      res.status(400).send({ error: 'Wrong user credentials!' });
    } else {
      logger.log('debug', 'Login failed');
      res.status(400).send({ error: 'Wrong user credentials!' });
    }
  } catch (err) {
    next(new AppError(err.message, 400));
  }
};

export { signUp, signIn };
