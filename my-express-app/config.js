require('dotenv').config();

module.exports = {
  PORT: process.env.PORT || 3000,
  SSH_PATH: process.env.SSH_PATH || '/var/lib',
  OUTER_DB_HOST: process.env.OUTER_DB_HOST || 'localhost',
  INNER_DB_HOST: process.env.INNER_DB_HOST || 'localhost',
  DB_USER: process.env.DB_USER || 'username',
  DB_PASS: process.env.DB_PASS || 'password',
  DB_NAME: process.env.DB_NAME || 'database',
  secretKey: process.env.SECRET_KEY || 'secretKet',
  isOnServer: process.env.IS_ON_SERVER || 0,
  error401Message: '认证失败',
  error503Message: '数据库执行失败',
};
