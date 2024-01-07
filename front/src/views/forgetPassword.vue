<template>
  <div class="container">
    <div class="content">
      <br>
      <Row>
        <Col :xs="{push: 1}" :lg="{push: 0}">
          <Breadcrumb>
            <BreadcrumbItem :to="{name: 'home'}">{{ $t("header.index") }}</BreadcrumbItem>
            <BreadcrumbItem>{{ $t("forgetPassword.title") }}</BreadcrumbItem>
          </Breadcrumb>
        </Col>
      </Row>
      <br>

      <Row>
        <Col span="24">
          <Card dis-hover>
            <Steps :current="stepsIndex" slot="title">
              <Step :title="$t('signup.steps[0].title')" :content="$t('signup.steps[0].title')"></Step>
              <Step :title="$t('signup.steps[1].title')" :content="$t('signup.steps[1].title')"></Step>
              <Step :title="$t('signup.steps[2].title')" :content="$t('signup.steps[2].title')"></Step>
              <Step :title="$t('signup.steps[3].title')" :content="$t('signup.steps[3].title')"></Step>
              <Step :title="$t('signup.steps[4].title')" :content="$t('signup.steps[4].title')"></Step>
            </Steps>

            <div>
              <Form ref="formValidate" label-position="top" :rules="ruleValidate" style="position: relative;">
                <div v-if="stepsIndex == 0">
                  <FormItem :label="$t('forgetPassword.form.username')" prop="username">
                    <Input v-model="forgetPassword.username" size="large" :placeholder="$t('forgetPassword.placeholder.username')"/>
                  </FormItem>
                  <FormItem :label="$t('forgetPassword.form.originEmail')" prop="originEmail">
                    <Input v-model="forgetPassword.originEmail" size="large" :placeholder="$t('forgetPassword.placeholder.originEmail')"/>
                  </FormItem>
                  <Alert show-icon><span v-html="$t('forgetPassword.forgetUsername')"></span></Alert>
                </div>

                <FormItem v-if="stepsIndex == 1" :label="$t('captcha.title')">
                  <Input type="text" v-model="forgetPassword.captcha"
                         size="large"
                         maxlength="4"
                         :placeholder="$t('captcha.title')">
                    <div slot="append" class="captcha-input-append">
                      <Captcha ref="captcha"></Captcha>
                    </div>
                  </Input>
                </FormItem>

                <div v-if="stepsIndex == 2">
                  <EmailTip :email="forgetPassword.originEmail"></EmailTip>
                  <Card dis-hover>
                  <Row :gutter="16" type="flex" justify="center" align="middle">
                    <Col>
                      <Icon type="md-cloud" color="#535353" size="80"/>
                    </Col>
                    <Col>
                      <Icon type="md-return-right" color="#aaa" size="30"/>
                    </Col>
                    <Col>
                      <Icon type="md-mail" color="#535353" size="80"/>
                    </Col>
                  </Row>
                  </Card>
                  <br>
                  <Alert type="success" show-icon>{{ $t('forgetPassword.checkEmail') }}</Alert>
                </div>

                <div v-if="stepsIndex == 3">
                  <FormItem :label="$t('signup.form.password')" prop="password">
                    <Input type="password" password minlength="6" v-model="forgetPassword.password" size="large"
                           :placeholder="$t('signup.placeholder.password')"/>
                  </FormItem>
                </div>

                <!-- 重置成功 S -->
                <div v-if="stepsIndex == 4" align="center">
                  <h1>{{ $t('forgetPassword.resetSuccess') }}</h1>
                </div>
                <!-- 重置成功 E -->

                <Row>
                  <Col span="12">
                    <Button v-if="button.prev"
                            :disabled="button.prevShow"
                            @click.prevent.stop="stepsIndex--; onStepsIndex();" size="large">{{ $t('basic.button.prev') }}
                    </Button>
                    <Divider type="vertical"/>
                    <Button v-if="button.next"
                            :disabled="button.nextShow"
                            @click.prevent.stop="stepsIndex++; onStepsIndex();" size="large"
                            type="primary">{{ $t('basic.button.next') }}
                    </Button>
                  </Col>
                  <Col span="12" align="right" type="flex">
                    <Button v-if="button.submit"
                            long
                            @click.prevent.stop="onSubmit"
                            :disabled="forgetPassword.captcha == ''"
                            :loading="spinShow"
                            size="large" type="primary">
                      {{ $t('basic.button.submit') }}
                    </Button>
                  </Col>
                </Row>
              </Form>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  </div>
