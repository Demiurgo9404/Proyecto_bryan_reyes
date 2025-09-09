const jwt = require('jsonwebtoken');
const config = require('../../../../config');
const logger = require('../../../infrastructure/logging/logger');
const { User } = require('../../../domain/models');
const ApiError = require('../../../domain/exceptions/ApiError');
const httpStatus = require('http-status');

// Generate JWT token
const generateToken = (userId, role) => {
  const payload = {
    sub: userId,
    role,
    iat: Math.floor(Date.now() / 1000),
  };

  const accessToken = jwt.sign(payload, config.auth.jwt.secret, {
    expiresIn: config.auth.jwt.expiresIn,
  });

  const refreshToken = jwt.sign(payload, config.auth.jwt.refreshSecret, {
    expiresIn: config.auth.jwt.refreshExpiresIn,
  });

  return { accessToken, refreshToken };
};

// Register a new user
const register = async (req, res, next) => {
  try {
    const { email, username, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({
      where: {
        [Sequelize.Op.or]: [{ email }, { username }],
      },
    });

    if (existingUser) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        'Email or username already in use'
      );
    }

    // Create new user
    const user = await User.create({
      email,
      username,
      password, // Password will be hashed by the model hook
      role: 'user',
    });

    // Generate tokens
    const { accessToken, refreshToken } = generateToken(user.id, user.role);

    // Set refresh token in HTTP-only cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: config.env === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    // Return user and access token
    res.status(httpStatus.CREATED).json({
      user: user.toJSON(),
      token: accessToken,
    });
  } catch (error) {
    next(error);
  }
};

// Login user
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.scope('withPassword').findOne({
      where: { email },
    });

    // Check if user exists and password is correct
    if (!user || !(await user.validatePassword(password))) {
      throw new ApiError(
        httpStatus.UNAUTHORIZED,
        'Invalid email or password'
      );
    }

    // Check if user is active
    if (user.status !== 'active') {
      throw new ApiError(
        httpStatus.FORBIDDEN,
        'Your account has been deactivated. Please contact support.'
      );
    }

    // Update last login
    await user.update({ last_login_at: new Date() });

    // Generate tokens
    const { accessToken, refreshToken } = generateToken(user.id, user.role);

    // Set refresh token in HTTP-only cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: config.env === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    // Return user and access token
    res.json({
      user: user.toJSON(),
      token: accessToken,
    });
  } catch (error) {
    next(error);
  }
};

// Refresh access token
const refreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.cookies;

    if (!refreshToken) {
      throw new ApiError(
        httpStatus.UNAUTHORIZED,
        'No refresh token provided'
      );
    }

    // Verify refresh token
    const decoded = jwt.verify(
      refreshToken,
      config.auth.jwt.refreshSecret
    );

    // Find user
    const user = await User.findByPk(decoded.sub);
    if (!user) {
      throw new ApiError(
        httpStatus.UNAUTHORIZED,
        'User not found'
      );
    }

    // Generate new tokens
    const tokens = generateToken(user.id, user.role);

    // Set new refresh token in HTTP-only cookie
    res.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      secure: config.env === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    // Return new access token
    res.json({
      token: tokens.accessToken,
    });
  } catch (error) {
    next(new ApiError(httpStatus.UNAUTHORIZED, 'Invalid refresh token'));
  }
};

// Logout user
const logout = (req, res) => {
  // Clear refresh token cookie
  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: config.env === 'production',
    sameSite: 'strict',
  });
  
  res.status(httpStatus.NO_CONTENT).send();
};

// Get current user
const getMe = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.id);
    if (!user) {
      throw new ApiError(
        httpStatus.NOT_FOUND,
        'User not found'
      );
    }
    res.json(user);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  refreshToken,
  logout,
  getMe,
};
