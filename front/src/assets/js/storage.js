/**
 * 简单的储存
 */

import {time} from "./index";

export default class Storage {
    STORAGENAME = `bfban.${process.env.NODE_ENV}:`;

    constructor(data = {name}) {
        if (data.name)
            this.STORAGENAME = data.name;
    }

    get session() {
        return {
            /**
             * session 添加
             * @param name
             * @param value
             * @returns {{code: number, data: {time: number, value: *}}}
             */
            set: (name, value) => {
                let data = {value, time: time.update().nowTimeStamp};
                sessionStorage.setItem(this.STORAGENAME + name, JSON.stringify(data));
                return {code: 0, data};
            },
            /**
             * session 获取
             * @param name
             * @returns {{code: number, data: any}}
             */
            get: (name) => {
                let data = JSON.parse(
                    sessionStorage.getItem(this.STORAGENAME + name)
                );
                let result = {code: 0, data};
                if (data == null || data === '' || data === undefined) {
                    result = {code: -1}
                }
                return result;
            },
            /**
             * session 删除
             */
            rem: (name) => {
                sessionStorage.removeItem(this.STORAGENAME + name)
            },
            /**
             * get sessionStorage Keys
             * @returns {*}
             */
            keys: () => {
                return sessionStorage.keys()
            }
        }
    }

    /**
     * local
     * @returns {{set: (function(*, *): {code: number, data: {time: number, value: *}}), get: (function(*): {code: number, data: any}), rem: ((function(*): Promise<void>)|*)}}
     */
    get local() {
        return {
            /**
             * session 添加
             * @param name
             * @param value
             * @returns {{code: number, data: {time: number, value: *}}}
             */
            set: (name, value) => {
                let data = {value, time: time.update().nowTimeStamp}
                localStorage.setItem(this.STORAGENAME + name, JSON.stringify(data));

                return {code: 0, data};
            },
            /**
             * session 获取
             * @param name
             * @returns {{code: number, data: any}}
             */
            get: (name) => {
                let data = JSON.parse(
                    localStorage.getItem(this.STORAGENAME + name)
                );
                let result = {code: 0, data};
                if (data == null || data === '' || data === undefined) {
                    result = {code: -1}
                }
                return result;
            },
            /**
             * session 删除
             */
            rem: (name) => {
                localStorage.removeItem(this.STORAGENAME + name);
            },
            /**
             * get sessionStorage Keys
             * @returns {*}
             */
            keys: () => {
                return localStorage.keys()
            }
        }
    }
}
