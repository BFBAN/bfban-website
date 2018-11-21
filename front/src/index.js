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
    home: {
      activity: {
        title: '网站动态',
      },
      howToUse: {
        title: '如何使用本站',
        tools: '小工具',
        qqGroup: 'QQ群',
      },
    },
    about: {
      title: '关于',
    },
    signin: {
      title: '登录',
      form: {
        username: '用户名',
        password: '密码',
        captcha: '验证码',
        getCaptcha: '获得验证码',
        submit: '提交',
        submitHint: '没有账号？去注册',
      },
    },
    signup: {
      title: '注册',
      form: {
        username: '用户名',
        password: '密码',
        originId: '橘子ID',
        qq: 'QQ',
        captcha: '验证码',
        getCaptcha: '获得验证码',
        submit: '提交',
        submitHint: '已有账号？去登录',
      },
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
        refresh: '刷新',
      },
    },
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
    home: {
      activity: {
        title: 'Activity',
      },
      howToUse: {
        title: 'How to use',
        tools: 'Tools',
        qqGroup: 'QQ Group',
      },
    },
    about: {
      title: 'About',
    },
    signin: {
      title: 'Sign In',
      form: {
        username: 'Username',
        password: 'Password',
        captcha: 'Captcha',
        getCaptcha: 'getCaptcha',
        submit: 'Submit',
        submitHint: 'Do not have account? Go Sign up',
      },
    },
    signup: {
      title: 'Sign Up',
      form: {
        username: 'Username',
        password: 'Password',
        originId: 'originId',
        qq: 'QQ',
        captcha: 'Captcha',
        getCaptcha: 'Get Captcha',
        submit: 'Submit',
        submitHint: 'Hava account? Go Sign In',
      },
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
        refresh: 'refresh',
      },
    },
  },
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
