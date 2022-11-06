<template>
  <div>
    <Tabs :value="tagsName">
      <TabPane :label="$t('profile.chat.tabsList.itemName')" name="message0">
        <Card dis-hover :padding="0">
          <p slot="title"></p>
          <div slot="extra">
            <Button size="small" :disabled="!selectWindow" @click="setMessageEdit" v-voice-button>
              {{ $t('profile.chat.control') }}
            </Button>
            <Divider type="vertical"/>
            <Button type="primary" size="small" :loading="messageLoad" @click="getMessage" v-voice-button>
              {{ $t('profile.chat.load') }}
            </Button>
          </div>
          <Row v-if="messageList[selectWindow]">
            <Col class="message-user">
              <template>
                <div v-for="(i, index) in messageUser" :key="index">
                  <Row :gutter="10"
                       :style="`font-weight: ${ selectWindow == i.value ? 'bold' : '' }`"
                       type="flex" justify="center" align="middle"
                       class="message-user-item">
                    <Col>
                      <Badge :count="messageList[i.type]['num'] || 0" v-if="messageList[i.type]">
                        <Avatar icon="md-notifications"></Avatar>
                      </Badge>
                      <Avatar icon="md-notifications" v-else> {{ i.text[0] }}</Avatar>
                    </Col>
                    <Col flex="1">
                      <businessCard :id="i.id">
                        <p><b>{{ i.text.toString() }}</b></p>
                      </businessCard>
                    </Col>
                    <Col>
                      <a @click="openMessageDetail(i)" v-voice-button>{{ $t('profile.chat.look') }}</a>
                    </Col>
                  </Row>
                </div>
              </template>
            </Col>
            <Col flex="1" class="message-content">
              <!-- 编辑 S -->
              <Row class="message-content-control" v-if="control.open">
                <Col>
                  <Checkbox v-model="control.all" @on-change="onBatchAll"></Checkbox>
                  <Divider type="vertical"/>
                </Col>
                <Col flex="1">
                  <Select v-model="control.model" size="small" style="width:200px">
                    <Option v-for="item in control.list" :value="item.value" :key="item.value">
                      {{ $t('profile.chat.tabsList.form.' + item.label) }}
                    </Option>
                  </Select>
                </Col>
                <Col>
                  <Button size="small" @click="onBatchOperation" :disabled="control.model < 0" :loading="control.load"
                          v-voice-button>
                    {{ $t('basic.button.submit') }}
                  </Button>
                </Col>
              </Row>
              <!-- 编辑 E -->

              <div class="message-content-box">
                <div v-for="(child, child_index) of messageList[selectWindow].child" :key="child_index"
                     class="message-content-item">
                  <Row :gutter="18">
                    <Col span="2" v-if="control.open">
                      <Checkbox v-model="child.choose"></Checkbox>
                    </Col>
                    <Col :span="control.open ? 22 : 24">
                      <Row>
                        <Col flex="1">
                          <Time :time="child.time"/>
                        </Col>
                        <Col>
                          <a href="javascript:void(0)" v-if="child.haveRead == 0" @click="onMessageMark(child.id, 0)">
                            <Icon type="md-eye" size="20"/>
                          </a>
                        </Col>
                      </Row>
                      <Card dis-hover :padding="0">
                        <Html :html="child.content"></Html>
                      </Card>
                    </Col>
                  </Row>

                  <divider :size="'small'"></divider>
                </div>
              </div>

              <!--            <Row :gutter="5">-->
              <!--              <Col flex="1">-->
              <!--              </Col>-->
              <!--              <Col align="right">-->
              <!--                <span>2022年08月30日19:59:39</span>-->
              <!--                <Card dis-hover :padding="5">消息内容</Card>-->
              <!--              </Col>-->
              <!--              <Col>-->
              <!--                <Avatar src="https://i.loli.net/2017/08/21/599a521472424.jpg"/>-->
              <!--              </Col>-->
              <!--            </Row>-->

              <div class="message-content-footer" v-if="messageList[selectWindow].type == 'direct'">
                <router-link :to="{name: 'account',params: {uId: selectWindow}, query: {repeat: true}}">
                  <Button long type="primary" v-voice-button>
                    <Icon type="ios-send" size="20"/>
                  </Button>
                </router-link>
              </div>
            </Col>
          </Row>
          <template v-else>
            <div class="message-content-not">{{ $t('basic.tip.notContent') }}</div>
          </template>
        </Card>
      </TabPane>
    </Tabs>
  </div>
</template>

<script>
import BFBAN from "/src/assets/js/bfban";
import Html from "@/components/Html";

import {api, http, http_token, message} from "../../assets/js";

import BusinessCard from "/src/components/businessCard.vue";
import PrivilegesTag from "/src/components/PrivilegesTag";
import messageConf from "/public/conf/message.json";

