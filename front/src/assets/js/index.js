/**
 * 包装器
 */

import _Conf from './conf';
import _Api from './api';

// import Storage from './storage';
// import Date from './date';
import _Http from './http';
import _Http_token from './http_token'

export const api = new _Api();
export const http = new _Http();
export const http_token = new _Http_token();
export const conf = new _Conf();

export default {conf, api, Storage, Date, http, http_token};
