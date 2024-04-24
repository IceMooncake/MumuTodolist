<template>
  <div class="container" :class="{ 'show-content': isShowContent }" @click="resetClickItem()">
    <!--头部导航栏-->
    <div class="header-bar">
      <div class="logout-btn" @click="logout">登出</div>
      <div class="logout-btn" @click="changePasswordsOverlay()">修改密码</div>
      <div class="show-lovertask-btn" :class="{ 'show-lovertask-btn-false': isShowLoverTask === false }"
        @click="changeShowLoverTask()" v-if="isBingMu">偷窥</div>
    </div>
    <task-list ref="tasklist" :is-show-lover-task="isShowLoverTask" :showTip="showTip"
      :showOverlayToUpdate="showOverlayToUpdate" :getStringDate="getStringDate"
      :getStringTime="getStringTime"></task-list>
    <!--固定的一个添加任务按钮-->
    <div class="add-button" @click="showOverlayToAdd()">+</div>
    <!--输入框的遮罩层，平时隐藏在页面底部-->
    <InputBoxOverlay ref="inputbox" :overlayTitle="overlayTitle" :submitButtonText="submitButtonText" :showTip="showTip"
      :fetchItems="fetchItems" @submit="handleSubmit" :getStringDate="getStringDate" :getStringTime="getStringTime" />
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
  </div>
</template>

<script>
import axios from 'axios';
const apiUrl = process.env.VUE_APP_API_URL;
import TaskList from '@/components/tasklist/TaskList.vue';
import InputBoxOverlay from '@/components/overlays/InputBox.vue';

export default {
  components: {
    TaskList,
    InputBoxOverlay,
  },
  data() {
    return {
      isShowLoverTask: false,
      isShowContent: false,
      isShowTip: false,
      isShowChangePassword: false,
      tipInfoId: 0,
      tipInfo: '一些信息',
      overlayTitle: 'Title',
      currentUserId: this.$route.params.id,
      isBingMu: this.$route.params.id == 1 || this.$route.params.id == 2,
      changePasswordForm: {
        oldPassword: '',
        newPassword: '',
        repeatPassword: ''
      },
    };
  },

  methods: {

    resetClickItem() {
      this.$refs.tasklist.handleItemClick({ id: null });
    },

    fetchItems() {
      this.$refs.tasklist.fetchItems();
    },

    getStringDate(FullDate) {
      const year = String(FullDate.getFullYear()).padStart(4, '0');
      const month = String(FullDate.getMonth() + 1).padStart(2, '0');
      const day = String(FullDate.getDate()).padStart(2, '0');
      return year + '-' + month + '-' + day;
    },

    getStringTime(FullDate) {
      const hour = String(FullDate.getHours()).padStart(2, '0');
      const minute = String(FullDate.getMinutes()).padStart(2, '0');
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
      this.$refs.inputbox.showOverlayToAdd();
    },

    showOverlayToUpdate(item) {
      this.$refs.inputbox.showOverlayToUpdate(item);
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

    changePasswordsOverlay() {
      this.isShowChangePassword = !this.isShowChangePassword;
    }
  },

  mounted() {
    console.log(this.$refs.tasklist);
    setTimeout(() => {
      this.isShowContent = true;
    }, 100);
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
</style>