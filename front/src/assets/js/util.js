import _ from "lodash";
import {detectLanguage} from "../../mixins/common";

export default class Util {
    cheatMethodsGlossary;
    cheaterStatus;
    gameName;

    UTIL_CONF = {
        'cheatMethodsGlossary': '/src/assets/cheatMethodsGlossary.json',
        'cheaterStatus': '/src/assets/cheaterStatus.json',
        'gameName': '/src/assets/gameName.json'
    };

    constructor() {
        this.initUtil();
    }

    async loadFile (url) {
        return await import(url);
    }

    async initUtil() {
        const list = {
            cheatMethodsGlossary : await import('/src/assets/cheatMethodsGlossary.json'),
            cheaterStatus : await import('/src/assets/cheaterStatus.json'),
            gameName : await import('/src/assets/gameName.json')
        }
        this.cheaterStatus = list.cheaterStatus.child;
        this.gameName = list.gameName.child;
        this.cheatMethodsGlossary = list.cheatMethodsGlossary.child;
        return this;
    }

    convertCheatMethods(str, locale) {
        const s = str || '';
        const tmpArr = [];
        if (this.cheatMethodsGlossary == null) return '';
        _.each(s.split(','), (val) => {
            _.each(this.cheatMethodsGlossary, (v, i) => {
                if (v.value === val) {
                    tmpArr.push(this.$i18n.t("cheatMethods." + v.value + ".title"));
                }
            });
        });
        return tmpArr.sort().reverse().join(' ');
    }

    getCheaterStatusLabel(value, locale = detectLanguage(navigator.language)) {
        if (this.cheaterStatus == null) return '';
        const o = _.find(this.cheaterStatus, (v, k) => {
            return typeof value == 'string' ? v.values.indexOf(value) >= 0 : value == v.value;
        });
        return o.value ? this.$i18n.t("basic.status[" + o.value + "]") : '';
    }

    /**
     * TODO 直接import导入，考虑丢弃此方法
     * @param value
     * @param locale
     * @returns {*|string}
     */
    getGameLabel(value, locale = detectLanguage(navigator.language)) {
        const o = _.find(this.gameName, (v, k) => v.value == value);
        return o ? o[locale] : '';
    }
}