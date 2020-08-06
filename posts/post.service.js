const mongoose = require('mongoose');
const { Post } = require('../helpers/db');
const { getUserByName, getById } = require('../users/user.service');

module.exports = {
    createPost,
    getAllPosts
}

async function createPost(params) {
    let user = await getUserByName(params.author);
    var post = new Post();
    post.author = user._id;
    post.text = params.text;
    post.datePosted = Date.now();
    post.tags = params.tags;
    post.votes = 0;
    await post.save();
    return true;
}

async function getAllPosts(req, res, next) {
    var posts = await Post.find().populate('author');
    return posts.map(x => getPostDetails(x));
}

function getPostDetails(post) {
    var { author, text, datePosted, votes, comments, tags } = post;
    author = author.username;
    return { author, text, datePosted, votes, comments, tags };
}