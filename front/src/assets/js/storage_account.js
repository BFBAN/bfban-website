/**
 * 账户数据
 */
import {account_storage, api, application, http, http_token} from "@/assets/js/index";


import Storage from './storage';
import store from "@/store";
import router from "@/router"
import {SET_LANG} from "@/store/mutation-types";

export default class AccountStorage extends Storage {
    ACCOUNTDATA = [
        {
            type: 'local',
            name: 'viewed'
        },
        {
            type: 'local',
            name: 'customReply'
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
            name: 'workflow.data'
        },
        {
            type: 'local',
            name: 'workflow.data.archived'
        },
        {
            type: 'local',
            name: 'workflow.data.meta'
        },
        {
            type: 'local',
            name: 'workflow.setting'
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
            type: 'local',
            name: 'user.player'
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

        const conf = super.local.get(this.NAME);
        if (conf.code >= 0)
            store.commit("syncLocalConfiguration", conf.data.value)
    }

    /**
     * 获取用户信息
     * @returns {*}
     */
    getUserInfo() {
        if (new application().isLogin())
            return new Promise((r) => {
                http_token.get(api["user_me"], {}).then(async res => {
                    const d = res.data;
                    if (d.success === 1) {
                        // set userinfo
                        await store.dispatch('setUserInfo', d.data);
                        if (account_storage.getConfiguration('langLocalSync'))
                            await store.dispatch(SET_LANG, d.data.attr.language);
                    }
                    r(res);
                })
            })
    }

    /**
     * 账户退出
     */
    async signout() {
        try {
            const res = await http.post(api["account_signout"], {
                headers: {
                    'x-access-token': store.state.user.token
                }
            }).catch(e => {
                throw e
            });

            return res.data;
        } finally {
            // 清除与账户相关的数据
            this.clearAll();

            store.dispatch('signout').then(() => {
                router.push('/');
            });
        }
    }

    /**
     * 清除与账户相关数据
     */
    clearAll() {
        this.ACCOUNTDATA.forEach(i => {
            switch (i.type) {
                case 'session':
                    super.session.rem(i.name);
                    break;
                case 'local':
                    super.local.rem(i.name);
                    break;
            }
        })
    }

    /**
     * 取出所有key
     */
    keys() {
        let accountKeys = this.ACCOUNTDATA,
            storageName = this.STORAGENAME;

        accountKeys = accountKeys.map(i => `${storageName}${i.name}`)
        return accountKeys;
    }

    /**
     * 取出所有值
     */
    values() {
        let accountData = this.ACCOUNTDATA,
            storageName = this.STORAGENAME;

        accountData = accountData.map(i => {
            switch (i.type) {
                case 'session': {
                    try {
                        let d = super.session.get(`${i.name}`);
                        return {
                            value: storageName + i.name,
                            data: d.data.value
                        };
                    } catch (e) {
                        return {
                            value: storageName + i.name,
                        };
                    }
                }
                default:
                case 'local': {
                    try {
                        let d = super.local.get(`${i.name}`)
                        return {
                            value: storageName + i.name,
                            data: d.data.value
                        };
                    } catch (e) {
                        return {
                            value: storageName + i.name,
                        };
                    }
                }
            }
        })
        return accountData;
    }

    /**
     * 用户一类 本地配置
     * - 是否本地语言同步
     * - 判决提示
     * @param key
     * @param value
     * @constructor
     */
    updateConfiguration(key, value) {
        let data = super.local.get(this.NAME);

        if (data.code < 0) {
            data = {data: {value: {}}}
        }

        data.data.value[key] = value;
        store.commit("syncLocalConfiguration", data.data.value)
        super.local.set(this.NAME, data.data.value)
    }

    /**
     * 取得attr的值
     * @param key
     * @returns {*|boolean}
     */
    getConfiguration(key) {
        let data = super.local.get(this.NAME);

        if (data.code < 0) return false;
        return key in data.data.value ? data.data.value[key] : false;
    }

    /**
     * 检查权限组
     * @param {Array} currentGroup 当前身份租
     * @param {Array} adminGroup 检查是否包含的身份
     * @returns {boolean}
     */
    checkPrivilegeGroup(currentGroup, adminGroup = ['root', 'admin', 'super', 'dev']) {
        let isBool = false;
        const user = currentGroup;
        if (!user) return false;
        for (const i of adminGroup) {
            for (const j of user?.privilege) {
                if (j === i) isBool = true;
            }
        }
        return Boolean(isBool);
    }
}
