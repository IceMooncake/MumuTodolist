
import { createRouter, createWebHistory } from 'vue-router';
import axios from 'axios';
import Home from '@/views/HomePage.vue';
import Login from '@/views/BingMuLogin.vue';
import Test from '@/components/tasklist/testTest.vue';
const routes = [
  {
    path: '/',
    name: 'Login',
    component: Login
  },
  {
    path: '/home/:id',
    name: 'Home',
    component: Home,
  },
  {
    path: '/test',
    name: 'Test',
    component: Test
  }

];

const router = createRouter({
  history: createWebHistory(),
  routes
});

router.beforeEach(async (to, from, next) => {
  const apiUrl = process.env.VUE_APP_API_URL;
  const data = localStorage.getItem('token');
  let isAuth = null; //判断是否持有正确token
  let id = null;
  try {
    const response = await axios.post(apiUrl + '/api/tokenAuth', { token: data });
    id = response.data.user.userId;
    isAuth = (response.status === 200);
  } catch (error) {
    if(error) isAuth = false;
  }
  if(to.path !== '/' && !isAuth) return next('/'); //访问非主路由且未登录用户跳转至登录
  if(to.path === '/' && isAuth) return next('/home/' + id); // 访问主路由且已登录用户跳转至应用内
  if(to.path.startsWith('/home/')) {
    if(to.params.id != id) return next('/home/' + id);
  }
  next(); 
});

export default router;
