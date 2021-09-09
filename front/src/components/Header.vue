<template>
    <header>
      <div class="header-container container">
        <router-link class="mobile-hide" :to="{name: 'home'}">
          <img src="https://i.loli.net/2018/11/03/5bdd8e977b10d.png"
               width="40"
               height="40"
               alt="bfban logo"/>
        </router-link>
        <div class="nav nav-menu">
          <router-link class="mobile-hide link" :to="{name: 'home'}">
            {{ $t("header.index") }}
          </router-link>
          <router-link class="mobile-hide link" :to="{name: 'cheaters', query: { status: '-1' }}">
            {{$t("header.cheaters")}}
          </router-link>
          <router-link class="mobile-hide link" :to="{name: 'report'}">
            {{$t("header.report")}}
          </router-link>
          <router-link class="mobile-hide link" :to="{name: 'about'}">
            {{$t("header.about")}}
          </router-link>

          <router-link class="desktop-hide" :to="{name: 'home'}">
            <Icon size="24" type="md-home" />
          </router-link>
          <router-link class="desktop-hide" :to="{name: 'cheaters', query: { status: '100' }}">
            <Icon size="24" type="md-list-box" />
          </router-link>
          <router-link class="desktop-hide" :to="{name: 'report'}">
            <Icon size="24" type="ios-megaphone" />
          </router-link>
          <router-link class="desktop-hide" v-if="isAdmin" :to="{name: 'dashboard'}">
            <Icon size="24" type="md-cog" />
          </router-link>
        </div>
        <div class="nav">
          <router-link v-show="!isLogin" class="mobile-hide" :to="{name: 'signin'}">
            <Button type="primary" shape="circle">
              <Icon type="md-log-in" />
              {{$t("header.signin")}}
            </Button>
          </router-link>

          <router-link v-show="!isLogin" class="desktop-hide" :to="{name: 'signin'}">
            <Icon type="md-log-in" size="30" />
          </router-link>
          <router-link v-show="!isLogin" class="desktop-hide" :to="{name: 'signup'}">
            <Icon type="md-person-add" size="30" />
          </router-link>

          <Dropdown placement="bottom-end" v-if="isLogin">
            <Row :gutter="10">
              <Col>
                <Avatar size="50">{{ currentUser.userinfo.username[0] || 'Null'}}</Avatar>
              </Col>
              <Col>
                <a href="javascript:void(0)">
                  {{ currentUser.userinfo.username }}
                </a>
                <p>
                  <span v-for="(i,index) in privileges" :key="index">
                    <Tag ttype="border" size="medium" v-if="currentUser.userinfo.privilege == i.value">
                      {{ $t("account." + i.value) }}
                    </Tag>
                  </span>
                </p>
              </Col>
            </Row>
            <DropdownMenu slot="list">
              <div style="width: 300px;  background-color: #f2f2f2; padding: 30px">
                <List border size="small">
                  <ListItem>
                    联BFBAN的基本规则
                    <template slot="action">
                      <li>
                        <a href="">阅读</a>
                      </li>
                    </template>
                  </ListItem>
                  <ListItem>
                    作为管理员，如何识别作弊玩家？
                    <template slot="action">
                      <li>
                        <a href="">阅读</a>
                      </li>
                    </template>
                  </ListItem>
                  <ListItem>
                    如何自我证明，无作弊?
                    <template slot="action">
                      <li>
                        <a href="">阅读</a>
                      </li>
                    </template>
                  </ListItem>
                </List>
              </div>
              <DropdownItem>
                <router-link class="nav-username mobile-hide" :to="{name: 'account', params: { uId: `${currentUser.userinfo.userId}` }}">
                  {{$t("header.userCenter")}}
                </router-link>
              </DropdownItem>
              <DropdownItem>
                <router-link class="nav-username mobile-hide" :to="{name: 'profile', params: { uId: `${currentUser.userinfo.userId}` }}">
                  {{$t("header.profile")}}
                </router-link>
              </DropdownItem>
              <DropdownItem>
                <router-link class="mobile-hide" v-if="isAdmin" :to="{name: 'dashboard'}">{{$t("header.dashboard")}}</router-link>
              </DropdownItem>
              <Dropdown-item divided v-show="isLogin">
                <a @click.stop.prevent="signout">
                  <Icon type="md-log-out"></Icon>
                  {{$t("header.signout")}}
                </a>
              </Dropdown-item>
            </DropdownMenu>
          </Dropdown>
          <Divider type="vertical"/>
          <Dropdown class="mobile-hide" v-show="isLogin">
            <Badge :count="message && message.total && message.total[0].num || 0">
              <Icon type="md-notifications" size="30" @click="handleOpen" />
            </Badge>
            <DropdownMenu slot="list" style="padding: 0 20px; width: 400px">
              <List item-layout="vertical">
                <ListItem v-for="(item, index) in message.messages" :key="index" v-show="message.messages.length <= 4">
                  <ListItemMeta :title="item.content" :description="item.createTime" />
                  <template slot="action">
                    <li>
                      <a href="">已阅</a>
                    </li>
                  </template>
                </ListItem>
              </List>
              <p align="center"><router-link :to="{name: 'message'}">查看更多</router-link></p>
            </DropdownMenu>
          </Dropdown>
          <Divider type="vertical"/>
          <router-link class="mobile-hide" v-if="isLogin" :to="{name: 'search_main'}">
            <Icon type="ios-search" size="28" />
          </router-link>
          <router-link class="nav-username desktop-hide" v-if="isLogin" :to="{name: 'account', params: { uId: `${currentUser.uId}` }}">
            <Badge dot>
              <Icon size="30" type="md-person" />
            </Badge>
          </router-link>
          <a class="nav-signout desktop-hide" v-show="isLogin" href="#" @click.stop.prevent="signout">
            <Icon type="md-log-out" size="30"></Icon>
          </a>
          <Divider type="vertical"/>
          <Tooltip :content="$t('home.howToUse.tools.main')" placement="bottom-end">
            <router-link :to="{name: 'apps'}">
              <Icon type="md-apps" size="30" />
            </router-link>
          </Tooltip>
        </div>
      </div>
    </header>
