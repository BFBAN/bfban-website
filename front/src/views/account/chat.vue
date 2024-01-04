<template>
  <Tabs :value="tagsName">
    <TabPane :label="$t('profile.chat.tabsList.itemName')" name="message0">
      <div class="chat">
        <Row class="profile-body" type="flex" align="middle">
          <Col flex="1"></Col>
          <Button size="small" :disabled="!selectWindow" @click="setMessageEdit" v-voice-button>
            {{ $t('profile.chat.control') }}
          </Button>
          <Divider type="vertical"/>
          <Button type="primary" size="small" :loading="messageLoad" @click="getMessage" v-voice-button>
            {{ $t('profile.chat.load') }}
          </Button>
        </Row>
        <Row v-if="messageList[selectWindow]">
          <Col class="chat-user">
            <div v-for="(i, index) in messageUser" :key="index" @click="openMessageDetail(i)">
              <Row :gutter="10"
                   type="flex" justify="center" align="middle"
                   class="chat-user-item">
                <Col>
                  <Badge :count="messageList[i.value]['unreadNum'] || 0"
                         v-if="messageList[i.value] && messageList[i.value]['unreadNum'] > 1">
                    <Avatar icon="md-notifications"></Avatar>
                  </Badge>
                  <Avatar icon="md-notifications" v-else> {{ i.text[0] }}</Avatar>
                </Col>
                <Col flex="1">
                  <businessCard :id="i.id" v-if="'reply' == i.type">
                    <b>{{ i.text.toString() }}</b>
                  </businessCard>
                  <span v-else><b>{{ i.text.toString() }}</b></span>
                  ({{ messageList[i.value]['num'] || 0 }})
                </Col>
                <Col>
                  <Button size="small" v-voice-button>
                    {{ $t('profile.chat.look') }}
                    <Icon type="ios-arrow-dropright" v-if="selectWindow != i.value"/>
                    <Icon type="md-arrow-dropright-circle" v-else/>
                  </Button>
                </Col>
              </Row>
            </div>
          </Col>
          <Col flex="1" class="chat-content">
            <!-- 编辑 S -->
            <Row class="chat-content-control" v-if="control.open">
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

            <div class="chat-content-box">
              <div v-for="(child, child_index) of messageList[selectWindow].child" :key="child_index"
                   class="chat-content-item">
                <Row :gutter="18">
                  <Col span="2" v-if="control.open">
                    <Checkbox v-model="child.choose"></Checkbox>
                  </Col>
                  <Col :span="control.open ? 22 : 24">
                    <Row type="flex" align="middle">
                      <Col flex="1">
                        <TimeView :time="child.time">
                          <Time :time="child.time" type="datetime"/>
                        </TimeView>
                      </Col>
                      <Col>
                        <Tag type="border" :color="{'fatal': 'red', 'warn': 'red'}[child.type] || 'info'">{{
                            child.type
                          }}
                        </Tag>
                      </Col>
                      <Col>
                        <a href="javascript:void(0)"
                           v-if="child.haveRead == 0 && ['info', 'warn', 'fatal'].indexOf(child.type) < 0"
                           @click="onMessageMark(child.id, 0)">
                          <Icon type="md-eye" size="20"/>
                        </a>
                      </Col>
                    </Row>
                    <Card dis-hover :padding="0" style="margin: 10px 0">
                      <Html :html="child.content"></Html>
                    </Card>
                    <Row>
                      <Col flex="1">
                        <span v-if="['info', 'warn', 'fatal'].indexOf(child.type) < 0">by <u>{{
                            child.username
                          }}</u>({{ child.byUserId }})</span>
                      </Col>
                      <Col># {{ child.id }}</Col>
                    </Row>
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

            <div class="-content-footer" v-if="messageList[selectWindow].type == 'direct'">
              <router-link :to="{name: 'account',params: {uId: selectWindow}, query: {repeat: true}}">
                <Button long type="primary" v-voice-button>
                  <Icon type="ios-send" size="20"/>
                </Button>
              </router-link>
            </div>
          </Col>

        </Row>
        <template v-else>
          <div class="chat-content-not">{{ $t('basic.tip.notContent') }}</div>
        </template>
      </div>
    </TabPane>
  </Tabs>
</template>

<script>
import Application from "/src/assets/js/application";
import Html from "@/components/Html";
import TimeView from "@/components/TimeView.vue";

import {api, http, http_token, message} from "../../assets/js";

import BusinessCard from "/src/components/BusinessCard.vue";
import PrivilegesTag from "/src/components/PrivilegesTag";
import messageConf from "/public/config/message.json";

