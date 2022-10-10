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
        <div v-if="verify.iscode">
          <div v-if="verify.load == 0">
            <!-- 验证中 -->
            {{ $t("signup.registerVerification.validation") }}
          </div>
          <div v-else-if="verify.load == 1">
            <!-- 验证成功 -->
            {{ $t("signup.registerVerification.successful") }}
            <router-link v-show="!isLogin" class="mobile-hide" :to="{name: 'signin'}">
              {{ $t("header.signin") }}
            </router-link>！
          </div>
          <div v-else-if="verify.load == -1">
            <!-- 错误: -->
            {{ $t("signup.registerVerification.error") }} : {{ verify.msg }}
          </div>
        </div>
        <div v-else>
          <!-- 格式不正确 -->
          {{ $t("signup.registerVerification.failure") }}
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
      verify: {
        load: 0,
        iscode: false,
      }
    }
  },
  created() {
    this.registerVerify();
  },
  methods: {
    registerVerify () {
      const {code} = this.$route.query;
      if (code == '' || code == undefined || code == null) {
        this.verify.iscode = false;
        return;
      }
      this.verify.iscode = true;
      this.verify.load = 0;

      // 验证账户
      http.get(api["account_signupVerify"], {
        params: {
          code,
          lang: mail.exchangeLangField(this.$root.$i18n.locale)
        }
      }).then(res => {
        const d = res.data;

        if (d.error !== 1) {
          this.verify.load = 1;
          setInterval(function () {
            // dispatch 异步的
            this.$store.dispatch('signin', d.data)
              .then(() => {
                // redirect
                this.$router.push('/')
              })
          }, 10000);
        } else {
          this.$Message.error('注册失败 ' + d.msg);
          this.verify.load = -1;
          this.verify.msg = d.msg;
          // this.refreshCaptcha();
        }
      }).catch((e) => {
        this.verify = {
          load: -1,
          msg: e.toString(),
        };
      })
    }
  }
});
</script>

<style lang="less"></style>