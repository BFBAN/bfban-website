// import Vue from 'vue';
// import VueRouter from 'vue-router';


// import iView from 'iview';
import './theme/2020-happy-new-year.less';

// import VueQuillEditor from 'vue-quill-editor';
// import 'quill/dist/quill.core.css';
// import 'quill/dist/quill.snow.css';
// import 'quill/dist/quill.bubble.css';

// import FastClick from 'fastclick';

import App from '@/views/App.vue';
import cn from '@/lang/cn';
import uk from '@/lang/uk';
import jp from '@/lang/jp';

import router from '@/router';
import store from '@/store';

Vue.use(VueQuillEditor);
// Vue.use(iView);

// Vue.use(VueRouter);

FastClick.attach(document.body);


Vue.locale = () => {};
const locale = 'cn';
const messages = {
  cn: Object.assign(cn, iview.langs['zh-CN']),
  uk: Object.assign(uk, iview.langs['en-US']),
  jp: Object.assign(jp, iview.langs['ja-JP']),
};

const i18n = new VueI18n({
  locale,
  messages,
});

const app = new Vue({
  router,
  store,
  i18n,
  render: h => h(App),
}).$mount('#app');

export default app;
