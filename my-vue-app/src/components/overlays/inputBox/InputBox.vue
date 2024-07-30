<template>
    <div class="input-box-overlay" :class="{ 'input-box-overlay-hidden': isShowInputOverlay === false }"
        @click="closeInputOverlay()">
        <div class="input-box" :class="{ 'input-box-hidden': isShowInputOverlay === false }" @click.stop="">
            <div class="input-box-list">
                <p class="input-box-title">{{ getOverlayTitle }}</p>
                <ToggleButton ref="togglebutton" v-show="overlayType === 'add'"></ToggleButton>
                <div class="input-box-item"><input type="text" v-model="inputForm.taskName" maxlength="100"
                        class="input-border" placeholder="*TODO事项名称*">
                </div>
                <div class="input-box-item">
                    <textarea style="resize: vertical;" v-model="inputForm.taskDetail" maxlength="1000"
                        class="input-border input-border-taskdetail" placeholder="TODO的详细补充内容">
                    </textarea>
                </div>
                <div class="input-box-item">
                    <input type="date" v-model="inputForm.taskDate" class="input-border input-border-deadline-date">
                    <input type="time" v-model="inputForm.taskTime" class="input-border input-border-deadline-time">
                </div>
                <div class="input-box-item" :class="{ 'input-box-item-hidden': getAddTaskType() != 'repeat' }"
                    v-show="overlayType === 'add' || (overlayType === 'edit' && getAddTaskType() == 'repeat')">
                    <span>每隔</span>
                    <input type="number" v-model="inputRepeatForm.intervalValue" @input="validateDay()"
                        class="input-border input-border-interval-date" />
                    <div class="interval-type-box" @click="changeIntervalType()">
                        <span>{{ getintervalUnitString }}</span>
                    </div>
                    <span>重复一次</span>
                </div>
                <button class="input-commit-button" @click="closeInputOverlay()">取消</button>
                <button class="input-commit-button" @click="buttonCommit()">确认</button>
            </div>
        </div>
    </div>
</template>

