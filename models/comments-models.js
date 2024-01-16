const format = require("pg-format");
const db = require("../db/connection.js");
const { convertTimestampToDate } = require("../db/seeds/utils.js");

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

module.exports.addComment = (article_id, comment_body, username) => {
  const date = new Date();
  const created_at = date.toISOString();
  const commentData = [comment_body, 0, username, article_id, created_at];
  const sqlQuery = format(
    `INSERT INTO comments (body, votes, author, article_id, created_at) VALUES %L RETURNING *`,
    [commentData]
  );
  return db.query(sqlQuery).then(({ rows }) => {
    return rows[0];
  });
};
