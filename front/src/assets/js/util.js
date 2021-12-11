import _ from "lodash";

export default class Util {
    cheatMethodsGlossary;
    cheaterStatus;
    gameName;

    constructor() {
        this.initUtil();
    }

    /**
     * 初始Util
     * @returns {Promise<Util>}
     */
    async initUtil() {
        const list = {
            cheatMethodsGlossary : await import('/public/conf/cheatMethodsGlossary.json'),
            cheaterStatus : await import('/public/conf/cheaterStatus.json'),
            gameName : await import('/public/conf/gameName.json')
        }
        this.cheaterStatus = list.cheaterStatus.child;
        this.gameName = list.gameName.child;
        this.cheatMethodsGlossary = list.cheatMethodsGlossary.child;
        return this;
    }

    convertCheatMethods(str) {
        const s = str || [];
        const tmpArr = [];
        if (this.cheatMethodsGlossary == null) return '';
        _.each(s, (val) => {
            _.each(this.cheatMethodsGlossary, (v, i) => {
                // v.values array
                // values是数组类型，内部的值是先前兼容v1版本之前举报类型
                if (v.values.indexOf(val) >= 0) {
                    tmpArr.push(this.$i18n.t("cheatMethods." + v.value + ".title"));
                }
            });
        });
        return tmpArr.sort().reverse().join(' ');
    }

    getCheaterStatusLabel(value) {
        if (this.cheaterStatus == null || !value) return '';
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
    getGameLabel(value) {
        if (this.gameName == null) return '';
        const o = _.find(this.gameName, (v, k) => v.value == value);
        return o ? this.$i18n.t("list.filters.game." + o.value) : '';
    }
}