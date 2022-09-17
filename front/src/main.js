import 'view-design/dist/styles/iview.css'
import './registerServiceWorker'
import config from "../package.json"

import Vue from 'vue'
import App from './App.vue'
import i18n from './i18n'
import less from 'less'
import router from './router'
import store from './store'
import ViewUI from 'view-design'
import VueQuillEditor from 'vue-quill-editor'
import ECharts from 'vue-echarts'
import VueMeta from 'vue-meta'
import Cookies from 'js-cookie'

// echarts
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { BarChart } from 'echarts/charts'
import { GridComponent, TooltipComponent } from 'echarts/components'

use([CanvasRenderer, BarChart, GridComponent, TooltipComponent]);
Vue.component('v-chart', ECharts);

// quill css
import 'quill/dist/quill.core.css'
import 'quill/dist/quill.snow.css'

// js
import './registerServiceWorker'

Vue.use(VueMeta)
Vue.use(less)
Vue.use(ViewUI, {
  i18n: (key, value) => i18n.t(key,value)
})
Vue.use(VueQuillEditor)

Vue.config.productionTip = false

const cookieUser = Cookies.get('user') && JSON.parse(Cookies.get('user'));
console.log(cookieUser)
if(!cookieUser.token) {
  Cookies.remove('user');
}

const app = new Vue({
  router,
  store,
  i18n,
  metaInfo () {
    return Object.assign({
      titleTemplate: config.name + ' / %s',
      htmlAttrs: {
        lang: this.$i18n.locale,
        amp: true
      },
    }, this.$store.state.metaInfo)
  },
  render: h => h(App)
}).$mount('#app');

export default app;
