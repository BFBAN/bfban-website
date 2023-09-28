/**
 * extends http
 * 用于需要token请求
 */

import http from './http';
import store from '@/store'
import {account_storage} from "@/assets/js/index";
import router from "@/router";

export default class http_token extends http {
  THAT;

  constructor(that) {
    super();
    this.THAT = that;

    this.HTTP.interceptors.response.use(response => response, error => {
      const {code = "none", message = ""} = error.response.data;

      // 无效令牌
      let userError = ["user.invalid", "user.tokenExpired", "user.tokenClientException"]
      if (code.constructor(userError)) {
        account_storage.clearAll()
        store.dispatch('signout').then(() => {
          router.push('/signin');
        });
      }

      return Promise.reject(error)
    });
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
    if (store.state.user && store.state.user.token) {
      const token = store.state.user.token;
      if (token != null || token != '') {
        const headers = data.headers || {}
        data = Object.assign(data, {
          headers: {
            'x-access-token': token,
            ...headers
          }
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

  async delete(url = '', data = {data: {}, params: {}}) {
    this.CONF = await super.initConf();

    return super.delete(url, this.setToken(data));
  }
}
