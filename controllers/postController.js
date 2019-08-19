import * as PostModel from '../models/TopicModel';

const logger = require('../utils/logger')('logController');

const addPost = async (req, res) => {
  logger.log('info', 'addPost: %j', req.body);
  const { user, body } = req;
  const { category } = await CategoryModel.getCategoryByID(body.categoryID);
  const post = await PostModel.save({
    title: req.body.caption,
    username: user.username,
    media: {
      category,
      categoryID: req.body.categoryID,
    },
  });
  res.status(200).send({ payload: post });
};

const getPosts = async (req, res) => {
  logger.log('info', 'getPosts: %j', req.body);
  const posts = await PostModel.getRandomPosts();
  res.status(200).send({ payload: posts || [] });
};

const getPostById = async (req, res) => {
  logger.log('info', 'getPostById: %j', req.body);
  const post = await PostModel.getPostById(req.params.mediaId);
  res.status(200).send({ payload: post });
};

export { getPosts, addPost, attachMedia, getPostById };
