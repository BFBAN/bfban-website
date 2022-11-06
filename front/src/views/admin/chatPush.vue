<template>
  <Tabs :value="tagsName">
    <TabPane :label="$t('profile.chat.tabsSend.itemName')" name="message0" v-if="isAdmin">
      <Card dis-hover>
        <Form slot="title" :model="message" :rules="message.ruleValidate">
          <Row :gutter="30">
            <Col span="12">
              <FormItem :label="$t('profile.chat.tabsSend.messageMethod')" prop="type">
                <Select v-model="message.type" :transfer="true">
                  <Option v-for="(item, item_index) in message.list"
                          v-show="item.privilege.filter(p => currentUser.userinfo.privilege.includes(p) ).length"
                          :value="item.title"
                          :label="$t('profile.chat.types.' + item.title + '.text' )"
                          :key="item_index">
                    {{ $t('profile.chat.types.' + item.title + '.text' ) }}
                    <p style="margin: 5px 0; font-size: 10px">
                      {{ $t('profile.chat.types.' + item.title + '.describe' ) }}
                    </p>
                    <PrivilegesTag :data="item.privilege"></PrivilegesTag>
                  </Option>
                </Select>
              </FormItem>
            </Col>
            <Col span="12" v-if="message.typeDictionary.includes(message.type)">
              <FormItem :label="$t('profile.chat.tabsSend.messageID')" prop="id">
                <AutoComplete
                    v-model="message.id"
                    :data="message.playerList"
                    :placeholder="$t('profile.chat.tabsSend.messageID')">
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
          <FormItem :label="$t('profile.chat.tabsSend.content')" prop="content">
            <Input v-model="message.content"
                   show-word-limit
                   type="textarea"
                   :placeholder="$t('profile.chat.placeholder')"
                   :maxlength="1000"
                   :autosize="{minRows: 5,maxRows: 10}"></Input>
          </FormItem>
        </Form>
        <Row :gutter="10">
          <Col flex="1"></Col>
          <Col>
            <Button type="primary"
                    v-voice-button
                    :loading="message.load"
                    :disabled="!message.type || !message.content"
                    @click="putMessage">{{ $t('basic.button.commit') }}</Button>
          </Col>
        </Row>
      </Card>
    </TabPane>
  </Tabs>
</template>

<script>
import BFBAN from "/src/assets/js/bfban";

import {api, http, http_token, message} from "../../assets/js";

import BusinessCard from "/src/components/businessCard.vue";
import PrivilegesTag from "/src/components/PrivilegesTag";
import messageConf from "/public/conf/message.json";

export default new BFBAN({
  name: "messagePush",
  data() {
    return {
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
    }
  },
  components: { BusinessCard, PrivilegesTag },
  created() {
    this.http = http_token.call(this);
  },
  methods: {
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

        message.playSendVoice();

        this.message.load = false;
        this.message.show = false;
      })
    },
  },
  computed: {

  }
});
</script>

<style lang="less" scoped>
</style>