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

    <Card dis-hover>
      <Row>
        <Col flex="auto">
          <Row :gutter="15">
            <Col>
              <Avatar :size="48">{{ currentUser.userinfo.username[0] }}</Avatar>
            </Col>
            <Col>
              <h3>{{ currentUser.userinfo.username }}</h3>
              <p>{{ $t('profile.meet', {name: currentUser.userinfo.username}) }}</p>
            </Col>
          </Row>
        </Col>
        <Col>

        </Col>
      </Row>
      <br>
      <Row :gutter="30">
        <Col span="6">
          <List border size="small">
            <ListItem v-for="(i, index) in muen" :key="i.value">
              <a @click="upDateUri(index)">
                <b v-if="muen[index].value == muenIndex">
                  {{ $t("profile." + muen[i.value].title + ".title") }}
                </b>
                <span v-else>{{ $t("profile." + muen[i.value].title + ".title") }}</span>
              </a>
            </ListItem>
          </List>
          <br>
          <List border size="small">
            <ListItem>
              <router-link :to="{name: 'account', params: { uId: `${currentUser.userinfo.userId}` }}">
                {{ $t("header.userCenter") }}
              </router-link>
            </ListItem>
          </List>
          <br>

          <Divider>{{$t("home.bulletin.title")}}</Divider>
          <Bulletin/>
        </Col>
        <Col span="18">
          <account v-if="muenIndex == 0"></account>
          <appearance v-if="muenIndex == 1"></appearance>
          <message v-if="muenIndex == 2"></message>
          <enhance v-if="muenIndex == 3"></enhance>
        </Col>
      </Row>
    </Card>
    <br>
  </div>
</template>

<script>
import Bulletin from "../../components/Bulletin";

import appearance from "./appearance";
import account from "./account";
import message from "./message";
import enhance from "./enhance";

export default {
  name: "profile",
  data() {
    return {
      muenIndex: 0,
      muen: [{
        title: 'account',
        value: '0'
      },
      {
        title: 'appearance',
        value: '1'
      },
      {
        title: 'message',
        value: '2'
      },
        {
          title: 'enhance',
          value: '3'
        }]
    }
  },
  components: {Bulletin, appearance, account, message,enhance},
  created() {
    const pagename = this.$route.params.pagename;

    if (pagename == undefined) {
      this.upDateUri(0, true);
      return;
    }

    let name = this.muen.filter(
        i => {
          return i.title.toLocaleLowerCase() == pagename;
        }
    )[0].value;

    this.upDateUri(name || this.muenIndex);
  },
  methods: {
    upDateUri (index, t = false) {
      this.muenIndex = index;
      this.$router.push({
        path: (t ? 'profile/' : '') + this.muen[index].title.toLowerCase()
      });
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

</style>
