import 'view-design/dist/styles/iview.css'

import Vue from 'vue'
import App from './App.vue'
import i18n from './i18n'
import less from 'less'
import router from './router'
import store from './store'
import ViewUI from 'view-design';
import VueQuillEditor from 'vue-quill-editor'
import Vue2Editor from "vue2-editor";
import ECharts from 'vue-echarts'
// import desktop from '../desktop/assets/js/index'

// echarts
import { use } from 'echarts/core'
import {CanvasRenderer} from 'echarts/renderers'
import {BarChart} from 'echarts/charts'
import {GridComponent, TooltipComponent} from 'echarts/components'
use([CanvasRenderer, BarChart, GridComponent, TooltipComponent]);
Vue.component('v-chart', ECharts);

// quill css
import 'quill/dist/quill.core.css'
import 'quill/dist/quill.snow.css'
import 'quill/dist/quill.bubble.css'

// js
import './registerServiceWorker'

Vue.use(less)
Vue.use(ViewUI, {
  i18n: (key, value) => i18n.t(key,value)
});
Vue.use(VueQuillEditor, /* { default global options } */)
Vue.use(Vue2Editor);

Vue.config.productionTip = false

const app = new Vue({
  router,
  store,
  i18n,
  // desktop,
  render: h => h(App)
}).$mount('#app');

export default app;
