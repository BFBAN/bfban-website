<template>
  <div class="container">
    <div class="content">
      <Row>
        <Col :xs="{span: 22, push: 1, pull: 1}" :lg="{span: 24, push: 0, pull: 0}">
          <Card shadow>
            <p slot="title">{{ this.$route.name == bindOriginName ? $t("bindOrigin.title") : $t("signup.title") }}</p>

            <Steps :current="stepsIndex" class="mobile-hide">
              <Step :title="$t('signup.steps[0].title')" :content="$t('signup.steps[0].supplement')"></Step>
              <Step :title="$t('signup.steps[1].title')" :content="$t('signup.steps[1].title')"></Step>
              <Step :title="$t('signup.steps[2].title')" :content="$t('signup.steps[2].title')"></Step>
              <Step :title="$t('signup.steps[3].title')" :content="$t('signup.steps[3].title')"></Step>
              <Step :title="$t('signup.steps[4].title')" :content="$t('signup.steps[4].title')"></Step>
            </Steps>

            <Divider dashed class="mobile-hide"></Divider>

            <Form ref="formValidate" label-position="top" :model="signup" :rules="ruleValidate">
              <Alert type="error" show-icon v-if="backBindOriginMsg">
                <b>{{ $t('signin.failed') }} :</b>
                {{ backBindOriginMsg }}
              </Alert>

              <template v-if="stepsIndex == 0">
                <FormItem :label="$t('signup.form.username')" prop="username">
                  <Input v-model="signup.username" maxlength="40" size="large"
                         :placeholder="$t('signup.placeholder.username')"/>
                </FormItem>
                <FormItem :label="$t('signup.form.password')" prop="password">
                  <Input type="password" password minlength="6" v-model="signup.password" size="large"
                         :placeholder="$t('signup.placeholder.password')"/>
                </FormItem>
              </template>

              <template v-if="stepsIndex === 1">
                <FormItem :label="$t('signup.form.originEmail')" prop="originEmail">
                  <Input v-model="signup.originEmail" size="large" :placeholder="$t('signup.placeholder.originEmail')"/>
                </FormItem>
                <FormItem :label="$t('signup.form.originName')" prop="originName">
                  <Input v-model="signup.originName" size="large" :placeholder="$t('signup.placeholder.originName')"/>
                </FormItem>
              </template>

              <div v-show="stepsIndex === 2">
                <FormItem :label="$t('captcha.title')">
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

              <template v-if="stepsIndex === 3">
                <EmailTip :email="signup.originEmail" @refreshCaptcha="$refs.captcha.refreshCaptcha"></EmailTip>
              </template>

              <template v-if="stepsIndex === 4">
                <div align="center">
                  <Icon type="md-checkmark-circle-outline" size="180" color="#42b983"/>
                </div>
              </template>

              <Row>
                <Col flex="auto">
                  <Button v-if="stepsIndex >=0 && stepsIndex <= 2"
                          :disabled="this.$route.name == bindOriginName ? stepsIndex <= 1 : stepsIndex == 0"
                          @click.prevent.stop="stepsIndex--" size="large">{{ $t('basic.button.prev') }}
                  </Button>
                  <Divider type="vertical"/>
                  <Button v-if="stepsIndex != 2  && stepsIndex >= 0 && stepsIndex <= 2"
                          @click.prevent.stop="stepsIndex++" size="large"
                          type="primary">{{ $t('basic.button.next') }}
                  </Button>
                </Col>
                <Col flex="auto" align="right" type="flex">
                  <!-- 注册 -->
                  <template v-if="stepsIndex == 2 && $route.name != bindOriginName">
                    <Button
                        long
                        @click="handleSignup('formValidate')"
                        :disabled="!signup.captcha"
                        :loading="spinShow"
                        size="large" type="primary">{{ $t('basic.button.submit') }}
                    </Button>
                  </template>
                  <!-- 绑定 -->
                  <template v-else-if="stepsIndex == 2 && $route.name == bindOriginName">
                    <Button long
                            @click="bindOrigin"
                            :disabled="!signup.captcha"
                            :loading="spinShow"
                            size="large" type="primary">{{ $t('basic.button.submit') }}
                    </Button>
                  </template>
                </Col>
              </Row>
            </Form>

            <Divider v-if="stepsIndex != 4 || stepsIndex != 3">
              <router-link :to="{name: 'signin'}">{{ $t('signup.form.submitHint') }}</router-link>
              <Divider type="vertical"/>
              <router-link :to="{name: 'forgetPassword'}">{{ $t('signup.form.forgetPasswordHint') }}</router-link>
            </Divider>
          </Card>
        </Col>
      </Row>
    </div>
    <br>
  </div>
</template>

