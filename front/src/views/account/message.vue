<template>
  <div>
    <div>
      <Tabs value="name1">
        <TabPane label="消息列表" name="name1">
          <List item-layout="vertical">
            <ListItem v-for="(item, index) in message.messages" :key="index">
              <ListItemMeta :title="item.content" :description="item.createTime"/>
              <template slot="action">
                <li>
                  <a href="">已阅</a>
                </li>
              </template>
            </ListItem>
          </List>
        </TabPane>
        <TabPane label="发送" name="name2">
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
    </div>
  </div>
</template>

<script>
import {api, http, http_token} from "../../assets/js";

export default {
  name: "message",
  data() {
    return {
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

    this.getMessage();
    this.loadData();
  },
  methods: {
    async loadData() {
      const privileges = await import('/src/assets/privilege.json');
      this.privileges = privileges.child;
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
      this.http.get(api["user_message"], {}).then(res => {
        const d = res.data;
        if (d.success == 1) {
          this.message = Object.assign(this.message, d.data);
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