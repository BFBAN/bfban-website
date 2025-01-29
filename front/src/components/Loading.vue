<script>
export default {
  props:{
    size: {
      type: Number,
      default: 50,
    }
  },
}
</script>

<template>
  <div>
    <Icon type="md-refresh" :size="size" class="spin-icon-load"></Icon>
  </div>
</template>

<style scoped lang="less">
@import "@/assets/css/icon";
</style>
