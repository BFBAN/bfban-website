import Vue from 'vue'
import VueI18n from 'vue-i18n'
import { detectLanguage } from './mixins/common'

import en from 'view-design/dist/locale/en-US';
import zh from 'view-design/dist/locale/zh-CN';
import ja from 'view-design/dist/locale/ja-JP';
import tr from 'view-design/dist/locale/tr-TR';
import ru from 'view-design/dist/locale/ru-RU';

import en_bfban from './lang/en.json'
import zh_bfban from './lang/zh.json'
import ja_bfban from './lang/ja.json'
import tr_bfban from './lang/tr.json'
import ru_bfban from './lang/ru.json'

const _messages = {
  'en-US': Object.assign(en, en_bfban),
  'zh-CN': Object.assign(zh, zh_bfban),
  'ja-JP': Object.assign(ja, ja_bfban),
  'tr-TR': Object.assign(tr, tr_bfban),
  'ru-RU': Object.assign(ru, ru_bfban),
};

Vue.use(VueI18n)
Vue.locale = () => {};

function loadLocaleMessages () {
  const locales = require.context('./lang', true, /[A-Za-z0-9-_,\s]+\.json$/i)
  const messages = {}

  console.log(locales.keys())

  locales.keys().forEach(key => {
    const matched = key.match(/([A-Za-z0-9-_]+)\./i)
    if (matched && matched.length > 1) {
      const locale = matched[1]

      messages[locale] = Object.assign(locales(key), _messages[key])
    }
  })

  return messages;
}

export default new VueI18n({
  locale: detectLanguage(navigator.language) || 'zh-CN',

  fallbackLocale: process.env.VUE_APP_I18N_FALLBACK_LOCALE || 'zh-CN',

  messages: _messages, // loadLocaleMessages(),

  silentTranslationWarn: true,
})
