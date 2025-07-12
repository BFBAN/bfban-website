<template>
  <div class="container">
    <div class="content">
      <br>
      <Row>
        <Col :xs="{push: 1}" :lg="{push: 0}">
          <Breadcrumb>
            <BreadcrumbItem :to="{name: 'home'}">{{ $t("header.index") }}</BreadcrumbItem>
            <BreadcrumbItem>{{ $t("signup.title") }}</BreadcrumbItem>
          </Breadcrumb>
        </Col>
      </Row>
      <br>

      <Card :padding="0" dis-hover>
        <Row>
          <Col :mg="{span: 0}" :lg="{span: 8}" v-show="!isMobile">
            <Banner :style="`min-height:600px; height: 100%`" :show-align="'upDown'" :height="600">
              <Row style="padding: 20px" type="flex" align="middle">
                <Col>
                  <router-link :to="{name: 'signin'}">{{ $t('signup.form.submitHint') }}</router-link>
                </Col>
                <Divider type="vertical"/>
                <Col>
                  <router-link :to="{name: 'forgetPassword'}">{{ $t('signup.form.forgetPasswordHint') }}</router-link>
                </Col>
              </Row>
            </Banner>
          </Col>
          <Col flex="1">
            <Card dis-hover :bordered="false">
              <div slot="title" v-if="!isMobile">
                <Steps :current="stepsIndex">
                  <Step :title="$t('signup.steps[0].title')" :content="$t('signup.steps[0].supplement')"></Step>
                  <Step v-show="!isOneStepToTheStomach" :title="$t('signup.steps[1].title')"
                        :content="$t('signup.steps[1].title')"></Step>
                  <Step v-show="!isOneStepToTheStomach" :title="$t('signup.steps[2].title')"
                        :content="$t('signup.steps[2].title')"></Step>
                  <Step v-show="!isOneStepToTheStomach" :title="$t('signup.steps[3].title')"
                        :content="$t('signup.steps[3].title')"></Step>
                </Steps>
              </div>

              <Row :gutter="isMobile ? 0 : 30">
                <Col span="24">
                  <template v-if="stepsIndex == 0">
                    <Alert type="info" show-icon>
                      <div v-html="$t('signup.eaPrivacy')"></div>
                      {{ $t('signup.checkAllEmail') }}
                    </Alert>
                    <br>
                  </template>
                  <Alert type="error" show-icon v-if="serverReturnMessage">
                    <b>{{ $t('signup.failed') }} :</b>
                    {{ serverReturnMessage }}
                  </Alert>

                  <Form ref="formValidate" label-position="top" :model="signup" :rules="ruleValidate">
                    <div v-show="isOneStepToTheStomach || stepsIndex == 0">
                      <FormItem :label="$t('signup.form.username')" prop="username">
                        <Input v-model="signup.username" maxlength="40" size="large"
                               :placeholder="$t('signup.placeholder.username')"/>
                      </FormItem>
                      <FormItem :label="$t('signup.form.password')" prop="password">
                        <Input type="password" password minlength="6" v-model="signup.password" size="large"
                               :placeholder="$t('signup.placeholder.password')"/>
                      </FormItem>
                    </div>

                    <div v-show="isOneStepToTheStomach || stepsIndex === 1">
                      <FormItem :label="$t('signup.form.originEmail')" prop="originEmail">
                        <Input v-model="signup.originEmail" size="large"
                               :placeholder="$t('signup.placeholder.originEmail')"/>
                      </FormItem>
                      <FormItem :label="$t('signup.form.originName')" prop="originName">
                        <Input v-model="signup.originName" size="large"
                               :placeholder="$t('signup.placeholder.originName')"/>
                      </FormItem>
                    </div>

                    <div v-show="isOneStepToTheStomach || stepsIndex === 2">
                      <FormItem :label="$t('captcha.title')" prop="captcha">
                        <Captcha  size="large" ref="captcha" @getCaptchaData="getCaptchaData"></Captcha>
                      </FormItem>
                    </div>

                    <template v-show="stepsIndex <= 2">
                      <FormItem>
                        <checkbox :size="'small'" v-model="isAgreeToTheTerms">
                          <span v-html="$t('signup.form.agreeToTheTerms')"></span>
                        </checkbox>
                      </FormItem>
                    </template>

                    <div v-show="stepsIndex === 3">
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
                      <Alert type="success" show-icon>{{ $t('signup.needVerify') }}</Alert>
                    </div>
                  </Form>
                </Col>
              </Row>
            </Card>
          </Col>
        </Row>

        <template v-if="stepsIndex <= 2">
          <Affix :offset-bottom="0" :useCapture="true" style="margin: 0px">
            <Divider size="small" plain style="margin: 0px"></Divider>

            <Card dis-hover :padding="8" :bordered="false">
              <Row>
                <Col flex="auto">
                  <checkbox :border="true" :size="'large'" v-model="isOneStepToTheStomach" v-show="!isMobile">"One step to the stomach" Mode</checkbox>
                </Col>

                <Col flex="auto" align="right" type="flex">
                  <ButtonGroup>
                    <Button v-if="!isOneStepToTheStomach && stepsIndex >= 0 && stepsIndex <= 2"
                            :disabled="stepsIndex == 0"
                            @click.prevent.stop="stepsIndex--" size="large">{{ $t('basic.button.prev') }}
                    </Button>
                    <Button v-if="!isOneStepToTheStomach && stepsIndex != 2 && stepsIndex >= 0 && stepsIndex <= 2"
                            @click.prevent.stop="stepsIndex++" size="large"
                            type="primary">
                      {{ $t('basic.button.next') }}
                    </Button>
                  </ButtonGroup>
                  <Divider type="vertical" v-if="!isOneStepToTheStomach && stepsIndex == 2"/>

                  <!-- 账户注册-未验证 -->
                  <template v-if="isOneStepToTheStomach || stepsIndex == 2" >
                    <Button
                        @click="onSignup"
                        :disabled="!signup.captcha || !isAgreeToTheTerms"
                        :loading="spinShow"
                        size="large"
                        type="primary">
                      {{ $t('basic.button.submit') }}
                    </Button>
                  </template>
                </Col>
              </Row>

            </Card>
          </Affix>
        </template>
      </Card>
    </div>
  </div>
