<template>
  <Tabs :value="tagsName">
    <TabPane label="消息列表" name="message1">
      <List v-if="message.messages.length > 0">
        <ListItem v-for="(item, index) in message.messages" :key="index">
          <ListItemMeta :title="item.content" :description="item.createTime"/>
          <template slot="action">
            <li v-if="item.byUserId">
              <router-link :to="{path: '/account/' + item.byUserId, query: {repeat: true}}">
                <Icon type="ios-send" size="20" />
              </router-link>
            </li>
            <li v-if="item.haveRead == 0">
              <a href="javascript:void(0)" @click="onMessageMark(item.id, 0)">
                <Icon type="md-eye" size="20" />
              </a>
            </li>
            <li>
              <a href="javascript:void(0)" @click="onMessageMark(item.id, 2)">
                <Icon type="md-trash" size="20" />
              </a>
            </li>
          </template>
        </ListItem>
      </List>
      <Alert type="warning" show-icon v-else>
        {{$t('account.noReports')}}
      </Alert>
    </TabPane>
    <TabPane label="发送" name="message2">
      <Form>
        <Row :gutter="30">
          <Col span="12">
            <FormItem label="站内ID">
              <Select
                  v-model="message.id"
                  filterable
                  :remote-method="getPlayerList"
                  :loading="message.load">
                <Option v-for="(option, index) in message.playerList" :value="option.id" :key="index">
                  <Avatar :src="option.avatarLink"> </Avatar>
                  <span>{{option.originName}}</span>
                </Option>
              </Select>
            </FormItem>
          </Col>
          <Col span="12">
            <FormItem label="类型">
              <RadioGroup v-model="message.type" type="button" button-style="solid">
                <Radio :label="i.title" v-for="(i, index) in message.list" :key="index" v-show="i.q.indexOf(currentUser.userinfo.privilege) >= 0">
                  {{i.title}}
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
</template>

<script>
import {api, http, http_token} from "../../assets/js";

export default {
  name: "message",
  data() {
    return {
      tagsName: 'message1',
      privileges: [],
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
              q: ['super','admin']
            }, {
              title: 'toNormals',
              q: ['super', 'admin']
            }, {
              title: 'command',
              q: ['admin', 'dev']
            }
        ],
        messages: [],
        id: '',
        playerList: [],
        show: false,
        load: false,
        content: '',
      }
    }
  },
  watch: {
    $route: "loadData",
  },
  created() {
    this.http = http_token.call(this);

    this.loadData();
    this.getMessage();
  },
  methods: {
    async loadData() {
      const privileges = await import('/src/assets/privilege.json');
      this.privileges = privileges.child;
    },
    async onMessageMark (id, type) {
      await this.http.post(api["user_message_mark"], {
        params: {
          id,
          type: ['read', 'unread','del'][type],
        }
      });

      this.getMessage();
    },
    getPlayerList (query) {
      if (query !== '') {
        this.message.load = true;

        http.get(api["search"], {
          params: {
            param: query || '',
            scope: 'current',
          }
        }).then(res => {
          const d = res.data;

          if (d.success == 1) {
            this.message.playerList = d.data;
          }

          this.message.load = false;
        })
      } else {
        this.message.playerList = [];
      }
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
    getMessage() {
      this.http.get(api["user_message"]).then(res => {
        const d = res.data;
        if (d.success == 1) {
          this.message.messages = d.data.messages;
        }
      })
    },
  },
  computed: {
    currentUser() {
      return this.$store.state.user;
    },
  }
}
</script>

<style scoped>

</style>