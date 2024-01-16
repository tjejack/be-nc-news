const format = require("pg-format");
const db = require("../db/connection.js");

module.exports.fetchArticleComments = (article_id) => {
  return db
    .query(
      `SELECT * FROM comments WHERE article_id = $1 ORDER BY created_at DESC`,
      [article_id]
    )
    .then(({ rows }) => {
      return rows;
    });
};

module.exports.checkCategoryExists = (article_id) => {
    if (isNaN(article_id)) {
        return Promise.reject({ status: 400, msg: 'Bad Request' });
      }
    return db
      .query(`SELECT * FROM articles WHERE article_id = $1`, [article_id])
      .then(({ rows }) => {
        if (rows.length === 0) {
          return Promise.reject({ status: 404, msg: 'Article Not Found' });
        }
      });
  };