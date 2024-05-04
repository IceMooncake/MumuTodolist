/** ----------导入模块和定义常量值---------- */

const isOnServer = 0;
const error503Message = '数据库连接出错 \n 多试几次吧www';

require('dotenv').config();
const PORT = process.env.PORT || 3000;
const SSH_PATH = process.env.SSH_PATH || '/var/lib';
const OUTER_DB_HOST = process.env.OUTER_DB_HOST || 'localhost';
const INNER_DB_HOST = process.env.INNER_DB_HOST || 'localhost';
const DB_USER = process.env.DB_USER || 'username';
const DB_PASS = process.env.DB_PASS || 'password';
const DB_NAME = process.env.DB_NAME || 'database';
const secretKey = process.env.SECRET_KEY || 'secretKet';

const express = require('express');
const bcrypt = require('bcryptjs');
const bodyParser = require('body-parser');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const mysql = require('mysql2/promise');
const https = require('https');
const fs = require('fs');
const app = express();

// 使用 body-parser 中间件解析请求体
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors());

// 创建数据库连接池
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






/** -------------------------------------------- */
/** ------------可供调用的函数和中间件------------ */
/** -------------------------------------------- */

const authToken = () => {
  return (req, res, next) => {
    const token = req.body.token; // 从请求头中获取 Token
    jwt.verify(token, secretKey, (err, decoded) => {
      if (err) { return res.status(401).json({ error: '令牌不合规' }); }
      else {
        req.user = decoded;
        next();
      }
    });
  }
}

/**-------------------------------
 * 中间件: 限制路由的最大访问次数
 * @param {*} limitTime 限制指定时间(ms)
 * @param {*} maxRequestsPerMinute 最大访问次数，默认为3
 * @returns 
 */
const ipRequestLimit = (limitTime, maxRequestsPerMinute) => {
  const ipRequests = new Map();

  return (req, res, next) => {
    const ip = req.ip; // 获取客户端 IP 地址

    // 如果 IP 地址不存在于记录中，则创建新的记录
    if (!ipRequests.has(ip)) {
      ipRequests.set(ip, { count: 1, timestamp: Date.now() });
    } else {
      // requestInfo: 获取ip
      const requestInfo = ipRequests.get(ip);
      const currentTime = Date.now();
      const IntervalsTime = currentTime - requestInfo.timestamp;

      // 如果时间间隔超过1000ms，则重置计数器和时间戳
      if (IntervalsTime > limitTime) {
        requestInfo.count = 1;
        requestInfo.timestamp = currentTime;
      } else {
        // 如果时间间隔在一分钟内，则增加请求计数
        requestInfo.count++;
      }
      const coolingTime = limitTime - IntervalsTime;
      // 如果请求数超过限制，则返回 429 错误（请求过多）
      if (requestInfo.count > maxRequestsPerMinute) {
        return res.status(429).json({ error: Math.floor(coolingTime / 1000) });
      }
    }

    // 继续处理下一个中间件或路由处理程序
    next();
  };
};

/**-------------------------------
 * 函数：执行查询语句
 * @param {*} query 传入SQL语句
 * @param {*} n 最大重试次数
 * @returns 返回查询结果
 */
async function executeQuery(query, values, n) {
  let connection;
  let retries = 0;
  const maxRetries = n || 3; //默认尝试次数为3

  while (retries < maxRetries) {
    try {
      // 从连接池获取连接
      connection = await pool.getConnection();
      // 执行传入的 SQL 查询语句
      const [rows, fields] = await connection.query(query, values);
      // 返回查询结果
      return rows;
    } catch (error) {
      retries++;
      if (retries >= maxRetries) {
        if (error) console.error('出现错误:', error.message);
        return null;
      }
    } finally {
      if (connection) connection.release();
    }
  }
}








/** ------------------------------------------ */
/** -------------------路由------------------- */
/** ------------------------------------------ */

/**
 * token验证
 */
app.post('/api/tokenAuth', ipRequestLimit(1 * 1000, 5), authToken(), (req, res) => {
  res.status(200).json({ message: '合规路由', user: req.user });
});

/**
 * 登录的post路由
 */
app.post('/api/login', ipRequestLimit(10 * 1000, 5), async (req, res) => {
  const { userId, pwd } = req.body;
  if (!pwd) return res.status(401).json({ error: '看不到密码呢QAQ' });

  // 查询数据库中存储的加密密码
  const query = "SELECT * FROM user_data WHERE id = ?";
  const rows = await executeQuery(query, [userId]);
  if (!rows[0]) return res.status(503).json({ error: error503Message });
  const hashedPassword = rows[0].hashed_pwd;

  // 验证密码
  if (!await bcrypt.compare(pwd, hashedPassword)) {
    return res.status(401).json({ error: '密码错误了T^T' });
  } else {
    // 登录成功，生成token
    const token = jwt.sign({ userId }, secretKey, { expiresIn: '30d' });
    return res.status(200).json({ success: true, token: token });
  }

});

/**
 * 获取任务列表
 */
app.get('/api/getTasks', ipRequestLimit(1 * 1000, 10), async (req, res) => {
  // 查询数据库中存储的加密密码
  const query = "SELECT * FROM task_list WHERE user_id = ?";
  const rows = await executeQuery(query, [req.query.userId], 5);
  if (!rows) return res.status(503).json({ error: error503Message });
  return res.status(200).json({ success: true, tasks: rows, query: req.query });
})

