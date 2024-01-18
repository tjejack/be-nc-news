const {
  fetchArticles,
  fetchArticleByArticleId,
  updateArticle,
  checkArticleExists,
} = require("../models/articles-models.js");
const { fetchTopics } = require("../models/topics-models.js");

module.exports.getArticles = (req, res, next) => {
  fetchTopics().then((validTopics) => {
    fetchArticles(req.query.topic, validTopics)
      .then((articles) => {
        res.status(200).send({ articles });
      })
      .catch((err) => {
        next(err);
      });
  });
};

module.exports.getArticleByArticleId = (req, res, next) => {
  const exists = checkArticleExists(req.params.article_id);
  const article = fetchArticleByArticleId(req.params.article_id);
  Promise.all([article, exists])
    .then((returns) => {
      const article = returns[0];
      res.status(200).send({ article });
    })
    .catch((err) => {
      next(err);
    });
};

module.exports.patchArticle = (req, res, next) => {
  const exists = checkArticleExists(req.params.article_id);
  const article = updateArticle(req.params.article_id, req.body.inc_votes);
  Promise.all([article, exists])
    .then((result) => {
      const article = result[0];
      res.status(200).send({ article });
    })
    .catch((err) => {
      next(err);
    });
};
