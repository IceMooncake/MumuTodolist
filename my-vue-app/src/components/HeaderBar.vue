<template>
    <div class="header-bar">
        <div class="header-btn" @click="logout()">登出</div>
        <div class="header-btn" @click="changePasswordsOverlay()">改密</div>
        <button class="change-able-btn" :class="{ 'change-able-btn-false': isShowLoverTask === false }"
            @click="changeShowLoverBtn(); coldDownShowLoverBtn()" :disabled="disShowLoverBtn">偷窥</button>
        <button class="change-able-btn" :class="{ 'change-able-btn-false': isShowCalender === false }"
            @click="changeShowCalenderBtn(); coldDownShowCalender()" :disabled="disCalenderBtn">日历</button>
    </div>
</template>

<script>

export default {
    props: {
        logout: Function,
        changePasswordsOverlay: Function,
        changeShowLoverTask: Function,
        changeShowCalender: Function,
    },
    data() {
        return {
            isShowLoverTask: false,
            isShowCalender: false,
            disShowLoverBtn: false,
            disCalenderBtn: false,
        };
    },
    methods: {
        coldDownShowLoverBtn() {
            this.disShowLoverBtn = true;
            setTimeout(() => { this.disShowLoverBtn = false }, 500);
        },
        coldDownShowCalender() {
            this.disCalenderBtn = true;
            setTimeout(() => { this.disCalenderBtn = false }, 300)
        },
        changeShowCalenderBtn() {
            this.isShowCalender = !this.isShowCalender;
            this.changeShowCalender();
        },
        changeShowLoverBtn() {
            this.isShowLoverTask = !this.isShowLoverTask;
            this.changeShowLoverTask();
        }
    }
}
</script>


<style scoped>
.header-bar {
    width: 100%;
    padding: 10px;
    margin-bottom: 0;
    overflow: hidden;
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

.change-able-btn {
    display: inline-block;
    padding: 7px 15px;
    background-color: rgba(40, 28, 150, 0.365);
    font-size: 15px;
    margin-right: 10px;
    color: #fff;
    border: none;
    border-radius: 20px;
    cursor: pointer;
    transition: all 0.3s ease-in-out;
}

.change-able-btn-false {
    background-color: rgba(50, 50, 50, 0.653);
}
</style>