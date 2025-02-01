<script>
import {nodeViewProps, NodeViewWrapper} from "@tiptap/vue-2";
import HtmlLink from "@/components/HtmlLink.vue";
import InputLinkWidget from "@/components/InputLinkWidget.vue";

export default {
  props: nodeViewProps,
  components: {
    HtmlLink,
    InputLinkWidget,
    NodeViewWrapper,
  },
  methods: {
    /**
     * 打开Link面板
     */
    openLinkPalen() {
      const {href, text} = this.node.attrs;
      this.$refs.inputLinkItem.onPanelChange(href, text);
    },
    /**
     * 更新
     */
    onUpdateLink(href, text) {
      this.node.attrs.href = href;
      this.node.attrs.text = text;

      this.updateAttributes()
    },
    /**
     * 删除
     */
    onDeleteLink () {
      this.deleteNode();
    }
  }
}
</script>

<template>
  <node-view-wrapper class="node-view" :as="'span'">
    <HtmlLink :text="node.attrs.text" :href="node.attrs.href" :isOpen="false" :isIcon="true" :isPoptip="false"
              :isEdit="true" @click.native="openLinkPalen"></HtmlLink>
    <InputLinkWidget ref="inputLinkItem" :isDelete="true" @delete="onDeleteLink" @finish="onUpdateLink"></InputLinkWidget>
  </node-view-wrapper>
</template>

<style scoped lang="less">
.node-view {
  display: inline-flex;
}
</style>
