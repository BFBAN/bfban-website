/**
 * Conf file
 */

export default class Conf {
  CONF = {
    // 请求地址 [生产]
    'requestDev': '',

    // 请求地址 [测试]
    'requestDeBug': '',

    // 七牛
    'qiniuUrl': '',

    // 默认加载参数，如果上层配置，取上层字段
    'requestDefault': 'requestDev'
  };

  async initConf () {
    let {requestDev, requestDeBug, requestDefault} = await import('/public/conf/requestConf.json');
    this.CONF = Object.assign(this.CONF, {requestDev}, {requestDeBug} , {requestDefault});
    return this.CONF;
  }

  getConf () {
    return this.CONF;
  }
}
