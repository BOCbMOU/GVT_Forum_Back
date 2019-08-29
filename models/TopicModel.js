import mongoose from 'mongoose';
import { SUPER_AL } from '../consts';

const topicSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, unique: false, trim: true },
    username: { type: String, required: true, unique: false },
    viewAccessLevel: {
      type: Number,
      unique: false,
      required: false,
      min: 1,
      max: 9999,
      default: SUPER_AL,
    },
    categoryId: { type: String, required: true, unique: false, trim: true },
  },
  { timestamps: true },
);

const TopicModel = mongoose.model('Topic', topicSchema);

const addTopic = async model => new TopicModel(model).save();

const updateTopic = async (_id, data) => TopicModel.findOneAndUpdate({ _id }, data, { new: true });

const getTopicById = async (_id, userAccessLevel) =>
  TopicModel.findOne({ _id, viewAccessLevel: { $gte: userAccessLevel } });

const getTopicsByUser = async (username, userAccessLevel, { skip, limit }) =>
  TopicModel.find({ username, viewAccessLevel: { $gte: userAccessLevel } }, null, {
    skip,
    limit,
  }).sort({
    updatedAt: -1,
  });

const getNumberOfTopicsByUser = async (username, userAccessLevel) =>
  TopicModel.countDocuments({ username, viewAccessLevel: { $gte: userAccessLevel } });

const getTopicsByCategoryId = async (categoryId, userAccessLevel, { skip, limit }) =>
  TopicModel.find({ categoryId, viewAccessLevel: { $gte: userAccessLevel } }, null, {
    skip,
    limit,
  }).sort({
    updatedAt: -1,
  });

const getNumberOfTopicsByCategoryId = async (categoryId, userAccessLevel) =>
  TopicModel.countDocuments({ categoryId, viewAccessLevel: { $gte: userAccessLevel } });

export {
  addTopic,
  updateTopic,
  getTopicById,
  getTopicsByUser,
  getNumberOfTopicsByUser,
  getTopicsByCategoryId,
  getNumberOfTopicsByCategoryId,
};
