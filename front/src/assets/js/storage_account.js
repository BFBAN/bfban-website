/**
 * 账户数据
 */

import Storage from './storage';
import store from "@/store";
import jsCookie from "js-cookie";

export default class AccountStorage extends Storage {
    ACCOUNTDATA = [{
        type: 'local',
        name: 'viewed'
    },
    {
        type: 'local',
        name: 'captcha'
    },
    {
        type: 'local',
        name: 'language'
    },
    {
        type: 'local',
        name: 'search.history'
    },
    {
        type: 'local',
        name: 'theme'
    },
    {
        type: 'local',
        name: 'user.subscribes'
    },
    {
        type: 'local',
        name: 'user.configuration'
    },
    {
        type: 'session',
        name: 'captcha'
    },
    {
        type: 'session',
        name: 'business'
    }];

    NAME = 'user.configuration';

    constructor() {
        super();

        const conf = super.get(this.NAME);
        if (conf.code >= 0)
            store.commit("syncLoaclConfiguration", conf.data.value)
    }

    /**
     * 清除与账户相关数据
     */
    clearAll () {
        this.ACCOUNTDATA.forEach(i => {
            switch (i.type) {
                case 'session':
                    super.session().rem(i.name);
                    break;
                case 'local':
                    super.local().rem(i.name);
                    break;
            }
        })
    }

    /**
     * 用户一类 本地配置
     * - 是否本地语言同步
     * - 判决提示
     * @param key
     * @param value
     * @constructor
     */
    updateConfiguration (key, value) {
        let data = super.get(this.NAME);

        if (data.code < 0) {
            data = { data: { value: {} } }
        }

        data.data.value[key] = value;
        store.commit("syncLoaclConfiguration", data.data.value)
        super.set(this.NAME , data.data.value)
    }

    /**
     * 取得attr的值
     * @param key
     * @returns {*|boolean}
     */
    getConfiguration (key) {
        let data = super.get(this.NAME);

        if (data.code < 0) return false;
        return key in data.data.value ? data.data.value[key] : false;
    }

    /**
     * 检查权限组
     * @param {Array} currentGroup 当前身份租
     * @param {Array} adminGroup 检查是否包含的身份
     * @returns {boolean}
     */
    checkPrivilegeGroup (currentGroup, adminGroup = ['root', 'admin', 'super', 'dev']) {
        let isBool = false;
        const user = currentGroup;
        if (!user) return false;
        for (const i of adminGroup) {
            for (const j of user?.privilege){
                if (j == i) isBool = true;
            }
        }
        return Boolean(isBool);
    }
}
