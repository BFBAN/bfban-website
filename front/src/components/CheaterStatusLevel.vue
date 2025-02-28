<script>

export default {
  props: {
    hackerLevel: {
      type: [String, Number],
      default: 0
    }
  }
}
</script>

<template>
  <Tag :color="'error'" v-if="hackerLevel > 0" class="user-select-none">
    LV{{ hackerLevel }}
  </Tag>
</template>

<style scoped lang="less">
</style>
