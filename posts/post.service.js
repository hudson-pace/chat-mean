const mongoose = require('mongoose');
const { Post, Comment } = require('../helpers/db');
const { getUserByName, getById } = require('../users/user.service');

module.exports = {
    createPost,
    getAllPosts,
    getPostById,
    deletePost,
    createComment
}

async function createPost(author, text, tags) {
    var post = new Post();
    post.author = author.id;
    post.text = text;
    post.tags = tags;
    await post.save();
    return true;
}

async function createComment(author, text, postId) {
    var comment = new Comment();
    comment.author = author.id;
    comment.text = text;
    await comment.save();
    var post = await Post.findOne({ 'postId': postId });
    post.comments.push(comment._id);
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