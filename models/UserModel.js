import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    username: { type: String, trim: true, unique: true, required: true },
    email: { type: String, trim: true, unique: true, required: true },
    // 1 = admin, 9999 = unauthorized
    accessLevel: { type: Number, unique: false, required: false, min: 1, max: 9999, default: 9999 },
    avatar: { type: String, unique: false, required: false },
    rehashedPassword: { type: String, unique: false, required: true },
    settings: {
      pageSize: { type: Number, unique: false, required: false, min: 10, max: 100, default: 20 },
    },
  },
  { timestamps: true },
);

const UserModel = mongoose.model('User', userSchema);

const addUser = async model => new UserModel(model).save();

const updateUser = async (username, update) => UserModel.findOneAndUpdate({ username }, update);

const getUserByName = async username => UserModel.findOne({ username });

const getUserByEmail = async email => UserModel.findOne({ email });

const getUsersByAccessLevel = async (accessLevel, { skip, limit }) =>
  UserModel.find({ accessLevel }, null, { skip, limit }).sort({
    createdAt: 1,
  });

UserModel.schema
  .path('username')
  .validate(async username => !(await getUserByName(username)), 'Username is already in use!');

UserModel.schema
  .path('email')
  .validate(async email => !(await getUserByEmail(email)), 'Email is already in use!');

export { addUser, updateUser, getUserByName, getUserByEmail, getUsersByAccessLevel, userSchema };
