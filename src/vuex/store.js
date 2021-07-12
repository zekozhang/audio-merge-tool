import Vue from 'vue'
import Vuex from 'vuex'
import * as actions from './actions'
import * as getters from './getters'

Vue.use(Vuex)

// 应用初始状态
let state = {
    breadList: {},
    token: sessionStorage.getItem('token') || '',
    sessionLogNum: 0,
    userInfo: sessionStorage.getItem('userInfo') || ''
}

// 定义所需的 mutations
const mutations = {
    add(state) {
        state.count++
    },
    del(state) {
        state.count--
    },
    setToken(state,value) {
        sessionStorage.setItem('token',value);
        state.token = value;
    },
    setSessionLogNum(state,value) {
        state.sessionLogNum = value;
    },
    setUserInfo(state,value) {
        sessionStorage.setItem('userInfo',value);
        state.userInfo = value;
    }
}

// 创建 store 实例
export default new Vuex.Store({
    actions,
    getters,
    state,
    mutations
})