const usersRouter = require("express").Router();
const { getUsers } = require("../controllers/users-controllers.js");

usersRouter.get("/", getUsers);

module.exports = usersRouter;