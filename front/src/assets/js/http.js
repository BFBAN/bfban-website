import http, {AxiosRequestConfig} from 'axios';
import Conf from './conf';

export default class Http {
  GET = 'get';
  POST = 'post';
  //..

  /**
   * TODO 未写拦截，有空完成
   */

  CONF = new Conf();
  // WWWURL = process.env.NODE_ENV === 'production' ? this.CONF.requestDev : this.CONF.requestDeBug
  WWWURL = this.CONF.requestDeBug

  HTTP = http.create({
    // baseURL: process.env.BASE_API,
    timeout: 9000,
    withCredentials: false,
    headers: {
      'Content-Type': 'application/json;charset=utf-8',
      'Access-Control-Allow-Origin': '*'
    }
  })



  /**
   * 请求核心
   * @param url
   * @param requestData
   * @returns {Promise<AxiosResponse<any>>}
   */
  async request (url = '', requestData = {method: this.POST, data: {}, params: {}}) {
    let result = await this.HTTP({
      url: url,
      headers: Object.assign({}, requestData.headers),
      method: requestData.method,
      data: requestData.data,
      params: requestData.params,
    });

    return result;
  }

  /**
   * post 请求
   * @param url
   * @param data
   * @returns {Promise<AxiosResponse<any>>}
   */
  async post (url, data = {data: {}}) {
    const _url =  this.WWWURL + url;

    let result = await this.request(_url, {
      method: this.POST,
      headers: data.headers,
      data: data.data,
    });

    return result;
  }

  /**
   * get 请求
   * @returns {Promise<AxiosResponse<any>>}
   */
  async get (url = '', data = {data: {}, params: {}}) {
    const _url = this.WWWURL + url;

    let result = await this.request(_url, {
      method: this.GET,
      params: data.params,
      data: data.data,
    });

    return result;
  }
}

