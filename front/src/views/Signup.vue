<template>
  <div class="container">
    <br>
    <div class="content">
      <Row>
        <Col span="24">
          <Card shadow>
            <p slot="title">{{ $t("signup.title") }}</p>

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
                  <Input v-model="signup.username" size="large" placeholder="4位以上用户名"/>
                </FormItem>
                <FormItem :label="$t('signup.form.password')" prop="password">
                  <Input type="password" password v-model="signup.password" size="large" placeholder="6位以上密码"/>
                </FormItem>
              </div>

              <div v-if="stepsIndex == 1">
                <FormItem :label="$t('signup.form.originEmail')" prop="originEmail">
                  <Input v-model="signup.originEmail" size="large" placeholder="origin email"/>
                </FormItem>
                <FormItem :label="$t('signup.form.originName')" prop="originName">
                  <Input v-model="signup.originName" size="large" placeholder="orign name"/>
                </FormItem>
              </div>

              <div v-show="stepsIndex == 2">
                <FormItem :label="$t('signup.form.captcha')">
                  <Input type="text" v-model="signup.captcha" size="large"
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
                  <Button v-if="stepsIndex >=0 && stepsIndex <= 2" :disabled="stepsIndex == 0 "
                          @click.prevent.stop="stepsIndex--" size="large">{{ $t('signup.prev') }}
                  </Button>
                  <Divider type="vertical"/>
                  <Button v-if="stepsIndex != 2  && stepsIndex >= 0 && stepsIndex <= 2" @click.prevent.stop="stepsIndex++" size="large"
                          type="primary">{{ $t('signup.next') }}
                  </Button>
                </Col>
                <Col span="12" align="right" type="flex">
                  <Button v-if="stepsIndex == 2" long @click.prevent.stop="handleSignup('formValidate')" :loading="spinShow"
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
import {http, api, conf} from '../assets/js/index'
import {testWhitespace, waitForAction} from "@/mixins/common";
import EmailTip from "../components/EmailTip";
import _ from "lodash";

export default {
  data() {
    return {
      stepsIndex: 0,
      ruleValidate: {
        username: [
          {required: true, trigger: 'blur'}
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
        username: 'cabbagelol_a',
        password: 'zsezse',
        originEmail: 'nickmiku@foxmail.com',
        originName: 'Cabbagelol_Caime',
        captcha: '',
      },
      captchaUrl: {},
      spinShow: false,
    }
  },
  components: {EmailTip},
  created() {
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
    handleSignup: function (name) {
      const that = this;

      this.$refs[name].validate((valid) => {
        if (valid) {
          let {username, password, originEmail, originName, captcha} = _.each(this.signup, (v, k, o) => {
            o[k] = v.trim();
          });

          if (username && !testWhitespace(username) && password && !testWhitespace(password) && captcha.length === 4) {
            this.spinShow = true;

            http.post(api["account_signup"], {
              data: {
                data: {
                  username,
                  password,
                  originEmail,	// must match the originName below
                  originName	// must have one of bf series game
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
    }
  },
}
</script>

<style></style>
