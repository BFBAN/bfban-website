/**
 * 工作流
 */

import Storage from './storage';
import store from "@/store";
import {account_storage, api, http_token, application} from "@/assets/js/index";
import {SET_LANG} from "@/store/mutation-types";

export default class WorkflowStorage extends Storage {
    NAME = 'user.workflow';
    CONFIG = '.setting';
    DATA = '.data';
    CASEMETADATA = '.data.meta'
    ARCHIVEDDATA = '.data.archived'

    constructor() {
        super();
        this.getLocalData();
        this.getLocalConfig();
    }

    /**
     * 获取本地workflow数据
     */
    getLocalData() {
        store.state.$desktop.workflow.data = this.getConfiguration('0', this.DATA);
    }

    /**
     * 获取本地workflow配置数据
     */
    getLocalConfig() {
        store.state.$desktop.workflow.config = this.getConfiguration('0', this.CONFIG);
    }

    /**
     * 迁移案件状态
     * @param id
     * @param newStats
     */
    onTransfer(id, newStats) {

    }

    /**
     * @param key
     * @param value
     * @param type
     * @constructor
     */
    updateConfiguration(key, value, type = this.DATA) {
        let data = super.local.get(this.NAME + type);

        if (data.code < 0) {
            data = {data: {value: {}}}
        }

        data.data.value[key] = value;
        super.local.set(this.NAME + type, data.data.value)
    }

    /**
     * 取得attr的值
     * @param key
     * @param type
     * @returns {*|boolean}
     */
    getConfiguration(key, type = this.DATA) {
        let data = super.local.get(this.NAME + type);

        if (data.code < 0) return false;
        return key in data.data.value ? data.data.value[key] : false;
    }

    /**
     * 删除数据
     */
    delete(key, type = this.DATA) {
        super.local.rem(this.NAME + type);
    }
}
