<template>
  <div>
    <Alert type="success" show-icon>
      {{ $('signup.checkAllEmail') }}
    </Alert>
  </div>
</template>

<script>
export default {
  name: "EmailTip",
  props: {
    email: String
  },
}
</script>

<style lang="less" scoped>

</style>