export default new BFBAN({
  name: "message",
  data() {
    return {
      that: this,
      tagsName: 'message0',
      messageLoad: false,
      selectWindow: '',
      message: {
        list: messageConf.sendTypes,
        typeDictionary: messageConf.typeDictionary,
        ruleValidate: {
          type: [
            {required: true, trigger: 'blur'}
          ],
          id: [
            {required: true, trigger: 'blur'}
          ],
          content: [
            {required: true, trigger: 'blur'}
          ],
        },
        messages: [],
        playerList: [],
        show: false,
        load: false,

        // message from value
        type: "",
        id: '',
        content: '',
      },
      messageUser: [],
      messageList: {},
      control: {
        load: false,
        open: false,
        all: false,
        model: -1,
        list: [
          {
            value: 0,
            label: 'read'
          },
          {
            value: 1,
            label: 'unread'
          },
        ]
      }
    }
  },
  components: {BusinessCard, PrivilegesTag, Html},
  watch: {
    $route: "loadData",
  },
  created() {
    this.http = http_token.call(this);

    this.loadData();
  },
  methods: {
    async loadData() {
      await this.getMessage();

      this.message.type = this.message.list[0].title;

      if (this.messageUser.length > 0) {
        this.selectWindow = this.messageUser[0].value;
      }
    },
    /**
     * 重置推送表单
     */
    resetMessageFrom() {
      this.message.id = '';
      this.message.content = '';
      this.message.type = this.message.list[0].title;
    },
    /**
     * 打开聊天框详情
     */
    async openMessageDetail(i) {
      this.selectWindow = i.value;

      // 标记未读
      for (let j = 0; j < this.messageList[this.selectWindow].child.length; j++) {
        if (this.messageList[this.selectWindow].child[j].haveRead == 0)
          this.messageList[this.selectWindow].child[j].choose = true;
      }

      this.control.model = 0;

      await this.onBatchOperation();

      this.control.model = null;
    },
    /**
     * 批量选择框
     */
    onBatchAll() {
      this.messageList[this.selectWindow].child.forEach(i => {
        i.choose = this.control.all;
      })
    },
    /**
     * 批量操作
     */
    async onBatchOperation() {
      let onFun = [];
      this.messageList[this.selectWindow].child.forEach(i => {
        if (i.choose) {
          switch (this.control.model) {
            case 0:
              // 0: 批量已读时，检查下方的消息是否已读，如果是则跳过
              if (i.haveRead == 0) {
                onFun.push(this.onMessageMark(i.id, this.control.model));
              }
              break;
            case 1:
              // 删除
              onFun.push(this.onMessageMark(i.id, this.control.model));
              break;
          }
        }
      })

      this.control.load = true;
      Promise.all(onFun).finally(() => {
        this.control.load = false;
      });

      return true;
    },
    /**
     * 设置消息状态
     * 已读，未读，删除
     */
    async onMessageMark(id, type) {
      await this.http.post(api["user_message_mark"], {
        params: {
          id,
          type: ['read', 'unread', 'del'][type],
        }
      });

      this.getMessage();
    },
    /**
     * 获取玩家
     */
    getPlayerList(value) {
      this.message.load = true;
      this.message.playerList = [];

      if (value.length <= 2 || typeof value == 'number') return

      http.get(api["users"], {
        params: {
          param: value.trim()
        }
      }).then(res => {
        const d = res.data;

        if (d.success == 1) {
          this.message.playerList = d.data;
        }

        this.message.load = false;
      })
    },
    /**
     * 编辑消息
     */
    setMessageEdit() {
      this.control.open = !this.control.open
    },
    /**
     * 获取消息列表
     */
    async getMessage() {
      this.messageLoad = true;

      await this.http.get(api["user_message"]).then(res => {
        const d = res.data;

        if (d.success == 1) {
          this.message.messages = d.data.messages;
          let messageUser = [];
          let messageList = {};

          d.data.messages.forEach(i => {
            let numUser = 0;
            let num = 0;

            switch (i.type) {
              case 'warn':
                // 系统通知类
                messageUser.forEach(t => {
                  t.type == i.type ? num += 1 : null
                });

                if (num <= 0) {
                  messageUser.push({
                    text: "@" + this.$i18n.t('profile.chat.types.' + i.type),
                    id: i.byUserId,
                    value: i.type,
                    type: i.type
                  });
                }
                break;
              case "reply":
              case "direct":

                // 用户通知类
                messageUser.forEach(t => {
                  if (t.value == i.byUserId) num += 1;
                });

                if (num <= 0) {
                  messageUser.push({
                    text: i.username || i.byUserId,
                    id: i.byUserId,
                    value: i.byUserId,
                    type: i.type
                  });
                }
                break;
            }

            let val = i.type == 'warn' ? i.type : i.byUserId;
            if (!messageList[val]) {
              messageList[val] = {child: [], num: 0}
            }
            messageList[val].child.push(Object.assign(i,{
              time: i.createTime,
              content: `<p>${i.content}</p>`,
              choose: false,
            }));
            messageList[val].type = i.type;
            messageList[val].num = messageList[val].child.length || 0;
          });

          this.messageList = messageList;
          this.messageUser = messageUser;
        }
      }).finally(() => {
        this.messageLoad = false;
      });

      return true;
    },
  }
});
</script>

<style lang="less" scoped>
.message-user {
  width: 230px;
}

.message-user > div {
  padding: 10px 15px 2px 15px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.03);
}

.message-user-item {
  margin-bottom: 10px;
}

.message-content {
  display: flex;
  background-color: rgba(0, 0, 0, .02);
  flex-direction: column;
  justify-content: space-between;
}

.message-content-box {
  overflow: auto;
  min-height: 350px;
  max-height: 400px;
  height: 100%;
}

.message-content-item > .ivu-row {
  padding: 15px 20px !important;
  width: calc(100% + 9px);
}

.message-content-item > .ivu-divider {
  margin: 0 !important;
  opacity: .3;
}

.message-content-not {
  min-height: 300px;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: rgba(0, 0, 0, 0.03);
}

.message-content-control {
  background-color: rgba(0, 0, 0, 0.02);
  padding: 10px 18px;
}

.message-content-footer {
  padding: 10px 20px;
}
</style>