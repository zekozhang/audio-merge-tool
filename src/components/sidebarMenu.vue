<template>
    <Menu ref="sideMenu" :active-name="activeName()" theme="dark" :open-names="openNames" width="auto" @on-select="changeMenu">
        <template v-for="item in menuList">
            <Submenu v-if="item.children && item.children.length >= 1" :name="item.name" :key="item.path">
                <template slot="title">
                    <Icon :type="item.icon" :size="iconSize"></Icon>
                    <span class="layout-text">{{ item.title }}</span>
                </template>
                <template v-for="child in item.children">
                    <MenuItem :name="child.name">
                        <Icon :type="child.icon" :size="iconSize"></Icon>
                        <span class="layout-text">{{ child.title }}</span>
                    </MenuItem>
                </template>
            </Submenu>
            <MenuItem :name="item.name" v-else>
                <template>
                    <Icon :type="item.icon" :size="iconSize"></Icon>
                    <span class="layout-text">{{ item.title }}</span>
                </template>
            </MenuItem>
        </template>
    </Menu>
</template>

<script>
export default {
    name: 'sidebarMenu',
    data() {
        return {
            openNames: []
        }
    },
    props: {
        menuList: Array,
        iconSize: Number,

    },
    methods: {
        changeMenu (active) {
            let activeArray = active.split('/');
            this.openNames = [activeArray[0]];
            
            this.$router.push({name: active});
        },
        activeName() {
            let namesplit = this.$route.name.split('/');
            return '/'+ namesplit[1] + '/' + namesplit[2];
        }
    },
    updated () {
        this.$nextTick(() => {
            if (this.$refs.sideMenu) {
                this.$refs.sideMenu.updateOpened();
            }
        });
    },
    watch: {
        'oepnNames': function(oldName,newName) {
            // console.log(oldName,newName);
        }
    },
    created() {
        this.openNames =[location.hash.split('/')[1]];
    },
    mounted() {
        // console.log(this.menuList);
    }

};
</script>
