const format = require("pg-format");
const db = require("../db/connection.js");

module.exports.fetchTopics = () => {
  return db.query(`SELECT * FROM topics;`).then(({ rows }) => {
    return rows;
  });
};

module.exports.checkTopicExists = (possibleTopic) => {
  return db
    .query(`SELECT * FROM topics WHERE slug = $1`, [possibleTopic])
    .then(({ rows }) => {
      if (rows.length === 0) {
        return Promise.reject({
          status: 400,
          msg: "Bad Request - No Such Topic",
        });
      }
    });
};

module.exports.addTopic = (slug, description) => {
  if (!slug || !description) {
    return Promise.reject({
      status: 400,
      msg: "Bad Request - Missing Properties",
    });
  }
  const topicData = [slug, description];
  const sqlQuery = format(
    `INSERT INTO topics (slug, description) VALUES %L RETURNING *`,
    [topicData]
  );
  return db
    .query(sqlQuery)
    .then(({ rows }) => {
      return rows[0];
    })
};
