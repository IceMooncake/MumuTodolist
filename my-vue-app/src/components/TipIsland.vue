<template>
    <div class="tip-overlay" :class="{ 'tip-overlay-hidden': isShowTip === false }">
        <div class="tip-info" :class="{ 'tip-info-hidden': isShowTip === false }"> {{ tipInfo }} </div>
    </div>
</template>

<script>

export default {
    data() {
        return {
            isShowTip: false,
            tipInfoId: 0,
            tipInfo: '一些信息',
        };
    },

    methods: {

        showTip(tipInfo) {
            this.isShowTip = true;
            this.tipInfo = tipInfo;
            this.tipInfoId += 1;
            let remmberInfoId = this.tipInfoId;
            setTimeout(() => {
                if (remmberInfoId === this.tipInfoId) this.isShowTip = false;
            }, 2000)
        },
    },

    mounted() {
        setTimeout(() => {
            this.isShowContent = true;
        }, 100);
    }

};
</script>


<style scoped>
.tip-overlay {
    position: fixed;
    display: flex;
    justify-content: center;
    align-items: center;
    pointer-events: none;
    transition: all 0.2s ease-in-out;
    top: 0;
    left: 0;
    z-index: 1000000;
    width: 100%;
    height: 100px;
    margin-top: 50px;
}

.tip-overlay-hidden {
    top: -125px;
}

.tip-info {
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
    transition: all 0.2s ease-in-out;
    font-weight: bold;
    color: #000000;
    text-shadow: -1px -1px 0 #ffffff;
    font-size: 17px;
    width: 60%;
    height: 35px;
    padding-left: 20px;
    padding-right: 20px;
    border-radius: 20px;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.53);
    background-color: #ffffff7b;
}

.tip-info-hidden {
    width: 0;
}
</style>