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
    <span class="judge-action-before-icon">
     <Poptip trigger="hover" :transfer="true" word-wrap width="200"
             :content="$t(`basic.hackerLevel`)">
       <Icon type="md-help"></Icon>
     </Poptip>
    </span>
  </Tag>
</template>

<style scoped lang="less">
.judge-action-before-icon {
  cursor: help;
  display: inline-block;
  margin: -2px -8px 0px 5px;
  padding: 0px 3px;
  background-color: rgba(0, 0, 0, 0.08);
}
</style>
