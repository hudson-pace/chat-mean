var express = require('express');
var router = express.Router();
var Joi = require('@hapi/joi');
var validateRequest = require('../middleware/validate-request');
var authorize = require('../middleware/authorize');
var Role = require('../helpers/role');
var userService = require('./user.service');

//routes
router.post('/authenticate', authenticateSchema, authenticate);
router.post('/register', registerSchema, register);
router.post('/refresh-token', refreshToken);
router.post('/revoke-token', authorize(), revokeTokenSchema, revokeToken);
router.delete('/:username', authorize(), deleteUser);
router.get('/', authorize(Role.Admin), getAll);
router.get('/:username', getByName);
router.get('/:username/refresh-tokens', authorize(), getRefreshTokens);

module.exports = router;

function authenticateSchema(req, res, next) {
    var schema = Joi.object({
        username: Joi.string().required(),
        password: Joi.string().required()
    });
    validateRequest(req, next, schema);
}
function authenticate(req, res, next) {
    var {username, password} = req.body;
    var ipAddress = req.ip;
    userService.authenticate({username, password, ipAddress})
        .then(({refreshToken, ...user}) => {
            setTokenCookie(res, refreshToken);
            res.json(user);
        })
        .catch(next);
}

function registerSchema(req, res, next) {
    var schema = Joi.object({
        user: Joi.object({
            username: Joi.string().required(),
            password: Joi.string().required()
        }).required()
    });
    validateRequest(req, next, schema);
}
function register(req, res, next) {
    var userParams = req.body.user;
    var ipAddress = req.ip;
    userService.register(userParams, ipAddress)
        .then(({ refreshToken, ...user }) => {
            setTokenCookie(res, refreshToken);
            res.json(user);
        })
        .catch(next);
}

function deleteUser(req, res, next) {
    userService.getUserByName(req.params.username)
        .then(user => {
            if (String(user._id) !== req.user.id && req.user.role !== Role.Admin) {
                return res.status(401).json({message: 'Unauthorized'});
            }
            userService.deleteUser(user.id)
                .then(({ success }) => {
                    res.json(success);
                })
                .catch(next);
                })
        .catch(next);
}

function refreshToken(req, res, next) {
    var token = req.cookies.refreshToken;
    var ipAddress = req.ip;
    userService.refreshToken({token, ipAddress})
        .then(({refreshToken, ...user}) => {
            setTokenCookie(res, refreshToken);
            res.json(user);
        })
        .catch(next);
}

function revokeTokenSchema(req, res, next) {
    var schema = Joi.object({
        token: Joi.string().empty('')
    });
    validateRequest(req, next, schema);
}

function revokeToken(req, res, next) {
    var token = req.body.token || req.cookies.refreshToken;
    var ipAddress = req.ip;
    if (!token) {
        return res.status(400).json({message: 'Token is required'});
    }
    if (!req.user.ownsToken(token) && req.user.role !== Role.Admin) {
        return res.status(401).json({message: 'Unauthorized'});
    }

    userService.revokeToken({token, ipAddress})
        .then(() => res.json({message: 'Token revoked'}))
        .catch(next);
}

function getAll(req, res, next) {
    userService.getAll()
        .then(users => res.json(users))
        .catch(next);
}

function getByName(req, res, next) {
    console.log('here');
    userService.getUserByName(req.params.username)
        .then(user => user ? res.json({ username: user.username, role: user.role }) : res.sendStatus(404))
        .catch(next);
}

function getRefreshTokens(req, res, next) {
    if (req.params.id !== req.user.id && req.user.role !== Role.Admin) {
        return res.status(401).json({message: 'Unauthorized'});
    }
    userService.getRefreshTokens(req.params.id)
        .then(tokens => tokens ? res.json(tokens) : res.sendStatus(404))
        .catch(next);
}


// helper functions

function setTokenCookie(res, token) {
    var cookieOptions = {
        httpOnly: true,
        expires: new Date(Date.now() + 7*24*60*60*1000)
    };
    res.cookie('refreshToken', token, cookieOptions);
}