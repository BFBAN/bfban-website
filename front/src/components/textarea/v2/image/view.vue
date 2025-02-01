<script>
import {nodeViewProps, NodeViewWrapper} from "@tiptap/vue-2";
import HtmlImage from "@/components/HtmlImage.vue";

export default {
  props: nodeViewProps,
  components: {
    HtmlImage,
    NodeViewWrapper,
  },
  methods: {
    /**
     * 删除
     */
    onDeleteImage () {
      this.deleteNode();
    },
    onClickImageEvent () {
      this.onDeleteImage();
    }
  }
}
</script>

<template>
  <node-view-wrapper>
    <HtmlImage :isEdit="true" :src="node.attrs.src" @click-image.native="onClickImageEvent"></HtmlImage>
  </node-view-wrapper>
</template>

<style scoped lang="less">
</style>
