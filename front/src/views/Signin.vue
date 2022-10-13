<template>
  <div class="container">
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

    <div class="content">
      <Row :gutter="0">
        <Col :xs="{span: 24}" :lg="{span: 11}" class="mobile-hide carousel">
          <div class="carousel-item">
            <img src="../assets/images/logo.png">
            <h2>{{ $t("home.cover.h1") }}</h2>
            <span>{{ $t("home.cover.h3") }}</span>
          </div>
        </Col>
        <Col :xs="{span: 22, push: 1, pull: 1}" :lg="{span: 13, push: 0, pull: 0}">
          <Card v-if="currentUser.token == ''" :padding="isMobile ? 20 : 50" shadow>
            <Form ref="signin" :model="signin" :rules="ruleValidate" label-position="top">
              <Alert type="error" show-icon v-if="signinBackMsg">
                <b>{{ $t('signin.failed') }} :</b>
                {{ signinBackMsg }}
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
                        <Captcha ref="captcha" :seconds="15" :disable="!(!!signin.password  && !!signin.username)"></Captcha>
                      </div>
                    </Input>
                  </FormItem>
                </Col>
              </Row>

              <FormItem>
                <Button @click.prevent.stop="handleSignin" long :loading="spinShow" size="large" type="primary">
                  {{ $t('basic.button.submit') }}
                </Button>
              </FormItem>

              <Row type="flex" justify="center" align="middle">
                <Col>
                  <router-link :to="{name: 'signup'}">
                    <Icon type="md-mail" />
                    {{ $t('signin.form.submitHint') }}
                  </router-link>
                </Col>
                <Divider type="vertical"/>
                <Col>
                  <router-link :to="{name: 'forgetPassword'}">{{ $t('signin.form.forgetPasswordHint') }}</router-link>
                </Col>
              </Row>
            </Form>
          </Card>
          <Card v-if="currentUser.token != ''" shadow align="center">
            <br>
            <Avatar size="100">{{ currentUser.userinfo.username[0] }}</Avatar>
            <h1>
              {{ currentUser.userinfo.username }}
            </h1>
            <p> {{ $t('signin.loggedIn') }} </p>
            <br>
          </Card>
        </Col>
      </Row>
    </div>
  </div>
</template>

<script>
import BFBAN from "../assets/js/bfban";

import {api, http} from '../assets/js/index'
import Captcha from "../components/Captcha";
import Vuex from "vuex";
import _ from "lodash";

const {mapActions, mapMutations} = Vuex;

export default new BFBAN({
  components: { Captcha },
  data() {
    return {
      ruleValidate: {
        username: [
          {required: true, trigger: 'blur'}
        ],
        password: [
          {required: true, trigger: 'blur'}
        ],
        captcha: [
          {required: true, min: 4, max: 4, trigger: 'change'}
        ],
      },
      signinBackMsg: '',
      signin: {
        username: '',
        password: '',
        captcha: '',
      },
      spinShow: false,
    }
  },
  beforeMount() {
    if (this.$route.query.rurl) {
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
              that.signinBackMsg = d.message;

            } else {
              that.signinUser(d.data).then(() => {
                const backurl = this.$route.query.backurl;

                // redirect rurl or home
                if (backurl) {
                  this.$router.push({ path: backurl });
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

<style lang="scss" scoped>
.carousel {
  border-bottom: 2px solid #f2f2f2;
  width: 440px;
  overflow: hidden;
  //background: #fff;
  background: #401487;

  > * {
    background-image: url("https://app.bfban.com/public/svg/bk1.svg");
    background-repeat: repeat;
  }

  .carousel-item {
    text-align: center;
    display: flex;
    flex-flow: column;
    justify-content: center;
    align-items: center;
    align-content: center;
    height: 100%;
    color: #fff;

    img {
      width: 150px;
      height: 150px;
    }
  }
}
</style>