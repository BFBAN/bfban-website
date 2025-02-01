<script>
import {nodeViewProps} from "@tiptap/vue-2";
import HtmlPlayerCard from "@/components/HtmlPlayerCard.vue";

export default {
  props: nodeViewProps,
  components: {
    HtmlPlayerCard
  },
  methods: {

  }
}
</script>

<template>
  <node-view-wrapper class="node-view" :as="'span'">
    <HtmlPlayerCard :id="node.attrs.id"></HtmlPlayerCard>
  </node-view-wrapper>
</template>

<style scoped lang="less">
.node-view {
  display: inline-flex;
}
</style>
