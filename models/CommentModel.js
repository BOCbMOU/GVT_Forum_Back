import mongoose from 'mongoose';
import { SUPER_AL } from '../consts';

const commentSchema = new mongoose.Schema(
  {
    message: { type: String, required: true, unique: false, trim: true },
    username: { type: String, required: true, unique: false },
    topicId: { type: String, required: true, unique: false },
    viewAccessLevel: {
      type: Number,
      unique: false,
      required: false,
      min: 1,
      max: 9999,
      default: SUPER_AL,
    },
  },
  { timestamps: true },
);

const CommentModel = mongoose.model('Comment', commentSchema);

const addComment = async model => new CommentModel(model).save();

const updateComment = async (_id, data) => CommentModel.findOneAndUpdate({ _id }, data);

const getCommentById = async (_id, userAccessLevel) =>
  CommentModel.findOne({ _id, viewAccessLevel: { $gte: userAccessLevel } });

const getTopCommentByTopicId = async (topicId, userAccessLevel) =>
  CommentModel.findOne({ topicId, viewAccessLevel: { $gte: userAccessLevel } });

const getCommentsByTopicId = async (topicId, userAccessLevel, { skip, limit }) =>
  CommentModel.find({ topicId, viewAccessLevel: { $gte: userAccessLevel } }, null, { skip, limit });

const getCommentsByUser = async (username, userAccessLevel, { skip, limit }) =>
  CommentModel.find({ username, viewAccessLevel: { $gte: userAccessLevel } }, null, {
    skip,
    limit,
  });

export {
  addComment,
  updateComment,
  getCommentById,
  getTopCommentByTopicId,
  getCommentsByTopicId,
  getCommentsByUser,
};
