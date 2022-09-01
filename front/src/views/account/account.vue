<template>
  <div>
    <Form :model="formItem" label-position="top">
      <Row :gutter="30">
        <Col span="12">
          <FormItem>
            <div slot="label"><Icon type="md-key" /> {{ $t('signup.form.username') }}</div>
            <Input v-model="formItem.username" placeholder="" disabled>
              <a slot="append" @click="modal_setusername.show = !modal_setusername.show">
                <Icon type="md-create" size="15"/>
              </a>
            </Input>
          </FormItem>
        </Col>
        <Col span="12">
          <FormItem >
            <div slot="label"><Icon type="md-lock" /> {{ $t('signup.form.password') }}</div>
            <Input v-model="formItem.password" disabled type="password">
              <a slot="append" @click="modal_changePassword.show = !modal_changePassword.show">
                <Icon type="md-create" size="15"/>
              </a>
            </Input>
          </FormItem>
        </Col>
        <Col span="12">
          <Card dis-hover	>
            <FormItem :label="$t('account.joinedAt')">
              <Tag>
                <Time :time="formItem.joinTime || new Date().getTime()"/>
              </Tag>
            </FormItem>
          </Card>
        </Col>
        <Col span="12">
          <Card dis-hover	>
            <FormItem :label="$t('account.lastOnlineTime')">
              <Tag>
                <Time :time="formItem.lastOnlineTime || new Date().getTime()"/>
              </Tag>
            </FormItem>
          </Card>
        </Col>
      </Row>

      <Divider dashed></Divider>

      <FormItem :label="$t('profile.account.form.introduction')">
        <Edit :content="formItem.introduction" @change="handleIntroductionChange"/>
      </FormItem>

      <Divider dashed></Divider>

      <template v-if="formItem.origin.originName == null || formItem.origin.originUserId == null">
        <Alert show-icon type="error">
          {{ $t('account.bindOrigin.title') }}
          <Icon type="ios-bulb-outline" slot="icon"></Icon>
          <template slot="desc">
            <p>{{ $t('account.bindOrigin.content') }}</p><br>
            <router-link to="/bindOrigin">
              <Button>{{ $t('account.bindOrigin.travel') }}</Button>
            </router-link>
          </template>
        </Alert>
      </template>
      <template v-else>
        <Row :gutter="30">
          <Col flex="1">
            <FormItem :label="$t('signup.form.originEmail')">
              <Input v-model="formItem.origin.originName"
                     type="text"
                     disabled
                     :autosize="{minRows: 2,maxRows: 5}"
                     placeholder=""></Input>
            </FormItem>
          </Col>
          <Col flex="1">
            <FormItem :label="$t('signup.form.originName')">
              <Input v-model="formItem.origin.originUserId"
                     type="text"
                     disabled
                     :autosize="{minRows: 2,maxRows: 5}"
                     placeholder=""></Input>
            </FormItem>
          </Col>
        </Row>
      </template>

      <Divider dashed></Divider>

      <Row :gutter="30">
        <Col span="12">
          <FormItem :label="$t('profile.account.form.language')">
            <Select v-model="formItem.attr.language" class="switch-language" prefix="md-globe" placement="top-end"
                    @on-change="switchLanguage">
              <Option v-for="item in languages" :value="item.name" :key="item.name">{{ item.label }}</Option>
            </Select>
            <Alert show-icon>{{ $t('profile.account.form.languageSyncDescribe') }}</Alert>
          </FormItem>
        </Col>
        <Col span="12">
          <FormItem :label="$t('profile.account.form.showOrigin')">
            <i-switch v-model="formItem.attr.showOrigin"/>
            <p>{{ $t('profile.account.form.showOriginDescribe') }}</p>
          </FormItem>
        </Col>
        <Col span="12">
          <FormItem :label="$t('profile.account.form.allowDM')">
            <i-switch v-model="formItem.attr.allowDM"/>
            <p>{{ $t('profile.account.form.allowDMdescribe') }}</p>
          </FormItem>
        </Col>
      </Row>

      <Affix :offset-bottom="5">
        <Card :padding="10">
          <Row>
            <Col flex="1">
            </Col>
            <Col>
              <Button type="primary" :loading="formLoad" @click="onSave">
                {{ $t("basic.button.save") }}
              </Button>
            </Col>
          </Row>
        </Card>
      </Affix>
    </Form>

    <!-- 修改名称 S -->
    <Modal v-model="modal_setusername.show" @on-cancel="modal_setusername.index = 0">
      <p slot="header">
        <Icon type="ios-information-circle"></Icon>
        <span>{{ $t('profile.account.modifyName.title') }}</span>
      </p>
      <div>
        <Steps :current="modal_setusername.index" size="small">
          <Step :title="$t('profile.account.modifyName.steps[0].title')"></Step>
          <Step :title="$t('profile.account.modifyName.steps[1].title')"></Step>
          <Step :title="$t('profile.account.modifyName.steps[2].title')"></Step>
        </Steps>
        <Form ref="formValidate" label-position="top">
          <div v-if="modal_setusername.index == 0">
            <br>
            <Alert type="warning">
              <template slot="desc">
                <p> {{ $t('profile.account.modifyName.specification1') }} </p>
                <p> {{
                    $t('profile.account.modifyName.residueDegree', {changeNameLeft: formItem.changeNameLeft - 1 || 0})
                  }}</p>
                <b> {{ $t('profile.account.modifyName.specification2') }}</b>
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

            <FormItem :label="$t('captcha.title')" prop="captcha">
              <Input type="text" v-model="captchaUrl.value" size="large" maxlength="4"
                     :placeholder="$t('captcha.title')">
                <div slot="append" class="captcha-input-append" :alt="$t('captcha.get')">
                  <Captcha ref="captcha"></Captcha>
                </div>
              </Input>
            </FormItem>
          </div>
          <div v-if="modal_setusername.index == 2" align="center">
            <br>
            <Icon type="ios-cloud-done" size="200" color="#19be6b"/>
            <br>
          </div>
        </Form>
      </div>
      <div slot="footer">
        <Button size="large"
                :disabled="formItem.newname == ''"
                :loading="modal_setusername.load"
                v-if="modal_setusername.index > 0 && modal_setusername.index <= 1"
                @click="modal_setusername.index = 1 ? setUserName() : null">下一步
        </Button>
        <Button type="warning"
                size="large"
                v-if="modal_setusername.index <= 0"
                :disabled="(formItem.changeNameLeft - 1) != 0"
                @click="modal_setusername.index = 1">是的，更变账户名称
        </Button>
      </div>
    </Modal>
    <!-- 修改名称 E -->

    <!-- 修改密码 S -->
    <Modal v-model="modal_changePassword.show">
      <p slot="header">{{ $t("reset.title") }}</p>
      <div>
        <Form ref="formValidate" label-position="top">
          <FormItem :label="$t('reset.form.oldPassword')">
            <Input v-model="modal_changePassword.oldpassword" placeholder="******" minlength="6"></Input>
          </FormItem>
          <FormItem :label="$t('reset.form.newPassword')">
            <Input v-model="modal_changePassword.newpassword" placeholder="******" minlength="6"></Input>
          </FormItem>

          <FormItem :label="$t('captcha.title')" prop="captcha">
            <Input type="text" v-model="captchaUrl.value" size="large" maxlength="4"
                   :placeholder="$t('captcha.title')">
              <div slot="append" class="captcha-input-append" :alt="$t('captcha.get')">
                <Captcha ref="captcha"></Captcha>
              </div>
            </Input>
          </FormItem>
        </Form>
      </div>
      <div slot="footer">
        <Button size="large"
                :disabled="!modal_changePassword.oldpassword && !modal_changePassword.newpassword && !captchaUrl.value"
                :loading="modal_changePassword.load"
                @click="handChangePassword()">
          {{ $t('reset.title') }}
        </Button>
      </div>
    </Modal>
    <!-- 修改密码 E -->

  </div>
