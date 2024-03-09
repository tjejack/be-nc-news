const {
  getArticles,
  getArticleByArticleId,
  patchArticle,
  postArticle,
  deleteArticle,
} = require("../controllers/articles-controllers.js");
const {
  getArticleComments,
  postComment,
} = require("../controllers/comments-controllers.js");
const articlesRouter = require("express").Router();

articlesRouter.route("/").get(getArticles).post(postArticle);

articlesRouter
  .route("/:article_id")
  .get(getArticleByArticleId)
  .patch(patchArticle)
  .delete(deleteArticle);

articlesRouter
  .route("/:article_id/comments")
  .get(getArticleComments)
  .post(postComment);

module.exports = articlesRouter;
