const mongoose = require('mongoose');
const { Post, Comment, User } = require('../helpers/db');
const { getUserByName, getById } = require('../users/user.service');

module.exports = {
    createPost,
    getAllPosts,
    getPostById,
    deletePost,
    createComment,
    getChildrenOfComment,
    getRealPostId,
    getPostsFromUser,
    upvotePost,
    upvoteComment
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

async function getChildrenOfComment(commentId, userId) {
    let comments = await Comment.find({ 'parent': commentId }).populate('author');
    let user = await User.findOne({ '_id': userId });
    return comments.map(comment => getCommentDetails(comment, user));
}

async function getAllPosts(userId) {
    let user;
    if (userId) {
        user = await User.findOne({ '_id': userId });
    }
    var posts = await Post.find().populate('author');
    return posts.map(post => getPostDetails(post, user));
}

async function getPostById(id, userId) {
    var post = await Post.findOne({ 'postId': id }).populate('author');
    var comments = await Comment.find({ 'parent': post._id }).populate('author');
    let user;
    if (userId) {
        user = await User.findOne({ '_id': userId });
    }
    var postDetails = getPostDetails(post, user);
    postDetails.comments = comments.map(comment => getCommentDetails(comment, user));
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

async function getPostsFromUser(username) {
    var user = await getUserByName(username);
    return await Post.find({ 'author': user._id });
}

function getPostDetails(post, user) {
    var { author, text, datePosted, votes, tags, postId, _id} = post;
    author = author.username;
    let hasBeenUpvoted;
    if (user) {
        hasBeenUpvoted = user.votes.includes(post._id);
    }
    return { author, text, datePosted, votes, tags, postId, _id, hasBeenUpvoted};
}
function getCommentDetails(comment, user) {
    var { author, text, datePosted, votes, _id } = comment;
    author = author.username;
    let hasBeenUpvoted;
    if (user) {
        hasBeenUpvoted = user.votes.includes(comment._id);
    }
    return { author, text, datePosted, votes, _id, hasBeenUpvoted };
}

async function upvotePost(userId, postId) {
    let post = await Post.findOne({ 'postId': postId });
    let user = await User.findOne({ '_id': userId });
    if (user.votes.includes(post._id)) {
        return { success: false, error: "already upvoted" };
    }
    else {
        user.votes.push(post._id);
        await user.save();
        post.votes += 1;
        await post.save();
        return { success: true };
    }
}
async function upvoteComment(userId, commentId) {
    let user = await User.findOne({ '_id': userId });
    if (user.votes.includes(comment_id)) {
        return { success: false, error: "already upvoted" };
    }
    else {
        let comment = await Post.findOne({ '_id': commentId });
        comment.votes += 1;
        await comment.save();
        user.votes.push(comment_id);
        await user.save();
        return { success: true };
    }
}