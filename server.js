import express from 'express';
import session from 'express-session';
import bodyParser from 'body-parser';
import cors from 'cors';
import connectToDB from './utils/mongoConnection';
import './utils/dotenv';
import indexRouter from './routes/indexRoute';
import authRouter from './routes/authRoute';
import userRouter from './routes/userRoute';
import categoryRouter from './routes/categoryRoute';
import topicRouter from './routes/topicRoute';
import authenticate from './middlewares/authenticate';
import defaultErrorHandler from './middlewares/defaultErrorHandler';

const logger = require('./utils/logger')('server');

const app = express();

const MongoStore = connectToDB(session);

app.use(cors());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(
  session({
    resave: true,
    saveUninitialized: true,
    secret: process.env.SESSION_SECRET,
    store: new MongoStore({
      url: process.env.MONGODB_URI,
      autoReconnect: true,
    }),
  }),
);

app.use(`/api/v${process.env.API_VERSION}/auth`, authRouter);
app.use(`/api/v${process.env.API_VERSION}/categories`, authenticate, categoryRouter);
app.use(`/api/v${process.env.API_VERSION}/topics`, authenticate, topicRouter);
app.use(`/api/v${process.env.API_VERSION}/users`, authenticate, userRouter);
app.use(`/api/v${process.env.API_VERSION}`, indexRouter);

// app.use('/uploads', express.static('uploads'));
app.use(defaultErrorHandler);

const host = process.env[`HOST_${process.platform.toUpperCase()}`];
const port = process.env.PORT || process.env.HOST_PORT;

app.listen(port, host, () => {
  logger.log('info', `App is running at http://${host}:${port} in ${app.get('env')} mode.`);
});
