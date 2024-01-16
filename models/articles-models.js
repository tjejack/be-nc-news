const format = require("pg-format");
const db = require("../db/connection.js");
const comments = require("../db/data/test-data/comments.js");

module.exports.fetchArticles = () => {
  return db
    .query(`SELECT * FROM articles ORDER BY created_at DESC`)
    .then(({ rows }) => {
      const articles = rows;
      const commentedArticles = articles.map((article) => {
        return db
          .query(`SELECT * FROM comments WHERE comments.article_id = $1`, [
            article.article_id,
          ])
          .then(({ rows }) => {
            const comments = rows.length;
            delete article.body;
            article.comment_count = comments;
            return article;
          });
      });
      return Promise.all(commentedArticles);
    })
    .then((articles) => {
      return articles;
    })
    .catch((err) => {
      return Promise.reject({ status: 500 });
    });
};

module.exports.fetchArticleByArticleId = (article_Id) => {
  if (isNaN(article_Id)) {
    return Promise.reject({ status: 400 });
  }
  return db
    .query(`SELECT * FROM articles WHERE article_id = $1`, [article_Id])
    .then(({ rows }) => {
      if (rows.length > 0) {
        return rows[0];
      }
      return Promise.reject({ status: 404 });
    });
};
