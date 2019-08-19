import mongoose from 'mongoose';

const topicSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, unique: false, trim: true },
    username: { type: String, required: true, unique: false },
    categoryId: { type: String, required: true, unique: false, trim: true },
  },
  { timestamps: true },
);

const TopicModel = mongoose.model('Topic', topicSchema);

const addTopic = async model => new TopicModel(model).save();

const getTopicById = async _id => TopicModel.findById({ _id });

const getTopicsByUser = async username => TopicModel.find({ username });

const getTopicsByCategoryId = async categoryId => TopicModel.find({ categoryId });

export { addTopic, getTopicById, getTopicsByUser, getTopicsByCategoryId };
