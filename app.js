const express = require("express");
const app = express();
const { getEndpoints } = require("./controllers/api-controllers.js");
const { getTopics } = require("./controllers/topics-controllers.js");
const {
  getArticleByArticleId,
} = require("./controllers/articles-controllers.js");

app.get("/api", getEndpoints);
app.get("/api/topics", getTopics);
app.get("/api/articles/:article_id", getArticleByArticleId);

app.all("*", (req, res) => {
  res.status(404).send({ msg: "Endpoint Not Found" });
});

app.use((err, req, res, next) => {
  if (err.status === 400) {
    res.status(400).send({ msg: "Bad Request" });
  } else {
    next(err);
  }
});

app.use((err, req, res, next) => {
  if (err.status === 404) {
    res.status(404).send({ msg: "Not Found" });
  } else {
    next(err);
  }
});

app.use((err, req, res, next) => {
  res.status(500).send({ msg: "Something Went Wrong!" });
});

module.exports = app;
