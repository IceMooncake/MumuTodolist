const jwt = require('jsonwebtoken');
const { error401Message, secretKey } = require('../config');

const authToken = () => {
  return (req, res, next) => {
    const token = req.body.token;
    jwt.verify(token, secretKey, (err, decoded) => {
      if (err) {
        return res.status(401).json({ error: error401Message });
      }
      req.user = decoded;
      next();
    });
  };
};

module.exports = authToken;
