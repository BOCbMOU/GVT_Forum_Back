import mongoose from 'mongoose';
import { SUPER_AL } from '../consts';

const categorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: false, trim: true },
    description: { type: String, required: false, unique: false, trim: true },
    viewAccessLevel: {
      type: Number,
      unique: false,
      required: false,
      min: 1,
      max: 9999,
      default: SUPER_AL,
    },
    parentCategoryId: { type: String, required: false, unique: false },
  },
  { timestamps: true },
);

const CategoryModel = mongoose.model('Category', categorySchema);

const addCategory = async model => new CategoryModel(model).save();

const getCategoryById = async (_id, userAccessLevel) =>
  CategoryModel.findOne({ _id, viewAccessLevel: { $gte: userAccessLevel } });

const getTopCategories = async (userAccessLevel, { skip, limit }) =>
  CategoryModel.find({ parentCategoryId: null, viewAccessLevel: { $gte: userAccessLevel } }, null, {
    skip,
    limit,
  });

const getCategoriesByName = async (name, userAccessLevel, { skip, limit }) =>
  CategoryModel.find({ name, viewAccessLevel: { $gte: userAccessLevel } }, null, { skip, limit });

const getCategoryChildren = async (parentCategoryId, userAccessLevel, { skip, limit }) =>
  CategoryModel.find({ parentCategoryId, viewAccessLevel: { $gte: userAccessLevel } }, null, {
    skip,
    limit,
  });

export { addCategory, getCategoryById, getTopCategories, getCategoriesByName, getCategoryChildren };
