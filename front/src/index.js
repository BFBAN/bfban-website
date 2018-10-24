import Vue from 'vue';
import VueRouter from 'vue-router';


import iView from 'iview';
import 'iview/dist/styles/iview.css';

import VueQuillEditor from 'vue-quill-editor';
import 'quill/dist/quill.core.css';
import 'quill/dist/quill.snow.css';
import 'quill/dist/quill.bubble.css';

import FastClick from 'fastclick';

import App from './App.vue';
import router from './routes';

import store from './store';

Vue.use(VueQuillEditor);
Vue.use(iView);

Vue.use(VueRouter);


FastClick.attach(document.body);

const root = document.createElement('div');
document.body.appendChild(root);

new Vue({
  router,
  store,
  render: h => h(App),
}).$mount(root);
