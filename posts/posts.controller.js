const express = require('express');
const router = express.Router();
const Joi = require('@hapi/joi');
const authorize = require('../middleware/authorize');
const validateRequest = require('../middleware/validate-request');
const { getById } = require('../users/user.service');
const postService = require('./post.service');
const { Post } = require('../helpers/db');
const Role = require('../helpers/role');

//routes
router.post('/', authorize(), createPostSchema, createPost);
router.get('/', getAllPosts);
router.get('/:id', getPostById);
router.delete('/:id', authorize(), deletePost);

module.exports = router;

function createPostSchema(req, res, next) {
    var schema = Joi.object({
        author: Joi.string().required(),
        text: Joi.string().required(),
        tags: Joi.array().items(Joi.string())
    });
    validateRequest(req, next, schema);
}
function createPost(req, res, next) {
    getById(req.user.id)
        .then(user => {
            if (user.username === req.body.author) {
                postService.createPost(req.body)
                    .then(post => {
                        if (post) {
                            return res.json('post successfully created');
                        }
                        return res.json("post could not be created");
                    })
                    .catch(next);
            }
            else {
                return res.status(401).json({message: 'Unauthorized'});
            }
        })
        .catch(next);
}

function getAllPosts(req, res, next) {
    postService.getAllPosts()
        .then(posts => res.json(posts))
        .catch(next);
}

function getPostById(req, res, next) {
    postService.getPostById(req.params.id)
        .then(post => res.json(post))
        .catch(next);
}

function deletePost(req, res, next) {
    postService.getPostById(req.params.id)
        .then(post => {
            if (post.author === req.user.username || req.user.role === Role.Admin) {
                postService.deletePost(req.params.id)
                    .then(({ success }) => res.json(success))
                    .catch(next);
            }
            else {
                return res.status(401).json({message: 'Unauthorized'});
            }
        })
        .catch(next);
}