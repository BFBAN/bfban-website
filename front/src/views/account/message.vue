<template>
  <div>
    <Tabs :value="tagsName">
      <TabPane label="消息" name="message0">
        <Card dis-hover :padding="0">
          <Row>
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
                      <Avatar icon="md-notifications" v-else>
                        {{ i.text[0] }}
                      </Avatar>
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
              <template v-if="messageList[selectWindow]">
                <div v-for="(child, child_index) of messageList[selectWindow].child" :key="child_index">
                  <Row :gutter="5">
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

                  <divider></divider>
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
                  <Button long>
                    <router-link :to="{path: '/account/' + selectWindow, query: {repeat: true}}">
                      <Icon type="ios-send" size="20"/>
                    </router-link>
                  </Button>
                </div>
              </template>
              <template v-else>
                {{ $t('basic.tip.notcontent') }}
              </template>
            </Col>
          </Row>
        </Card>
      </TabPane>
      <TabPane label="发送" name="message2" v-if="isAdmin">
        <Form>
          <Row :gutter="30">
            <Col span="12">
              <FormItem label="站内ID">
                <AutoComplete
                    v-model="message.id"
                    :data="message.playerList"
                    @on-search="getPlayerList"
                    placeholder="">
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
            <Col span="12">
              <FormItem label="类型">
                <RadioGroup v-model="message.type" type="button" button-style="solid">
                  <Radio :label="i.title" v-for="(i, index) in message.list" :key="index"
                         v-show="i.q.indexOf(currentUser.userinfo.privilege) >= 0">
                    {{ i.title }}
                  </Radio>
                </RadioGroup>
              </FormItem>
            </Col>
          </Row>
          <FormItem label="聊天">
            <Input v-model="message.content"
                   type="textarea" :autosize="{minRows: 5,maxRows: 10}"></Input>
          </FormItem>
        </Form>
        <Button @click="setMessage">发送</Button>
      </TabPane>
    </Tabs>
  </div>
</template>

<script>
import {api, http, http_token} from "../../assets/js";

export default {
  name: "message",
  data() {
    return {
      tagsName: 'message0',
      privileges: [],
      selectWindow: '',
      message: {
        list: [
          {
            title: 'direct',
            q: ['normal', 'admin', 'root', 'super']
          }, {
            title: 'warn',
            q: ['admin']
          }, {
            title: 'fatal',
            q: ['super']
          }, {
            title: 'toAll',
            q: ['super']
          }, {
            title: 'toAdmins',
            q: ['super', 'admin']
          }, {
            title: 'toNormals',
            q: ['super', 'admin']
          }, {
            title: 'command',
            q: ['admin', 'dev']
          }
        ],
        messages: [],
        playerList: [],
        id: '',
        show: false,
        load: false,
        content: '',
      },
      messageUser: [],
      messageList: {}
    }
  },
  watch: {
    $route: "loadData",
  },
  created() {
    this.http = http_token.call(this);

    this.loadData();
  },
  methods: {
    async loadData() {
      const privileges = await import('/public/conf/privilege.json');
      this.privileges = privileges.child;

      await this.getMessage();

      if (this.messageUser.length > 0) {
        this.selectWindow = this.messageUser[0].value;
      }
    },
    async onMessageMark(id, type) {
      await this.http.post(api["user_message_mark"], {
        params: {
          id,
          type: ['read', 'unread', 'del'][type],
        }
      });

      this.getMessage();
    },
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
    setMessage() {
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
        this.message.load = false;
        this.message.show = false;
      })
    },
    /**
     * 获取消息列表
     */
    getMessage() {
      this.http.get(api["user_message"]).then(res => {
        const d = res.data;
        if (d.success == 1) {
          this.message.messages = d.data.messages;
          let messageUser = [];
          let messageList = {};

          d.data.messages.forEach(i => {
            let num = 0;

            switch (i.type) {
              case 'warn':
                // 系统通知类

                messageUser.forEach(t => {
                  t.type == i.type ? num += 1 : null
                });

                if (num <= 0) {
                  messageUser.push({
                    text: "@" + this.$i18n.t('profile.message.type.' + i.type),
                    value: i.type,
                    type: i.type
                  });
                }
                break;
              case "direct":
                // 用户通知类
                messageUser.forEach(t => {
                  t.byUserId == i.byUserId ? num += 1 : null
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

            let val = i.type == 'direct' ? i.byUserId : i.type;
            if (!messageList[val]) {
              messageList[val] = {child: [], num: 0}
            }
            messageList[val].child.push(Object.assign({
              time: i.createTime,
              content: i.content,
              uri: ''
            }, i));
            messageList[val].type = i.type;
            messageList[val].num = messageList[val].child.length || 0;
          });

          this.messageList = messageList;
          this.messageUser = messageUser;
        }
      });
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
}
</script>

<style scoped>
.message-user {
  width: 200px;
  padding: 10px;
}

.message-user-item {
  margin-bottom: 10px;
}

.message-content {
  min-height: 300px;
  max-height: 1000px;
  overflow: auto;
  padding: 10px;
  background-color: #f2f2f2;
}

.message-content-footer {
  padding-top: 10px;
}
</style>