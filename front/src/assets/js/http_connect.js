/**
 * 校验网络状态
 */

import Http from './http'
import Status from './status';
export default class Http_Connect {
    HTTP = new Http();
    STATUS = new Status();

    constructor () {
    }

    /**
     * 资源地址状态检查
     * {u String} url
     */
    async url (u = '', callback) {
        this.HTTP.request(u,{
            method: 'get',
        }).then(res => {
            if (res.status < 500)
                return callback( this.STATUS.success() );

            callback(this.STATUS.error({ msg: res.toString() }));
        })
        .catch((err) => {
            return callback(  this.STATUS.error({ msg: err.toString() }) );
        });
    }
}