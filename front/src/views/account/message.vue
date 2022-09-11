<template>
  <div>
    <Tabs :value="tagsName">
      <TabPane :label="$t('profile.message.tabsList.itemName')" name="message0">
        <Card dis-hover :padding="0">
          <p slot="title"></p>
          <div slot="extra">
            <Button size="small" :disabled="!selectWindow"  @click="setMessageEdit">
              {{ $t('profile.message.control') }}
            </Button>
            <Divider type="vertical" />
            <Button type="primary" size="small" :loading="messageLoad" @click="getMessage">
              {{ $t('profile.message.load') }}
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
                      <Avatar icon="md-notifications" v-else> {{ i.text[0] }} </Avatar>
                    </Col>
                    <Col flex="1">
                      <p><b>{{ i.text.toString() }}</b></p>
                    </Col>
                    <Col>
                      <a @click="selectWindow = i.value">{{ $t('profile.message.look') }}</a>
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
                  <Divider type="vertical" />
                </Col>
                <Col flex="1">
                  <Select v-model="control.model" size="small" style="width:200px">
                    <Option v-for="item in control.list" :value="item.value" :key="item.value">
                      {{ $t('profile.message.tabsList.form.' + item.label) }}
                    </Option>
                  </Select>
                </Col>
                <Col>
                  <Button size="small" @click="onBatchOperation" :disabled="control.model < 0" :loading="control.load">
                    {{ $t('basic.button.submit') }}
                  </Button>
                </Col>
              </Row>
              <!-- 编辑 E -->

              <div v-for="(child, child_index) of messageList[selectWindow].child" :key="child_index" class="message-content-item">
                <Row :gutter="18">
                  <Col v-if="control.open">
                    <Checkbox v-model="child.choose"></Checkbox>
                  </Col>
                  <Col>
                    <Avatar src="/assets/img/logo.75abcc53.png"></Avatar>
                  </Col>
                  <Col flex="1">
                    <Row>
                      <Col flex="1">
                        <Time :time="child.time"/>
                      </Col>
                      <Col>
                        <a href="javascript:void(0)" v-if="child.haveRead == 0" @click="onMessageMark(child.id, 0)">
                          <Icon type="md-eye" size="20"/>
                        </a>
                        <a href="javascript:void(0)" @click="onMessageMark(child.id, 2)">
                          <Icon type="md-trash" color="red" size="20"/>
                        </a>
                      </Col>
                    </Row>
                    <Card dis-hover :padding="5">{{ child.content }}</Card>
                  </Col>
                </Row>

                <divider :size="'small'"></divider>
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
                  <Button long type="primary">
                    <router-link :to="{path: '/account/' + selectWindow, query: {repeat: true}}">
                      <Icon type="ios-send" size="20"/>
                    </router-link>
                  </Button>
                </div>
            </Col>
          </Row>
          <template v-else>
            <div class="message-content-not">{{ $t('basic.tip.notcontent') }}</div>
          </template>
        </Card>
      </TabPane>
      <TabPane :label="$t('profile.message.tabsSend.itemName')" name="message1" v-if="isAdmin">
        <Card dis-hover>
          <Form slot="title" :model="message" :rules="message.ruleValidate">
            <Row :gutter="30">
              <Col span="12">
                <FormItem :label="$t('profile.message.tabsSend.messageMethod')" prop="type">
                  <Select v-model="message.type" :transfer="true">
                    <Option v-for="(item, item_index) in message.list"
                            v-show="item.privilege.filter(p => currentUser.userinfo.privilege.includes(p) ).length"
                            :value="item.title"
                            :label="$t('profile.message.types.' + item.title + '.text' )"
                            :key="item_index">
                      {{ $t('profile.message.types.' + item.title + '.text' ) }}
                      <p style="margin: 5px 0; font-size: 10px">
                        {{ $t('profile.message.types.' + item.title + '.describe' ) }}
                      </p>
                      <PrivilegesTag :data="item.privilege"></PrivilegesTag>
                    </Option>
                  </Select>
                </FormItem>
              </Col>
              <Col span="12" v-if="message.typeDictionary.includes(message.type)">
                <FormItem :label="$t('profile.message.tabsSend.messageID')" prop="id">
                  <AutoComplete
                      v-model="message.id"
                      :data="message.playerList"
                      :placeholder="$t('profile.message.tabsSend.messageID')">
                    <Option v-for="(option, index) in message.playerList" :value="option.id" :key="index">
                      <Avatar :src="option.avatarLink || ''">{{ option.username[0] }}</Avatar>&emsp;
                      <span>{{ option.username }}</span>
                      <Tag style="float: right">
                        {{ option.id }}
                      </Tag>
                    </Option>
                  </AutoComplete>
                </FormItem>
              </Col>
            </Row>
            <FormItem :label="$t('profile.message.tabsSend.content')" prop="content">
              <Input v-model="message.content"
                     show-word-limit
                     type="textarea"
                     :placeholder="$t('profile.message.placeholder')"
                     :maxlength="1000"
                     :autosize="{minRows: 5,maxRows: 10}"></Input>
            </FormItem>
          </Form>
          <Row :gutter="10">
            <Col flex="1"></Col>
            <Col>
              <Button type="primary"
                      :loading="message.load"
                      :disabled="!message.type || !message.content"
                      @click="putMessage">{{ $t('basic.button.commit') }}</Button>
            </Col>
          </Row>
        </Card>
      </TabPane>
    </Tabs>
  </div>
</template>

<script>
import BFBAN from "/src/assets/js/bfban";

import {api, http, http_token} from "../../assets/js";

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
            { required: true, trigger: 'blur' }
          ],
          id: [
            { required: true, trigger: 'blur' }
          ],
          content: [
            { required: true, trigger: 'blur' }
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
            value: 2,
            label: 'del'
          },
        ]
      }
    }
  },
  components: { PrivilegesTag },
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
    resetMessageFrom () {
      this.message.id = '';
      this.message.content = '';
      this.message.type = this.message.list[0].title;
    },
    /**
     * 批量选择框
     */
    onBatchAll () {
      this.messageList[this.selectWindow].child.forEach(i => {
        i.choose = this.control.all;
      })
    },
    /**
     * 批量操作
     */
    onBatchOperation () {
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
      new Promise.all(onFun,() => {

      }).finally(() => {
        this.control.load = false;
      })
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
     * 发送消息
     */
    putMessage() {
      const {uId} = this.$route.params;

      this.http.post(api["user_message"], {
        data: {
          data: {
            toUserId: this.message.id || uId,
            type: this.message.type,
            content: this.message.content,
          }
        }
      }).then(res => {
        if (res.data.success == 1) {
          this.$Message.success(res.data.message);
        } else {
          this.$Message.error(res.data.message);
        }
      }).finally(() => {
        this.resetMessageFrom();

        this.message.load = false;
        this.message.show = false;
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
                    text: "@" + this.$i18n.t('profile.message.types.' + i.type),
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
                    text: i.byUserId,
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
            messageList[val].child.push(Object.assign({
              time: i.createTime,
              content: i.content,
              choose: false,
            }, i));
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
  },
  computed: {
    isAdmin() {
      const user = this.$store.state.user;
      const is = user ? user.userinfo.privilege.concat("").includes("admin") : false;
      return Boolean(is);
    },
    currentUser() {
      return this.$store.state.user;
    },
  }
});
</script>

<style scoped>
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
  min-height: 300px;
  max-height: 1000px;
  overflow: auto;
  background-color: rgb(0 0 0 / 2%);
}

.message-content-item > .ivu-row {
  padding: 15px 20px !important;
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