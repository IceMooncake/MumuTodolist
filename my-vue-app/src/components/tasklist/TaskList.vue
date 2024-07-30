<template>
  <!--任务列表-->
  <transition-group name="list" tag="div" class="task-list" :class="{ 'task-list-mini': isShowMini === true }"
    @click.stop="">
    <!--任务列表-->
    <div v-for="(item, index) in showTaskList" :key="item.id" class="task-item"
      :class="{ 'task-item-current': item.isCurrentTask, 'task-item-finished': item.finish_time, 'task-item-lover': item.isLoverTask }"
      @click="handleItemClick(item, index)" v-show="isShowLoverTask || !item.isLoverTask">
      <!--每个任务的按钮遮罩层-->
      <TaskListEditOverlay :item="item" :showOverlayToUpdate="showOverlayToUpdate" :showTip="showTip"
        :formatTime="formatTime" :showList="showList"
        :isHidden="clickItem.id !== item.id || item.user_id != selfUserId" />
      <!--每个任务的信息块-->
      <TaskListItem :item="item" :isHidden="clickItem.id === item.id" />
    </div>

  </transition-group>
</template>

<script>
import axios from 'axios';
const apiUrl = process.env.VUE_APP_API_URL;
import TaskListEditOverlay from '@/components/tasklist/ItemOverlay.vue';
import TaskListItem from '@/components/tasklist/ItemContent.vue';
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
export default {
  components: {
    TaskListEditOverlay,
    TaskListItem,
  },

  props: {
    showTip: Function,
    showOverlayToUpdate: Function
  },

  data() {
    return {
      showTaskList: [],
      selfTaskList: [],
      selfRepeatTaskList: [],
      loverTaskList: [],
      loverRepeatTaskList: [],
      selfCurrentTaskId: null,
      loverCurrentTaskId: null,
      selfUserId: this.$route.params.id,
      loverUserId: this.$route.params.id == 1 ? 2 : 1,
      clickItem: { id: null },
      currentDate: new Date(),
      isShowLoverTask: false,
      isShowRepeatTask: false,
      isShowMini: false,
    };
  },

  methods: {
    // 获取当前是用户列表还是情侣列表
    getCurrentShowList() {
      return this.isShowLoverTask ?
        (this.isShowRepeatTask ? [...this.loverRepeatTaskList] : [...this.loverTaskList]) :
        (this.isShowRepeatTask ? [...this.selfRepeatTaskList] : [...this.selfTaskList]);
    },

    // 格式化时间
    formatTime(FullDate) {
      const year = String(FullDate.getFullYear()).padStart(4, '0');
      const month = String(FullDate.getMonth() + 1).padStart(2, '0');
      const day = String(FullDate.getDate()).padStart(2, '0');
      const hour = String(FullDate.getHours()).padStart(2, '0');
      const minute = String(FullDate.getMinutes()).padStart(2, '0');
      return year + '-' + month + '-' + day + ' ' + hour + ':' + minute;
    },

    // 格式化列表(排序、格式化时间、添加任务状态标签等)
    formatTaskList(taskList) {
      // 按照时间排序
      const currentTime = new Date();
      taskList = taskList.slice().sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime());
      // 当前正在做的任务做标志并置顶
      const currentTask = taskList.find(item => item.id === this.loverCurrentTaskId || item.id === this.selfCurrentTaskId)
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
      taskList.forEach(item => {
        if (!item.repeat_hour) item.deadline_show = this.formatTime(new Date(item.deadline));
        else item.next_run_show = this.formatTime(new Date(item.next_run));
      });
      // 返回列表
      return taskList;
    },

    // 从数据库抓取列表加载到组件中的值
    async fetchItems() {
      try {
        let response = await axios.get(`${apiUrl}/api/getCurrentTaskId?userId=${this.selfUserId}`);
        this.selfCurrentTaskId = response.data.taskId;

        response = await axios.get(`${apiUrl}/api/getTasks?userId=${this.selfUserId}`);
        this.selfTaskList = this.formatTaskList(response.data.tasks);

        response = await axios.get(`${apiUrl}/api/getCurrentTaskId?userId=${this.loverUserId}`);
        this.loverCurrentTaskId = response.data.taskId;

        response = await axios.get(`${apiUrl}/api/getTasks?userId=${this.loverUserId}`);
        this.loverTaskList = this.formatTaskList(response.data.tasks);

        response = await axios.get(`${apiUrl}/api/getRepeatTasks?userId=${this.selfUserId}`);
        this.selfRepeatTaskList = this.formatTaskList(response.data.tasks);

        response = await axios.get(`${apiUrl}/api/getRepeatTasks?userId=${this.loverUserId}`);
        this.loverRepeatTaskList = this.formatTaskList(response.data.tasks);
      } catch (e) {
        console.error(e);
      }
    },

    // 获取当前选中的时间的列表
    getDateList(tasklist) {
      return tasklist.filter(item => {
        let itemDate = new Date(item.deadline);
        return itemDate.getFullYear() === this.currentDate.getFullYear()
          && itemDate.getMonth() === this.currentDate.getMonth()
          && itemDate.getDate() === this.currentDate.getDate()
          || item.repeat_hour || (item.show_only_theday == 0 && !item.finish_time);
      });
    },

    // 展示列表的退出和进入(是否重新获取列表，是否展示进出动画)
    async showList(isRefetch = false, showAnimation = false) {
      if (isRefetch) await this.fetchItems();
      let showTaskList = this.getCurrentShowList();
      showTaskList = this.getDateList(showTaskList);
      // 展示动画
      if (showAnimation) {
        let delayTime = 200 / this.showTaskList.length;
        while (this.showTaskList.length > 0) {
          this.showTaskList.pop();
          await delay(delayTime);
        }
        delayTime = 200 / showTaskList.length;
        for (const item of showTaskList) {
          this.showTaskList.push(item);
          await delay(delayTime);
        }
      } else {
        this.showTaskList = showTaskList;
      }
    },

    // 判断点击了哪个item，重复点击设为null
    handleItemClick(item) {
      this.clickItem = (this.clickItem.id === item.id) ? { id: null } : item;
    },

    changeShowLoverTask() {
      this.isShowLoverTask = !this.isShowLoverTask;
    },

    changeShowRepeatTask() {
      this.isShowRepeatTask = !this.isShowRepeatTask;
    },

    changeShowListMini(isShowMini) {
      this.isShowMini = isShowMini;
    }

  },

  async mounted() {
    this.showList(true, true);
  },

};
</script>


<style src="./css/tasklist.css" scoped></style>