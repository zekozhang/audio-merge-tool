<template>
     <div class="main" >
        <div class="main-header-con">
            <div class="main-header">
                <div class="navicon-con">
					<h1 class="title">音频剪辑合成工具</h1>
                </div>
                <div class="header-avator-con">
                    <div class="user-dropdown-menu-con">
                        <Row type="flex" justify="end" align="middle" class="user-dropdown-innercon pr30 cursor">
                            <span class="mr30" style="font-size: 15px;">{{userName}}</span>
                            <a @click="loginout">退出</a>
                        </Row>
                    </div>
                </div>
            </div>
        </div>
        <div class="single-page-con" style="width: 100%;">
            <div class="single-page">
                <router-view></router-view>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    components: {
    },
    data () {
        return {
            shrink: false,
            userName: '',
            list: []
        };
    },
    computed: {
        menuList () {
            return this.list;
        }
    },
    methods: {
        toggleClick () {
            this.shrink = !this.shrink;
        },
        handleClickUserDropdown (name) {
            // this.$router.push({
            //     name: 'login'
            // });
        },
        windowResize() {//调整整个的页面
            var overAll = {};
            overAll.winWidth = document.body.clientWidth;
            overAll.winHeight = window.innerHeight;
            $(".single-page-con").css("height",overAll.winHeight-55+"px");
        },
        loginout() {
			this.Cookies.set('role','');
			this.Cookies.set('userName','');
			this.Cookies.set('userId','');
			this.Cookies.set('password','');
			this.$store.commit('setToken',null);

			this.$router.push({name: 'login'});
        }
    },
    created() {
        this.userName = this.Cookies.get('userName');
    },
    mounted () {
        // single-page
        $(window).resize(()=> {
            this.windowResize();
        }).trigger('resize');
    }
}
</script>
<style lang="less">
.main-header-con {
	-webkit-box-sizing: border-box;
	box-sizing: border-box;
	position: fixed;
	display: block;
	 padding-left: 0;
	width: 100%;
	height: auto;
	-webkit-transition: padding .3s;
	transition: padding .3s;
}

.main .single-page-con .single-page {
	min-width: 1020px;
	-webkit-box-flex: 1;
	-ms-flex: 1;
	flex: 1;
	margin: 20px 0 0 0;
	background: #fff;
}

.main .title {
	font-family: serif;
}
</style>


