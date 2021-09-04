import 'view-design/dist/styles/iview.css'

import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import i18n from './i18n'
import less from 'less'
import ViewUI from 'view-design';

// css
import './theme/bfban_theme.less'

// js
import './registerServiceWorker'
import './plugins/iview.js'

Vue.use(less)
Vue.use(ViewUI);

Vue.config.productionTip = false

const app = new Vue({
  router,
  store,
  i18n,
  render: h => h(App)
}).$mount('#app')

export default app;
