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
          <a href="#" @click.stop.prevent="refreshCaptcha">
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
import { testWhitespace, getCsrfToken } from './common';

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
    waitForCaptcha(e) {
      e.target.style = "display: none;";
      let span = document.createElement('span');
      e.target.parentNode.insertBefore(span, e.target.nextSibling);

      let n = 2;
      span.innerText = `${n} 秒后重新获取`;
      let si = setInterval(function() {
        if (n > 1) {

          n -= 1;
          span.innerText = `${n} 秒后重新获取`;
        } else {
          e.target.style = "";
          span.innerText = '';
          clearInterval(si);
        }
      }, 1000);
    },
    refreshCaptcha: function(e) {
      this.$refs.captcha.src = '/captcha?r=' + Math.random();

      this.waitForCaptcha(e);
    },
    handleSignup: function() {
      let {username, password, originId, qq, captcha} = _.each(this.signup, (v, k, o) => {
        o[k] = v.trim();
      });

      if (username && !testWhitespace(username) && password && !testWhitespace(password) && captcha.length === 4) {
        this.spinShow = true;

        axios({
          method: 'post',
          url: '/account/signup',
          headers: {
            'x-csrf-token': getCsrfToken(),
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
            this.$Message.error('注册失败 ' + d.msg)
          } else {
            // dispatch 异步的
            this.$store.dispatch('signin', d.data)
            .then(() => {
              // redirect
              this.$router.push('/')
            })
          }

          this.signup.password = '';
          this.signup.captcha = '';
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

