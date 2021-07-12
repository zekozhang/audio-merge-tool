//test
export const getCreateName = state => {
    return state.createName;
}
export const addRuleLength = state => {
    return state.ruleLength++;
}
//token
export const getToken = state => {
    return state.token;
}
//获取权限
export const permissionTask = state => {
    return JSON.parse(state.userInfo).permissions;
}
