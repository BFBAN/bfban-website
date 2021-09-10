<template>
  <div class="container">
    <br>
    <div class="content">
      <Row>
        <Col span="24">
          <Card shadow>
            <p slot="title">{{ this.$route.name == bindOriginName ? $t("bindOrigin.title") : $t("signup.title") }}</p>

            <Steps :current="stepsIndex">
              <Step title="基础信息" content="账户基本"></Step>
              <Step title="绑定" content="关联橘子平台"></Step>
              <Step title="验证码" content="验证是否机器人"></Step>
              <Step title="确认" content="邮箱验证码"></Step>
            </Steps>

            <Divider></Divider>

            <Form ref="formValidate" label-position="top" :rules="ruleValidate" style="position: relative;">
              <div v-if="stepsIndex == 0">
                <FormItem :label="$t('signup.form.username')" prop="username">
                  <Input v-model="signup.username" size="large" :placeholder="$t('signup.placeholder.username')"/>
                </FormItem>
                <FormItem :label="$t('signup.form.password')" prop="password">
                  <Input type="password" password v-model="signup.password" size="large" :placeholder="$t('signup.placeholder.password')"/>
                </FormItem>
              </div>

              <div v-if="stepsIndex == 1">
                <FormItem :label="$t('signup.form.originEmail')" prop="originEmail">
                  <Input v-model="signup.originEmail" size="large" :placeholder="$t('signup.placeholder.originEmail')"/>
                </FormItem>
                <FormItem :label="$t('signup.form.originName')" prop="originName">
                  <Input v-model="signup.originName" size="large" :placeholder="$t('signup.placeholder.originName')"/>
                </FormItem>
              </div>

              <div v-show="stepsIndex == 2">
                <FormItem :label="$t('signup.form.captcha')">
                  <Input type="text" v-model="signup.captcha"
                         size="large"
                         maxlength="4"
                         :placeholder="$t('signup.form.captcha')"></Input>
                  <div ref="captcha" :alt="$t('signup.form.getCaptcha')" @click="refreshCaptcha">
                    <div v-html="captchaUrl.content"></div>
                  </div>
                </FormItem>
              </div>

              <div v-if="stepsIndex == 3">
                <EmailTip :email="signup.originEmail"></EmailTip>
              </div>

              <Row>
                <Col span="12">
                  <Button v-if="stepsIndex >=0 && stepsIndex <= 2"
                          :disabled="stepsIndex == 0 || this.$route.name == bindOriginName"
                          @click.prevent.stop="stepsIndex--" size="large">{{ $t('signup.prev') }}
                  </Button>
                  <Divider type="vertical"/>
                  <Button v-if="stepsIndex != 2  && stepsIndex >= 0 && stepsIndex <= 2" @click.prevent.stop="stepsIndex++" size="large"
                          type="primary">{{ $t('signup.next') }}
                  </Button>
                </Col>
                <Col span="12" align="right" type="flex">
                  <Button v-if="stepsIndex == 2" long
                          @click.prevent.stop="handleSignup('formValidate')"
                          :disabled="!signup.captcha"
                          :loading="spinShow"
                          size="large" type="primary">{{ $t('signup.form.submit') }}
                  </Button>
                </Col>
              </Row>

              <Divider>
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
import {testWhitespace, waitForAction} from "@/mixins/common";
import EmailTip from "../components/EmailTip";
import _ from "lodash";

export default {
  data() {
    return {
      stepsIndex: 0,
      ruleValidate: {
        username: [
          {required: true, trigger: 'blur'},
          {}
        ],
        password: [
          {required: true, trigger: 'blur'}
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
      captchaUrl: {},
      spinShow: false,

      // 绑定页面名字
      bindOriginName: 'bindOrigin',
    }
  },
  components: {EmailTip},
  created() {
    const { query, name } = this.$route;

    this.http = http_token.call(this);

    if (name == this.bindOriginName) {
        this.stepsIndex = 1;

        delete this.ruleValidate.username;
        delete this.ruleValidate.password;
    }

    this.bindOriginVerify(query.code);
    this.refreshCaptcha();
  },
  methods: {
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
      // waitForAction.call(this.$refs.reCaptcha);
    },
    handleSignup (name) {
      const that = this;
      this.$refs[name].validate((valid) => {
        if (valid) {
          let {username, password, originEmail, originName, captcha} = _.each(this.signup, (v, k, o) => {
            o[k] = v.trim();
          });

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
                  lang: this.$root.$i18n.locale
                },
                encryptCaptcha: this.captchaUrl.hash,
                captcha
              }
            }).finally(() => {
              that.registerVerify(this.captchaUrl.hash);
              this.stepsIndex += 1;
              this.spinShow = false;
            })

          } else {
            this.$Message.error('请规范填写');
          }
        } else {
          this.$Message.error('Fail!');
        }
      })
    },
    registerVerify (code) {
      // 验证账户
      http.get(api["account_signupVerify"], {
        params: {code}
      }).then((res) => {
        const d = res.data;

        if (d.success === 1) {
          // dispatch 异步的
          this.$store.dispatch('signin', d.data)
            .then(() => {
              // redirect
              this.$router.push('/')
            })
        } else {
          this.$Message.error('注册失败 ' + d.msg);

          this.signup.password = '';
          this.signup.captcha = '';
          this.refreshCaptcha();
        }
      })
    },
    bindOrigin ({originEmail, originName, captcha}) {
      this.spinShow = true;

      this.http.post(api["user_bindOrigin"], {
        data: {
          data: {
            originEmail,	// must match the originName below
            originName,	// must have one of bf series game
            lang: this.$root.$i18n.locale
          },
          encryptCaptcha: this.captchaUrl.hash,
          captcha,
        }
      }).then(res => {
        const d = res.data;

        if (d.success == 1) {
          this.stepsIndex++;

          this.$Message.success(d.message);
        } else {
          this.$Message.error(d.code);
        }
      }).finally(() => {
        this.spinShow = false;
      });
    },
    //
    bindOriginVerify (code) {
      if (!code) { return }

      this.http.get(api["user_bindOriginVerify"], {
        params: {code}
      }).then(res => {
        const d = res.data;

        if (d.success == 1) {
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
