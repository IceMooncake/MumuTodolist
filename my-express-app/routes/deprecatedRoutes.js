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