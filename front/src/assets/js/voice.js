/**
 * 声音管理
 * by howler, https://www.npmjs.com/package/howler
 */

import {Howl, Howler} from 'howler';
import Print from "@/assets/js/print";
import store from "@/store";

class Voice extends Print {
    VOICEDATA = {};

    constructor(data) {
        super();
        this.VOICEDATA = Object.assign(this.VOICEDATA, data);
    }

    /**
     * 添加音段
     * @param key
     * @param voiceData
     */
    addVoice (key, voiceData) {
        this.VOICEDATA[key] = voiceData;
    }

    /**
     * 播放音乐
     * @param key
     * @returns {Promise<unknown>}
     */
    play (key) {
        const that = this;
        if (!key && !store.state.configuration.voice) return;
        return new Promise((resolve, reject) => {
            if (!this.VOICEDATA[key]) {
                reject({
                    code: -1,
                    message: 'error'
                })
                return;
            }
            // console.log(this.VOICEDATA[key])
            this.VOICEDATA[key].play();

            this.VOICEDATA[key].once('load', function(){
                resolve({
                    chip: that.VOICEDATA[key],
                    code: 1,
                    message: 'load'
                })
            });

            this.VOICEDATA[key].on('end', function(){
                resolve({
                    chip: that.VOICEDATA[key],
                    code: 1,
                    message: 'end'
                })
            });
        })
    }

    voiceData (data) {
        return new Howl(data);
    }
}

export default Voice;