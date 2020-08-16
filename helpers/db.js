const mongoose = require('mongoose');
const User = require('../users/user.model');
const RefreshToken = require('../users/refresh-token.model');
const config = require('../config');

const connectionOptions = {
  useCreateIndex: true,
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
};
mongoose.connect(config.url, connectionOptions);
mongoose.Promise = global.Promise;

function isValidId(id) {
  return mongoose.Types.ObjectId.isValid(id);
}

module.exports = {
  User,
  RefreshToken,
  isValidId,
};
