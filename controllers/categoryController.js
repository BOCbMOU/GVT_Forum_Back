import * as CategoryModel from '../models/CategoryModel';
import { ADD_CATEGORY_AL } from '../consts';
import convertPage from '../utils/convertPage';
import AppError from '../errors/AppError';

const logger = require('../utils/logger')('logController');

const addCategory = async (req, res, next) => {
  try {
    const { user, body } = req;
    const { category } = body;
    const {
      name,
      description = null,
      parentCategoryId = null,
      viewAccessLevel = user.accessLevel,
    } = category;

    logger.log('info', 'addCategory: %j', { name, user: user.username });

    if (user.accessLevel > ADD_CATEGORY_AL) {
      res.status(403).send('Low access level!');
      return;
    }

    if (!name) {
      res.status(400).send('No data provided!');
      return;
    }

    let correctAccessLevel = viewAccessLevel;
    if (parentCategoryId) {
      const parentCategory = await CategoryModel.getCategoryById(
        parentCategoryId,
        user.accessLevel,
      );
      if (!parentCategory) {
        res.status(404).send({ error: 'Unknown category ID!' });
        return;
      }
      correctAccessLevel = Math.min(viewAccessLevel, parentCategory.viewAccessLevel);
    }

    const addedCategory = await CategoryModel.addCategory({
      name,
      description,
      parentCategoryId,
      viewAccessLevel: correctAccessLevel,
    });

    res.status(201).send({ payload: { category: addedCategory } });
  } catch (err) {
    next(new AppError(err.message, 400));
  }
};

const updateCategory = async (req, res, next) => {
  try {
    const { user, body, params } = req;
    const { categoryId } = params;

    logger.log('info', 'updateCategory: %j', { category: categoryId, user: user.username });

    if (user.accessLevel > ADD_CATEGORY_AL) {
      res.status(403).send({ error: 'Low access level!' });
      return;
    }

    const oldCategory = await CategoryModel.getCategoryById(categoryId, user.accessLevel);

    if (!oldCategory) {
      res.status(404).send({ error: 'Unknown category ID!' });
      return;
    }

    const { category } = body;
    const {
      name = oldCategory.name,
      description = oldCategory.description,
      parentCategoryId = oldCategory.parentCategoryId,
      viewAccessLevel = oldCategory.viewAccessLevel,
    } = category;

    let correctAccessLevel = viewAccessLevel;
    if (parentCategoryId) {
      const parentCategory = await CategoryModel.getCategoryById(
        parentCategoryId,
        user.accessLevel,
      );
      if (!parentCategory) {
        res.status(404).send({ error: 'Unknown parent category!' });
        return;
      }

      correctAccessLevel = Math.min(viewAccessLevel, parentCategory.viewAccessLevel);
    }

    const updatedCategory = await CategoryModel.updateCategory(categoryId, {
      name,
      description,
      parentCategoryId,
      viewAccessLevel: correctAccessLevel,
    });

    res.status(202).send({ payload: { category: updatedCategory } });
  } catch (err) {
    next(new AppError(err.message, 400));
  }
};

const getCategoryById = async (req, res, next) => {
  try {
    const { user, params } = req;
    const { categoryId } = params;

    logger.log('info', 'getCategoryById: %j', { categoryId, user: user.username });

    const category = await CategoryModel.getCategoryById(categoryId, user.accessLevel);

    res.status(200).send({ payload: { category } });
  } catch (err) {
    next(new AppError(err.message, 400));
  }
};

const getTopCategories = async (req, res, next) => {
  try {
    const { user } = req;
    // const { user, params } = req;
    // const { page } = params;

    logger.log('info', 'getTopCategories: %j', { user: user.username });

    const categories = await CategoryModel.getTopCategories(user.accessLevel);
    // const categories = await CategoryModel.getTopCategories(
    //   user.accessLevel,
    //   convertPage(page, user),
    // );

    res.status(200).send({ payload: { categories } });
  } catch (err) {
    next(new AppError(err.message, 400));
  }
};

const getCategoriesByName = async (req, res, next) => {
  try {
    const { user, body, params } = req;
    const { name } = body;
    const { page } = params;

    logger.log('info', 'getCategoriesByName: %j', { name, user: user.username });

    const categories = await CategoryModel.getCategoriesByName(
      name,
      user.accessLevel,
      convertPage(page, user),
    );

    res.status(200).send({ payload: { categories } });
  } catch (err) {
    next(new AppError(err.message, 400));
  }
};

const getCategoryChildren = async (req, res, next) => {
  try {
    const { user, params } = req;
    const { categoryId } = params;

    logger.log('info', 'getCategoryChildren: %j', { categoryId, user: user.username });

    const categories = await CategoryModel.getCategoryChildren(categoryId, user.accessLevel);

    res.status(200).send({ payload: { categories } });
  } catch (err) {
    next(new AppError(err.message, 400));
  }
};

export {
  addCategory,
  updateCategory,
  getCategoryById,
  getTopCategories,
  getCategoriesByName,
  getCategoryChildren,
};
