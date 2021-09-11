<template>
    <header>
      <div class="header-container container">
        <router-link class="mobile-hide" :to="{name: 'home'}">
          <img src="../assets/images/logo.png"
               width="40"
               height="40"
               alt="bfban logo"/>
        </router-link>
        <div class="nav nav-menu">
          <Icon class="desktop-hide" type="md-menu" size="30" @click="headerMenu.show = !headerMenu.show "/>
          <Drawer class="desktop-hide"
                  :title="$t($route.name + '.title')"
                  placement="left"
                  width="80%"
                  :closable="true" v-model="headerMenu.show">
            <List>
              <ListItem @click="$router.push({name: i.name, query: i.to.query});"
                        v-for="(i, index) in headerMenu.child" :key="index">
                {{ $t("header." + i.name) }}
              </ListItem>
            </List>
          </Drawer>

          <router-link class="mobile-hide link"
                       :to="i.to"
                       v-for="(i, index) in headerMenu.child" :key="index">
            {{ $t("header." + i.name) }}
          </router-link>
        </div>
        <div class="nav">
          <router-link v-show="!isLogin" class="mobile-hide" :to="{name: 'signin'}">
            <Button type="primary" shape="circle">
              <Icon type="md-log-in" />
              {{$t("header.signin")}}
            </Button>
          </router-link>

          <router-link v-show="!isLogin" class="desktop-hide" :to="{name: 'signin'}">
            <Icon type="md-log-in" size="30" />
          </router-link>

          <router-link v-show="!isLogin" class="desktop-hide" :to="{name: 'signup'}">
            <Icon type="md-person-add" size="30" />
          </router-link>

          <Dropdown placement="bottom-end" v-if="isLogin">
            <Avatar>{{ currentUser.userinfo.username[0] || 'Null' }}</Avatar>
            <span class="mobile-hide">&emsp;{{ currentUser.userinfo.username }}</span>
            <DropdownMenu slot="list">
              <DropdownItem>
                <router-link class="" :to="{name: 'account', params: { uId: `${currentUser.userinfo.userId}` }}">
                  {{ $t("header.userCenter") }}
                </router-link>
              </DropdownItem>
              <DropdownItem>
                <router-link class="" :to="{name: 'profile', params: { uId: `${currentUser.userinfo.userId}` }}">
                  {{ $t("header.profile") }}
                </router-link>
              </DropdownItem>
              <DropdownItem divided v-if="isAdmin">
                <router-link :to="{name: 'dashboard'}">
                  {{ $t("header.dashboard") }} [beta]
                </router-link>
              </DropdownItem>
              <Dropdown-item divided v-show="isLogin">
                <a @click.stop.prevent="signout">
                  <Icon type="md-log-out"></Icon>
                  {{ $t("header.signout") }}
                </a>
              </Dropdown-item>
            </DropdownMenu>
          </Dropdown>

          <Divider type="vertical" v-show="isLogin"/>

          <Header_message v-show="isLogin">
            <Icon slot="content" type="md-notifications" size="30"/>
          </Header_message>

          <Divider type="vertical" v-show="isLogin"/>

          <router-link v-if="isLogin" :to="{name: 'search_main'}">
            <Icon type="ios-search" size="28"/>
          </router-link>

          <Divider type="vertical"/>

          <Tooltip :content="$t('home.howToUse.tools.main')" placement="bottom-end">
            <router-link :to="{name: 'apps'}">
              <Icon type="md-apps" size="30"/>
            </router-link>
          </Tooltip>
        </div>
      </div>
    </header>
</template>

<script>
import {api, http, http_token} from '../assets/js/index'

import menu from '../assets/headerMenu.json'

import Header_message from "./Header_message";

export default {
  data() {
    return {
      headerMenu: {
        show: false,
        child: [],
      },
      privileges: [],
    }
  },
  components: {Header_message},
  watch: {
    $route: "loadData",
  },
  created() {
    this.http = http_token.call(this);
    this.headerMenu.child = menu.child;
  },
  methods: {
    async loadData() {
      const privileges = await import('/src/assets/privilege.json');
      this.privileges = privileges.child;
    },
    signout() {
      http.post(api["account_signout"], {
        headers: {
          'x-access-token': this.$store.state.user.token
        }
      }).then((res) => {
        const d = res.data;
        if (d.success == 1) {
          this.$store.dispatch('signout').then(() => {
            this.$Message.success(d.message);

            this.$router.push('/');
          });
        }
      })
    }
  },
  computed: {
    isLogin() {
      return Boolean(this.$store.state.user);
    },
    isAdmin() {
      const user = this.$store.state.user;

      const is = user ? user.userPrivilege !== 'normal' : false;
      return Boolean(is);
    },
    currentUser() {
      return this.$store.state.user;
    }
  }
}
</script>

<style lang="scss">
  header {
    position: relative;
    z-index: 1000;
    backdrop-filter: blur(50px);
    width: 100%;
    height: auto;
    padding: 10px 0 !important;
    background-image: linear-gradient(rgba(0, 0, 0, 0.1), transparent);
  }
  .header-container {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .nav {
    display: flex;
    align-items: center;
    padding: 0 .4rem;
    font-weight: bold;

    a.link {
      padding: .7rem .8rem;
      text-shadow: #fff 1px 0 0, #fff 0 1px 0, #fff -1px 0 0, #fff 0 -1px 0;
    }
  }
  .nav-menu {
    flex: 1;
  }
  .nav-username {
    text-overflow: ellipsis;
    white-space: nowrap;
    overflow: hidden;
    max-width: 6rem;
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
    left: -4px;
  }
</style>