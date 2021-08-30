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
import { detectLanguage } from '@/mixins/common';

FastClick.attach(document.body);

Vue.locale = () => {};
const locale = 'zh-CN';
const messages = {
  'zh-CN': Object.assign(cn, iview.langs['zh-CN']),
  'en-US': Object.assign(uk, iview.langs['en-US']),
  'ja-JP': Object.assign(jp, iview.langs['ja-JP']),
};

const i18n = new VueI18n({
  locale: navigator.language ? detectLanguage(navigator.language) : 'zh-CN',
  fallbackLocale: 'zh-CN',
  messages,
});

const app = new Vue({
  router,
  store,
  i18n,
  render: h => h(App),
}).$mount('#app');

export default app;
