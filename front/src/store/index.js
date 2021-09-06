import Vue from 'vue'
import Vuex from 'vuex'
import Cookies from 'js-cookie';

import app from '../main';
import { SET_LANG, SET_THEME } from './mutation-types';

Vue.use(Vuex)

const store = new Vuex.Store({
  state: {
    user: undefined,
    $theme: 'dis',
  },

  // modify state
  mutations: {
    SIGNIN(state, payload) {
      state.user = payload;

      Cookies.set('user', JSON.stringify(payload), { expires: 7 });
    },
    signout(state, payload) {
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
    [SET_THEME](state, pay) {
      state.$theme = pay;
      let theme = state.$theme;
      if (theme == 'dis' || theme == '') {
        require('../theme/bfban_theme.less');
      } else if (theme == 'deep') {
        require('../theme/bfban_deep.less');
      }
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
    }
  },
});

export default store;
