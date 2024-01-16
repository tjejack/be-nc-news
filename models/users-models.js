const db = require("../db/connection.js");

module.exports.checkUserExists = (username) => {
  return db.query(`SELECT * FROM users WHERE username = $1`, [username]).then(({ rows }) => {
    if (rows.length === 0) {
      return Promise.reject({ status: 400, msg: "Bad Request - No Such User" });
    }
  });
};