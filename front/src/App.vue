<template>
  <div class="app">
    <Header />
    <main class="container">
      <div class="content">
        <!-- component match the router will render here -->
          <router-view></router-view>
      </div>
    </main>
    <Footer />
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

<style>
  html, body {
    height: 100%;
  }
  body {
    font-size: .8rem;
    background-color: rgb(239, 239, 239);

    display: flex;
    flex-direction: column;

    /*background image*/
    background: url('https://i.loli.net/2018/11/03/5bdd8e97bb2be.png') no-repeat;
    background-size: cover;
    background-position: center;
    background-attachment: fixed;
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
    margin: .4rem 0;
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
  @media screen and (min-width: 1088px) {
    .container {
      max-width: 960px;
      width: 960px;
    }
  }
</style>

