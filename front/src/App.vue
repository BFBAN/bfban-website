<template>
  <div class="app">
    <Header />
    <div class="container" style="flex: 1 0 auto;">
        <div class="content">
            <!-- component match the router will render here -->
            <router-view></router-view>
        </div>
    </div>
    <Footer />
  </div>

</template>

<script>
import Header from './Header.vue'
import Footer from './Footer.vue'

export default {
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
  }
  .app {
    height: 100%;
    display: flex;
    flex-direction: column;
  }
  .container {
    max-width: 960px;
    width: 960px;
    margin: 0 auto;
  }
  .content {
    background-color:#fbfbfb;
    margin: 1rem 0;
    padding: 2rem 1rem;

    border-top: 2px solid #57a3f3;
    box-shadow: 0px 2px 2px 0px #99999991;
  }
</style>

