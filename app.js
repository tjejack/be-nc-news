const express = require("express");
const app = express();
const { getEndpoints } = require("./controllers/api-controllers.js");
const { getTopics } = require("./controllers/topics-controllers.js");
const {
  getArticles,
  getArticleByArticleId,
} = require("./controllers/articles-controllers.js");
const { getArticleComments } = require("./controllers/comments-controllers.js");

app.get("/api", getEndpoints);
app.get("/api/topics", getTopics);
app.get("/api/articles", getArticles);
app.get("/api/articles/:article_id", getArticleByArticleId);
app.get("/api/articles/:article_id/comments", getArticleComments)

app.all("*", (req, res) => {
  res.status(404).send({ msg: "Endpoint Not Found" });
});

app.use((err, req, res, next) => {
  if (err.status && err.msg) {
    res.status(err.status).send({ msg: err.msg });
  } else {
    next(err);
  }
});

app.use((err, req, res, next) => {
  res.status(500).send({ msg: "Something Went Wrong!" });
});

module.exports = app;
