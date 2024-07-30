<template>
  <div class="task-info" :class="{ 'task-info-hidden': isHidden === true }">
    <!-- 任务名称 -->
    <h2 class="task-name">{{ item.task_name }}</h2>
    <!-- 任务详情 -->
    <p class="task-detail">{{ item.task_detail }}</p>
    <!-- 任务时间 -->
    <div class="task-time-container-left" v-if="item.next_run">
      <span class="task-time-text task-time-purple">
         每{{ item.interval_value }}{{ getIntervalUnit }}
      </span>
      <span class="task-time-text task-time-cyan">
         当日{{ item.deadline }}截止
      </span>
    </div>
    <div class="task-time-container-right">
      <span class="task-time-text" :class="{ 'task-time-red': item.isOverTime && !item.finish_time }"
        v-if="!item.next_run">
        {{ item.deadline_show }}
      </span>
      <span v-if="item.next_run" class="task-time-text">
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
  },
  computed: {
    getIntervalUnit() {
      switch(this.item.interval_unit) {
        case 'years': return "年";
        case 'weeks': return "周";
        case 'months': return "月";
        case 'days': return "天";
        default: return "";
      }
    }
  }
}
</script>

<style src="./css/itemContent.css" scoped></style>