</template>

<script>
import Edit from "@/components/Edit.vue";
import Captcha from "../../components/Captcha";

import {api, http, http_token} from "../../assets/js";

export default {
  name: "account",
  data() {
    return {
      privileges: [],
      languages: [],
      formLoad: false,

      modal_changePassword: {
        load: false,
        show: false,
        newpassword: "",
        oldpassword: ""
      },

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
  components: {Edit, Captcha},
  created() {
    this.http = http_token.call(this);
    this.ready();
  },
  methods: {
    async ready() {
      const languages = await import('/public/conf/languages.json');
      const privileges = await import('/public/conf/privilege.json');
      this.privileges = this.privileges.concat(privileges.child)
      this.languages = this.languages.concat(languages.child)
    },
    /**
     * 修改密码
     */
    handChangePassword() {
      const {newpassword = '', oldpassword = ''} = this.modal_changePassword;
      this.modal_changePassword.load = true;
      this.http.post(api["user_changePassword"], {
        data: {
          data: {
            newpassword,
            oldpassword
          },
          encryptCaptcha: this.captchaUrl.hash,
          captcha: this.captchaUrl.value
        }
      }).then(res => {
        const d = res.data;
        if (d.success === 1) {
          this.$Message.success(d.message);

          this.$store.dispatch('signout').then(() => {
            this.signout();
          });

          this.modal_changePassword.show = false;

          this.$router.push({name: "signin"});
          return;
        }

        this.$Message.error(d.message);
      }).finally(() => {
        this.modal_changePassword.load = false;
      });
    },
    /**
     * 注销
     */
    signout() {
      http.post(api["account_signout"], {
        headers: {
          'x-access-token': this.$store.state.user.token
        }
      }).then((res) => {
        const d = res.data;
        if (d.success == 1) {
          this.$router.push('/signin');
        }
      })
    },
    handleIntroductionChange(val) {
      this.formItem.introduction = val;
    },
    /**
     * 切换语言
     * @param lang
     */
    switchLanguage(lang) {
      this.formItem.attr.language = lang;
    },
    /**
     * 修改名字
     */
    setUserName() {
      this.modal_setusername.load = true;

      if (!this.formItem.newname) return;

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
          this.modal_setusername.index += 1;

          this.getUserinfo();

          this.$Message.success(d.code);
        } else {
          this.$Message.error(d.message);
        }
      }).finally(() => {
        this.modal_setusername.load = false;
      })
    },
    /**
     * 保存表单
     */
    onSave() {
      const {
        introduction,
        attr = { language: this.$root.$i18n.locale, showOrigin: false, allowDM: false }
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

        if (d.success === 1) {

          // 同步本地语言
          if (d.data.attr.language) {
            this.$store.dispatch('setLang', d.data.attr.language);
          }

          this.$Message.success(d.code);
        }
      }).finally(() => {
        this.formLoad = false;
      })
    },
    /**
     * 获取用户信息
     */
    getUserinfo() {
      this.http.get(api["user_me"], {}).then((res) => {
        const d = res.data;

        if (d.success === 1) {
          this.$store.dispatch('setUserInfo', d.data);

          this.formItem = d.data;
        }
      })
    }
  },
  computed: {
    formItem() {
      return Object.assign({
        introduction: '',
        password: '******',
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
