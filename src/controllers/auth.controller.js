import { User } from '../models/User.js';
import { ApiError } from '../utils/ApiError.js';
import { signToken } from '../utils/token.js';

const authResponse = (user, rememberMe = false) => ({
  user,
  token: signToken(user._id, rememberMe),
});

export const register = async (req, res) => {
  const { fullName, email, password } = req.valid.body;

  if (await User.exists({ email })) throw new ApiError(409, 'Email is already registered');

  const user = await User.create({ fullName, email, password });
  res.status(201).json(authResponse(user));
};

export const login = async (req, res) => {
  const { email, password, rememberMe } = req.valid.body;

  const user = await User.findOne({ email }).select('+password');
  // Pesan sama untuk email salah / password salah agar tidak membocorkan akun yang terdaftar
  if (!user || !(await user.comparePassword(password))) {
    throw new ApiError(401, 'Incorrect email or password');
  }

  res.json(authResponse(user, rememberMe));
};

export const me = (req, res) => {
  res.json({ user: req.user });
};
