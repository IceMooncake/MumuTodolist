<template>
    <div class="header-bar">
        <div class="header-btn" @click="logout()">登出</div>
        <div class="header-btn" @click="changePasswordsOverlay()">改密</div>
        <button class="change-able-btn" :class="{ 'change-able-btn-false': isShowLoverTask === false }"
            @click="changeShowLoverBtn(); coldDownShowLoverBtn()" :disabled="disShowLoverBtn">偷窥</button>
        <button class="change-able-btn" :class="{ 'change-able-btn-false': isShowRepeatTask === false }"
            @click="changeShowRepeatBtn(); coldDownShowRepeatBtn()" :disabled="disShowRepeatBtn">循环</button>
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
        changeShowRepeatTask: Function,
        changeShowCalender: Function,
    },
    data() {
        return {
            isShowLoverTask: false,
            isShowRepeatTask: false,
            isShowCalender: false,
            disShowLoverBtn: false,
            disShowRepeatBtn: false,
            disCalenderBtn: false,
        };
    },
    methods: {
        coldDownShowLoverBtn() {
            this.disShowLoverBtn = true;
            setTimeout(() => { this.disShowLoverBtn = false }, 500);
        },
        changeShowLoverBtn() {
            this.isShowLoverTask = !this.isShowLoverTask;
            this.changeShowLoverTask();
        },
        coldDownShowRepeatBtn() {
            this.disShowRepeatBtn = true;
            setTimeout(() => { this.disShowRepeatBtn = false }, 500);
        },
        changeShowRepeatBtn() {
            this.isShowRepeatTask = !this.isShowRepeatTask;
            this.changeShowRepeatTask();
        },
        coldDownShowCalender() {
            this.disCalenderBtn = true;
            setTimeout(() => { this.disCalenderBtn = false }, 300)
        },
        changeShowCalenderBtn() {
            this.isShowCalender = !this.isShowCalender;
            this.changeShowCalender();
        },
        setShowCalenderBtn(states) {
            this.isShowCalender = states;
        },
    }
}
</script>


<style scoped>
.header-bar {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    padding: 8px;
    margin-bottom: 0;
    white-space: nowrap;
    overflow: hidden;
}

.header-btn {
    display: inline-block;
    padding: 5px 10px;
    background-color: rgba(150, 28, 146, 0.365);
    font-size: 13px;
    margin-right: 8px;
    color: #fff;
    border: none;
    border-radius: 20px;
    cursor: pointer;
}

.change-able-btn {
    display: inline-block;
    padding: 5px 10px;
    background-color: rgba(40, 28, 150, 0.365);
    font-size: 13px;
    margin-right: 8px;
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