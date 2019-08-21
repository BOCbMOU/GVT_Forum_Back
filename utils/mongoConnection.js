import mongo from 'connect-mongo';
import mongoose from 'mongoose';

const logger = require('../utils/logger')('server');

const connectToDB = session => {
  const MongoStore = mongo(session);
  mongoose.Promise = global.Promise;
  mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true });
  mongoose.connection.on('error', () => {
    logger.log('error', 'MongoDB connection error. Please make sure MongoDB is running.');
    process.exit();
  });
  mongoose.connection.once('open', () => logger.log('info', 'MongoDB has been connected.'));

  return MongoStore;
};

export default connectToDB;
