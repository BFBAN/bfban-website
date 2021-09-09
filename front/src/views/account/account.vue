<template>
  <div>
    <Form :model="formItem" label-position="top">
      <Row :gutter="30">
        <Col span="12">
          <FormItem label="账户名称">
            <Input v-model="formItem.username" placeholder="" disabled>
              <a slot="append" @click="modal_setusername.show = !modal_setusername.show">
                <Icon type="md-create" size="15" />
              </a>
            </Input>
          </FormItem>
        </Col>
        <Col span="12">
          <FormItem label="身份">
            <span v-for="(i,index) in privileges" :key="index">
              <Tag type="dot" v-if="formItem.privilege == i.value"
                   color="success">
                {{ $t("account." + i.value) }}
              </Tag>
            </span>
          </FormItem>
        </Col>
      </Row>
      <FormItem label="自我介绍">
        <Edit :content="formItem.introduction" @change="handleIntroductionChange"/>
      </FormItem>
      <Row>
        <Col span="11">
          <FormItem label="加入时间">
            <Time :time="formItem.joinTime || new Date().getTime()"/>
          </FormItem>
        </Col>
        <Col span="2" style="text-align: center">-</Col>
        <Col span="11">
          <FormItem label="最后上线时间">
            <Time :time="formItem.lastOnlineTime || new Date().getTime()"/>
          </FormItem>
        </Col>
      </Row>
      <Divider></Divider>
      <Alert show-icon type="warning" v-if="formItem.origin.originName == null || formItem.origin.originUserId == null">
        Orign未绑定
        <div slot="default">
          您未绑定账户，无法发布任何内容
          <router-link to="/bindOrigin">绑定</router-link>
        </div>
      </Alert>
      <Row :gutter="30">
        <Col span="12">
          <FormItem label="OrginName">
            <Input v-model="formItem.origin.originName"
                   type="text"
                   disabled
                   :autosize="{minRows: 2,maxRows: 5}"
                   placeholder=""></Input>
          </FormItem>
        </Col>
        <Col span="12">
          <FormItem label="OrginEmail">
            <Input v-model="formItem.origin.originUserId"
                   type="text"
                   disabled
                   :autosize="{minRows: 2,maxRows: 5}"
                   placeholder=""></Input>
          </FormItem>
        </Col>
      </Row>
      <Divider></Divider>
      <Row :gutter="30">
        <Col span="12">
          <FormItem label="Language">
            <Select v-model="formItem.attr.language" class="switch-language" prefix="md-globe" placement="top-end"
                    @on-change="switchLanguage">
              <Option v-for="item in languages" :value="item.name" :key="item.name">{{ item.label }}</Option>
            </Select>
          </FormItem>
        </Col>
        <Col span="12">
          <FormItem label="showOrigin">
            <i-switch v-model="formItem.attr.showOrigin"/>
            <p>是否让你绑定的Origin在BFBAN可见.</p>
          </FormItem>
        </Col>
        <Col span="12">
          <FormItem label="allowDM">
            <i-switch v-model="formItem.attr.allowDM"/>
            <p>是否接受信息. 更多消息信息前往<router-link :to="{name: 'message'}">消息列表</router-link>查看</p>
          </FormItem>
        </Col>
      </Row>

      <Divider></Divider>

      <FormItem>
        <Button type="primary" :loading="formLoad" @click="onSave">Submit</Button>
      </FormItem>
    </Form>

    <Modal v-model="modal_setusername.show" @on-cancel="modal_setusername.index = 0">
      <p slot="header">
        <Icon type="ios-information-circle"></Icon>
        <span>修改名称</span>
      </p>
      <div>
        <Steps :current="modal_setusername.index" size="small">
          <Step title="提示"></Step>
          <Step title="填写"></Step>
          <Step title="完成"></Step>
        </Steps>
        <Form ref="formValidate" label-position="top">
          <div v-if="modal_setusername.index == 0">
            <br>
            <Alert type="warning">
              <template slot="desc">
                <p>你正在修改您的账户名称，这代表网站内看见都会更变，并且同时<b>登录的ID</b>同时变动,如果您不小心忘记新账户id，可能无法找回此账户，影响绑定的orgin账户，你需要通过非常长的人工审核.</p>
                <p>目前剩余修改名称{{formItem.changeNameLeft - 1 || 0}}次数</p>
                <b>你明白以上说明了吗?</b>
              </template>
            </Alert>
          </div>
          <div v-if="modal_setusername.index == 1">
            <br>
            <FormItem :label="$t('signup.form.username')">
              <Input v-model="formItem.username" size="large" disabled/>
            </FormItem>
            <FormItem :label="$t('signup.form.newusername')">
              <Input v-model="formItem.newname" size="large" placeholder="new name"/>
            </FormItem>

            <FormItem :label="$t('signup.form.captcha')" >
              <Input type="text" v-model="captchaUrl.value" size="large"
                     :placeholder="$t('signup.form.captcha')"></Input>
              <div ref="captcha" :alt="$t('signup.form.getCaptcha')" @click="refreshCaptcha">
                <div v-html="captchaUrl.content"></div>
              </div>
            </FormItem>
          </div>
          <div v-if="modal_setusername.index == 2" align="center">
            <br>
            <Icon type="ios-cloud-done" size="200" color="#19be6b" />
            <br>
          </div>
        </Form>
      </div>
      <div slot="footer">
        <Button size="large"
                :disabled="formItem.newname == ''"
                :loading="modal_setusername.load"
                v-if="modal_setusername.index > 0 && modal_setusername.index <= 1" @click="modal_setusername.index = 1 ? setUserName() : null">下一步</Button>
        <Button type="warning"
                size="large"
                v-if="modal_setusername.index <= 0"
                :disabled="(formItem.changeNameLeft - 1) != 0"
                @click="modal_setusername.index = 1">是的，更变账户名称
        </Button>
      </div>
    </Modal>
  </div>