/**
 * 获取当前正在做的任务ID
 */
app.get('/api/getCurrentTaskId', ipRequestLimit(1 * 1000, 10), async (req, res) => {
  const query = "SELECT * FROM user_data WHERE id = ?";
  const rows = await executeQuery(query, [req.query.userId]);
  if (!rows[0]) return res.status(503).json({ error: error503Message });
  return res.status(200).json({ taskId: rows[0].current_task_id });
})

/**
 * 增加任务列表
 */
app.post('/api/addTask', ipRequestLimit(1 * 1000, 10), async (req, res) => {
  const { user_id, task_name, task_detail, deadline } = req.body;
  const query = "INSERT INTO task_list (user_id, task_name, task_detail, deadline) VALUES (?, ?, ?, ?)";
  const rows = await executeQuery(query, [user_id, task_name, task_detail, deadline]);
  if (!rows) return res.status(503).json({ error: error503Message });
  return res.status(200).json({ success: true });
})

/**
 * 删除任务列表
 */
app.delete('/api/deleteTask/:taskId', ipRequestLimit(1 * 1000, 10), async (req, res) => {
  const query = "DELETE FROM task_list WHERE id = ?"
  const rows = await executeQuery(query, [req.params.taskId]);
  if (rows.affectedRows == 0) return res.status(503).json({ error: error503Message });
  return res.status(200).json({ success: true });
})

/**
 * 修改任务列表
 */
app.put('/api/updateTask', ipRequestLimit(1 * 1000, 10), async (req, res) => {
  const { task_id, user_id, task_name, task_detail, deadline } = req.body;
  const query = "UPDATE task_list SET user_id = ?, task_name = ?, task_detail = ?, deadline = ? WHERE id = ?";
  const rows = await executeQuery(query, [user_id, task_name, task_detail, deadline, task_id]);
  if (!rows) return res.status(503).json({ error: error503Message });
  return res.status(200).json({ success: true });
})

/**
 * 设置正在做的任务或取消(taskId传入null)
 */
app.post('/api/setCurrentTask', ipRequestLimit(1 * 1000, 10), async (req, res) => {
  const { taskId, userId } = req.body;
  const query = "UPDATE user_data SET current_task_id = ? WHERE id = ?";
  const rows = await executeQuery(query, [taskId, userId]);
  if (!rows) return res.status(503).json({ error: error503Message });
  return res.status(200).json({ success: true });
})

/**
 * 完成一个任务或取消(finish_time传入null)
 */
app.post('/api/completTask', ipRequestLimit(1 * 1000, 10), async (req, res) => {
  const { taskId, finishTime } = req.body;
  const query = "UPDATE task_list SET finish_time = ? WHERE id = ?";
  const rows = await executeQuery(query, [finishTime, taskId]);
  if (!rows) return res.status(503).json({ error: error503Message });
  return res.status(200).json({ success: true });
})

/**
 * 修改密码
 */
app.post('/api/changePassword', ipRequestLimit(10 * 1000, 5), async (req, res) => {
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

























if (isOnServer == 1) {
  //启动 HTTPS 服务器
  const server = https.createServer({
    key: fs.readFileSync(SSH_PATH + 'privkey.pem'),
    cert: fs.readFileSync(SSH_PATH + 'fullchain.pem')
  }, app);

  server.listen(PORT, () => {
    console.log(`HTTPS Server running on port ${PORT}`);
  });
} else {
  // 启动 Express 服务器
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

/**
 * ----------------------------------------------------------------
 * ----------------------------------------------------------------
 * |                                                              |
 * |      下面的路由已经废弃，仅供学习参考！！！！！！                |
 * |      下面的路由已经废弃，仅供学习参考！！！！！！                |
 * |      下面的路由已经废弃，仅供学习参考！！！！！！                |
 * |                                                              |
 * ----------------------------------------------------------------
 * ----------------------------------------------------------------
 */

// 处理注册请求
app.post('/api/register_disposed', ipRequestLimit(1, -1), async (req, res) => {
  //初始密码000000, lly520
  try {
    const { password } = req.body;

    // 使用 bcrypt 对密码进行加密
    const hashedPassword = await bcrypt.hash(password, 10); // 10 是加密强度
    // 插入用户信息到数据库
    const serverTime = new Date();
    serverTime.setHours(serverTime.getHours() + 8); //+8时区
    const currentTime = serverTime.toISOString().slice(0, 19).replace('T', ' ');
    await pool.query('INSERT INTO user_data(hashed_pwd) VALUES (?)', [hashedPassword]);
    return res.status(200).json({ success: true, message: '注册成功' });
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * 获取当前服务器时间
 */
app.get('/api/getCurrentTime_disposed', ipRequestLimit(1, -1), async (req, res) => {
  const serverTime = new Date();
  serverTime.setHours(serverTime.getHours() + 8); //+8时区
  return res.status(200).json({ currentTime: serverTime });
})

/**
 * 根据任务ID获取一个任务
 */
app.get('/api/getTaskById_disposed', ipRequestLimit(1, -1), async (req, res) => {
  const quert = "SELECT * FROM task_list WHERE id = ?";
  const rows = await executeQuery(quert, [req.query.taskId]);
  if (!rows) return res.status(503).json({ error: error503Message });
  return res.status(200).json({ task: rows[0] });
})