<template>
    <div>
        <Modal
            v-model="modelshow"
            title="提示"
            :mask-closable="false"
            :transfer='false'
            class-name="vertical-center-modal tipmodel"
            >
            <div class="tbody">
                <Icon type="information-circled"></Icon>
                {{message}}
            </div>
            <div slot="footer">
                <Button @click="sureClick" type="primary" v-if="!footerflag">知道了</Button>
                <Button @click="cancelClick" type="ghost" v-if="footerflag">取消</Button>
                <Button @click="okClick" type="primary" v-if="footerflag">确定</Button>
            </div>
            <div slot="close">
            </div>
        </Modal>
    </div>
</template>
<script>
export default {
    props: {
        modelshow: {
            type: Boolean,
            default() {
                return false;
            }
        },
        message: {
            type: String,
            default() {
                return '';
            }
        },
        footerflag: {//如果是true的情况下，就是会显示取消和确定
            type: Boolean,
            default() {
                return false
            }
        }
    },
    data() {
        return {

        }
    },
    methods: {
        sureClick() {
            this.$emit('changeTipModel');
        },
        cancelClick() {
            this.$emit('tipCancelClick');
        },
        okClick() {
            this.$emit('tipmodelOkClick');
        }
    }
  
}
</script>
<style lang="less">
.tipmodel {
    .tbody {
        padding: 20px 30px;
        font-size: 14px;
        .ivu-icon {
            color: #f90;
            margin-right: 5px;
        }
    }
}
</style>


