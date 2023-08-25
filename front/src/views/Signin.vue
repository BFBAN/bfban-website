<template>
  <div class="container">
    <div class="content">
      <div dis-hover :padding="0">
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

            <Card v-if="!isLogin" class="signin-box" :padding="isMobile ? 20 : 50" dis-hover>
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

                <Row :gutter="30" type="flex" justify="space-between" align="middle">
                  <Col :span="isMobile ? 24 : 15">
                    <FormItem :label="$t('captcha.title')" prop="captcha">
                      <Input type="text" v-model="signin.captcha" size="large" maxlength="4"
                             :placeholder="$t('captcha.title')">
                        <div slot="append" class="captcha-input-append" :alt="$t('captcha.get')">
                          <Captcha ref="captcha" :seconds="15"
                                   :disable="!(!!signin.password  && !!signin.username)"></Captcha>
                        </div>
                      </Input>
                    </FormItem>
                  </Col>
                </Row>

                <br>

                <FormItem>
                  <Button @click.prevent.stop="handleSignin" long :loading="spinShow" size="large" type="primary">
                    {{ $t('basic.button.submit') }}
                  </Button>
                </FormItem>

                <spin fix v-if="spinShow">
                  <Icon type="md-refresh spin-icon-load" size="30"></Icon>
                </spin>
              </Form>

              <Divider dashed
                       :style="`margin:40px -${isMobile ? 20 : 50}px;width:calc(100% + ${isMobile ? 20 * 2 : 50 * 2}px)`"/>

              <Row type="flex" justify="center" align="middle">
                <Col>
                  <router-link :to="{name: 'signup'}">
                    <Icon type="md-mail"/>
                    {{ $t('signin.form.submitHint') }}
                  </router-link>
                </Col>
                <Divider type="vertical"/>
                <Col>
                  <router-link :to="{name: 'forgetPassword'}">{{ $t('signin.form.forgetPasswordHint') }}</router-link>
                </Col>
                <Divider type="vertical"/>
                <Col>
                  <a href="http://kook.top/wHwxhw">{{ $t('signin.form.Feedback') }}</a>
                </Col>
              </Row>
            </Card>
            <Card v-if="isLogin" shadow align="center" :padding="isMobile ? 20 : 50">
              <Avatar icon="ios-person" size="100" :src="currentUser.userinfo.userAvatar"></Avatar>
              <h1>
                <router-link :to="{name:'profile', params: {pagename:'information'}}">
                  {{ currentUser.userinfo.username }}
                </router-link>
              </h1>
              <p> {{ $t('signin.loggedIn') }} </p>
            </Card>
          </Col>
        </Row>
      </div>
    </div>
  </div>
</template>

<script>
import Application from "../assets/js/application";

import {api, http, regular} from '../assets/js/index'
import Captcha from "../components/Captcha";
import Vuex from "vuex";
import _ from "lodash";

const {mapActions, mapMutations} = Vuex;

export default new Application({
  components: {Captcha},
  data() {
    return {
      signinType: 'username',
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
          {required: true, len: 4, trigger: 'blur'}
        ],
      },
      serverReturnMessage: '',
      signin: {
        username: '',
        password: '',
        captcha: '',
      },
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
      'signinUser': 'signin'
    }),
    ...mapMutations([
      'SIGNIN'
    ]),

    /**
     * 登录
     */
    handleSignin() {
      const that = this;
      const {username, password, captcha} = _.each(this.signin, (v, k, o) => {
        o[k] = v.trim();
      });

      this.$refs['signin'].validate((valid) => {
        if (valid) {
          this.spinShow = true;

          http.post(api["account_signin"], {
            data: {
              data: {
                username,
                password,
              },
              encryptCaptcha: this.$refs.captcha.hash,
              captcha,
            },
          }).then(res => {
            const d = res.data;

            if (d.error == 1) {

              that.signin.password = '';
              that.signin.captcha = '';
              that.serverReturnMessage = d.message;

            } else {
              that.signinUser(d.data).then(() => {
                const backPath = this.$route.query.backPath;

                // redirect backPath or home
                if (backPath) {
                  this.$router.push({path: backPath});
                } else {
                  this.$router.go('-1');
                }

                this.$Message.success(this.$t('signin.success'));
              })
            }
          }).finally(res => {
            that.spinShow = false;
            if (that.$refs.captcha)
              that.$refs.captcha.refreshCaptcha();
          });

        } else {
          this.$Message.error(this.$t('signin.fillEverything'));
        }
      });
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
}
</style>
