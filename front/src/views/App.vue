<template>
  <div class="app">
    <Header />
    <main>
        <!-- component match the router will render here -->
        <router-view></router-view>
    </main>
    <Footer />

    <!-- feedback -->
    <a class="feedback" target="_blank" href="http://support.qq.com/product/64038">
      <Icon size=24 type="ios-chatbubbles" />
      <span>意见反馈</span>
    </a>
  </div>

</template>

<script>
import Header from '@/views/Header.vue';
import Footer from '@/views/Footer.vue';

export default {
  data() {
    return {

    }
  },
  components: {
      Header,
      Footer
  }
}
</script>

<style lang="scss" scoped>
.feedback {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  color: #515a6e;
  background-color: #f7f7f7;
  padding: .4rem;
  box-shadow: 0 0 .2rem #b7b7b7;

  width: 6rem;
  height: 2rem;
  border-radius: 2rem;
  display: flex;
  justify-content: space-around;
  align-items: center;

  &:hover {
    color: #fff;
    background-color: #2d8cf0;
  }
}
</style>

<style lang="scss">
  /* ubuntu-mono-regular - latin */
  @font-face {
    font-family: 'Ubuntu Mono';
    font-style: normal;
    font-weight: 400;
    src: url($cdnBasePath + '/assets/fonts/ubuntu-mono-v8-latin-regular.eot'); /* IE9 Compat Modes */
    src: local('Ubuntu Mono'), local('UbuntuMono-Regular'),
        url($cdnBasePath + '/assets/fonts/ubuntu-mono-v8-latin-regular.eot?#iefix') format('embedded-opentype'), /* IE6-IE8 */
        url($cdnBasePath + '/assets/fonts/ubuntu-mono-v8-latin-regular.woff2') format('woff2'), /* Super Modern Browsers */
        url($cdnBasePath + '/assets/fonts/ubuntu-mono-v8-latin-regular.woff') format('woff'), /* Modern Browsers */
        url($cdnBasePath + '/assets/fonts/ubuntu-mono-v8-latin-regular.ttf') format('truetype'), /* Safari, Android, iOS */
        url($cdnBasePath + '/assets/fonts/ubuntu-mono-v8-latin-regular.svg#UbuntuMono') format('svg'); /* Legacy iOS */
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
  main {
    flex: 1 0 auto;
    margin-top: 4rem !important;
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

