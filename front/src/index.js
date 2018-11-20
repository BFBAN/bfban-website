// import Vue from 'vue';
// import VueRouter from 'vue-router';


// import iView from 'iview';
// import 'iview/dist/styles/iview.css';

// import VueQuillEditor from 'vue-quill-editor';
// import 'quill/dist/quill.core.css';
// import 'quill/dist/quill.snow.css';
// import 'quill/dist/quill.bubble.css';

// import FastClick from 'fastclick';

import App from './App.vue';
import router from './routes';

import store from './store';

Vue.use(VueQuillEditor);
// Vue.use(iView);

// Vue.use(VueRouter);

FastClick.attach(document.body);

const locale = 'cn';
const messages = {
  cn: {
    header: {
      index: '首页',
      about: '关于',
      cheaters: '外挂公示',
      report: '举报作弊',
      signin: '登录',
      signup: '注册',
      signout: '注销',
      daily: 'ban日报',
      dashboard: '管理后台',
    },
    footer: {
      author: '由 mygoare 开发',
    },
    list: {
      title: '外挂公示',
      filters: {
        game: {
          bf1: '战地1',
          bfv: '战地v',
        },
        status: {
          all: '全部',
        },
        refresh: '刷新'
      }
    }
  },
  uk: {
    header: {
      index: 'Home',
      about: 'About',
      cheaters: 'Cheaters',
      report: 'Report',
      signin: 'SignIn',
      signup: 'SignUp',
      signout: 'SignOut',
      daily: 'BanDaily',
      dashboard: 'Dashboard',
    },
    footer: {
      author: 'Written by mygoare',
    },
    list: {
      title: 'Cheaters Show',
      filters: {
        game: {
          bf1: 'bf1',
          bfv: 'bfv',
        },
        status: {
          all: 'all',
        },
        refresh: 'refresh'
      }
    }
  }
};

const i18n = new VueI18n({
  locale,
  messages,
});

const root = document.createElement('div');
document.body.appendChild(root);

const app =new Vue({
  router,
  store,
  i18n,
  render: h => h(App),
}).$mount('#app');

export default app;
