const moment = require('moment');
const executeQuery = require('../utils/executeQuery');

// 查询循环任务并处理
async function processRepeatTasks() {
  const now = moment();
  const query = `SELECT * FROM repeat_task WHERE (repeat_hour = ? AND repeat_minute = ?) AND (next_run <= ?)`;
  // 获取需要刷新的任务
  const tasks = await executeQuery(query, [now.hour(), now.minute(), now.toDate()]);
  if (tasks && tasks.length > 0) {
    for (const task of tasks) {
      let deadlineDate = moment(task.next_run);
      // 处理时间
      const timeParts = task.deadline.split(':');
      const deadlineHours = parseInt(timeParts[0], 10);
      const deadlineMinutes = parseInt(timeParts[1], 10);
      deadlineDate.set({ hour: deadlineHours, minute: deadlineMinutes, second: 0 });
      // 插入到 task 表
      const insertQuery = `INSERT INTO task_list (user_id, show_only_theday, task_name, task_detail, deadline) VALUES (?, ?, ?, ?, ?)`;
      await executeQuery(insertQuery, [task.user_id, 1, task.task_name, task.task_detail, deadlineDate.toDate()]);
      // 计算下次执行时间
      let nextRun = moment(task.next_run);
      nextRun.add(task.interval_value, task.interval_unit);
      nextRun.set({ hour: task.repeat_hour, minute: task.repeat_minute, second: 0 });
      // 更新 last_run
      const updateQuery = `UPDATE repeat_task SET next_run = ? WHERE id = ?`;
      await executeQuery(updateQuery, [nextRun.toDate(), task.id]);
    }
  }
}

// 定时任务调用
setInterval(processRepeatTasks, 60000); // 每分钟检查一次
