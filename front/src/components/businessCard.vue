<template>
  <Poptip :width="width || 400" trigger="hover" placement="bottom" :transfer="true" @on-popper-show="getUserInfo">
    <slot></slot>
    <div slot="content">
      <div class="business">
        <img src="@/assets/images/games/bfv/bf.jpg">
      </div>
      <Row>
        <Col flex="auto">
          <h2>
              <span v-for="(i, index) in privilege" :key="index">
                <Tag type="border" v-if="i.value == userInfo.privilege" :color="i.class">
                  {{ $t('basic.privilege.' + userInfo.privilege) }}
                </Tag>
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
      privilege: privilege.child,
      type: 'user',
      userInfo: {}
    }
  },
  methods: {
    getUserInfo() {
      if (Object.keys(this.userInfo).length > 0) return;

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
            }
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