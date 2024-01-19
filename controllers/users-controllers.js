const {
  fetchUsers,
  fetchUserByUsername,
} = require("../models/users-models.js");

module.exports.getUsers = (req, res, next) => {
  fetchUsers().then((users) => {
    res.status(200).send({ users });
  });
};
module.exports.getUserByUsername = (req, res, next) => {
  fetchUserByUsername(req.params.username)
    .then((user) => {
      res.status(200).send({ user });
    })
    .catch((err) => {
      next(err);
    });
};
