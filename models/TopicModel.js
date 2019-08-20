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

const getTopicById = async (_id, viewAccessLevel) =>
  TopicModel.findOne({ _id, viewAccessLevel: { $lte: viewAccessLevel } });

const getTopicsByUser = async (username, viewAccessLevel, { skip, limit }) =>
  TopicModel.find({ username, viewAccessLevel: { $lte: viewAccessLevel } }, null, { skip, limit });

const getTopicsByCategoryId = async (categoryId, viewAccessLevel, { skip, limit }) =>
  TopicModel.find({ categoryId, viewAccessLevel: { $lte: viewAccessLevel } }, null, {
    skip,
    limit,
  });

export { addTopic, getTopicById, getTopicsByUser, getTopicsByCategoryId };
