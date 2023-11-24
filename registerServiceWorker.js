importScripts("/precache-manifest.84308473655a2cf386f399681045bb08.js", "https://storage.googleapis.com/workbox-cdn/releases/4.3.1/workbox-sw.js");

/* eslint-disable no-console */
import { register } from 'register-service-worker'

import store from './store'

import PwaUtil from "./pwa/util";
import PwaApp from "./pwa/app";

const isDEBUG = true;

// Run [serve:production]
if (process.env.NODE_ENV === 'production' || isDEBUG) {
    register(`${process.env.BASE_URL}service-worker.js`, {
        PwaUtil: new PwaUtil(),
        PwaApp: new PwaApp(),
        ready() {
            // 开启扩展选项
            store.state.configuration.enhance = true;
        },
        registered() {
            // 是否登录
            if (!this.PwaUtil.isLogin()) return;
            // 是否管理员
            if (!this.PwaUtil.isAdmin()) return;
            // 是否开启扩展
            if(!this.PwaUtil.isEnhance()) return;

            // 玩家列表
            this.PwaApp.asyncAutoUpdatePlayerList();
        },
        cached() {
            // console.log('Content has been cached for offline use.')
        },
        updatefound() {
            // console.log('New content is downloading.')
        },
        updated() {
            // console.log('New content is available; please refresh.')
        },
        offline() {
            // console.log('No internet connection found. App is running in offline mode.')
        },
        error(error) {
            console.error('Error during service worker registration:', error)
        }
    });
}


