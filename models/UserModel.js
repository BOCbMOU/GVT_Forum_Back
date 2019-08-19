import mongoose from 'mongoose';
import { hash, compare } from 'bcrypt';

const userSchema = new mongoose.Schema(
  {
    username: { type: String, trim: true, unique: true, required: true },
    email: { type: String, trim: true, unique: true, required: true },
    // 1 = admin, 9999 = inactive
    accessLevel: { type: Number, unique: false, required: false, min: 1, max: 9999, default: 9999 },
    rehashedPassword: { type: String, unique: false, required: true },
  },
  { timestamps: true },
);

userSchema.pre('save', async function callback(next) {
  if (this.rehashedPassword) {
    this.rehashedPassword = await hash(
      this.rehashedPassword,
      parseInt(process.env.PASSWORD_HASHING_ROUNDS, 10),
    );
  }
  next();
});

const UserModel = mongoose.model('User', userSchema);

const addUser = async model => new UserModel(model).save();

const getUserByName = async username => UserModel.findOne({ username });

const getUserByEmail = async email => UserModel.findOne({ email });

const getUsersByAccessLevel = async accessLevel => UserModel.find({ accessLevel });

const comparePassword = async ({ userPassword, rehashedPassword }) =>
  compare(userPassword, rehashedPassword);

UserModel.schema
  .path('username')
  .validate(async username => !(await getUserByName(username)), 'Username is already in use!');

UserModel.schema
  .path('email')
  .validate(async email => !(await getUserByEmail(email)), 'Email is already in use!');

export { addUser, getUserByName, getUserByEmail, getUsersByAccessLevel, comparePassword, userSchema };
