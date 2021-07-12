import axios from 'axios'
import Vue from 'vue'
import iView from 'iview'
import site from '../libs/config'
import store from '../vuex/store'
import router from '../router'

Vue.use(iView);
Vue.prototype.$axios = axios;

export const base = site.base;//测试环境

//接口请求拦截器
axios.interceptors.request.use((config) => {
    config.headers.post['Content-Type'] = "application/json;charset=utf-8";
    if(store.state.token) {
        config.headers.token = store.state.token;
    }
    return config;
}, (error) => {
    Vue.prototype.$Message.error('请求有异常，请联系管理员~');
    return Promise.reject(error);
});

//接口返回拦截器
axios.interceptors.response.use((res) => {
    if(res.data && res.data.status == 1000) {
        return res;
    } else {
        switch (res.data.status) {
            case 10005:
                // 清除token信息并跳转到登录页面
                if(store.state.sessionLogNum == 0) {
                    //设置sessionLogNum是1，不让
                    store.commit('setSessionLogNum',1);
                    console.log(store.state.sessionLogNum);
                    store.dispatch('setToken',null);
                    Vue.prototype.$Message.error(res.data.msg);
                    router.push({
                        path: '/login'
                    });
                }
                break;
            default:
                Vue.prototype.$Message.error(res.data.msg);
                return Promise.reject(res);
        }
    }
}, (error) => {
    Vue.prototype.$Message.error('网络错误');
    return Promise.reject(error);
});
