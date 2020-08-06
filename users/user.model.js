/* defines schema for users collection in database */

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var schema = new Schema({
    username: {type: String, unique: true, required: true},
    passwordHash: {type: String, required: true},
    role: {type: String, required: true},
    posts: [{type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Post'}]
});

schema.set('toJSON', {
    virtuals: true,
    versionKey: false,
    transform: function(doc, ret) {
        delete ret._id;
        delete ret.passwordHash;
    }
});

module.exports = mongoose.model('User', schema);