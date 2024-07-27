<!-- ToggleButton.vue -->
<template>
  <div class="toggle-container" @click="moveButton($event)">
    <div class="toggle-button" :class="positionClass" @click.stop=""></div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      position: 'center'
    };
  },
  computed: {
    positionClass() {
      return {
        'toggle-left': this.position === 'left',
        'toggle-center': this.position === 'center',
        'toggle-right': this.position === 'right'
      };
    }
  },
  methods: {
    moveButton(event) {
      const containerWidth = this.$el.clientWidth;
      const clickPosition = event.offsetX;
      if (clickPosition < containerWidth / 3) {
        this.position = 'left';
      } else if (clickPosition < 2 * containerWidth / 3) {
        this.position = 'center';
      } else {
        this.position = 'right';
      }
    }
  }
};
</script>

<style scoped>
.toggle-container {
  width: 90%;
  height: 50px;
  background-color: #ccc;
  border-radius: 25px;
  position: relative;
  display: flex;
  align-items: center;
  cursor: pointer;
}

.toggle-button {
  width: 30%;
  height: 50px;
  background-color: #fff;
  border-radius: 25px;
  position: absolute;
  transition: left 0.3s;
}

.toggle-left {
  left: 0;
}

.toggle-center {
  left: calc(50% - 15%);
}

.toggle-right {
  left: calc(100% - 30%);
}
</style>
