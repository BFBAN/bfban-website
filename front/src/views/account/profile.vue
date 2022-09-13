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
      <Row>
        <Col :xs="{span: 24}" :sm="{span: 6}">
          <Menu class="profile-menu" :open-names="openMuen" :active-name="menuValue" @on-select="onMenuActive">
            <div v-for="(i, index) in menu" :key="index">
              <MenuItem :name="j.name" v-for="(j, j_index) in i.child" :key="j_index">
                <Icon :type="j.icon" v-if="j.icon" />  {{ $t(`profile.${j.title}.title`)}}
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
          }, {
            title: 'appearance',
            name: 'appearance'
          },
          {
            title: 'message',
            name: 'message'
          },
          {
            title: 'enhance',
            name: 'enhance'
          },
          {
            title: 'media',
            name: 'media'
          },
          {
            title: 'history',
            name: 'history'
          },
          {
            title: 'subscribes',
            name: 'subscribes'
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
    },
  },
  computed: {
    isLogin() {
      return Boolean(this.$store.state.user);
    },
    isAdmin() {
      const user = this.$store.state.user;
      const is = user ? user.userinfo.privilege.concat("").includes("admin") : false;
      return Boolean(is);
    },
    currentUser() {
      return this.$store.state.user;
    }
  }
}
</script>

<style scoped>
 .profile-menu {
   height: 100%;
   min-height: 300px;
 }

 .profile-header {
   padding: 15px 20px;
 }

 .profile-right-content {
   padding: 10px 20px;
 }
</style>
