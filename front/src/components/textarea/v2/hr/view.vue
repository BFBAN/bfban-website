<script>
import {nodeViewProps, NodeViewWrapper} from "@tiptap/vue-2";
import {Divider} from "view-design";

export default {
  props: nodeViewProps,
  components: {
    NodeViewWrapper,
    Divider
  },
}
</script>

<template>
  <node-view-wrapper as="div" class="hr ivu-divider ivu-divider-horizontal ivu-divider-default ivu-divider-dashed" >
    <Divider dashed></Divider>
  </node-view-wrapper>
</template>

<style scoped lang="less">
</style>
