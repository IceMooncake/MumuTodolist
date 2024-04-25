<template>
  <div>
    <transition-group name="list" tag="ul">
      <div v-for="(item, index) in list" :key="item.id" @click="moveToTop(index)">
        <div>{{ item.name }}</div>
      </div>
    </transition-group>
  </div>
</template>

<script>
export default {
  data() {
    return {
      list: [
        { id: 1, name: 'Item 1' },
        { id: 2, name: 'Item 2' },
        { id: 3, name: 'Item 3' },
        { id: 4, name: 'Item 4' },
        // 更多列表项...
      ]
    };
  },
  methods: {
    moveToTop(index) {
      const item = this.list.splice(index, 1)[0]; // 从原位置删除元素并获取该元素
      this.list.unshift(item); // 将元素移到数组首位
    }
  }
};
</script>

<style>
.list-move {
  transition: transform 0.5s ease; /* 过渡效果，可以根据需要调整 */
}

ul {
  list-style-type: none;
  padding: 0;
}

li {
  margin: 10px 0;
  cursor: pointer;
  color: #5a2277
}
</style>
