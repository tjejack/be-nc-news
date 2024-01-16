const {
  fetchArticles,
  fetchArticleByArticleId,
} = require("../models/articles-models.js");

module.exports.getArticles = (req, res, next) => {
  fetchArticles().then((articles) => {
    res.status(200).send({ articles });
  });
};

module.exports.getArticleByArticleId = (req, res, next) => {
  fetchArticleByArticleId(req.params.article_id)
    .then((article) => {
      res.status(200).send({ article });
    })
    .catch((err) => {
      next(err);
    });
};
