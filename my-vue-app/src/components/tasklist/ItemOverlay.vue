<template>
    <!--每个任务的编辑按钮的遮罩层-->
    <div class="task-edit-overlay" :class="{ 'task-edit-overlay-hidden': isHidden === true }" v-if="!item.isLoverTask">
        <!--删除按钮-->
        <div class="edit-button edit-button-delete" @click="deleteTask(item.id)">
            <div class="edit-button-text">✘</div>
        </div>
        <!--修改按钮-->
        <div class="edit-button edit-button-alter" @click="showOverlayToUpdate(item)">
            <span class="edit-button-text">○</span>
        </div>
        <!--置顶按钮-->
        <div class="edit-button edit-button-totop" @click="setCurrentTask(item.id)"
            v-if="!item.isCurrentTask && !item.finish_time && !item.repeat_hour">
            <span class="edit-button-text">↑</span>
        </div>
        <!--取消置顶按钮-->
        <div class="edit-button edit-button-totop" @click="setCurrentTask(null)" v-if="item.isCurrentTask && !item.repeat_hour">
            <span class="edit-button-text">↓</span>
        </div>
        <!--完成按钮-->
        <div class="edit-button edit-button-finish" @click="completTask(item.id, 0)" v-if="!item.finish_time && !item.repeat_hour">
            <span class="edit-button-text">√</span>
        </div>
        <!--取消完成按钮-->
        <div class="edit-button edit-button-finish" @click="completTask(item.id, 1)" v-if="item.finish_time && !item.repeat_hour">
            <span class="edit-button-text">←</span>
        </div>
    </div>
</template>

<script>
import axios from 'axios';
const apiUrl = process.env.VUE_APP_API_URL;

export default {
    data() {
        return {
            currentUserId: this.$route.params.id,
        }
    },

    props: {
        isHidden: Boolean,
        item: Object,
        formatTime: Function,
        showOverlayToUpdate: Function,
        showTip: Function,
        showList: Function,
    },

    methods: {
        async deleteTask(taskId) {
            try {
                if(!this.item.repeat_hour) await axios.delete(`${apiUrl}/api/deleteTask/${taskId}`);
                else await axios.delete(`${apiUrl}/api/deleteRepeatTask/${taskId}`);
                this.showTip('删除成功');
                this.showList(true, false)
            } catch (e) {
                this.showTip(e.response.data.error);
            }
        },

        async setCurrentTask(taskId) {
            try {
                await axios.post(`${apiUrl}/api/setCurrentTask`, { taskId: taskId, userId: this.currentUserId });
                this.showTip('设置成功');
                if (taskId) this.showList(true, false);
                else this.showList(true, false);
            } catch (e) {
                this.showTip(e.response.data.error);
            }
        },

        async completTask(taskId, isDeComplete) {
            try {
                if (isDeComplete) {
                    await axios.post(`${apiUrl}/api/completTask`, { taskId: taskId, finishTime: null });
                    this.showTip('撤销成功');
                    this.showList(true, false);
                }
                else {
                    await axios.post(`${apiUrl}/api/completTask`, { taskId: taskId, finishTime: this.formatTime(new Date()) });
                    this.showTip('完成任务啦，夸夸！');
                    this.showList(true, false);
                }

            } catch (e) {
                this.showTip(e.response.data.error);
            }
        },
    }
}
</script>


<style src="./css/itemOverlay.css" scoped> </style>