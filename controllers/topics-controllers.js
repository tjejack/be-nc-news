const { fetchTopics, addTopic, checkTopicExists } = require("../models/topics-models.js");

module.exports.getTopics = (req, res, next) => {
  fetchTopics()
    .then((topics) => {
      res.status(200).send({ topics });
    })
    .catch((err) => {
      next(err);
    });
};

module.exports.postTopics = (req, res, next) => {
  addTopic(req.body.slug, req.body.description)
    .then((topic) => {
      res.status(201).send({ topic });
    })
    .catch((err) => {
      next(err);
    });
};
