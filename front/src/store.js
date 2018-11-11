// import Vue from 'vue';
// import Vuex from 'vuex';
// import Cookies from 'js-cookie';

// Vue.use(Vuex);

const store = new Vuex.Store({
  state: {
    user: undefined,
  },

  // modify state
  mutations: {
    signin(state, payload) {
      state.user = payload;

      Cookies.set('user', JSON.stringify(payload), {expires: 1});
    },
    signout(state, payload) {
      state.user = undefined;

      Cookies.remove('user');
    },
    syncLoginState(state) {
      let cookieUser = Cookies.getJSON('user');
      if (cookieUser) {
        state.user = cookieUser;
      }
    },
  },

  // dispatch actions
  actions: {
    signin(context, payload) {
      context.commit('signin', payload);
    },
    signout(context, payload) {
      context.commit('signout', payload);
    },
  },
});

export default store;
