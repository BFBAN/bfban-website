<template>
  <div class="container">
    <br>
    <Row>
      <Col :xs="{push: 1}" :lg="{push: 0}">
        <Breadcrumb>
          <BreadcrumbItem :to="{name: 'home'}">{{ $t("header.index") }}</BreadcrumbItem>
          <BreadcrumbItem :to="{name: 'profile', params: {pagename: 'information'}}">{{
              $t("header.profile")
            }}
          </BreadcrumbItem>
          <BreadcrumbItem>{{ $t("profile.admin.title") }}</BreadcrumbItem>
        </Breadcrumb>
      </Col>
    </Row>
    <br>

    <Card dis-hover :padding="0" class="admin">
      <Row :gutter="0">
        <Col :xs="{span: 24}" :sm="{span: 6}">
          <Menu class="admin-menu" :mode="isMobile ? 'horizontal' : 'vertical'" :open-names="openMuen"
                :active-name="adminMenuValue" @on-select="onMenuActive">
            <MenuItem name="home">
              {{ $t('profile.admin.menu.home') }}
            </MenuItem>

            <MenuGroup :title="$t('profile.admin.menu.' + i.title)" v-for="(i, index) in adminMuen" :key="index">
              <MenuItem :name="j.value" v-for="(j, j_index) in i.child" :key="j_index" v-show="j.disabled">
                <Row>
                  <Col flex="1">
                    <Icon :type="j.icon" v-if="j.icon"/>
                    {{ $t('profile.admin.menu.' + j.title) }}
                  </Col>
                  <Col v-if="!j.ignore">
                    <Poptip trigger="hover" transfer>
                      <Icon type="md-help-circle"/>
                      <PrivilegesTag :data="j.privilege" slot="content"></PrivilegesTag>
                    </Poptip>
                  </Col>
                </Row>
              </MenuItem>
            </MenuGroup>
          </Menu>
        </Col>
        <Col :xs="{span: 24}" :sm="{span: 18}" style="padding: 20px">
          <keep-alive>
            <div v-if="adminMenuValue == 'home'" class="admin-content">
              <h1>{{ currentUser.userinfo.username }}</h1>
              <p>({{ currentUser.userinfo.userId }})</p>
              <br>
              <p>
                <PrivilegesTag :data="currentUser.userinfo.privilege"></PrivilegesTag>
              </p>
            </div>
            <user v-else-if="adminMenuValue == 'user'"></user>
            <comment v-else-if="adminMenuValue == 'comment'"></comment>
            <log v-else-if="adminMenuValue == 'admin_log'"></log>
            <messageLog v-else-if="adminMenuValue == 'message_Log'"></messageLog>
            <adminOperation v-else-if="adminMenuValue == 'adminOperation'"></adminOperation>
            <messagePush v-else-if="adminMenuValue == 'message_push'"></messagePush>
            <messageList v-else-if="adminMenuValue == 'message_list'"></messageList>
          </keep-alive>
        </Col>
      </Row>
    </Card>
  </div>
</template>

<script>
import BFBAN from "@/assets/js/bfban";

import user from "./user"
import comment from "./comment"
import log from "./log"
import judgementLog from "@/views/admin/judgementLog";
import adminOperation from "@/views/admin/adminOperation";
import messagePush from "@/views/admin/messagePush";
import messageList from "@/views/admin/messageList";
import PrivilegesTag from "@/components/PrivilegesTag";

import {account_storage} from "@/assets/js";

export default new BFBAN({
  name: "profile",
  data() {
    return {
      privileges: [],
      openMuen: ['comment', 'comm', 'log'],
      adminMenuValue: 'home',
      adminMuen: [
        // {
        //   title: 'welcome',
        //   child: [
        //     {
        //       title: 'home',
        //       value: 'home',
        //       ignore: true
        //     }
        //   ]
        // },
        {
          title: 'management',
          child: [
            {
              title: 'user',
              value: 'user',
              disabled: false,
              privilege: ['super', 'root', 'dev'],
            },
            {
              title: 'comment',
              value: 'comment',
              disabled: false,
              privilege: ['super', 'root', 'dev'],
            }
          ]
        },
        {
          title: 'messageManagement',
          child: [
            {
              title: 'messagePush',
              value: 'message_push',
              disabled: false,
              privilege: ['super', 'root', 'dev'],
            },
            {
              title: 'messageList',
              value: 'message_list',
              disabled: false,
              privilege: ['super', 'root', 'dev'],
            }
          ]
        },
        {
          title: 'log',
          icon: 'ios-paper',
          child: [
            {
              title: 'adminLog',
              value: 'admin_log',
              disabled: false,
              privilege: ['super', 'root', 'dev'],
            },
            {
              title: 'judgementLog',
              value: 'judgement_log',
              disabled: false,
              privilege: ['super', 'root', 'dev'],
            },
            {
              title: 'adminOperation',
              value: 'adminOperation',
              disabled: false,
              privilege: ['super', 'root', 'dev'],
            }
          ]
        }
      ]
    }
  },
  components: {user, comment, log, judgementLog, messagePush, messageList, PrivilegesTag, adminOperation},
  created() {
    const {pagename} = this.$route.params;

    if (pagename == undefined) {
      this.onMenuActive('account');
      return;
    }

    for (let i = 0; i < this.adminMuen.length; i++) {
      if (this.adminMuen[i].child)
        for (let j = 0; j < this.adminMuen[i].child.length; j++) {
          if (!this.adminMuen[i].ignore)
            this.adminMuen[i].child[j].disabled = account_storage.checkPrivilegeGroup(
                this.currentUser.userinfo,
                this.adminMuen[i].child[j].privilege
            )
        }
    }


    this.onMenuActive(pagename);
  },
  methods: {
    onMenuActive(name) {
      this.adminMenuValue = name;
      this.$router.push({name: 'admin', params: {pagename: name}})
    }
  },
  computed: {}
})
</script>

<style lang="less" scoped>
.admin-menu,
.admin {
  min-height: 500px;
}

.admin-menu {
  height: 100%;
}

.admin-content {
  height: 100%;
  padding: 20px 0;
  text-align: center;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
}
</style>