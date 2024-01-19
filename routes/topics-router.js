const topicsRouter = require("express").Router();
const { getTopics } = require("../controllers/topics-controllers.js");

topicsRouter.get("/", getTopics);

module.exports = topicsRouter;
