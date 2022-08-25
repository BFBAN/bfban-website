<template>
  <Poptip :width="width || 400" trigger="hover" placement="bottom" :transfer="true" @on-popper-show="getUserInfo">
    <slot></slot>
    <div slot="content">
      <template v-if="!loadErr">
        <div class="business">
          <img src="@/assets/images/games/bfv/bf.jpg">
        </div>
        <Row>
          <Col flex="auto">
            <h2>
              <span v-for="(i, index) in privilege" :key="index">
                <span v-for="(p, pi) in userInfo.privilege" :key="pi">
                  <Tag type="border" v-if="i.value == p" :color="i.class">
                    {{ $t('basic.privilege.' + p) }}
                  </Tag>
                </span>
              </span>
              {{ userInfo.username }}
            </h2>
          </Col>
          <Col>
            # {{ userInfo.id }}
          </Col>
        </Row>
        <br>
        <Card dis-hover>
          <p v-html="userInfo.introduction || '(✿◡‿◡)'"></p>
        </Card>
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
            <Icon type="md-alert" size="40" color="red" />
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
import {api, http} from '../assets/js/index';

import privilege from '/public/conf/privilege.json'

export default {
  props: {
    width: Number,
    id: Number
  },
  data() {
    return {
      spinShow: false,
      loadErr: false,
      privilege: privilege.child,
      type: 'user',
      userInfo: {}
    }
  },
  methods: {
    getUserInfo() {
      if (Object.keys(this.userInfo).length > 0) return;
      this.spinShow = true;
      switch (this.type) {
        case "user":
          http.get(api["user_info"], {
            params: {
              id: this.id,
            }
          }).then(res => {
            const d = res.data;
            if (d.success == 1) {
              this.userInfo = d.data;
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
}
</script>

<style lang="less">
.business {
  position: absolute;
  top: 10px;
  left: 0;
  right: 0;
  height: 90px;
  overflow: hidden;
  opacity: .3;
  border-radius: 5px 5px 0 0;

  img {
    width: 100%;
  }
}
</style>