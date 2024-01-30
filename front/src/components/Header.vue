<template>
  <header v-if="!isFull">
    <div class="header-container">
      <router-link class="mobile-hide" :to="{name: 'home'}">
        <img src="../assets/images/logo.png"
             style="border-radius: 50%"
             width="40"
             height="40"
             alt="logo"/>
      </router-link>
      <div class="nav nav-menu">
        <Icon class="desktop-hide" type="md-menu" size="30" @click="headerMenu.show = !headerMenu.show "/>
        <Drawer class="desktop-hide header-drawer"
                placement="left"
                width="80%"
                :title="title"
                :closable="true"
                v-model="headerMenu.show">

          <List split class="header-drawer-body">
            <Banner :height="150">
              <template v-if="!isLogin">
                <Card>
                  <Row :gutter="10">
                    <Col flex="1">
                      <div @click="navigatorTo({to: {name: 'signin'}})">
                        <Icon type="md-log-in" size="20"/>
                        {{ $t("header.signin") }}
                      </div>
                    </Col>
                    <Col>
                      <div @click="navigatorTo({to: {name: 'signup'}})">
                        <Icon type="md-person-add" size="20"/>
                        {{ $t("header.signup") }}
                      </div>
                    </Col>
                  </Row>
                </Card>
              </template>
              <template v-else>
                <h2>{{ currentUser.userinfo.username}}</h2>
              </template>
            </Banner>

            <ListItem v-for="(i, index) in headerMenu.child" :key="index" @click.native.stop="navigatorTo(i)">
              <div>
                {{ $t("header." + i.name) }}
              </div>
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
        <Button type="primary" v-show="!isLogin" class="mobile-hide" :to="{name: 'signin'}"
                icon="md-log-in"
                v-if="$route.name != 'signin'">
          {{ $t("header.signin") }}
        </Button>

        <Dropdown v-if="isLogin"
                  :trigger="isMobile ? 'click' : 'hover'"
                  :placement="isMobile ? 'bottom' : 'bottom-end'"
                  :padding="0">
          <UserAvatar :src="userinfo.userAvatar" :size="30"></UserAvatar>

          <DropdownMenu slot="list" class="header-dropdown-menu">
            <div class="header-dropdown-avatar">
              <div>
                <UserAvatar :src="userinfo.userAvatar" :size="80"></UserAvatar>
                <p class="header-dropdown-name">{{ userinfo.username }}</p>
                <p class="header-dropdown-id">{{ userinfo.userId }}</p>
              </div>
              <PrivilegesTag :data="userinfo.privilege"></PrivilegesTag>
            </div>
            <router-link :to="{name: 'space', params: { uId: `${userinfo.userId}` }}">
              <DropdownItem divided :disabled="$route.name == 'space' && userinfo.userId == this.$route.params.uId">
                {{ $t("header.userCenter") }}
              </DropdownItem>
            </router-link>
            <router-link :to="{name: 'report'}">
              <DropdownItem :disabled="$route.name == 'report'">
                {{ $t("header.report") }}
              </DropdownItem>
            </router-link>
            <router-link :to="{name: 'profile', params: {pagename: 'information'}}">
              <DropdownItem :disabled="$route.name == 'profile'">
                {{ $t("header.profile") }}
              </DropdownItem>
            </router-link>
            <router-link :to="{name: 'admin', params: {pagename: 'home'}}" v-if="isAdmin">
              <DropdownItem :disabled="$route.name == 'admin'">
                {{ $t("profile.admin.title") }}
              </DropdownItem>
            </router-link>
            <div @click="onSignout">
              <Dropdown-item divided v-show="isLogin">
                <Row>
                  <Col flex="1">{{ $t("header.signout") }}</Col>
                  <Col>
                    <Icon type="md-log-out"></Icon>
                  </Col>
                </Row>
              </Dropdown-item>
            </div>
          </DropdownMenu>
        </Dropdown>

        <Divider type="vertical" v-show="isLogin"/>

        <Tooltip :content="$t('profile.chat.title')" placement="bottom-end">
          <HeaderMessage v-show="isLogin">
            <Icon slot="content" type="md-notifications" size="30"/>
          </HeaderMessage>
        </Tooltip>

        <Divider type="vertical" v-if="$store.state.configuration.history"/>

        <HistoryView v-if="$store.state.configuration.history">
          <Icon type="md-filing" size="25"/>
        </HistoryView>

        <Divider type="vertical"/>

        <Tooltip :content="$t('search.title')" placement="bottom-end">
          <router-link :to="{name: 'search_main'}">
            <Icon type="ios-search" size="28"/>
          </router-link>
        </Tooltip>

        <Divider type="vertical"/>
        <Dropdown>
          <DropdownItem style="padding: 0;">
            <div v-for="(i, theme_index) in themes.child" :key="theme_index" class="iuv-card">
              <template v-if="$store.state.$theme.name == i.name">
                <div class="hedaer-theme-color" :style="`background-color: ${i.themeColor}`">
                  <Icon type="md-color-fill" size="18"/>
                </div>
              </template>
            </div>
          </DropdownItem>
          <DropdownMenu slot="list">
            <DropdownItem
                v-for="(i, theme_index) in themes.child" :key="theme_index"
                :name="i.name"
                :selected="$store.state.$theme.name == i.name"
                @click.native="changeTheme(theme_index)">
              <Row type="flex" align="middle">
                <div class="hedaer-theme-color right-space" :style="`background-color: ${i.themeColor}`"></div>
                <p>{{ i.name }}</p>
              </Row>
            </DropdownItem>
          </DropdownMenu>
        </Dropdown>


        <Divider type="vertical"/>

        <Tooltip :content="$t('apps.title')" placement="bottom-end">
          <router-link :to="{name: 'apps'}">
            <Icon type="md-apps" size="30"/>
          </router-link>
        </Tooltip>
      </div>
    </div>
  </header>
