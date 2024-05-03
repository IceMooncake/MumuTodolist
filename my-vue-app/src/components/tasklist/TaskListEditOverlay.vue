<template>
    <!--每个任务的编辑按钮的遮罩层-->
    <div class="task-edit-overlay" :class="{'task-edit-overlay-hidden' : isHidden===true}" v-if="!item.isLoverTask">
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
            v-if="!item.isCurrentTask && !item.finish_time">
            <span class="edit-button-text">↑</span>
        </div>
        <!--取消置顶按钮-->
        <div class="edit-button edit-button-totop" @click="setCurrentTask(null)" v-if="item.isCurrentTask">
            <span class="edit-button-text">↓</span>
        </div>
        <!--完成按钮-->
        <div class="edit-button edit-button-finish" @click="completTask(item.id, 0)" v-if="!item.finish_time">
            <span class="edit-button-text">√</span>
        </div>
        <!--取消完成按钮-->
        <div class="edit-button edit-button-finish" @click="completTask(item.id, 1)" v-if="item.finish_time">
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
        getFormatTime: Function,
        showOverlayToUpdate: Function,
        fetchItems: Function,
        showTip: Function,
    },

    methods: {
        async deleteTask(taskId) {
            try {
                await axios.delete(`${apiUrl}/api/deleteTask/${taskId}`);
                this.showTip('删除成功');
                this.fetchItems();
            } catch (e) {
                this.showTip('失败了www再试一下吧');
            }
        },

        async setCurrentTask(taskId) {
            try {
                await axios.post(`${apiUrl}/api/setCurrentTask`, { taskId: taskId, userId: this.currentUserId });
                this.showTip('设置成功');
                this.fetchItems();
            } catch (e) {
                this.showTip('失败了www再试一下吧');
            }
        },

        async completTask(taskId, isDeComplete) {
            try {
                if (isDeComplete) await axios.post(`${apiUrl}/api/completTask`, { taskId: taskId, finishTime: null });
                else await axios.post(`${apiUrl}/api/completTask`, { taskId: taskId, finishTime: this.getFormatTime(new Date()) });
                if (isDeComplete) this.showTip('撤销成功');
                else this.showTip('完成任务啦');
                this.fetchItems();
            } catch (e) {
                this.showTip('失败了www再试一下吧');
            }
        },
    }
}
</script>


<style scoped>
.task-edit-overlay {
    z-index: 1;
    display: flex;
    position: absolute;
    opacity: 1;
    left: 0vh;
    justify-content: center;
    align-items: center;
    margin: 0 auto;
    width: 100%;
    height: 100%;
    border-radius: 5px;
    transition: all 0.32s ease;
    background-color: #00000010;
}

.task-edit-overlay-hidden {
  z-index: 0;
  opacity: 0;
  left: 100%;
}

.edit-button {
    width: 55px;
    height: 55px;
    margin-left: 2%;
    margin-right: 2%;
    border-radius: 50%;
    border: none;
    color: white;
    font-size: 16px;
    font-weight: bold;
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    /* 添加阴影效果 */
}

.edit-button-delete {
    background-color: rgba(172, 77, 59, 0.792);
}

.edit-button-alter {
    background-color: rgba(50, 197, 205, 0.642)
}

.edit-button-totop {
    background-color: rgba(0, 0, 255, 0.5);
}

.edit-button-finish {
    background-color: rgba(114, 254, 98, 0.596);
}

.edit-button-text {
    color: rgb(255, 255, 255);
    font-weight: bold;
}
</style>