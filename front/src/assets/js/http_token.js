/**
 * extends http
 * 用于需要token请求
 */
import {account_storage} from "@/assets/js/index";

import http from './http';
import store from '@/store'
import router from "@/router";
import app from "@/main"

export default class http_token extends http {
    THAT;

    constructor(that) {
        super();
        const token_that = this;
        this.THAT = that;
        this.HTTP.interceptors.response.use(response => {
            token_that.checkExpiredToken(response)
            return response;
        }, error => {
            token_that.checkExpiredToken(error)
            return Promise.reject(error)
        })
    }

    call(t) {
        return new http_token(t);
    }

    /**
     * token
     * @param data
     * @returns {{}}
     */
    setToken(data = {}) {
        if (store.state.user && store.state.user.token) {
            const token = store.state.user.token;
            if (token != null || token !== '') {
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

    /**
     * 检查令牌是否过期
     * @param context
     */
    checkExpiredToken(context = {}) {
        const {code = "none", message = "", success = 0, error = 0} = context?.response?.data || context?.data || {};

        // 无效令牌
        let userError = ["user.invalid", "user.tokenExpired", "user.tokenClientException"]
        if (userError.includes(code)) {
            account_storage.clearAll()
            store.dispatch('signout').finally(async () => {
                await router.push({
                    path: '/signin',
                    query: {...app.$route.query, byPath: app.$route.name, reason: code}
                });
            });
        }
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
