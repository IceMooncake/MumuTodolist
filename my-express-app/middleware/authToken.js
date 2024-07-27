const jwt = require('jsonwebtoken');
const { secretKey } = require('../config');

const authToken = () => {
  return (req, res, next) => {
    const token = req.body.token;
    jwt.verify(token, secretKey, (err, decoded) => {
      if (err) {
        return res.status(401).json({ error: '令牌不合规' });
      }
      req.user = decoded;
      next();
    });
  };
};

module.exports = authToken;
