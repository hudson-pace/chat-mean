/* core authentication logic. generates jwt and refresh tokens, fetches user data */

const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const config = require('../config');
const db = require('../helpers/db');
const { User } = require('../helpers/db');
const Role = require('../helpers/role');

function basicDetails(user) {
  return {
    id: user.id,
    username: user.username,
    role: user.role,
    description: user.description,
  };
}

async function getRefreshToken(token) {
  const refreshToken = await db.RefreshToken.findOne({ token }).populate('user');
  if (!refreshToken || !refreshToken.isActive) {
    throw 'Invalid token';
  }
  return refreshToken;
}

async function register(userParams) {
  const user = new User();
  user.username = userParams.username;
  user.role = Role.User;
  await user.save();

  return user;
}

async function deleteUser(id) {
  let success = false;
  const result = await db.User.deleteOne({ _id: id });
  if (result.deletedCount > 0) {
    success = true;
  }
  return {
    success: {
      success,
    },
  };
}

async function revokeToken({ token, ipAddress }) {
  const refreshToken = await getRefreshToken(token);

  refreshToken.revoked = Date.now();
  refreshToken.revokedByIp = ipAddress;
  await refreshToken.save();
}

async function getAll() {
  const users = await db.User.find();
  return users.map((x) => basicDetails(x));
}

async function getById(id) {
  const user = await getUser(id);
  return basicDetails(user);
}

async function getRefreshTokens(userId) {
  const refreshTokens = await db.RefreshToken.find({ user: userId });
  return refreshTokens;
}

// helper functions

async function getUser(id) {
  if (!db.isValidId(id)) {
    throw 'User not found';
  }
  const user = await db.User.findById(id);
  if (!user) {
    throw 'User not found';
  }
  return user;
}

async function getUserByName(name) {
  const user = await db.User.findOne({ username: name });
  if (!user) {
    throw 'User not found';
  }
  return user;
}

async function updateUser(userId, username, updateParams) {
  const user = await getUserByName(username);
  if (user.id === userId) {
    if (updateParams.password) {
      updateParams.passwordHash = bcrypt.hashSync(updateParams.password, 10);
    }
    await User.updateOne({ _id: userId }, updateParams);
    return { success: true };
  }
  return { message: 'Unauthorized' };
}

function generateJwtToken(user) {
  return jwt.sign({ sub: user.id, id: user.id }, config.secret, { expiresIn: '15m' });
}

function randomTokenString() {
  return crypto.randomBytes(40).toString('hex');
}

function generateRefreshToken(user, ipAddress) {
  return new db.RefreshToken({
    user: user.id,
    token: randomTokenString(),
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    createdByIp: ipAddress,
  });
}

module.exports = {
  register,
  deleteUser,
  revokeToken,
  getAll,
  getById,
  getRefreshTokens,
  getUserByName,
  updateUser,
};