const express = require('express');
const router = express.Router();
const executeQuery = require('../utils/executeQuery');
const ipRequestLimit = require('../middleware/ipRequestLimit');
const { error503Message } = require('../config');

function isBeforeStartOfToday(date) {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    if (new Date(date) < now) return true;
    else return false;
}

/** 获取任务列表 */
router.get('/getRepeatTasks', ipRequestLimit(1 * 1000, 10), async (req, res) => {
    const query = "SELECT * FROM repeat_task WHERE user_id = ?";
    const rows = await executeQuery(query, [req.query.userId], 5);
    if (!rows) return res.status(503).json({ error: error503Message });
    return res.status(200).json({ success: true, tasks: rows, query: req.query });
});

/** 增加任务列表 */
router.post('/addRepeatTask', ipRequestLimit(1 * 1000, 10), async (req, res) => {
    const { user_id, task_name, task_detail, deadline, interval_unit, interval_value, next_run } = req.body;
    if (isBeforeStartOfToday(new Date(next_run))) return res.status(400).json({ error: "日期不可早于今天" });
    const query = "INSERT INTO repeat_task (user_id, task_name, task_detail, deadline, interval_unit, interval_value, next_run) VALUES (?, ?, ?, ?, ?, ?, ?)";
    const rows = await executeQuery(query, [user_id, task_name, task_detail, deadline, interval_unit, interval_value, next_run]);
    if (!rows) return res.status(503).json({ error: error503Message });
    return res.status(200).json({ success: true });
})

/** 删除任务列表 */
router.delete('/deleteRepeatTask/:taskId', ipRequestLimit(1 * 1000, 10), async (req, res) => {
    const query = "DELETE FROM repeat_task WHERE id = ?"
    const rows = await executeQuery(query, [req.params.taskId]);
    if (rows.affectedRows == 0) return res.status(503).json({ error: error503Message });
    return res.status(200).json({ success: true });
})

/** 修改任务列表 */
router.put('/updateRepeatTask', ipRequestLimit(1 * 1000, 10), async (req, res) => {
    const { task_id, task_name, task_detail, deadline, interval_unit, interval_value, next_run, repeat_hour, repeat_minute } = req.body;
    if (isBeforeStartOfToday(new Date(next_run))) return res.status(400).json({ error: "日期不可早于今天" });
    const query = "UPDATE repeat_task SET task_name = ?, task_detail = ?, deadline = ?, interval_unit = ?, interval_value = ?, next_run = ? WHERE id = ?";
    const rows = await executeQuery(query, [task_name, task_detail, deadline, interval_unit, interval_value, next_run, task_id]);
    if (rows.affectedRows == 0) return res.status(503).json({ error: error503Message });
    return res.status(200).json({ success: true });
})


module.exports = router;
