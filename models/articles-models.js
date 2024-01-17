const format = require("pg-format");
const db = require("../db/connection.js");

module.exports.checkArticleExists = (article_id) => {
  if (isNaN(article_id)) {
    return Promise.reject({ status: 400, msg: "Bad Request" });
  }
  return db
    .query(`SELECT * FROM articles WHERE article_id = $1`, [article_id])
    .then(({ rows }) => {
      if (rows.length === 0) {
        return Promise.reject({ status: 404, msg: "Article Not Found" });
      }
    });
};

module.exports.fetchArticles = (topic) => {
  const validTopics = [undefined, 'cats', 'mitch', 'paper']
  
  if(!validTopics.includes(topic)){
    return Promise.reject({ status: 400, msg: "Invalid Query" });
  }
  let sqlQuery = `SELECT article_id, title, topic, author, created_at, votes, article_img_url FROM articles`;

  const sqlParams = [];
  if (topic) {
    sqlQuery += ` WHERE topic = $1`;
    sqlParams.push(topic);
  }
  sqlQuery += ` ORDER BY created_at DESC`;
  return db
    .query(sqlQuery, sqlParams)
    .then(({ rows }) => {
      const articles = rows;
      const commentedArticles = articles.map((article) => {
        return db
          .query(
            `SELECT COUNT (*) FROM comments WHERE comments.article_id = $1`,
            [article.article_id]
          )
          .then(({ rows }) => {
            article.comment_count = Number(rows[0].count);
            return article;
          });
      });
      return Promise.all(commentedArticles);
    })
    .then((articles) => {
      return articles;
    })
    .catch((err) => {
      return Promise.reject({ status: 500, msg: "Something Went Wrong" });
    });
};

module.exports.fetchArticleByArticleId = (article_Id) => {
  return db
    .query(`SELECT * FROM articles WHERE article_id = $1`, [article_Id])
    .then(({ rows }) => {
      if (rows.length > 0) {
        return rows[0];
      }
      return Promise.reject({ status: 404, msg: "Article Not Found" });
    });
};

module.exports.updateArticle = (article_id, inc_votes=0) => {
  return db
    .query(
      `UPDATE articles SET votes = votes+$1 WHERE article_id = $2 RETURNING *`,
      [inc_votes, article_id]
    )
    .then(({ rows }) => {
      return rows[0];
    })
    .catch((err) => {
      return Promise.reject({ status: 400, msg: "Bad Request" });
    });
};
