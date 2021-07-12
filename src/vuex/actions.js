//test
export const increment = ({commit}) => {
    commit('add')
}
export const decrement = ({commit}) => {
    commit('del')
}
export const changeLogo = ({commit},url) => {
    commit('changeLogo',url)
}
export const changeLeftHide = ({commit},flag) => {
    commit('changeLeftHide',flag)
}
export const changeOpenHide = ({commit},flag) => {
    commit('changeOpenHide',flag)
}
export const create = ({commit},name) => {//创建规则时候 是从哪边进入的
    commit('createName',name)
}
export const modeIdS = ({commit},value) => {
    commit('modeIdS',value)
}
export const belongmodeNameS = ({commit},value) => {
    commit('belongmodeNameS',value)
}
export const setRuleLength = ({commit},value) => {
    commit('setRuleLength',value)
}
export const setRuleIdS = ({commit},value) => {
    commit('setRuleIdS',value)
}
export const resetList = ({commit},value) => {
    commit('resetList',value)
}
//设置 token
export const setToken = ({commit},value) => {
    if(value) {
        commit('setToken',value);
    } else {
        sessionStorage.removeItem('token');
    }
}

