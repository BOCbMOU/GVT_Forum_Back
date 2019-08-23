import fs from 'fs';
import AppError from '../errors/AppError';
import { BASE_USER_AL } from '../consts';

const logger = require('../utils/logger')('logController');

const uploadAvatar = async (req, res, next) => {
  try {
    const { user } = req;

    logger.log('info', 'saveAvatar: %j', { user: user.username });

    if (!req.files) {
      if (user.avatar) {
        fs.unlink(`${__dirname}/..${user.avatar}`, err =>
          err ? logger.log('warn', 'Error on avatar delete: %j', { err }) : true,
        );
      }
      req.avatar = null;
      next();
      return;
    }

    const { avatar } = req.files;
    if (user.accessLevel > BASE_USER_AL) {
      next(new AppError('Low access level!', 403));
      return;
    }

    const type = avatar.mimetype.split('/');
    if (type[0] !== 'image') {
      next(new AppError('Wrong file type!', 400));
      return;
    }

    let ext = avatar.name.split('.');
    ext = (ext.length > 1 ? ext : type).pop();

    if (user.avatar) {
      await fs.unlink(`${__dirname}/..${user.avatar}`, err =>
        err ? logger.log('warn', 'Error on avatar delete: %j', { err }) : true,
      );
    }

    const filePath = `/public/${user.username}/avatar.${ext}`;

    avatar.mv(`${__dirname}/..${filePath}`);

    req.avatar = filePath;
    next();
  } catch (err) {
    next(new AppError(err.message, 400));
  }
};

// eslint-disable-next-line import/prefer-default-export
export { uploadAvatar };
