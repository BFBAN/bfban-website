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
    </a>
  </div>

</template>

<script>
import Header from './Header.vue';
import Footer from './Footer.vue';

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
  color: #bfbfbf;
  background-color: #f7f7f7;
  padding: .4rem;
  box-shadow: 0 0 .2rem #b7b7b7;
  border-radius: 2rem;

  &:hover {
    color: #fff;
    background-color: #2d8cf0;
  }
}
</style>

<style lang="scss">
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

    background-image: url('https://i.loli.net/2018/11/03/5bdd8e97bb2be.png');

    /*merry 2018 christmas*/
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
</style>

