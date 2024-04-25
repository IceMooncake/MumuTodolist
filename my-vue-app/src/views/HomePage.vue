<template>
  <div class="container" :class="{ 'show-content': isShowContent }" @click="resetClickItem()">
    <!--头部导航栏-->
    <HeaderBar :isShowLoverTask="isShowLoverTask" :changeShowLoverTask="changeShowLoverTask"
      :changePasswordOverlay="changePasswordsOverlay" :logout="logout" />
    <TaskList ref="tasklist" :is-show-lover-task="isShowLoverTask" :showTip="showTip"
      :showOverlayToUpdate="showOverlayToUpdate" />
    <!--固定的一个添加任务按钮-->
    <div class="add-button" @click="showOverlayToAdd()">+</div>
    <!--输入框的遮罩层，平时隐藏在页面底部-->
    <InputBoxOverlay ref="inputbox" :showTip="showTip" :fetchItems="fetchItems" />
    <!--显示提示信息的上方小悬浮窗-->
    <TipIsland ref="tipisland" />
    <!--显示修改密码-->
    <ChangePasswordOverlay ref="changePassword" :showTip="showTip" :logout="logout" />
  </div>
</template>

<script>
import TaskList from '@/components/tasklist/TaskList.vue';
import InputBoxOverlay from '@/components/overlays/InputBox.vue';
import ChangePasswordOverlay from '@/components/overlays/ChangePassword.vue';
import HeaderBar from '@/components/HeaderBar.vue';
import TipIsland from '@/components/TipIsland.vue';

export default {
  components: {
    TaskList,
    InputBoxOverlay,
    ChangePasswordOverlay,
    HeaderBar,
    TipIsland,
  },
  data() {
    return {
      isShowLoverTask: false,
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
      this.isShowLoverTask = !this.isShowLoverTask;
    },

    showTip(tipInfo) {
      this.$refs.tipisland.showTip(tipInfo);
    },

    resetClickItem() {
      this.$refs.tasklist.handleItemClick({ id: null });
    },

    fetchItems() {
      this.$refs.tasklist.fetchItems();
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


<style>
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
</style>