import Vue from 'vue'
import Vuex from 'vuex'
import Cookies from 'js-cookie';

import app from '../main';
import { SET_LANG } from './mutation-types';

Vue.use(Vuex)

const store = new Vuex.Store({
  state: {
    user: undefined,
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
      console.log(app)
      app.$i18n.locale = payload;
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
  },
});

export default store;
