<template>
  <div class="container">
    <transition name="fade" @before-enter="beforeEnter" @enter="enter" @leave="leave">
      <div class="box" :key="currentText">
        {{ currentText }}
      </div>
    </transition>
    <button @click="toggleText">切换</button>
  </div>
</template>

<script>
export default {
  data() {
    return {
      texts: ['年', '月', '日'],
      currentIndex: 0,
    };
  },
  computed: {
    currentText() {
      return this.texts[this.currentIndex];
    },
  },
  methods: {
    toggleText() {
      this.currentIndex = (this.currentIndex + 1) % this.texts.length;
    },
    beforeEnter(el) {
      el.style.opacity = 0;
      el.style.transform = 'translateY(20px)';
    },
    enter(el, done) {
      el.offsetHeight; // trigger reflow
      el.style.transition = 'opacity 0.5s, transform 0.5s';
      el.style.opacity = 1;
      el.style.transform = 'translateY(0)';
      done();
    },
    leave(el, done) {
      el.style.transition = 'opacity 0.5s, transform 0.5s';
      el.style.opacity = 0;
      el.style.transform = 'translateY(-20px)';
      done();
    },
  },
};
</script>

<style scoped>
.container {
  text-align: center;
  margin-top: 50px;
}

.box {
  display: inline-block;
  font-size: 2rem;
  font-weight: bold;
  margin: 20px;
}

button {
  padding: 10px 20px;
  font-size: 1rem;
  cursor: pointer;
}

.fade-enter-active, .fade-leave-active {
  transition: opacity 0.5s, transform 0.5s;
}

.fade-enter, .fade-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}
</style>
