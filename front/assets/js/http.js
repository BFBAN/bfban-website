import http, {AxiosRequestConfig} from 'axios';
import Conf from './conf';

export default class Http {
  GET = 'get';
  POST = 'post';
  //..

  /**
   * TODO 未写拦截，有空完成
   */

  /**
   * 请求核心
   * @param url
   * @param requestData
   * @returns {Promise<AxiosResponse<any>>}
   */
  async request (url = '', requestData = {method: this.POST, data: {}, params: {}}) {
    let result = await http({
      url: url,
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
    const _url = Conf.requestDev + url;

    let result = await this.request(_url, {
      method: this.POST,
      data,
    });

    return result;
  }

  /**
   * get 请求
   * @returns {Promise<AxiosResponse<any>>}
   */
  async get (url = '', data = {data: {}, params: {}}) {
    const _url = Conf.requestDev + url;

    let result = await this.request(_url, {
      method: this.GET,
      params: data.params,
      data: data.data,
    });

    return result;
  }
}

