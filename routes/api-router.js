const apiRouter = require("express").Router();
const articlesRouter = require("./articles-router.js");
const commentsRouter = require("./comments-router.js");
const topicsRouter = require("./topics-router.js");
const usersRouter = require("./users.router.js");
const { getEndpoints } = require("../controllers/api-controllers.js");

apiRouter.get("/", getEndpoints);

apiRouter.use("/articles", articlesRouter);
apiRouter.use("/topics", topicsRouter);
apiRouter.use("/users", usersRouter);
apiRouter.use("/comments", commentsRouter);

module.exports = apiRouter;
