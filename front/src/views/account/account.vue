<template>
  <div>
    <Form :model="formItem" label-position="top">
      <Row :gutter="30">
        <Col span="12">
          <FormItem label="账户名称">
            <Input v-model="formItem.username" placeholder="Enter something..."></Input>
          </FormItem>
        </Col>
        <Col span="12">
          <FormItem label="身份">
            <Tag>{{formItem.privilege}}</Tag>
          </FormItem>
        </Col>
      </Row>
      <FormItem label="自我介绍">
        <Input v-model="formItem.introduction" type="textarea" :autosize="{minRows: 2,maxRows: 5}" placeholder="Enter something..."></Input>
      </FormItem>
        <Row>
          <Col span="11">
            <FormItem label="加入时间">
              <Time :time="formItem.joinTime || new Date().getTime()" />
            </FormItem>
          </Col>
          <Col span="2" style="text-align: center">-</Col>
          <Col span="11">
            <FormItem label="最后上线时间">
              <Time :time="formItem.lastOnlineTime || new Date().getTime()" />
            </FormItem>
          </Col>
        </Row>
      <Alert show-icon type="warning" v-if="formItem.origin == null">
        Orign未绑定
        <div slot="default">
           您未绑定账户，无法发布任何内容
        </div>
      </Alert>
      <Row :gutter="30">
        <Col span="12">
          <FormItem label="OrginName">
            <Input v-model="formItem.originName" type="text" :autosize="{minRows: 2,maxRows: 5}" placeholder="Enter something..."></Input>
          </FormItem>
        </Col>
        <Col span="12">
          <FormItem label="OrginEmail">
            <Input v-model="formItem.originUserId" type="text" :autosize="{minRows: 2,maxRows: 5}" placeholder="Enter something..."></Input>
          </FormItem>
        </Col>
      </Row>
      <Divider></Divider>
      <FormItem>
        <Button type="primary" :loading="formLoad" @click="onSave">Submit</Button>
      </FormItem>
    </Form>
  </div>
</template>

<script>
import {api, http, http_token} from "../../assets/js";

export default {
  name: "account",
  data() {
    return {
      formItem: {},
      formLoad: false
    }
  },
  created() {
    this.http = http_token.call(this);

    this.getUserInfo();
  },
  methods: {
    getUserInfo () {
      const that = this;
      this.http.get(api["user_me"], {}).then((res) => {
        const d = res.data;

        if (d.success === 1) {
          this.formItem = Object.assign(d.data);
        }
      })
    },
    onSave () {
      const { introduction, attr = {language: this.$i18n.locale, showOrigin: false, allowDM: false } } = this.formItem;

      this.formLoad = true;
      this.http.post(api["user_me"], {
        data: {
          introduction,
          attr,
        }
      }).then((res) => {
        const d = res.data;

        if (d.success === 1) {
          this.$Message.success(d.code);
        }
      }).finally(() => {
        this.formLoad = false;
      })
    }
  },
  computed: {
    currentUser() {
      return this.$store.state.user || {token: ''};
    }
  }
}
</script>

<style scoped>

</style>
