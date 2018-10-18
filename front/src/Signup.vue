<template>
    <Form :label-width="80">
      <h2>注册</h2>

      <FormItem label="用户名">
        <Input v-model="signup.username" placeholder="用户名"></Input>
      </FormItem>

      <FormItem label="密码">
        <Input type="password" v-model="signup.password" placeholder="密码"></Input>
      </FormItem>

      <FormItem label="游戏ID">
        <Input v-model="signup.originId" placeholder="选题"></Input>
      </FormItem>

      <FormItem label="QQ">
        <Input v-model="signup.qq" placeholder="选填"></Input>
      </FormItem>

      <FormItem>
          <Button @click.prevent.stop="handleSignup" type="primary">提交</Button>
      </FormItem>
    </Form>
</template>

<script>
export default {
  data() {
    return {
      signup: {
        username: '',
        password: '',
        originId: '',
        qq: ''
      }
    }
  },
  methods: {
    handleSignup: function() {
      const {username, password, originId, qq} = this.signup

      console.log(username, password, originId, qq)
    }
  }
}
</script>

<style>
</style>

