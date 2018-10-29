<template>
    <Form :label-width="80">
      <Divider>注册</Divider>

      <FormItem label="用户名">
        <Input v-model="signup.username" placeholder="用户名" />
      </FormItem>

      <FormItem label="密码">
        <Input type="password" v-model="signup.password" placeholder="6位以上密码" />
      </FormItem>

      <FormItem label="游戏ID">
        <Input v-model="signup.originId" placeholder="选题" />
      </FormItem>

      <FormItem label="QQ">
        <Input v-model="signup.qq" placeholder="选填" />
      </FormItem>

      <FormItem label="验证码">
        <Input type="text" v-model="signup.captcha" placeholder="验证码" />
        <img ref="captcha">
        <a href="#" @click.stop.prevent="refreshCaptcha">
          获得验证码
        </a>
      </FormItem>

      <FormItem>
          <Button @click.prevent.stop="handleSignup" type="primary">提交</Button>
      </FormItem>
    </Form>
</template>

<script>
import axios from 'axios';
import _ from 'underscore';

export default {
  data() {
    return {
      signup: {
        username: '',
        password: '',
        originId: '',
        qq: '',
        captcha: '',
      }
    }
  },
  methods: {
    refreshCaptcha: function() {
      this.$refs.captcha.src = '/captcha?r=' + Math.random();
    },
    handleSignup: function() {
      let {username, password, originId, qq, captcha} = _.each(this.signup, (v, k, o) => {
        o[k] = v.trim();
      });

      if (username && password && captcha.length === 4) {
        axios({
          method: 'post',
          url: '/account/signup',
          data: {
            username,
            password,
            captcha,
            originId,
            qq,
          }
        })
        .then((res) => {
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

          this.refreshCaptcha();
          this.signup.password = '';
          this.signup.captcha = '';
        })
      } else {
        this.$Message.error('请填写完整');
      }
    }
  }
}
</script>

<style>
</style>

