<template>
  <header v-if="!isFull">
    <!-- 临时通知 S -->
    <!-- TODO 过期请删除 -->
    <a href="https://announcement.bfban.com/precepts/anti-cheat-v4" target="_blank">
      <Card :padding="0" dis-hover
            style="padding: 3px 20px; margin: -11px -20px -1px; text-align: center; background: darkred; color: white">
        {{
          {
            'zh-CN': '我们已更新《反作弊准则》,前往查看',
            'en-US': 'We have updated the new 《Anti-Cheating precepts》, go to view them.',
          }[$i18n.locale] || 'We have updated the new 《Anti-Cheating precepts》, go to view them.'
        }}
      </Card>
    </a>
    <Lantern></Lantern>
    <!-- 临时通知 E -->

    <div class="header-container">
      <Row class-name="header-nav mobile-hide" type="flex" align="middle">
        <Col type="flex" align="middle">
          <router-link :to="{name: 'home'}">
            <img src="../assets/images/logo.png"
                 class="logo"
                 width="40px"
                 height="40px"
                 :alt="`${$t('name')} logo`"/>
          </router-link>
        </Col>
        <Col>
          <router-link :to="{name: 'home'}" class="link">
            {{ $t("name") }}
          </router-link>
        </Col>
      </Row>
      <div class="header-nav header-nav-menu">
        <Icon class="desktop-hide" type="md-menu" size="30" @click="headerMenu.show = !headerMenu.show "/>
        <Drawer class="desktop-hide header-drawer"
                placement="left"
                width="80%"
                :title="$t('name')"
                :closable="true"
                v-model="headerMenu.show">

          <List split class="header-drawer-body">
            <Banner :height="150">
              <template v-if="!isLogin">
                <Card>
                  <Row :gutter="10">
                    <Col flex="1">
                      <div @click="() => navigatorTo({to: {name: 'signin'}})">
                        <Icon type="md-log-in" size="20"/>
                        {{ $t("header.signin") }}
                      </div>
                    </Col>
                    <Col>
                      <div @click="() => navigatorTo({to: {name: 'signup'}})">
                        <Icon type="md-person-add" size="20"/>
                        {{ $t("header.signup") }}
                      </div>
                    </Col>
                  </Row>
                </Card>
              </template>
              <template v-else>
                <h2>{{ userinfo.username }}</h2>
              </template>
            </Banner>

            <ListItem v-for="(i, index) in headerMenu.child" :key="index" @click.native.stop="navigatorTo(i)">
              <div>
                {{ $t(`header.${i.name}`) }}
              </div>
            </ListItem>
          </List>
        </Drawer>

        <div v-for="(i, index) in headerMenu.child" :key="index">
          <template v-if="i.to">
            <router-link class="mobile-hide link"
                         :to="i.to">
              {{ $t(`header.${i.name}`) }}
            </router-link>
          </template>
          <template v-else>
            <a class="mobile-hide link" :href="i.href" @click="navigatorTo(i)">
              {{ $t(`header.${i.name}`) }}
            </a>
          </template>
        </div>

      </div>
      <div class="header-nav">
        <Button type="primary" v-show="!isLogin" class="mobile-hide" :to="{name: 'signin'}"
                icon="md-log-in"
                v-if="$route.name !== 'signin'">
          {{ $t("header.signin") }}
        </Button>

        <Dropdown v-if="isLogin"
                  :trigger="isMobile ? 'click' : 'hover'"
                  :placement="isMobile ? 'bottom' : 'bottom-end'"
                  :padding="0">
          <UserAvatar :src="userinfo.userAvatar" :size="30"></UserAvatar>

          <DropdownMenu slot="list" class="header-account-menu">
            <div class="header-account-menu-info">
              <div>
                <UserAvatar :src="userinfo.userAvatar" :size="80"></UserAvatar>
                <p class="user-name">{{ userinfo.username }}</p>
                <p class="user-id">{{ userinfo.userId }}</p>
              </div>
              <PrivilegesTag :data="userinfo.privilege"></PrivilegesTag>
            </div>
            <router-link :to="{name: 'space', params: { uId: `${userinfo.userId}` }}">
              <DropdownItem divided :disabled="$route.name === 'space' && userinfo.userId === this.$route.params.uId">
                {{ $t("header.userCenter") }}
              </DropdownItem>
            </router-link>
            <router-link :to="{name: 'report'}">
              <DropdownItem :disabled="$route.name === 'report'">
                {{ $t("header.report") }}
              </DropdownItem>
            </router-link>
            <router-link :to="{name: 'profile', params: {pagename: 'information'}}">
              <DropdownItem :disabled="$route.name === 'profile'">
                {{ $t("header.profile") }}
              </DropdownItem>
            </router-link>
            <router-link :to="{name: 'admin', params: {pagename: 'home'}}" v-if="isAdmin">
              <DropdownItem :disabled="$route.name === 'admin'">
                {{ $t("profile.admin.title") }}
              </DropdownItem>
            </router-link>
            <router-link :to="{name: 'workflow'}" v-if="isAdmin">
              <DropdownItem :disabled="$route.name === 'workflow'">
                <Row>
                  <Col flex="1">{{ $t("workflow.title") }}</Col>
                  <Col>
                    <Tag size="medium" :fade="false">Beta</Tag>
                  </Col>
                </Row>
              </DropdownItem>
            </router-link>
            <div @click="() => onAccountSignout()">
              <Dropdown-item divided v-show="isLogin">
                <Row class-name="ivu-btn-error ivu-btn-ghost">
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
        <ThemeWidget/>
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
import {account_storage, http_token, storage} from '../assets/js/index'
import menu from '/public/config/headerMenu.json'