</template>

<script>
import Edit from "@/components/Edit.vue";
import {api, http, http_token} from "../../assets/js";

export default {
  name: "account",
  data() {
    return {
      privileges: [],
      languages: [],
      formLoad: false,

      modal_setusername: {
        load: false,
        show: false,
        index: 0
      },

      captchaUrl: {
        value: '',
        content: ''
      },
    }
  },
  components: {Edit},
  created() {
    this.http = http_token.call(this);
    this.ready();
    this.refreshCaptcha();
  },
  methods: {
    async ready() {
      const languages = await import('/src/assets/languages.json');
      const privileges = await import('/src/assets/privilege.json');
      this.privileges = this.privileges.concat(privileges.child)
      this.languages = this.languages.concat(languages.child)
    },
    handleIntroductionChange (val) {
      this.formItem.introduction = val;
    },
    refreshCaptcha: function () {
      http.get(api["captcha"], {
        params: {
          r: Math.random()
        }
      }).then(res => {
        if (res.data.success === 1) {
          this.captchaUrl = res.data.data;
        }
      });
    },
    switchLanguage(lang) {
      this.formItem.attr.language = lang;
    },
    setUserName() {
      this.modal_setusername.load = true;
      this.http.post(api["user_changeName"], {
        data: {
          data: {
            newname: this.formItem.newname,
          },
          encryptCaptcha: this.captchaUrl.hash,
          captcha: this.captchaUrl.value
        }
      }).then((res) => {
        const d = res.data;

        if (d.success === 1) {
          this.modal_setusername.index +=1;

          this.getUserinfo();

          this.$Message.success(d.code);
        } else {
          this.$Message.error(d.message);
        }
      }).finally(() => {
        this.modal_setusername.load = false;
      })
    },
    onSave() {
      const {
        introduction,
        attr = {language: this.$root.$i18n.locale, showOrigin: false, allowDM: false}
      } = this.formItem;

      this.formLoad = true;
      this.http.post(api["user_me"], {
        data: {
          data: {
            introduction,
            attr,
          }
        }
      }).then((res) => {
        const d = res.data;

        if (d.success == 1) {
          this.$store.dispatch('setLang', d.data.attr.language);

          this.$Message.success(d.code);
        }
      }).finally(() => {
        this.formLoad = false;
      })
    },
    getUserinfo () {
      this.http.get(api["user_me"], {}).then((res) => {
        const d = res.data;

        if (d.success === 1) {
          this.$store.dispatch('setUserInfo', d.data);
        }
      })
    }
  },
  computed: {
    formItem() {
      return Object.assign({
        introduction: '',
        origin: {
          originName: '',
          originEmail: '',
        },
        newname: '',
        username: '',
        attr: {
          language: ''
        }
      }, this.$store.state.$userinfo);
    },
    currentUser() {
      return this.$store.state.user || {token: ''};
    }
  }
}
</script>

<style scoped>

</style>
