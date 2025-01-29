<template>
  <div>
    <div class="desktop-hide">
      <div @click="message.show = true">
        <slot name="content"></slot>
      </div>
      <Drawer :title="$t(`${$route.name}.title`)" placement="left" width="80%" :closable="false" v-model="message.show">
        <List>
          <ListItem v-if="message.messages.length > 0">
            <div v-for="(item, index) in message.messages" :key="index">
              <Row v-show="message.messages.length <= 4">
                <Col flex="auto">
                  <b>{{ item.content }}</b>
                  <p>{{ item.createTime }}</p>
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
      <router-link :to="{name: 'profile', params: {pagename: 'chat'}}">
        <Badge :count="unReadCount" :class="unReadCount > 0 ? 'shake' : ''">
          <slot name="content"></slot>
        </Badge>
      </router-link>
    </Dropdown>
  </div>
</template>

<script>
import {api, http_token, account_storage, message, voice} from "../assets/js";
import Application from "@/assets/js/application";

export default new Application({
  name: "Header_message",
  data() {
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
  watch: {
    unReadCount: function (val) {
      if (val >= 0 && message.playMessageVoice)
        message.playMessageVoice()
    }
  },
  created() {
    this.http = http_token.call(this);

    this.getMessage();
  },
  methods: {
    /**
     * 获取消息列表
     */
    getMessage() {
      if (!this.isLogin) return;

      this.http.get(api["user_message"], {}).then(res => {
        const d = res.data;

        if (d.success === 1) {
          this.message = d.data;
          return;
        }

        if (d.code == 'user.tokenExpired') {
          account_storage.clearAll();
          return
        }
      })
    },
  },
  computed: {
    unReadCount() {
      let num = 0;
      this.message.messages.forEach(i => {
        if (i.haveRead === 0 && ['info', 'warn', 'fatal'].indexOf(i.type) < 0) num += 1;
        return i
      })
      return num;
    },
  }
})
</script>