</template>

<script>
import {api, application, http, http_token, mail, regular} from "@/assets/js";

import EmailTip from "@/components/EmailTip";
import Captcha from "@/components/captcha/index";
import Banner from "@/components/Banner"

export default new application({
  data() {
    return {
      stepsIndex: 0,
      ruleValidate: {
        username: [
          {required: true, min: 4, max: 40, trigger: 'blur'},
          {
            validator(rule, value, callback) {
              return regular.check('username', value).code == 0;
            },
            message: this.$t('signup.placeholder.username'),
            trigger: 'change'
          }
        ],
        password: [
          {required: true, min: 6, max: 40, trigger: 'blur'}
        ],
        originEmail: [
          {required: true, type: 'email', trigger: 'change'}
        ],
        originName: [
          {required: true, trigger: 'blur'}
        ],
        captcha: [
          {required: true}
        ]
      },
      signup: {
        username: '',
        password: '',
        originEmail: '',
        originName: '',
        captcha: {},
      },
      serverReturnMessage: '',
      spinShow: false,
      isOneStepToTheStomach: false,
      isAgreeToTheTerms: false,
    }
  },
  components: {EmailTip, Captcha, Banner},
  created() {
    this.http = http_token.call(this);
  },
  methods: {
    getCaptchaData(value) {
      this.signup.captcha = value;
    },

    /**
     * 提交注册信息
     */
    onSignup() {
      const that = this;
      this.$refs['formValidate'].validate(valid => {
        let {username, password, originEmail, originName, captcha} = this.signup;

        // 检查表单
        if (!valid) {
          this.$Message.info(this.$i18n.t('signup.fillIn'));
          return;
        }

        this.spinShow = true;

        http.post(api["account_signup"], {
          data: {
            data: {
              username,
              password,
              originEmail,	// must match the originName below
              originName,	  // must have one of bf series game
              language: mail.exchangeLangField(this.$root.$i18n.locale)
            },
            captcha
          }
        }).then(res => {
          const d = res.data;

          if (d.success === 1) {
            that.stepsIndex += 1;
            this.$Message.success({
              content: this.$t(`basic.tip['${d.code}']`, {
                message: d.message || ""
              }),
              duration: 10
            });
            return;
          }

          const message = this.$t(`basic.tip['${d.code}']`, {
            message: d.message || ""
          });
          this.serverReturnMessage = message;
          this.$Message.error({content: message, duration: 10});
        }).catch(err => {
          this.$Message.error(err);
          this.serverReturnMessage = err.toString();
        }).finally(() => {
          this.spinShow = false;

          if (this.$refs.captcha)
            this.$refs.captcha.refreshCaptcha();
        });
      })
    },

    /**
     * 清理表单字段
     * @param captcha
     * @param username
     * @param password
     * @param originEmail
     * @param originName
     * @param stepsIndex
     */
    onCleanSignupForm({
                        captcha = true,
                        username = true,
                        password = true,
                        originEmail = true,
                        originName = true,
                        stepsIndex = true
                      }) {
      if (captcha)
        this.signup.captcha = '';
      if (username)
        this.signup.username = '';
      if (password)
        this.signup.password = '';
      if (originEmail)
        this.signup.originEmail = '';
      if (originName)
        this.signup.originName = '';
      if (stepsIndex)
        this.stepsIndex = 0;
    },
  }
});
</script>

<style lang="less">

</style>
