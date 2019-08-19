import mongoose from 'mongoose';

const commentSchema = new mongoose.Schema(
  {
    message: { type: String, required: true, unique: false, trim: true },
    username: { type: String, required: true, unique: false },
    topicId: { type: String, required: true, unique: false },
    isTop: { type: Boolean, required: false, unique: false, default: false },
  },
  { timestamps: true },
);

const CommentModel = mongoose.model('Comment', commentSchema);

const addComment = async model => new CommentModel(model).save();

const getCommentById = async _id => CommentModel.findById({ _id });

const getTopCommentByTopic = async _id => CommentModel.findOne({ _id, isTop: true });

const getCommentsByTopic = async (id, skip = 0, limit = 20) =>
  CommentModel.find({ topicId: id }, null, { skip, limit });

const getCommentsByUser = async (username, skip = 0, limit = 20) =>
  CommentModel.find({ username }, null, { skip, limit });

export { addComment, getCommentById, getTopCommentByTopic, getCommentsByTopic, getCommentsByUser };
