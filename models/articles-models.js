const format = require("pg-format");
const db = require("../db/connection.js");

module.exports.fetchArticleByArticleId = (article_Id) => {
  if (isNaN(article_Id)) {
    return Promise.reject({ status: 400 });
  } else {
    return db
      .query(`SELECT * FROM articles WHERE article_id = $1`, [article_Id])
      .then(({ rows }) => {
        if (rows.length > 0) {
          return rows[0];
        } else {
          return Promise.reject({ status: 404 });
        }
      });
  }
};
