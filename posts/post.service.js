const mongoose = require('mongoose');
const { Post, Comment } = require('../helpers/db');
const { getUserByName, getById } = require('../users/user.service');

module.exports = {
    createPost,
    getAllPosts,
    getPostById,
    deletePost,
    createComment,
    getChildrenOfComment,
    getRealPostId
}

async function createPost(author, text, tags) {
    var post = new Post();
    post.author = author.id;
    post.text = text;
    post.tags = tags;
    await post.save();
    return true;
}

async function createComment(author, text, parentId) {
    var comment = new Comment();
    comment.author = author.id;
    comment.text = text;
    comment.parent = parentId;
    console.log(comment);
    await comment.save();
    return true;
}

async function getChildrenOfComment(commentId) {
    return await Comment.find({ 'parent': commentId });
}

async function getAllPosts() {
    var posts = await Post.find().populate('author');
    return posts.map(x => getPostDetails(x));
}

async function getPostById(id) {
    var post = await Post.findOne({ 'postId': id }).populate('author');
    var comments = await Comment.find({ 'parent': post._id }).populate('author');
    var postDetails = getPostDetails(post);
    postDetails.comments = comments;
    return postDetails;
}

async function getRealPostId(shortId) {
    var post = await Post.findOne({ 'postId': shortId });
    return post._id;
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
    var { author, text, datePosted, votes, tags, postId } = post;
    author = author.username;
    return { author, text, datePosted, votes, tags, postId };
}