const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { secretKey, error503Message } = require('../config');
const executeQuery = require('../utils/executeQuery');
const ipRequestLimit = require('../middleware/ipRequestLimit');
const authToken = require('../middleware/authToken');

/** 验证 */
router.post('/tokenAuth', ipRequestLimit(1 * 1000, 5), authToken(), (req, res) => {
  res.status(200).json({ message: '合规路由', user: req.user });
});

/** 登录 */
router.post('/login', ipRequestLimit(10 * 1000, 5), async (req, res) => {
  const { userId, pwd } = req.body;
  if (!pwd) return res.status(401).json({ error: '看不到密码呢QAQ' });

  const query = "SELECT * FROM user_data WHERE id = ?";
  const rows = await executeQuery(query, [userId]);
  if (!rows || !rows[0]) return res.status(503).json({ error: error503Message });
  const hashedPassword = rows[0].hashed_pwd;

  if (!await bcrypt.compare(pwd, hashedPassword)) {
    return res.status(401).json({ error: '密码错误了T^T' });
  } else {
    const token = jwt.sign({ userId }, secretKey, { expiresIn: '30d' });
    return res.status(200).json({ success: true, token: token });
  }
});

/** 修改密码 */
router.post('/api/changePassword', ipRequestLimit(10 * 1000, 5), async (req, res) => {
    const { userId, pwd, newPwd } = req.body;
    if (!pwd || !newPwd) return res.status(401).json({ error: '看不到密码呢QAQ' });
  
    // 查询数据库中存储的加密密码
    const query = "SELECT * FROM user_data WHERE id = ?";
    const rows = await executeQuery(query, [userId]);
    if (!rows[0]) return res.status(503).json({ error: error503Message });
    const hashedPassword = rows[0].hashed_pwd;
  
    // 验证密码
    if (!await bcrypt.compare(pwd, hashedPassword)) {
      return res.status(401).json({ error: '密码错误了T^T' });
    } else {
      const hashedPassword = await bcrypt.hash(newPwd, 10);
      const query = "UPDATE user_data set hashed_pwd = ? WHERE id = ?";
      await executeQuery(query, [hashedPassword, userId]);
      return res.status(200).json({ success: true });
    }
  
  });

module.exports = router;
