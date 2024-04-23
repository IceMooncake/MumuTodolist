<template>
  <div class="container" :class="{ 'show-content': isShowContent }" @click="handleItemClick({ id: null })">
    <!--头部导航栏-->
    <div class="header-bar">
      <div class="logout-btn" @click="logout">登出</div>
      <div class="logout-btn" @click="changePasswordsOverlay()">修改密码</div>
      <div class="show-lovertask-btn" :class="{ 'show-lovertask-btn-false': isShowLoverTask === false }"
        @click="changeShowLoverTask()" v-if="isBingMu">偷窥</div>
    </div>
    <!--任务列表-->
    <div class="list" @click.stop="">
      <div v-if="taskList.length === 0">请稍等...</div>
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
          <div class="edit-button edit-button-finish" @click.stop="completTask(item.id, 0)" v-if="!item.finish_time">
            <span class="edit-button-text">√</span>
          </div>
          <div class="edit-button edit-button-finish" @click.stop="completTask(item.id, 1)" v-if="item.finish_time">
            <span class="edit-button-text">←</span>
          </div>
        </div>
        <!--每个任务的信息-->
        <div class="task-info" :class="{ 'task-info-hidden': clickItem.id === item.id && item.isLoverTask !== true }">
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
  </div>
  <!--固定的一个添加任务按钮-->
  <div class="add-button" @click="showOverlayToAdd()">+</div>
  <!--输入框的遮罩层，平时隐藏在页面底部-->
  <div class="input-box-overlay" :class="{ 'input-box-overlay-hidden': isShowInputOverlay === false }">
    <div class="input-box" :class="{ 'input-box-hidden': isShowInputOverlay === false }">
      <div class="input-box-list">
        <p class="input-box-title">{{ overlayTitle }}</p>
        <span class="input-item-name">名称</span>
        <div class="input-box-item"><input type="text" v-model="inputForm.taskName" maxlength="100"
            class="input-text-border">
        </div>
        <span class="input-item-name">描述</span>
        <div class="input-box-item">
          <textarea style="resize: vertical;" v-model="inputForm.taskDetail" maxlength="1000"
            class="input-text-border input-item-taskdetail">
          </textarea>
        </div>
        <span class="input-item-name">日期及时间</span>
        <div class="input-box-item"><input type="date" v-model="inputForm.taskDate" class="input-text-border"></div>
        <div class="input-box-item"><input type="time" v-model="inputForm.taskTime" class="input-text-border"></div>
        <button class="input-commit-button" @click="closeInputOverlay()">取消</button>
        <button class="input-commit-button" @click="addTask()" v-show="overlayTitle === '添加代办'">确认</button>
        <button class="input-commit-button" @click="updateTask()" v-show="overlayTitle === '修改代办'">确认</button>
      </div>
    </div>
  </div>
  <!--显示提示信息的上方小悬浮窗-->
  <div class="tip-overlay" :class="{ 'tip-overlay-hidden': isShowTip === false }">
    <div class="tip-info" :class="{ 'tip-info-hidden': isShowTip === false }"> {{ tipInfo }} </div>
  </div>
  <!--显示修改密码-->
  <div class="change-password-overlay" :class="{ 'change-password-overlay-hidden': isShowChangePassword === false }">
    <div class="change-password-form">
      <p>原密码</p><input type="password" class="input-text-border" v-model="changePasswordForm.oldPassword">
      <p>新密码</p><input type="password" class="input-text-border" v-model="changePasswordForm.newPassword">
      <p>重复新密码</p><input type="password" class="input-text-border" v-model="changePasswordForm.repeatPassword">
      <button class="input-commit-button" @click="changePassword()">提交</button>
      <button class="input-commit-button" @click="changePasswordsOverlay()">取消</button>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
const apiUrl = process.env.VUE_APP_API_URL;

