// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router'
import $ from 'jquery'
import axios from 'axios'
import Vuex from 'vuex'
import iView from 'iview'
import store from './vuex/store'
import 'iview/dist/styles/iview.css'
import ElementUI from 'element-ui'; // 2.1引入结构
import 'element-ui/lib/theme-chalk/index.css'; // 2.2引入样式

Vue.use(iView);
Vue.use(ElementUI); // 3.安装

Vue.config.productionTip = false;
Vue.prototype.breadList = {};
Vue.prototype.main_useId = null,
Vue.prototype.main_roleName = null;

Vue.prototype.getCookie = function(cookieName) {
  var strCookie = document.cookie;
  var arrCookie = strCookie.split("; ");
  for(var i = 0; i < arrCookie.length; i++){
      var arr = arrCookie[i].split("=");
      if(cookieName == arr[0]){
          return arr[1];
      }
  }
  return "";
}

router.beforeEach((to, from, next) => {
  Vue.prototype.breadList = to;
  if (to.meta.requireAuth) {
    if(store.state.token) {
      next();
    } else {
      next({
        path: '/login'
      })
    }
  } else {
    next();
  }


  // if(to.name == 'login') {
  //   next();
  // } else if(to.meta.role == Vue.prototype.getCookie('role')) {//判断当前的角色和页面对不对应
  //   next();
  // } else {
  //   next({
  //     path: '/login'
  //   });
  // }
})

$.ajaxTransport("+binary", function(options, originalOptions, jqXHR){
	// check for conditions and support for blob / arraybuffer response type
	if (window.FormData && ((options.dataType && (options.dataType == 'binary')) || (options.data && ((window.ArrayBuffer && options.data instanceof ArrayBuffer) || (window.Blob && options.data instanceof Blob)))))
	{
		return {
			// create new XMLHttpRequest
			send: function(headers, callback){
				// setup all variables
				var xhr = new XMLHttpRequest(),
					url = options.url,
					type = options.type,
					async = options.async || true,
					// blob or arraybuffer. Default is blob
					dataType = options.responseType || "blob",
					data = options.data || null,
					username = options.username || null,
					password = options.password || null;

				xhr.addEventListener('load', function(){
					var data = {};
					data[options.dataType] = xhr.response;
					// make callback and send data
					callback(xhr.status, xhr.statusText, data, xhr.getAllResponseHeaders());
				});

				xhr.open(type, url, async, username, password);

				// setup custom headers
				for (var i in headers ) {
					xhr.setRequestHeader(i, headers[i] );
				}

				xhr.responseType = dataType;
				xhr.send(data);
			},
			abort: function(){
				jqXHR.abort();
			}
		};
	}
});

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  store,
  components: { App },
  template: '<App/>'
})
