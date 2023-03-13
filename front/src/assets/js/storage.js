/**
 * 简单的储存
 */

import time from "./date";

export default class Storage {
    THAT = this;
    STORAGENAME = `bfban.${process.env.NODE_ENV}:`;
    DATE = new time();

    constructor(data = {name}) {
        if (data.name)
            this.STORAGENAME = data.name;
    }

    session() {
        return {
            /**
             * session 添加
             * @param name
             * @param value
             * @returns {{code: number, data: {time: number, value: *}}}
             */
            set: (name, value) => {
                let data = {value, time: this.DATE.now()};
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
                if (data == null || data == '' || data == undefined) {
                    result = {code: -1}
                }
                return result;
            },
            /**
             * session 删除
             * @param name
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
    local() {
        return {
            set: this.set,
            get: this.get,
            rem: this.rem
        }
    }

    /**
     * 写入
     * @param name
     * @param value
     * @returns {{code: number, data: {time: number, value: *}}}
     */
    set(name, value) {
        let data = {value, time: this.DATE.now()}
        localStorage.setItem(this.STORAGENAME + name, JSON.stringify(data));

        return {code: 0, data};
    }

    /**
     * 读取
     * @param name
     * @returns {{code: number, data: any}}
     */
    get(name) {
        let data = JSON.parse(
            localStorage.getItem(this.STORAGENAME + name)
        );
        let result = {code: 0, data};
        if (data == null || data == '' || data == undefined) {
            result = {code: -1}
        }
        return result;
    }

    /**
     * 移除
     * @param name
     * @returns {Promise<void>}
     */
    async rem(name) {
        localStorage.removeItem(this.STORAGENAME + name);
    }

    /**
     * get localStorage Keys
     * @returns {*}
     */
    keys() {
        return localStorage;
    }
}
