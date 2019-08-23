import { hash, compare } from 'bcrypt';

const hashPassword = async password =>
  hash(password, parseInt(process.env.PASSWORD_HASHING_ROUNDS, 10));

const comparePasswords = async (passwordToVerify, userRehashedPassword) =>
  compare(passwordToVerify, userRehashedPassword);

export { hashPassword, comparePasswords };
