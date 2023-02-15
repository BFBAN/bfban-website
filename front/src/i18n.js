import Vue from 'vue'
import VueI18n from 'vue-i18n'
import { detectLanguage } from './mixins/common'
import { storage } from "../src/assets/js"
import lang from "../public/conf/languages.json"
import store from './store'

import en from 'view-design/dist/locale/en-US';
import ja from 'view-design/dist/locale/ja-JP';
import kor from 'view-design/dist/locale/ko-KR';
// import tr from 'view-design/dist/locale/tr-TR';
import ru from 'view-design/dist/locale/ru-RU';
import zh from 'view-design/dist/locale/zh-CN';

import en_bfban from './lang/en.json' // 英语
import ja_bfban from './lang/jp.json' // 日语
import kor_bot_bfban from './lang/kor_bot.json' // 韩语 - 机翻
// import tr_bot_bfban from './lang/tr_bot.json' // 土耳其 - 机翻
import ru_bot_bfban from './lang/ru_bot.json' // 俄语 - 机翻
import zh_bfban from './lang/zh.json' // 中文
import zh_miao_bfban from './lang/zh_Miao.json' // 简体喵文

Vue.use(VueI18n)
Vue.locale = () => {};

const i18n = new VueI18n({
  locale: storage.get('language')?.data?.value ?? navigator.language,
  fallbackLocale: lang.default,
  messages:{
    'en-US': Object.assign(en, en_bfban), // 英语
    'ja-JP': Object.assign(ja, ja_bfban), // 日语
    'kor-KOR': Object.assign(kor, kor_bot_bfban), // 韩语
    // 'tr-TR': Object.assign(tr, tr_bot_bfban), // 土耳其
    'ru-RU': Object.assign(ru, ru_bot_bfban), // 俄语
    'zh-CN': Object.assign(zh, zh_bfban), // 中文
    'zh-MIAO': Object.assign(zh_miao_bfban) // 简体喵文
  },
  silentTranslationWarn: true,
});

// 我们已經加載的语言
const loadedLanguages = []
function setI18nLanguage (lang) {
  i18n.locale = lang
  store.commit('res_lang',lang);
  return lang
}

/**
 * 延迟加载
 * @param lang
 * @returns {Promise<*>|Promise<unknown>}
 */
let loadLanguageAsync = (lang) => {
  if (i18n.locale !== lang) {
    if (!loadedLanguages.includes(lang)) {
      /* webpackChunkName: "lang-[request]" */
      return import(`@/lang/${lang}`).then(msgs => {
        i18n.setLocaleMessage(lang, msgs)
        loadedLanguages.push(lang)

        return setI18nLanguage(lang)
      })
    }
    return Promise.resolve(setI18nLanguage(lang))
  }
  return Promise.resolve(lang)
}

i18n.loadLanguageAsync = loadLanguageAsync;
i18n.setI18nLanguage = setI18nLanguage;
export default i18n;
