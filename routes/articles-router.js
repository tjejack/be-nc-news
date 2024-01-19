const {
  getArticles,
  getArticleByArticleId,
  patchArticle,
} = require("../controllers/articles-controllers.js");
const {
  getArticleComments,
  postComment,
} = require("../controllers/comments-controllers.js");
const articlesRouter = require("express").Router();

articlesRouter.get("/", getArticles);

articlesRouter
  .route("/:article_id")
  .get(getArticleByArticleId)
  .patch(patchArticle);

articlesRouter
  .route("/:article_id/comments")
  .get(getArticleComments)
  .post(postComment);

module.exports = articlesRouter;
