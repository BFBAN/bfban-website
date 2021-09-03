<template>
    <div id="app">
		<Header></Header>
		<main>
			<router-view></router-view>
		</main>
		<Footer></Footer>
    </div>
</template>

<script>
import Header from "./components/Header.vue";
import Footer from "./components/Footer.vue";

export default {
    name: "app",
    components: {
		Header,
		Footer
    },
};
import 'view-design/dist/styles/iview.css'
</script>

<style lang="scss">

@font-face {
    font-family: "Ubuntu Mono";
    font-weight: 400;
    font-style: normal;
    src: url("~@/assets/fonts/ubuntu-mono-v8-latin-regular.eot");
    src: url("~@/assets/fonts/ubuntu-mono-v8-latin-regular.eot#iefix")
            format("embedded-opentype"),
        /* IE6-IE8 */ url("~@/assets/fonts/ubuntu-mono-v8-latin-regular.woff2")
            format("woff2"),
        /* Super Modern Browsers */
            url("~@/assets/fonts/ubuntu-mono-v8-latin-regular.woff")
            format("woff"),
        /* Modern Browsers */
            url("~@/assets/fonts/ubuntu-mono-v8-latin-regular.ttf")
            format("truetype"),
        /* Safari, Android, iOS */
            url("~@/assets/fonts/ubuntu-mono-v8-latin-regular.svg")
            format("svg"); /* Legacy iOS */
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
}

html, body {
  font-family: 'Ubuntu Mono', monospace, "Helvetica Neue", Helvetica, "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", 微软雅黑, Arial, sans-serif;
}

html, body {
  height: 100%;
}
body {
  font-size: .8rem;
  background-color: #f8f9fa;

  display: flex;
  flex-direction: column;

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
    border: 1px solid #dbdbdb;
    border-width: 0 0 1px;
    padding: .5em .75em;
    vertical-align: middle;
  }

  tbody tr:hover {
    background-color: #f3f3f3bd;
  }
}
</style>
