import axios from 'axios';
// import env from '../../build/env';
// import semver from 'semver';
import packjson from '../../package.json';
import { base,getUserStatus } from '@/api/api'//获取用户的状态： 是否被禁用

let util = {

};

util.getCookie = function(cookieName) {
    var strCookie = document.cookie;
    var arrCookie = strCookie.split("; ");
    for(var i = 0; i < arrCookie.length; i++){
        var arr = arrCookie[i].split("=");
        if(cookieName == arr[0]){
            return arr[1];
        }
    }
    return "";
};

util.getUserStatus = function(userId,cb) {
    getUserStatus({
        userId: userId
    }).then(res=> {
        let data = res.data.data;
        if(data.resultMap.forbidden == 2) {
            alert('当前用户已经被禁用!');
            window.location.href = base;
            // setTimeout(()=> {
            // },1000);
        } else {
            cb();
        }
    });
}


export default util;
