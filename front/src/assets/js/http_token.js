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

  setToken (data = {}) {
    if (this.THAT.$store && this.THAT.$store.user && this.THAT.$store.user.token) {
      const token = this.THAT.$store.state.user.token;
      if (token != null || token != '') {
        data = Object.assign(data, {
          headers: {
            'x-access-token': token
          }
        })
      }
    }
    return data;
  }

  async post(url, data = {data: {}}) {
    this.CONF = await super.initConf();

    return super.post(url, this.setToken(data));
  }

  async get(url = '', data = {data: {}, params: {}}) {
    this.CONF = await super.initConf();

    return super.get(url, this.setToken(data));
  }
}
