import http from 'axios';
import Conf from './conf';

export default class Http extends Conf {
    GET = 'get';
    POST = 'post';
    PUT = 'put';
    DELETE = 'delete';
    //..

    GETURL = {protocol: '', request: ''};
    NODE;

    HTTP = http.create({
        timeout: 600000,
        withCredentials: true,
        headers: {
            // 'Content-type': 'application/json',
        },
        validateStatus(status) {
            return status <= 1000;
        }
    })

    constructor() {
        super();
        super.initConf();

        this.NODE = process.env.NODE_ENV || 'development';
    }

    location = () => {
        return new URL(this.globalUrl());
    }

    // 获取全局地址
    globalUrl() {
        switch (this.NODE) {
            case 'production': // 生产
                super.GETURL = this.CONF.child[this.CONF.requestProductionName];
                break;
            case 'development': // 开发
            default:
                super.GETURL = this.CONF.child[this.CONF.requestDevelopmentName];
                break;
        }
        return `${this.GETURL.protocol || 'http'}://${this.GETURL.host}${this.GETURL.pathname}`;
    }

    // 配置全局协议头
    setGlobalHeader(headers) {
        if (!headers) return;
        this.HTTP.headers = {...this.HTTP.headers, ...headers};
    }

    /**
     * 请求核心
     * @param url
     * @param requestData
     * @returns {Promise<AxiosResponse<any>>}
     */
    async request(url = '', requestData = {method: this.POST, data: {}, params: {}}) {
        let result = await this.HTTP({
            url: url,
            Origin: "",
            headers: {...this.HTTP.headers || {}, ...requestData.headers},
            method: requestData.method,
            data: requestData.data,
            params: requestData.params,
            body: requestData.body
        });

        return result;
    }

    /**
     * post 请求
     * @param url
     * @param data
     * @returns {Promise<AxiosResponse<any>>}
     */
    async post(url, data = {data: {}, params: {}}) {
        const _url = this.globalUrl() + url;

        let result = await this.request(_url, {
            method: this.POST,
            headers: data.headers,
            params: data.params,
            data: data.data,
        });

        return result;
    }

    /**
     * get 请求
     * @returns {Promise<AxiosResponse<any>>}
     */
    async get(url = '', data = {data: {}, params: {}}) {
        const _url = this.globalUrl() + url;

        let result = await this.request(_url, {
            method: this.GET,
            headers: data.headers,
            params: data.params,
            data: data.data,
        });

        return result;
    }

    /**
     * put 请求
     * @returns {Promise<AxiosResponse<any>>}
     */
    async put(url = '', data = {data: {}, params: {}}) {
        const _url = this.globalUrl() + url;

        this.HTTP.headers = {...this.HTTP.headers, ...data.headers};

        let result = await this.HTTP({
            url: _url,
            method: this.PUT,
            headers: data.headers,
            params: data.params,
            data: data.data,
        })

        return result;
    }

    /**
     * delete 请求
     * @returns {Promise<AxiosResponse<any>>}
     */
    async delete(url = '', data = {data: {}, params: {}}) {
        const _url = this.globalUrl() + url;

        this.HTTP.headers = {...this.HTTP.headers, ...data.headers};

        let result = await this.HTTP({
            url: _url,
            method: this.DELETE,
            headers: data.headers,
            params: data.params,
            data: data.data,
        })

        return result;
    }
}
