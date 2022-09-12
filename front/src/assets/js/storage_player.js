/**
 * 玩家数据
 * 持久
 */

import Storage from './storage';
import {api, http} from "./index";

export default class PlayerStorage extends Storage {
    NAME = 'user.player';

    PLAYERDATA = {};

    constructor() {
        super();
        let ary = super.get(this.NAME);
        if (ary.code >= 0) {
            for (const aryKey in ary.data.value) {
                this.PLAYERDATA[ ary.data.value[aryKey].id ] = ary.data.value[aryKey];
            }
        }
    }

    updataStorage () {
        super.set(this.NAME, this.PLAYERDATA);
    }

    push (key, val) {
        this.PLAYERDATA[key] = val;
        this.updataStorage();
    }

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

            this.updataStorage();
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
        this.updataStorage();
        return d.data;
    }
}