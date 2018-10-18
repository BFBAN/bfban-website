<template>
  <Form :label-width="80">
      <h2>登录</h2>

      <FormItem label="用户名">
        <Input v-model="signin.username" placeholder="用户名"></Input>
      </FormItem>

      <FormItem label="密码">
        <Input type="password" v-model="signin.password" placeholder="密码"></Input>
      </FormItem>

      <FormItem>
          <Button @click.prevent.stop="handleSignin" type="primary">提交</Button>
      </FormItem>
    </Form>
</template>

<script>
export default {
  data() {
    return {
      signin: {
        username: '',
        password: ''
      }
    }
  },
  methods: {
    handleSignin: function() {
      const {username, password} = this.signin
      console.log(username, password)
    }
  }
}
</script>

<style>
</style>

