import Vue from 'vue'
import VueI18n from 'vue-i18n'
import storage from "../src/assets/js/storage"
import lang from "../public/config/languages.json"
import store from './store'

import ar_view_design from 'view-design/dist/locale/ar-EG';
import de_view_design from 'view-design/dist/locale/de-DE';
import en_view_design from 'view-design/dist/locale/en-US';
import es_view_design from 'view-design/dist/locale/es-ES';
import fr_view_design from 'view-design/dist/locale/fr-FR';
import it_view_design from 'view-design/dist/locale/it-IT';
import ja_view_design from 'view-design/dist/locale/ja-JP';
import ko_view_design from 'view-design/dist/locale/ko-KR';
import tr_view_design from 'view-design/dist/locale/tr-TR';
import ru_view_design from 'view-design/dist/locale/ru-RU';
import zh_view_design from 'view-design/dist/locale/zh-CN';
import zh_tw_view_design from 'view-design/dist/locale/zh-TW';

import ar_local from './lang/ar.json'
import de_local from './lang/de_DE.json'
import en_local from './lang/en.json' // 英语
import es_local from './lang/es.json'
import fr_local from './lang/fr.json'
import it_local from './lang/it.json'
import ja_local from './lang/jp.json' // 日语
import ko_local from './lang/ko.json' // 韩语
import tr_local from './lang/tr.json' // 土耳其
import ru_local from './lang/ru.json' // 俄语
import zh_cn_local from './lang/zh_CN.json' // 中文
import zh_tw_local from './lang/zh_TW.json' // 中文
import zh_cat_local from './lang/zh_Cat.json' // 简体喵文

Vue.use(VueI18n)
Vue.locale = () => {
};

let i18n = new VueI18n({
    locale: new storage().get('language')?.data?.value ?? navigator.language,
    fallbackLocale: lang.default,
    formatFallbackMessages: true,
    silentTranslationWarn: true,
    messages: {
        'ar-EG': Object.assign(ar_view_design, ar_local),
        'de-DE': Object.assign(de_view_design, de_local),
        'en-US': Object.assign(en_view_design, en_local), // 英语
        'es-ES': Object.assign(es_view_design, es_local),
        'fr-FR': Object.assign(fr_view_design, fr_local),
        'it-IT': Object.assign(it_view_design, it_local),
        'ja-JP': Object.assign(ja_view_design, ja_local), // 日语
        'ko-KR': Object.assign(ko_view_design, ko_local), // 韩语
        'ru-RU': Object.assign(ru_view_design, ru_local), // 俄语
        'tr-TR': Object.assign(tr_view_design, tr_local), // 土耳其
        'zh-CN': Object.assign(zh_view_design, zh_cn_local), // 中文
        'zh-TW': Object.assign(zh_tw_view_design, zh_tw_local), // 中文
        'zh-Cat': Object.assign(zh_cat_local) // 简体喵文
    },
});

// 我们已經加載的语言
const loadedLanguages = []

function setI18nLanguage(lang) {
    i18n.locale = lang
    store.commit('res_lang', lang);
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
