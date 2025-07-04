<template>
  <div class="container">
    <div class="content">
      <div>
        <Row :gutter="0" type="flex" justify="center">
          <Col style="width: 500px">
            <br>
            <Row>
              <Col :xs="{push: 1}" :lg="{push: 0}">
                <Breadcrumb>
                  <BreadcrumbItem :to="{name: 'home'}">{{ $t("header.index") }}</BreadcrumbItem>
                  <BreadcrumbItem>{{ $t("signin.title") }}</BreadcrumbItem>
                </Breadcrumb>
              </Col>
            </Row>
            <br>

            <Card v-if="!isLogin" class="signin-box" :padding="isMobile ? 20 : 30" dis-hover>
              <Banner :style="`margin: -${isMobile ? 20 : 30}px -${isMobile ? 20 : 30}px 30px;`" :height="120"></Banner>

              <Form ref="signin" :model="signin" :rules="ruleValidate" label-position="top">
                <Alert type="error" show-icon v-if="serverReturnMessage">
                  <b>{{ $t('signin.failed') }} :</b>
                  {{ serverReturnMessage }}
                </Alert>

                <FormItem :label="$t('signin.form.username')" prop="username">
                  <Input prefix="ios-contact" type="text" v-model="signin.username" size="large"
                         :placeholder="$t('signin.form.username')">
                  </Input>
                </FormItem>

                <FormItem :label="$t('signin.form.password')" prop="password">
                  <Input type="password" password v-model="signin.password" size="large"
                         :placeholder="$t('signin.form.password')"/>
                </FormItem>

                <FormItem :label="$t('captcha.title')" prop="captcha">
                  <Captcha ref="captcha" size="large" @getCaptchaData="getCaptchaData"></Captcha>
                </FormItem>

                <br>

                <FormItem>
                  <Button @click="onSignin" long :loading="spinShow" size="large" type="primary">
                    {{ $t('basic.button.submit') }}
                  </Button>
                </FormItem>

                <spin fix v-if="spinShow">
                  <Icon type="md-refresh spin-icon-load" size="30"></Icon>
                </spin>
              </Form>

              <Divider dashed
                       :style="`margin:25px -${isMobile ? 20 : 50}px;width:calc(100% + ${isMobile ? 20 * 2 : 50 * 2}px)`"/>

              <Row :gutter="10" type="flex" align="middle">
                <Col>
                  <router-link :to="{name: 'signup'}">
                    {{ $t('signin.form.submitHint') }}
                  </router-link>
                </Col>
                <Divider type="vertical"></Divider>
                <Col>
                  <router-link :to="{name: 'forgetPassword'}">{{ $t('signin.form.forgetPasswordHint') }}</router-link>
                </Col>
                <Col span="24">
                  <Row :gutter="10">
                    <Col>
                      <a href="http://kook.top/wHwxhw">{{ $t('signin.form.Feedback') }}</a>
                    </Col>
                    <Col>
                      <Icon type="md-open"></Icon>
                    </Col>
                  </Row>
                </Col>
              </Row>
            </Card>
            <Card v-if="isLogin" dis-hover :padding="isMobile ? 20 : 50">
              <div class="signin-out-userinfo">
                <Avatar class="userinfo-avatar" icon="ios-person" size="100"
                        :src="currentUser.userinfo.userAvatar"></Avatar>
                <h1>
                  <router-link :to="{name:'profile', params: {pagename:'information'}}">
                    {{ currentUser.userinfo.username }}
                  </router-link>
                </h1>
                <p> {{ $t('signin.loggedIn') }} </p>
              </div>
              <Button long type="error" ghost size="large" :loading="signoutLoad" :disabled="signoutLoad"
                      @click="onAccountSignout">
                {{ $t("header.signout") }}
              </Button>
            </Card>
          </Col>
        </Row>
      </div>
    </div>
  </div>
</template>

<script>
import {account_storage, api, application, http, regular} from '@/assets/js';

import Banner from "@/components/Banner"
import Captcha from "@/components/captcha/index";
import Vuex from "vuex";

const {mapActions, mapMutations} = Vuex;

export default new application({
  components: {Banner, Captcha},
  data() {
    return {
      ruleValidate: {
        username: [
          {required: true, min: 4, max: 40, trigger: 'blur'},
          {
            validator(rule, value, callback) {
              return regular.check('username', value).code == 0 || regular.check('email', value).code == 0;
            },
            message: this.$t('signup.placeholder.username'),
            trigger: 'change'
          }
        ],
        password: [
          {required: true, trigger: 'blur'}
        ],
        captcha: [
          {required: true}
        ],
      },
      serverReturnMessage: '',
      signin: {
        username: '',
        password: '',
        captcha: {},
      },
      signoutLoad: false,
      spinShow: false,
    }
  },
  beforeMount() {
    if (this.$route.query.backPath) {
      this.$Message.info(this.$t('signin.loginFirst'));
    }
  },
  methods: {
    ...mapActions({
      "signinUser": "signin"
    }),
    ...mapMutations([
      "SIGNIN"
    ]),
    /**
     * 获取验证码
     * @param value
     */
    getCaptchaData(value) {
      this.signin.captcha = Object.assign(this.signin.captcha, value);
      this.signin.captcha = value;
    },
    /**
     * 注销账号
     * @returns {Promise<void>}
     */
    async onAccountSignout() {
      try {
        this.signoutLoad = true;
        await account_storage.signout();
        this.$store.dispatch('signout').then(() => {
          this.$router.push('/');
        });
      } catch (e) {
        this.$Message.error(e.toString());
      } finally {
        this.signoutLoad = false;
      }
    },
    /**
     * 登录
     */
    onSignin() {
      const that = this;
      const backPath = this.$route.query.backPath;
      let {username, password, captcha} = this.signin;

      // 提取出单独 trim 过的 username 和 password
      username = username.trim();
      password = password.trim();

      try {
        this.$refs['signin'].validate(async (valid) => {
          if (!valid) {
            that.$Message.error(that.$t('signin.fillEverything'));
            return;
          }

          that.spinShow = true;
          const res = await http.post(api["account_signin"], {
            data: {
              data: {username, password},
              captcha,
            },
          });

          const d = res.data;

          if (d.error === 1) {
            that.signin.password = '';
            that.signin.captcha = '';
            that.serverReturnMessage = that.$t(`basic.tip['${d.code}']`, {
              message: d.message || ""
            });

            throw new Error(that.serverReturnMessage);
          }

          await that.signinUser(d.data);

          // redirect backPath or home
          if (backPath) {
            await that.$router.push({path: backPath});
          } else {
            that.$router.go(-1);
          }

          that.$Message.success(that.$t(`basic.tip['${d.code}']`, {
            message: d.message || ""
          }));

          that.spinShow = false;
          if (that.$refs.captcha)
            that.$refs.captcha.refreshCaptcha();
        });
      } catch (e) {
        if (e instanceof Error)
          this.$Message.error(e)
      }
    }
  },
  computed: {
    currentUser() {
      return this.$store.state.user || {token: ''};
    }
  }
});
</script>

<style lang="less" scoped>
@import "@/assets/css/icon.less";

.signin-box {
  overflow: hidden;
  margin-bottom: 1rem;
}

.signin-out-userinfo {
  margin-bottom: 50px;
  text-align: center;

  .userinfo-avatar {
    margin-bottom: 15px;
  }
}
</style>
