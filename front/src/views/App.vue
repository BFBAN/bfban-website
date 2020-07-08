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
    background-color: rgb(239, 239, 239);

    display: flex;
    flex-direction: column;

    /*background image*/
    background-size: cover;
    background-position: center;
    background-attachment: fixed;
    background-repeat: no-repeat;

    /*background-image: url('https://i.loli.net/2018/11/03/5bdd8e97bb2be.png');*/

    // merry 2018 christmas
    /*background-image: url('https://i.loli.net/2018/12/24/5c20cecbde3c9.jpg');*/


    /*2019 yellow right bottom*/
    /*background-image: url(https://i.loli.net/2018/12/28/5c25eeed25496.png);*/
    /*background-position: right bottom;*/
    /*background-size: 24rem;*/
    /*background-color: #fdd94194;*/

    /*2019 center bottom pig pink*/
    // background-image: url(https://i.loli.net/2018/12/28/5c25ed58ef2f2.png);
    // background-position: center bottom;
    // background-size: 18rem;
    // background-color: #ffd5d673;

    // 2019 端午
    // background-color: #f8c569;
    // background-image: url(https://i.loli.net/2019/06/02/5cf37cb12a81b19199.jpg);
    // background-position: center bottom;
    // background-size: 18rem;

    // 2019 black friday
    /*background-image: url(https://i.loli.net/2019/11/28/U3sRBdYEktq7cbM.png);*/
    /*background-size: 22rem;*/
    /*background-position: center bottom 2rem;*/
    /*background-color: black;*/

    /*2019 merry christmas*/
    /*background-image: url(https://i.loli.net/2020/01/02/e4MX3ulZSidcmQ1.png);*/
    /*background-size: 12rem;*/
    /*background-position: center bottom 8rem;*/
    /*background-color: #99d8cf;*/

    /*2020 happy new year*/
    /*background-image: url(https://i.loli.net/2020/01/02/KphAXSGyIOV7Et2.png);*/
    /*background-size: 24rem;*/
    /*background-position: center bottom 8rem;*/
    /*background-color: #C82839;*/

    /*2020 july*/
    background-image: url(https://i.loli.net/2020/07/09/vKAp56dWhVrfyzo.jpg);

    footer.footer {
      margin-top: 10rem;
    }
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
  .content {
    background-color:#fbfbfb;
    margin: 1rem 0;
    padding: 2rem 1rem;

    border-top: 2px solid #57a3f3;
    box-shadow: 0px 2px 2px 0px #99999991;
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

