<template>
    <!--任务列表-->
    <div class="list" @click.stop="">
        <div v-if="taskList.length === 0">正在获取值，请稍后</div>
        <div v-for="item in taskList" :key="item.id" class="task-item"
            :class="{ 'task-item-current': item.isCurrentTask, 'task-item-finished': item.finish_time, 'task-item-lover': item.isLoverTask }"
            @mousedown="resetItemMouseDown(item)" @click="handleItemClick(item)"
            v-show="isShowLoverTask || !item.isLoverTask">
            <!--每个任务的编辑按钮的遮罩层-->
            <div class="task-edit-overlay" :class="{ 'task-edit-overlay-hidden': clickItem.id !== item.id }"
                v-if="!item.isLoverTask">
                <div class="edit-button edit-button-delete" @click.stop="deleteTask(item.id)">
                    <div class="edit-button-text">✘</div>
                </div>
                <div class="edit-button edit-button-alter" @click.stop="showOverlayToUpdate(item)">
                    <span class="edit-button-text">○</span>
                </div>
                <div class="edit-button edit-button-totop" @click.stop="setCurrentTask(item.id)"
                    v-if="!item.isCurrentTask && !item.finish_time">
                    <span class="edit-button-text">↑</span>
                </div>
                <div class="edit-button edit-button-totop" @click.stop="setCurrentTask(null)" v-if="item.isCurrentTask">
                    <span class="edit-button-text">↓</span>
                </div>
                <div class="edit-button edit-button-finish" @click.stop="completTask(item.id, 0)"
                    v-if="!item.finish_time">
                    <span class="edit-button-text">√</span>
                </div>
                <div class="edit-button edit-button-finish" @click.stop="completTask(item.id, 1)"
                    v-if="item.finish_time">
                    <span class="edit-button-text">←</span>
                </div>
            </div>
            <!--每个任务的信息-->
            <div class="task-info"
                :class="{ 'task-info-hidden': clickItem.id === item.id && item.isLoverTask !== true }">
                <h2 class="task-name">{{ item.task_name }}</h2>
                <p class="task-detail">{{ item.task_detail }}</p>
                <div class="task-times">
                    <span class="task-time" :class="{ 'task-time-overtime': item.isOverTime && !item.finish_time }">
                        {{ item.deadline }}
                    </span>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import axios from 'axios';
const apiUrl = process.env.VUE_APP_API_URL;

export default {
  props: {
    isShowLoverTask: {
      type: Boolean,
      default: false,
    }
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
        this.taskList.forEach(item => { item.deadline = this.getStringDate(new Date(item.deadline)) + ' ' + this.getStringTime(new Date(item.deadline)) });
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

    showTip(tipInfo) {
      this.isShowTip = true;
      this.tipInfo = tipInfo;
      this.tipInfoId += 1;
      let remmberInfoId = this.tipInfoId;
      setTimeout(() => {
        if (remmberInfoId === this.tipInfoId) this.isShowTip = false;
      }, 2000)
    },

    async deleteTask(taskId) {
      try {
        await axios.delete(`${apiUrl}/api/deleteTask/${taskId}`);
        this.showTip('删除成功');
        this.fetchItems();
      } catch (e) {
        this.showTip('删除失败www再试一下吧');
      }
    },

    async setCurrentTask(taskId) {
      try {
        await axios.post(`${apiUrl}/api/setCurrentTask`, { taskId: taskId, userId: this.currentUserId });
        this.showTip('设置成功');
        this.fetchItems();
      } catch (e) {
        this.showTip('失败了www再试一下吧');
      }
    },

    async completTask(taskId, isDeComplete) {
      try {
        if (isDeComplete) await axios.post(`${apiUrl}/api/completTask`, { taskId: taskId, finishTime: null });
        else await axios.post(`${apiUrl}/api/completTask`, { taskId: taskId, finishTime: this.getStringDate(new Date()) + ' ' + this.getStringTime(new Date()) });
        if (isDeComplete) this.showTip('撤销成功');
        else this.showTip('完成任务啦');
        this.fetchItems();
      } catch (e) {
        this.showTip('失败了www再试一下吧');
      }
    },

  },

  mounted() {
    this.fetchItems();
    setTimeout(() => {
      if (this.taskList.length == 0) {
        this.fetchItems();
      }
    }, 2000);
  }

};
</script>


<style scoped>
* {
  user-select: none;
  -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
  overflow: hidden;
  /* 隐藏溢出内容 */
  text-overflow: ellipsis;
  /* 显示省略号 */
  white-space: normal;
}

.list {
  overflow-y: auto;
  max-height: calc(100% - 80px);
  margin-left: 5%;
  scroll-behavior: smooth;
  margin-right: 5%;
}

/* 隐藏滚动条 */
.list::-webkit-scrollbar {
  width: 0;
  /* 设置滚动条宽度为 0 */
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

.task-info {
  display: flex;
  position: absolute;
  flex-direction: column;
  margin: 5px;
  top: 0;
  transition: all 0.52s ease;
  opacity: 1;
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
}

.task-detail {
  font-size: 14px;
  margin-top: 5px;
  margin-bottom: 5px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  /* 最大显示行数 */
  -webkit-box-orient: vertical;
}

.task-times {
  display: flex;
  position: absolute;
  align-items: center;
  justify-content: space-between;
  white-space: nowrap;
  bottom: 0px;
  right: 0px;
}

.task-time {
  height: 15px;
  font-size: 12px;
  color: #666;
}

.task-time-overtime {
  color: red;
}

.task-edit-overlay {
  z-index: 1;
  display: flex;
  position: absolute;
  opacity: 1;
  left: 0vh;
  justify-content: center;
  align-items: center;
  margin: 0 auto;
  width: 100%;
  height: 100%;
  border-radius: 5px;
  transition: all 0.52s ease;
  background-color: #00000010;
}

.task-edit-overlay-hidden {
  z-index: 0;
  opacity: 0;
  left: 100%;
}

.edit-button {
  width: 55px;
  height: 55px;
  margin-left: 2%;
  margin-right: 2%;
  border-radius: 50%;
  border: none;
  color: white;
  font-size: 16px;
  font-weight: bold;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  /* 添加阴影效果 */
}

.edit-button-delete {
  background-color: rgba(172, 77, 59, 0.792);
}

.edit-button-alter {
  background-color: rgba(50, 197, 205, 0.642)
}

.edit-button-totop {
  background-color: rgba(0, 0, 255, 0.5);
}

.edit-button-finish {
  background-color: rgba(114, 254, 98, 0.596);
}

.edit-button-text {
  color: rgb(255, 255, 255);
  font-weight: bold;
}

</style>