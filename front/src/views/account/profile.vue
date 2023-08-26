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
            <a href="https://gravatar.com" target="_blank">
              <Avatar icon="ios-person" :size="48" :src="userinfo.userAvatar"></Avatar>
            </a>
          </Col>
          <Col flex="1">
            <h3> {{ userinfo.username }} </h3>
            <p>{{ $t('profile.meet', {name: userinfo.username}) }} ({{ userinfo.userId }})</p>
          </Col>
          <Col v-if="userinfo.privilege">
            <p><b>{{ $t('profile.account.form.privilege') }}</b></p>
            <PrivilegesTag :data="userinfo.privilege"></PrivilegesTag>
          </Col>
        </Row>
      </Form>
      <div class="profile-header-divider ivu-divider ivu-divider-horizontal"></div>
      <Row>
        <Col :xs="{span: 24}" :sm="{span: 6}">
          <Menu class="profile-menu" :mode="isMobile ? 'horizontal' : 'vertical'"
                :active-name="menuValue" @on-select="onMenuActive">
            <div v-for="(i, index) in menu" :key="index">
              <MenuItem :name="j.name" v-for="(j, j_index) in i.child" :key="j_index">
                <Row :gutter="10">
                  <Col flex="1" :style="j.configurationKey ? `opacity:${!j.configurationValue ? '.3' : '1'}` : ''">
                    <Icon :type="j.icon" v-if="j.icon" size="20"/>
                    {{ $t(`profile.${j.title}.title`) }}
                  </Col>
                  <Col>
                    <Checkbox @on-change="switchAttr(j.configurationKey, j.configurationValue)"
                              v-model="j.configurationValue"
                              :disabled="j.disabled"
                              v-if="j.configurationKey"></Checkbox>
                  </Col>
                </Row>
              </MenuItem>
            </div>
            <MenuGroup>
              <MenuItem name="userCenter" :to="{name: 'account', params: { uId: `${userinfo.userId }` }}">
                {{ $t("header.userCenter") }}
                <Icon type="ios-link"/>
              </MenuItem>
              <MenuItem name="admin" v-if="isAdmin" :to="{name: 'admin', params: { pagename: 'home' }}">
                {{ $t("profile.admin.title") }}
                <Icon type="ios-link"/>
              </MenuItem>
            </MenuGroup>
          </Menu>
        </Col>
        <Col :xs="{span: 24}" :sm="{span: 18}" class="profile-right-content">
          <information v-if="menuValue == 'information'"></information>
          <appearance v-if="menuValue == 'appearance'"></appearance>
          <chat v-if="menuValue == 'chat'"></chat>
          <enhance v-if="menuValue == 'enhance'"></enhance>
          <media v-if="menuValue == 'media'"></media>
          <voice v-if="menuValue == 'voice'"></voice>
          <history v-if="menuValue == 'history'"></history>
          <subscribes v-if="menuValue == 'subscribes'"></subscribes>
          <exportAndImport v-if="menuValue == 'exportAndImport'"></exportAndImport>
        </Col>
      </Row>
    </Card>
    <br>
  </div>
</template>

<script>
import PrivilegesTag from "/src/components/PrivilegesTag";

import appearance from "./appearance";
import information from "./information";
import chat from "./chat";
import enhance from "./enhance";
import media from "./media";
import voice from "./voice";
import history from "./history";
import subscribes from "./subscribes"
import exportAndImport from "@/views/account/exportAndImport";
import {account_storage} from "@/assets/js";
import Application from "@/assets/js/application";

export default new Application({
  name: "profile",
  data() {
    return {
      privileges: [],
      menuValue: 'account',
      menu: [
        {
          title: "基础",
          name: "0",
          child: [{
            title: 'account',
            name: 'information',
            icon: 'md-person'
          }, {
            title: 'appearance',
            name: 'appearance',
            icon: 'ios-color-palette'
          },
            {
              title: 'chat',
              name: 'chat',
              icon: 'md-mail'
            },
            {
              title: 'media',
              name: 'media',
              icon: 'md-folder'
            },
            {
              title: 'voice',
              name: 'voice',
              icon: 'md-musical-note',
              configurationKey: 'voice',
              configurationValue: this.$store.state.configuration.voice || false,
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
            },
            {
              title: 'enhance',
              name: 'enhance',
              icon: 'md-code-download',
              configurationKey: 'enhance',
              configurationValue: this.$store.state.configuration.enhance || false,
            },
            {
              title: 'exportAndImport',
              name: 'exportAndImport',
              icon: 'md-folder'
            }
          ]
        },
      ]
    }
  },
  components: {
    appearance,
    information,
    chat,
    enhance,
    media,
    voice,
    history,
    subscribes,
    exportAndImport,
    PrivilegesTag
  },
  created() {
    const {pagename} = this.$route.params;

    if (pagename == undefined) {
      this.onMenuActive('account');
      return;
    }

    this.onMenuActive(pagename);
  },
  methods: {
    onMenuActive(val) {
      this.menuValue = val;
      this.$router.push({name: 'profile', params: {pagename: val}})
    },
    switchAttr(key, val) {
      account_storage.updateConfiguration(key, val);
    }
  },
  computed: {
    userinfo() {
      return this.currentUser.userinfo || {}
    }
  }
})
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
