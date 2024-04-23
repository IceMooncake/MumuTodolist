import { createApp } from 'vue';
import App from './App.vue';
import router from './router/index.js'; // 导入路由器实例

const app = createApp(App);
app.use(router); // 注册路由器
app.mount('#app');
