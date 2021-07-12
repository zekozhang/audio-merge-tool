import Vue from 'vue'
import Router from 'vue-router'
import Main from '@/views/main'
import Cookies from 'js-cookie'

Vue.use(Router);
Vue.prototype.Cookies = Cookies;
Vue.prototype.basicpathRouter = [];

export const basicpath = [
	{
		path: '/main',
		icon: 'calculator',
		name: 'main',
		meta: {role: 'ROLE_ADMIN'},
		title: 'main',
		component: Main,
		redirect: '/main',
		children: [
			{
				path: '/main',
				icon: 'calculator',
				name: '/main',
				title: '任务中心',
				meta: {
					title: ['音频剪辑合成工具'],
					role: 'ROLE_ADMIN',
					requireAuth: true
				},
				component: resolve=> {require(['@/views/home'], resolve);}
			}
		]
	}
];

const normal = {
  path: '/',
  redirect: '/login'
}

const freeurl = [
  {
    path: '/login',
    name: 'login',
    component: resolve=> {require(['@/views/login'], resolve);},
  },
  {
    path: '/main',
    name: 'root',
    component: Main,
    children: [{
      path: '/main/merge',
      icon: '',
      name: 'merge',
	  title: 'merge',
		meta: {
			title: ['音频剪辑合成工具'],
			role: 'ROLE_ADMIN',
			requireAuth: true
		},
      component: resolve=> {require(['@/views/home'], resolve);},
    }]
}];

const basicpathCopy = [].concat([]);

export const rules = basicpathCopy.concat(freeurl);

export default new Router({
  routes: rules.concat([normal])
})