<script>
import ToggleButton from '@/components/overlays/inputBox/ToggleButton.vue';
import axios from 'axios';
const apiUrl = process.env.VUE_APP_API_URL;
export default {
    components: {
        ToggleButton,
    },

    data() {
        return {
            hours: Array.from({ length: 24 }, (v, k) => k),
            isShowInputOverlay: false,
            overlayType: 'add',
            currentUserId: this.$route.params.id,
            inputRepeatForm: { intervalUnit: 'days', intervalValue: 1 },
            inputForm: { taskId: '', taskName: '', taskDetail: '', taskDate: '', taskTime: '' },
        }
    },

    props: {
        showTip: Function,
        showList: Function,
    },

    computed: {
        getintervalUnitString() {
            switch (this.inputRepeatForm.intervalUnit) {
                case 'days': return '天';
                case 'weeks': return '周';
                case 'months': return '月';
                case 'years': return '年'
            }
            return '天';
        },
        getOverlayTitle() {
            switch (this.overlayType) {
                case 'add': return '添加任务';
                case 'edit': return '编辑任务';
            }
            return 'add';
        },
    },

    methods: {
        getAddTaskType() {
            if (this.$refs.togglebutton) return this.$refs.togglebutton.taskType;
            return 'longTerm';
        },

        validateDay() {
            if (this.inputRepeatForm.intervalValue < 1) {
                this.inputRepeatForm.intervalValue = 1;
            } else if (this.inputRepeatForm.intervalValue > 366) {
                this.inputRepeatForm.intervalValue = 366;
            }
        },

        checkFormEmpty() {
            if (!this.inputForm.taskName) this.showTip('请输入代办名称');
            else if (!this.inputForm.taskDate) this.showTip('请选择日期');
            else if (!this.inputForm.taskTime) this.showTip('请选择时间');
            else return false;
            return true;
        },

        setFormContent(taskId = '', taskName = '', taskDetail = '', taskDate = '', taskTime = '') {
            this.inputForm = { taskId: taskId, taskName: taskName, taskDetail: taskDetail, taskDate: taskDate, taskTime: taskTime };
        },

        getStringDate(FullDate) {
            const year = String(FullDate.getFullYear()).padStart(4, '0');
            const month = String(FullDate.getMonth() + 1).padStart(2, '0');
            const day = String(FullDate.getDate()).padStart(2, '0');
            return year + '-' + month + '-' + day;
        },

        getStringTime(FullDate) {
            const hour = String(FullDate.getHours()).padStart(2, '0');
            const minute = String(FullDate.getMinutes()).padStart(2, '0');
            return hour + ':' + minute;
        },

        getSendForm() {
            const form = {
                task_id: this.inputForm.taskId,
                user_id: this.currentUserId,
                task_name: this.inputForm.taskName,
                task_detail: this.inputForm.taskDetail,
                deadline: this.inputForm.taskDate + ' ' + this.inputForm.taskTime
            };
            switch (this.getAddTaskType()) {
                case 'onlyTheday': form.show_only_theday = 1; break;
                case 'longTerm': form.show_only_theday = 0; break;
                case 'repeat': {
                    const chooseDay = new Date(form.deadline);
                    form.interval_unit = this.inputRepeatForm.intervalUnit;
                    form.interval_value = this.inputRepeatForm.intervalValue;
                    form.next_run = this.getStringDate(chooseDay) + ' ' + this.getStringTime(new Date('2005-01-05 00:00:00'));
                }
            }
            return form;
        },

        async addTask() {
            if (!this.checkFormEmpty()) {
                const form = this.getSendForm();
                try {
                    if (this.getAddTaskType() == 'repeat') await axios.post(`${apiUrl}/api/addRepeatTask`, form);
                    else await axios.post(`${apiUrl}/api/addTask`, form);
                    this.showTip('添加成功');
                    this.setFormContent();
                    this.showList(true, false);
                    this.closeInputOverlay();
                } catch (e) {
                    this.showTip(e.response.data.error);
                }
            }
        },

        async updateTask() {
            if (!this.checkFormEmpty()) {
                const form = this.getSendForm();
                try {
                    if (this.getAddTaskType() == 'repeat') await axios.put(`${apiUrl}/api/updateRepeatTask`, form);
                    else await axios.put(`${apiUrl}/api/updateTask`, form);
                    this.showTip('修改成功');
                    this.showList(true, false);
                    this.closeInputOverlay();
                } catch (e) {
                    this.showTip(e.response.data.error);
                }
            }
        },

        buttonCommit() {
            switch (this.overlayType) {
                case 'add': this.addTask(); break;
                case 'edit': this.updateTask(); break;
                default: break;
            }
        },

        setFromTaskDeadline(date, time) {
            if (date) this.inputForm.taskDate = this.getStringDate(date);
            if (time) this.inputForm.taskTime = this.getStringTime(time);
        },

        changeIntervalType() {
            switch (this.inputRepeatForm.intervalUnit) {
                case 'days': return this.inputRepeatForm.intervalUnit = 'weeks';
                case 'weeks': return this.inputRepeatForm.intervalUnit = 'months';
                case 'months': return this.inputRepeatForm.intervalUnit = 'years';
                case 'years': return this.inputRepeatForm.intervalUnit = 'days';
                default: break;
            }
        },

        showOverlayToAdd() {
            if (!this.inputForm.taskDate) this.setFromTaskDeadline(new Date(), null)
            if (!this.inputForm.taskTime) this.setFromTaskDeadline(null, new Date('2005-01-05 23:59:59'))
            this.isShowInputOverlay = true;
            this.overlayType = 'add';
        },

        showOverlayToUpdate(item) {
            let currentTime = new Date(item.deadline);
            this.$refs.togglebutton.taskType = 'longTerm';
            if(item.next_run) {
                currentTime = new Date('2005-01-05 ' + item.deadline);
                const nextRun = new Date(item.next_run)
                currentTime.setFullYear(nextRun.getFullYear(), nextRun.getMonth(), nextRun.getDate())
                this.$refs.togglebutton.taskType = 'repeat';
                this.inputRepeatForm.intervalUnit = item.interval_unit;
                this.inputRepeatForm.intervalValue = item.interval_value;
            }
            this.inputForm.taskId = item.id;
            this.inputForm.taskName = item.task_name;
            this.inputForm.taskDetail = item.task_detail;
            this.inputForm.taskDate = this.getStringDate(currentTime);
            this.inputForm.taskTime = this.getStringTime(currentTime);
            this.isShowInputOverlay = true;
            this.overlayType = 'edit';
        },

        closeInputOverlay() {
            if (this.overlayType == 'edit') this.setFormContent();
            this.isShowInputOverlay = false;
        },
    }
}
</script>

