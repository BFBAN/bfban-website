/**
 * 包装器
 */

import _Conf from './conf';
import _Api from './api';

import _Achievement from './achievement';
import _Storage from './storage';
import _Time from './date';
import _Http from './http';
import _Http_token from './http_token';
import _Http_Connect from './http_connect';
import _Util from './util';
import _Notification from "./notification";
import _Regular from './regular';
import _Print from './print';
import _Upload from './upload';
import _AccountStorage from './storage_account';
import _PlayerStorage from './storage_player';
import _Mail from "@/assets/js/mail";
import _Voice from "@/assets/js/voice";
import _appMessage from "@/assets/js/message";
import _Moss from "@/assets/js/moss";
import store from "@/store";

export const api = new _Api();
export const achievement = new _Achievement();
export const http = new _Http();
export const http_token = new _Http_token();
export const http_connect = new _Http_Connect();
export const time = new _Time();
export const conf = new _Conf();
export const storage = new _Storage();
export const util = new _Util();
export const notification = new _Notification();
export const regular = new _Regular();
export const print = new _Print();
export const upload = new _Upload();
export const account_storage = new _AccountStorage();
export const player_storage = new _PlayerStorage();
export const mail = new _Mail();
export const voice = new _Voice();
export const message = new _appMessage();
export const moss = new _Moss();

export default {
    conf, api, achievement, storage, time,
    http, http_token, http_connect,
    util, notification, regular, print,
    upload, account_storage, player_storage, mail,
    voice, message, moss
};
