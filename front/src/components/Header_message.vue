<template>
  <div>
    <div class="desktop-hide" >
      <div @click="message.show = true">
        <slot name="content"></slot>
      </div>
      <Drawer :title="$t($route.name + '.title')" placement="left" width="80%" :closable="false" v-model="message.show">
        <List>
          <ListItem v-if="message.messages.length > 0">
            <div v-for="(item, index) in message.messages" :key="index">
              <Row v-show="message.messages.length <= 4">
                <Col flex="auto">
                  <b>{{item.content}}</b>
                  <p>{{item.createTime}}</p>
                </Col>
                <Col flex="200" align="right">
                  <a @click="onMessageMark(item.id, 0)">已阅读</a>
                </Col>
              </Row>
              <Divider></Divider>
            </div>
          </ListItem>
        </List>
      </Drawer>
    </div>

    <Dropdown class="mobile-hide">
      <router-link :to="{path: '/profile/message'}">
        <Badge :count="message && message.total && message.total || 0" :class="message.messages.length > 0 ? 'shake' : ''">
          <slot name="content"></slot>
        </Badge>
      </router-link>
    </Dropdown>
  </div>
</template>

<script>
import {api, http_token} from "../assets/js";

export default {
  name: "Header_message",
  data () {
    return {
      message: {
        show: false,
        messages: [],
        total: 0
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
    onMessageMark(id, type) {
      this.http.post(api["user_message_mark"], {
        params: {
          id,
          type: ['read', 'unread'][type],
        }
      })
    },
    getMessage() {
      if (!this.isLogin) return;

      this.http.get(api["user_message"], {}).then(res => {
        const d = res.data;
        if (d.success == 1) {
          this.message = d.data;
        }
      })
    },
  },
  computed: {
    isLogin() {
      return Boolean(this.$store.state.user);
    },
  }
}
</script>

<style lang="scss" scoped>
.shake {
  animation: shakeAnimation .5s ease-in-out both;

  &:hover, &:active {
    animation: shakeAnimation .5s ease-in-out both;
  }
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