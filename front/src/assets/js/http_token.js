/**
 * extends http
 * 用于需要token请求
 */

import http from './http';

export default class http_token extends http {
  THAT;

  constructor(that) {
    super();
    this.THAT = that;
  }

  call (t) {
    return new http_token(t);
  }

  /**
   * token
   * @param data
   * @returns {{}}
   */
  setToken (data = {}) {
    if (this.THAT.$store.state.user && this.THAT.$store.state.user.token) {
      const token = this.THAT.$store.state.user.token;
      if (token != null || token != '') {
        if (!data.headers) data.headers = {};
        data.headers = Object.assign(data.headers, {
          'x-access-token': token
        })
      }
    }
    return data;
  }

  async post(url = '', data = {data: {}}) {
    this.CONF = await super.initConf();

    return super.post(url, this.setToken(data));
  }

  async get(url = '', data = {data: {}, params: {}}) {
    this.CONF = await super.initConf();

    return super.get(url, this.setToken(data));
  }

  async put(url = '', data = {data: {}, params: {}}) {
    this.CONF = await super.initConf();

    return super.put(url, this.setToken(data));
  }
}
