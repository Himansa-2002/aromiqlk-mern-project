import crypto from 'crypto';

import User from '../models/User.js';
import PasswordResetToken from '../models/PasswordResetToken.js';
import { generateToken } from '../utils/jwt.js';
import { emailService } from '../services/emailService.js';

const sendAuthResponse = (
  res,
  statusCode,
  message,
  user
) => {
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

const createResetToken = () => {
  const rawToken = crypto.randomBytes(32).toString('hex');

  const tokenHash = crypto
    .createHash('sha256')
    .update(rawToken)
    .digest('hex');

  return {
    rawToken,
    tokenHash,
  };
};

const hashResetToken = (token) =>
  crypto
    .createHash('sha256')
    .update(token)
    .digest('hex');

// POST /api/auth/register
export const registerUser = async (
  req,
  res,
  next
) => {
  try {
    const {
      firstName,
      lastName,
      email,
      phone,
      password,
    } = req.body;

    if (
      !firstName ||
      !lastName ||
      !email ||
      !password
    ) {
      res.status(400);

      throw new Error(
        'First name, last name, email and password are required'
      );
    }

    const normalizedEmail = email
      .toLowerCase()
      .trim();

    const existingUser = await User.findOne({
      email: normalizedEmail,
    });

    if (existingUser) {
      res.status(409);

      throw new Error(
        'User already exists with this email'
      );
    }

    const user = await User.create({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: normalizedEmail,
      phone: phone?.trim() || '',
      password,
      role: 'customer',
    });

    // Send Welcome Email
    emailService.sendWelcomeEmail(user);

    return sendAuthResponse(
      res,
      201,
      'Registration successful',
      user
    );
  } catch (error) {
    return next(error);
  }
};

// POST /api/auth/login
export const loginUser = async (
  req,
  res,
  next
) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400);

      throw new Error(
        'Email and password are required'
      );
    }

    const user = await User.findOne({
      email: email.toLowerCase().trim(),
    }).select('+password');

    if (!user) {
      res.status(401);
      throw new Error('Invalid email or password');
    }

    if (!user.isActive) {
      res.status(403);
      throw new Error(
        'Your account has been deactivated'
      );
    }

    const passwordMatches =
      await user.comparePassword(password);

    if (!passwordMatches) {
      res.status(401);
      throw new Error('Invalid email or password');
    }

    user.lastLogin = new Date();

    await user.save({
      validateBeforeSave: false,
    });

    return sendAuthResponse(
      res,
      200,
      'Login successful',
      user
    );
  } catch (error) {
    return next(error);
  }
};

// GET /api/auth/me
export const getCurrentUser = async (
  req,
  res,
  next
) => {
  try {
    const user = await User.findById(
      req.user._id
    );

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
    return next(error);
  }
};

// POST /api/auth/logout
export const logoutUser = async (
  req,
  res,
  next
) => {
  try {
    return res.status(200).json({
      success: true,
      message:
        'Logout successful. Remove the token from the client.',
    });
  } catch (error) {
    return next(error);
  }
};

// POST /api/auth/forgot-password
export const forgotPassword = async (
  req,
  res,
  next
) => {
  try {
    const { email } = req.body;

    if (!email) {
      res.status(400);
      throw new Error('Email is required');
    }

    const normalizedEmail = email
      .toLowerCase()
      .trim();

    const user = await User.findOne({
      email: normalizedEmail,
    });

    /*
     * Return the same general response whether the user exists
     * or not. This avoids exposing registered email addresses.
     */
    if (!user) {
      return res.status(200).json({
        success: true,
        message:
          'If an account exists with that email, password reset instructions have been generated.',
      });
    }

    await PasswordResetToken.deleteMany({
      user: user._id,
    });

    const { rawToken, tokenHash } =
      createResetToken();

    const expiresAt = new Date(
      Date.now() + 15 * 60 * 1000
    );

    await PasswordResetToken.create({
      user: user._id,
      tokenHash,
      expiresAt,
    });

    const frontendUrl =
      process.env.CLIENT_URL ||
      'http://localhost:5173';

    const resetUrl =
      `${frontendUrl}/reset-password` +
      `?token=${rawToken}`;

    // Send email with reset url
    await emailService.sendPasswordResetEmail(user, resetUrl);

    return res.status(200).json({
      success: true,
      message: 'If an account exists with that email, password reset instructions have been emailed.'
    });
  } catch (error) {
    return next(error);
  }
};

// POST /api/auth/reset-password
export const resetPassword = async (
  req,
  res,
  next
) => {
  try {
    const {
      token,
      password,
      confirmPassword,
    } = req.body;

    if (!token || !password) {
      res.status(400);

      throw new Error(
        'Reset token and new password are required'
      );
    }

    if (password.length < 6) {
      res.status(400);

      throw new Error(
        'Password must contain at least 6 characters'
      );
    }

    if (
      confirmPassword !== undefined &&
      password !== confirmPassword
    ) {
      res.status(400);

      throw new Error(
        'Password and confirm password do not match'
      );
    }

    const tokenHash = hashResetToken(token);

    const resetToken =
      await PasswordResetToken.findOne({
        tokenHash,
        usedAt: null,
        expiresAt: {
          $gt: new Date(),
        },
      });

    if (!resetToken) {
      res.status(400);

      throw new Error(
        'Reset token is invalid or has expired'
      );
    }

    const user = await User.findById(
      resetToken.user
    ).select('+password');

    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }

    user.password = password;
    user.passwordChangedAt = new Date();

    await user.save();

    resetToken.usedAt = new Date();
    await resetToken.save();

    await PasswordResetToken.deleteMany({
      user: user._id,
      _id: {
        $ne: resetToken._id,
      },
    });

    return res.status(200).json({
      success: true,
      message:
        'Password reset successfully. You can now log in with your new password.',
    });
  } catch (error) {
    return next(error);
  }
};