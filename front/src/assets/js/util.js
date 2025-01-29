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
            cheatMethodsGlossary : await import('/public/config/cheatMethodsGlossary.json'),
            cheaterStatus : await import('/public/config/cheaterStatus.json'),
            action: await import('/public/config/action.json'),
            gameName : await import('/public/config/gameName.json')
        }
        this.cheaterStatus = list.cheaterStatus.child;
        this.gameName = list.gameName.child;
        this.action = list.action.child;
        this.cheatMethodsGlossary = list.cheatMethodsGlossary.child;
        return this;
    }

    queryAction (key) {
        let _key = key;
        if (this.action && this.action.length > 0)
            for (let i = 0; i < this.action.length; i++) {
                if (this.action[i].values.includes(key)) _key = this.action[i].value;
            }
        return _key;
    }

    queryCheaterStatus (key) {
        let _key = key;
        if (this.cheaterStatus.length > 0)
            for (let i = 0; i < this.cheaterStatus.length; i++) {
                if (this.cheaterStatus[i].values.includes(key)) _key = this.cheaterStatus[i].value;
            }
        return _key;
    }

    queryCheatMethodsGlossary (key) {
        let _key = key;
        if (this.cheatMethodsGlossary && this.cheatMethodsGlossary.length > 0)
            for (let i = 0; i < this.cheatMethodsGlossary.length; i++) {
                if (this.cheatMethodsGlossary[i].values.includes(key)) _key = this.cheatMethodsGlossary[i].value;
            }
        return _key;
    }

    onReplacementStringVariable(text, params) {
        Object.keys(params).forEach(i => {
            text = text
                .replace(new RegExp(`{${i}}`, 'g'), params[i]);
        });
        return text;
    }
}
