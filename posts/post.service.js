const { Post, Comment, User } = require('../helpers/db');
const { getUserByName } = require('../users/user.service');

function getPostDetails(post, user) {
  const details = {
    text: post.text,
    datePosted: post.datePosted,
    votes: post.votes,
    tags: post.tags,
    postId: post.postId,
    _id: post._id,
  };
  if (post.author) {
    details.author = post.author.username;
  }
  if (user) {
    details.hasBeenUpvoted = user.votes.includes(post._id);
  }
  return details;
}

function getCommentDetails(comment, user) {
  const details = {
    text: comment.text,
    datePosted: comment.datePosted,
    votes: comment.votes,
    _id: comment.id,
    parent: comment.parent,
  };
  if (comment.author) {
    details.author = comment.author.username;
  }
  if (user && comment) {
    details.hasBeenUpvoted = user.votes.includes(comment._id);
  }
  return details;
}

async function createPost(author, text, tags) {
  const post = new Post();
  post.author = author.id;
  post.text = text;
  post.tags = tags;
  await post.save();
  return true;
}

async function createComment(author, text, parentId, postId) {
  const comment = new Comment();
  comment.author = author.id;
  comment.text = text;
  comment.parent = parentId;
  if (postId) {
    comment.post = postId;
  } else {
    comment.post = parentId;
  }
  await comment.save();
  return { success: true };
}

async function getChildrenOfComment(commentId, userId) {
  const comments = await Comment.find({ parent: commentId }).sort({ datePosted: -1 }).populate('author');
  const user = await User.findOne({ _id: userId });
  return comments.map((comment) => getCommentDetails(comment, user));
}

async function getAllPosts(userId, params) {
  let user;
  if (userId) {
    user = await User.findOne({ _id: userId });
  }
  let { quantity } = params;
  if (!quantity) {
    quantity = 10;
  } else if (quantity > 50) {
    quantity = 50;
  }
  let postQuery;
  if (params.tags && params.tags.length > 0) {
    postQuery = Post.find({ tags: { $all: params.tags } });
  } else {
    postQuery = Post.find({ });
  }
  postQuery = postQuery.sort({ datePosted: -1 }).limit(quantity).populate('author');
  const posts = await postQuery;
  return posts.map((post) => getPostDetails(post, user));
}

async function getAllComments(postId, userId) {
  const user = await User.findOne({ _id: userId });
  const comments = await Comment.find({ post: postId }).populate('author');
  return comments.map((comment) => getCommentDetails(comment, user));
}

async function getPostById(id, userId) {
  const post = await Post.findOne({ postId: id }).populate('author');
  const comments = await Comment.find({ post: post._id }).sort({ datePosted: -1 }).populate('author');
  let user;
  if (userId) {
    user = await User.findOne({ _id: userId });
  }
  const postDetails = getPostDetails(post, user);
  postDetails.comments = comments.map((comment) => getCommentDetails(comment, user));
  return postDetails;
}

async function getRealPostId(shortId) {
  const post = await Post.findOne({ postId: shortId });
  return post._id;
}

async function deletePost(id) {
  let success = false;
  const result = await Post.deleteOne({ postId: id });
  if (result.deletedCount > 0) {
    success = true;
  }
  return {
    success: {
      success,
    },
  };
}

async function getPostsFromUser(username) {
  const user = await getUserByName(username);
  const posts = await Post.find({ author: user._id }).populate('author');
  return posts.map((post) => getPostDetails(post, user));
}

async function upvotePost(userId, postId) {
  const post = await Post.findOne({ postId });
  const user = await User.findOne({ _id: userId });
  if (user.votes.includes(post._id)) {
    return { success: false, error: 'already upvoted' };
  }
  user.votes.push(post._id);
  await user.save();
  post.votes += 1;
  await post.save();
  return { success: true };
}
async function undoPostUpvote(userId, postId) {
  const post = await Post.findOne({ postId });
  const user = await User.findOne({ _id: userId });
  const index = user.votes.indexOf(post._id);
  if (index === -1) {
    return { success: false, error: "post isn't upvoted" };
  }
  user.votes.splice(index, 1);
  await user.save();
  post.votes -= 1;
  await post.save();
  return { success: true };
}
async function upvoteComment(userId, commentId) {
  const user = await User.findOne({ _id: userId });
  if (user.votes.includes(commentId)) {
    return { success: false, error: 'already upvoted' };
  }
  const comment = await Comment.findOne({ _id: commentId });
  comment.votes += 1;
  await comment.save();
  user.votes.push(commentId);
  await user.save();
  return { success: true };
}

async function undoCommentUpvote(userId, commentId) {
  const comment = await Comment.findOne({ _id: commentId });
  const user = await User.findOne({ _id: userId });
  const index = user.votes.indexOf(comment._id);
  if (index === -1) {
    return { success: false, error: "comment isn't upvoted" };
  }
  user.votes.splice(index, 1);
  await user.save();
  comment.votes -= 1;
  await comment.save();
  return { success: true };
}

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
};
