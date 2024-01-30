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
          <Menu class="admin-menu"
                :mode="isMobile ? 'horizontal' : 'vertical'"
                :width="isMobile ? null : '100%'"
                :open-names="openMuen"
                :active-name="adminMenuValue" @on-select="onMenuActive">

            <MenuItem name="home">
              {{ $t('profile.admin.menu.home') }}
            </MenuItem>

            <MenuGroup :title="isMobile ? null : $t('profile.admin.menu.' + i.title)" v-for="(i, index) in adminMuen"
                       :key="index">
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
            <blockedUsers v-else-if="adminMenuValue == 'blockedUsers'"></blockedUsers>
            <muteUsers v-else-if="adminMenuValue == 'muteUsers'"></muteUsers>

            <verifications v-else-if="adminMenuValue == 'verifications'"></verifications>
            <comment v-else-if="adminMenuValue == 'comment'"></comment>

            <chatPush v-else-if="adminMenuValue == 'chat_push'"></chatPush>
            <chatList v-else-if="adminMenuValue == 'chat_list'"></chatList>

            <fileList v-else-if="adminMenuValue == 'file_list'"></fileList>

            <adminOperationLog v-else-if="adminMenuValue == 'admin_operation_log'"></adminOperationLog>
            <messageLog v-else-if="adminMenuValue == 'message_Log'"></messageLog>
            <adminOperation v-else-if="adminMenuValue == 'adminOperation'"></adminOperation>
            <judgementLog v-else-if="adminMenuValue == 'judgement_log'"></judgementLog>
          </keep-alive>
        </Col>
      </Row>
    </Card>
  </div>
</template>

<script>
import Application from "@/assets/js/application";

import user from "./user"
import blockedUsers from "@/views/admin/blockedUsers";
import muteUsers from "@/views/admin/muteUsers";
import comment from "./comment"
import verifications from "@/views/admin/verifications";
import adminOperationLog from "./adminSystemOperationLog"
import judgementLog from "@/views/admin/judgementLog";
import adminOperation from "@/views/admin/adminCommentOperationLog";
import chatPush from "@/views/admin/chatPush";
import chatList from "@/views/admin/chatList";
import fileList from "@/views/admin/file.vue"
import PrivilegesTag from "@/components/PrivilegesTag";

import {account_storage} from "@/assets/js";

export default new Application({
  name: "profile",
  data() {
    return {
      privileges: [],
      openMuen: ['comment', 'comm', 'log'],
      adminMenuValue: 'home',
      adminMuen: [
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
              title: 'blockedUsers',
              value: 'blockedUsers',
              disabled: false,
              privilege: ['super', 'root', 'dev'],
            },
            {
              title: 'muteUsers',
              value: 'muteUsers',
              disabled: false,
              privilege: ['admin', 'super', 'root', 'dev'],
            },
            {
              title: 'comment',
              value: 'comment',
              disabled: false,
              privilege: ['super', 'root', 'dev'],
            },
            {
              title: 'verifications',
              value: 'verifications',
              disabled: false,
              privilege: ['root', 'dev'],
            }
          ]
        },
        {
          title: 'fileManagement',
          child: [
            {
              title: 'files',
              value: 'file_list',
              disabled: false,
              privilege: ['root', 'dev'],
            },
          ]
        },
        {
          title: 'messageManagement',
          child: [
            {
              title: 'messagePush',
              value: 'chat_push',
              disabled: false,
              privilege: ['admin', 'super', 'root', 'dev'],
            },
            {
              title: 'messageList',
              value: 'chat_list',
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
              title: 'judgementLog',
              value: 'judgement_log',
              disabled: false,
              privilege: ['super', 'root', 'dev'],
            },
            {
              title: 'adminOperationLog',
              value: 'admin_operation_log',
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
  components: {
    user,
    blockedUsers,
    muteUsers,
    verifications,
    comment,
    adminOperationLog,
    judgementLog,
    chatPush,
    chatList,
    PrivilegesTag,
    adminOperation,
    fileList
  },
  created() {
    const {pagename} = this.$route.params;

    if (pagename == undefined) {
      this.onMenuActive('space');
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
@media screen and (min-width: 980px) {
  .admin-menu,
  .admin {
    min-height: 500px;
  }

  .admin-menu {
    height: 100%;
  }
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
