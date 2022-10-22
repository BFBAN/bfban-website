<template>
  <div class="container">
    <br>
    <Row>
      <Col :xs="{push: 1}" :lg="{push: 0}">
        <Breadcrumb>
          <BreadcrumbItem :to="{name: 'home'}">{{ $t("header.index") }}</BreadcrumbItem>
          <BreadcrumbItem>{{ $t("signup.registerVerification.title") }}</BreadcrumbItem>
        </Breadcrumb>
      </Col>
    </Row>
    <br>

    <div class="content">
      <Card dis-hover>
        <Steps :current="stepsIndex" slot="title" v-if="!isMobile">
          <Step :title="$t('signup.steps[0].title')" :content="$t('signup.steps[0].supplement')"></Step>
          <Step :title="$t('signup.steps[1].title')" :content="$t('signup.steps[1].title')"></Step>
          <Step :title="$t('signup.steps[2].title')" :content="$t('signup.steps[2].title')"></Step>
          <Step :title="$t('signup.steps[3].title')" :content="$t('signup.steps[3].title')"></Step>
          <Step :title="$t('signup.steps[4].title')" :content="$t('signup.steps[4].title')"></Step>
        </Steps>

        <div>
          <div align="center">
            <template v-if="verify.state == 0">
              <Icon type="md-refresh spin-icon-load" size="180"/>
              <p> {{ $t("signup.registerVerification.validation") }}</p>
            </template>
            <template v-else-if="verify.state == -1">
              <Icon type="md-alert" size="180" color="red"/>
              <p><b>{{ $t("signup.registerVerification.error") }}</b></p>
              <p>{{ $t("signup.registerVerification.failure") }}{{ verify.msg }}</p>
              <br>
              <Row type="flex" justify="center">
                <Col>
                  <Button :to="{name: 'signup'}">{{ $t('basic.button.reset') }}</Button>
                </Col>
              </Row>
            </template>
            <template v-else-if="verify.state == 1">
              <Icon type="md-checkmark-circle-outline" size="180" color="#42b983"/>
              <p>
                {{ $t("signup.registerVerification.successful") }}
                <router-link v-show="!isLogin" class="mobile-hide" :to="{name: 'signin'}">
                  {{ $t("header.signin") }}
                </router-link>
              </p>
            </template>
          </div>
        </div>
      </Card>
    </div>
    <br>
  </div>
</template>

<script>
import BFBAN from "../assets/js/bfban";

import {http, api, conf, mail} from '../assets/js/index'

export default new BFBAN({
  data() {
    return {
      stepsIndex: 4,
      verify: {
        load: false,
        state: 0,
      }
    }
  },
  created() {
    this.registerVerify();
  },
  methods: {
    // 注册验证账户
    registerVerify() {
      const {code} = this.$route.query;

      if (code == '' || code == undefined || code == null) {
        this.$Message.info(this.$i18n.t('signup.failed'));
        this.verify.load = false;
        this.verify.state = -1;
        return;
      }

      this.verify.load = true;

      http.get(api["account_signupVerify"], {
        params: {
          code,
          lang: mail.exchangeLangField(this.$root.$i18n.locale)
        }
      }).then(res => {
        const d = res.data;

        if (d.success === 1) {
          this.verify.state = 1;

          // setInterval(function () {
          //   // dispatch 异步的
          //   this.$store.dispatch('signin', d.data)
          //     .then(() => {
          //       // redirect
          //       this.$router.push('/')
          //     })
          // }, 10000);

          return;
        }

        this.verify.state = -1;
        this.callbackMessage(d);
      }).catch(err => {
        this.verify.state = -1;
      }).finally(() => {
        this.verify.load = false;
      })
    },
    // 注册[SignupVerify]类请求回调
    // 消息国际化
    callbackMessage(data) {
      const that = this;

      // 基础
      switch (data.code) {
        case "signup.notFound": // 验证账户
          that.$Message.info(this.$i18n.t('signup.notFound'));
          break;
        case "signup.bad":
        case "signup.error":
        default:
          this.$Message.error(data.message || data.code);
          this.verify.load = -1;
          this.verify.msg = data.message || data.code;
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
  }
});
</script>

<style lang="less"></style>