<template>
  <div class="container" :class="{ 'show-content': showContent }">
    <transition name="slide-fade">
      <div ref="cube" v-if="!loggedIn">
        <div class="input-container" :class="{ 'show-input-container': showContent }">
          <div class="circle-container">
            <div class="circle" :class="{'circle-mumu': userId === 1, 'circle-bing': userId === 2}" @click="changeUser">{{userId === 1 ? '木' : '饼' }}</div>
          </div>
          <div v-if="errorMessage || (!errorMessage && errorTimer > 0)" class="error-message">{{ errorMessage ||
    `太快啦，请等待${errorTimer}s` }}</div>
          <input v-model="password" :type="showPassword ? 'text' : 'password'" placeholder="这里输入密码哦"
            class="custom-input" @keyup.enter="handleEnter">
          <span @click="togglePasswordVisibility" class="eye-icon">{{ showPassword ? '👁️' : '🔒' }}</span>
          <transition name="fade-color">
            <div>
              <button :disabled="buttonDisabled" @click="handleSubmit" class="submit-button" ref="submitButton">
                {{ buttonDisabled ? '请稍候~' : '提交' }}
              </button>
            </div>
          </transition>
        </div>
        <a @click="openMarkdown" class="version-button">v {{ version }}</a>
      </div>
    </transition>
  </div>
  <div class='bottom'>
    <a href="https://beian.miit.gov.cn/" target="_blank">备案号:</a>
    <a href="https://beian.miit.gov.cn/" target="_blank">{{ ICP }}</a>
  </div>
</template>

<script>
import * as THREE from 'three';
import axios from 'axios';
const apiUrl = process.env.VUE_APP_API_URL;

export default {
  data() {
    return {
      password: '',
      showPassword: false,
      buttonDisabled: false,
      errorMessage: '',
      loggedIn: false,
      showContent: false,
      ICP: process.env.VUE_APP_ICP,
      version: process.env.VUE_APP_VERSION,
      errorTimer: -1,
      userId: 1,
      renderer: null
    };
  },
  mounted() {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 4;
    this.renderer = new THREE.WebGLRenderer();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setClearColor(0xa2cae4);
    this.$refs.cube.appendChild(this.renderer.domElement);
    const geometry = new THREE.BoxGeometry();
    const material = new THREE.MeshNormalMaterial();
    const cube = new THREE.Mesh(geometry, material);
    scene.add(cube);

    const animate = () => {
      requestAnimationFrame(animate);
      cube.rotation.x += 0.013;
      cube.rotation.y += 0.014;
      this.renderer.render(scene, camera);
    };

    animate();

    setTimeout(() => {
      this.showContent = true;
    }, 233);

    this.intervalId = setInterval(() => {
      if (this.errorTimer > -1) this.errorTimer--;
      if (this.errorTimer === 0) this.buttonDisabled = false;
    }, 1000);
  },
  methods: {
    changeUser() {
      this.userId = this.userId === 1 ? 2 : 1;
    },
    handleEnter(event) {
      if (event.keyCode === 13) this.$refs.submitButton.click(); //回车提交
    },
    async handleSubmit() {
      this.buttonDisabled = true;
      try {
        const response = await axios.post(`${apiUrl}/api/login`, { userId:this.userId, pwd: this.password });
        if (response.status === 200) {
          this.loggedIn = true;
          localStorage.setItem('token', response.data.token);
          await new Promise(resolve => setTimeout(resolve, 1600));
          this.$router.push('/home/' + this.userId);
        }
      } catch (error) {
        if (error.response) {
          this.errorMessage = error.response.status === 429 ? '' : error.response.data.error;
          this.errorTimer = error.response.status === 429 ? error.response.data.error + 2 : -1;
        } else {
          this.errorMessage = ' 后端网络错误┭┮﹏┭┮ \n （饼饼又要掉头发了）';
        }
      } finally {
        if (this.errorTimer <= 0) this.buttonDisabled = false;
      }
    },
    togglePasswordVisibility() {
      this.showPassword = !this.showPassword;
    },
  }
};
</script>

<style scoped>
* {
  user-select: none;
  -webkit-tap-highlight-color: rgba(0,0,0,0); 
}

.input-container {
  position: fixed;
  bottom: 50%;
  left: 50%;
  transform: translateX(-50%);
  text-align: center;
  transition: opacity 1.0s ease;
  opacity: 0;
}

.circle-container {
  position: relative;
  width: 100%;
}

.circle {
  position: absolute;
  top: -50px; /* 调整圆形位置 */
  left: 50%;
  transform: translateX(-50%);
  width: 40px;
  height: 40px;
  border-radius: 50%;
  color: #ffffff;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 20px;
  font-weight: bold;
  transition: all 0.8s ease-in-out, color 0.8s ease-in-out;
}

.circle-mumu {
  background-color: #eb6c0bba;
  box-shadow: 0 0 10px rgba(0, 178, 249, 0.799);
}

.circle-bing {
  background-color: #0077ffd0;
  box-shadow: 0 0 10px rgba(255, 183, 0, 0.861);
}

.show-input-container {
  opacity: 1;
}

.custom-input {
  padding: 10px;
  border: 2px solid #0f79bc;
  border-radius: 15px;
  font-size: 16px;
  outline: none;
  transition: all 0.5s ease-in-out;
  margin-bottom: 10px;
  width: 200px;
  display: inline-block;
}

.custom-input:focus {
  border-color: #d34688;
  box-shadow: 0 0 12px rgb(219, 0, 106);
}

.eye-icon {
  cursor: pointer;
  display: inline-block;
  font-size: 20px;
  margin-left: -30px;
}

.error-message {
  color: rgb(205, 61, 61);
  white-space: pre-wrap;
  margin-bottom: 10px;
}

.submit-button {
  padding: 8px 25px;
  width: 100px;
  white-space: nowrap;
  border: none;
  border-radius: 10px;
  background-color: rgb(11, 33, 203);
  color: #ffffff;
  box-shadow: 0 0 20px rgb(87, 168, 231);
  font-size: 16px;
  cursor: pointer;
  transition: all 0.8s ease-in-out, color 0.8s ease-in-out;
}

.submit-button:hover {
  background-color: #0091ff;
}

.submit-button:disabled {
  background-color: #0000006c;
}

.fade-color-enter-active,
.fade-color-leave-active {
  transition: background-color 0.3s ease-in-out, color 0.3s ease-in-out;
}

.fade-color-enter,
.fade-color-leave-to {
  opacity: 0;
  transition-delay: 0.3s;
}

.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: all 1.6s ease;
}

.slide-fade-enter,
.slide-fade-leave-to {
  opacity: 0;
  transform: translateY(-100%);
}

.container {
  position: fixed;
  top: -100vh;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #f0f0f0;
  transition: top 0.8s ease, opacity 2.0s ease;
  opacity: 0;
}

.show-content {
  top: 0;
  opacity: 1;
}

.version-button {
  position: fixed;
  bottom: 20px;
  right: 20px;
  padding: 1px 2px;
  border-radius: 6px;
  transition: background-color 0.4s ease-in-out, color 0.4s ease-in-out;
  color: #fff;
  font-size: 14px;
  cursor: pointer;
  border: none;
  outline: none;
  z-index: 1000;
}

.version-button:hover {
  background-color: #ed7e0e;
}

.bottom {
  position: fixed;
  bottom: 0;
}
</style>
