<template>
  <div class="container">
    <br>
    <Row>
      <Col :xs="{push: 1}" :lg="{push: 0}">
        <Breadcrumb>
          <BreadcrumbItem :to="{name: 'home'}">{{ $t("header.index") }}</BreadcrumbItem>
          <BreadcrumbItem :to="{name: 'profile', params: {pagename: 'account'}}">{{ $t("header.profile") }}</BreadcrumbItem>
          <BreadcrumbItem>{{ $t("admin.title") }}</BreadcrumbItem>
        </Breadcrumb>
      </Col>
    </Row>
    <br>

    <Card dis-hover :padding="0" class="admin">
      <Row :gutter="0">
        <Col :xs="{span: 24}" :sm="{span: 6}">
          <Menu class="admin-menu" :open-names="openMuen" :active-name="adminMenuValue" @on-select="onMenuActive">
            <MenuGroup :title="i.title" v-for="(i, index) in adminMuen" :key="index">
              <MenuItem :name="j.value" v-for="(j, j_index) in i.child" :key="j_index">
                <Icon :type="j.icon" v-if="j.icon" />  {{j.title}}
              </MenuItem>
            </MenuGroup>
          </Menu>
        </Col>
        <Col :xs="{span: 24}" :sm="{span: 18}" style="padding: 20px">
          <user v-if="adminMenuValue == 'user'"></user>
          <comment v-else-if="adminMenuValue == 'comment'"></comment>
          <log v-else-if="adminMenuValue == 'admin_log'"></log>
        </Col>
      </Row>
    </Card>
  </div>
</template>

<script>
import user from "./user"
import comment from "./comment"
import log from "./log"

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
            title: 'User',
            value:'user',
          },
          {
            title: 'Comment',
            value: 'comment',
            // icon: 'ios-paper'
          }]
        },
        {
          title: 'log',
          icon: 'ios-paper',
          child: [
            {
              title: 'admin log',
              value: 'admin_log'
            }
          ]
        }
      ]
    }
  },
  components: {user, comment , log},
  created() {
    const pagename = this.$route.params.pagename;

    // let name = this.muen.filter(
    //     i => {
    //       return i.title.toLocaleLowerCase() == pagename;
    //     }
    // )[0].value;
  },
  methods: {
    onMenuActive(name) {
      this.adminMenuValue = name;
    }
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

.admin-menu,
.admin {
  min-height: 500px;
}

.admin-menu {
  height: 100%;
}
</style>