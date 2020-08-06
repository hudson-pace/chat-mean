const mongoose = require('mongoose');

var commentSchema = new mongoose.Schema({
    author: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
    text: { type: String, required: true },
    datePosted: { type: Date, required: true, default: Date.now() },
    children: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }],
    votes: { type: Number, default: 0 }
});

module.exports = mongoose.model('Comment', commentSchema);