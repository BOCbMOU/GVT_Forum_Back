import * as CategoryModel from '../models/CategoryModel';
import { WORK_WITH_CATEGORIES_ACCESS_LEVEL } from '../consts';
import AppError from '../errors/AppError';

const logger = require('../utils/logger')('logController');

const addCategory = async (req, res, next) => {
  try {
    const { user, body } = req;

    logger.log('info', 'addCategory: %j', body);

    if (user.accessLevel > WORK_WITH_CATEGORIES_ACCESS_LEVEL) {
      return res.status(403).send('Low access level!');
    }

    const { name, description, parentCategoryId = null } = body;
    const category = await CategoryModel.addCategory({
      name,
      description,
      parentCategoryId,
    });

    res.status(201).send({ payload: { category } });
  } catch (err) {
    next(new AppError(err.message, 400));
  }
};

const getCategoryById = async (req, res, next) => {
  try {
    const { body } = req;

    logger.log('info', 'addCategory: %j', body);

    const { _id } = body;
    const category = await CategoryModel.getCategoryById(_id);

    if (!category) {
      return res.status(404).send('Unknown category!');
    }

    res.status(200).send({ payload: { category } });
  } catch (err) {
    next(new AppError(err.message, 400));
  }
};
const getCategoriesByName = async (req, res, next) => {
  try {
    const { body } = req;

    logger.log('info', 'addCategory: %j', body);

    const { name } = body;
    const categories = await CategoryModel.getCategoriesByName(name);

    if (!categories) {
      return res.status(404).send('Unknown category name!');
    }

    res.status(200).send({ payload: { categories } });
  } catch (err) {
    next(new AppError(err.message, 400));
  }
};

const getCategoryChildren = async (req, res, next) => {
  try {
    const { body } = req;

    logger.log('info', 'addCategory: %j', body);

    const { _id } = body;
    const categories = await CategoryModel.getCategoryChildren(_id);

    if (!categories) {
      return res.status(404).send('Unknown category!');
    }

    res.status(200).send({ payload: { categories } });
  } catch (err) {
    next(new AppError(err.message, 400));
  }
};

export { addCategory, getCategoryById, getCategoriesByName, getCategoryChildren };