</template>

<script>
  import {http, api,http_token} from '../assets/js/index'

  export default {
    data() {
      return {
        privileges: [],
        message: {
          messages: []
        }
      }
    },
    watch: {
      $route: "loadData",
    },
    created() {
      this.http = http_token.call(this);
      this.getMessage();
    },
    methods: {
      async loadData() {
        const privileges = await import('/src/assets/privilege.json');
        this.privileges = privileges.child;
      },
      getMessage () {
        this.http.get(api["user_message"], {}).then(res => {
          const d = res.data;
          if (d.success == 1) {
            this.message = d.data;
          }
        })
      },
      handleOpen () {
        this.visible = true;
      },
      handleClose () {
        this.visible = false;
      },
      signout() {
        http.post(api["account_signout"], {
          headers: {
            'x-access-token': this.$store.state.user.token
          }
        }).then((res) => {
          const d = res.data;
          if (d.success == 1) {
            this.$store.dispatch('signout').then(() => {
              this.$Message.success(d.message);

              this.$router.push('/');
            });
          }
        })
      }
    },
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

<style lang="scss">
  header {
    position: relative;
    z-index: 1000;
    backdrop-filter: blur(50px);
    width: 100%;
    height: auto;
    padding: 10px 0 !important;
    background-image: linear-gradient(rgba(0, 0, 0, 0.1), transparent);
  }
  .header-container {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .nav {
    display: flex;
    align-items: center;
    padding: 0 .4rem;
    font-weight: bold;

    a.link {
      padding: .7rem .8rem;
      text-shadow: #fff 1px 0 0, #fff 0 1px 0, #fff -1px 0 0, #fff 0 -1px 0;
    }
  }
  .nav-menu {
    flex: 1;
  }
  .nav-username {
    text-overflow: ellipsis;
    white-space: nowrap;
    overflow: hidden;
    max-width: 6rem;
    flex-grow: 0;
  }
  .nav-signout {
    flex-shrink: 0;
  }

  @media screen and (min-width: 1088px) {
    .nav-username {
      width: 100%;
    }
  }

  .ivu-badge-dot {
    left: -4px;
  }
</style>