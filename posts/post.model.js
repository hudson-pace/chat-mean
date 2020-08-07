const mongoose = require('mongoose');
const shortId = require('shortid');

var postSchema = new mongoose.Schema({
    author: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
    text: { type: String, required: true },
    datePosted: { type: Date, required: true, default: Date.now() },
    tags: [{
        type: String
    }],
    votes: { type: Number, required: true, default: 0 },
    postId: { type: String, unique: true, default: shortId.generate } 
});

module.exports = mongoose.model('Post', postSchema);