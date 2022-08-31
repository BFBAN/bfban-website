import http from 'axios';
import Conf from './conf';
export default class Http extends Conf {
    GET = 'get';
    POST = 'post';
    PUT = 'put';
    //..

    /**
     * TODO 未写拦截，有空完成
     */
     HTTP = http.create({
      // baseURL: process.env.BASE_API,
      timeout: 600000,
      withCredentials: true,
      headers: {
          // 'Content-type': 'application/json',
      },
      validateStatus(status) {
          return status < 500;
      }
    })

    constructor() {
        super();
        super.initConf();

        this.HTTP.interceptors.request.use(config => {
            return config
        }, error=> {
            // 对请求错误做些什么
            return Promise.reject(error)
        })
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
        let result = await this.HTTP({
            url: url,
            Origin: "",
            headers: Object.assign({}, requestData.headers),
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

    /**
     * put 请求
     * @returns {Promise<AxiosResponse<any>>}
     */
    async put(url = '', data = {data: {}, params: {}}) {
        const _url = this.getUrl() + url;

        this.HTTP.headers = {...this.HTTP.headers, ...data.headers};

        let result = await this.HTTP({
            url:_url,
            method: this.PUT,
            headers: data.headers,
            params: data.params,
            data: data.data,
        })
        // let result = await this.request(_url, {
        //     method: this.PUT,
        //     headers: data.headers,
        //     params: data.params,
        //     data: data.data,
        // });

        return result;
    }
}

