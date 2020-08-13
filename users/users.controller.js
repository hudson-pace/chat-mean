var express = require('express');
var router = express.Router();
var Joi = require('@hapi/joi');
var authorize = require('../middleware/authorize');
var Role = require('../helpers/role');
var userService = require('./user.service');
const postService = require('../posts/post.service');
const jwt = require('express-jwt');
const { secret } = require('../config');

//routes
router.delete('/user/:username', authorize(), deleteUser);
router.get('/', authorize(Role.Admin), getAll);
router.get('/user', authorize(), getUserFromToken);
router.get('/user/:username', getByName);
router.get('/user/:username/posts', getPostsFromUser);
router.put('/user/:username', authorize(), updateUser);

module.exports = router;

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

function getAll(req, res, next) {
    userService.getAll()
        .then(users => res.json(users))
        .catch(next);
}

function getByName(req, res, next) {
    userService.getUserByName(req.params.username)
        .then(user => user ? res.json(user) : res.sendStatus(404))
        .catch(next);
}

function getUserFromToken(req, res, next) {
    return req.user ? res.json(req.user) : res.sendStatus(401);
}

function getRefreshTokens(req, res, next) {
    if (req.params.id !== req.user.id && req.user.role !== Role.Admin) {
        return res.status(401).json({message: 'Unauthorized'});
    }
    userService.getRefreshTokens(req.params.id)
        .then(tokens => tokens ? res.json(tokens) : res.sendStatus(404))
        .catch(next);
}

function getPostsFromUser(req, res, next) {
    postService.getPostsFromUser(req.params.username)
        .then(posts => res.json(posts))
        .catch(next);
}

function updateUser(req, res, next) {
    userService.updateUser(req.user.id, req.params.username, req.body)
        .then(success => res.json(success))
        .catch(next);
}