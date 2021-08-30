<template>
  <div class="container">
    <div class="content">
      <Divider>{{$t("signin.title")}}</Divider>

      <Row :gutter="16">
          <Col span="13">
<!--            <img src="//source.unsplash.com/user/erondu/600x400?d" width="100%">-->

              <Divider>{{$t("home.howToUse.title")}}</Divider>

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
          </Col>
          <Col span="11">
            <Form :label-position="top" style="position: relative;">

              <FormItem :label="$t('signin.form.username')">
                <Input type="text" v-model="signin.username" size="large" :placeholder="$t('signin.form.username')" />
              </FormItem>

              <FormItem :label="$t('signin.form.password')">
                <Input type="password" v-model="signin.password" size="large" :placeholder="$t('signin.form.password')" />
              </FormItem>

              <FormItem :label="$t('signup.form.captcha')">
                <Input type="text" v-model="signin.captcha" size="large" :placeholder="$t('signup.form.captcha')">
                  <span slot="append">
                    <img ref="captcha" width="40px" :src="captchaUrl" :alt="$t('signup.form.getCaptcha')" @click="refreshCaptcha" />
                  </span>
                </Input>
              </FormItem>

              <FormItem>
                <Button @click.prevent.stop="handleSignin" long size="large" type="primary">{{$t('signin.form.submit')}}</Button>
                <router-link :to="{name: 'signup'}">{{$t('signin.form.submitHint')}}</router-link>
              </FormItem>

              <Spin size="large" fix v-show="spinShow"></Spin>
            </Form>
          </Col>
        </Row>
    </div>
  </div>

</template>

<script>
import { getCsrfToken, waitForAction } from '@/mixins/common';
import ajax, { baseURL } from "@/mixins/ajax";
const { mapActions, mapMutations } = Vuex;

export default {
  data() {
    return {
      signin: {
        username: '',
        password: '',
        captcha: '',
      },
      captchaUrl: '',
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
    refreshCaptcha: function() {
      this.captchaUrl = baseURL + '/captcha?r=' + Math.random();

      // waitForAction.call(this.$refs.reCaptcha);
    },
    handleSignin() {
      const {username, password, captcha} = _.each(this.signin, (v, k, o) => {
        o[k] = v.trim();
      });

      if (username && password && captcha.length === 4) {
        this.spinShow = true;

        ajax({
          method: 'post',
          url: '/account/signin',
          headers: {
            // 'x-csrf-token': getCsrfToken(),
            // "Access-Control-Allow-Headers": "X-Requested-With",
            // 'x-encrypt-captcha': Cookies.get('encryptCaptcha'),
          },
          data: {
            username,
            password,
            captcha,
          },
        })
        .then((res) => {
          this.spinShow = false;

          const d = res.data;
          if (d.error === 1) {
            this.$Message.error('登录失败 ' + d.msg);

            this.signin.password = '';
            this.signin.captcha = '';
            this.refreshCaptcha();
          } else {
            this.signinUser(d.data)
            .then(() => {

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
        })
      } else {
        this.$Message.error('请规范填写');
      }
    }
  }
}
</script>

<style>
</style>

