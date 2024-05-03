<template>
  <div>
    <transition-group name="fade" tag="div" class="task-list">
      <div v-for="item in items" :key="item.id" class="fade-item">{{ item.name }}</div>
    </transition-group>
    <button @click="addItem">Add Item</button>
  </div>
</template>

<script>
export default {
  data() {
    return {
      items: [
        { id: 1, name: 'Item 1' },
        { id: 2, name: 'Item 2' },
        { id: 3, name: 'Item 3' }
      ]
    };
  },
  methods: {
    addItem() {
      const newItem = { id: this.items.length + 1, name: `Item ${this.items.length + 1}` };
      this.items.push(newItem);
    }
  }
};
</script>

<style scoped>
.fade-item {
  transition: all 0.1s ease-in-out , opacity 0.2s ease-in-out;
}
.fade-enter-active, .fade-leave-active {
  transform: translateY(10px);
  opacity: 0;
}
.fade-enter, .fade-leave-to {
  opacity: 1;
}
.task-list {
  overflow-y: auto;
  max-height: calc(100% - 80px);
  margin-left: 5%;
  margin-right: 5%;
  scroll-behavior: smooth;
}
</style>
