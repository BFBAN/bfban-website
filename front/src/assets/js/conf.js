/**
 * Conf file
 */

export default class Conf {
    CONF = {
        // 请求地址 [开发]
        "requestActionName": "",

        // 请求地址 [生产]
        "requestProductionName": "",

        // 配置列表
        "child": {
        }
    };

    async initConf() {
        let {requestActionName, requestProductionName, child} = await import('/public/conf/requestConf.json');
        this.CONF = Object.assign(this.CONF, {requestActionName}, {requestProductionName}, {child});
        return this.CONF;
    }

    getConf() {
        return this.CONF;
    }
}
