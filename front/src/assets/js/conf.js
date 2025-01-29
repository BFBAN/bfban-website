/**
 * Conf file
 */

export default class Conf {
    CONF = {
        // 请求地址 [开发]
        "requestDevelopmentName": "",

        // 请求地址 [生产]
        "requestProductionName": "",

        "requestTestName": "",

        // 配置列表
        "child": {}
    };


    // 初始配置
    async initConf() {
        let confs = await import('/public/config/requestConf.json');
        this.CONF = Object.assign(
            this.CONF,
            {...confs}
        );
        return this.CONF;
    }

    get getConf() {
        return this.CONF;
    }
}
