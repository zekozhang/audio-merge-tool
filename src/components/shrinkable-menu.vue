<template>
    <div :style="{background: bgColor}" class="ivu-shrinkable-menu">
        <slot name="top"></slot>
        <sidebar-menu 
            v-show="!shrink"
            :menu-list="menuList" 
            @on-change="handleChange"
        ></sidebar-menu>
        <sidebar-menu-shrink 
            v-show="shrink"
            :menu-list="menuList" 
            :icon-color="shrinkIconColor"
            @on-change="handleChange"
        ></sidebar-menu-shrink>
    </div>
</template>

<script>
import sidebarMenu from './sidebarMenu.vue';
import sidebarMenuShrink from './sidebarMenuShrink.vue';
// import util from '@/libs/util';
export default {
    name: 'shrinkableMenu',
    components: {
        sidebarMenu,
        sidebarMenuShrink
    },
    data() {
        return {
            theme: 'dark'
        }
    },
    props: {
        shrink: {
            type: Boolean,
            default: false
        },
        menuList: {
            type: Array,
            required: true
        },
        beforePush: {
            type: Function
        },
        openNames: {
            type: Array
        }
    },
    computed: {
        bgColor () {
            return this.theme === 'dark' ? '#495060' : '#fff';
        },
        shrinkIconColor () {
            return this.theme === 'dark' ? '#fff' : '#495060';
        }
    },
    methods: {
        handleChange (name) {
            let willpush = true;
            if (this.beforePush !== undefined) {
                if (!this.beforePush(name)) {
                    willpush = false;
                }
            }
            if (willpush) {
                this.$router.push({
                    name: name
                });
            }
            this.$emit('on-change', name);
        }
    }
};
</script>
<style lang="less">
    .ivu-menu.ivu-menu-vertical .ivu-menu-submenu .ivu-menu-item.ivu-menu-item-active,
    .ivu-menu.ivu-menu-vertical .ivu-menu-submenu .ivu-menu-item.ivu-menu-item-active:hover {
        background: #152547!important;
        color: #2d8cf0;
    }
    .ivu-shrinkable-menu {
        background: #20335d!important;
    }
    .ivu-menu-submenu-title {
        color: #a8adaf!important;
        background: #20335d!important;
        &:hover {
            color: #fff!important;
            background-color: #152547!important;
        }
    }
    .ivu-menu.ivu-menu-vertical {
        .ivu-menu-submenu .ivu-menu-item {
            background: #20335d!important;
            &:hover {
                background: #152547!important;
            }
        }
    }
    .ivu-menu {
        .ivu-menu-item {
            background: #20335d!important;
            &:hover {
                background: #152547!important;
            }
        }
    }
    
</style>

