<template>
    <header>
      <div class="container">
        <div class="nav">
        <router-link :to="{name: 'home'}">首页</router-link>

        <!--<router-link :to="{name: 'about'}">关于</router-link>-->
        <router-link :to="{name: 'cheaters', query: { status: '1' }}">外挂公示</router-link>

        <router-link :to="{name: 'report'}">举报作弊</router-link>

        </div>
        <div class="nav">
          <router-link v-show="!isLogin" :to="{name: 'signin'}">登录</router-link>
          <router-link v-show="!isLogin" :to="{name: 'signup'}">注册</router-link>

          <span v-show="isLogin">{{ username }}</span>
          <a v-show="isLogin" href="#" @click.stop.prevent="signout">注销</a>

        </div>
      </div>
    </header>
</template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
    }
  },
  methods: {
    signout: function() {
      axios({
        method: 'get',
        url: '/account/signout'
      })
      .then((res) => {
        const d = res.data;

        if (d.error === 0) {
          this.$store.dispatch('signout').then(() => {
            this.$router.push('/');

            this.$Message.success('注销成功');
          })
        }
      })
    }
  },
  computed: {
    isLogin() {
      return Boolean(this.$store.state.user);
    },
    username() {
      return this.$store.state.user ? this.$store.state.user.username : '';
    }
  }
}

let styles = `
   background-color: #fff;
   box-shadow: 0 0 10px 0px #676767;
`;
window.addEventListener('scroll', function(e) {
  let scrollTop = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;

  if (scrollTop > 24) {
    document.querySelector('header').setAttribute('style', styles);
  } else {
    document.querySelector('header').removeAttribute('style');
  }
})

</script>

<style lang="scss" scoped>
  header {
    background-color: rgba(252,252,252,0.8);
    width: 100%;
    height: auto;
    box-shadow: 0 0 4px rgba(0,0,0,0.15);

    position: fixed;
    z-index: 1000;
  }
  .container {
    display: flex;
    justify-content: space-between;
    padding: 1rem 0;
  }
  .nav {
    a {
      padding: 1rem;
      &:hover {
        background-color: rgba(251, 251, 251, 0.8);
        color: black;
      }
    }
  }
</style>

