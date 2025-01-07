<template>
  <div class="container">
    <div class="content">
      <br>
      <Row>
        <Col :xs="{push: 1}" :lg="{push: 0}">
          <Breadcrumb>
            <BreadcrumbItem :to="{name: 'home'}">{{ $t("header.index") }}</BreadcrumbItem>
            <BreadcrumbItem>{{ $t("bindOrigin.title") }}</BreadcrumbItem>
          </Breadcrumb>
        </Col>
      </Row>
      <br>

      <Row>
        <Col :xs="{span: 22, push: 1, pull: 1}" :lg="{span: 24, push: 0, pull: 0}">
          <Card dis-hover>
            <Steps :current="stepsIndex" class="mobile-hide" slot="title">
              <Step :title="$t('signup.steps[1].title')" :content="$t('signup.steps[1].title')"></Step>
              <Step :title="$t('signup.steps[2].title')" :content="$t('signup.steps[2].title')"></Step>
              <Step :title="$t('signup.steps[3].title')" :content="$t('signup.steps[3].title')"></Step>
              <Step :title="$t('signup.steps[4].title')" :content="$t('signup.steps[4].title')"></Step>
            </Steps>

            <div dis-hover :padding="50">
              <Form ref="bindOriginFormValidate" label-position="top" :model="signup" :rules="ruleValidate">
                <Alert type="error" show-icon v-if="bindOrigin.backServiceMsg">
                  <b>{{ $t('signup.failed') }} :</b>
                  {{ bindOrigin.backServiceMsg }}
                </Alert>

                <div v-show="stepsIndex === 0">
                  <FormItem :label="$t('signup.form.originEmail')" prop="originEmail">
                    <Input v-model="signup.originEmail" size="large"
                           :placeholder="$t('signup.placeholder.originEmail')"/>
                  </FormItem>
                  <FormItem :label="$t('signup.form.originName')" prop="originName">
                    <Input v-model="signup.originName" size="large" :placeholder="$t('signup.placeholder.originName')"/>
                  </FormItem>
                </div>

                <div v-show="stepsIndex === 1">
                  <FormItem :label="$t('captcha.title')" prop="captcha">
                    <Captcha ref="captcha" @getCaptchaData="getCaptchaData"></Captcha>

                  </FormItem>
                </div>

                <template v-if="stepsIndex === 2">
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
                </template>

                <template v-if="stepsIndex === 3">
                  <div align="center">
                    <template v-if="bindOriginVerify.state == 0">
                      <Icon type="md-refresh spin-icon-load" size="180"/>
                    </template>
                    <template v-else-if="bindOriginVerify.state == -1">
                      <Icon type="md-alert" size="180" color="red"/>
                      <p>{{ bindOriginVerify.backServiceMsg }}</p>
                      <br>
                      <Row type="flex" justify="center">
                        <Col>
                          <Button :to="{name: 'bindOrigin'}">{{ $t('basic.button.reset') }}</Button>
                        </Col>
                      </Row>
                      <br>
                      <Input :value="$route.query.code || ''" type="textarea" :autosize="true"></Input>
                    </template>
                    <template v-else-if="bindOriginVerify.state == 1">
                      <Icon type="md-checkmark-circle-outline" size="180" color="#42b983"/>
                    </template>
                  </div>
                </template>
              </Form>
            </div>

            <Row slot="default" v-if="stepsIndex < 2">
              <Col flex="auto">
                <Button v-if="stepsIndex >=0 && stepsIndex <= 2"
                        :disabled="stepsIndex == 0"
                        @click.prevent.stop="stepsIndex--" size="large">{{ $t('basic.button.prev') }}
                </Button>
                <Divider type="vertical"/>
                <Button v-if="stepsIndex >= 0 && stepsIndex <= 1"
                        @click.prevent.stop="stepsIndex++"
                        :disabled="stepsIndex >= 1"
                        size="large"
                        type="primary">
                  {{ $t('basic.button.next') }}
                </Button>
              </Col>
              <Col flex="auto" align="right" type="flex">
                <!-- 账户绑定-验证 -->
                <template v-if="stepsIndex == 1">
                  <Button @click="onBindOrigin"
                          :disabled="!signup.captcha"
                          :loading="bindOrigin.load"
                          long
                          size="large"
                          type="primary">
                    {{ $t('basic.button.submit') }}
                  </Button>
                </template>
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>
    </div>
  </div>
