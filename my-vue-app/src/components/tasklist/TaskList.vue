<template>
  <!--任务列表-->
  <transition-group name="list" tag="div" class="task-list" :class="{'task-list-mini': isShowMini === true}" @click.stop="">
    <!--任务列表-->
    <div v-for="(item, index) in showTaskList" :key="item.id" class="task-item"
      :class="{ 'task-item-current': item.isCurrentTask, 'task-item-finished': item.finish_time, 'task-item-lover': item.isLoverTask }"
      @mousedown="resetItemMouseDown(item)" @click="handleItemClick(item, index)"
      v-show="isShowLoverTask || !item.isLoverTask">
      <!--每个任务的按钮遮罩层-->
      <TaskListEditOverlay :item="item" :showOverlayToUpdate="showOverlayToUpdate" :showTip="showTip"
        :getFormatTime="getFormatTime" :refreshList="refreshList"
        :isHidden="clickItem.id !== item.id || item.user_id != currentUserId" />
      <!--每个任务的信息块-->
      <TaskListItem :item="item" :isHidden="clickItem.id === item.id" />
    </div>

  </transition-group>
</template>

<script>
import axios from 'axios';
const apiUrl = process.env.VUE_APP_API_URL;
import TaskListEditOverlay from '@/components/tasklist/TaskListEditOverlay.vue';
import TaskListItem from '@/components/tasklist/TaskListItem.vue';
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
export default {
  components: {
    TaskListEditOverlay,
    TaskListItem,
  },

  props: {
    isShowLoverTask: Boolean,
    showTip: Function,
    showOverlayToUpdate: Function,
  },

  data() {
    return {
      showTaskList: [],
      currentTaskList: [],
      otherTaskList: [],
      currentUserId: this.$route.params.id,
      isBingMu: this.$route.params.id == 1 || this.$route.params.id == 2,
      currentTaskId: null,
      clickItem: { id: null },
      isShowMini: false,
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

    async fetchItems(isShowLoverTask = false) {
      let userId = this.currentUserId;
      if (isShowLoverTask === true) userId = this.currentUserId == 1 ? 2 : 1;
      try {
        let response = await axios.get(`${apiUrl}/api/getTasks?userId=${userId}`);
        let taskList = response.data.tasks;
        // 按照时间排序
        const currentTime = new Date();
        taskList = taskList.slice().sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime());
        // 当前正在做的任务做标志并置顶
        response = await axios.get(`${apiUrl}/api/getCurrentTaskId?userId=${userId}`);
        this.currentTaskId = response.data.taskId;
        const currentTask = taskList.find(item => item.id === this.currentTaskId);
        if (currentTask) {
          currentTask.isCurrentTask = true;
          taskList.splice(taskList.indexOf(currentTask), 1);
          taskList.unshift(currentTask);
        }
        // 未完成的任务列表
        let unFinishedTasks = taskList.filter(item => !item.finish_time);
        // 已完成的任务列表
        let finishedTasks = taskList.filter(item => item.finish_time);
        // 合并两个列表
        taskList = [...unFinishedTasks, ...finishedTasks];
        // 超时未完成的任务做标志
        taskList.forEach(item => { if (new Date(item.deadline).getTime() - currentTime.getTime() < 0) item.isOverTime = true });
        // 正确显示时间
        taskList.forEach(item => { item.deadline = this.getFormatTime(new Date(item.deadline)) });
        // 返回列表
        return taskList;
      } catch (e) {
        console.error(e);
      }
    },

    async showList(showLoverTask = false) {
      let showTaskList = showLoverTask === true ? [...this.otherTaskList] : [...this.currentTaskList];
      const delayTime = 200 / this.showTaskList.length;
      while (this.showTaskList.length > 0) {
        this.showTaskList.pop();
        await delay(delayTime);
      }
      for (const item of showTaskList) {
        this.showTaskList.push(item);
        await delay(delayTime);
      }
    },

    async refreshList() {
      this.currentTaskList = await this.fetchItems();
      this.showTaskList = [...this.currentTaskList];
    },

    handleItemClick(item) {
      this.clickItem = (this.clickItem.id === item.id) ? { id: null } : item;
    },

    resetItemMouseDown(item) {
      this.clickItem = (this.clickItem === item) ? item : { id: null };
    },

    changeShowMini(isShowMini) {
      this.isShowMini = isShowMini;
    }

  },

  async mounted() {
    this.currentTaskList = await this.fetchItems();
    if (this.isBingMu) this.otherTaskList = await this.fetchItems(true);
    this.showList();
  },

};
</script>


<style scoped>
.list-move {
  transition: transform 1s ease-in-out;
}

.list-enter-active {
  transform: translateY(50px);
  opacity: 0;
}

.list-leave-active {
  transform: translateY(50px);
  opacity: 0;
}

.list-enter {
  opacity: 1;
}

.task-list {
  overflow-y: auto;
  transition: all 0.3s ease-in-out;
  max-height: calc(100% - 60px);
  width: 90%;
  scroll-behavior: smooth;
  bottom: 20px;
}

.task-list-mini {
  max-height: calc(100% - 400px);
}

.task-list::-webkit-scrollbar {
  width: 0;
}

.task-item {
  transition: all 0.2s ease-in-out, opacity 0.12s ease-in-out;
  position: relative;
  margin: 0 auto;
  border: 1px solid #cccccc;
  background-color: #ecceec;
  border-radius: 5px;
  margin-bottom: 10px;
  box-shadow: 0px 2px 5px rgba(0, 0, 0, 0.1);
  height: 115px;
}

.task-item-current {
  background-color: #87ef8c62
}

.task-item-finished {
  background-color: #00000013;
}
</style>