</template>

<script>
import Application from "../assets/js/application";
import {http, api, conf, mail} from '../assets/js/index'
import EmailTip from "../components/EmailTip";
import Captcha from "../components/Captcha";

export default new Application({
  name: 'forgetPassword',
  data() {
    return {
      button: {
        next: true,
        nextShow: false,
        prev: true,
        prevShow: true,
        submit: false
      },
      stepsIndex: 0,
      ruleValidate: {},
      forgetPassword: {
        username: '',
        originEmail: '',
        password: '',
      },
      spinShow: false,

      verify: {
        load: 0,
      },
    }
  },
  components: {EmailTip, Captcha},
  created() {
    const {code} = this.$route.query;
    if (code) {
      this.stepsIndex = 3;
      this.onStepsIndex();
    }
  },
  methods: {
    onStepsIndex () {
      let stepsIndex = this.stepsIndex;
      this.button.submit = false;

      switch (stepsIndex) {
        case 0:
          this.button.prev = true;
          this.button.prevShow = true;
          this.button.next = true;
          break;
        case 1:
          this.button.prev = true;
          this.button.prevShow = false;
          this.button.next = false;
          this.button.submit = true;
          break;
        case 2:
          this.button.prev = false;
          this.button.next = false;
          break;
        case 3:
          this.button.prev = false;
          this.button.next = false;
          this.button.submit = true;
          break;
        case 4:
          this.button = {};
          break;
      }

      return this.stepsIndex;
    },

    /**
     * 提交
     */
    onSubmit () {
      switch (this.stepsIndex) {
        case 1:
          this.onForgetPassword();
          break;
        case 3:
          this.forgetPasswordVerify();
          break;
      }
    },

    /**
     * 重置密码 key验证
     * @param code
     */
    forgetPasswordVerify() {
      const {code} = this.$route.query;
      const newpassword = this.forgetPassword.password;
      this.spinShow = true;

      if (code == '' || code == undefined || code == null) {
        this.verify.iscode = false;
        return;
      }
      this.verify.iscode = true;
      this.verify.load = 0;

      http.post(api["user_forgetPasswordVerify"], {
        data: {
          data: {
            code,
            newpassword
          }
        }
      }).then(res => {
        const d = res.data;

        if (d.success === 1) {
          this.verify.load = 3;
          this.stepsIndex = 4;
          this.$Message.success(this.$t(`basic.tip['${d.code}']`, {
            message: d.message || ""
          }));
          return;
        }

        this.verify.load = -1;
        this.$Message.error(this.$t(`basic.tip['${d.code}']`, {
          message: d.message || ""
        }));
      }).catch((e) => {
        this.verify = {
          load: -1,
          msg: e.toString(),
        };
      }).finally(() => {
        this.spinShow = false;
        this.onStepsIndex();
      });
    },

    /**
     * 提交 重置密码
     */
    onForgetPassword () {
      this.spinShow = true;

      this.forgetPassword.language = this.$root.$i18n.locale;

      http.post(api["user_forgetPassword"], {
        data: {
          data: this.forgetPassword,
          encryptCaptcha: this.$refs.captcha.hash,
          captcha: this.forgetPassword.captcha,
          language: mail.exchangeLangField(this.$root.$i18n.locale)
        },
      }).then(res => {
        const d = res.data;

        if (d.success === 1) {
          this.stepsIndex++;
          this.$Message.success(this.$t(`basic.tip['${d.code}']`, {
            message: d.message || ""
          }));
          return;
        }

        this.$Message.error(this.$t(`basic.tip['${d.code}']`, {
          message: d.message || ""
        }));
      }).catch(err => {
        this.$Message.error(err.toString());
      }).finally(() => {
        this.onStepsIndex();
        this.spinShow = false;
      });
    },
  },
  computed: {
    currentUser() {
      return this.$store.state.user || {token: ''};
    }
  }
});
</script>

<style lang="less" scoped>

</style>
