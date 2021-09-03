<template>
  <div class="container">
    <br>
    <div class="content">
      <Row>
        <Col span="11"></Col>
        <Col span="13">
          <Card shadow>
            <p slot="title">{{$t("signup.title")}}</p>

            <Steps :current="stepsIndex">
              <Step title="基础信息" content="账户基本"></Step>
              <Step title="第三方" content="第三方"></Step>
              <Step title="验证码" content="验证是否机器人"></Step>
            </Steps>

            <Divider></Divider>

            <Form label-position="top" :rules="ruleValidate" style="position: relative;">
              <block v-if="stepsIndex == 0">
                <FormItem :label="$t('signup.form.username')" prop="username">
                  <Input v-model="signup.username" size="large" placeholder="4位以上用户名" />
                </FormItem>
                <FormItem :label="$t('signup.form.password')" prop="password">
                  <Input type="password" password v-model="signup.password" size="large" placeholder="6位以上密码" />
                </FormItem>
              </block>

              <block v-if="stepsIndex == 1">
                <FormItem :label="$t('signup.form.originId')" prop="originId">
                  <Input v-model="signup.originId" size="large" placeholder="选题" />
                </FormItem>
                <FormItem :label="$t('signup.form.qq')" prop="qq">
                  <Input v-model="signup.qq" size="large" placeholder="选填" />
                </FormItem>
              </block>

              <block v-show="stepsIndex == 2">
                <FormItem :label="$t('signup.form.captcha')">
                  <Input type="text" v-model="signup.captcha" size="large" :placeholder="$t('signup.form.captcha')"></Input>
                  <img ref="captcha" :src="captchaUrl" :alt="$t('signup.form.getCaptcha')" @click="refreshCaptcha" />
                </FormItem>
              </block>

              <Row>
                <Col span="12">
                  <Button v-if="stepsIndex >=0 && stepsIndex <= 2" :disabled="stepsIndex == 0 " @click.prevent.stop="stepsIndex--" size="large">{{$t('signup.prev')}}</Button>
                  <Divider type="vertical" />
                  <Button v-if="stepsIndex != 2  && stepsIndex >= 0" @click.prevent.stop="stepsIndex++" size="large" type="primary">{{$t('signup.next')}}</Button>

                </Col>
                <Col span="12" align="right" type="flex" >
                  <Button v-if="stepsIndex == 2" long @click.prevent.stop="handleSignup" :loading="spinShow" size="large" type="primary">{{$t('signup.form.submit')}}</Button>
                </Col>
              </Row>

              <Divider>
                <router-link :to="{name: 'signin'}">{{$t('signup.form.submitHint')}}</router-link>
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
import { testWhitespace, getCsrfToken, waitForAction } from "@/mixins/common";
import ajax, { baseURL } from "@/mixins/ajax";
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
        originId: [
          {required: false, trigger: 'blur'}
        ],
        qq: [
          {required: false, trigger: 'blur'}
        ],
      },
      signup: {
        username: '',
        password: '',
        originId: '',
        qq: '',
        captcha: '',
      },
      captchaUrl: '',
      spinShow: false,
    }
  },
  created() {
    this.refreshCaptcha();
  },
  methods: {
    refreshCaptcha: function() {
      this.captchaUrl = baseURL + '/captcha?r=' + Math.random();

      // waitForAction.call(this.$refs.reCaptcha);
    },
    handleSignup: function() {
      this.$refs[name].validate((valid) => {
        if (valid) {

          let {username, password, originId, qq, captcha} = _.each(this.signup, (v, k, o) => {
            o[k] = v.trim();
          });

          if (username && !testWhitespace(username) && password && !testWhitespace(password) && captcha.length === 4) {
            this.spinShow = true;

            ajax({
              method: 'post',
              url: '/account/signup',
              headers: {
                // 'x-csrf-token': getCsrfToken(),
                // 'x-encrypt-captcha': Cookies.get('encryptCaptcha'),
              },
              data: {
                username,
                password,
                captcha,
                originId,
                qq,
              }
            })
                .then((res) => {
                  this.spinShow = false;

                  const d = res.data;
                  if (d.error === 1) {
                    this.$Message.error('注册失败 ' + d.msg);

                    this.signup.password = '';
                    this.signup.captcha = '';
                    this.refreshCaptcha();
                  } else {
                    // dispatch 异步的
                    this.$store.dispatch('signin', d.data)
                        .then(() => {
                          // redirect
                          this.$router.push('/')
                        })
                  }
                })
          } else {
            this.$Message.error('请规范填写');
          }

        } else {
          this.$Message.error('Fail!');
        }
      })

    },
  }
}
</script>

<style>
</style>

