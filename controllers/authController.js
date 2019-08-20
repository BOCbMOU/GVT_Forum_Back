import jwt from 'jsonwebtoken';
import AppError from '../errors/AppError';
import { BASE_USER_AL, TOKEN_EXPIRES_IN } from '../consts';
import { addUser, getUserByEmail, comparePassword } from '../models/UserModel';

const logger = require('../utils/logger')('logController');

const signUp = async (req, res) => {
  logger.log('debug', 'register: %j', req.body);

  const { username, email, rehashedPassword } = req.body;

  await addUser({
    username,
    email,
    accessLevel: BASE_USER_AL,
    rehashedPassword,
  }).catch(error => {
    throw new AppError(error.message, 400);
  });

  logger.log('info', `Successfully registered: ${username}`);

  res.status(200).send({ payload: { message: 'Successfully registered' } });
};

const signIn = async (req, res) => {
  logger.log('debug', 'logIn: %j', req.body);

  const { email, hashedPassword } = req.body;
  const user = await getUserByEmail(email);

  if (user) {
    const isPasswordsEqual = await comparePassword({
      userPassword: hashedPassword,
      rehashedPassword: user.rehashedPassword,
    });

    if (isPasswordsEqual) {
      const token = jwt.sign({ data: { username: user.username } }, process.env.JWT_SECRET, {
        expiresIn: TOKEN_EXPIRES_IN,
      });

      logger.log('info', `Successfully logged in: ${user.username}`);

      res.status(200).send({ payload: { message: 'Successfully logged in', token } });
    }

    logger.log('debug', 'Login failed: wrong password');
    throw new AppError('Wrong password!', 400);
  } else {
    logger.log('debug', 'Login failed');
    throw new AppError('Wrong user credentials!', 400);
  }
};

export { signUp, signIn };
