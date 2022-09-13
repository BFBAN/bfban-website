import _ from "lodash";

export default class Util {
    cheatMethodsGlossary;
    cheaterStatus;
    gameName;

    constructor() {
        this.initUtil();
    }

    /**
     * TODO 准备弃用这类方式
     * 初始Util
     * @returns {Promise<Util>}
     */
    async initUtil() {
        const list = {
            cheatMethodsGlossary : await import('/public/conf/cheatMethodsGlossary.json'),
            cheaterStatus : await import('/public/conf/cheaterStatus.json'),
            action: await import('/public/conf/action.json'),
            gameName : await import('/public/conf/gameName.json')
        }
        this.cheaterStatus = list.cheaterStatus.child;
        this.gameName = list.gameName.child;
        this.action = list.action.child;
        this.cheatMethodsGlossary = list.cheatMethodsGlossary.child;
        return this;
    }
}