<style scoped>
.input-box-overlay {
    position: fixed;
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
    opacity: 1;
    transition: all 0.2s ease-in-out, opacity 0.3s ease-in-out;
    background-color: #3f3f3f14;
}

.input-box-overlay-hidden {
    opacity: 0;
    top: 100%;
    left: 100%;
    height: 0;
    width: 0;
}

.input-box {
    display: flex;
    justify-content: center;
    align-items: center;
    transition: all 0.2s ease-in-out;
    background-color: #9edcdce4;
    width: 90%;
    height: auto;
    padding: 10px;
    border-radius: 5%;
    line-height: 1.5;
}

.input-box-hidden {
    opacity: 0;
    height: 0;
    width: 0;
}

.input-box-list {
    display: flex;
    justify-content: center;
    align-items: center;
    flex-wrap: wrap;
}

.input-box-title {
    width: 70%;
    margin-top: 10px;
    margin-bottom: 10px;
    text-align: center;
    font-weight: bold;
    font-size: 22px;
    color: #030d1f;
    background-color: rgba(193, 146, 224, 0.406);
    box-shadow: 0 0 20px rgb(255, 255, 255);
    border-radius: 20px;
}

.input-box-item {
    display: flex;
    justify-content: center;
    align-items: center;
    white-space: nowrap;
    margin-bottom: 5px;
    width: 90%;
    height: 10%;
    /* 此height无效果，目的是让动画退出时高度延迟变化 */
    transition: all 0.3s ease-in-out;
}

.input-box-item-hidden {
    height: 0px;
    opacity: 0;
}

.input-item-title {
    width: 100%;
    display: block;
    text-align: center;
    color: #ffffff;
    font-weight: bold;
}

.input-border {
    box-sizing: border-box;
    padding: 5px;
    border: 2px solid #525252;
    border-radius: 10px;
    font-size: 16px;
    outline: none;
    transition: all 0.3s ease-in-out;
    width: 100%;
    display: inline-block;
}

.input-border:focus {
    border-color: #d4146eb5;
}

.input-border-taskdetail {
    height: 100px;
}

.input-border-deadline-date {
    width: 50%;
    margin-left: 0px;
    margin-right: 5px;
}

.input-border-deadline-time {
    width: 50%;
    margin-left: 5px;
    margin-right: 0px;
}

.input-border-interval-date {
    text-align: center;
    width: 12%;
    margin-left: 10px;
    margin-right: 10px;
}

.interval-type-box {
    text-align: center;
    height: 100%;
    width: 10%;
    background-color: rgba(72, 193, 41, 0.345);
    box-shadow: 0px 0px 10px #5989e3eb;
    border-radius: 20%;
    margin-right: 10px;
}

.input-commit-button {
    padding: 8px 25px;
    width: 35%;
    margin-left: 5px;
    margin-right: 5px;
    margin-bottom: 20px;
    white-space: nowrap;
    border: none;
    border-radius: 10px;
    background-color: rgb(11, 33, 203);
    color: #ffffff;
    box-shadow: 0 0 20px rgb(206, 105, 237);
    font-size: 16px;
    cursor: pointer;
    transition: all 0.8s ease-in-out, color 0.8s ease-in-out;
}
</style>