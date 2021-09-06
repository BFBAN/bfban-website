<template>
  <div>
    <Alert type="success" show-icon>
      注意
      <template slot="desc">
        <p>
          我们向您的邮箱发送了一封验证邮件，邮箱是"{{email || 'null'}}", 请留意标题"BFBAN"的邮件.
        </p>
        <br>
        <b>没有收到此邮件?</b>
        <p>尝试在您的邮箱面板内的垃圾桶查阅，这可能被认为是垃圾广告.</p>
        <p>如果无法接受邮件，请<a @click="refreshCaptcha(); stepsIndex = 0">重新注册</a>.</p>
      </template>
    </Alert>
  </div>
</template>

<script>
export default {
  name: "EmailTip",
  popup: {
    email: '',
  },
}
</script>

<style scoped>

</style>
