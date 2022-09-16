/* eslint-disable no-console */
import { register } from 'register-service-worker'

import store from './store'

import PwaUtil from "../pwa/util";
import PwaApp from "../pwa/app";

const isDEBUG = false;

register(`/service-worker.js`, {
    PwaUtil: new PwaUtil(),
    PwaApp: new PwaApp(),
    async ready(a) {
    },
    registered(a) {
        // 开启扩展选项
        store.state.configuration.enhance = true;

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
