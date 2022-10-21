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
              <Step :title="$t('signup.steps[4].title')" :content="$t('signup.steps[4].title')"></Step>
            </Steps>

            <div dis-hover :padding="50">
              <Form ref="bindOriginFormValidate" label-position="top" :model="signup" :rules="ruleValidate">
                <Alert type="error" show-icon v-if="backServiceMsg">
                  <b>{{ $t('signup.failed') }} :</b>
                  {{ backServiceMsg }}
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
                    <Input type="text" v-model="signup.captcha"
                           size="large"
                           maxlength="4"
                           :placeholder="$t('captcha.title')">
                      <div slot="append" class="captcha-input-append" :alt="$t('captcha.get')">
                        <Captcha ref="captcha"></Captcha>
                      </div>
                    </Input>
                  </FormItem>
                </div>

                <template v-if="stepsIndex === 2">
                  <div align="center">
                    <Icon type="md-checkmark-circle-outline" size="180" color="#42b983"/>
                  </div>
                </template>
              </Form>
            </div>

            <Row slot="default">
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
                  <Button @click="bindOrigin"
                          :disabled="!signup.captcha"
                          :loading="spinShow"
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
import Captcha from "@/components/Captcha";

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

      spinShow: false,
      backServiceMsg: ''
    }
  },
  created() {
    this.http = http_token.call(this);

    this.bindOriginVerify();
  },
  components: {Captcha},
  methods: {
    // 绑定橘子账户
    // 发送邮件
    bindOrigin() {
      const that = this;
      let {originEmail, originName, captcha} = this.signup;

      that.$refs.bindOriginFormValidate.validate((valid) => {
        // 检查表单
        if (!valid) {
          this.$Message.info(this.$i18n.t('signup.fillIn'));
          return;
        }

        that.spinShow = true;

        that.http.post(api["user_bindOrigin"], {
          data: {
            data: {
              originEmail,
              originName,
              language: mail.exchangeLangField(that.$i18n.locale)
            },
            encryptCaptcha: this.$refs.captcha.hash,
            captcha,
          }
        }).then(res => {
          const d = res.data;

          if (d.success == 1) {
            that.stepsIndex++;
            that.$Message.success(d.message);

            return;
          }

          this.callbackMessage(d)
        }).catch(err => {
          that.backServiceMsg = this.$i18n.t('signup.failed');
        }).finally(() => {
          that.spinShow = false;

          if (that.$refs.captcha)
            that.$refs.captcha.refreshCaptcha();
        });
      })
    },

    // 绑定橘子验证
    // 提供旧用户需要换绑
    bindOriginVerify() {
      const {query} = this.$route;
      const code = query.code;

      if (!code) return

      this.spinShow = true;

      this.http.get(api["user_bindOriginVerify"], {
        params: {code}
      }).then(res => {
        const d = res.data;

        if (d.success === 1) {
          this.stepsIndex = 2;
          this.$Message.success('bindOrigin.messages.success');

          setInterval(() => this.$router.back(), 3000);
          return;
        }

        this.callbackMessage(d)
      }).finally(() => {
        this.spinShow = false;
      })
    },

    // 绑定[BindOrigin]类请求回调
    // 消息国际化
    callbackMessage(data) {
      const that = this;

      // 基础
      switch (data.code) {
        case "bindOrigin.originBindingExist":
          that.$Message.info(this.$i18n.t('bindOrigin.messages.expired'));
          break;
        case "bindOrigin.expired":
          that.$Message.info(this.$i18n.t('bindOrigin.messages.expired'));
          break;
        case "bindOrigin.notFound":
          that.$Message.info(this.$i18n.t('bindOrigin.messages.notFound'));
          break;
        case "bindOrigin.bad":
        default:
          that.$Message.error(data.code);
          that.backServiceMsg = data.message || data.code;
          break;
      }

      // 验证码
      if (data.code.indexOf('captcha') >= 0) {
        let captcha_code = data.code.split('.')[1];
        let captcha_text = this.$i18n.t(`captcha.messages.${captcha_code}`);
        if (captcha_code == 'gan') return;
        that.$Message.error({content: captcha_text, duration: 6});
        that.backServiceMsg += `,${captcha_text}`;
      }
    }
  },
}
</script>

<style lang="less" scoped>

</style>