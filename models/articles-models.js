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

module.exports.fetchArticles = (queryTopic, validTopics) => {
  const validTopicsArr = [undefined];
  
  validTopics.forEach((topic) => {
    validTopicsArr.push(topic.slug)
  })

  if (!validTopicsArr.includes(queryTopic)) {
    return Promise.reject({ status: 404, msg: "Not Found" });
  }
  let sqlQuery = `
  SELECT 
  articles.article_id, 
  articles.title, 
  articles.topic, 
  articles.author, 
  articles.created_at, 
  articles.votes, 
  articles.article_img_url, 
  CAST(COUNT(comments.article_id) AS INTEGER) AS comment_count 
  FROM comments 
  RIGHT JOIN 
  articles 
  ON
  articles.article_id=comments.article_id`;

  const sqlParams = [];
  if (queryTopic) {
    sqlQuery += ` WHERE topic = $1`;
    sqlParams.push(queryTopic);
  }

  sqlQuery += ` GROUP BY articles.article_id ORDER BY created_at DESC`;
  return db
    .query(sqlQuery, sqlParams)
    .then(({ rows }) => {
      return rows;
    })
    .catch((err) => {
      return Promise.reject({ status: 500, msg: "Something Went Wrong" });
    });
};

module.exports.fetchArticleByArticleId = (article_Id) => {
  return db
    .query(
      `
    SELECT
    articles.*,
    CAST(COUNT(comments.article_id) AS INTEGER) AS comment_count 
    FROM articles 
    LEFT JOIN 
    comments 
    ON
    articles.article_id=comments.article_id 
    WHERE articles.article_id = $1 
    GROUP BY articles.article_id`,
      [article_Id]
    )
    .then(({ rows }) => {
      if (rows.length === 0) {
        return Promise.reject({ status: 404, msg: "Article Not Found" });
      }
      return rows[0];
    });
};

module.exports.updateArticle = (article_id, inc_votes = 0) => {
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
