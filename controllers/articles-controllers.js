const {
  fetchArticles,
  fetchArticleByArticleId,
  updateArticle,
  checkArticleExists,
  addArticle,
} = require("../models/articles-models.js");

const { fetchTopics, checkTopicExists } = require("../models/topics-models.js");
const { checkUserExists } = require("../models/users-models.js");

module.exports.getArticles = (req, res, next) => {
  fetchTopics().then((validTopics) => {
    fetchArticles(req.query, validTopics)
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

module.exports.postArticle = (req, res, next) => {
  const realTopic = checkTopicExists(req.body.topic);
  const realUser = checkUserExists(req.body.author);
  Promise.all([realTopic, realUser])
  .then(() => {
      return addArticle(
        req.body.author,
        req.body.title,
        req.body.body,
        req.body.topic,
        req.body.article_img_url
      );
    })
    .then((article) => {
      res.status(201).send({ article });
    })
    .catch((err) => {
      next(err);
    });
};
