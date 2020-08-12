const mongoose = require('mongoose');

var commentSchema = new mongoose.Schema({
    author: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
    text: { type: String, required: true },
    datePosted: { type: Date, required: true, default: Date.now },
    votes: { type: Number, default: 0 },
    parent: { type: mongoose.Schema.Types.ObjectId, required: true },
    post: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Post' },
});

module.exports = mongoose.model('Comment', commentSchema);