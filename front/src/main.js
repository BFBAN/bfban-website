import 'view-design/dist/styles/iview.css'

import Vue from 'vue'
import App from './App.vue'
import i18n from './i18n'
import router from './router'
import store from './store'
import Directive from './directive.js';
import Less from 'less'
import ViewUI from 'view-design'
import VueQuillEditor from 'vue-quill-editor'
import ECharts from 'vue-echarts'
import Cookies from 'js-cookie'
import Ads from 'vue-google-adsense'
// echarts
import {use} from 'echarts/core'
import {CanvasRenderer} from 'echarts/renderers'
import {BarChart} from 'echarts/charts'
import {GridComponent, TooltipComponent} from 'echarts/components'
// quill css
import 'quill/dist/quill.core.css'
import 'quill/dist/quill.snow.css'

// pwa js
import './registerServiceWorker'

// vue directive, [https://v2.cn.vuejs.org/v2/guide/custom-directive.html]
Directive(Vue);

use([CanvasRenderer, BarChart, GridComponent, TooltipComponent]);
Vue.component('v-chart', ECharts);

Vue.use(require('vue-script2'))
Vue.use(Ads.Adsense)
Vue.use(Less)
Vue.use(ViewUI, {i18n: (key, value) => i18n.t(key,value)})
Vue.use(VueQuillEditor)

Vue.config.productionTip = false;
Vue.config.devtools = false;

let cookieUser = Cookies.get('user') && JSON.parse(Cookies.get('user'));
cookieUser = cookieUser || {}
if(cookieUser && !cookieUser.token) {
  Cookies.remove('user');
}

const app = new Vue({
  router,
  store,
  i18n,
  metaInfo () {
    let meta = [];
    for (let metaInfoKey in this.$store.state.metaInfo) {
      if (this.$store.state.metaInfo[metaInfoKey] !== "")
        meta.push({name: metaInfoKey, content: this.$store.state.metaInfo[metaInfoKey]})
    }
    return Object.assign({
      titleTemplate: i18n.t('name') + ' / %s',
      htmlAttrs: {
        lang: this.$i18n.locale,
        amp: true
      },
      meta: meta,
    }, this.$store.state.metaInfo)
  },
  render: h => h(App)
}).$mount('#app');

export default app;
