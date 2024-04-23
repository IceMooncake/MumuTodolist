<template>
    <!--任务列表-->
    <div class="list" @click.stop="">
        <div v-for="item in taskList" :key="item.id" class="task-item"
            :class="{ 'task-item-current': item.isCurrentTask, 'task-item-finished': item.finish_time, 'task-item-lover': item.isLoverTask }"
            @mousedown="resetItemMouseDown(item)" @click="handleItemClick(item)"
            v-show="isShowLoverTask || !item.isLoverTask">
            <!--每个任务的编辑按钮的遮罩层-->
            <div class="task-edit-overlay" :class="{ 'task-edit-overlay-hidden': clickItem.id !== item.id }"
                v-if="!item.isLoverTask">
                <div class="edit-button edit-button-delete" @click.stop="deleteTask(item.id)">
                    <div class="edit-button-text">✘</div>
                </div>
                <div class="edit-button edit-button-alter" @click.stop="showOverlayToUpdate(item)">
                    <span class="edit-button-text">○</span>
                </div>
                <div class="edit-button edit-button-totop" @click.stop="setCurrentTask(item.id)"
                    v-if="!item.isCurrentTask && !item.finish_time">
                    <span class="edit-button-text">↑</span>
                </div>
                <div class="edit-button edit-button-totop" @click.stop="setCurrentTask(null)" v-if="item.isCurrentTask">
                    <span class="edit-button-text">↓</span>
                </div>
                <div class="edit-button edit-button-finish" @click.stop="completTask(item.id, 0)"
                    v-if="!item.finish_time">
                    <span class="edit-button-text">√</span>
                </div>
                <div class="edit-button edit-button-finish" @click.stop="completTask(item.id, 1)"
                    v-if="item.finish_time">
                    <span class="edit-button-text">←</span>
                </div>
            </div>
            <!--每个任务的信息-->
            <div class="task-info"
                :class="{ 'task-info-hidden': clickItem.id === item.id && item.isLoverTask !== true }">
                <h2 class="task-name">{{ item.task_name }}</h2>
                <p class="task-detail">{{ item.task_detail }}</p>
                <div class="task-times">
                    <span class="task-time" :class="{ 'task-time-overtime': item.isOverTime && !item.finish_time }">
                        {{ item.deadline }}
                    </span>
                </div>
            </div>
        </div>
    </div>
</template>