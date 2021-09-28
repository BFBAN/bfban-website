<template>
  <div id="app" class="app ">
    <Header></Header>
    <main>
      <router-view></router-view>
    </main>
    <Footer></Footer>
  </div>
</template>

<script>
import {api, http_token, storage} from './assets/js/index';

import theme from "./assets/themes.json"

import Header from "./components/Header.vue";
import Footer from "./components/Footer.vue";

export default {
  name: "app",
  data() {
    return {
      split: true ? 1 : .9
    }
  },
  components: {Header, Footer},
  created() {
    this.http = http_token.call(this);

    document.querySelectorAll('a').forEach(a => {a.onclick=(e) => {e.preventDefault()}});

    this.onLoadTheme();
    this.onUserinfo();
  },
  methods: {
    async onLoadTheme () {
      let theme = await storage.get('theme');

      if (theme.data && theme.data.value) {
        await this.$store.dispatch('setTheme', theme.data.value);
        return;
      }

      // 让它加载默认主题
      await this.$store.dispatch('setTheme', null);
    },
    onUserinfo () {
      if (this.isLogin) {
        this.http.get(api["user_me"], {}).then((res) => {
          const d = res.data;

          if (d.success === 1) {
            // set userinfo
            this.$store.dispatch('setUserInfo', d.data);
            // update loac language
            this.$store.dispatch('setLang', d.data.attr.language);
          }
        })
      }
    }
  },
  computed: {
    isLogin() {
      return Boolean(this.$store.state.user)
    },
  }
};
import 'view-design/dist/styles/iview.css'
</script>

<style lang="scss">
@font-face {
  font-family: "Ubuntu Mono";
  font-weight: 400;
  font-style: normal;
  src: url("~@/assets/fonts/ubuntu-mono-v8-latin-regular.eot");
  src: url("~@/assets/fonts/ubuntu-mono-v8-latin-regular.eot#iefix") format("embedded-opentype"),
    /* IE6-IE8 */
  url("~@/assets/fonts/ubuntu-mono-v8-latin-regular.woff2") format("woff2"),
    /* Super Modern Browsers */
  url("~@/assets/fonts/ubuntu-mono-v8-latin-regular.woff") format("woff"),
    /* Modern Browsers */
  url("~@/assets/fonts/ubuntu-mono-v8-latin-regular.ttf") format("truetype"),
    /* Safari, Android, iOS */
  url("~@/assets/fonts/ubuntu-mono-v8-latin-regular.svg") format("svg"); /* Legacy iOS */
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

html, body {
  font-family: "Helvetica Neue", Helvetica, "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "微软雅黑", Arial, sans-serif;
  font-size: .8rem;
  display: flex;
  flex-direction: column;
  background-color: #f8f9fa !important;

  /*background image*/
  background-size: cover;
  background-position: center;
  background-attachment: fixed;
  background-repeat: no-repeat;
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

.container {
  width: 100%;
  margin: 0 auto;
  position: relative;
}

p {
  margin: .2rem 0;
}

.hint {
  display: block;
}

.hint::before {
  display: inline-block;
  content: '*';
  color: red;
  font-size: 1rem;
  vertical-align: middle;
  margin-right: .4rem;
}


/*mobile responsive*/
@media screen and (min-width: 1024px) {
  .container {
    max-width: 960px;
    width: 960px;
  }

  .desktop-hide {
    display: none !important;
  }
}

@media screen and (max-width: 1024px) {
  .mobile-hide {
    display: none !important;
  }
}

.is-size-6 {
  font-size: 1rem !important;
}

/*iview page component bug fix*/
/*https://github.com/iview/iview/issues/828*/
.ivu-page-item-jump-next:after, .ivu-page-item-jump-prev:after {
  content: "\2022\2022\2022";
}

table {
  width: 100%;
  border-collapse: collapse;
  border-spacing: 0;

  td {
    padding: .5em .75em;
    vertical-align: middle;
  }
}
</style>
