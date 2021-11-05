<template>
  <div class="container">
    <br>
    <Row>
      <Col :xs="{push: 1}" :lg="{push: 0}">
        <Breadcrumb>
          <BreadcrumbItem :to="{name: 'home'}">{{ $t("header.index") }}</BreadcrumbItem>
          <BreadcrumbItem>{{ $t("report.info.verify") }}</BreadcrumbItem>
        </Breadcrumb>
      </Col>
    </Row>
    <br>

    <div class="content">
      <Card dis-hover>
        <div v-if="verify.iscode">
          <div v-if="verify.load == 0">
            验证账户中
          </div>
          <div v-else-if="verify.load == 1">
            验证成功！
            <router-link v-show="!isLogin" class="mobile-hide" :to="{name: 'signin'}">
              {{$t("header.signin")}}
            </router-link>！
          </div>
          <div v-else-if="verify.load == -1">
            错误: {{verify.msg}}
          </div>
        </div>
        <div v-else>
          错误的验证地址，请检查验证码是否正确
        </div>
      </Card>
    </div>
    <br>
  </div>
</template>

<script>
import {http, api, conf} from '../assets/js/index'
import {testWhitespace, waitForAction} from "@/mixins/common";
import _ from "lodash";

export default {
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
      const code = this.$route.params.code;

      if (code == '' || code == undefined || code == null) {
        this.verify.iscode = false;
        return;
      }
      this.verify.iscode = true;
      this.verify.load = 0;

      // 验证账户
      http.get(api["account_signupVerify"], {
        params: {code}
      }).then((res) => {
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
}
</script>

<style></style>
