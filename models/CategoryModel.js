import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: false, trim: true },
    description: { type: String, required: false, unique: false, trim: true },
    parentCategoryId: { type: String, required: false, unique: false },
  },
  { timestamps: true },
);

const CategoryModel = mongoose.model('Category', categorySchema);

const addCategory = async model => new CategoryModel(model).save();

const getCategoryById = async _id => CategoryModel.findById({ _id });

const getCategoriesByName = async name => CategoryModel.find({ name });

const getCategoryChildren = async id => CategoryModel.find({ parentCategoryId: id });

export { addCategory, getCategoryById, getCategoriesByName, getCategoryChildren };
