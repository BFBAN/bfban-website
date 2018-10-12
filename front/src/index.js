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
import routes from './routes';


Vue.use(VueQuillEditor);
Vue.use(iView);

Vue.use(VueRouter);

const RouterConfig = {
  routes,
};
const router = new VueRouter(RouterConfig);

FastClick.attach(document.body);

const root = document.createElement('div');
document.body.appendChild(root);

new Vue({
  router,
  render: h => h(App),
}).$mount(root);
