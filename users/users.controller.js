const express = require('express');
const authorize = require('../middleware/authorize');
const Role = require('../helpers/role');
const userService = require('./user.service');

const router = express.Router();

module.exports = router;

function deleteUser(req, res, next) {
  userService.getUserByName(req.params.username)
    .then((user) => {
      if (String(user._id) !== req.user.id && req.user.role !== Role.Admin) {
        return res.status(401).json({ message: 'Unauthorized' });
      }
      userService.deleteUser(user.id)
        .then(({ success }) => {
          res.json(success);
        })
        .catch(next);
    })
    .catch(next);
}

function getAll(req, res, next) {
  userService.getAll()
    .then((users) => res.json(users))
    .catch(next);
}

function getByName(req, res, next) {
  userService.getUserByName(req.params.username)
    .then((user) => (user ? res.json(user) : res.sendStatus(404)))
    .catch(next);
}

function getUserFromToken(req, res) {
  return (req.user ? res.json(req.user) : res.sendStatus(401));
}

function getRefreshTokens(req, res, next) {
  if (req.params.id !== req.user.id && req.user.role !== Role.Admin) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  userService.getRefreshTokens(req.params.id)
    .then((tokens) => (tokens ? res.json(tokens) : res.sendStatus(404)))
    .catch(next);
}

function updateUser(req, res, next) {
  userService.updateUser(req.user.id, req.params.username, req.body)
    .then((success) => res.json(success))
    .catch(next);
}

router.delete('/user/:username', authorize(), deleteUser);
router.get('/', authorize(Role.Admin), getAll);
router.get('/user', authorize(), getUserFromToken);
router.get('/user/:username', getByName);
router.put('/user/:username', authorize(), updateUser);
