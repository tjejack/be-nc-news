const { fetchUsers } = require("../models/users-models.js");

module.exports.getUsers = (req, res, next) => {
  fetchUsers().then((users) => {
    res.status(200).send({ users });
  });
};
