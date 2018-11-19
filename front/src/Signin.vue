<template>
  <div class="container">
    <div class="content">
      <Form :label-width="80" style="position: relative;">
        <Divider>登录</Divider>

        <FormItem label="用户名">
          <Input type="text" v-model="signin.username" placeholder="用户名" />
        </FormItem>

        <FormItem label="密码">
          <Input type="password" v-model="signin.password" placeholder="密码" />
        </FormItem>

        <FormItem label="验证码">
          <Input type="text" v-model="signin.captcha" placeholder="验证码" />
          <img ref="captcha">
          <a href="#" @click.stop.prevent="refreshCaptcha">
            获得验证码
          </a>
        </FormItem>

        <FormItem>
          <Button @click.prevent.stop="handleSignin" type="primary">提交</Button>

          <router-link :to="{name: 'signup'}">没有账号？去注册</router-link>
        </FormItem>

        <Spin size="large" fix v-show="spinShow"></Spin>
      </Form>
    </div>
  </div>

</template>

<script>
import { getCsrfToken } from './common';

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
    handleSignin: function() {
      const {username, password, captcha} = _.each(this.signin, (v, k, o) => {
        o[k] = v.trim();
      });

      if (username && password && captcha.length === 4) {
        this.spinShow = true;

        axios({
          method: 'post',
          url: '/account/signin',
          headers: {
            'x-csrf-token': getCsrfToken(),
          },
          data: {
            username,
            password,
            captcha
          }
        })
        .then((res) => {
          this.spinShow = false;

          const d = res.data;
          if (d.error === 1) {
            this.$Message.error('登录失败 ' + d.msg)
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

