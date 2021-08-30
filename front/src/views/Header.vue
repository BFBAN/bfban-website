<template>
    <header>
      <div class="header-container container">
        <div class="nav">
          <router-link class="mobile-hide link" :to="{name: 'home'}">
            {{ $t("header.index") }}
          </router-link>
          <router-link class="mobile-hide link" :to="{name: 'cheaters', query: { status: '100' }}">
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

        <div class="search mobile-hide">
          <Input clearable search size="large" placeholder="支持搜索历史ID啦..." v-model="searchVal" @on-search="handleSearch" />
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
          <Divider type="vertical" v-show="!isLogin" />
          <router-link v-show="!isLogin" class="desktop-hide" :to="{name: 'signup'}">
            <Icon type="md-person-add" size="30" />
          </router-link>

          <Badge dot v-if="isLogin" >
            <Dropdown placement="bottom-start">
              <a href="javascript:void(0)">
                <Avatar>{{ currentUser.username[0] }}</Avatar>
                {{ currentUser.username }}
              </a>
              <DropdownMenu slot="list">
                <DropdownItem>
                  <router-link class="nav-username mobile-hide" :to="{name: 'account', params: { uId: `${currentUser.uId}` }}">个人中心</router-link>
                </DropdownItem>
                <DropdownItem>
                  <router-link class="mobile-hide link" v-if="isAdmin" :to="{name: 'dashboard'}">{{$t("header.dashboard")}}</router-link>
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
          </Badge>
          <Divider type="vertical" v-if="isLogin" />
          <router-link class="nav-username desktop-hide" v-if="isLogin" :to="{name: 'account', params: { uId: `${currentUser.uId}` }}">
            <Badge dot>
              <Icon size="30" type="md-person" />
            </Badge>
          </router-link>

          <a class="nav-signout mobile-hide" v-show="isLogin" href="#" @click.stop.prevent="signout">
            <Icon type="md-log-out"></Icon>
            {{$t("header.signout")}}
          </a>
          <a class="nav-signout desktop-hide" v-show="isLogin" href="#" @click.stop.prevent="signout">
            <Icon type="md-log-out" size="30"></Icon>
          </a>
        </div>
      </div>

      <Modal
        v-model="searchModal"
        title="检索"
        @on-ok="ok"
        @on-cancel="cancel">
        <div style="position: relative">
          <p style="font-size: 1rem;">
            检索的ID为：{{searchVal}}
          </p>
          <br>
          <p>
            检索结果：
          </p>
          <div v-if="cheaters.length !== 0">
            <p v-for="cheater in cheaters" :key="cheater.id">
              <router-link :to="{name: 'cheater', params: {ouid: `${cheater.originUserId}`}}">
                {{cheater.originId}}
              </router-link>
            </p>
          </div>
          <div v-else>无</div>

          <Spin size="large" fix v-show="modalSpinShow"></Spin>

        </div>
      </Modal>
    </header>
</template>

<script>
  import ajax from '@/mixins/ajax';

  export default {
  data() {
    return {
      searchModal: false,
      searchVal: '',
      cheaters: [],

      modalSpinShow: false,
    }
  },
  methods: {
    handleSearch() {
      const val = this.searchVal.trim();

      if (val === '') return false;

      this.searchModal = true;
      this.modalSpinShow = true;

      ajax({
        method: 'get',
        url: `/search?id=${val}`,
      })
      .then((res) => {
        this.modalSpinShow = false;

        const d = res.data;
        if (d.error === 0) {

          const { cheaters } = d.data;
          this.cheaters = cheaters;
        }
      })
    },
    signout() {
      ajax({
        method: 'get',
        url: '/account/signout'
      })
      .then((res) => {
        const d = res.data;

        if (d.error === 0) {
          this.$store.dispatch('signout').then(() => {
            this.$router.push('/');

            this.$Message.success('注销成功');
          })
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
    width: 100%;
    height: auto;
    position: fixed;
    padding: 10px 0;
    z-index: 1000;
    background-image: linear-gradient(rgba(0, 0, 0, 0.1), transparent);
  }
  .header-container {
    display: flex;
    justify-content: space-between;
    align-items: center;

    .search {
      display: flex;
      flex-grow: 0;
      flex-shrink: 1;
      flex-basis: 30%;
    }
  }
  .nav {
    display: flex;
    align-items: center;
    padding: 0 .4rem;
    font-weight: bold;

    a.link {
      padding: .7rem .8rem;
    }
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

