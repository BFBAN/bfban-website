<template>
  <div class="container">
    <div class="content">
      <Form :label-width="80" style="position: relative;">
        <Divider>{{$t("signin.title")}}</Divider>

        <FormItem :label="$t('signin.form.username')">
          <Input type="text" v-model="signin.username" :placeholder="$t('signin.form.username')" />
        </FormItem>

        <FormItem :label="$t('signin.form.password')">
          <Input type="password" v-model="signin.password" :placeholder="$t('signin.form.password')" />
        </FormItem>

        <FormItem :label="$t('signin.form.captcha')">
          <Input type="text" v-model="signin.captcha" :placeholder="$t('signin.form.captcha')" />
          <img ref="captcha">
          <a ref="reCaptcha" href="#" @click.stop.prevent="refreshCaptcha">
            {{$t('signin.form.getCaptcha')}}
          </a>
        </FormItem>

        <FormItem>
          <Button @click.prevent.stop="handleSignin" type="primary">{{$t('signin.form.submit')}}</Button>

          <router-link :to="{name: 'signup'}">{{$t('signin.form.submitHint')}}</router-link>
        </FormItem>

        <Spin size="large" fix v-show="spinShow"></Spin>
      </Form>
    </div>
  </div>

</template>

<script>
import { getCsrfToken, waitForAction } from './common';
import ajax, { baseURL } from "./ajax";

export default {
  data() {
    return {
      signin: {
        username: '',
        password: '',
        captcha: '',
      },
      spinShow: false,
    }
  },
  methods: {
    refreshCaptcha: function() {
      this.$refs.captcha.src = baseURL + '/captcha?r=' + Math.random();

      waitForAction.call(this.$refs.reCaptcha);
    },
    handleSignin: function() {
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

            this.refreshCaptcha();
          } else {
            this.$store.dispatch('signin', d.data)
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

          this.signin.password = '';
          this.signin.captcha = '';
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

