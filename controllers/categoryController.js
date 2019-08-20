import * as CategoryModel from '../models/CategoryModel';
import { SUPER_AL, ADD_CATEGORY_AL } from '../consts';
import AppError from '../errors/AppError';

const logger = require('../utils/logger')('logController');

const addCategory = async (req, res, next) => {
  try {
    const { user, body } = req;

    logger.log('info', 'addCategory: %j', { body, user });

    if (user.accessLevel > ADD_CATEGORY_AL) {
      res.status(403).send('Low access level!');
      return;
    }

    const { name, description = null, viewAccessLevel = SUPER_AL, parentCategoryId = null } = body;

    if (!name) {
      res.status(400).send('No data provided!');
      return;
    }

    const category = await CategoryModel.addCategory({
      name,
      description,
      viewAccessLevel,
      parentCategoryId,
    });

    res.status(201).send({ payload: { category } });
  } catch (err) {
    next(new AppError(err.message, 400));
  }
};

const getCategoryById = async (req, res, next) => {
  try {
    const { user, params } = req;
    const { categoryId } = params;

    logger.log('info', 'getCategoryById: %j', { categoryId, user });

    const category = await CategoryModel.getCategoryById(categoryId, user.accessLevel);

    res.status(200).send({ payload: { category } });
  } catch (err) {
    next(new AppError(err.message, 400));
  }
};

const getTopCategories = async (req, res, next) => {
  try {
    const { user, body } = req;

    logger.log('info', 'getTopCategories: %j', { body, user });

    const { page = {} } = body;
    const { skip = 0, limit = 20 } = page;
    const categories = await CategoryModel.getTopCategories(user.accessLevel, {
      skip,
      limit,
    });

    res.status(200).send({ payload: { categories } });
  } catch (err) {
    next(new AppError(err.message, 400));
  }
};

const getCategoriesByName = async (req, res, next) => {
  try {
    const { user, body } = req;

    logger.log('info', 'getCategoriesByName: %j', { body, user });

    const { name, page = {} } = body;
    const { skip = 0, limit = 20 } = page;
    const categories = await CategoryModel.getCategoriesByName(name, user.accessLevel, {
      skip,
      limit,
    });

    res.status(200).send({ payload: { categories } });
  } catch (err) {
    next(new AppError(err.message, 400));
  }
};

const getCategoryChildren = async (req, res, next) => {
  try {
    const { user, body, params } = req;
    const { categoryId } = params;

    logger.log('info', 'getCategoryChildren: %j', { categoryId, user });

    const { page = {} } = body;
    const { skip = 0, limit = 20 } = page;
    const categories = await CategoryModel.getCategoryChildren(categoryId, user.accessLevel, {
      skip,
      limit,
    });

    res.status(200).send({ payload: { categories } });
  } catch (err) {
    next(new AppError(err.message, 400));
  }
};

export { addCategory, getCategoryById, getTopCategories, getCategoriesByName, getCategoryChildren };
