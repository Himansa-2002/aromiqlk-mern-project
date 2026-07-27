//backend\controllers\authController.js
import User from '../models/User.js';
import { generateToken } from '../utils/jwt.js';

const sendAuthResponse = (res, statusCode, message, user) => {
  const token = generateToken(user._id, user.role);

  return res.status(statusCode).json({
    success: true,
    message,
    token,
    user: {
      id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
      role: user.role,
      addresses: user.addresses,
    },
  });
};

export const registerUser = async (req, res, next) => {
  try {
    const {
      firstName,
      lastName,
      email,
      phone,
      password,
    } = req.body;

    if (!firstName || !lastName || !email || !password) {
      res.status(400);
      throw new Error(
        'First name, last name, email and password are required'
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    const existingUser = await User.findOne({
      email: normalizedEmail,
    });

    if (existingUser) {
      res.status(409);
      throw new Error('User already exists with this email');
    }

    const user = await User.create({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: normalizedEmail,
      phone: phone?.trim() || '',
      password,
      role: 'customer',
    });

    return sendAuthResponse(
      res,
      201,
      'Registration successful',
      user
    );
  } catch (error) {
    next(error);
  }
};

export const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400);
      throw new Error('Email and password are required');
    }

    const user = await User.findOne({
      email: email.toLowerCase().trim(),
    }).select('+password');

    if (!user) {
      res.status(401);
      throw new Error('Invalid email or password');
    }

    const passwordMatches = await user.comparePassword(password);

    if (!passwordMatches) {
      res.status(401);
      throw new Error('Invalid email or password');
    }

    return sendAuthResponse(
      res,
      200,
      'Login successful',
      user
    );
  } catch (error) {
    next(error);
  }
};

export const getCurrentUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }

    return res.status(200).json({
      success: true,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        role: user.role,
        addresses: user.addresses,
      },
    });
  } catch (error) {
    next(error);
  }
};