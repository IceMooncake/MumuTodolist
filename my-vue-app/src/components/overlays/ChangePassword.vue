<template>
    <!--显示修改密码-->
    <div class="change-password-overlay" :class="{ 'change-password-overlay-hidden': isShowChangePassword === false }">
        <form class="change-password-form" @submit.prevent="changePassword()">
            <input type="text" name="username" autocomplete="username" style="display:none">
            <label for="oldPassword">原密码:</label>
            <input type="password" class="input-text-border" v-model="changePasswordForm.oldPassword" autocomplete="old-password">
            <label for="newPassword">新密码:</label>
            <input type="password" class="input-text-border" v-model="changePasswordForm.newPassword" autocomplete="new-password">
            <label for="repeatNewPassword">重复新密码:</label>
            <input type="password" class="input-text-border" v-model="changePasswordForm.repeatPassword" autocomplete="repeat-password">
            <button type="submit" class="input-commit-button" @click="changePassword()">提交</button>
            <button class="input-commit-button" @click.prevent="changePasswordsOverlay()">取消</button>
        </form>
    </div>
</template>

<script>
import axios from 'axios';
const apiUrl = process.env.VUE_APP_API_URL;

export default {
    data() {
        return {
            isShowChangePassword: false,
            currentUserId: this.$route.params.id,
            changePasswordForm: {
                oldPassword: '',
                newPassword: '',
                repeatPassword: ''
            },
        };
    },

    props: {
        showTip: Function,
        logout: Function,
    },

    methods: {
        async changePassword() {
            if (!this.changePasswordForm.newPassword || !this.changePasswordForm.oldPassword || !this.changePasswordForm.repeatPassword) {
                this.showTip('输入框不可以空着哦');
            }
            else if (this.changePasswordForm.newPassword !== this.changePasswordForm.repeatPassword) this.showTip('新密码与重复输入不相同');
            else {
                try {
                    await axios.post(`${apiUrl}/api/changePassword`, { userId: this.currentUserId, pwd: this.changePasswordForm.oldPassword, newPwd: this.changePasswordForm.newPassword });
                    this.isShowChangePassword = false;
                    this.showTip('修改密码成功啦');
                    this.logout();
                } catch (e) {
                    this.showTip('好像出错了，检查一下密码是否正确');
                }
            }
        },

        changePasswordsOverlay() {
            this.isShowChangePassword = !this.isShowChangePassword;
        }
    },

    mounted() {
        setTimeout(() => {
            this.isShowContent = true;
        }, 100);
    }

};
</script>


<style scoped>
.change-password-overlay {
    position: fixed;
    display: flex;
    justify-content: center;
    align-items: center;
    transition: all 0.2s ease-in-out;
    top: 0;
    left: 0;
    color: #ffffff;
    width: 100%;
    height: 100%;
    background-color: #525252a1;
}

.change-password-overlay-hidden {
    top: -100%;
}

.change-password-form {
    display: flex;
    justify-content: center;
    align-items: center;
    flex-wrap: wrap;
}

.change-password-form * {
    flex-basis: 60%;
}

.input-text-border {
    padding: 5px;
    border: 2px solid #525252;
    border-radius: 10px;
    font-size: 16px;
    outline: none;
    transition: all 0.3s ease-in-out;
    margin-bottom: 10px;
    display: inline-block;
}

.input-text-border:focus {
    border-color: #d4146eb5;
}

.input-commit-button {
    padding: 8px 25px;
    margin-left: 10px;
    margin-right: 10px;
    margin-top: 10px;
    margin-bottom: 10px;
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