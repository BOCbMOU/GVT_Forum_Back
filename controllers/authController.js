import jwt from 'jsonwebtoken';
import AppError from '../errors/AppError';
import { BASE_USER_AL, TOKEN_EXPIRES_IN } from '../consts';
import * as UserModel from '../models/UserModel';
import { hashPassword, comparePasswords } from '../utils/cryptPassword';

const logger = require('../utils/logger')('logController');

const signUp = async (req, res) => {
  logger.log('debug', 'register: %j', req.body);

  const { username, email, password } = req.body;

  await UserModel.addUser({
    username,
    email,
    accessLevel: BASE_USER_AL,
    rehashedPassword: await hashPassword(password),
  }).catch(error => {
    throw new AppError(error.message, 400);
  });

  logger.log('info', `Successfully registered: ${username}`);

  res.status(200).send({ payload: { message: 'Successfully registered' } });
};

const signIn = async (req, res) => {
  logger.log('debug', 'logIn: %j', req.body);

  const { email, password } = req.body;
  const user = await UserModel.getUserByEmail(email);

  if (user) {
    const isPasswordsEqual = await comparePasswords(password, user.rehashedPassword);

    if (isPasswordsEqual) {
      const token = jwt.sign({ data: { username: user.username } }, process.env.JWT_SECRET, {
        expiresIn: TOKEN_EXPIRES_IN,
      });

      logger.log('info', `Successfully logged in: ${user.username}`);

      res.status(200).send({ payload: { message: 'Successfully logged in', token } });
      return;
    }

    logger.log('debug', 'Login failed: wrong password');
    res.status(400).send({ error: 'Wrong user credentials!' });
  } else {
    logger.log('debug', 'Login failed');
    throw new AppError('Wrong user credentials!', 400);
  }
};

export { signUp, signIn };
