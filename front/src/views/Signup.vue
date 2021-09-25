<template>
  <div class="container">
    <div class="content">
      <Form :label-width="80" style="position: relative;">
        <Divider>{{$t("signup.title")}}</Divider>

        <FormItem>
          <div style="padding: 10px; font-size: 14px; font-weight: bold; background: #CC0000; color: white; border: 1px solid #dcdee2; border-radius: 4px;">
            <p>注册已暂时关闭</p>
            <p>Register is temporarily unavaliable</p>
            <p>如果您的确需要注册，请至 <a href="https://myaccount.ea.com/cp-ui/privacy/index">EA 隐私设定</a> 中允许按邮箱搜索开启，
            并使用与origin账号绑定的邮箱发送需注册账号名至 <a href="mailto:register@bfban.com">register@bfban.com</a></p>
            <p>
              If you do need to register an account, please go to 
              <a href="https://myaccount.ea.com/cp-ui/privacy/index">EA privacy settings</a>
              to enable "search by email",
              and send the username you want by that email to <a href="mailto:register@bfban.com">register@bfban.com</a>
            </p>
            
          </div>
        </FormItem>
        <FormItem :label="$t('signup.form.username')">
          <Input v-model="signup.username" :placeholder="$t('signup.placeholder.username')" />
        </FormItem>

        <FormItem :label="$t('signup.form.password')">
          <Input type="password" v-model="signup.password" :placeholder="$t('signup.placeholder.password')" />
        </FormItem>

        <FormItem :label="$t('signup.form.originId')">
          <Input v-model="signup.originId" :placeholder="$t('signup.placeholder.originId')" />
        </FormItem>

        <FormItem :label="$t('signup.form.qq')">
          <Input v-model="signup.qq" :placeholder="$t('signup.placeholder.qq')" />
        </FormItem>

        <FormItem :label="$t('signup.form.captcha')">
          <Input type="text" v-model="signup.captcha" :placeholder="$t('signup.form.captcha')" />
          <img ref="captcha">
          <a ref="reCaptcha" href="#" @click.stop.prevent="refreshCaptcha">
            {{$t('signup.form.getCaptcha')}}
          </a>
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
import { testWhitespace, getCsrfToken, waitForAction } from '@/mixins/common';
import ajax, { baseURL } from "@/mixins/ajax";

export default {
  data() {
    return {
      signup: {
        username: '',
        password: '',
        originId: '',
        qq: '',
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
    handleSignup: function() {
      let {username, password, originId, qq, captcha} = _.each(this.signup, (v, k, o) => {
        o[k] = v.trim();
      });

      if (username && !testWhitespace(username) && password && !testWhitespace(password) && captcha.length === 4) {
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
            this.$Message.error(this.$i18n.t('signup.failed') + d.msg);

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
        this.$Message.error(this.$i18n.t('signup.fillIn'));
      }
    }
  }
}
</script>

<style>
</style>