export default new Application({
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
  components: {BusinessCard, PrivilegesTag, TimeView, Html},
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
        if (i.choose && ['direct', 'warn', 'reply'][i.type]) {
          switch (this.control.model) {
            case 0:
              // 0: 批量已读时，检查下方的消息是否已读，如果是则跳过
              if (i.haveRead == 0)
                onFun.push(this.onMessageMark(i.id, this.control.model));
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
    async onMessageMark(id, type = 0) {
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

      if (value.length <= 2 || typeof value == 'number') return;

      http.get(api["users"], {
        params: {
          param: value.trim()
        }
      }).then(res => {
        const d = res.data;

        if (d.success === 1) {
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

        if (d.success === 1) {
          this.message.messages = d.data.messages;
          let messageUser = [];
          let messageList = {};

          // 处理用户列表
          d.data.messages.forEach(i => {
            switch (i.type) {
              case "info":
              case "fatal":
              case "warn":
              case "toAll":
              case "toAdmins":
              case "toNormals":
                // 系统通知类
                if (!messageUser.find(j => j.type == i.type)) {
                  messageUser.push({
                    text: "@" + this.$i18n.t('profile.chat.types.' + i.type + '.text'),
                    id: i.byUserId,
                    value: i.type,
                    type: i.type,
                    index: 0,
                  });
                }
                break;
              case "reply":
              case "direct":
              default:
                // 用户通知类
                if (!messageUser.find(j => j.id == i.byUserId)) {
                  messageUser.push({
                    text: i.username || i.byUserId,
                    id: i.byUserId,
                    value: i.byUserId,
                    type: i.type,
                    index: 1,
                  });
                }
                break;
            }

            // 处理内容列表
            switch (i.type) {
              case "info":
              case "fatal":
              case "warn":
              case "toAll":
              case "toAdmins":
              case "toNormals":
                if (!messageList[i.type])
                  messageList[i.type] = {child: [], num: 0}

                messageList[i.type].child.push(Object.assign(i, {
                  time: i.createTime,
                  content: `<p>${i.content}</p>`,
                  choose: false,
                }));

                messageList[i.type].type = i.type;
                messageList[i.type].num = messageList[i.type].child.length || 0;
                return;

              case "reply":
              case "direct":
              default:
                if (!messageList[i.byUserId])
                  messageList[i.byUserId] = {child: [], num: 0}

                messageList[i.byUserId].child.push(Object.assign(i, {
                  time: i.createTime,
                  content: `<p>${i.content}</p>`,
                  choose: false,
                }));

                messageList[i.byUserId].type = i.type;
                messageList[i.byUserId].num = messageList[i.byUserId].child.length || 0;
                messageList[i.byUserId].unreadNum = messageList[i.byUserId].child.filter(i => i.haveRead === 0).length;
                break;
            }
          });

          this.messageList = messageList;
          this.messageUser = messageUser.sort((a, b) => a.index - b.index);

          if (this.messageUser.length > 0)
            this.selectWindow = this.messageUser[0].value;
          return;
        }

        this.$Message.error(this.$t(`basic.tip['${d.code}']`, {
          message: d.message || ""
        }));
      }).finally(() => {
        this.messageLoad = false;
      });

      return true;
    },
  }
});
</script>

<style lang="less" scoped>
.chat {
  margin-top: -16px;
  min-height: 600px;

  .chat-user {
    width: 300px;
    height: 100%;
    cursor: pointer;
  }

  .chat-user > div {
    padding: 10px 15px 2px 15px;
    border-bottom: 1px solid rgba(0, 0, 0, 0.03);
  }

  .chat-user-item {
    margin-bottom: 10px;
  }

  .chat-content {
    display: flex;
    background-color: rgba(0, 0, 0, .02);
    flex-direction: column;
    justify-content: space-between;
  }

  .chat-content-box {
    overflow: auto;
    min-height: 350px;
    max-height: 150vh;
    height: 70vh;
  }

  .chat-content-item > .ivu-row {
    padding: 15px 20px !important;
    width: calc(100% + 9px);
  }

  .chat-content-item > .ivu-divider {
    margin: 0 !important;
    opacity: .3;
  }

  .chat-content-not {
    height: 70vh;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: rgba(0, 0, 0, 0.03);
  }

  .chat-content-control {
    background-color: rgba(0, 0, 0, 0.02);
    padding: 10px 18px;
  }

  .chat-content-footer {
    padding: 10px 20px;
  }
}
</style>
