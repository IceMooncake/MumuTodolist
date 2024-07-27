const mysql = require('mysql2/promise');
const { OUTER_DB_HOST, INNER_DB_HOST, DB_USER, DB_PASS, DB_NAME, isOnServer } = require('../config');

const pool = mysql.createPool({
  host: isOnServer == 1 ? INNER_DB_HOST : OUTER_DB_HOST,
  user: DB_USER,
  password: DB_PASS,
  database: DB_NAME,
  waitForConnections: true,
  connectionLimit: 20,
  queueLimit: 0,
  connectTimeout: 3000
});

module.exports = pool;
