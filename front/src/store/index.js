import Vue from 'vue'
import Vuex from 'vuex'
import Cookies from 'js-cookie';

import app from '../main';
import theme from '/public/conf/themes.json'
import {SET_LANG, SET_THEME, SET_USER} from './mutation-types';

Vue.use(Vuex)

const store = new Vuex.Store({
  state: {
    baseUrl: process.env.BASE_URL,
    user: undefined,
    $desktop: {},
    $theme: {},
    $userinfo: {},
  },

  // modify state
  mutations: {
    SIGNIN(state, data) {
      state.user = data;

      Cookies.set('user', JSON.stringify(data), { expires: 7 });
    },
    signout(state, data) {
      state.user = undefined;

      Cookies.remove('user');
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
      console.log({ commit }, payload)
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
