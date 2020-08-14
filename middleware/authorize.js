/* used by the users controller to restrict access to a route based on specified roles. */

const jwt = require('express-jwt');
const { secret } = require('../config');
const db = require('../helpers/db');
const userService = require('../users/user.service');

function authorize(roles = []) {
  // the roles parameter specifies which users can access the route.
  // if omitted, it will be accessible to all authenticated users.
  let rolesToCheck = roles;
  if (typeof rolesToCheck === 'string') {
    rolesToCheck = [rolesToCheck];
  }

  return [
    jwt({ secret, algorithms: ['HS256'] }),

    async (req, res, next) => {
      if (req.user) {
        let user = await db.User.findOne({ username: req.user.username });
        if (!user) {
          user = await userService.register({ username: req.user.username });
        }
        if (!user || (rolesToCheck.length && !rolesToCheck.includes(user.role))) {
          return res.status(401).json({ message: 'Unauthorized' });
        }

        req.user = user;
      }
      return next();
    },
  ];
}

module.exports = authorize;
