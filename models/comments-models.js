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
}

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

module.exports.removeComment = (comment_id) => {
  return db.query(`DELETE FROM comments WHERE comment_id = $1 RETURNING *`, [comment_id]).then(({rows})=>{
    if(rows.length===0){
      return Promise.reject({ status: 404, msg: "Comment Not Found" });
    }
  })
}

module.exports.updateComment = (comment_id, inc_votes=0) => {
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
}