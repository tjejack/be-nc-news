const format = require("pg-format");
const db = require("../db/connection.js");

module.exports.checkCommentExists = (comment_id) => {
  if (isNaN(comment_id)) {
    return Promise.reject({ status: 400, msg: "Bad Request" });
  }
  return db
    .query(`SELECT * FROM comments WHERE comment_id = $1`, [comment_id])
    .then(({ rows }) => {
      if (rows.length === 0) {
        return Promise.reject({ status: 404, msg: "Comment Not Found" });
      }
    });
};

module.exports.fetchArticleComments = (article_id, queries) => {
  const validQueries = ["limit", "p"];
  const queriesPassed = Object.keys(queries);
  for (let i = 0; i < queriesPassed.length; i++) {
    if (!validQueries.includes(queriesPassed[i])) {
      return Promise.reject({ status: 400, msg: "Bad Request" });
    }
  }
  let sqlQuery = `SELECT * FROM comments WHERE article_id = ${article_id} ORDER BY created_at DESC`;
  let pageLimit = 10;
  if (queries.limit) {
    if (isNaN(queries.limit)) {
      return Promise.reject({ status: 404, msg: "Not Found" });
    }
    pageLimit = queries.limit;
  }
  sqlQuery += ` LIMIT ${pageLimit}`;
  if (queries.p) {
    if (isNaN(queries.p)) {
      return Promise.reject({ status: 404, msg: "Not Found" });
    }
    const pageStart = pageLimit * (queries.p - 1);
    sqlQuery += ` OFFSET ${pageStart}`;
  }
  sqlQuery += `; SELECT CAST(COUNT(comments.comment_id) AS INTEGER) FROM comments`;
  return db.query(sqlQuery).then((result) => {
    return {
      comments: result[0].rows,
      total_count: result[1].rows[0].count,
    };
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

module.exports.removeComment = (comment_id) => {
  return db
    .query(`DELETE FROM comments WHERE comment_id = $1 RETURNING *`, [
      comment_id,
    ])
    .then(({ rows }) => {
      if (rows.length === 0) {
        return Promise.reject({ status: 404, msg: "Comment Not Found" });
      }
    });
};

module.exports.updateComment = (comment_id, inc_votes = 0) => {
  return db
    .query(
      `UPDATE comments SET votes = votes+$1 WHERE comment_id = $2 RETURNING *`,
      [inc_votes, comment_id]
    )
    .then(({ rows }) => {
      return rows[0];
    })
    .catch((err) => {
      return Promise.reject({ status: 400, msg: "Bad Request" });
    });
};
