/* defines schema for refresh tokens collection in database */

const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  user: {type: mongoose.Types.ObjectId, ref: 'User'},
  token: String,
  expires: Date,
  created: {type: Date, default: Date.now},
  createdByIp: String,
  revoked: Date,
  revokedByIp: String,
  replacedByToken: String,
});

schema.virtual('isExpired').get(() => Date.now() >= this.expires);

schema.virtual('isActive').get(() => !this.revoked && !this.isExpired);

schema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: (doc, ret) => {
    delete ret._id;
    delete ret.id;
    delete ret.user;
  },
});

module.exports = mongoose.model('RefreshToken', schema);