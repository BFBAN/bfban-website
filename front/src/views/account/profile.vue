<template>
  <div class="container">
    <br>
    <Breadcrumb>
      <BreadcrumbItem to="/">{{ $t("header.index") }}</BreadcrumbItem>
      <BreadcrumbItem>{{ $t("header.profile") }}</BreadcrumbItem>
    </Breadcrumb>
    <br>

    <Card shadow>
      <Row :gutter="15">
        <Col>
          <Avatar :size="48">{{currentUser.userinfo.username[0]}}</Avatar>
        </Col>
        <Col>
          <h3>{{currentUser.userinfo.username}}</h3>
          <p>欢迎来到BFBAN</p>
        </Col>
      </Row>
      <br>
      <Row :gutter="30">
        <Col span="6">
          <List border size="small">
            <ListItem v-for="(i, index) in muen" :key="i.value">
              <a @click="muenIndex = index">{{i.title}}</a>
            </ListItem>
          </List>
          <br>
          <List border size="small">
            <ListItem>
              <router-link :to="{name: 'account', params: { uId: `${currentUser.userinfo.userId}` }}">
                {{$t("header.userCenter")}}
              </router-link>
            </ListItem>
          </List>
        </Col>
        <Col span="18">
          <account v-show="muenIndex == 0"></account>
          <appearance v-show="muenIndex == 1"></appearance>
        </Col>
      </Row>
    </Card>
    <br>
  </div>
</template>

<script>
import appearance from "./appearance";
import account from "./account";

export default {
  name: "profile",
  data () {
    return {
      muenIndex: 0,
      muen: [{
        title: 'Account',
        value: '0'
        },
        {
        title: 'Appearance',
        value: '1'
      }]
    }
  },
  components: {appearance, account},
  computed: {
    isLogin() {
      return Boolean(this.$store.state.user);
    },
    isAdmin() {
      const user = this.$store.state.user;

      const is = user ? user.userPrivilege !== 'normal' : false;
      return Boolean(is);
    },
    currentUser() {
      return this.$store.state.user;
    }
  }
}
</script>

<style scoped>

</style>
