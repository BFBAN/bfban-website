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

  setToken (data) {
    const token = this.THAT.$store.state.user.token;
    if (token) {
      data = Object.assign(data, {
        headers: {
          'x-access-token': token
        }
      })
    }

    return data;
  }

  async post(url, data = {data: {}}) {
    return super.post(url, this.setToken(data));
  }

  async get(url = '', data = {data: {}, params: {}}) {
    return super.get(url, this.setToken(data));
  }
}
