var config = require('config/database');
var mongoose = require('mongoose');
var connectionOptions = {useCreateIndex: true, useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false};
mongoose.connect(config.url, connectionOptions);
mongoose.Promise = global.Promise;

module.exports = {
    User: require('users/user.model'),
    RefreshToken: require('users/refresh-token.model'),
    isValidId
};

function isValidId(id) {
    return mongoose.Types.ObjectId.isValid(id);
}