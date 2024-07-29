<!-- ToggleButton.vue -->
<template>
  <div class="toggle-container" @click="moveButton($event)">
    <div class="text-box" :class="{ 'text-select': this.taskType === 'onlyTheday' }">当天</div>
    <div class="text-box" :class="{ 'text-select': this.taskType === 'longTerm' }">长期</div>
    <div class="text-box" :class="{ 'text-select': this.taskType === 'repeat' }">重复</div>
    <div class="toggle-button" :class="positionClass" @click.stop=""></div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      taskType: 'longTerm'
    };
  },
  computed: {
    positionClass() {
      return {
        'toggle-left': this.taskType === 'onlyTheday',
        'toggle-center': this.taskType === 'longTerm',
        'toggle-right': this.taskType === 'repeat',
      };
    }
  },
  methods: {
    moveButton(event) {
      const containerWidth = this.$el.clientWidth;
      const clickPosition = event.offsetX;
      if (clickPosition < containerWidth / 3) {
        this.taskType = 'onlyTheday';
      } else if (clickPosition < 2 * containerWidth / 3) {
        this.taskType = 'longTerm';
      } else {
        this.taskType = 'repeat';
      }
    }
  }
};
</script>

<style scoped>
.text-box {
  flex: 1; /* 使每个盒子占据相等的宽度 */
  height: 100%; /* 使每个盒子的高度与容器一致 */
  box-sizing: border-box; /* 包含边框和内边距在内的宽度计算 */
  display: flex; /* 使用 Flexbox 布局 */
  align-items: center; /* 垂直居中对齐 */
  justify-content: center; /* 水平居中对齐 */
  font-size: 16px; /* 设置字体大小，可以根据需要调整 */
  color: #333; /* 设置文字颜色 */
  pointer-events: none;
  transition: all 0.3s;
  font-weight: bold;
}

.text-select {
  color: rgb(223, 17, 162);
  font-size: 18px;
}

.toggle-container {
  z-index: 1000;
  margin-top: 10px;
  margin-bottom: 10px;
  width: 80%;
  height: 50px;
  border-radius: 25px;
  position: relative;
  display: flex;
  align-items: center;
  cursor: pointer;
}

.toggle-button {
  width: calc(100% / 3);
  height: 50px;
  background-color: #fff;
  border-radius: 25px;
  position: absolute;
  transition: left 0.3s;
  opacity: 0.5;
}

.toggle-left {
  left: 0;
}

.toggle-center {
  left: calc(50% - 100% / 6);
}

.toggle-right {
  left: calc(100% - 100% / 3);
}
</style>