<template>
  <Dropdown class="mobile-hide">
    <Badge :count="message && message.total && message.total[0].num || 0" :class="message.messages.length > 0 ? 'shake' : ''">
      <slot name="content"></slot>
    </Badge>
    <DropdownMenu slot="list" style="padding: 0 10px; width: 400px">
      <div v-if="message.messages.length > 0">
        <Tabs value="message">
          <TabPane label="✉️" name="message">
            <div v-for="(item, index) in message.messages" :key="index">
              <Row v-show="message.messages.length <= 4">
                <Col flex="auto">
                  <b>{{item.content}}</b>
                  <p>{{item.createTime}}</p>
                </Col>
                <Col flex="200" align="right">
                  <a>已阅读</a>
                </Col>
              </Row>
              <Divider></Divider>
            </div>
          </TabPane>
          <div slot="extra" v-show="$route.path != '/profile/message'">
            <router-link :to="{path: '/profile/message'}">
              <Button size="small">发送消息</Button>
            </router-link>
          </div>
        </Tabs>
        <p align="center">
          <router-link :to="{name: 'message'}">查看更多</router-link>
        </p>
      </div>
    </DropdownMenu>
  </Dropdown>
</template>

<script>
import {api, http_token} from "../assets/js";

export default {
  name: "Header_message",
  data () {
    return {
      message: {
        messages: []
      }
    }
  },
  props: {
    data: {},
  },
  created() {
    this.http = http_token.call(this);

    this.getMessage();
  },
  methods: {
    getMessage () {
      this.http.get(api["user_message"], {}).then(res => {
        const d = res.data;
        if (d.success == 1) {
          this.message = d.data;
        }
      })
    },
  }
}
</script>

<style scoped>
.shake {
  animation: shakeAnimation .5s ease-in-out both;
}

@keyframes shakeAnimation {
  2% {
    transform: translate(1.5px,1.5px) rotate(-.5deg)
  }

  8% {
    transform: translate(-1.5px,1.5px) rotate(1.5deg)
  }

  16% {
    transform: translate(1.5px,2.5px) rotate(-.5deg)
  }

  24% {
    transform: translate(1.5px,-.5px) rotate(.5deg)
  }

  32% {
    transform: translate(2.5px,.5px) rotate(.5deg)
  }

  40% {
    transform: translate(-1.5px,-.5px) rotate(1.5deg)
  }

  48% {
    transform: translate(1.5px,1.5px) rotate(1.5deg)
  }

  56% {
    transform: translate(.5px,.5px) rotate(-.5deg)
  }

  64% {
    transform: translate(-1.5px,-1.5px) rotate(1.5deg)
  }

  72% {
    transform: translate(1.5px,2.5px) rotate(1.5deg)
  }

  80% {
    transform: translate(.5px,2.5px) rotate(1.5deg)
  }

  88% {
    transform: translate(2.5px,1.5px) rotate(-.5deg)
  }

  96% {
    transform: translate(.5px,2.5px) rotate(-.5deg)
  }

  98% {
    transform: translate(2.5px,.5px) rotate(1.5deg)
  }

  0%,to {
    transform: translate(0) rotate(0)
  }
}
</style>