const config = require('../config');
const mongoose = require('mongoose');
const connectionOptions = {useCreateIndex: true, useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false};
mongoose.connect(config.url, connectionOptions);
mongoose.Promise = global.Promise;

module.exports = {
    User: require('../users/user.model'),
    Post: require('../posts/post.model'),
    Comment: require('../posts/comment.model'),
    RefreshToken: require('../users/refresh-token.model'),
    isValidId
};

function isValidId(id) {
    return mongoose.Types.ObjectId.isValid(id);
}