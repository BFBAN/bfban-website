import 'view-design/dist/styles/iview.css'

import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import i18n from './i18n'
import less from 'less'
import ViewUI from 'view-design';
import VueQuillEditor from 'vue-quill-editor'

// css
import './theme/bfban_theme.less'
// import './theme/bfban_deep.less'

// quill css
import 'quill/dist/quill.core.css'
import 'quill/dist/quill.snow.css'
import 'quill/dist/quill.bubble.css'

// js
import './registerServiceWorker'
import './plugins/iview.js'

Vue.use(less)
Vue.use(ViewUI);
Vue.use(VueQuillEditor, /* { default global options } */)

Vue.config.productionTip = false

const app = new Vue({
  router,
  store,
  i18n,
  render: h => h(App)
}).$mount('#app')

export default app;