export default {
  data() {
    return {
      isShowLoverTask: false,
      isShowContent: false,
      isShowTip: false,
      isShowChangePassword: false,
      isShowInputOverlay: false,
      tipInfoId: 0,
      tipInfo: '一些信息',
      overlayTitle: 'Title',
      taskList: [],
      currentUserId: this.$route.params.id,
      isBingMu: this.$route.params.id == 1 || this.$route.params.id == 2,
      currentTaskId: null,
      clickItem: { id: null },
      inputForm: {
        taskId: '',
        taskName: '',
        taskDetail: '',
        taskDate: '',
        taskTime: ''
      },
      changePasswordForm: {
        oldPassword: '',
        newPassword: '',
        repeatPassword: ''
      },
    };
  },

  methods: {

    getStringDate(Date) {
      const currentTime = Date;
      const year = String(currentTime.getFullYear()).padStart(4, '0');
      const month = String(currentTime.getMonth() + 1).padStart(2, '0');
      const day = String(currentTime.getDate()).padStart(2, '0');
      return year + '-' + month + '-' + day;
    },

    getStringTime(Time) {
      const currentTime = Time;
      const hour = String(currentTime.getHours()).padStart(2, '0');
      const minute = String(currentTime.getMinutes()).padStart(2, '0');
      return hour + ':' + minute;
    },

    async logout() {
      this.isShowContent = false;
      localStorage.removeItem('token');
      setTimeout(() => {
        this.$router.push('/')
      }, 1300);
    },

    changeShowLoverTask() {
      this.isShowLoverTask = !this.isShowLoverTask;
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

    showOverlayToAdd() {
      const currentTime = new Date();
      if (!this.inputForm.taskDate) this.inputForm.taskDate = this.getStringDate(currentTime);
      if (!this.inputForm.taskTime) this.inputForm.taskTime = this.getStringTime(currentTime);
      this.isShowInputOverlay = true;
      this.overlayTitle = '添加代办';
    },

    showOverlayToUpdate(item) {
      const currentTime = new Date(item.deadline);
      this.inputForm.taskId = item.id;
      this.inputForm.taskName = item.task_name;
      this.inputForm.taskDetail = item.task_detail;
      this.inputForm.taskDate = this.getStringDate(currentTime);
      this.inputForm.taskTime = this.getStringTime(currentTime);
      this.isShowInputOverlay = true;
      this.overlayTitle = '修改代办';
    },

    async addTask() {
      if (!this.inputForm.taskName) this.showTip('请输入代办名称');
      else if (!this.inputForm.taskDate) this.showTip('请选择日期');
      else if (!this.inputForm.taskTime) this.showTip('请选择时间');
      else {
        const inputForm = this.inputForm;
        try {
          await axios.post(`${apiUrl}/api/addTask`, {
            userId: this.currentUserId,
            taskName: inputForm.taskName,
            taskDetail: inputForm.taskDetail,
            deadline: inputForm.taskDate + ' ' + inputForm.taskTime
          });
          this.showTip('添加成功');
          this.fetchItems();
          this.isShowInputOverlay = false;
        } catch (e) {
          this.showTip('添加失败www再试一下吧');
        }
      }
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

    async updateTask() {
      if (!this.inputForm.taskName) this.showTip('请输入代办名称');
      else if (!this.inputForm.taskDate) this.showTip('请选择日期');
      else if (!this.inputForm.taskTime) this.showTip('请选择时间');
      else {
        const inputForm = this.inputForm;
        try {
          await axios.put(`${apiUrl}/api/updateTask`, {
            taskId: this.inputForm.taskId,
            userId: this.currentUserId,
            taskName: inputForm.taskName,
            taskDetail: inputForm.taskDetail,
            deadline: inputForm.taskDate + ' ' + inputForm.taskTime
          });
          this.showTip('添加成功');
          this.fetchItems();
          this.isShowInputOverlay = false;
        } catch (e) {
          this.showTip('添加失败www再试一下吧');
        }
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

    async changePassword() {
      if (!this.changePasswordForm.newPassword || !this.changePasswordForm.oldPassword || !this.changePasswordForm.repeatPassword) this.showTip('输入框不可以空着哦');
      else if (this.changePasswordForm.newPassword !== this.changePasswordForm.repeatPassword) this.showTip('新密码与重复输入不相同');
      else {
        try {
          await axios.post(`${apiUrl}/api/changePassword`, { userId: this.currentUserId, pwd: this.changePasswordForm.oldPassword, newPwd: this.changePasswordForm.newPassword });
          this.isShowChangePassword = false;
          this.showTip('修改密码成功啦');
          this.logout();
        } catch (e) {
          this.showTip('好像出错了，检查一下密码是否正确');
        }
      }
    },

    closeInputOverlay() {
      this.isShowInputOverlay = false;
    },

    changePasswordsOverlay() {
      this.isShowChangePassword = !this.isShowChangePassword;
    }
  },

  mounted() {
    setTimeout(() => {
      this.isShowContent = true;
    }, 100);
    this.fetchItems();
    setTimeout(() => {
      if (this.taskList.length == 0) {
        this.fetchItems();
      }
    }, 3000);
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

.container {
  position: fixed;
  top: 100vh;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: #f1e0f1;
  transition: top 0.7s ease, opacity 1.5s ease;
  opacity: 0;
}

.show-content {
  top: 0;
  opacity: 1;
}

.header-bar {
  width: 100%;
  padding: 15px;
  overflow: hidden;
  display: flex;
}

.logout-btn {
  display: inline-block;
  padding: 7px 15px;
  background-color: rgba(150, 28, 146, 0.365);
  font-size: 15px;
  margin-right: 10px;
  color: #fff;
  border: none;
  border-radius: 20px;
  cursor: pointer;
}

.show-lovertask-btn {
  display: inline-block;
  padding: 7px 15px;
  background-color: rgba(40, 28, 150, 0.365);
  font-size: 15px;
  margin-right: 10px;
  color: #fff;
  border: none;
  border-radius: 20px;
  cursor: pointer;
}

.show-lovertask-btn-false {
  background-color: rgba(50, 50, 50, 0.653);
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

.add-button {
  position: fixed;
  bottom: 15px;
  right: 15px;
  width: 55px;
  height: 55px;
  background-color: #007bff77;
  color: #fff;
  border-radius: 50%;
  font-size: 40px;
  text-align: center;
  line-height: 50px;
  cursor: pointer;
  box-shadow: 0 0px 10px rgba(7, 217, 224, 0.466);
}

.add-edit-button:hover {
  background-color: #0056b3;
}

.tip-overlay {
  position: fixed;
  display: flex;
  justify-content: center;
  align-items: center;
  pointer-events: none;
  transition: all 0.2s ease-in-out;
  top: 0;
  left: 0;
  z-index: 1000000;
  width: 100%;
  height: 100px;
  margin-top: 50px;
}

.tip-overlay-hidden {
  top: -125px;
}

.tip-info {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  transition: all 0.2s ease-in-out;
  font-weight: bold;
  color: #000000;
  text-shadow: -1px -1px 0 #ffffff;
  font-size: 17px;
  width: 60%;
  height: 35px;
  padding-left: 20px;
  padding-right: 20px;
  border-radius: 20px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.53);
  background-color: #ffffff7b;
}

.tip-info-hidden {
  width: 0;
}

.change-password-overlay {
  position: fixed;
  display: flex;
  justify-content: center;
  align-items: center;
  transition: all 0.2s ease-in-out;
  top: 0;
  left: 0;
  color: #ffffff;
  width: 100%;
  height: 100%;
  background-color: #525252a1;
}

.change-password-form {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-wrap: wrap;
}

.change-password-form * {
  flex-basis: 80%;
}

.change-password-overlay-hidden {
  top: -100%;
}

.input-box-overlay {
  position: fixed;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  opacity: 1;
  transition: all 0.2s ease-in-out, opacity 0.3s ease-in-out;
  background-color: #3f3f3f14;
}

.input-box-overlay-hidden {
  opacity: 0;
  top: 100%;
  left: 100%;
  height: 0;
  width: 0;
}

.input-box {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  transition: all 0.2s ease-in-out;
  background-color: #9edcdce4;
  width: 80%;
  height: 450px;
  padding: 10px;
  border-radius: 5%;
  top: 50%;
  left: 50%;
  line-height: 1.5;
  transform: translate(-50%, -50%);
}

.input-box-hidden {
  opacity: 0;
  height: 0;
  width: 0;
}

.input-box-list {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-wrap: wrap;
}

.input-box-title {
  width: 100%;
  margin: 20px;
  text-align: center;
  font-weight: bold;
  font-size: 22px;
  color: #030d1f;
  background-color: rgba(227, 160, 127, 0.701);
  box-shadow: 0 0 20px rgb(255, 255, 255);
  border-radius: 20px;
}

.input-box-item {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
}

.input-item-name {
  width: 100%;
  display: block;
  text-align: center;
  color: #ffffff;
  font-weight: bold;
}

.input-item-taskdetail {
  height: 100px;
}

.input-text-border {
  padding: 5px;
  border: 2px solid #525252;
  border-radius: 10px;
  font-size: 16px;
  outline: none;
  transition: all 0.3s ease-in-out;
  margin-bottom: 5px;
  width: 70%;
  display: inline-block;
}

.input-text-border:focus {
  border-color: #d4146eb5;
}

.input-commit-button {
  padding: 8px 25px;
  width: 40%;
  margin-left: 10px;
  margin-right: 10px;
  margin-bottom: 20px;
  white-space: nowrap;
  border: none;
  border-radius: 10px;
  background-color: rgb(11, 33, 203);
  color: #ffffff;
  box-shadow: 0 0 20px rgb(206, 105, 237);
  font-size: 16px;
  cursor: pointer;
  transition: all 0.8s ease-in-out, color 0.8s ease-in-out;
}
</style>