<template>
  <div class="container" :class="{ 'show-content': isShowContent }" @click="resetClickItem()">
    <!--头部导航栏-->
    <HeaderBar ref="headerbar" :changeShowLoverTask="changeShowLoverTask" :changeShowRepeatTask="changeShowRepeatTask" :changePasswordsOverlay="changePasswordsOverlay"
      :logout="logout" :changeShowCalender="changeShowCalender" />
    <!--日历-->
    <TopCalender ref="calender" @sendDate="changeListDate" :changeShowListMini="changeShowListMini" :setShowCalenderBtn="setShowCalenderBtn"/>
    <!--任务列表-->
    <TaskList ref="tasklist" :showTip="showTip"
      :showOverlayToUpdate="showOverlayToUpdate" />
    <!--固定的一个添加任务按钮-->
    <div class="add-button" @click="showOverlayToAdd()">+</div>
    <!--输入框的遮罩层，平时隐藏在页面底部-->
    <InputBoxOverlay ref="inputbox" :showTip="showTip" :showList="showList" />
    <!--显示提示信息的上方小悬浮窗-->
    <TipIsland ref="tipisland" />
    <!--显示修改密码-->
    <ChangePasswordOverlay ref="changePassword" :showTip="showTip" :logout="logout" />
  </div>
</template>

<script>
import TaskList from '@/components/tasklist/TaskList.vue';
import InputBoxOverlay from '@/components/overlays/inputBox/InputBox.vue';
import ChangePasswordOverlay from '@/components/overlays/ChangePassword.vue';
import HeaderBar from '@/components/HeaderBar.vue';
import TipIsland from '@/components/TipIsland.vue';
import TopCalender from '@/components/TopCalender.vue';

export default {
  components: {
    TaskList,
    InputBoxOverlay,
    ChangePasswordOverlay,
    HeaderBar,
    TipIsland,
    TopCalender,
  },

  data() {
    return {
      isShowContent: false,
    };
  },

  methods: {

    async logout() {
      this.isShowContent = false;
      localStorage.removeItem('token');
      setTimeout(() => {
        this.$router.push('/')
      }, 1300);
    },

    changeShowLoverTask() {
      this.$refs.tasklist.changeShowLoverTask();
      this.$refs.tasklist.showList(false, true);
    },

    changeShowRepeatTask() {
      this.$refs.tasklist.changeShowRepeatTask();
      this.$refs.tasklist.showList(false, true);
    },

    resetClickItem() {
      this.$refs.tasklist.handleItemClick({ id: null });
    },

    showList(isRefetch, showAnimation) {
      this.$refs.tasklist.showList(isRefetch, showAnimation);
    },

    // 修改列表模块中的日期并刷新列表
    changeListDate(date) {
      this.$refs.tasklist.currentDate = date;
      this.$refs.tasklist.showList(false, false)
      this.$refs.inputbox.setFromTaskDeadline(date, null);
    },

    changeShowListMini(isShow) {
      this.$refs.tasklist.changeShowListMini(isShow);
    },

    setShowCalenderBtn(states){
      this.$refs.headerbar.setShowCalenderBtn(states);
    },

    changeShowCalender() {
      this.$refs.calender.changeShowCalender();
    },

    showTip(tipInfo) {
      this.$refs.tipisland.showTip(tipInfo);
    },

    changePasswordsOverlay() {
      this.$refs.changePassword.changePasswordsOverlay();
    },

    showOverlayToAdd() {
      this.$refs.inputbox.showOverlayToAdd();
    },

    showOverlayToUpdate(item) {
      this.$refs.inputbox.showOverlayToUpdate(item);
    },
  },

  mounted() {
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
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: #f1e0f1;
  background-color: #b5e6ef8e;
  transition: all 0.8s;
  opacity: 0;
  display: flex;
  justify-content: center;
  align-content: flex-start;
  flex-wrap: wrap;
}

.show-content {
  opacity: 1;
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
</style>