</template>

<script>
import {api, http_token, mail} from "@/assets/js";
import Captcha from "@/components/captcha/index";

export default {
  name: "bindOrigin",
  data() {
    return {
      stepsIndex: 0,
      ruleValidate: {
        originEmail: [
          {required: true, type: 'email', trigger: 'change'}
        ],
        originName: [
          {required: true, trigger: 'blur'}
        ],
        captcha: [
          {required: true, min: 4, max: 4, trigger: 'change'}
        ]
      },
      signup: {
        originEmail: '',
        originName: '',
        captcha: '',
      },

      bindOrigin: {
        load: false,
        backServiceMsg: ''
      },
      bindOriginVerify: {
        load: false,
        state: 0,
        backServiceMsg: ""
      },
    }
  },
  watch: {
    '$route': function (val) {
      if (val.name == 'bindOrigin' && !val.query.code) {
        this.stepsIndex = 0;
      }
    }
  },
  created() {
    this.http = http_token.call(this);

    this.onBindOriginVerify();
  },
  components: {Captcha},
  methods: {
    getCaptchaData(e) {
      this.signup.captcha = e;
    },
    // 绑定橘子账户
    // 发送邮件
    onBindOrigin() {
      const that = this;
      let {originEmail, originName, captcha} = this.signup;

      that.$refs.bindOriginFormValidate.validate((valid) => {
        // 检查表单
        if (!valid) {
          this.$Message.info(this.$i18n.t('signup.fillIn'));
          return;
        }

        that.bindOrigin.load = true;

        that.http.post(api["user_bindOrigin"], {
          data: {
            data: {
              originEmail,
              originName,
              language: mail.exchangeLangField(that.$i18n.locale)
            },
            captcha,
          }
        }).then(res => {
          const d = res.data;

          if (d.success == 1) {
            that.stepsIndex++;
            this.$Message.success({
              content: this.$t(`basic.tip['${d.code}']`, {
                message: d.message || ""
              }),
              duration: 10
            });

            return;
          }

          this.$Message.error(this.$t(`basic.tip['${d.code}']`, {
            message: d.message || ""
          }));
        }).catch(err => {
          that.bindOrigin.backServiceMsg = this.$i18n.t('signup.failed');
        }).finally(() => {
          that.bindOrigin.load = false;

          if (that.$refs.captcha)
            that.$refs.captcha.refreshCaptcha();
        });
      })
    },

    // 绑定橘子验证
    // 提供旧用户需要换绑
    onBindOriginVerify() {
      const {query} = this.$route;
      const code = query.code;

      if (!code) return

      this.stepsIndex = 3;
      this.bindOriginVerify.load = true;

      this.http.get(api["user_bindOriginVerify"], {
        params: {code}
      }).then(res => {
        const d = res.data;

        if (d.success === 1) {
          this.stepsIndex = 2;
          this.bindOriginVerify.state = 1;
          this.$Message.success(this.$t(`basic.tip['${d.code}']`, {
            message: d.message || ""
          }));

          setInterval(() => this.$router.back(), 3000);
          return;
        }

        this.bindOriginVerify.state = -1;
        this.$Message.error(this.$t(`basic.tip['${d.code}']`, {
          message: d.message || ""
        }));
      }).finally(() => {
        this.bindOriginVerify.load = false;
      })
    },
  },
}
</script>

<style lang="less" scoped>
@import "@/assets/css/icon.less";
</style>
