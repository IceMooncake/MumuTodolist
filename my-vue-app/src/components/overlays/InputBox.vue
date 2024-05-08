<template>
    <div class="input-box-overlay" :class="{ 'input-box-overlay-hidden': isShowInputOverlay === false }">
        <div class="input-box" :class="{ 'input-box-hidden': isShowInputOverlay === false }">
            <div class="input-box-list">
                <p class="input-box-title">{{ overlayTitle }}</p>
                <span class="input-item-name">名称</span>
                <div class="input-box-item"><input type="text" v-model="inputForm.taskName" maxlength="100"
                        class="input-text-border">
                </div>
                <span class="input-item-name">描述</span>
                <div class="input-box-item">
                    <textarea style="resize: vertical;" v-model="inputForm.taskDetail" maxlength="1000"
                        class="input-text-border input-item-taskdetail" >sssssss
                    </textarea>
                </div>
                <span class="input-item-name">日期及时间</span>
                <div class="input-box-item"><input type="date" v-model="inputForm.taskDate" class="input-text-border">
                </div>
                <div class="input-box-item"><input type="time" v-model="inputForm.taskTime" class="input-text-border">
                </div>
                <button class="input-commit-button" @click="closeInputOverlay()">取消</button>
                <button class="input-commit-button" @click="addTask()" v-show="overlayTitle === '添加代办'">确认</button>
                <button class="input-commit-button" @click="updateTask()" v-show="overlayTitle === '修改代办'">确认</button>
            </div>
        </div>
    </div>
</template>

<script>
import axios from 'axios';
const apiUrl = process.env.VUE_APP_API_URL;
export default {
    data() {
        return {
            isShowInputOverlay: false,
            overlayTitle: '',
            currentUserId: this.$route.params.id,
            inputForm: { taskId: '', taskName: '', taskDetail: '', taskDate: '', taskTime: '' },
        }
    },
    props: {
        showTip: Function,
        refreshList: Function,
    },
    methods: {
        checkFormEmpty() {
            if (!this.inputForm.taskName) this.showTip('请输入代办名称');
            else if (!this.inputForm.taskDate) this.showTip('请选择日期');
            else if (!this.inputForm.taskTime) this.showTip('请选择时间');
            else return false;
            return true;
        },

        setFormEmpty() {
            this.inputForm = { taskId: '', taskName: '', taskDetail: '', taskDate: '', taskTime: '' };
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

        async addTask() {
            if (!this.checkFormEmpty()) {
                const inputForm = this.inputForm;
                const item = {
                    user_id: this.currentUserId,
                    task_name: inputForm.taskName,
                    task_detail: inputForm.taskDetail,
                    deadline: inputForm.taskDate + ' ' + inputForm.taskTime
                }
                try {
                    await axios.post(`${apiUrl}/api/addTask`, item);
                    this.showTip('添加成功');
                    this.refreshList();
                    this.closeInputOverlay();
                } catch (e) {
                    this.showTip('失败了www再试一下吧');
                }
            }
        },

        async updateTask() {
            if (!this.checkFormEmpty()) {
                const inputForm = this.inputForm;
                const item = {
                    task_id: this.inputForm.taskId,
                    user_id: this.currentUserId,
                    task_name: inputForm.taskName,
                    task_detail: inputForm.taskDetail,
                    deadline: inputForm.taskDate + ' ' + inputForm.taskTime
                }
                try {
                    await axios.put(`${apiUrl}/api/updateTask`, item);
                    this.showTip('修改成功');
                    this.refreshList();
                } catch (e) {
                    this.showTip('失败了www再试一下吧');
                }
            }
        },

        showOverlayToAdd() {
            this.setFormEmpty();
            const currentTime = new Date();
            if (!this.inputForm.taskDate) this.inputForm.taskDate = this.getStringDate(currentTime);
            if (!this.inputForm.taskTime) this.inputForm.taskTime = this.getStringTime(currentTime);
            this.isShowInputOverlay = true;
            this.overlayTitle = '添加代办';
        },

        showOverlayToUpdate(item) {
            const currentTime = new Date(item.deadline);
            this.inputForm.taskId = item.id;
            this.inputForm.taskName = item.task_name;
            this.inputForm.taskDetail = item.task_detail;
            this.inputForm.taskDate = this.getStringDate(currentTime);
            this.inputForm.taskTime = this.getStringTime(currentTime);
            this.isShowInputOverlay = true;
            this.overlayTitle = '修改代办';
        },

        closeInputOverlay() {
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
    width: 80%;
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
    width: 100%;
    margin: 20px;
    text-align: center;
    font-weight: bold;
    font-size: 22px;
    color: #030d1f;
    background-color: rgba(227, 160, 127, 0.701);
    box-shadow: 0 0 20px rgb(255, 255, 255);
    border-radius: 20px;
}

.input-box-item {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    
}

.input-item-name {
    width: 100%;
    display: block;
    text-align: center;
    color: #ffffff;
    font-weight: bold;
}

.input-item-taskdetail {
    height: 100px;
}

.input-text-border {
    padding: 5px;
    border: 2px solid #525252;
    border-radius: 10px;
    font-size: 16px;
    outline: none;
    transition: all 0.3s ease-in-out;
    margin-bottom: 5px;
    width: 70%;
    display: inline-block;
}

.input-text-border:focus {
    border-color: #d4146eb5;
}

.input-commit-button {
    padding: 8px 25px;
    width: 40%;
    margin-left: 10px;
    margin-right: 10px;
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