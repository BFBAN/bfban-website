<template>
    <header>
      <div class="header-container container">
        <div class="nav">
        <router-link :to="{name: 'home'}">首页</router-link>

        <!--<router-link :to="{name: 'about'}">关于</router-link>-->
        <router-link :to="{name: 'cheaters', query: { status: '1' }}">外挂公示</router-link>

        <router-link :to="{name: 'report'}">举报作弊</router-link>

        </div>
        <div class="nav">
          <router-link v-show="!isLogin" :to="{name: 'signin'}">登录</router-link>
          <router-link v-show="!isLogin" :to="{name: 'signup'}">注册</router-link>


          <router-link class="nav-username" v-if="isLogin" :to="{name: 'account', params: { uId: `${currentUser.uId}` }}">
            <Badge dot>
              {{ currentUser.username }}
            </Badge>

          </router-link>
          <a class="nav-signout" v-show="isLogin" href="#" @click.stop.prevent="signout">注销</a>

          <router-link v-if="isAdmin" :to="{name: 'dashboard'}">
            后台管理
          </router-link>

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
    isAdmin() {

    },
    currentUser() {
      return this.$store.state.user;
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

<style lang="scss">
  header {
    background-color: rgba(252,252,252,0.8);
    width: 100%;
    height: auto;
    box-shadow: 0 0 4px rgba(0,0,0,0.15);

    position: fixed;
    z-index: 1000;
  }
  .header-container {
    display: flex;
    justify-content: space-between;
  }
  .nav {
    display: flex;
    a {
      padding: 1rem;
      &:hover {
        background-color: rgba(251, 251, 251, 0.8);
        color: black;
      }
    }
  }
  .nav-username {
    text-overflow: ellipsis;
    white-space: nowrap;
    overflow: hidden;
    width: 6rem;
    flex-grow: 0;
  }
  .nav-signout {
    flex-shrink: 0;
  }

  @media screen and (min-width: 1088px) {
    .nav-username {
      width: 100%;
    }
  }

  .ivu-badge-dot {
    left: -8px;
  }
</style>

