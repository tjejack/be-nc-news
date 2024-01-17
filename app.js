const express = require("express");
const app = express();
const { getEndpoints } = require("./controllers/api-controllers.js");
const { getTopics } = require("./controllers/topics-controllers.js");
const {
  getArticles,
  getArticleByArticleId,
  patchArticle,
} = require("./controllers/articles-controllers.js");
const {
  getArticleComments,
  postComment,
  deleteComment,
} = require("./controllers/comments-controllers.js");
const {getUsers} = require("./controllers/users-controllers.js")


app.use(express.json());

app.get("/api", getEndpoints);

app.get("/api/topics", getTopics);
app.get("/api/users", getUsers);
app.get("/api/articles", getArticles);
app.get("/api/articles/:article_id", getArticleByArticleId);
app.get("/api/articles/:article_id/comments", getArticleComments)


app.post("/api/articles/:article_id/comments", postComment)

app.patch("/api/articles/:article_id", patchArticle)

app.delete("/api/comments/:comment_id", deleteComment);

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
