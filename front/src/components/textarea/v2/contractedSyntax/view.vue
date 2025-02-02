<script>
import {nodeViewProps, NodeViewWrapper} from "@tiptap/vue-2";
import HtmlUser from "@/components/HtmlUser.vue";

export default {
  props: nodeViewProps,
  components: {
    HtmlUser,
    NodeViewWrapper
  },
  computed() {
  },
  methods: {}
}
</script>

<template>
  <node-view-wrapper class="node-view" :as="'span'">
    <template v-if="node.attrs.mentionType === 'user'">
      <HtmlUser :id="node.attrs.mentionId"></HtmlUser>
    </template>
    <template v-else>
      <!--  不适合在编辑器内展示    -->
      {<b>{{ node.attrs.mentionType }}:{{ node.attrs.mentionId }}</b>}
    </template>
  </node-view-wrapper>
</template>

<style scoped lang="less">
.node-view {
  display: inline-flex;
}
</style>
