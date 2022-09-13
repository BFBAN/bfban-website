<template>
  <div class="container">
    <br>
    <Row>
      <Col :xs="{push: 1}" :lg="{push: 0}">
        <Breadcrumb>
          <BreadcrumbItem :to="{name: 'home'}">{{ $t("header.index") }}</BreadcrumbItem>
          <BreadcrumbItem>{{ $t("header.profile") }}</BreadcrumbItem>
        </Breadcrumb>
      </Col>
    </Row>
    <br>

    <Card dis-hover :padding="0">
      <Form label-position="top" class="profile-header">
        <Row :gutter="15">
          <Col>
            <Avatar :size="48">{{ currentUser.userinfo.username[0] }}</Avatar>
          </Col>
          <Col flex="1">
            <h3> {{ currentUser.userinfo.username }} </h3>
            <p>{{ $t('profile.meet', {name: currentUser.userinfo.username}) }} ({{ currentUser.userinfo.userId }})</p>
          </Col>
          <Col v-if="currentUser.userinfo.privilege">
            <p><b>{{ $t('profile.account.form.privilege') }}</b></p>
            <PrivilegesTag :data="currentUser.userinfo.privilege"></PrivilegesTag>
          </Col>
        </Row>
      </Form>
      <div class="profile-header-divider ivu-divider ivu-divider-horizontal"></div>
      <Row>
        <Col :xs="{span: 24}" :sm="{span: 6}">
          <Menu class="profile-menu" :mode="isMobile ? 'horizontal' : 'vertical'" :open-names="openMuen" :active-name="menuValue" @on-select="onMenuActive">
            <div v-for="(i, index) in menu" :key="index">
              <MenuItem :name="j.name" v-for="(j, j_index) in i.child" :key="j_index">
                <Row :gutter="10">
                  <Col flex="1" :style="j.configurationKey ? `opacity:${!j.configurationValue ? '.3' : '1'}` : ''">
                    <Icon :type="j.icon" v-if="j.icon" size="20" /> {{ $t(`profile.${j.title}.title`)}}
                  </Col>
                  <Col>
                    <Checkbox @on-change="switchAttr(j.configurationKey, j.configurationValue)"
                              v-model="j.configurationValue"
                              v-if="j.configurationKey"></Checkbox>
                  </Col>
                </Row>
              </MenuItem>
            </div>
            <MenuGroup>
              <MenuItem name="userCenter" :to="{name: 'account', params: { uId: `${currentUser.userinfo.userId }` }}">
                  {{ $t("header.userCenter") }}
                  <Icon type="ios-link"/>
              </MenuItem>
              <MenuItem name="admin" v-if="isAdmin" :to="{name: 'admin'}">
                  {{ $t("profile.admin.title") }}
                  <Icon type="ios-link"/>
              </MenuItem>
            </MenuGroup>
          </Menu>
        </Col>
        <Col :xs="{span: 24}" :sm="{span: 18}" class="profile-right-content">
          <account v-if="menuValue == 'account'"></account>
          <appearance v-if="menuValue == 'appearance'"></appearance>
          <message v-if="menuValue == 'message'"></message>
          <enhance v-if="menuValue == 'enhance'"></enhance>
          <media v-if="menuValue == 'media'"></media>
          <history v-if="menuValue == 'history'"></history>
          <subscribes v-if="menuValue == 'subscribes'"></subscribes>
        </Col>
      </Row>
    </Card>
  </div>
</template>

<script>
import PrivilegesTag from "/src/components/PrivilegesTag";

import appearance from "./appearance";
import account from "./account";
import message from "./message";
import enhance from "./enhance";
import media from "./media";
import history from "./history";
import subscribes from "./subscribes"
import {account_storage} from "@/assets/js";

export default {
  name: "profile",
  data() {
    return {
      privileges: [],
      openMuen: ['0'],
      menuValue: 'account',
      menu: [
        {
          title: "基础",
          name: "0",
          child: [{
            title: 'account',
            name: 'account',
            icon: 'md-person'
          }, {
            title: 'appearance',
            name: 'appearance',
            icon: 'ios-color-palette'
          },
          {
            title: 'message',
            name: 'message',
            icon: 'md-mail'
          },
          {
            title: 'enhance',
            name: 'enhance',
            icon: 'md-code-download'
          },
          {
            title: 'media',
            name: 'media',
            icon: 'ios-videocam'
          },
          {
            title: 'history',
            name: 'history',
            icon: 'md-filing',
            configurationKey: 'history',
            configurationValue: this.$store.state.configuration.history || false,
          },
          {
            title: 'subscribes',
            name: 'subscribes',
            icon: 'md-notifications',
            configurationKey: 'subscribes',
            configurationValue: this.$store.state.configuration.subscribes || false,
          }]
        },
      ]
    }
  },
  components: {appearance, account, message, enhance, media, history, subscribes, PrivilegesTag},
  created() {
    const {pagename} = this.$route.params;

    if (pagename == undefined) {
      this.onMenuActive('account');
      return;
    }

    this.onMenuActive(pagename);
  },
  methods: {
    onMenuActive (val) {
      this.menuValue = val;
      this.$router.push({name: 'profile', params: {pagename: val}})
    },
    switchAttr(key, val) {
      account_storage.updateConfiguration(key, val);
    }
  },
  computed: {
    isLogin() {
      return Boolean(this.$store.state.user);
    },
    isAdmin() {
      let isBool = false;
      const user = this.$store.state.user.userinfo;
      const adminGroup = ['root', 'admin', 'super', 'dev']
      for (const i of adminGroup) {
        for (const j of user.privilege){
          if (j == i)
            isBool = true;
        }
      }
      return Boolean(isBool);
    },
    isMobile() {
      let flag = navigator.userAgent.match(/(phone|pad|pod|iPhone|iPod|ios|iPad|Android|Mobile|BlackBerry|IEMobile|MQQBrowser|JUC|Fennec|wOSBrowser|BrowserNG|WebOS|Symbian|Windows Phone)/i)
      return !!flag;
    },
    currentUser() {
      return this.$store.state.user;
    },
  }
}
</script>

<style lang="less" scoped>
 .profile-menu {
   height: 100%;

   .ivu-icon {
      opacity: .6;
   }
 }

 .profile-header {
   padding: 15px 20px;
 }

 .profile-header-divider {
   margin: 0 !important;
   opacity: .2;
 }

 .profile-right-content {
   padding: 10px 20px;
 }
</style>
