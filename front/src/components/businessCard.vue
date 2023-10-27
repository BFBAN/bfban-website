<template>
  <Poptip :padding="padding"
          :width="width"
          :transfer="true"
          trigger="hover"
          placement="bottom"
          @on-popper-show="getUserInfo">
    <slot></slot>
    <div slot="content" class="business">
      <template v-if="!loadErr">
        <div class="business-img">
          <img src="@/assets/images/games/bfv/bf.jpg">
        </div>
        <Row>
          <Col flex="1">
            <h2>
              <Row :gutter="10">
                <Col v-if="userInfo.userAvatar">
                  <Avatar shape="square"
                          size="20"
                          icon="ios-person"
                          :src="`${userInfo.userAvatar}`"></Avatar>
                </Col>
                <Col flex="1">
                  <a :href="`/account/${userInfo.id}`" target="_blank">{{ userInfo.username }}</a>
                </Col>
              </Row>
            </h2>
            <PrivilegesTag :data="userInfo.privilege" v-if="userInfo.privilege"></PrivilegesTag>
          </Col>
          <Col>
            # {{ userInfo.id }}
          </Col>
        </Row>
        <br>
        <Card dis-hover>
          <p>{{ userInfo.introduction ? userInfo.introduction : '(✿◡‿◡)' }}</p>
        </Card>
        <template v-if="isLogin && isAdmin && showAdminUserInfo">
          <br>
          <Card dis-hover>
            <Row>
              <Col flex="1">
                <Icon type="md-eye" size="17"/>
              </Col>
              <Col><PrivilegesTag :data="['super', 'root', 'dev']"></PrivilegesTag></Col>
            </Row>
            <br>
            <p><b>User Orgin:</b></p>
            <code type="json" style="width: 100%; white-space: pre-line" v-if="userInfo.origin">{{userInfo.origin}}</code>
            <p><b>User Attr:</b></p>
            <code type="json" style="width: 100%; white-space: pre-line" v-if="userInfo.attr">{{userInfo.attr}}</code>
          </Card>
        </template>
        <br>
        <Row>
          <Col flex="auto"></Col>
          <Col>
            <router-link :to="{path: '/account/' + userInfo.id, query: {repeat: true}}">
              <Button>
                <Icon type="ios-send" size="20"/>
              </Button>
            </router-link>
          </Col>
        </Row>
      </template>
      <template v-else>
        <Row>
          <Col align="center">
            <Icon type="md-alert" size="40" color="red"/>
          </Col>
        </Row>
      </template>

      <Spin size="large" fix v-show="spinShow">
        <Icon type="ios-loading" size="50" class="spin-icon-load"></Icon>
        <p>ヾ(◍°∇°◍)ﾉﾞ load...</p>
      </Spin>
    </div>
  </Poptip>
</template>

<script>
import {api, http, http_token, storage} from '../assets/js/index';

import PrivilegesTag from "/src/components/PrivilegesTag";
import Application from "@/assets/js/application";

export default new Application({
  props: {
    showAdminUserInfo: {
      type: Boolean,
      default: false,
    },
    width: {
      type: Number,
      default: 400
    },
    id: [Number, String],
    padding: {
      type: String,
      default: '0'
    }
  },
  data() {
    return {
      localBusinessMap: {},
      userInfo: {},
      spinShow: false,
      loadErr: false,
      type: 'user',
    }
  },
  components: {PrivilegesTag},
  created() {
    this.http = http_token.call(this);
    this.type = this.isAdminL2 ? "admin" : "user";
  },
  methods: {
    /**
     * 获取用户信息
     */
    getUserInfo() {
      const name = 'business';
      let localBusinessCardData = storage.session().get(name);

      // 本地持久取
      if (localBusinessCardData.code == 0) {
        this.localBusinessMap = localBusinessCardData.data.value;

        if (this.localBusinessMap[this.id])
          this.userInfo = this.localBusinessMap[this.id];
      }

      // 防止重复获取
      if (Object.keys(this.userInfo).length > 0) return;

      // 从服务器获取
      this.spinShow = true;

      switch (this.type) {
        case "user":
          http.get(api["user_info"], {
            params: {
              id: this.id,
            }
          }).then(res => {
            const d = res.data;
            if (d.success === 1) {
              this.userInfo = d.data;

              this.localBusinessMap[this.userInfo.id] = this.userInfo;

              storage.session().set(name, this.localBusinessMap);
            } else {
              this.catch();
            }
          }).catch(() => {
            this.loadErr = true;
          }).finally(() => {
            this.spinShow = false;
          })
          break;
        case "admin":
          this.http.get(api["user_info4admin"], {
            params: {
              id: this.id,
            }
          }).then(res => {
            const d = res.data;
            if (d.success === 1) {
              this.userInfo = d.data;

              this.localBusinessMap[this.userInfo.id] = this.userInfo;

              storage.session().set(name, this.localBusinessMap);
            } else {
              this.catch();
            }
          }).catch(() => {
            this.loadErr = true;
          }).finally(() => {
            this.spinShow = false;
          })
          break;
      }
    }
  }
})
</script>

<style lang="less">
.business {
  padding: 20px;
  position: relative;
  user-select: none;
}

.business-img {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: calc(50% + 10px);
  overflow: hidden;
  opacity: .3;
  border-radius: 5px 5px 0 0;

  img {
    width: 100%;
  }
}
</style>