import UserAvatar from "@/components/UserAvatar.vue";
import HistoryView from "@/components/HistoryView.vue";
import HeaderMessage from "./HeaderMessage.vue";
import PrivilegesTag from "@/components/PrivilegesTag";
import Application from "@/assets/js/application";
import Banner from "@/components/Banner.vue";
import ThemeWidget from "@/components/ThemeWidget"
import Lantern from "@/components/Lantern";
import {emojis as headerMenu} from "emoji-mart-vue";
import Http from "@/assets/js/http";

export default new Application({
  data() {
    return {
      headerMenu: {
        show: false,
        child: [],
      },
    }
  },
  components: {HistoryView, Banner, HeaderMessage, UserAvatar, PrivilegesTag, ThemeWidget, Lantern},
  watch: {
    $route: "loadData",
  },
  created() {
    this.http = http_token.call(this);
    this.headerMenu.child = menu.child;
  },
  methods: {
    async loadData() {
      await this.getTheme();
    },
    /**
     * 表头账户注销
     */
    async onAccountSignout() {
      let d;
      const signout_msg = this.$Message.loading({
        content: this.$i18n.t("header.signout"),
        duration: 0
      });

      try {
        const result = await account_storage.signout();
        d = result.d;

        this.$Message.success(this.$t(`basic.tip['${d.code}']`, {
          message: d.code || d.message
        }));
      } catch (e) {
        if (e instanceof Http)
          this.$Message.error(this.$t(`basic.tip['${d.code}']`, {
            message: d.code || d.message
          }));

        this.$Message.error(e.toString());
      } finally {
        signout_msg();

        this.$store.dispatch('signout').then(() => {
          this.$router.push('/');
        });
      }
    },
    /**
     * 获取主题
     * @returns {Promise<void>}
     */
    async getTheme() {
      let theme = storage.local.get('theme');

      if (theme.data && theme.data.value) {
        await this.$store.dispatch('setTheme', theme.data.value);
        return;
      }

      await this.$store.dispatch('setTheme', this.$store.state.$theme);
    },
    /**
     * 导航
     * @param i
     */
    navigatorTo(i) {
      this.headerMenu.show = false;

      if (i.to)
        this.$router.push({name: i.to.name, query: i.to.query});
      else if (i.href)
        window.location.href = i.href;
    }
  },
  computed: {
    userinfo() {
      return this.currentUser.userinfo || {}
    },
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
  min-height: 45px;

  .logo {
    border-radius: 50%;
    display: flex;
  }

  .header-account-menu {
    min-width: 280px !important;
  }

  .header-account-menu-info {
    width: 100%;
    padding: 30px 16px;
    clear: both;
    font-size: 14px !important;
    white-space: nowrap;
    text-align: center;

    .user-avatar {
      margin: 0 auto;
    }

    .user-name {
      margin: 5px 0 2px 0;
      font-size: 1.5rem;
    }

    .user-id {
      font-weight: 400;
      margin: 0 0 5px 0;
      font-size: 12px;
      opacity: .5;
    }
  }

  .header-nav {
    display: flex;
    align-items: center;
    padding: 0 .4rem;

    a.link {
      font-weight: bold;
      padding: .7rem .8rem;
      text-shadow: #fff 1px 0 0, #fff 0 1px 0, #fff -1px 0 0, #fff 0 -1px 0;
    }
  }

  .header-nav-menu {
    flex: 1;
  }

  .header-nav-username {
    text-overflow: ellipsis;
    white-space: nowrap;
    overflow: hidden;
    max-width: 6rem;
    flex-grow: 0;
  }

  @media screen and (min-width: 1088px) {
    .header-nav-username {
      width: 100%;
    }
  }
}
</style>
