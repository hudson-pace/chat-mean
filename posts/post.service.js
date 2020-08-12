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
    undoPostUpvote,
    upvoteComment,
    undoCommentUpvote,
    getAllComments,
}

async function createPost(author, text, tags) {
    var post = new Post();
    post.author = author.id;
    post.text = text;
    post.tags = tags;
    await post.save();
    return true;
}

async function createComment(author, text, parentId, postId) {
    var comment = new Comment();
    comment.author = author.id;
    comment.text = text;
    comment.parent = parentId;
    if (postId) {
        comment.post = postId;
    }
    else {
        comment.post = parentId;
    }
    await comment.save();
    return { success: true };
}

async function getChildrenOfComment(commentId, userId) {
    let comments = await Comment.find({ 'parent': commentId }).sort({ datePosted: -1 }).populate('author');
    let user = await User.findOne({ '_id': userId });
    return comments.map(comment => getCommentDetails(comment, user));
}

async function getAllPosts(userId, params) {
    let user;
    if (userId) {
        user = await User.findOne({ '_id': userId });
    }
    let quantity = params.quantity;
    if (!quantity) {
        quantity = 10;
    }
    else if (quantity > 50) {
        quantity = 50;
    }
    let postQuery;
    if (params.tags && params.tags.length > 0) {
        postQuery = Post.find({ tags: { $all : params.tags }});
    }
    else {
        postQuery = Post.find({ });
    }
    postQuery = postQuery.sort({ datePosted: -1 }).limit(quantity).populate('author');
    var posts = await postQuery;
    return posts.map(post => getPostDetails(post, user));
}

async function getAllComments(postId, userId) {
    const user = await User.findOne({ '_id': userId });
    const comments = await Comment.find({ 'post': postId }).populate('author');
    return comments.map(comment => getCommentDetails(comment, user));
}

async function getPostById(id, userId) {
    var post = await Post.findOne({ 'postId': id }).populate('author');
    var comments = await Comment.find({ 'post': post._id }).sort({ datePosted: -1 }).populate('author');
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
    let posts = await Post.find({ 'author': user._id }).populate('author');
    return posts.map(post => getPostDetails(post, user))
}

function getPostDetails(post, user) {
    var { author, text, datePosted, votes, tags, postId, _id} = post;
    if (author) {
        author = author.username;
    }
    let hasBeenUpvoted;
    if (user) {
        hasBeenUpvoted = user.votes.includes(post._id);
    }
    return { author, text, datePosted, votes, tags, postId, _id, hasBeenUpvoted};
}
function getCommentDetails(comment, user) {
    var { author, text, datePosted, votes, _id, parent } = comment;
    if (author) {
        author = author.username;
    }
    let hasBeenUpvoted;
    if (user && comment) {
        hasBeenUpvoted = user.votes.includes(comment._id);
    }
    return { author, text, datePosted, votes, parent, _id, hasBeenUpvoted };
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
async function undoPostUpvote(userId, postId) {
    let post = await Post.findOne({ 'postId': postId });
    let user = await User.findOne({ '_id': userId });
    let index = user.votes.indexOf(post._id)
    if (index === -1) {
        return { success: false, error: "post isn't upvoted" };
    }
    else {
        user.votes.splice(index, 1);
        await user.save();
        post.votes -= 1;
        await post.save();
        return { success: true };
    }
}
async function upvoteComment(userId, commentId) {
    let user = await User.findOne({ '_id': userId });
    if (user.votes.includes(commentId)) {
        return { success: false, error: "already upvoted" };
    }
    else {
        let comment = await Comment.findOne({ '_id': commentId });
        comment.votes += 1;
        await comment.save();
        user.votes.push(commentId);
        await user.save();
        return { success: true };
    }
}

async function undoCommentUpvote(userId, commentId) {
    let comment = await Comment.findOne({ '_id': commentId });
    let user = await User.findOne({ '_id': userId });
    let index = user.votes.indexOf(comment._id)
    if (index === -1) {
        return { success: false, error: "comment isn't upvoted" };
    }
    else {
        user.votes.splice(index, 1);
        await user.save();
        comment.votes -= 1;
        await comment.save();
        return { success: true };
    }
}