<script>
import BFBAN from "../assets/js/bfban";

import {http, api, http_token} from '../assets/js/index'
import {testWhitespace} from "@/mixins/common";

import EmailTip from "../components/EmailTip";
import Captcha from "../components/Captcha";

import _ from "lodash";

export default new BFBAN({
  data() {
    return {
      stepsIndex: 0,
      ruleValidate: {
        username: [
          {required: true, min: 4, max: 40, trigger: 'blur'}
        ],
        password: [
          {required: true, min: 6, max: 40, trigger: 'blur'}
        ],
        originEmail: [
          {required: true, trigger: 'blur'}
        ],
        originName: [
          {required: true, trigger: 'blur'}
        ],
      },
      signup: {
        username: '',
        password: '',
        originEmail: '',
        originName: '',
        captcha: '',
      },
      backBindOriginMsg: '',
      spinShow: false,

      // 绑定页面名字
      bindOriginName: 'bindOrigin',
    }
  },
  components: {EmailTip, Captcha},
  created() {
    const {query, name} = this.$route;

    this.http = http_token.call(this);

    if (name == this.bindOriginName) {
      this.stepsIndex = 1;

      delete this.ruleValidate.username;
      delete this.ruleValidate.password;
    }

    // 注册验证
    this.registerVerify(query.code);
    // this.bindOriginVerify(query.code);
  },
  methods: {
    // 注册
    handleSignup(name) {
      const that = this;
      this.$refs[name].validate((valid) => {
        let {username, password, originEmail, originName, captcha} = _.each(this.signup, (v, k, o) => {
          o[k] = v.trim();
        });

        // 检查表单
        if (!valid) {
          this.$Message.error('Fail!');
          return;
        }

        if (username && !testWhitespace(username) && password && !testWhitespace(password) && captcha.length === 4) {
          this.spinShow = true;

          http.post(api["account_signup"], {
            data: {
              data: {
                username,
                password,
                originEmail,	// must match the originName below
                originName,	// must have one of bf series game
                language: this.$root.$i18n.locale
              },
              encryptCaptcha: this.$refs.captcha.hash,
              captcha
            }
          }).then(res => {
            const d = res.data;
            if (d.success === 1) {
              that.stepsIndex += 1;
              that.$Message.success(d.message);
              return;
            }

            that.backBindOriginMsg = res.message;
          }).catch(err => {
            that.$Message.error(err);

            that.signup.captcha = '';
            that.signup.originEmail = '';
            that.signup.originName = '';
            that.stepsIndex = 0;

          }).finally(() => {
            this.spinShow = false;
            this.$refs.captcha.refreshCaptcha();
          });
        } else {
          this.$Message.error('请规范填写');
        }
      })
    },

    // 注册验证
    async registerVerify(code) {
      if (!code) return;

      http.get(api["account_signupVerify"], {
        params: {
          code,
          lang: this.$root.$i18n.locale
        },
      }).then((res) => {
        const d = res.data;

        if (d.success === 1) {
          this.stepsIndex = 4;

          setInterval(function () {
            this.$router.push('/signin')
          }, 3000);
        } else {
          this.$Message.error(d.code || d.msg);

          this.signup.password = '';
          this.signup.captcha = '';

          this.$refs['captcha'].refreshCaptcha();
        }
      });
    },

    // 绑定橘子账户
    bindOrigin() {
      const that = this;
      let {originEmail, originName, captcha} = this.signup;

      that.$refs['formValidate'].validate((valid) => {
        // 检查表单
        if (!valid) { return; }

        that.spinShow = true;

        that.http.post(api["user_bindOrigin"], {
          data: {
            data: {
              originEmail,
              originName,
              language: that.$i18n.locale
            },
            encryptCaptcha: this.$refs.captcha.hash,
            captcha,
          }
        }).then((res) => {
          const d = res.data;

          if (d.success == 1) {
            that.stepsIndex++;
            that.$Message.success(d.message);
            return;
          } else if (
              d.error == 1
          ) {
            that.backBindOriginMsg = d.code + d.message;
            that.$Message.error(d.code);
          }

        }).finally(() => {
          that.$refs.captcha.refreshCaptcha();
          that.spinShow = false;
        });
      })
    },

    // 绑定橘子验证
    // 提供旧用户需要换绑
    bindOriginVerify(code) {
      if (!code) {
        return
      }

      this.http.get(api["user_bindOriginVerify"], {
        params: {code}
      }).then(res => {
        const d = res.data;

        if (d.success === 1) {
          this.stepsIndex = 3;
          this.$Message.success(d.message);

          setInterval(() => this.$router.back(), 3000);
        } else {
          this.$Message.error(d.code);
        }
      }).finally(() => {

      })
    },
  },
});
</script>

<style></style>
