<template>
  <Form :label-width="80">
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
      </FormItem>
    </Form>
</template>

<script>
import axios from 'axios'

export default {
  data() {
    return {
      signin: {
        username: '',
        password: '',
        captcha: '',
      },
    }
  },
  methods: {
    refreshCaptcha: function() {
      this.$refs.captcha.src = '/captcha?r=' + Math.random();
    },
    handleSignin: function() {
      const {username, password, captcha} = this.signin;
      console.log(username, password, captcha);

      if (username && password && captcha.length === 4) {
        axios({
          method: 'post',
          url: '/account/signin',
          data: {
            username,
            password,
            captcha
          }
        })
        .then((res) => {
          this.refreshCaptcha();

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
        })
      } else {
        this.$Message.error('请填写完整')
      }
    }
  }
}
</script>

<style>
</style>

