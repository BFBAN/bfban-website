<template>
  <div class="container">
    <div class="content">
      <Form :label-width="80" style="position: relative;">
        <Divider>{{$t("signup.title")}}</Divider>

        <FormItem :label="$t('signup.form.username')">
          <Input v-model="signup.username" placeholder="4位以上用户名" />
        </FormItem>

        <FormItem :label="$t('signup.form.password')">
          <Input type="password" v-model="signup.password" placeholder="6位以上密码" />
        </FormItem>

        <FormItem :label="$t('signup.form.originId')">
          <Input v-model="signup.originId" placeholder="选题" />
        </FormItem>

        <FormItem :label="$t('signup.form.qq')">
          <Input v-model="signup.qq" placeholder="选填" />
        </FormItem>

        <FormItem :label="$t('signup.form.captcha')">
          <Input type="text" v-model="signup.captcha" :placeholder="$t('signup.form.captcha')" />
          <img ref="captcha">
          <a ref="reCaptcha" href="#" @click.stop.prevent="refreshCaptcha">
            {{$t('signup.form.getCaptcha')}}
          </a>

          <div>
            <Checkbox v-model="signup.rule">
              我已阅读并认同
              <a href="http://note.youdao.com/noteshare?id=b3a1381e2efe2c95c776952df99f31fb" target="_blank">
                战地风云联BAN调查局行为准则
              </a>
            </Checkbox>
          </div>
        </FormItem>

        <FormItem>
          <Button @click.prevent.stop="handleSignup" type="primary">{{$t('signup.form.submit')}}</Button>

          <router-link :to="{name: 'signin'}">{{$t('signup.form.submitHint')}}</router-link>
        </FormItem>

        <Spin size="large" fix v-show="spinShow"></Spin>
      </Form>
    </div>
  </div>

</template>

<script>
import { testWhitespace, getCsrfToken, waitForAction } from './common';
import ajax, { baseURL } from "./ajax";

export default {
  data() {
    return {
      signup: {
        username: '',
        password: '',
        originId: '',
        qq: '',
        captcha: '',
        rule: true,
      },
      spinShow: false,
    }
  },
  methods: {
    refreshCaptcha: function() {
      this.$refs.captcha.src = baseURL + '/captcha?r=' + Math.random();

      waitForAction.call(this.$refs.reCaptcha);
    },
    handleSignup: function() {
      let { rule } = this.signup;
      let {username, password, originId, qq, captcha} = _.each(this.signup, (v, k, o) => {
        if (k === 'rule') {
          return true;
        }
        o[k] = v.trim();
      });

      if (rule && username && !testWhitespace(username) && password && !testWhitespace(password) && captcha.length === 4) {
        this.spinShow = true;

        ajax({
          method: 'post',
          url: '/account/signup',
          headers: {
            // 'x-csrf-token': getCsrfToken(),
            // 'x-encrypt-captcha': Cookies.get('encryptCaptcha'),
          },
          data: {
            username,
            password,
            captcha,
            originId,
            qq,
          }
        })
        .then((res) => {
          this.spinShow = false;

          const d = res.data;
          if (d.error === 1) {
            this.$Message.error('注册失败 ' + d.msg);

            this.signup.password = '';
            this.signup.captcha = '';
            this.refreshCaptcha();
          } else {
            // dispatch 异步的
            this.$store.dispatch('signin', d.data)
            .then(() => {
              // redirect
              this.$router.push('/')
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

