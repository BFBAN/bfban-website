/**
 * 玩家数据
 * 持久
 */

import Storage from './storage';
import {api, http} from "./index";

export default class PlayerStorage extends Storage {
    NAME = 'user.player';
    MAXCOUNT = 50;

    PLAYERDATA = {};

    constructor() {
        super();
        let ary = super.local.get(this.NAME);
        if (ary.code >= 0) {
            for (const aryKey in ary.data.value) {
                this.PLAYERDATA[ ary.data.value[aryKey].id ] = ary.data.value[aryKey];
            }
        }
    }

    /**
     * 更新
     */
    updateStorage () {
        let data = Object.keys(this.PLAYERDATA);
        let count = data.length;
        let executionsNumber = count - this.MAXCOUNT;

        if (count >= this.MAXCOUNT) {
            for (let i = 0; i < executionsNumber; i++) {
                delete data[i];
            }
        }

        super.local.set(this.NAME, this.PLAYERDATA);
    }

    /**
     * 插入
     * @param key
     * @param val
     */
    push (key, val) {
        this.PLAYERDATA[key] = val;
        this.updateStorage();
    }

    /**
     * 查询
     * @param key
     * @returns {Promise<{}|*>}
     */
    async query (key) {
        if (this.PLAYERDATA[key]) {
            return this.PLAYERDATA[key];
        }
        return await this.getCheatersInfo(key);
    }

    /**
     * 强制更新
     */
    async onForcedUpdate () {
        if (this.PLAYERDATA) {
            for (const argumentsKey in this.PLAYERDATA) {
                if (this.PLAYERDATA[argumentsKey])
                    this.PLAYERDATA[argumentsKey] = await this.getCheatersInfo(argumentsKey);
            }

            this.updateStorage();
        }
    }

    /**
     * 获取作弊者档案
     */
    async getCheatersInfo(dbId) {
        let res = await http.get(api["cheaters"], {
            params: {
                history: true,
                dbId
            }
        });
        const d = res.data;

        if (d.success != 1) return {};

        delete d.data.history;

        this.PLAYERDATA[d.data.id] = d.data;
        this.updateStorage();
        return d.data;
    }
}
