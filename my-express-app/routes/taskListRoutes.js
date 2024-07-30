const express = require('express');
const router = express.Router();
const executeQuery = require('../utils/executeQuery');
const ipRequestLimit = require('../middleware/ipRequestLimit');
const { error503Message } = require('../config');

/** 获取任务列表 */
router.get('/getTasks', ipRequestLimit(1 * 1000, 10), async (req, res) => {
    const query = "SELECT * FROM task_list WHERE user_id = ?";
    const rows = await executeQuery(query, [req.query.userId], 5);
    if (!rows) return res.status(503).json({ error: error503Message });
    return res.status(200).json({ success: true, tasks: rows, query: req.query });
});

/** 获取当前正在做的任务ID */
router.get('/getCurrentTaskId', ipRequestLimit(1 * 1000, 10), async (req, res) => {
    const query = "SELECT * FROM user_data WHERE id = ?";
    const rows = await executeQuery(query, [req.query.userId]);
    if (!rows || !rows[0]) return res.status(503).json({ error: error503Message });
    return res.status(200).json({ taskId: rows[0].current_task_id });
});

/** 增加任务列表 */
router.post('/addTask', ipRequestLimit(1 * 1000, 10), async (req, res) => {
    const { user_id, show_only_theday, task_name, task_detail, deadline } = req.body;
    const query = "INSERT INTO task_list (user_id, show_only_theday, task_name, task_detail, deadline) VALUES (?, ?, ?, ?, ?)";
    const rows = await executeQuery(query, [user_id, show_only_theday, task_name, task_detail, deadline]);
    if (!rows) return res.status(503).json({ error: error503Message });
    return res.status(200).json({ success: true });
})

/** 删除任务列表 */
router.delete('/deleteTask/:taskId', ipRequestLimit(1 * 1000, 10), async (req, res) => {
    const query = "DELETE FROM task_list WHERE id = ?"
    const rows = await executeQuery(query, [req.params.taskId]);
    if (rows.affectedRows == 0) return res.status(503).json({ error: error503Message });
    return res.status(200).json({ success: true });
})

/** 修改任务列表 */
router.put('/updateTask', ipRequestLimit(1 * 1000, 10), async (req, res) => {
    const { task_id, task_name, task_detail, deadline } = req.body;
    const query = "UPDATE task_list SET task_name = ?, task_detail = ?, deadline = ? WHERE id = ?";
    const rows = await executeQuery(query, [task_name, task_detail, deadline, task_id]);
    if (!rows) return res.status(503).json({ error: error503Message });
    return res.status(200).json({ success: true });
})

/** 设置当前任务 */
router.post('/setCurrentTask', ipRequestLimit(1 * 1000, 10), async (req, res) => {
    const { taskId, userId } = req.body;
    const query = "UPDATE user_data SET current_task_id = ? WHERE id = ?";
    const rows = await executeQuery(query, [taskId, userId]);
    if (!rows) return res.status(503).json({ error: error503Message });
    return res.status(200).json({ success: true });
})

/** 完成任务 */
router.post('/completTask', ipRequestLimit(1 * 1000, 10), async (req, res) => {
    const { taskId, finishTime } = req.body;
    const query = "UPDATE task_list SET finish_time = ? WHERE id = ?";
    const rows = await executeQuery(query, [finishTime, taskId]);
    if (!rows) return res.status(503).json({ error: error503Message });
    return res.status(200).json({ success: true });
})


module.exports = router;
