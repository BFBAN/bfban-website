<template>
  <div id="app" class="app">
    <template v-if="!isFull">
      <Header></Header>
    </template>
    <main>
      <router-view></router-view>
    </main>
    <template v-if="!isFull">
      <FooterPublicBox></FooterPublicBox>
      <Footer></Footer>
    </template>
  </div>
</template>

<script>
import {http_token, storage, account_storage} from './assets/js/index';
import {SET_LANG, SET_THEME} from "@/store/mutation-types";

import theme from "/public/config/themes.json"

import Header from "./components/Header.vue";
import Footer from "./components/Footer.vue";
import FooterPublicBox from "@/components/footerPublicBox";

import 'view-design/dist/styles/iview.css'

export default {
  name: "app",
  data() {
    return {
      isFull: false,
      split: true ? 1 : .9
    }
  },
  beforeCreate() {
    if (window.location.hash) {
      location.replace(window.location.hash.replace('#', ''));
    }
  },
  components: {Header, Footer, FooterPublicBox},
  created() {
    this.http = http_token.call(this);

    this.isFull = this.$route.query.full || false;

    this.onLoadTheme();
    this.onUserinfo();
  },
  mounted() {

  },
  methods: {
    /**
     * 加载主题
     * @returns {Promise<void>}
     */
    async onLoadTheme() {
      let theme = storage.get('theme');

      if (theme.data && theme.data.value) {
        await this.$store.dispatch(SET_THEME, theme.data.value);
        return;
      }

      // 让它加载默认主题
      await this.$store.dispatch(SET_THEME, null);
    },
    /**
     * 加载语言
     * @returns {Promise<void>}
     */
    async onLoadLang() {
      let selectLang = null;

      if (this.$route.query.lang) {
        selectLang = this.$route.query.lang;
      }

      // load lang
      if (!selectLang && account_storage.getConfiguration('langLocalSync')) return;
      this.$store.dispatch(SET_LANG, selectLang);
    },
    /**
     * 处理用户信息
     */
    async onUserinfo() {
      if (!this.$store.state.$userinfo) return;
      account_storage.getUserInfo()
    }
  },
  computed: {}
};
</script>

<style lang="less">
@import "@/assets/css/index.less";

html, body {
  scroll-behavior: smooth;
  scroll-padding-top: 10%;
}

.app {
  height: 100%;
  display: flex;
  flex-direction: column;

  &.app-split {
    height: 100%;
  }

  .app-split-pane-main {
    overflow: auto;
    height: 100%;
  }

  .app-split-pane {
  }

  .bottom-pane {
    backdrop-filter: blur(50px);
  }
}

.lantern {
  pointer-events: none !important;
}
</style>
