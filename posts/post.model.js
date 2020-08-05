const mongoose = require('mongoose');

var postSchema = new mongoose.Schema({
    author: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
    text: { type: String, required: true },
    datePosted: { type: Date, required: true},
    tags: [{
        type: String
    }],
    comments: [{
        author: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
        text: { type: String, required: true },
        datePosted: { type: Date, required: true },
        parent: { type: mongoose.Schema.Types.ObjectId }
    }],
    votes: { type: Number, required: true }
});

module.exports = mongoose.model('Post', postSchema);