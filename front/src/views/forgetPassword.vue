<template>
  <div class="container">
    <div class="content">
      <br>
      <Breadcrumb>
        <BreadcrumbItem to="/">{{ $t("header.index") }}</BreadcrumbItem>
        <BreadcrumbItem>{{ $t("forgetPassword.title") }}</BreadcrumbItem>
      </Breadcrumb>
      <br>
      <Row>
        <Col span="24">
          <Card shadow>
            <Steps :current="stepsIndex">
              <Step title="基本信息" content="核对账户"></Step>
              <Step title="验证码" content="验证是否机器人"></Step>
              <Step title="绑定" content="关联橘子平台"></Step>
              <Step title="完成" content="绑定成功"></Step>
            </Steps>

            <Divider></Divider>

            <Form ref="formValidate" label-position="top" :rules="ruleValidate" style="position: relative;">
              <div v-if="stepsIndex == 0">
                <FormItem :label="$t('signup.form.username')" prop="username">
                  <Input v-model="forgetPassword.username" size="large" placeholder="4位以上用户名"/>
                </FormItem>
                <FormItem :label="$t('signup.form.originEmail')" prop="originEmail">
                  <Input v-model="forgetPassword.originEmail" size="large" placeholder="origin email"/>
                </FormItem>
                <FormItem :label="$t('signup.form.password')" prop="password">
                  <Input v-model="forgetPassword.password" type="password" size="large" placeholder="password"/>
                </FormItem>
              </div>

              <FormItem v-if="stepsIndex == 1" :label="$t('signup.form.captcha')">
                <Input type="text" v-model="forgetPassword.captcha"
                       size="large"
                       maxlength="4"
                       :placeholder="$t('signup.form.captcha')">
                </Input>
                <div ref="captcha" :alt="$t('signup.form.getCaptcha')" @click="refreshCaptcha">
                  <div v-html="captchaUrl.content"></div>
                </div>
              </FormItem>

              <div v-if="stepsIndex == 2">
                <EmailTip :email="forgetPassword.originEmail"></EmailTip>
              </div>

              <div v-if="stepsIndex == 3" align="center">
                <h1>恭喜完成重置 💐</h1>
                <Tag>新密码: {{forgetPassword.password}}</Tag>
                <p>返回<router-link to="/">{{$t("header.index")}}</router-link></p>
              </div>

              <Row>
                <Col span="12">
                  <Button v-if="stepsIndex >=0 && stepsIndex <= 1" :disabled="stepsIndex == 0 "
                          @click.prevent.stop="stepsIndex--" size="large">{{ $t('signup.prev') }}
                  </Button>
                  <Divider type="vertical"/>
                  <Button v-if="stepsIndex != 1  && stepsIndex >= 0 && stepsIndex <= 1"
                          @click.prevent.stop="stepsIndex++" size="large"
                          type="primary">{{ $t('signup.next') }}
                  </Button>
                </Col>
                <Col span="12" align="right" type="flex">
                  <Button v-if="stepsIndex == 1"
                          long
                          @click.prevent.stop="onForgetPassword"
                          :disabled="forgetPassword.captcha == ''"
                          :loading="spinShow"
                          size="large" type="primary">
                    {{ $t('signup.form.submit') }}
                  </Button>
                </Col>
              </Row>
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
import EmailTip from "../components/EmailTip";

export default {
  name: 'forgetPassword',
  data() {
    return {
      stepsIndex: 0,
      ruleValidate: {},
      forgetPassword: {
        username: '',
        originEmail: '',
        password: '',
        captcha: '',
      },
      captchaUrl: {},
      spinShow: false,

      verify: {
        load: 0,
      },
    }
  },
  components: {EmailTip},
  created() {
    const code = this.$route.params.code;
    this.refreshCaptcha();
    code != null ? this.forgetPasswordVerify(code.toString()) : null;
  },
  methods: {
    forgetPasswordVerify (code) {
      if (code == '' || code == undefined || code == null) {
        this.verify.iscode = false;
        return;
      }
      this.verify.iscode = true;
      this.verify.load = 0;

      http.get(api["user_forgetPasswordVerify"], {
        params: {code}
      }).then((res) => {
        const d = res.data;
        console.log(d);
        if (d.success == 1) {
          this.verify.load = 3;
          this.stepsIndex = 3;
          this.forgetPassword.password = d.data.newpassword;
        } else {
          this.$Message.error(d.msg);
          this.verify.load = -1;
          this.stepsIndex = 0;
        }
      }).catch((e) => {
        this.verify = {
          load: -1,
          msg: e.toString(),
        };
      })
    },
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
    },
    onForgetPassword: function () {
      this.spinShow = true;
      http.post(api["user_forgetPassword"], {
        data: {
          data: this.forgetPassword,
          encryptCaptcha: this.captchaUrl.hash,
          captcha: this.forgetPassword.captcha,
        },
      }).then(res => {
        if (res.data.success === 1) {
          this.stepsIndex ++;
          this.$Message.success(this.$i18n.t('detail.messages.submitSuccess'));
        }
      }).finally(() => {
        this.spinShow = false;
      });
    },
  },
  computed: {
    currentUser() {
      return this.$store.state.user || {token: ''};
    }
  }
}
</script>

<style scoped>

</style>
