/**
 * Conf file
 */

export default class Conf {
  constructor() {
    return {
      // 请求地址 [生产]
      'requestDev': 'https://bfban.gametools.network/api/',

      // 请求地址 [测试]
      'requestDeBug': 'http://127.0.0.1:4002/api/',

      // 七牛
      'qiniuUrl': '',
    }
  }
}
