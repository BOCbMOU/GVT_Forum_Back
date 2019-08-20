import jwt from 'jsonwebtoken';
import AuthError from '../errors/AuthError';
import { getUserByName } from '../models/UserModel';

const logger = require('../utils/logger')('authenticate');

const jwtVerify = token =>
  new Promise(resolve => {
    jwt.verify(token, process.env.JWT_SECRET, (error, decodedToken) => {
      resolve(decodedToken);
    });
  });

const authenticate = async (req, res, next) => {
  const { authorization } = req.headers;
  let token;
  if (authorization) {
    [, token] = authorization.split(' ');
  }

  if (!token) {
    return next(new AuthError('No token provided'));
  }

  // TODO: do unauthorized access

  const decodedToken = await jwtVerify(token);

  if (!(decodedToken && decodedToken.data && decodedToken.data.username)) {
    return next(new AuthError('Session ended'));
  }

  const { username } = decodedToken.data;
  const user = await getUserByName(username);
  if (!user) {
    return next(new AuthError('No such user'));
  }

  logger.log('debug', `${username} was successfully authenticated`);
  req.user = user;

  return next();
};

export default authenticate;
