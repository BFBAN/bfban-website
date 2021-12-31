<template>
  <div class="container">
    <div class="content">
      <br>
      <Row>
        <Col :xs="{push: 1}" :lg="{push: 0}">
          <Breadcrumb>
            <BreadcrumbItem :to="{name: 'home'}">{{ $t("header.index") }}</BreadcrumbItem>
            <BreadcrumbItem>{{ $t("forgetPassword.title") }}</BreadcrumbItem>
          </Breadcrumb>
        </Col>
      </Row>
      <br>

      <Row>
        <Col span="24">
          <Card shadow>
            <Steps :current="stepsIndex">
              <Step title="基本信息" content="核对账户"></Step>
              <Step title="验证码" content="验证是否机器人"></Step>
              <Step title="邮箱验证" content="查看邮箱验证链接"></Step>
              <Step title="完成" content="重置成功"></Step>
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
              </div>

              <FormItem v-if="stepsIndex == 1" :label="$t('signup.form.captcha')">
                <Input type="text" v-model="forgetPassword.captcha"
                       size="large"
                       maxlength="4"
                       :placeholder="$t('signup.form.captcha')">
                  <div slot="append" ref="captcha" class="captcha-input-append" :alt="$t('signup.form.getCaptcha')"
                       @click="refreshCaptcha">
                    <div v-html="captchaUrl.content"></div>
                  </div>
                </Input>


<!--                <Input type="text" v-model="forgetPassword.captcha"-->
<!--                       size="large"-->
<!--                       maxlength="4"-->
<!--                       :placeholder="$t('signup.form.captcha')">-->
<!--                </Input>-->
<!--                <div ref="captcha" :alt="$t('signup.form.getCaptcha')" @click="refreshCaptcha">-->
<!--                  <div v-html="captchaUrl.content"></div>-->
<!--                </div>-->
              </FormItem>

              <div v-if="stepsIndex == 2">
                <EmailTip :email="forgetPassword.originEmail"></EmailTip>
              </div>

              <div v-if="stepsIndex == 3" align="center">
                <h1>恭喜完成重置 💐</h1>
                <br>
                <Row :gutter="10">
                  <Col>
                    <Tag color="warning" size="large">新密码</Tag>
                  </Col>
                  <Col flex="auto">
                    <Input :value="forgetPassword.password"></Input>
                  </Col>
                </Row>
                <br>
                <Alert type="warning">
                  <p>请记住上方密码 或 在个人中心重新设置您可记忆的密码</p>
                </Alert>
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
    const code = this.$route.params.code || this.$route.query.code;
    this.refreshCaptcha();
    code != null ? this.forgetPasswordVerify(code.toString()) : null;
  },
  methods: {
    // 重置密码验证
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

        if (d.success === 1) {
          this.verify.load = 3;
          this.stepsIndex = 3;
          this.forgetPassword.password = d.data.newpassword;
        } else {
          this.$Message.error(d.message);
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

    // 刷新验证码
    refreshCaptcha: function () {
      http.get(api["captcha"], {
        params: {
          r: Math.random()
        }
      }).then(res => {
        const d = res.data;
        if (d.success === 1) {
          this.captchaUrl = d.data;
        }
      });
    },

    // 重置密码
    onForgetPassword: function () {
      this.spinShow = true;

      this.forgetPassword.language = this.$root.$i18n.locale;

      http.post(api["user_forgetPassword"], {
        data: {
          data: this.forgetPassword,
          encryptCaptcha: this.captchaUrl.hash,
          captcha: this.forgetPassword.captcha,
        },
      }).then(res => {
        const d = res.data;

        if (d.success === 1) {
          this.stepsIndex ++;
          this.$Message.success(this.$i18n.t('detail.messages.submitSuccess'));
        } else {
          this.$Message.error(d.message);
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
