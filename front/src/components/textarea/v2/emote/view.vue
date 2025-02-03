<script>
import {nodeViewProps, NodeViewWrapper} from "@tiptap/vue-2";
import EmoteItem from "@/components/EmoteItem.vue";

export default {
  props: nodeViewProps,
  components: {
    EmoteItem,
    NodeViewWrapper
  },
  mounted() {

  },
  computed: {},
  methods: {}
}
</script>

<template>
  <node-view-wrapper ref="emoteRoot" :as="'span'">
    <EmoteItem :id="node.attrs.id"></EmoteItem>
  </node-view-wrapper>
</template>

<style scoped lang="less">
</style>
