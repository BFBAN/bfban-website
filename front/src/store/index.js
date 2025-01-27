import Vue from 'vue'
import Vuex from 'vuex'
import Cookies from 'js-cookie'
import lodash from "lodash"

import app from '@/main'
import theme from '@/../public/config/themes.json'
import workflowRoute from "@/store/workflow";
import {print} from "@/assets/js";
import {SET_LANG, SET_THEME, SET_USER, SET_SIGNIN, SET_SIGOUT} from './mutation-types';

Vue.use(Vuex);

const store = new Vuex.Store(lodash.mergeWith({
    state: {
        baseUrl: process.env.BASE_URL,
        user: undefined,
        namespaced: true,

        // storage_account.js
        configuration: {
            history: false,
            subscribes: false,
            judgementTip: false,
            enhance: false,
            autoUpdatePlayerList: false,
            desktopNotification: false,
            footerBar: false,
            voice: true,
            detailLeftAppealPanel: true,
        },

        // https://vue-meta.nuxtjs.org/api
        metaInfo: {
            meta: [
                {charset: 'utf-8'},
                {name: 'viewport', content: 'width=device-width, initial-scale=1'}
            ]
        },

        $desktop: {},
        $theme: {},
        $userinfo: {},
    },

    // modify state
    mutations: {
        changeMetaInfo(state, metaInfo) {
            state.metaInfo = metaInfo;
        },
        syncLocalConfiguration(state, data) {
            state.configuration = Object.assign(state.configuration, data);
        },
        syncLoginState(state) {
            const cookieUser = Cookies.get('user') && JSON.parse(Cookies.get('user'));
            if (cookieUser)
                state.user = cookieUser;
        },
        [SET_SIGNIN](state, data) {
            state.user = data;
            Cookies.set('user', JSON.stringify(data), {expires: 7});
        },
        [SET_SIGOUT](state, data) {
            state.user = undefined;
            Cookies.remove('user');
        },
        [SET_LANG](state, payload) {
            app.$i18n.locale = payload;
        },
        [SET_THEME](state, data) {
            state.$theme = data || theme.child.filter(i => i.name == theme.default)[0];

            if (!state && !state.$theme && !state.$theme.name) return;

            import(`/public/theme/${state.$theme.name}/index.less`)
                .catch(_ => {
                    print.log('load default')
                    state.$theme.name = theme.default;
                    import(`/public/theme/${theme.default}/index.less`)
                })
        },
        [SET_USER](state, data) {
            state.$userinfo = data;
        },
    },

    // dispatch actions
    actions: {
        signin({commit}, payload) {
            commit(SET_SIGNIN, payload);
        },
        signout(context, payload) {
            context.commit(SET_SIGOUT, payload);
        },
        setLang({commit}, payload) {
            commit(SET_LANG, payload);
        },
        setTheme({commit}, payload) {
            commit(SET_THEME, payload);
        },
        setUserInfo({commit}, data) {
            commit(SET_USER, data);
        },
        remUserInfo({commit}, data) {
            commit(SET_USER, null);
        }
    },
}, workflowRoute));

export default store;
