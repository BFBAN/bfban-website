<template>
  <div class="container">
    <br>
    <div class="content">
      <Row>
        <Col :xs="{span: 22, push: 1, pull: 1}" :lg="{span: 24, push: 0, pull: 0}">
          <Card shadow>
            <p slot="title">{{ this.$route.name == bindOriginName ? $t("bindOrigin.title") : $t("signup.title") }}</p>

            <Steps :current="stepsIndex" class="mobile-hide">
              <Step title="基础信息" content="账户基本"></Step>
              <Step title="绑定" content="关联橘子平台"></Step>
              <Step title="验证码" content="验证是否机器人"></Step>
              <Step title="确认" content="邮箱验证码"></Step>
              <Step title="完成" content="注册结果"></Step>
            </Steps>

            <Divider class="mobile-hide"></Divider>

            <Form ref="formValidate" label-position="top" :model="signup" :rules="ruleValidate"
                  style="position: relative;">
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
                <FormItem :label="$t('signup.form.captcha')">
                  <Input type="text" v-model="signup.captcha"
                         size="large"
                         maxlength="4"
                         :placeholder="$t('signup.form.captcha')">
                    <div slot="append" class="captcha-input-append" :alt="$t('signup.form.getCaptcha')">
                      <Captcha ref="captcha"></Captcha>
                    </div>
                  </Input>
                </FormItem>
              </div>

              <template v-if="stepsIndex === 3">
                <EmailTip :email="signup.originEmail" @refreshCaptcha="refreshCaptcha"></EmailTip>
              </template>

              <template v-if="stepsIndex === 4">
                <div align="center">
                  <Icon type="md-checkmark-circle-outline" size="180" color="#42b983"/>
                </div>
              </template>

              <Row>
                <Col flex="auto">
                  <Button v-if="stepsIndex >=0 && stepsIndex <= 2"
                          :disabled="stepsIndex === 0 || this.$route.name == bindOriginName"
                          @click.prevent.stop="stepsIndex--" size="large">{{ $t('signup.prev') }}
                  </Button>
                  <Divider type="vertical"/>
                  <Button v-if="stepsIndex != 2  && stepsIndex >= 0 && stepsIndex <= 2"
                          @click.prevent.stop="stepsIndex++" size="large"
                          type="primary">{{ $t('signup.next') }}
                  </Button>
                </Col>
                <Col flex="auto" align="right" type="flex">
                  <Button v-if="stepsIndex == 2" long
                          @click.prevent.stop="handleSignup('formValidate')"
                          :disabled="!signup.captcha"
                          :loading="spinShow"
                          size="large" type="primary">{{ $t('signup.form.submit') }}
                  </Button>
                </Col>
              </Row>

              <Divider v-if="stepsIndex != 4 || stepsIndex != 3">
                <router-link :to="{name: 'signin'}">{{ $t('signup.form.submitHint') }}</router-link>
                <Divider type="vertical"/>
                <router-link :to="{name: 'forgetPassword'}">{{ $t('signup.form.forgetPasswordHint') }}</router-link>
              </Divider>
            </Form>
          </Card>
        </Col>
      </Row>
    </div>
    <br>
  </div>
</template>

<script>
import {http, api, http_token} from '../assets/js/index'
import {testWhitespace} from "@/mixins/common";

import EmailTip from "../components/EmailTip";
import Captcha from "../components/Captcha";

import _ from "lodash";

export default {
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

        // 截停，账户绑定
        if (this.$route.name == this.bindOriginName) {
          this.bindOrigin({originEmail, originName, captcha});
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
              this.$Message.success(d.message);
              return;
            }
          }).catch(err => {
            this.$Message.error(err.toString());

            that.signup.captcha = '';
            that.signup.originEmail = '';
            that.signup.originName = '';
            that.stepsIndex = 0;
          }).finally(() => {
            this.spinShow = false;
          });
        } else {
          this.$Message.error('请规范填写');
        }
      })
    },

    // 注册验证
    registerVerify(code) {
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

          this.refreshCaptcha();
        }
      });
    },

    // 绑定橘子账户
    bindOrigin({originEmail, originName, captcha}) {
      this.spinShow = true;

      this.http.post(api["user_bindOrigin"], {
        data: {
          data: {
            originEmail,	// must match the originName below
            originName,	// must have one of bf series game
            language: this.$root.$i18n.locale
          },
          encryptCaptcha: this.captchaUrl.hash,
          captcha,
        }
      }).then(res => {
        const d = res.data;

        if (d.success === 1) {
          this.stepsIndex++;

          this.$Message.success(d.message);
        } else {
          this.$Message.error(d.code);
        }
      }).finally(() => {
        this.spinShow = false;
      });
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
    }
  },
}
</script>

<style></style>
