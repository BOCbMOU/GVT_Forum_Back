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

const getCommentById = async (_id, viewAccessLevel) =>
  CommentModel.findOne({ _id, viewAccessLevel: { $lte: viewAccessLevel } });

const getTopCommentByTopicId = async (topicId, viewAccessLevel) =>
  CommentModel.findOne({ topicId, viewAccessLevel: { $lte: viewAccessLevel } });

const getCommentsByTopicId = async (topicId, viewAccessLevel, { skip, limit }) =>
  CommentModel.find({ topicId, viewAccessLevel: { $lte: viewAccessLevel } }, null, { skip, limit });

const getCommentsByUser = async (username, viewAccessLevel, { skip, limit }) =>
  CommentModel.find({ username, viewAccessLevel: { $lte: viewAccessLevel } }, null, {
    skip,
    limit,
  });

export {
  addComment,
  getCommentById,
  getTopCommentByTopicId,
  getCommentsByTopicId,
  getCommentsByUser,
};
