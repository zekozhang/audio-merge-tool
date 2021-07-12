<template>
    <div  id="app" class="app-main">
        <router-view></router-view>
    </div>
</template>

<script>
import shrinkableMenu from '@/components/shrinkable-menu.vue'
// import {basicpath} from '@/router/index.js'
export default {
    name: "App",
    components: {
        shrinkableMenu
    },
    data () {
        return {
            shrink: false,
            userName: '',
            // list: basicpath
        };
    },
    computed: {
        menuList () {
            // return this.list;
        }
    },
    methods: {
        pathUrl(url) {
            let ary = url.slice(1).split('/');
            ary.pop();

            return '/'+ary.join('/');
        },
        toggleClick () {
            this.shrink = !this.shrink;
        },
        handleClickUserDropdown (name) {
            // this.$router.push({
            //     name: 'login'
            // });
        },
    },
    created() {

    },
    mounted () {
    }
};
</script>

<style lang="less">
@import url('./css/menu.less');
@import url('./css/main.less');
@import url('./css/resetiview.less');
#app {
    width:100%;
    height: 100%;
    font-family: "Microsoft Yahei", Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    overflow: hidden;
}
</style>
