import http from 'axios';
import Conf from './conf';

export default class Http extends Conf {
    GET = 'get';
    POST = 'post';
    //..

    /**
     * TODO 未写拦截，有空完成
     */
    HTTP = http.create({
        // baseURL: process.env.BASE_API,
        timeout: 600000,
        withCredentials: true,

        headers: {
            'Content-type': 'application/json',
        },
        validateStatus(status) {
            return status < 500;
        }
    });

    constructor() {
        super();
        super.initConf();
    }

    getUrl() {
        const GETURL = this.CONF.child[this.CONF.requestActionName];
        return `${GETURL.protocol || 'http'}://${GETURL.request}`;
    }

    /**
     * 请求核心
     * @param url
     * @param requestData
     * @returns {Promise<AxiosResponse<any>>}
     */
    async request(url = '', requestData = {method: this.POST, data: {}, params: {}}) {
        console.log(url, requestData.headers);
        let result = await this.HTTP({
            url: url,
            Origin: "",
            headers: Object.assign({}, requestData.headers),
            method: requestData.method,
            data: requestData.data,
            params: requestData.params,
        });

        return result;
    }

    async cors(url, data = {data: {}}) {
        let result = await this.HTTP.cors(url, data);

        return result;
    }

    /**
     * post 请求
     * @param url
     * @param data
     * @returns {Promise<AxiosResponse<any>>}
     */
    async post(url, data = {data: {}, params: {}}) {
        const _url = this.getUrl() + url;

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
        const _url = this.getUrl() + url;

        let result = await this.request(_url, {
            method: this.GET,
            headers: data.headers,
            params: data.params,
            data: data.data,
        });

        return result;
    }
}

