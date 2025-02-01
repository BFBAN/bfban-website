<script>
import {nodeViewProps, NodeViewWrapper} from "@tiptap/vue-2";
import HtmlImage from "@/components/HtmlImage.vue";
import InputImageAttrWidget from "@/components/inputImageAttrWidget.vue";

export default {
  props: nodeViewProps,
  components: {
    InputImageAttrWidget,
    HtmlImage,
    NodeViewWrapper,
  },
  methods: {
    /**
     * 打开图片属性面板
     */
    openImagePanel () {
      const {src} = this.node.attrs;
      this.$refs.inputImageAttrItem.openPanel(src);
    },
    /**
     * 删除
     */
    onDeleteImage() {
      this.deleteNode();
    },
  }
}
</script>

<template>
  <node-view-wrapper>
    <HtmlImage :isEdit="true"
               :src="node.attrs.src"
               @click-image="openImagePanel"></HtmlImage>
    <InputImageAttrWidget ref="inputImageAttrItem"
                          :isDelete="true"
                          @delete="onDeleteImage"></InputImageAttrWidget>
  </node-view-wrapper>
</template>

<style scoped lang="less">
</style>
