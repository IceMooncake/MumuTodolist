<template>
  <!-- 日历容器，基于 isShow 动态添加 'calender-hidden' 类 -->
  <div class="calendar" :class="{ 'calender-hidden': isShow === false }">
    <!-- 日历头部，包含前一个月和下一个月的按钮，以及当前月份的显示 -->
    <div class="header">
      <button @click="previousMonth">&lt;</button>
      <h2>{{ currentDate.getFullYear() }}年{{ currentDate.getMonth() + 1 }}月</h2>
      <button @click="nextMonth">&gt;</button>
    </div>
    <!-- 星期几标题 -->
    <div class="days">
      <!-- 显示星期几 -->
      <div v-for="(day, index) in daysOfWeek" :key="index" class="day">{{ day }}</div>
      <!-- 显示当月第一天之前的空白天数 -->
      <div v-for="blank in firstDayOfMonth" :key="blank" class="blank"></div>
      <!-- 显示当月的日期 -->
      <div v-for="(date, index) in daysInMonth" :key="index" class="date"
        :class="{ today: isToday(date), selected: isSelected(date) }" @click="selectDate(date)">
        {{ date }}
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    changeShowListMini: Function,
    setShowCalenderBtn: Function,
  },
  data() {
    return {
      // 用来存储当前的年和月
      currentDate: new Date(),
      // 选中的日
      selectedDate: null,
      // 星期几的名称
      daysOfWeek: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
      // 控制日历是否显示
      isShow: false,
    };
  },
  computed: {
    // 计算当前月份的第一天是星期几，用于空出日历的前几个日期
    firstDayOfMonth() {
      const firstDay = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth(), 1);
      return firstDay.getDay();
    },
    // 计算当前月份的天数数组
    daysInMonth() {
      const daysInMonth = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() + 1, 0).getDate();
      return Array.from({ length: daysInMonth }, (_, index) => index + 1);
    },
    
  },
  methods: {
    // 判断给定的日期是否是今天
    isToday(date) {
      const today = new Date();
      return this.currentDate.getMonth() === today.getMonth() && this.currentDate.getFullYear() === today.getFullYear() && date === today.getDate();
    },
    // 判断给定的当月日期是否为选中日期
    isSelected(date) {
      return this.selectedDate && date === this.selectedDate.getDate();
    },
    // 选择日期，发送给父级组件
    selectDate(date) {
      const selectedDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth(), date);
      this.selectedDate = selectedDate;
      this.$emit('sendDate', this.selectedDate);
      this.changeShowCalender();
    },
    // 切换到上一个月
    previousMonth() {
      this.currentDate = new Date(this.currentDate.setMonth(this.currentDate.getMonth() - 1));
    },
    // 切换到下一个月
    nextMonth() {
      this.currentDate = new Date(this.currentDate.setMonth(this.currentDate.getMonth() + 1));
    },
    // 切换日历显示状态
    changeShowCalender() {
      this.isShow = !this.isShow;
      this.changeShowListMini(this.isShow);
      this.setShowCalenderBtn(this.isShow);
    },
  },
};
</script>

<style scoped>
.calendar {
  transition: all 0.3s ease-in-out;
  width: 80%;
  height: 300px;
  border: 1px solid #ccc;
  border-radius: 5px;
  padding: 10px;
  margin: 10px;
  font-family: Arial, sans-serif;
}

.calender-hidden {
  padding: 0;
  margin: 0;
  height: 0;
  opacity: 0;
  border: none;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.days {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 5px;
}

.day {
  text-align: center;
  font-weight: bold;
}

.blank {
  visibility: hidden;
}

.date {
  cursor: pointer;
  text-align: center;
  padding: 5px;
  border-radius: 50%;
}

.today {
  background-color: #f0f0f0;
}

.selected {
  background-color: #007bff;
  color: #fff;
}
</style>