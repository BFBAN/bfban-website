<template>
  <div class="container">
    <br>
    <Row>
      <Col :xs="{push: 1}" :lg="{push: 0}">
        <Breadcrumb>
          <BreadcrumbItem :to="{name: 'home'}">{{ $t("header.index") }}</BreadcrumbItem>
          <BreadcrumbItem :to="{name: 'profile', params: {pagename: 'account'}}">{{ $t("header.profile") }}</BreadcrumbItem>
          <BreadcrumbItem>{{ $t("profile.admin.title") }}</BreadcrumbItem>
        </Breadcrumb>
      </Col>
    </Row>
    <br>

    <Card dis-hover :padding="0" class="admin">
      <Row :gutter="0">
        <Col :xs="{span: 24}" :sm="{span: 6}">
          <Menu class="admin-menu" :open-names="openMuen" :active-name="adminMenuValue" @on-select="onMenuActive">
            <MenuGroup :title="$t('profile.admin.menu.' + i.title)" v-for="(i, index) in adminMuen" :key="index">
              <MenuItem :name="j.value" v-for="(j, j_index) in i.child" :key="j_index">
                <Icon :type="j.icon" v-if="j.icon" />  {{ $t('profile.admin.menu.' + j.title)}}
              </MenuItem>
            </MenuGroup>
          </Menu>
        </Col>
        <Col :xs="{span: 24}" :sm="{span: 18}" style="padding: 20px">
          <user v-if="adminMenuValue == 'user'"></user>
          <comment v-else-if="adminMenuValue == 'comment'"></comment>
          <log v-else-if="adminMenuValue == 'admin_log'"></log>
          <judgementLog v-else-if="adminMenuValue == 'judgement_log'"></judgementLog>
        </Col>
      </Row>
    </Card>
  </div>
</template>

<script>
import user from "./user"
import comment from "./comment"
import log from "./log"
import judgementLog from "@/views/admin/judgementLog";

export default {
  name: "profile",
  data() {
    return {
      privileges: [],
      openMuen: ['comment','comm', 'log'],
      adminMenuValue: 'user',
      adminMuen: [
        {
          title: 'management',
          child: [{
            title: 'user',
            value:'user',
          },
          {
            title: 'comment',
            value: 'comment',
            // icon: 'ios-paper'
          }]
        },
        {
          title: 'log',
          icon: 'ios-paper',
          child: [
            {
              title: 'adminLog',
              value: 'admin_log'
            },
            {
              title: 'judgementLog',
              value: 'judgement_log'
            }
          ]
        }
      ]
    }
  },
  components: {user, comment , log,judgementLog},
  methods: {
    onMenuActive(name) {
      this.adminMenuValue = name;
      this.$router.push({name: 'admin', params: {pagename: name}})
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
    currentUser() {
      return this.$store.state.user;
    }
  }
}
</script>

<style scoped>

.admin-menu,
.admin {
  min-height: 500px;
}

.admin-menu {
  height: 100%;
}
</style>