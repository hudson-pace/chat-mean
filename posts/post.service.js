const mongoose = require('mongoose');
const { Post } = require('../helpers/db');
const { getUserByName, getById } = require('../users/user.service');

module.exports = {
    createPost,
    getAllPosts,
    getPostById,
    deletePost
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

async function getAllPosts() {
    var posts = await Post.find().populate('author');
    return posts.map(x => getPostDetails(x));
}

async function getPostById(id) {
    var post = await Post.findOne({ 'postId': id }).populate('author');
    return getPostDetails(post);
}

async function deletePost(id) {
    let success = false;
    let result = await Post.deleteOne({ 'postId': id });
    if (result.deletedCount > 0) {
        success = true;
    }
    return {
        success: {
            success: success
        }
    }
}

function getPostDetails(post) {
    var { author, text, datePosted, votes, comments, tags, postId } = post;
    author = author.username;
    return { author, text, datePosted, votes, comments, tags, postId };
}