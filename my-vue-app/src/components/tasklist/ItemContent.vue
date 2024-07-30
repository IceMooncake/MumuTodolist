<template>
  <div class="task-info" :class="{ 'task-info-hidden': isHidden === true }">
    <!-- 任务名称 -->
    <h2 class="task-name">{{ item.task_name }}</h2>
    <!-- 任务详情 -->
    <p class="task-detail">{{ item.task_detail }}</p>
    <!-- 任务时间 -->
    <div class="task-time-container-left" v-if="item.repeat_hour">
      <span class="task-time-text task-time-cyan">
         截止当日{{ item.deadline }}
      </span>
    </div>
    <div class="task-time-container-right">
      <span class="task-time-text" :class="{ 'task-time-red': item.isOverTime && !item.finish_time }"
        v-if="!item.repeat_hour">
        {{ item.deadline_show }}
      </span>
      <span v-if="item.repeat_hour" class="task-time-text">
        下次: {{ item.next_run_show }}
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

<style src="./css/itemContent.css" scoped></style>