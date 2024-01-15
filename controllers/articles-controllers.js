const { fetchArticleByArticleId } = require("../models/articles-models.js");

module.exports.getArticleByArticleId = (req, res, next) => {
  fetchArticleByArticleId(req.params.article_id)
    .then((article) => {
      res.status(200).send({ article });
    })
    .catch((err) => {
      next(err);
    });
};
