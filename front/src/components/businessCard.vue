<template>
  <Poptip :width="width || 400" trigger="hover" placement="bottom" :transfer="true" @on-popper-show="getUserInfo">
    <slot></slot>
    <div class="api" slot="content">
      <Row>
        <Col flex="auto">
          <h2>
              <span v-for="(i, index) in privilege" :key="index">
                <Tag type="border" v-if="i.value == userInfo.privilege" :class="i.class" :color="i.class">
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

import privilege from '../assets/privilege.json'

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
      console.log(Object.keys(this.userInfo))
      if (Object.keys(this.userInfo).length > 0) return;
      console.log(111)

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