</template>

<script>
import {api, http, http_token, account_storage} from '../assets/js/index'
import {storage} from '../assets/js/index'
import themes from '/public/config/themes.json'
import menu from '/public/config/headerMenu.json'

import UserAvatar from "@/components/UserAvatar.vue";
import HistoryView from "@/components/HistoryView.vue";
import HeaderMessage from "./HeaderMessage.vue";
import PrivilegesTag from "/src/components/PrivilegesTag";
import Application from "@/assets/js/application";
import Banner from "@/components/Banner.vue";

export default new Application({
  data() {
    return {
      themes,
      headerMenu: {
        show: false,
        child: [],
      },
    }
  },
  components: {HistoryView, Banner, HeaderMessage, UserAvatar, PrivilegesTag},
  watch: {
    $route: "loadData",
  },
  created() {
    this.http = http_token.call(this);
    this.headerMenu.child = menu.child;
  },
  methods: {
    async loadData() {
      this.getTheme();
    },
    /**
     * 表头账户注销
     */
    onSignout() {
      const signout_msg = this.$Message.loading({
        content: this.$i18n.t("header.signout"),
        duration: 0
      });

      http.post(api["account_signout"], {
        headers: {
          'x-access-token': this.$store.state.user.token
        }
      }).then(res => {
        const d = res.data;

        if (d.success === 1) {
          this.$Message.success(this.$t(`basic.tip['${d.code}']`, {
            message: d.code || d.message
          }));
          return;
        }

        this.$Message.error(this.$t(`basic.tip['${d.code}']`, {
          message: d.code || d.message
        }));
      }).catch(e => {
        this.$Message.error(e.toString());
      }).finally(() => {
        // 清除与账户相关的数据
        account_storage.clearAll();

        signout_msg();

        this.$store.dispatch('signout').then(() => {
          this.$router.push('/');
        });
      });
    },
    /**
     * 获取主题
     * @returns {Promise<void>}
     */
    async getTheme() {
      let theme = await storage.get('theme');

      if (theme.data && theme.data.value) {
        await this.$store.dispatch('setTheme', theme.data.value);
        return;
      }

      await this.$store.dispatch('setTheme', this.$store.state.$theme);
    },
    /**
     * 改变主题
     * @param {number} index
     */
    changeTheme(index) {
      storage.set('theme', this.themes.child[index || 0]);

      location.reload();
    },
    navigatorTo(i) {
      this.headerMenu.show = false;
      this.$router.push({name: i.to.name, query: i.to.query});
    }
  },
  computed: {
    userinfo() {
      return this.currentUser.userinfo || {}
    },
    title() {
      return document.title || 'APP';
    }
  }
})
</script>

<style lang="less">
@import "@/assets/css/index";

header {
  -webkit-app-region: drag;
  z-index: 1000;
  width: 100%;
  height: auto;
  padding: 10px 15px !important;
  background-image: linear-gradient(rgba(0, 0, 0, 0.2), transparent);
}

.header-drawer {
  .header-drawer-body {
    margin: -16px;

    .ivu-list-item div,
    .widget-banner-body {
      padding: 10px 15px;
    }
  }
}

.header-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.hedaer-theme-color {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 27px;
  height: 27px;
  border-radius: 3px;

  .ivu-icon {
    opacity: .1;
  }
}

.hedaer-theme-color.right-space {
  margin-right: 10px;
}

.header-dropdown-menu {
  min-width: 280px !important;
}

.header-dropdown-avatar {
  width: 100%;
  padding: 30px 16px;
  clear: both;
  font-size: 14px !important;
  white-space: nowrap;
  text-align: center;

  .header-dropdown-name {
    margin: 5px 0 2px 0;
    font-size: 1.5rem;
  }

  .header-dropdown-id {
    font-weight: 400;
    margin: 0 0 5px 0;
    font-size: 10px;
    opacity: .5;
  }
}

.nav {
  display: flex;
  align-items: center;
  padding: 0 .4rem;

  a.link {
    font-weight: bold;
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
