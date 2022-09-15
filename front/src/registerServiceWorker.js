/* eslint-disable no-console */
import { register } from 'register-service-worker'

import Vue from 'vue'
import App from './App.vue'
import i18n from './i18n'
import router from './router'
import MetaInfo from './router/meta'
import store from './store'

import {api, http, storage, account_storage, util, notification} from './assets/js/index'

import PwaUtil from "../pwa/util";
import PwaApp from "../pwa/app";

register(`/service-worker.js`, {
    PwaUtil: new PwaUtil(),
    PwaApp: new PwaApp(),
    ready() {
        // 开启扩展选项
        store.state.configuration.enhance = true;

        // console.log(
        //     'App is being served from cache by a service worker.\n' +
        //     'For more details, visit https://goo.gl/AFskqB'
        // )
    },
    registered() {
        // 开启扩展选项
        store.state.configuration.enhance = true;

        console.log('Service worker has been registered.')
        console.log(this.PwaUtil.isLogin(), this.PwaUtil.isAdmin(),this.PwaUtil.isEnhance())
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
