<template>
  <!--任务列表-->
  <div class="list" @click.stop="">
    <!--未获取到值时显示正在获取值-->
    <div v-if="taskList.length === 0">正在获取值，请稍后</div>
    <!--任务列表-->
    <div v-for="item in taskList" :key="item.id" class="task-item"
      :class="{ 'task-item-current': item.isCurrentTask, 'task-item-finished': item.finish_time, 'task-item-lover': item.isLoverTask }"
      @mousedown="resetItemMouseDown(item)" @click="handleItemClick(item)"
      v-show="isShowLoverTask || !item.isLoverTask">
      <!--每个任务的按钮遮罩层-->
      <TaskListEditOverlay :item="item" :class="{ 'task-edit-overlay-hidden': clickItem.id !== item.id }"
        :showOverlayToUpdate="showOverlayToUpdate" :fetchItems="fetchItems" :showTip="showTip"
        :getFormatTime="getFormatTime" />
      <!--每个任务的信息-->
      <TaskListItemInfo :item="item" :isHidden="clickItem.id === item.id && item.isLoverTask !== true" />
    </div>
  </div>
</template>

<script>
import axios from 'axios';
const apiUrl = process.env.VUE_APP_API_URL;
import TaskListEditOverlay from '@/components/tasklist/TaskListEditOverlay.vue';
import TaskListItemInfo from '@/components/tasklist/TaskListItemInfo.vue';

export default {
  components: {
    TaskListEditOverlay,
    TaskListItemInfo,
  },

  props: {
    isShowLoverTask: Boolean,
    showTip: Function,
    showOverlayToUpdate: Function,
  },

  data() {
    return {
      taskList: [],
      currentUserId: this.$route.params.id,
      isBingMu: this.$route.params.id == 1 || this.$route.params.id == 2,
      currentTaskId: null,
      clickItem: { id: null },
    };
  },

  methods: {
    getFormatTime(FullDate) {
      const year = String(FullDate.getFullYear()).padStart(4, '0');
      const month = String(FullDate.getMonth() + 1).padStart(2, '0');
      const day = String(FullDate.getDate()).padStart(2, '0');
      const hour = String(FullDate.getHours()).padStart(2, '0');
      const minute = String(FullDate.getMinutes()).padStart(2, '0');
      return year + '-' + month + '-' + day + ' ' + hour + ':' + minute;
    },

    async fetchItems() {
      try {
        let response = await axios.get(`${apiUrl}/api/getTasks?userId=${this.currentUserId}`);
        this.taskList = response.data.tasks;
        response = await axios.get(`${apiUrl}/api/getCurrentTaskId?userId=${this.currentUserId}`);
        this.currentTaskId = response.data.taskId;
        // 按照时间排序
        const currentTime = new Date();
        this.taskList = this.taskList.slice().sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime());
        // 当前正在做的任务做标志并置顶
        this.taskList.forEach(item => {
          if (item.id === this.currentTaskId) {
            const index = this.taskList.indexOf(item);
            if (index !== -1) {
              this.taskList.splice(index, 1);
              this.taskList.unshift(item);
            }
            item.isCurrentTask = true;
          }
        });
        // 对方的任务
        if (this.isBingMu) {
          let loverId = this.currentUserId == 1 ? 2 : 1;
          let loverTaskId = await axios.get(`${apiUrl}/api/getCurrentTaskId?userId=${loverId}`)
          let loverTask = await axios.get(`${apiUrl}/api/getTaskById?taskId=${loverTaskId.data.taskId}`)
          if (loverTask.data.task) loverTask.data.task.isLoverTask = true;
          if (loverTask.data.task && this.taskList[0] != loverTask.data.task) this.taskList.unshift(loverTask.data.task);
        }
        // 未完成的任务列表
        let unFinishedTasks = this.taskList.filter(item => !item.finish_time);
        // 已完成的任务列表
        let finishedTasks = this.taskList.filter(item => item.finish_time);
        // 合并两个列表
        this.taskList = [...unFinishedTasks, ...finishedTasks];
        // 超时未完成的任务做标志
        this.taskList.forEach(item => { if (new Date(item.deadline).getTime() - currentTime.getTime() < 0) item.isOverTime = true });
        // 正确显示时间
        this.taskList.forEach(item => { item.deadline = this.getFormatTime(new Date(item.deadline)) });
      } catch (e) {
        console.error(e);
      }
    },

    handleItemClick(item) {
      this.clickItem = (this.clickItem.id === item.id) ? { id: null } : item;
    },

    resetItemMouseDown(item) {
      this.clickItem = (this.clickItem === item) ? item : { id: null };
    },

  },

  mounted() {
    this.fetchItems();
  },

};
</script>


<style scoped>

.list {
  overflow-y: auto;
  max-height: calc(100% - 80px);
  margin-left: 5%;
  margin-right: 5%;
  scroll-behavior: smooth;
}

.list::-webkit-scrollbar {
  width: 0;
}

.task-edit-overlay-hidden {
  z-index: 0;
  opacity: 0;
  left: 100%;
}

.task-item {
  position: relative;
  margin: 0 auto;
  border: 1px solid #cccccc;
  background-color: #ecceec;
  border-radius: 5px;
  margin-bottom: 10px;
  box-shadow: 0px 2px 5px rgba(0, 0, 0, 0.1);
  height: 115px;
}

.task-item-lover {
  opacity: 0.6;
  background-color: #87efe362
}

.task-item-current {
  background-color: #87ef8c62
}

.task-item-finished {
  background-color: #00000026;
  opacity: 0.6;
}
</style>