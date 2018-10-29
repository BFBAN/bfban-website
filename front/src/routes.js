import VueRouter from 'vue-router';
import Home from './Home.vue';
import Report from './Report.vue';
import Misc from './Misc.vue';
import List from './List.vue';
import Detail from './Detail.vue';
import Signin from './Signin.vue';
import Signup from './Signup.vue';

import store from './store';


const routes = [
  {
    name: 'home',
    path: '/',
    component: Home,
  },
  // { name: 'about', path: '/about', component: About },
  {
    name: 'report',
    path: '/report',
    component: Report,
    beforeEnter(to, from, next) {
      if (store.state.user) {
        next();
      } else {
        next({ path: '/signin', query: { rurl: to.fullPath } }); // 未登录则跳转到登陆界面，query:{ Rurl: to.fullPath}表示把当前路由信息传递过去方便登录后跳转回来
      }
    },
  },
  { name: 'misc', path: '/misc', component: Misc },

  { name: 'cheaters', path: '/cheaters', component: List },
  { name: 'cheater', path: '/cheaters/:uid', component: Detail },

  { name: 'signin', path: '/signin', component: Signin },
  { name: 'signup', path: '/signup', component: Signup },

  // otherwise redirect to home
  { path: '*', redirect: '/' },

];

const RouterConfig = {
  routes,
};
const router = new VueRouter(RouterConfig);

router.beforeEach((to, from, next) => {
  store.commit('syncLoginState');

  next();
});

export default router;
