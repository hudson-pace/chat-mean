var crypto = require('crypto');
var jwt = require('jsonwebtoken');

var userSchema = new mongoose.Schema({
    username: {
        type: String,
        unique: true,
        required: true
    },
    hash: String,
    salt: String
});

userSchema.methods.setPassword = function(password) {
    this.salt = crypto.randomBytes(16).toString('hex');
    this.hash = crypto.pbkdf2Sync(password, this.salt, 1000, 64, 'sha512').toString('hex');
}
userSchema.methods.generateJwt = function() {
    var expire = new Date();
    expire.setDate(expire.getDate() + 7);
    return jwt.sign({
        _id: this._id,
        name: this.name,
        expire: parseInt(expire.getTime() / 1000)
    }, process.env.JWT_SECRET);
};