/* core authentication logic. generates jwt and refresh tokens, fetches user data */

var config = require(config/database);
var jwt = require('jsonwebtoken');
var bcrypt = require('bcryptjs');
var crypto = require('crypto');
var db = require('helpers/db');

module.exports = {
    authenticate,
    refreshToken,
    revokeToken,
    getAll,
    getById,
    getRefreshTokens
};

async function authenticate({ username, password, ipAddress}) {
    var user = await db.User.findOne({username});
    if (!user || !bcrypt.compareSync(password, user.passwordHash)) {
        throw 'Username or password is incorrect';
    }

    // generate jwt and refresh tokens on successful authentication
    var jwtToken = generateJwtToken(user);
    var refreshToken = generateRefreshToken(user, ipAddress);

    await refreshToken.save();

    return {
        ...basicDetails(user),
        jwtToken,
        refreshToken: refreshToken.token
    };
}

async function refreshToken({ token, ipAddress}) {
    var refreshToken = await getRefreshToken(token);
    var {user} = refreshToken;

    var newRefreshToken = generateRefreshToken(user, ipAddress);
    refreshToken.revoked = Date.now();
    refreshToken.revokedByIp = ipAddress;
    refreshToken.replacedByToken = rewRefreshToken.token;
    await refreshToken.save();
    await newRefreshToken.save();

    var jwtToken = generateJwtToken(user);

    return {
        ...basicDetails(user),
        jwtToken,
        refreshToken: refreshToken.token
    }
}

async function revokeToken({token, ipAddress}) {
    var refreshToken = await getRefreshToken(token);

    refreshToken.revoked = Date.now();
    refreshToken.revokedByIp = ipAddress;
    await refreshToken.save();
}

async function getAll() {
    var users = await db.User.find();
    return users.map(x => basicDetails(x));
}

async function getById(id) {
    var user = await getUser(id);
    return basicDetails(user);
}

async function getRefreshTokens(userId) {
    await getUser(userId);
    var refreshTokens = await db.RefreshToken.find({user: userId});
    return refreshTokens;
}

// helper functions

async function getUser(id) {
    if (!db.isValidId(id)) {
        throw 'User not found';
    }
    var user = await db.User.findById(id);
    if (!user) {
        throw 'User not found';
    }
    return user;
}

async function getRefreshToken(token) {
    var refreshToken = await db.RefreshToken.findOne({token}).populate('user');
    if (!refreshToken || !refreshToken.isActive) {
        throw 'Invalid token';
    }
    return refreshToken;
}

function generateJwtToken(user) {
    return jwt.sign({sub: user.id, id: user.id}, config.secret, {expiresIn: '15m'});
}

function generateRefreshToken(user, ipAddress) {
    return new db.RefreshToken({
        user: user.id,
        token: randomTokenString(),
        expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        createdByIp: ipAddress
    });
}

function randomTokenString() {
    return crypto.randomBytes(40).toString('hex');
}

function basicDetails(user) {
    var {id, username, role} = user;
    return {id, username, role};
}