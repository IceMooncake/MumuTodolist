const pool = require('../db/database');

async function executeQuery(query, values, n) {
  let connection;
  let retries = 0;
  const maxRetries = n || 3;

  while (retries < maxRetries) {
    try {
      connection = await pool.getConnection();
      const [rows, fields] = await connection.query(query, values);
      return rows;
    } catch (error) {
      retries++;
      if (retries >= maxRetries) {
        console.error('出现错误:', error.message);
        return null;
      }
    } finally {
      if (connection) connection.release();
    }
  }
}

module.exports = executeQuery;
