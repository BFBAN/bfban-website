<script>
import {nodeViewProps, NodeViewWrapper} from "@tiptap/vue-2";
import HtmlLink from "@/components/HtmlLink.vue";
import InputLinkAttrWidget from "@/components/InputLinkAttrWidget.vue";

export default {
  props: nodeViewProps,
  components: {
    HtmlLink,
    InputLinkAttrWidget,
    NodeViewWrapper,
  },
  methods: {
    /**
     * 打开Link面板
     */
    openLinkPanel() {
      const {href, text} = this.node.attrs;
      this.$refs.inputLinkAttrItem.openPanel(href, text);
    },
    /**
     * 更新
     * 已通过验证，确认属性后更新内部attr
     */
    onUpdateLink(href, text) {
      this.node.attrs.href = href;
      this.node.attrs.text = text;

      this.updateAttributes()
    },
    /**
     * 删除
     */
    onDeleteLink() {
      this.deleteNode();
    }
  }
}
</script>

<template>
  <node-view-wrapper class="node-view" :as="'span'">
    <HtmlLink :text="node.attrs.text" :href="node.attrs.href" :isOpen="false" :isIcon="true" :isPoptip="false"
              :isEdit="true" @click.native="openLinkPanel"></HtmlLink>
    <InputLinkAttrWidget ref="inputLinkAttrItem" :isDelete="true"
                         @delete="onDeleteLink"
                         @finish="onUpdateLink"></InputLinkAttrWidget>
  </node-view-wrapper>
</template>

<style scoped lang="less">
.node-view {
  display: inline-flex;
}
</style>
