<template>
  <div class="container">
    <br>

    <div class="content">
      <Row :gutter="16">
        <Col span="11">
          <Divider>{{ $t("home.howToUse.title") }}</Divider>

          <Carousel autoplay loop>
            <CarouselItem>
              <div class="demo-carousel">
                <p>
                  <a href="https://bfban.com">本站</a>可以 <b>永久追踪</b> 被举报者的游戏ID，并支持 <b>搜索历史ID</b> ！欢迎大家积极举报。
                </p>

                <p>如果遇到挂，可以</p>
                <p>
                  1、先使用

                  <a target="_blank" href="https://bf1.mygoare.com/">
                    战地1外挂举报助手
                  </a>

                  给官方举报；
                </p>
                <p>
                  2、自己在网站
                  <router-link :to="{path: 'signup'}">注册</router-link>
                  后，自己
                  <router-link :to="{path: 'report'}">举报</router-link>
                  ；
                </p>
                <p>
                  3、举报后即会被纪录在案，即使修改了ID也能被追踪到；
                </p>
              </div>
            </CarouselItem>
          </Carousel>
        </Col>
        <Col span="13">
          <Card v-if="currentUser.token == ''" shadow>
            <p slot="title">{{ $t("signin.title") }}</p>
            <Form>
              <FormItem :label="$t('signin.form.username')">
                <Input prefix="ios-contact" type="text" v-model="signin.username" size="large"
                       :placeholder="$t('signin.form.username')"/>
              </FormItem>

              <FormItem :label="$t('signin.form.password')">
                <Input type="password" password v-model="signin.password" size="large"
                       :placeholder="$t('signin.form.password')"/>
              </FormItem>

              <FormItem :label="$t('signup.form.captcha')">
                <Input type="text" v-model="signin.captcha" size="large"
                       :placeholder="$t('signup.form.captcha')">
                </Input>
                <div ref="captcha" :alt="$t('signup.form.getCaptcha')" @click="refreshCaptcha">
                  <div v-html="captchaUrl.content"></div>
                </div>
              </FormItem>

              <FormItem>
                <Checkbox v-model="captchaUrl.skip">跳过验证</Checkbox>
              </FormItem>

              <FormItem>
                <Button @click.prevent.stop="handleSignin" long :loading="spinShow" size="large" type="primary">
                  {{ $t('signin.form.submit') }}
                </Button>

                <Divider>
                  <router-link :to="{name: 'signup'}">{{ $t('signin.form.submitHint') }}</router-link>
                </Divider>
              </FormItem>
            </Form>
          </Card>
          <Card v-if="currentUser.token != ''" shadow align="center">
            <br>
            <Avatar size="100">{{currentUser.userinfo.username[0]}}</Avatar>
            <h1>
              {{currentUser.userinfo.username}}
            </h1>
            <p>哎列？请先登出 (✿◡‿◡)</p>
            <br>
          </Card>
        </Col>
      </Row>
    </div>

    <br>
  </div>
</template>

<script>
import {getCsrfToken, waitForAction} from "@/mixins/common";
import {http, api, conf} from '../assets/js/index'
import Vuex from "vuex";
import _ from "lodash";

const {mapActions, mapMutations} = Vuex;

export default {
  data() {
    return {
      signin: {
        username: '',
        password: '',
        captcha: '',
      },
      captchaUrl: {
        skip: false
      },
      spinShow: false,
    }
  },
  created() {
    this.refreshCaptcha();
  },
  beforeMount() {
    if (this.$route.query.rurl) {
      this.$Message.info('请先登录');
    }
  },
  methods: {
    ...mapActions({
      'signinUser': 'signin'
    }),
    ...mapMutations([
      'SIGNIN'
    ]),
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
    handleSignin() {
      const that = this;
      const {username, password, captcha} = _.each(this.signin, (v, k, o) => {
        o[k] = v.trim();
      });

      if (username && password && captcha.length === 4) {
        this.spinShow = true;

        http.post(api["account_signin"], {
          headers: {
            // 'x-csrf-token': getCsrfToken(),
            // "Access-Control-Allow-Headers": "X-Requested-With",
            // 'x-encrypt-captcha': Cookies.get('encryptCaptcha'),
            'content-type': 'application/json'
          },
          data: {
            data: {
              username,
              password,
            },
            SKIP_CAPTCHAA: this.captchaUrl.skip,
            encryptCaptcha: this.captchaUrl.hash,
            captcha,
          },
        }).then((res) => {
          const d = res.data;

          if (d.error === 1) {
            that.$Message.error('登录失败 ' + d.msg);
            that.signin.password = '';
            that.signin.captcha = '';
            that.refreshCaptcha();
          } else {
            that.signinUser(d.data).then(() => {
              const rurl = this.$route.query.rurl;

              // redirect rurl or home
              if (rurl) {
                this.$router.push(rurl);
              } else {
                this.$router.go('-1');
              }

              this.$Message.success('登录成功');
            })
          }
        }).finally(() => {
          that.spinShow = false;
        })
      } else {
        this.$Message.error('请规范填写');
      }
    }
  },
  computed: {
    currentUser() {
      return this.$store.state.user || {token: ''};
    }
  }
}
</script>

<style>
</style>
