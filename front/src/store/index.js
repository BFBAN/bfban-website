import Vue from 'vue'
import Vuex from 'vuex'
import Cookies from 'js-cookie'

import app from '../main'
import theme from '/public/conf/themes.json'
import {SET_LANG, SET_THEME, SET_USER} from './mutation-types';

Vue.use(Vuex)

const store = new Vuex.Store({
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
      desktopNotifiction: false,
      footerBar: false,
      voice: false,
      detailLeftAppealPanel: true,
    },

    // https://vue-meta.nuxtjs.org/api
    metaInfo: {
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' }
      ]
    },

    $desktop: {
      // 查询待处理
      autoUpdatePlayerList: {
        result: [],
        total: 0
      }
    },
    $theme: {},
    $userinfo: {},
  },

  // modify state
  mutations: {
    CHANGE_META_INFO(state, metaInfo) {
      state.metaInfo = metaInfo;
    },
    SIGNIN(state, data) {
      state.user = data;

      Cookies.set('user', JSON.stringify(data), { expires: 7 });
    },
    signout(state, data) {
      state.user = undefined;
      Cookies.remove('user');
    },
    syncLoaclConfiguration (state, data) {
      state.configuration = Object.assign(state.configuration, data);
    },
    syncLoginState(state) {
      const cookieUser = Cookies.get('user') && JSON.parse(Cookies.get('user'));
      if (cookieUser) {
        state.user = cookieUser;
      }
    },
    [SET_LANG](state, payload) {
      app.$i18n.locale = payload;
    },
    [SET_THEME](state, data) {
      state.$theme = data || theme.child.filter(i => i.name == theme.default)[0];

      if (!state && !state.$theme && !state.$theme.name) return;

      import(`/public/theme/${state.$theme.name}/index.less`)
    },
    [SET_USER](state, data) {
      state.$userinfo = data;
    },
  },

  // dispatch actions
  actions: {
    signin({ commit }, payload) {
      commit('SIGNIN', payload);
    },
    signout(context, payload) {
      context.commit('signout', payload);
    },
    setLang({ commit }, payload) {
      commit(SET_LANG, payload);
    },
    setTheme({ commit }, payload) {
      commit(SET_THEME, payload);
    },
    setUserInfo({ commit }, data) {
      commit(SET_USER, data);
    },
    remUserInfo ({ commit }, data) {
      commit(SET_USER, null);
    }
  },
});

export default store;
