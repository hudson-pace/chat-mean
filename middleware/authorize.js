/* used by the users controller to restrict access to a route based on specified roles. */

var jwt = require('express-jwt');
var { secret } = require('../config');
var db = require('../helpers/db');
const userService = require('../users/user.service');

module.exports = authorize;

function authorize(roles = []) {
    // the roles parameter specifies which users can access the route. 
    // if omitted, it will be accessible to all authenticated users.
    if (typeof roles === 'string') {
        roles = [roles];
    }

    return [
        jwt({secret, algorithms: ['HS256']}),

        async(req, res, next) => {
            if (req.user) {
                let user = await db.User.findOne({ username: req.user.username });
                if (!user) {
                    user = await userService.register({ username: req.user.username });
                }
                if (!user || (roles.length && !roles.includes(user.role))) {
                    return res.status(401).json({message: 'Unauthorized'});
                }

                req.user = user;
            }
            next();
        }
    ];
}