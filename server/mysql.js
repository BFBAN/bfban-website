const mysql = require('mysql');

const {
  host,
  user,
  password,
  database,
  charset,
  connectionLimit,
} = require('./config').mysql;

const pool = mysql.createPool({
  host, user, password, database, connectionLimit,
});


// https://chenshenhai.github.io/koa2-note/note/mysql/async.html
function query(sql, values) {
  return new Promise((resolve, reject) => {
    pool.getConnection((err, connection) => {
      if (err) {
        reject(err);
      } else {
        connection.query(sql, values, (error, rows) => {
          if (error) {
            reject(error);
          } else {
            resolve(rows);
          }
          connection.release();
        });
      }
    });
  });
}

module.exports = { query };
