import Vue from 'vue'
import VueI18n from 'vue-i18n'
import { detectLanguage } from './mixins/common'
import { storage } from "../src/assets/js"
import lang from "../public/conf/languages.json"

import en from 'view-design/dist/locale/en-US';
import zh from 'view-design/dist/locale/zh-CN';
// import ja from 'view-design/dist/locale/ja-JP';
// import tr from 'view-design/dist/locale/tr-TR';
// import ru from 'view-design/dist/locale/ru-RU';

import en_bfban from './lang/en.json'
import zh_bfban from './lang/zh.json'
// import ja_bfban from './lang/ja.json'
// import tr_bfban from './lang/tr.json'
// import ru_bfban from './lang/ru.json'

Vue.use(VueI18n)
Vue.locale = () => {};

const langCucc = storage.get('language')?.data?.value ?? navigator.language;
const i18n = new VueI18n({
  locale: langCucc,
  fallbackLocale: lang.default,
  messages:{
    'en-US': Object.assign(en, en_bfban),
    // 'ja-JP': Object.assign(ja, ja_bfban),
    // 'tr-TR': Object.assign(tr, tr_bfban),
    // 'ru-RU': Object.assign(ru, ru_bfban),
    'zh-CN': Object.assign(zh, zh_bfban),
  },
  silentTranslationWarn: true,
});

export default i18n;
