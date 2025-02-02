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
      <Row>
        <Col :xs="{span: 24}" :sm="{span: 6}">
          <Menu class="profile-menu" width="100%" :mode="isMobile ? 'horizontal' : 'vertical'"
                :active-name="menuValue" @on-select="onMenuActive">
            <div v-for="(i, index) in menu" :key="index">
              <MenuItem :name="j.name" v-for="(j, j_index) in i.child" :key="j_index">
                <Row :gutter="10">
                  <Col flex="1" :style="j.configurationKey ? `opacity:${!j.configurationValue ? '.3' : '1'}` : ''">
                    <Icon :type="j.icon" v-if="j.icon" size="20"/>
                    {{ $t(`profile.${j.title}.title`) }}
                  </Col>
                  <Col>
                    <Checkbox @on-change="onChangeSwitchFunction(j.configurationKey, j.configurationValue)"
                              v-model="j.configurationValue"
                              v-if="j.configurationKey"
                              :disabled="j.disabled"></Checkbox>
                  </Col>
                </Row>
              </MenuItem>
            </div>
            <MenuGroup>
              <MenuItem :to="{name: 'space', params: { uId: `${currentUser.userinfo.userId }` }}">
                {{ $t("header.userCenter") }}
                <Icon type="ios-link"/>
              </MenuItem>
              <MenuItem v-if="isAdmin" :to="{name: 'workflow'}">
                {{ $t("workflow.title") }}
                <Icon type="ios-link"/>
              </MenuItem>
              <MenuItem v-if="isAdmin" :to="{name: 'admin', params: { pagename: 'home' }}">
                {{ $t("profile.admin.title") }}
                <Icon type="ios-link"/>
              </MenuItem>
            </MenuGroup>
          </Menu>
        </Col>
        <Col :xs="{span: 24}" :sm="{span: 18}" class="profile-right-content">
          <information v-if="menuValue == 'information'"></information>
          <achievement v-if="menuValue == 'achievement'"></achievement>
          <reports v-if="menuValue == 'reports'"></reports>
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
import {account_storage, application} from "@/assets/js";

import achievement from "./achievement"
import reports from "./userReports";
import appearance from "./appearance";
import information from "./information";
import chat from "./chat";
import enhance from "./enhance";
import media from "./media";
import voice from "./voice";
import history from "./history";
import subscribes from "./subscribes"

import PrivilegesTag from "@/components/PrivilegesTag";
import exportAndImport from "@/views/account/exportAndImport";
import UserAvatar from "@/components/UserAvatar";

export default new application({
  name: "profile",
  data() {
    return {
      privileges: [],
      menuValue: 'space',
      menu: [
        {
          name: "0",
          child: [{
            title: 'space',
            name: 'information',
            icon: 'md-person'
          }, {
            title: 'reports',
            name: 'reports',
            icon: 'ios-hand'
          }, {
            title: 'achievement',
            name: 'achievement',
            icon: 'md-ribbon'
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
    achievement,
    reports,
    appearance,
    information,
    chat,
    enhance,
    media,
    voice,
    history,
    subscribes,
    exportAndImport,
    PrivilegesTag,
    UserAvatar
  },
  watch: {
    '$route': {
      handler(val, oldVal) {
        const {pagename = 'space'} = val.params;
        if (!oldVal) return;
        this.onMenuActive(pagename);
      },
    }
  },
  created() {
    const {pagename = 'space'} = this.$route.params;
    this.onMenuActive(pagename);
  },
  methods: {
    /**
     * 激活对应子页面
     * @param val
     */
    onMenuActive(val) {
      this.menuValue = val;
      this.$router.push({name: 'profile', params: {pagename: val}, query: {...this.$router.query}})
    },
    /**
     * 更改账户配置
     * @param key
     * @param val
     */
    onChangeSwitchFunction(key, val) {
      account_storage.updateConfiguration(key, val);
    }
  },
})
</script>

<style lang="less">
.profile-menu {
  height: 100%;

  .ivu-icon {
    opacity: .6;
  }
}

.profile-header {
  padding: 15px 20px;
}

.profile-right-content {
  .profile-divider {
    height: 1px;
    margin: 5px 0;
    opacity: .3;
  }

  .profile-body {
    padding: 10px 20px;
  }
}
</style>
