<template>
    <div class="calendar" :class="{'calender-hidden':isShow === false}">
      <div class="header">
        <button @click="previousMonth">&lt;</button>
        <h2>{{ currentDate.getFullYear() }}年{{ currentDate.getMonth() + 1 }}月</h2>
        <button @click="nextMonth">&gt;</button>
      </div>
      <div class="days">
        <div v-for="(day, index) in daysOfWeek" :key="index" class="day">{{ day }}</div>
        <div v-for="blank in firstDayOfMonth" :key="blank" class="blank"></div>
        <div
          v-for="(date, index) in daysInMonth"
          :key="index"
          class="date"
          :class="{ today: isToday(date), selected: isSelected(date) }"
          @click="selectDate(date)"
        >
          {{ date }}
        </div>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    data() {
      return {
        currentDate: new Date(),
        selectedDate: null,
        daysOfWeek: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
        isShow: true,
      };
    },
    computed: {
      firstDayOfMonth() {
        const firstDay = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth(), 1);
        // getDay方法用于返回一个日期是星期几
        return firstDay.getDay();
      },
      daysInMonth() {
        const daysInMonth = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() + 1, 0).getDate();
        return Array.from({ length: daysInMonth }, (_, index) => index + 1);
      },
    },
    methods: {
      isToday(date) {
        const today = new Date();
        return this.currentDate.getMonth() === today.getMonth() && this.currentDate.getFullYear() === today.getFullYear() && date === today.getDate();
      },
      isSelected(date) {
        return this.selectedDate && this.currentDate.getMonth() === this.selectedDate.getMonth() && this.currentDate.getFullYear() === this.selectedDate.getFullYear() && date === this.selectedDate.getDate();
      },
      selectDate(date) {
        const selectedDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth(), date);
        this.selectedDate = selectedDate;
      },
      previousMonth() {
        this.currentDate = new Date(this.currentDate.setMonth(this.currentDate.getMonth() - 1));
      },
      nextMonth() {
        this.currentDate = new Date(this.currentDate.setMonth(this.currentDate.getMonth() + 1));
      },
      changeShowCalender() {
        this.isShow = !this.isShow;
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
  