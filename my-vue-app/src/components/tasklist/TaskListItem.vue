<template>
  <div class="task-info" :class="{'task-info-hidden':isHidden === true}">
    <!-- 任务名称 -->
    <h2 class="task-name">{{ item.task_name }}</h2>
    <!-- 任务详情 -->
    <p class="task-detail">{{ item.task_detail }}</p>
    <!-- 任务时间 -->
    <div class="task-time-container">
      <span class="task-time-text" :class="{ 'task-time-overtime': item.isOverTime && !item.finish_time }">
        {{ item.showDeadline }}
      </span>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    item: Object,
    isHidden: Boolean,
  }
}
</script>

<style scoped>
.task-info {
  position: absolute;
  flex-direction: column;
  margin: 5px;
  top: 0;
  opacity: 1;
  transition: all 0.32s ease;
  width: calc(100% - 10px);
  height: calc(100% - 10px);
}

.task-info-hidden {
  opacity: 0.3;
}

.task-name {
  font-size: 21px;
  margin-top: 8px;
  margin-bottom: 0px;
  overflow: hidden;
}

.task-detail {
  font-size: 14px;
  margin-top: 5px;
  margin-bottom: 5px;
  overflow: hidden;
  text-overflow: ellipsis;
}

.task-time-container {
  display: flex;
  position: absolute;
  align-items: center;
  justify-content: space-between;
  white-space: nowrap;
  bottom: 0px;
  right: 0px;
}

.task-time-text {
  height: 15px;
  font-size: 12px;
  color: #666;
}

.task-time-overtime {
  color: red;
}
</style>