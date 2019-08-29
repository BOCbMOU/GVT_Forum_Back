import fs from 'fs';
import mkdirp from 'mkdirp-promise';
import sharp from 'sharp';
import AppError from '../errors/AppError';
import { BASE_USER_AL, AVATAR_SIZE } from '../consts';

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
      } else {
        // is already null
        return;
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

    if (user.avatar) {
      await fs.unlink(`${__dirname}/..${user.avatar}`, err =>
        err ? logger.log('warn', 'Error on avatar delete: %j', { code: err.code }) : true,
      );
    }

    let filePath = `/${process.env.PUBLIC_UPLOAD_FOLDER}/${user.username}`;
    await mkdirp(`${__dirname}/..${filePath}`);
    filePath += '/avatar.jpeg';

    sharp(avatar.data)
      .resize(AVATAR_SIZE, AVATAR_SIZE)
      .jpeg({ quality: 70 })
      .toFile(`${__dirname}/..${filePath}`);

    req.avatar = filePath;
    next();
  } catch (err) {
    next(new AppError(err.message, 400));
  }
};

// eslint-disable-next-line import/prefer-default-export
export { uploadAvatar };
