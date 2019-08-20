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

const getCategoryById = async (_id, viewAccessLevel) =>
  CategoryModel.findOne({ _id, viewAccessLevel: { $lte: viewAccessLevel } });

const getTopCategories = async (viewAccessLevel, { skip, limit }) =>
  CategoryModel.find({ parentCategoryId: null, viewAccessLevel: { $lte: viewAccessLevel } }, null, {
    skip,
    limit,
  });

const getCategoriesByName = async (name, viewAccessLevel, { skip, limit }) =>
  CategoryModel.find({ name, viewAccessLevel: { $lte: viewAccessLevel } }, null, { skip, limit });

const getCategoryChildren = async (parentCategoryId, viewAccessLevel, { skip, limit }) =>
  CategoryModel.find({ parentCategoryId, viewAccessLevel: { $lte: viewAccessLevel } }, null, {
    skip,
    limit,
  });

export { addCategory, getCategoryById, getTopCategories, getCategoriesByName, getCategoryChildren };
