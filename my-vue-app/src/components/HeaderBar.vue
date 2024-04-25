<template>
    <div class="header-bar">
        <div class="header-btn" @click="logout()">登出</div>
        <div class="header-btn" @click="changePasswordsOverlay()">修改密码</div>
        <div class="show-lovertask-btn" :class="{ 'show-lovertask-btn-false': isShowLoverTask === false }"
            @click="changeShowLoverTask()" v-if="isBingMu">偷窥</div>
    </div>
</template>

<script>

export default {
    props: {
        isShowLoverTask: Boolean,
        logout: Function,
        changePasswordsOverlay: Function,
        changeShowLoverTask: Function,
    },
    data() {
        return {
            isBingMu: this.$route.params.id == 1 || this.$route.params.id == 2,
        };
    },

};
</script>


<style scoped>

.header-bar {
    width: 100%;
    padding: 15px;
    overflow: hidden;
    display: flex;
}

.header-btn {
    display: inline-block;
    padding: 7px 15px;
    background-color: rgba(150, 28, 146, 0.365);
    font-size: 15px;
    margin-right: 10px;
    color: #fff;
    border: none;
    border-radius: 20px;
    cursor: pointer;
}

.show-lovertask-btn {
    display: inline-block;
    padding: 7px 15px;
    background-color: rgba(40, 28, 150, 0.365);
    font-size: 15px;
    margin-right: 10px;
    color: #fff;
    border: none;
    border-radius: 20px;
    cursor: pointer;
}

.show-lovertask-btn-false {
    background-color: rgba(50, 50, 50, 0.653);
}
</style>