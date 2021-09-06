/**
 * 包装器
 */

import _Conf from './conf';
import _Api from './api';

import _Storage from './storage';
import _Time from './date';
import _Http from './http';
import _Http_token from './http_token'

import {common} from '../../mixins/common'

export const api = new _Api();
export const http = new _Http();
export const http_token = new _Http_token();
export const time = new _Time();
export const conf = new _Conf();
export const storage = new _Storage();

export default {conf, api, storage, time, http, http_token, util: common};
